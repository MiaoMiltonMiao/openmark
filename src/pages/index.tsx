import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="OpenMark">
      <main style={{maxWidth: 980, margin: '0 auto', padding: '48px 16px', textAlign: 'center'}}>
        <h1>OpenMark</h1>
        <p style={{fontSize: 18, opacity: 0.9}}>
          A collaborative Markdown knowledge base powered by Docusaurus.
        </p>
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap'}}>
          <Link className="button button--primary button--lg" to="/upload">
            Upload Playbook
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/playbooks/">
            Browse Playbooks
          </Link>
          <Link className="button button--outline button--lg" to="/docs/">
            Docs Home
          </Link>
        </div>
      </main>
    </Layout>
  );
}
