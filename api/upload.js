// Vercel Serverless Function: /api/upload
// Commits a Markdown file to a new branch and opens a PR.
const { Octokit } = require('@octokit/rest');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 8);

function bad(res, code, msg) {
  res.status(code).json({ error: msg });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 405, 'Method Not Allowed');
  }

  try {
    const { filename, content, title, author, note } = req.body || {};
    if (!filename || !content) return bad(res, 400, 'filename and content are required');
    if (!/\.mdx?$/i.test(filename)) return bad(res, 400, 'Only .md or .mdx allowed');
    if (content.length > 1_000_000) return bad(res, 400, 'File too large (max 1MB)');

    const {
      GITHUB_TOKEN,
      GITHUB_OWNER,
      GITHUB_REPO,
      BASE_BRANCH = 'main',
      PLAYBOOK_DIR = 'docs/playbooks'
    } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return bad(res, 500, 'Server not configured: missing GITHUB_* env vars');
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // 1) Get base branch SHA
    const { data: baseRef } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${BASE_BRANCH}`,
    });
    const baseSha = baseRef.object.sha;

    // 2) Create new branch
    const slugTitle = String(title || filename.replace(/\.(md|mdx)$/i, '')).toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const branchName = `upload/${slugTitle || 'playbook'}-${nanoid()}`;

    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // 3) Create file
    const path = `${PLAYBOOK_DIR}/${slugTitle || 'playbook'}.md`;
    const message = `docs(playbook): add ${slugTitle || filename} via upload`;
    const contentB64 = Buffer.from(content, 'utf8').toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
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
      `File: \`${path}\``,
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
    console.error(err);
    return bad(res, 500, err?.message || 'Unexpected error');
  }
};
