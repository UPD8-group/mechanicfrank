import { useEffect, useRef } from 'react'
import Message from './Message.jsx'

export default function ChatWindow({ messages, isTyping }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  return (
    <div className="flex flex-col gap-3 px-4 py-6 sm:px-6">
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
      {isTyping && (
        <div className="flex items-center gap-2 text-muted">
          <div className="rounded-2xl bg-line/80 px-4 py-3">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
