import { formatResponse, extractConsensus } from '../../utils/format.js'
import styles from './DebateRound.module.css'

const ROUND_LABELS = ['Initial analysis', 'Cross-review', 'Final positions']

export default function DebateRound({ round, responses, isActive }) {
  return (
    <div className={`${styles.round} fade-up`}>
      <div className={styles.roundHeader}>
        <span className={styles.roundNumber}>{round}</span>
        <span className={styles.roundLabel}>{ROUND_LABELS[round - 1] ?? `Round ${round}`}</span>
        <div className={styles.dividerLine} />
        {isActive && <span className={styles.activePill}>In progress</span>}
      </div>

      <div className={styles.grid}>
        {responses.map((r) => (
          <AgentCard key={r.id} response={r} />
        ))}
      </div>
    </div>
  )
}

function AgentCard({ response }) {
  const consensus = extractConsensus(response.response)

  return (
    <div className={`${styles.card} ${styles[response.colorClass]}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={`badge ${response.colorClass}`}>{response.name}</span>
          <span className={styles.model}>{response.model}</span>
        </div>
        {consensus && (
          <span className={`${styles.consensusPill} ${styles[`consensus${consensus}`]}`}>
            {consensus === 'HIGH' ? '✓ aligned' : consensus === 'MEDIUM' ? '~ partial' : '✗ split'}
          </span>
        )}
      </div>
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: formatResponse(response.response) }}
      />
    </div>
  )
}
