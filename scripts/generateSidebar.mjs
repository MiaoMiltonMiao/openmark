import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIR = path.join(process.cwd(), 'docs');

function listDocs(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter(f => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('_'));
  return files.map(f => {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const title = data.title || f.replace(/\.(md|mdx)$/,'');
    const tags = Array.isArray(data.tags) ? data.tags : [];
    // Use relative file path (without extension) as the doc id — always valid
    const id = f.replace(/\.(md|mdx)$/,'');
    return { id, file: f, title, tags };
  });
}

const docs = listDocs(DOCS_DIR);

// Group by first tag (or "uncategorized"), then sort by title
const groups = {};
for (const d of docs) {
  const key = (d.tags[0] || 'uncategorized').toString();
  groups[key] = groups[key] || [];
  groups[key].push(d);
}
for (const k of Object.keys(groups)) {
  groups[k].sort((a,b) => a.title.localeCompare(b.title));
}

// Build sidebar using explicit doc entries to avoid implicit id mismatches
const sidebar = {
  docs: Object.entries(groups).map(([label, items]) => ({
    type: 'category',
    label,
    collapsible: true,
    items: items.map(it => ({ type: 'doc', id: it.id })), // id = file path without extension
  })),
};

const out = `// AUTO-GENERATED. Do not edit.
 /** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
 module.exports = ${JSON.stringify(sidebar, null, 2)};
`;
fs.writeFileSync(path.join(process.cwd(), 'sidebars.generated.js'), out, 'utf8');

console.log('Generated sidebars.generated.js with', docs.length, 'docs.');

