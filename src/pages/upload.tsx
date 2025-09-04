import React, { useState } from 'react';

/**
 * /upload — Upload Markdown → opens a GitHub PR via /api/upload
 * NOTE: Make sure there is NOT a docs/upload.mdx at the same time (route conflict).
 */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle'|'submitting'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please choose a .md or .mdx file.'); setStatus('error'); return;
    }
    if (!/\.mdx?$/i.test(file.name)) {
      setMessage('Only .md or .mdx files are accepted.'); setStatus('error'); return;
    }
    if (file.size > 1024 * 1024) {
      setMessage('File too large (max 1MB).'); setStatus('error'); return;
    }
    setStatus('submitting'); setMessage('Uploading...');

    const text = await file.text();
    const payload = {
      filename: file.name,
      content: text,
      title: title.trim() || file.name.replace(/\.(md|mdx)$/i, ''),
      author: author.trim() || 'anonymous',
      note: note.trim(),
    };

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      setStatus('ok');
      setMessage(`✅ PR created: ${data.prUrl}`);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Upload failed');
    }
  };

  return (
    <div style={{maxWidth: 720, margin: 'var(--ifm-spacing-vertical) auto', padding: '0 1rem'}}>
      <h1>Upload your Playbook (.md / .mdx)</h1>
      <p>We will open a GitHub Pull Request with your file under <code>docs/playbooks/</code>.</p>
      <form onSubmit={onSubmit} style={{display: 'grid', gap: 12}}>
        <label>
          <div>Markdown file</div>
          <input
            type="file"
            accept=".md,.mdx,text/markdown"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>
        <label>
          <div>Title (optional)</div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Playbook title" />
        </label>
        <label>
          <div>Author (optional)</div>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name or handle" />
        </label>
        <label>
          <div>Note (optional)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any context you'd like to include" rows={4} />
        </label>
        <button
          type="submit"
          disabled={status==='submitting'}
          style={{padding: '8px 14px'}}
        >
          {status==='submitting' ? 'Submitting…' : 'Upload & Open PR'}
        </button>
      </form>
      {message && (
        <p style={{marginTop: 12, whiteSpace: 'pre-wrap'}}>{message}</p>
      )}
      <hr style={{margin: '24px 0'}} />
      <p style={{fontSize: 12, opacity: 0.8}}>
        By uploading, you agree your content may be published under the repository license.
      </p>
    </div>
  );
}
