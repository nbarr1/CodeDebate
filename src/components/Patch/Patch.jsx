import { useState } from 'react'
import { callPatch } from '../../api/index.js'
import styles from './Patch.module.css'

export default function Patch({ code, synthesis, claudeKey }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setState('loading')
    setError('')
    try {
      const patched = await callPatch(code, synthesis, claudeKey)
      setResult(patched)
      setState('done')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patched.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`${styles.panel} fade-up`}>
      <div className={styles.header}>
        <span className={styles.icon}>🔧</span>
        <div>
          <h2 className={styles.title}>Agentic Patch</h2>
          <p className={styles.subtitle}>Claude applies the synthesis recommendations to your code</p>
        </div>
      </div>

      {state === 'idle' && (
        <div className={styles.prompt}>
          <button className="primary" onClick={handleGenerate}>
            ⚡ Generate corrected file
          </button>
          <span className={styles.hint}>Claude will apply the FINAL RECOMMENDATION to your original code</span>
        </div>
      )}

      {state === 'loading' && (
        <div className={styles.prompt}>
          <span className="spin" style={{ fontSize: '18px' }}>⟳</span>
          <span className={styles.hint}>Applying recommendations…</span>
        </div>
      )}

      {state === 'error' && (
        <div className={styles.errorRow}>
          <span className={styles.errorMsg}>✗ {error}</span>
          <button onClick={handleGenerate}>Retry</button>
        </div>
      )}

      {state === 'done' && (
        <>
          <div className={styles.toolbar}>
            <span className={styles.toolbarLabel}>Corrected file</span>
            <div className={styles.toolbarActions}>
              <button onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={handleDownload}>Download</button>
              <button onClick={handleGenerate} title="Regenerate">↻ Regenerate</button>
            </div>
          </div>
          <pre className={styles.code}><code>{result}</code></pre>
        </>
      )}
    </div>
  )
}
