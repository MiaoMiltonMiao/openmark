import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'docs')

function readDocs(dir) {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  const items = []
  for (const f of files) {
    const p = path.join(dir, f)
    const raw = fs.readFileSync(p, 'utf8')
    const { data } = matter(raw)
    const id = (data.id || f.replace(/\.(md|mdx)$/,''))
    const tags = Array.isArray(data.tags) ? data.tags : []
    const title = data.title || id
    items.push({ id, file: f, tags, title })
  }
  return items
}

const docs = readDocs(DOCS_DIR)

// Baseline grouping: by first tag (or 'uncategorized')
const groups = {}
for (const d of docs) {
  const key = (d.tags?.[0] || 'uncategorized').toString()
  groups[key] = groups[key] || []
  groups[key].push(d)
}
// Sort within groups by title
for (const k of Object.keys(groups)) {
  groups[k].sort((a,b)=> a.title.localeCompare(b.title))
}

const sidebar = {
  docs: Object.entries(groups).map(([tag, items]) => ({
    type: 'category',
    label: tag,
    collapsible: true,
    items: items.map(it => it.id),
  })),
}

const out = `// AUTO-GENERATED. Do not edit.\n/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */\nmodule.exports = ${JSON.stringify(sidebar, null, 2)};\n`
fs.writeFileSync(path.join(process.cwd(), 'sidebars.generated.js'), out, 'utf8')

console.log('Generated sidebars.generated.js with', docs.length, 'docs.')
