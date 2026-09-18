"""Chroma-key a bright-green screen to real RGBA.

Unlike checkerboard flood-fill, this never eats white trousers: green is far
from cream-white, magenta, and skin.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_transparent import decode_rgb, write_rgba

HARD = 90   # g - max(r,b) at or above this is definitely screen
SOFT = 32   # at or below this is definitely subject


def greenness(r, g, b):
    return g - max(r, b)


def is_white_cloth(r, g, b):
    return min(r, g, b) > 175 and max(r, g, b) - min(r, g, b) < 45


def process(src, dst):
    w, h, rgb = decode_rgb(src)
    rgba = bytearray(w * h * 4)
    cleared = 0
    span = HARD - SOFT
    for p in range(w * h):
        s, d = p * 3, p * 4
        r, g, b = rgb[s], rgb[s + 1], rgb[s + 2]
        gn = greenness(r, g, b)
        if is_white_cloth(r, g, b):
            a = 255
        elif gn >= HARD:
            a = 0
            cleared += 1
        elif gn <= SOFT:
            a = 255
        else:
            a = max(0, min(255, int((HARD - gn) * 255 / span)))
        if a > 0 and g > r + 18 and g > b + 18:
            # despill leftover green fringe
            g = min(g, (r + b) // 2 + 12)
        rgba[d] = r
        rgba[d + 1] = g
        rgba[d + 2] = b
        rgba[d + 3] = a
    write_rgba(dst, w, h, rgba)
    return cleared, w * h


if __name__ == "__main__":
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    n, total = process(src, dst)
    print(f"{dst.name}: keyed {n * 100 / total:.1f}%  ({n}/{total})")
