import styles from './StatusBar.module.css'

export default function StatusBar({ status, isRunning, isError }) {
  if (!status) return null
  return (
    <div className={`${styles.bar} ${isError ? styles.error : ''}`}>
      {isRunning && <span className={`spin ${styles.spinner}`}>⟳</span>}
      {isError && <span>⚠</span>}
      <span>{status}</span>
    </div>
  )
}
