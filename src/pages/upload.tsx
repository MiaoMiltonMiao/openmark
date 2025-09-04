import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

type DebugInfo = {
  step?: string;
  doc?: string;
  debug?: {
    owner: string;
    repo: string;
    baseBranchName: string;
    playbookDir: string;
    path: string;
    branchName: string;
    ref: string;
  }
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle'|'submitting'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [diag, setDiag] = useState<any>(null);

  useEffect(() => {
    // fetch healthcheck to show normalized config
    fetch('/api/upload')
      .then(r => r.json())
      .then(setDiag)
      .catch(() => {});
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please choose a .md or .mdx file.');
      setStatus('error'); 
      return;
    }
    if (!/\.mdx?$/i.test(file.name)) {
      setMessage('Only .md or .mdx files are accepted.');
      setStatus('error'); 
      return;
    }
    if (file.size > 1024 * 1024) {
      setMessage('File too large (max 1MB).');
      setStatus('error'); 
      return;
    }
    setStatus('submitting'); 
    setMessage('Uploading...');

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
        const dbg: DebugInfo = data;
        const extra = dbg?.step ? ` (step: ${dbg.step})` : '';
        const detail = dbg?.debug ? `\n\nDebug:\n${JSON.stringify(dbg.debug, null, 2)}` : '';
        throw new Error((data?.error || 'Upload failed') + extra + detail);
      }
      setStatus('ok');
      setMessage(`✅ PR created: ${data.prUrl}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Upload failed');
    }
  };

  return (
    <Layout title="Upload Playbook">
      <div style={{maxWidth: 720, margin: 'var(--ifm-spacing-vertical) auto', padding: '0 1rem'}}>
        <h1>Upload your Playbook (.md / .mdx)</h1>
        <p>We will open a GitHub Pull Request with your file under <code>docs/playbooks/</code>.</p>

        {diag?.ok && (
          <div style={{background: 'var(--ifm-color-emphasis-200)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14}}>
            <b>Server OK</b> — normalized config: <code>{JSON.stringify(diag.normalized)}</code>
          </div>
        )}

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
          <button type="submit" disabled={status==='submitting'} className="button button--primary">
            {status==='submitting' ? 'Submitting…' : 'Upload & Open PR'}
          </button>
        </form>
        {message && (
          <pre style={{marginTop: 12, whiteSpace: 'pre-wrap', background: '#00000010', padding: 12, borderRadius: 6}}>{message}</pre>
        )}
        <hr style={{margin: '24px 0'}} />
        <p style={{fontSize: 12, opacity: 0.8}}>
          By uploading, you agree your content may be published under the repository license.
        </p>
        <p><Link to="/">← Back to home</Link></p>
      </div>
    </Layout>
  );
}
