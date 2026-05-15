import { useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import ChatInput from './components/ChatInput.jsx'
import Disclaimer from './components/Disclaimer.jsx'

const FRANK_GREETING = {
  id: 'greeting',
  role: 'assistant',
  text:
    "G'day. I'm Frank. Drop a screenshot or paste the listing text and I'll have a proper look — tell you what I'd be checking, what's worth asking the seller, and whether the price stacks up.",
}

export default function App() {
  const [messages, setMessages] = useState([FRANK_GREETING])

  function handleSend({ text }) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
    ])
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <img
            src="/frank.jpg"
            onError={(e) => {
              e.currentTarget.src = '/frank-placeholder.svg'
            }}
            alt="Frank"
            className="h-12 w-12 rounded-full border border-line object-cover sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <h1 className="font-display text-2xl tracking-wide text-amber sm:text-3xl">
              MECHANIC FRANK
            </h1>
            <p className="truncate font-mono text-[11px] uppercase tracking-widest text-muted sm:text-xs">
              25 years on the tools · here to help
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          <ChatWindow messages={messages} isTyping={false} />
        </div>
      </main>

      <ChatInput onSend={handleSend} />
      <Disclaimer />
    </div>
  )
}
