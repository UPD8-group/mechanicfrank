import { useReducer, useState, useCallback } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import ChatInput from './components/ChatInput.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import StripeCheckout from './components/StripeCheckout.jsx'
import {
  initialState,
  reduce,
  inputDisabled,
  inputPlaceholder,
  shouldOpenPaywall,
  shouldSignOff,
  PHASES,
} from './lib/chat-state.js'
import { frankChat, frankReport } from './lib/api.js'

const FRANK_GREETING = {
  id: 'greeting',
  role: 'assistant',
  text:
    "G'day. I'm Frank. Drop a screenshot of any used car listing — Carsales, Facebook Marketplace, Gumtree, wherever — and I'll tell you what I'd be checking, what's worth asking the seller, and whether the price stacks up.",
}

const PAYWALL_PROMPT = {
  role: 'assistant',
  text:
    "Right, I've given you the early read. If you want the full rundown — known issues for this exact model, recalls, what owners actually report, a proper price check against the market, and my verdict — that's the full report. A$4.75, one-off. Want me to pull it together?",
}

const VERDICT_LABELS = {
  solid_find: 'Looks like a solid find',
  closer_look: 'Worth a closer look',
  proceed_with_caution: 'Proceed with caution',
  keep_looking: "I'd probably keep looking",
}

// Format priority chip prefix.
function prio(p) {
  switch (p) {
    case 'high': return '⚠ HIGH'
    case 'medium': return '• MEDIUM'
    case 'low': return '· LOW'
    default: return '·'
  }
}

// Convert the structured report into 8 chat bubbles (text strings), in
// the order specified in the brief. Each bubble is shown sequentially
// with a 1-2s typing delay between them.
function reportToBubbles(report) {
  const things = (report.things_to_check || [])
    .map((t) => `${prio(t.priority)}  ${t.item}\n${t.why}`)
    .join('\n\n')
  const questions = (report.questions_for_seller || [])
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')
  const verdictLabel = VERDICT_LABELS[report.verdict?.tier] || 'My take'
  return [
    `Right, here's my full read.\n\n${report.overall_impression}`,
    `Things I'd be checking:\n\n${things}`,
    `Known issues for this model:\n\n${report.known_model_issues}`,
    `What owners actually say:\n\n${report.owner_feedback}`,
    `Recalls and TSBs:\n\n${report.recall_info}`,
    `Price check:\n\n${report.price_assessment}`,
    `Questions I'd ask the seller:\n\n${questions}`,
    `My verdict — ${verdictLabel}.\n\n${report.verdict?.summary || ''}`,
  ]
}

