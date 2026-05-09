import { Disclaimer } from './Disclaimer'

type Props = {
  totalQuestions: number
  onStart: () => void
}

export function Landing({ totalQuestions, onStart }: Props) {
  return (
    <div className="tbti-landing">
      <p className="tbti-eyebrow">Travel Behavior Type Indicator</p>
      <h1 className="tbti-title">旅格测试 · TBTI</h1>
      <p className="tbti-subtitle">你在旅途里是哪种人？</p>
      <Disclaimer compact />
      <button type="button" className="tbti-btn tbti-btn--primary" onClick={onStart}>
        开始测试
      </button>
      <p className="tbti-hint">共 {totalQuestions} 道情景题，可随时返回修改上一题。</p>
    </div>
  )
}
