// Mechanic Frank chat state machine.
//
//   teaser   → user gets up to 5 messages before the paywall fires
//   paywall  → Stripe Embedded Checkout is open inline
//   paid     → the structured report is being streamed as bubbles
//   followup → up to 10 user questions after the report, then sign-off
//   done     → terminal; input is disabled

export const PHASES = Object.freeze({
  TEASER: 'teaser',
  PAYWALL: 'paywall',
  PAID: 'paid',
  FOLLOWUP: 'followup',
  DONE: 'done',
})

export const LIMITS = Object.freeze({
  TEASER_USER_MESSAGES: 5,
  FOLLOWUP_USER_MESSAGES: 10,
})

export function initialState() {
  return {
    phase: PHASES.TEASER,
    teaserUserCount: 0,
    followupUserCount: 0,
  }
}

// Should we open the paywall on the next turn?
export function shouldOpenPaywall(state) {
  return (
    state.phase === PHASES.TEASER &&
    state.teaserUserCount >= LIMITS.TEASER_USER_MESSAGES
  )
}

// Should we sign off after this follow-up turn?
export function shouldSignOff(state) {
  return (
    state.phase === PHASES.FOLLOWUP &&
    state.followupUserCount >= LIMITS.FOLLOWUP_USER_MESSAGES
  )
}

// Reducer for state transitions. Returns a new state, never mutates.
export function reduce(state, event) {
  switch (event.type) {
    case 'USER_MESSAGE_SENT':
      if (state.phase === PHASES.TEASER) {
        return { ...state, teaserUserCount: state.teaserUserCount + 1 }
      }
      if (state.phase === PHASES.FOLLOWUP) {
        return { ...state, followupUserCount: state.followupUserCount + 1 }
      }
      return state
    case 'OPEN_PAYWALL':
      return { ...state, phase: PHASES.PAYWALL }
    case 'CLOSE_PAYWALL':
      // Buyer dismissed without paying — return them to teaser, no extra message.
      return { ...state, phase: PHASES.TEASER }
    case 'PAYMENT_COMPLETE':
      return { ...state, phase: PHASES.PAID }
    case 'REPORT_DELIVERED':
      return { ...state, phase: PHASES.FOLLOWUP }
    case 'SIGN_OFF':
      return { ...state, phase: PHASES.DONE }
    default:
      return state
  }
}

// Is the input disabled in this phase?
export function inputDisabled(state) {
  return (
    state.phase === PHASES.PAYWALL ||
    state.phase === PHASES.PAID ||
    state.phase === PHASES.DONE
  )
}

// Placeholder text for the input based on phase.
export function inputPlaceholder(state) {
  switch (state.phase) {
    case PHASES.TEASER:
      return state.teaserUserCount === 0
        ? 'Drop a screenshot to get started…'
        : 'Ask Frank a question…'
    case PHASES.PAYWALL:
      return 'Finish checkout to keep the chat going…'
    case PHASES.PAID:
      return 'Frank is writing the report…'
    case PHASES.FOLLOWUP:
      return `Ask Frank a follow-up question (${
        LIMITS.FOLLOWUP_USER_MESSAGES - state.followupUserCount
      } left)`
    case PHASES.DONE:
      return 'Conversation finished. Cheers.'
    default:
      return ''
  }
}
