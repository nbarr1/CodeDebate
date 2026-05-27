import { useState } from 'react'
import { saveKeys, clearKeys } from '../../utils/storage.js'
import { AGENTS } from '../../utils/agents.js'
import styles from './KeysPanel.module.css'

const KEY_LINKS = {
  claude: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/app/apikey',
}

export default function KeysPanel({ keys, onChange }) {
  const [visible, setVisible] = useState({ claude: false, openai: false, gemini: false })
  const [open, setOpen] = useState(!keys.claude && !keys.openai && !keys.gemini)
  const [saveMsg, setSaveMsg] = useState('')

  const allSet = keys.claude?.trim() && keys.openai?.trim() && keys.gemini?.trim()

  function handleSave() {
    const ok = saveKeys(keys)
    setSaveMsg(ok ? 'saved' : 'error')
    setTimeout(() => setSaveMsg(''), 2500)
  }

  function handleClear() {
    clearKeys()
    onChange({ claude: '', openai: '', gemini: '' })
    setSaveMsg('cleared')
    setOpen(true)
    setTimeout(() => setSaveMsg(''), 2500)
  }

  return (
    <div className={styles.panel}>
      {/* Header row */}
      <button className={styles.header} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.headerLeft}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          <span>API Keys</span>
          {saveMsg && (
            <span className={`${styles.toast} ${styles[saveMsg]}`}>
              {saveMsg === 'saved' && '✓ Saved to localStorage'}
              {saveMsg === 'error' && '✗ Save failed'}
              {saveMsg === 'cleared' && '✓ Keys cleared'}
            </span>
          )}
        </span>
        <span className={styles.headerRight}>
          {AGENTS.map((a) => {
            const ok = a.requiresKey ? !!keys[a.keyName]?.trim() : true
            return (
              <span key={a.id} className={`badge ${a.colorClass} ${styles.dot}`}>
                {a.name} {ok ? '✓' : '○'}
              </span>
            )
          })}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className={styles.body}>
          {AGENTS.filter((a) => a.requiresKey).map((agent) => (
            <div key={agent.id} className={styles.row}>
              <span className={`badge ${agent.colorClass}`}>{agent.name}</span>
              <div className={styles.inputWrap}>
                <input
                  type={visible[agent.keyName] ? 'text' : 'password'}
                  placeholder={
                    agent.id === 'claude' ? 'sk-ant-...' :
                    agent.id === 'openai' ? 'sk-...' : 'AIza...'
                  }
                  value={keys[agent.keyName] || ''}
                  onChange={(e) => onChange({ ...keys, [agent.keyName]: e.target.value })}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  className={styles.eyeBtn}
                  onClick={() => setVisible((v) => ({ ...v, [agent.keyName]: !v[agent.keyName] }))}
                  title={visible[agent.keyName] ? 'Hide key' : 'Show key'}
                >
                  {visible[agent.keyName] ? '🙈' : '👁'}
                </button>
              </div>
              <a
                href={KEY_LINKS[agent.keyName]}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.keyLink}
              >
                Get key ↗
              </a>
            </div>
          ))}

          {/* Actions */}
          <div className={styles.actions}>
            <button onClick={handleSave} disabled={!allSet}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save keys
            </button>
            <button onClick={handleClear} className="danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Clear saved
            </button>
            <span className={styles.hint}>Keys saved to browser localStorage — never sent anywhere except their respective APIs</span>
          </div>
        </div>
      )}
    </div>
  )
}
