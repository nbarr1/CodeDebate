import { useState, useRef, useEffect } from 'react'
import KeysPanel from './components/KeysPanel/KeysPanel.jsx'
import GitHubPanel from './components/GitHubPanel/GitHubPanel.jsx'
import CodeInput from './components/CodeInput/CodeInput.jsx'
import DebateRound from './components/DebateRound/DebateRound.jsx'
import Synthesis from './components/Synthesis/Synthesis.jsx'
import StatusBar from './components/StatusBar/StatusBar.jsx'
import { callAgent, callSynthesis, buildRoundPrompt, buildSynthesisPrompt } from './api/index.js'
import { AGENTS, MAX_ROUNDS } from './utils/agents.js'
import { loadKeys } from './utils/storage.js'
import { extractConsensus } from './utils/format.js'
import styles from './App.module.css'

const INITIAL_STATE = {
  rounds: [],
  synthesis: null,
  isRunning: false,
  status: '',
  phase: 'idle', // idle | debating | synthesizing | done
}

export default function App() {
  const [keys, setKeys] = useState(() => loadKeys())
  const [input, setInput] = useState({ code: '', problem: '' })
  const [debate, setDebate] = useState(INITIAL_STATE)
  const abortRef = useRef(false)

  // Auto-scroll to latest round
  const bottomRef = useRef(null)
  useEffect(() => {
    if (debate.rounds.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [debate.rounds.length])

  const canStart =
    input.code.trim() &&
    input.problem.trim() &&
    keys.claude?.trim() &&
    keys.openai?.trim() &&
    keys.gemini?.trim() &&
    !debate.isRunning

  async function startDebate() {
    if (!canStart) return
    abortRef.current = false
    setDebate({ ...INITIAL_STATE, isRunning: true, phase: 'debating', status: 'Starting debate...' })

    const allRounds = []

    try {
      for (let rn = 1; rn <= MAX_ROUNDS; rn++) {
        if (abortRef.current) break

        const roundResps = []
        const userMsg = buildRoundPrompt(rn, input.code, input.problem, allRounds)

        for (const agent of AGENTS) {
          if (abortRef.current) break

          setDebate((prev) => ({
            ...prev,
            status: `Round ${rn}/${MAX_ROUNDS} — ${agent.name} (${agent.model}) thinking...`,
          }))

          const response = await callAgent(agent, agent.persona, userMsg, keys)
          roundResps.push({ ...agent, response })

          setDebate((prev) => ({
            ...prev,
            rounds: [...allRounds, [...roundResps]],
          }))
        }

        allRounds.push(roundResps)

        // Early exit on consensus after round 2
        if (rn >= 2) {
          const highCount = roundResps.filter(
            (r) => extractConsensus(r.response) === 'HIGH'
          ).length
          if (highCount >= 2) {
            setDebate((prev) => ({ ...prev, status: 'High consensus reached — synthesizing...' }))
            break
          }
        }
      }

      // Synthesis
      if (!abortRef.current) {
        setDebate((prev) => ({
          ...prev,
          phase: 'synthesizing',
          status: 'Engineering lead synthesizing final verdict...',
        }))

        const synthMsg = buildSynthesisPrompt(input.code, input.problem, allRounds)
        const synthesis = await callSynthesis(synthMsg, keys.claude)

        setDebate((prev) => ({
          ...prev,
          synthesis,
          phase: 'done',
          isRunning: false,
          status: 'Debate complete',
        }))
      }
    } catch (err) {
      setDebate((prev) => ({
        ...prev,
        isRunning: false,
        phase: 'idle',
        status: `Error: ${err.message}`,
      }))
    }
  }

  function reset() {
    abortRef.current = true
    setDebate(INITIAL_STATE)
  }

  const isError = debate.status.startsWith('Error')

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Multi-Agent<br />Code Review</span>
        </div>

        <nav className={styles.agentList}>
          {AGENTS.map((a) => (
            <div key={a.id} className={`${styles.agentItem} ${styles[a.colorClass]}`}>
              <span className={`badge ${a.colorClass}`}>{a.name}</span>
              <span className={styles.agentModel}>{a.model}</span>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarHint}>
            Each model sees all prior round responses. Debate ends at {MAX_ROUNDS} rounds or when ≥2 agents signal HIGH consensus.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Code Review</h1>
          <div className={styles.headerActions}>
            {debate.phase !== 'idle' && (
              <button onClick={reset} disabled={false}>
                ↺ Reset
              </button>
            )}
            <button
              className="primary"
              onClick={startDebate}
              disabled={!canStart}
            >
              {debate.isRunning ? (
                <><span className="spin">⟳</span> Running...</>
              ) : (
                '▶ Start debate'
              )}
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <KeysPanel keys={keys} onChange={setKeys} />
          <GitHubPanel
            githubToken={keys.github}
            onLoad={(content) => setInput((i) => ({ ...i, code: content }))}
          />
          <CodeInput
            code={input.code}
            problem={input.problem}
            onChange={setInput}
            disabled={debate.isRunning}
          />

          {debate.status && (
            <StatusBar
              status={debate.status}
              isRunning={debate.isRunning}
              isError={isError}
            />
          )}

          {debate.rounds.map((responses, ri) => (
            <DebateRound
              key={ri}
              round={ri + 1}
              responses={responses}
              isActive={debate.isRunning && ri === debate.rounds.length - 1}
            />
          ))}

          {debate.synthesis && (
            <Synthesis content={debate.synthesis} onReset={reset} />
          )}

          <div ref={bottomRef} />
        </div>
      </main>
    </div>
  )
}
