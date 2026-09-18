const files = import.meta.glob('../public/assets/**/*.{png,mp3,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const bySuffix = new Map()
for (const [key, url] of Object.entries(files)) {
  const normalized = key.replace(/\\/g, '/')
  const rel = normalized.split('/public/assets/')[1]
  if (rel) bySuffix.set(rel.split('?')[0], url)
}

export function assetUrl(rel) {
  const clean = String(rel)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^assets\//, '')
    .split('?')[0]
  return bySuffix.get(clean) || rel
}
