// Vercel Serverless Function: /api/upload (v3 with GET healthcheck + strict normalization)
const { Octokit } = require('@octokit/rest');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

function bad(res, code, msg, extra = {}) {
  res.status(code).json({ error: msg, ...extra });
}

function ok(res, data) {
  res.status(200).json({ ok: true, ...data });
}

function assertPattern(name, value, re, res) {
  if (!re.test(value)) {
    bad(res, 400, `Invalid ${name}: "${value}" does not match ${re}`);
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  // Lightweight GET -> healthcheck / version & normalized envs (no secrets)
  if (req.method === 'GET') {
    const {
      GITHUB_OWNER = '',
      GITHUB_REPO = '',
      BASE_BRANCH = 'main',
      PLAYBOOK_DIR = 'docs/playbooks',
    } = process.env;

    const baseBranchName = String(BASE_BRANCH).trim().replace(/^refs\/heads\//, '');
    const playbookDir = String(PLAYBOOK_DIR).replace(/^\/+|\/+$/g, '');

    return ok(res, {
      version: 'v3',
      normalized: {
        ownerLooksValid: /^[A-Za-z0-9-]+$/.test(GITHUB_OWNER || ''),
        repoLooksValid: /^[A-Za-z0-9_.-]+$/.test(GITHUB_REPO || ''),
        baseBranchName,
        playbookDir,
      },
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return bad(res, 405, 'Method Not Allowed');
  }

  try {
    // Body may already be parsed (application/json) or come as string
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    const { filename, content, title, author, note } = body || {};
    if (!filename || !content) return bad(res, 400, 'filename and content are required');
    if (!/\.mdx?$/i.test(filename)) return bad(res, 400, 'Only .md or .mdx allowed');
    if (typeof content !== 'string' || content.length === 0) return bad(res, 400, 'content must be non-empty string');
    if (content.length > 1_000_000) return bad(res, 400, 'File too large (max 1MB)');

    // ---- ENV VARS
    let { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, BASE_BRANCH = 'main', PLAYBOOK_DIR = 'docs/playbooks' } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return bad(res, 500, 'Server not configured: missing GITHUB_* env vars');
    }

    // Normalize envs
    GITHUB_OWNER = String(GITHUB_OWNER).trim();     // allow uppercase; GitHub accepts it
    GITHUB_REPO  = String(GITHUB_REPO).trim();
    BASE_BRANCH  = String(BASE_BRANCH).trim();
    const baseBranchName = BASE_BRANCH.replace(/^refs\/heads\//, '');
    const playbookDir = String(PLAYBOOK_DIR || 'docs/playbooks').replace(/^\/+|\/+$/g, '');

    // Validate patterns (keep permissive but safe)
    if (!assertPattern('GITHUB_OWNER', GITHUB_OWNER, /^[A-Za-z0-9-]+$/, res)) return;
    if (!assertPattern('GITHUB_REPO', GITHUB_REPO, /^[A-Za-z0-9_.-]+$/, res)) return;
    if (!assertPattern('BASE_BRANCH', baseBranchName, /^(?!.*\.\.)(?!.*\/\/)(?!.*@\{|~|\^|:|\*|\?|\[)[^\s]+$/, res)) return;

    // ---- PATHS / BRANCH
    const stem = String(title || filename.replace(/\.(md|mdx)$/i, '')).toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'playbook';
    const safeStem = stem.replace(/\.\./g, '');
    const outPath = `${playbookDir}/${safeStem}.md`;   // relative path only

    // Validate path: no leading slash, no '..'
    if (!assertPattern('path', outPath, /^(?!\/)(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9._\-\/]+\.md$/, res)) return;

    // Branch name
    const branchName = `upload/${safeStem}-${nanoid()}`;
    if (!assertPattern('branchName', branchName, /^(?!.*\.\.)(?!.*\/\/)(?!.*@\{|~|\^|:|\*|\?|\[)[A-Za-z0-9._\-\/]+$/, res)) return;
    const ref = `refs/heads/${branchName}`;

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // 1) Base ref
    const { data: baseRef } = await octokit.git.getRef({ owner: GITHUB_OWNER, repo: GITHUB_REPO, ref: `heads/${baseBranchName}` });
    const baseSha = baseRef.object.sha;

    // 2) Create new ref
    await octokit.git.createRef({ owner: GITHUB_OWNER, repo: GITHUB_REPO, ref, sha: baseSha });

    // 3) Create file
    const message = `docs(playbook): add ${safeStem} via upload`;
    const contentB64 = Buffer.from(content, 'utf8').toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: outPath,
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
      base: baseBranchName,
      title: prTitle,
      body: prBody,
      maintainer_can_modify: true,
    });

    return ok(res, { prUrl: pr.html_url });
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Unexpected error';
    const doc = err?.response?.data?.documentation_url;
    console.error('Upload error:', msg, doc || '');
    return bad(res, 500, 'GitHub error: ' + msg, doc ? { doc } : undefined);
  }
};
