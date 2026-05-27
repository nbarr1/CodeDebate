import styles from './CodeInput.module.css'

export default function CodeInput({ code, problem, onChange, disabled }) {
  return (
    <div className={styles.panel}>
      <div className={styles.field}>
        <label className="label" htmlFor="code-input">
          Code to review
        </label>
        <textarea
          id="code-input"
          className={styles.codeArea}
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => onChange({ code: e.target.value, problem })}
          disabled={disabled}
          rows={10}
          spellCheck="false"
        />
      </div>

      <div className={styles.field}>
        <label className="label" htmlFor="problem-input">
          Problem or question
        </label>
        <textarea
          id="problem-input"
          className={styles.problemArea}
          placeholder="e.g. 'Is this fetch hook safe from race conditions?' or 'How should I optimize this database query?'"
          value={problem}
          onChange={(e) => onChange({ code, problem: e.target.value })}
          disabled={disabled}
          rows={3}
          spellCheck="false"
        />
      </div>
    </div>
  )
}
