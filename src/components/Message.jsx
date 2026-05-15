export default function Message({ message, showFrankLabel }) {
  const isFrank = message.role === 'assistant'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="bubble-in self-center max-w-[90%] text-center">
        <p className="font-mono text-xs italic uppercase tracking-widest text-muted">
          {message.text}
        </p>
      </div>
    )
  }

  return (
    <div className={`bubble-in flex flex-col ${isFrank ? 'items-start' : 'items-end'}`}>
      {isFrank && showFrankLabel && (
        <span className="mb-1 ml-1 text-xs text-stone-500">Frank</span>
      )}
      <div
        className={
          isFrank
            ? 'max-w-[85%] rounded-xl border border-line border-l-4 border-l-amber bg-[#1c1917] px-4 py-3 text-body'
            : 'max-w-[85%] rounded-xl border border-amber/25 bg-amber/10 px-4 py-3 text-body'
        }
      >
        {message.image && (
          <img
            src={message.image}
            alt="Listing"
            className="mb-2 max-w-[280px] h-auto rounded-lg border border-line/60 object-cover"
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
