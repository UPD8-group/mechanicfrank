import { useEffect, useRef, useState } from 'react'

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [text, setText] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [text])

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend({ text: trimmed })
    setText('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      <div className="mx-auto flex max-w-3xl items-end gap-2 px-3 py-3 sm:px-4">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || 'Tell Frank about the listing…'}
          disabled={disabled}
          className="flex-1 resize-none rounded-2xl border border-line bg-line/40 px-4 py-3 text-[15px] text-body placeholder:text-muted focus:border-amber focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="rounded-2xl bg-amber px-4 py-3 font-semibold text-ink transition hover:bg-amber-dim disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )
}
