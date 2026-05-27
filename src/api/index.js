import { callClaude } from './claude.js'
import { callOpenAI } from './openai.js'
import { callGemini } from './gemini.js'
import { SYNTHESIS_SYSTEM } from '../utils/agents.js'

/**
 * Dispatches a call to the correct model based on agent.id.
 * @param {object} agent  — agent config from AGENTS
 * @param {string} system — system prompt
 * @param {string} user   — user message
 * @param {object} keys   — { openai, gemini }
 */
export async function callAgent(agent, system, user, keys) {
  switch (agent.id) {
    case 'claude':
      return callClaude(system, user)
    case 'openai':
      return callOpenAI(system, user, keys.openai)
    case 'gemini':
      return callGemini(system, user, keys.gemini)
    default:
      throw new Error(`Unknown agent: ${agent.id}`)
  }
}

/**
 * Calls Claude as a neutral synthesis moderator.
 */
export async function callSynthesis(userContent) {
  return callClaude(SYNTHESIS_SYSTEM, userContent)
}

/**
 * Builds the user message for a given debate round.
 * @param {number} roundNum        — 1-indexed current round
 * @param {string} code            — code under review
 * @param {string} problem         — user's question/problem
 * @param {Array}  previousRounds  — array of completed round arrays
 */
export function buildRoundPrompt(roundNum, code, problem, previousRounds) {
  let msg = `CODE UNDER REVIEW:\n\`\`\`\n${code}\n\`\`\`\n\nPROBLEM / QUESTION:\n${problem}`

  if (previousRounds.length > 0) {
    msg += '\n\n--- PREVIOUS ROUNDS ---'
    previousRounds.forEach((round, ri) => {
      msg += `\n\nROUND ${ri + 1}:`
      round.forEach((r) => {
        msg += `\n\n${r.name} (${r.company}):\n${r.response}`
      })
    })
    msg += `\n\n--- This is Round ${roundNum}. Engage directly with the responses above. ---`
  } else {
    msg += '\n\nRound 1: provide your independent analysis.'
  }

  return msg
}

/**
 * Builds the synthesis prompt from all completed rounds.
 */
export function buildSynthesisPrompt(code, problem, allRounds) {
  let msg = `CODE:\n\`\`\`\n${code}\n\`\`\`\n\nPROBLEM: ${problem}\n\nFULL DEBATE:`
  allRounds.forEach((round, ri) => {
    msg += `\n\nROUND ${ri + 1}:`
    round.forEach((r) => {
      msg += `\n${r.name} (${r.company}): ${r.response}`
    })
  })
  msg += '\n\nSynthesize into AGREEMENT, DISAGREEMENTS, and FINAL RECOMMENDATION.'
  return msg
}
