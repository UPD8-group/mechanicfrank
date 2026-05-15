import { createPortal } from 'react-dom'

const VERDICT_META = {
  solid_find: {
    label: 'Solid Find',
    cls: 'border-green-300 bg-green-50 text-green-800',
  },
  closer_look: {
    label: 'Worth a Closer Look',
    cls: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  proceed_with_caution: {
    label: 'Proceed with Caution',
    cls: 'border-orange-300 bg-orange-50 text-orange-800',
  },
  keep_looking: {
    label: "I'd Keep Looking",
    cls: 'border-red-300 bg-red-50 text-red-800',
  },
}

function PriorityBadge({ priority }) {
  if (priority === 'high')
    return <span className="font-mono text-xs font-bold uppercase text-red-600">⚠ High</span>
  if (priority === 'medium')
    return <span className="font-mono text-xs font-semibold uppercase text-amber-600">• Medium</span>
  return <span className="font-mono text-xs uppercase text-stone-400">· Low</span>
}

function Section({ title, children }) {
  return (
    <div className="mb-5 break-inside-avoid">
      <h2 className="mb-2 border-b border-stone-200 pb-1 font-mono text-xs uppercase tracking-widest text-stone-400">
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function PrintReport({ report, onClose }) {
  const verdict = report.verdict || {}
  const meta = VERDICT_META[verdict.tier] || VERDICT_META.closer_look
  const today = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return createPortal(
    <div
      id="print-report"
      className="fixed inset-0 z-50 overflow-y-auto bg-white font-sans text-stone-900"
    >
      {/* Toolbar — hidden when printing */}
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-amber-400 px-5 py-2 font-semibold text-stone-900 hover:bg-amber-500"
          >
            Print / Save as PDF
          </button>
          <p className="text-xs text-stone-400">
            iPhone: Share → Print, then pinch out on the preview to save
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-500 hover:bg-stone-50"
        >
          ← Back to chat
        </button>
      </div>

      {/* Report content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 border-b-2 border-stone-900 pb-4">
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Mechanic Frank
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Used Car Assessment Report
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            Generated {today} · mechanicfrank.com
          </p>
        </div>

        {/* Verdict banner */}
        <div className={`mb-6 break-inside-avoid rounded-xl border-2 p-4 ${meta.cls}`}>
          <p className="font-mono text-xs uppercase tracking-widest opacity-60">
            Frank's Verdict
          </p>
          <p className="mt-1 text-xl font-bold">{meta.label}</p>
          {verdict.summary && (
            <p className="mt-2 text-sm leading-relaxed">{verdict.summary}</p>
          )}
        </div>

        <Section title="Overall Impression">
          <p className="leading-relaxed text-stone-700">{report.overall_impression}</p>
        </Section>

        <Section title="Things to Check">
          <div className="space-y-3">
            {(report.things_to_check || []).map((t, i) => (
              <div key={i} className="border-l-4 border-stone-200 pl-3">
                <PriorityBadge priority={t.priority} />
                <p className="font-semibold text-stone-800">{t.item}</p>
                <p className="text-sm text-stone-500">{t.why}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Known Model Issues">
          <p className="leading-relaxed text-stone-700">{report.known_model_issues}</p>
        </Section>

        <Section title="What Owners Say">
          <p className="leading-relaxed text-stone-700">{report.owner_feedback}</p>
        </Section>

        <Section title="Recalls & TSBs">
          <p className="leading-relaxed text-stone-700">{report.recall_info}</p>
        </Section>

        <Section title="Price Assessment">
          <p className="leading-relaxed text-stone-700">{report.price_assessment}</p>
        </Section>

        <Section title="Questions for the Seller">
          <ol className="space-y-2">
            {(report.questions_for_seller || []).map((q, i) => (
              <li key={i} className="flex gap-3 text-stone-700">
                <span className="flex-shrink-0 font-mono text-sm font-bold text-stone-300">
                  {i + 1}.
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Footer */}
        <div className="mt-8 border-t border-stone-200 pt-4">
          <p className="text-xs leading-relaxed text-stone-400">
            Frank&apos;s reports are general guidance only. Always inspect the vehicle in person
            and consult a qualified mechanic before purchasing. Mechanic Frank is not a licensed
            motor dealer or inspector.
          </p>
          <p className="mt-1 text-xs text-stone-400">
            mechanicfrank.com · No sign-up. No data stored. Built in Canberra 🇦🇺
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
