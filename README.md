# OpenMark — Chat → Markdown → Open Knowledge

Turn long ChatGPT conversations into reusable Markdown, publish as a site, and open for community contributions.

**Goal**: Preserve knowledge from conversations, version it with Git, and enable global collaboration.

---

## Why
- Chat transcripts are hard to search and lose focus
- Markdown is easy for version control, review, and collaboration
- Static sites (GitHub Pages / Vercel) are fast, free, and sustainable

## Features
- 🧭 Clear content template with frontmatter
- 🔁 Versioned knowledge history (Git)
- 🤝 Open collaboration (Issues / Discussions / Pull Requests)
- ✅ CI checks (links, frontmatter, build validation)

## Repo Structure (suggested)
```
openmark/
├─ docs/                 # Markdown content (topics/series)
│  ├─ crypto/
│  ├─ chess/
│  ├─ code/
│  └─ life/
├─ templates/            # Unified MD templates (frontmatter)
├─ static/               # Images/attachments
├─ .github/
│  └─ workflows/ci.yml   # CI: link check + build
├─ docusaurus.config.js  # or hugo.toml etc
├─ README.md
└─ CONTRIBUTING.md
```

## Quick Start

### 1) Clone & Install
```bash
# Clone
git clone <YOUR_FORK_URL> openmark
cd openmark

# (if using Docusaurus)
# Node 18+ / 20 recommended
npm ci || yarn install
```

### 2) Run Local Docs (Docusaurus example)
```bash
npm run start   # or: yarn start
# build
npm run build   # or: yarn build
```

> If using Hugo / MkDocs, replace with their commands.

## Writing Guide
- Every post uses `docs/_template.md` frontmatter
- Filename: `YYYY-MM-DD-topic-slug.md`
- Images in `static/`, reference with relative path: `![alt](/static/img/xxx.png)`
- Use CC BY 4.0 or CC BY-SA 4.0 license; cite sources when needed

## License
- Content (Markdown): **CC BY 4.0**
- Code/config: **MIT** (adjust as needed)

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow, PR checklist, and content rules.

## Roadmap
- [ ] Frontmatter validation script
- [ ] Broken link auto-fix suggestions
- [ ] Tool to export chat → draft Markdown automatically
