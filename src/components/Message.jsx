export default function Message({ message }) {
  const isFrank = message.role === 'assistant'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="bubble-in self-center max-w-[90%] text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {message.text}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`bubble-in flex ${isFrank ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={
          isFrank
            ? 'max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-line/40 px-4 py-3 text-body'
            : 'max-w-[85%] rounded-2xl rounded-tr-sm bg-amber px-4 py-3 text-ink'
        }
      >
        {message.image && (
          <img
            src={message.image}
            alt="Listing"
            className="mb-2 max-h-64 w-auto rounded-lg border border-line/60"
          />
        )}
        {message.text && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
