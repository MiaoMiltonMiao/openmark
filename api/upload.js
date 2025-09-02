// Vercel serverless function
const { Octokit } = require('@octokit/rest')
const Busboy = require('busboy')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    res.status(500).json({ error: 'Missing GITHUB_TOKEN' })
    return
  }
  const octokit = new Octokit({ auth: token })

  try {
    const fields = {}
    let fileBuf = null
    let fileName = 'upload.md'

    await new Promise((resolve, reject) => {
      const bb = Busboy({ headers: req.headers })
      bb.on('file', (_name, stream, info) => {
        fileName = (info && info.filename) || fileName
        const chunks = []
        stream.on('data', d => chunks.push(d))
        stream.on('end', () => { fileBuf = Buffer.concat(chunks) })
      })
      bb.on('field', (name, val) => { fields[name] = val })
      bb.on('finish', resolve)
      bb.on('error', reject)
      req.pipe(bb)
    })

    if (!fileBuf) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const title = (fields.title || fileName.replace(/\.[^.]+$/, '').replace(/[_\s]+/g, '-')).slice(0, 80)
    const tags = (fields.tags || '').split(',').map(s => s.trim()).filter(Boolean)
    const summary = (fields.summary || '').slice(0, 300)

    // Ensure Markdown has frontmatter
    let content = fileBuf.toString('utf8')
    if (!content.startsWith('---')) {
      const now = new Date().toISOString().slice(0,10)
      const fm = [
        '---',
        `title: "${title.replace(/"/g,'\\"')}"`,
        `date: "${now}"`,
        `tags: [${tags.map(t=>`"${t.replace(/"/g,'\\"')}"`).join(', ')}]`,
        'license: "CC BY 4.0"',
        `summary: "${summary.replace(/"/g,'\\"')}"`,
        '---',
        '',
      ].join('\n')
      content = fm + content
    }

    const owner = process.env.OWNER || 'MiaoMiltonMiao'
    const repo = process.env.REPO || 'openmark'

    // Get default branch (main)
    const { data: repoData } = await octokit.repos.get({ owner, repo })
    const baseBranch = repoData.default_branch || 'main'

    // Create a new branch off main
    const { data: baseRef } = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` })
    const baseSha = baseRef.object.sha
    const featureBranch = `upload/${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9-]/g,'')}`.slice(0, 120)
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${featureBranch}`, sha: baseSha })

    // Put file into docs/
    const path = `docs/${title.toLowerCase().replace(/[^a-z0-9-]/g,'-') || 'upload'}.md`
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: `chore: add uploaded doc ${title}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: featureBranch,
    })

    // Open PR
    const pr = await octokit.pulls.create({
      owner, repo,
      head: featureBranch,
      base: baseBranch,
      title: `Upload: ${title}`,
      body: `Auto-uploaded via web form.\n\nTags: ${tags.join(', ')}`,
    })

    res.status(200).json({ prUrl: pr.data.html_url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err && err.message ? err.message : 'Upload failed' })
  }
}
