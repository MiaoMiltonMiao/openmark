// api/upload.ts (Vercel)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ error: 'Missing GITHUB_TOKEN' });

    const octokit = new Octokit({ auth: token });

    // Parse multipart form
    const busboy = await import('busboy');
    const bb = busboy.default({ headers: req.headers });
    const fields: Record<string,string> = {};
    let fileBuf: Buffer | null = null;
    let fileName = 'upload.md';

    await new Promise<void>((resolve, reject) => {
      bb.on('file', (_name, stream, info) => {
        fileName = info.filename || fileName;
        const chunks: Buffer[] = [];
        stream.on('data', (d: Buffer) => chunks.push(d));
        stream.on('end', () => { fileBuf = Buffer.concat(chunks); });
      });
      bb.on('field', (name, val) => { fields[name] = val; });
      bb.on('finish', () => resolve());
      bb.on('error', reject);
      // @ts-ignore
      req.pipe(bb);
    });

    if (!fileBuf) return res.status(400).json({ error: 'No file uploaded' });

    const title = fields.title || fileName.replace(/\.[^.]+$/, '').replace(/[_\s]+/g,'-');
    const tags = (fields.tags || '').split(',').map(s => s.trim()).filter(Boolean);
    const summary = fields.summary || '';

    // Ensure Markdown has frontmatter
    let content = fileBuf.toString('utf8');
    const hasFM = content.startsWith('---');
    if (!hasFM) {
      const now = new Date().toISOString().slice(0,10);
      const fm = [
        '---',
        `title: "${title}"`,
        `date: "${now}"`,
        `tags: [${tags.map(t=>`"${t}"`).join(', ')}]`,
        'license: "CC BY 4.0"',
        `summary: "${summary.replace(/"/g,'\\"')}"`,
        '---',
        '',
      ].join('\n');
      content = fm + content;
    }

    const owner = 'MiaoMiltonMiao';
    const repo = 'openmark';

    // Get default branch (main)
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const baseBranch = repoData.default_branch || 'main';

    // Create a new branch off main
    const { data: baseRef } = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
    const baseSha = baseRef.object.sha;
    const featureBranch = `upload/${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9-]/g,'')}`;
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${featureBranch}`, sha: baseSha });

    // Put file into docs/
    const path = `docs/${title.toLowerCase().replace(/[^a-z0-9-]/g,'-') || 'upload'}.md`;
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: `chore: add uploaded doc ${title}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: featureBranch,
    });

    // Open PR
    const pr = await octokit.pulls.create({
      owner, repo,
      head: featureBranch,
      base: baseBranch,
      title: `Upload: ${title}`,
      body: `Auto-uploaded via web form.\n\nTags: ${tags.join(', ')}`,
    });

    return res.status(200).json({ prUrl: pr.data.html_url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Upload failed' });
  }
}
