import React, { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState(null)
  const [prUrl, setPrUrl] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) return setStatus('Please choose a file.')
    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    form.append('tags', tags)
    form.append('summary', summary)

    setStatus('Uploading…')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) {
        setStatus(json.error || 'Upload failed.')
      } else {
        setStatus('✅ Uploaded and PR created!')
        setPrUrl(json.prUrl)
      }
    } catch (e) {
      setStatus('Upload failed: ' + e.message)
    }
  }

  return (
    <main className="container" style={{maxWidth: 720, padding: '2rem 1rem'}}>
      <h1>Contribute a Markdown</h1>
      <p>Upload a <code>.md</code> file. We’ll open a Pull Request to review & publish.</p>

      <form onSubmit={onSubmit}>
        <label>Title<br/>
          <input value={title} onChange={e=>setTitle(e.target.value)} required className="input" />
        </label>
        <br/><br/>

        <label>Tags (comma-separated)<br/>
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="crypto,chess,code" className="input" />
        </label>
        <br/><br/>

        <label>Summary (1–2 lines)<br/>
          <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} className="input" />
        </label>
        <br/><br/>

        <label>Markdown file (.md)<br/>
          <input type="file" accept=".md,text/markdown" onChange={e=>setFile(e.target.files?.[0] || null)} required />
        </label>
        <br/><br/>

        <button type="submit" className="button button--primary">Upload</button>
      </form>

      {status && <p style={{marginTop:12}}>{status} {prUrl && <>→ <a href={prUrl} target="_blank" rel="noreferrer">View PR</a></>}</p>}

      <style>{`
        .input { width: 100%; padding: 8px; }
      `}</style>
    </main>
  )
}
