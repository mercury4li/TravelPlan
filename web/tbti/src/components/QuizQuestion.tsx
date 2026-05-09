import type { Question } from '../lib/scoring'

type Props = {
  question: Question
  index: number
  total: number
  selectedId: string | undefined
  onSelect: (optionId: string) => void
  onBack: () => void
}

export function QuizQuestion({
  question,
  index,
  total,
  selectedId,
  onSelect,
  onBack,
}: Props) {
  const pct = Math.round(((index + 1) / total) * 100)

  return (
    <div className="tbti-quiz">
      <div className="tbti-quiz__top">
        <button type="button" className="tbti-btn tbti-btn--ghost" onClick={onBack}>
          ← 上一题
        </button>
        <span className="tbti-quiz__progress">
          {index + 1} / {total}
        </span>
      </div>
      <div className="tbti-progress-bar" aria-hidden>
        <div className="tbti-progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <h2 className="tbti-question">{question.text}</h2>
      <ul className="tbti-options" role="list">
        {question.options.map((opt) => {
          const active = selectedId === opt.id
          return (
            <li key={opt.id}>
              <button
                type="button"
                className={`tbti-option${active ? ' tbti-option--active' : ''}`}
                onClick={() => onSelect(opt.id)}
              >
                {opt.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
