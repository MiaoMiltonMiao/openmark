#!/usr/bin/env node
const fg = require('fast-glob');
const fs = require('fs');

const files = fg.sync(['docs/**/*.md', 'docs/**/*.mdx'], { dot: false });
let errors = 0;

const rules = [
  {
    name: 'no-absolute-root-links',
    test: /\]\(\/(?!\)|\s)/g, // ](/something
    message: 'Avoid absolute site-root links. Use relative ./ or ../ links.',
  },
  {
    name: 'no-md-extension-in-doc-links',
    test: /\]\([^\)]*\.(md|mdx)(#[^)]+)?\)/gi,
    message: 'Do not link to .md/.mdx directly. Drop the extension.',
  },
];

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split(/\r?\n/);
  rules.forEach(rule => {
    let m;
    while ((m = rule.test.exec(text)) !== null) {
      const idx = m.index;
      let pos = 0;
      for (let i = 0; i < lines.length; i++) {
        pos += lines[i].length + 1;
        if (pos > idx) {
          console.error(`[${f}:${i + 1}] ${rule.name}: ${rule.message}`);
          errors++;
          break;
        }
      }
    }
  });
}

if (errors > 0) {
  console.error(`\n✖ Found ${errors} docs link issue(s).`);
  process.exit(1);
} else {
  console.log('✓ docs links look good');
}
