import { useState } from 'react'
import { fetchGitHubContent } from '../../api/github.js'
import styles from './GitHubPanel.module.css'

export default function GitHubPanel({ githubToken, onLoad }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState({ msg: '', kind: '' })

  async function handleLoad() {
    if (status.kind === 'loading' || !url.trim()) return
    setStatus({ msg: 'Loading…', kind: 'loading' })
    try {
      const { content, filename, type } = await fetchGitHubContent(url, githubToken)
      onLoad(content)
      setStatus({ msg: `✓ Loaded ${type === 'diff' ? 'PR diff' : filename}`, kind: 'success' })
    } catch (err) {
      setStatus({ msg: `✗ ${err.message}`, kind: 'error' })
    }
  }

  function handleClear() {
    setUrl('')
    setStatus({ msg: '', kind: '' })
    onLoad('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLoad()
  }

  const loading = status.kind === 'loading'

  return (
    <div className={styles.panel}>
      <button className={styles.header} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.headerLeft}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>Load from GitHub</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.urlRow}>
            <input
              type="url"
              placeholder="https://github.com/owner/repo/blob/main/file.js  or  …/pull/123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
            <button onClick={handleLoad} disabled={!url.trim() || loading} className="primary">
              {loading ? <span className="spin">⟳</span> : 'Load'}
            </button>
          </div>

          {status.msg && (
            <div className={styles.statusRow}>
              <span className={styles[status.kind]}>{status.msg}</span>
              {status.kind === 'success' && (
                <button className={styles.clearBtn} onClick={handleClear}>✕ Clear</button>
              )}
            </div>
          )}

          <p className={styles.hint}>
            Supports file URLs (<code>…/blob/…</code>) and PR URLs (<code>…/pull/…</code>).
            Add a GitHub token in API Keys for private repos.
          </p>
        </div>
      )}
    </div>
  )
}
