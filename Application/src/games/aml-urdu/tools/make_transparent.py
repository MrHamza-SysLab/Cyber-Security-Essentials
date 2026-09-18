"""Replace the painted checkerboard behind a generated character with real alpha.

The image generator draws a checkerboard to *depict* transparency instead of
writing an alpha channel, so every character PNG is opaque RGB. Compositing one
over a background would show the checkerboard as a rectangle.

This rewrites those files as RGBA: flood-fill inward from the border over pixels
matching the checker colours, and write alpha 0 there. Flood-fill rather than a
global colour key because the cast wears white and grey that must survive --
only background connected to the edge is removed.

Pure standard library: no Pillow, no ImageMagick.
"""

import struct
import sys
import zlib
from collections import deque
from pathlib import Path

SIG = b"\x89PNG\r\n\x1a\n"

# Distance below which a pixel is definitely background. Kept tight because the
# cast wears near-white (#F5-ish) that sits only a few levels from the checker
# greys -- a loose value eats the edges of white trousers and shirts.
TOL_HARD = 12
# Distance above which a pixel is definitely subject. Between the two, alpha
# ramps -- this is what stops a hard checker-coloured halo around the figure.
TOL_SOFT = 40


def read_chunks(data):
    if data[:8] != SIG:
        raise ValueError("not a PNG")
    pos = 8
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        ctype = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        yield ctype, body
        pos += 12 + length


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def decode_rgb(path):
    """Decode an 8-bit non-interlaced RGB or RGBA PNG to (w, h, bytearray RGB)."""
    data = path.read_bytes()
    idat = bytearray()
    w = h = depth = ctype = None
    for name, body in read_chunks(data):
        if name == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
            if depth != 8 or interlace != 0 or ctype not in (2, 6):
                raise ValueError(f"unsupported PNG: depth={depth} type={ctype}")
        elif name == b"IDAT":
            idat += body
        elif name == b"IEND":
            break

    src_bpp = 3 if ctype == 2 else 4
    raw = zlib.decompress(bytes(idat))
    stride = w * src_bpp

    # Undo per-scanline filters in place.
    lines = []
    prev = bytearray(stride)
    pos = 0
    for _ in range(h):
        ftype = raw[pos]
        pos += 1
        line = bytearray(raw[pos : pos + stride])
        pos += stride
        if ftype == 1:
            for i in range(src_bpp, stride):
                line[i] = (line[i] + line[i - src_bpp]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = line[i - src_bpp] if i >= src_bpp else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                left = line[i - src_bpp] if i >= src_bpp else 0
                ul = prev[i - src_bpp] if i >= src_bpp else 0
                line[i] = (line[i] + paeth(left, prev[i], ul)) & 0xFF
        elif ftype != 0:
            raise ValueError(f"bad filter type {ftype}")
        lines.append(line)
        prev = line

    # Normalise to plain RGB.
    if src_bpp == 3:
        rgb = bytearray(b"".join(lines))
    else:
        rgb = bytearray(w * h * 3)
        o = 0
        for line in lines:
            for x in range(0, stride, 4):
                rgb[o] = line[x]
                rgb[o + 1] = line[x + 1]
                rgb[o + 2] = line[x + 2]
                o += 3
    return w, h, rgb


def write_rgba(path, w, h, rgba):
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)  # filter: None. Simpler, and zlib still compresses well.
        raw += rgba[y * stride : (y + 1) * stride]

    def chunk(name, body):
        return (
            struct.pack(">I", len(body))
            + name
            + body
            + struct.pack(">I", zlib.crc32(name + body) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    path.write_bytes(
        SIG
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def checker_colours(w, h, rgb):
    """The two colours of the painted checkerboard, taken from the border ring."""
    counts = {}
    def note(x, y):
        i = (y * w + x) * 3
        key = (rgb[i] >> 3, rgb[i + 1] >> 3, rgb[i + 2] >> 3)
        counts[key] = counts.get(key, 0) + 1

    for x in range(0, w, 2):
        for y in (0, 1, 2, h - 3, h - 2, h - 1):
            note(x, y)
    for y in range(0, h, 2):
        for x in (0, 1, 2, w - 3, w - 2, w - 1):
            note(x, y)

    top = sorted(counts.items(), key=lambda kv: -kv[1])[:2]
    return [(r << 3, g << 3, b << 3) for (r, g, b), _ in top]


def dist(rgb, i, colours):
    r, g, b = rgb[i], rgb[i + 1], rgb[i + 2]
    best = 1e9
    for cr, cg, cb in colours:
        d = max(abs(r - cr), abs(g - cg), abs(b - cb))
        if d < best:
            best = d
    return best


def process(path):
    w, h, rgb = decode_rgb(path)
    colours = checker_colours(w, h, rgb)

    # Flood fill the background inward from every border pixel.
    bg = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            p = y * w + x
            if not bg[p] and dist(rgb, p * 3, colours) <= TOL_HARD:
                bg[p] = 1
                q.append(p)
    for y in range(h):
        for x in (0, w - 1):
            p = y * w + x
            if not bg[p] and dist(rgb, p * 3, colours) <= TOL_HARD:
                bg[p] = 1
                q.append(p)

    while q:
        p = q.popleft()
        x, y = p % w, p // w
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                n = ny * w + nx
                if not bg[n] and dist(rgb, n * 3, colours) <= TOL_HARD:
                    bg[n] = 1
                    q.append(n)

    # Soften the boundary: subject pixels touching the fill get partial alpha
    # scaled by how close they still are to a checker colour.
    rgba = bytearray(w * h * 4)
    span = TOL_SOFT - TOL_HARD
    for p in range(w * h):
        s, d = p * 3, p * 4
        rgba[d] = rgb[s]
        rgba[d + 1] = rgb[s + 1]
        rgba[d + 2] = rgb[s + 2]
        if bg[p]:
            rgba[d + 3] = 0
            continue
        x, y = p % w, p // w
        touching = False
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and bg[ny * w + nx]:
                touching = True
                break
        if touching:
            dd = dist(rgb, s, colours)
            if dd >= TOL_SOFT:
                rgba[d + 3] = 255
            else:
                rgba[d + 3] = max(0, min(255, int((dd - TOL_HARD) * 255 / span)))
        else:
            rgba[d + 3] = 255

    cleared = sum(bg)
    write_rgba(path, w, h, rgba)
    return cleared, w * h, colours


if __name__ == "__main__":
    for name in sys.argv[1:]:
        p = Path(name)
        cleared, total, colours = process(p)
        pct = cleared * 100 / total
        print(f"{p.name:<22} cleared {pct:5.1f}%  checker={colours}")
