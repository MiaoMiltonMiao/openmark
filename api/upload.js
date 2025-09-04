// Vercel Serverless Function: /api/upload (v4 — with step-by-step debug)
const { Octokit } = require('@octokit/rest');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

function bad(res, code, msg, extra = {}) {
  res.status(code).json({ error: msg, ...extra });
}
function ok(res, data) {
  res.status(200).json({ ok: true, ...data });
}
function assertPattern(name, value, re) {
  return re.test(value);
}

module.exports = async (req, res) => {
  // GET → healthcheck / show normalized config (no secrets)
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
      version: 'v4',
      normalized: {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        baseBranchName,
        playbookDir,
      },
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return bad(res, 405, 'Method Not Allowed');
  }

  let step = 'validate-input';
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    const { filename, content, title, author, note } = body || {};
    if (!filename || !content) return bad(res, 400, 'filename and content are required', { step });
    if (!/\.mdx?$/i.test(filename)) return bad(res, 400, 'Only .md or .mdx allowed', { step });
    if (typeof content !== 'string' || content.length === 0) return bad(res, 400, 'content must be non-empty string', { step });
    if (content.length > 1_000_000) return bad(res, 400, 'File too large (max 1MB)', { step });

    step = 'normalize-env';
    let { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, BASE_BRANCH = 'main', PLAYBOOK_DIR = 'docs/playbooks' } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return bad(res, 500, 'Server not configured: missing GITHUB_* env vars', { step });
    }
    const owner = String(GITHUB_OWNER).trim();
    const repo = String(GITHUB_REPO).trim();
    const baseBranchName = String(BASE_BRANCH).trim().replace(/^refs\/heads\//, '');
    const playbookDir = String(PLAYBOOK_DIR || 'docs/playbooks').replace(/^\/+|\/+$/g, '');

    // Compute derived values
    step = 'compute-derived';
    const stem = String(title || filename.replace(/\.(md|mdx)$/i, '')).toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'playbook';
    const safeStem = stem.replace(/\.\./g, '');
    const branchName = `upload/${safeStem}-${nanoid()}`;
    const ref = `refs/heads/${branchName}`;
    const path = `${playbookDir}/${safeStem}.md`;

    // Validate patterns and echo back what we'll use
    step = 'validate-derived';
    const okOwner = assertPattern('owner', owner, /^[A-Za-z0-9-]+$/);
    const okRepo = assertPattern('repo', repo, /^[A-Za-z0-9_.-]+$/);
    const okBranch = assertPattern('baseBranch', baseBranchName, /^(?!.*\.\.)(?!.*\/\/)(?!.*@\{|~|\^|:|\*|\?|\[)[^\s]+$/);
    const okPath = assertPattern('path', path, /^(?!\/)(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9._\-\/]+\.md$/);
    const okRef = assertPattern('ref', ref, /^refs\/heads\/(?!.*\.\.)(?!.*\/\/)(?!.*@\{|~|\^|:|\*|\?|\[)[A-Za-z0-9._\-\/]+$/);

    if (!okOwner || !okRepo || !okBranch || !okPath || !okRef) {
      return bad(res, 400, 'Client validation failed (see debug)', {
        step,
        debug: { owner, repo, baseBranchName, playbookDir, path, branchName, ref }
      });
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    step = 'getRef(base)';
    const { data: baseRef } = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranchName}` });
    const baseSha = baseRef.object.sha;

    step = 'createRef(new)';
    await octokit.git.createRef({ owner, repo, ref, sha: baseSha });

    step = 'createFile';
    const message = `docs(playbook): add ${safeStem} via upload`;
    const contentB64 = Buffer.from(content, 'utf8').toString('base64');
    await octokit.repos.createOrUpdateFileContents({ owner, repo, path, message, content: contentB64, branch: branchName });

    step = 'openPR';
    const prTitle = `Add playbook: ${title || filename}`;
    const prBody = [
      `**Author**: ${author || 'anonymous'}`,
      note ? `**Note**: ${note}` : null,
      '',
      `File: \`${path}\``,
    ].filter(Boolean).join('\n');
    const { data: pr } = await octokit.pulls.create({ owner, repo, head: branchName, base: baseBranchName, title: prTitle, body: prBody, maintainer_can_modify: true });

    return ok(res, { prUrl: pr.html_url });
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Unexpected error';
    const doc = err?.response?.data?.documentation_url;
    return bad(res, 500, 'GitHub error: ' + msg, { step, doc });
  }
};