// Split a response into multiple bubbles on blank-line boundaries.
function splitIntoBubbles(text) {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// Realistic typing delay scaled to length, clamped to 800–1500ms.
function typingDelayFor(text) {
  const base = 600 + text.length * 18
  return Math.min(1500, Math.max(800, base))
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export default function App() {
  const [messages, setMessages] = useState([FRANK_GREETING])
  const [chat, dispatch] = useReducer(reduce, undefined, initialState)
  const [isTyping, setIsTyping] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...msg }])
  }, [])

  async function handlePaymentComplete() {
    setCheckoutOpen(false)
    dispatch({ type: 'PAYMENT_COMPLETE' })
    addMessage({
      role: 'system',
      text: '— Payment received · pulling the full report —',
    })

    // Generate the report from the existing transcript.
    let report
    try {
      const wireMessages = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, text: m.text || '' }))
      const result = await frankReport({ messages: wireMessages })
      report = result.report
    } catch (err) {
      addMessage({
        role: 'assistant',
        text:
          "Bugger — the line dropped while I was writing the report. Refresh and let me know — we'll sort it out, payment's accounted for.",
      })
      setErrorMsg(err.message || 'Report generation failed.')
      return
    }

    // Render 8 sections as separate bubbles, 1-2s typing delay between each.
    const bubbles = reportToBubbles(report)
    for (let i = 0; i < bubbles.length; i++) {
      setIsTyping(true)
      await sleep(1000 + Math.floor(Math.random() * 1000))
      setIsTyping(false)
      addMessage({ role: 'assistant', text: bubbles[i] })
    }

    await sleep(600)
    addMessage({
      role: 'assistant',
      text:
        "That's the lot. Got 10 follow-up questions on the house — fire away.",
    })
    dispatch({ type: 'REPORT_DELIVERED' })
  }

  // Convert the visible message log into the wire format Anthropic expects.
  function buildHistory(extraUserMessage) {
    const visible = [...messages]
    if (extraUserMessage) visible.push(extraUserMessage)
    return visible
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, text: m.text || '' }))
  }

  async function deliverFrankReply(replyText) {
    const bubbles = splitIntoBubbles(replyText)
    for (let i = 0; i < bubbles.length; i++) {
      setIsTyping(true)
      await sleep(typingDelayFor(bubbles[i]))
      setIsTyping(false)
      addMessage({ role: 'assistant', text: bubbles[i] })
    }
  }

  async function handleSend({ text, image }) {
    setErrorMsg('')
    const userMsg = {
      role: 'user',
      text,
      image: image ? image.preview : undefined,
    }
    addMessage(userMsg)
    dispatch({ type: 'USER_MESSAGE_SENT' })

    const mode = chat.phase === PHASES.FOLLOWUP ? 'followup' : 'teaser'

    // Strip the preview before sending — Anthropic only needs media_type + data.
    const wireImage = image
      ? { media_type: image.media_type, data: image.data }
      : undefined

    try {
      const { text: reply } = await frankChat({
        messages: buildHistory(userMsg),
        image: wireImage,
        mode,
      })
      await deliverFrankReply(reply)
    } catch (err) {
      setIsTyping(false)
      setErrorMsg(err.message || 'Something went wrong talking to Frank.')
      addMessage({
        role: 'assistant',
        text:
          "Bugger — my line dropped out for a second. Try that again in a moment.",
      })
      return
    }

    // Check paywall transition AFTER Frank has responded so the conversation
    // feels natural — the buyer gets value before the offer.
    if (shouldOpenPaywall({ ...chat, teaserUserCount: chat.teaserUserCount + 1 })) {
      await sleep(600)
      addMessage(PAYWALL_PROMPT)
      dispatch({ type: 'OPEN_PAYWALL' })
      await sleep(400)
      setCheckoutOpen(true)
      return
    }

    // Sign off after the 10th follow-up question.
    if (
      shouldSignOff({
        ...chat,
        followupUserCount: chat.followupUserCount + 1,
      })
    ) {
      await sleep(800)
      addMessage({
        role: 'assistant',
        text:
          "That's our ten. I reckon you've got what you need to go take a proper look in person. Take a torch, take your time, and don't be shy about walking away if something doesn't sit right. Good luck with it — hope it ends up being the one.",
      })
      dispatch({ type: 'SIGN_OFF' })
    }
  }

  const hasUserMessages = messages.some((m) => m.role === 'user')

  return (
    <div className="flex h-screen flex-col bg-ink" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="border-b border-line shadow-[0_1px_0_rgba(30,30,34,0.8)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <img
            src="/frank.jpg"
            onError={(e) => {
              e.currentTarget.src = '/frank-placeholder.svg'
            }}
            alt="Frank"
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-amber/50 ring-offset-2 ring-offset-ink sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <h1 className="font-display text-2xl tracking-wide text-amber sm:text-3xl">
              MECHANIC FRANK
            </h1>
            <p className="truncate font-mono text-[11px] uppercase tracking-widest text-muted sm:text-xs">
              25 years on the tools · here to help
            </p>
            <p className="mt-0.5 text-[11px] text-muted/70 sm:text-xs">
              Screenshot a listing. Get an honest assessment. A$4.75.
            </p>
          </div>
        </div>
      </header>

      {/* How It Works strip — collapses once the user sends their first message */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          hasUserMessages ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-line/50 bg-[#161412] px-4 py-2.5 text-xs text-muted">
            <span><span className="text-amber">📸</span>{' '}Screenshot the listing</span>
            <span className="text-muted/40">→</span>
            <span><span className="text-amber">🔧</span>{' '}Frank analyses it</span>
            <span className="text-muted/40">→</span>
            <span><span className="text-amber">✅</span>{' '}You decide</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl sm:px-4 sm:pt-3">
          <div className="sm:rounded-xl sm:border sm:border-line/50 bg-[#0f0e0d]">
            <ChatWindow messages={messages} isTyping={isTyping} />
            {errorMsg && (
              <p className="px-6 pb-2 text-center text-xs text-red-400">{errorMsg}</p>
            )}
          </div>
        </div>
      </main>

      {/* Paywall CTA — visible when phase is PAYWALL and checkout is dismissed */}
      {chat.phase === PHASES.PAYWALL && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-2 sm:px-6">
          <div className="rounded-xl border border-amber/20 bg-[#1c1917] px-4 py-3 text-center">
            <p className="mb-3 text-sm text-body">I've given you the early read. Want the full breakdown — model issues, recalls, price check, and my verdict?</p>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="paywall-cta-btn rounded-xl bg-amber px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-amber-dim"
            >
              Get Full Report — A$4.75
            </button>
            <p className="mt-2 text-[11px] text-muted">Stripe secure payment · No account needed</p>
          </div>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={isTyping || inputDisabled(chat)}
        placeholder={inputPlaceholder(chat)}
      />
      <Disclaimer />

      <StripeCheckout
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          dispatch({ type: 'CLOSE_PAYWALL' })
        }}
        onComplete={handlePaymentComplete}
      />
    </div>
  )
}
