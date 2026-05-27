import { formatResponse } from '../../utils/format.js'
import styles from './Synthesis.module.css'

export default function Synthesis({ content, onReset }) {
  return (
    <div className={`${styles.panel} fade-up`}>
      <div className={styles.header}>
        <span className={styles.gavel}>⚖️</span>
        <div>
          <h2 className={styles.title}>Engineering Lead Synthesis</h2>
          <p className={styles.subtitle}>Final verdict via Claude — consolidates all rounds</p>
        </div>
      </div>

      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: formatResponse(content) }}
      />

      <div className={styles.footer}>
        <button className="primary" onClick={onReset}>
          ↺ New debate
        </button>
        <span className={styles.footerHint}>or scroll up to edit the code and run again</span>
      </div>
    </div>
  )
}
