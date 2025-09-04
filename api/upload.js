// Vercel Serverless Function: /api/upload
// Creates a new branch, commits the uploaded Markdown to docs/playbooks/, and opens a PR.
const { Octokit } = require('@octokit/rest');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

function bad(res, code, msg, extra = {}) {
  res.status(code).json({ error: msg, ...extra });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 405, 'Method Not Allowed');
  }

  try {
    // Body may already be parsed (application/json) or come as string
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { /* keep as string */ }
    }

    const { filename, content, title, author, note } = body || {};
    if (!filename || !content) return bad(res, 400, 'filename and content are required');
    if (!/\.mdx?$/i.test(filename)) return bad(res, 400, 'Only .md or .mdx allowed');
    if (typeof content !== 'string' || content.length === 0) return bad(res, 400, 'content must be non-empty string');
    if (content.length > 1_000_000) return bad(res, 400, 'File too large (max 1MB)');

    const {
      GITHUB_TOKEN,
      GITHUB_OWNER,
      GITHUB_REPO,
      BASE_BRANCH = 'main',
      PLAYBOOK_DIR = 'docs/playbooks',
    } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return bad(res, 500, 'Server not configured: missing GITHUB_* env vars');
    }

    // Normalize and sanitize path parts
    const playbookDir = String(PLAYBOOK_DIR || 'docs/playbooks').replace(/^\/+|\/+$/g, '');
    const stem = String(title || filename.replace(/\.(md|mdx)$/i, '')).toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'playbook';
    const safeStem = stem.replace(/\.\./g, ''); // no traversal
    const outPath = `${playbookDir}/${safeStem}.md`; // always save as .md

    // PR branch
    const branchName = `upload/${safeStem}-${nanoid()}`;

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // 1) Get base branch SHA
    const { data: baseRef } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${BASE_BRANCH}`,
    });
    const baseSha = baseRef.object.sha;

    // 2) Create new branch
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${branchName}`, // must start with refs/heads/
      sha: baseSha,
    });

    // 3) Create file in new branch
    const message = `docs(playbook): add ${safeStem} via upload`;
    const contentB64 = Buffer.from(content, 'utf8').toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: outPath,           // MUST be a relative path (no leading slash)
      message,
      content: contentB64,
      branch: branchName,
    });

    // 4) Open PR
    const prTitle = `Add playbook: ${title || filename}`;
    const prBody = [
      `**Author**: ${author || 'anonymous'}`,
      note ? `**Note**: ${note}` : null,
      '',
      `File: \`${outPath}\``,
    ].filter(Boolean).join('\n');

    const { data: pr } = await octokit.pulls.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      head: branchName,
      base: BASE_BRANCH,
      title: prTitle,
      body: prBody,
      maintainer_can_modify: true,
    });

    return res.status(200).json({ ok: true, prUrl: pr.html_url });
  } catch (err) {
    // Surface Octokit errors more clearly
    const msg = err?.response?.data?.message || err?.message || 'Unexpected error';
    const doc = err?.response?.data?.documentation_url;
    console.error('Upload error:', msg, doc || '');
    return bad(res, 500, 'GitHub error: ' + msg, doc ? { doc } : undefined);
  }
};
