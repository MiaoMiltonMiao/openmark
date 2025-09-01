# Contributing Guide

Thank you for contributing to OpenMark! This guide explains the workflow and rules.

## Workflow
1. **Fork** the repo, create a branch: `feature/<topic-or-fix>`
2. Write Markdown based on `docs/_template.md`:
   - Required frontmatter: `title`, `date`, `tags`, `license`, `summary`
   - Filename: `YYYY-MM-DD-topic-slug.md`
3. Preview locally (Docusaurus/Hugo/MkDocs)
4. Open a **Pull Request**:
   - Include motivation, summary of changes, scope, related issues (if any)
5. Maintainers review and merge → CI deploys automatically

## Content Rules
- **Citations & Licensing**:
  - List references at the bottom of each post
  - Default license: **CC BY 4.0** (or equivalent open license)
- **Language**:
  - English as default, optional bilingual TL;DR in another language
- **Style**:
  - Focused notes, bullet points, or structured sections (not raw transcripts)
  - Images in `static/`, referenced via relative path

## Commit & Branch Naming
- Branches: `feature/...`, `fix/...`, `docs/...`
- Commits: imperative verbs, e.g. `add crypto wallet guide`, `fix broken links`

## PR Checklist
- [ ] Complete frontmatter, date format `YYYY-MM-DD`
- [ ] Images stored in `static/`, links valid
- [ ] Proofread text (spelling/format)
- [ ] License and references added
- [ ] Build passes locally (if applicable)

## Code of Conduct
Please follow community norms (respect, inclusivity, kindness). Maintainers reserve the right to adjust or reject contributions.
