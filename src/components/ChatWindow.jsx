import { useEffect, useRef } from 'react'
import Message from './Message.jsx'

export default function ChatWindow({ messages, isTyping }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  let frankLabelShown = false

  return (
    <div className="flex flex-col gap-3 px-4 py-6 sm:px-6">
      {messages.map((m) => {
        const showFrankLabel = m.role === 'assistant' && !frankLabelShown
        if (m.role === 'assistant') frankLabelShown = true
        return <Message key={m.id} message={m} showFrankLabel={showFrankLabel} />
      })}
      {isTyping && (
        <div className="bubble-in flex justify-start">
          <div className="max-w-[85%] rounded-xl border border-line border-l-4 border-l-amber bg-[#1c1917] px-4 py-3">
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
