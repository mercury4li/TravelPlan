export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="tbti-disclaimer tbti-disclaimer--compact">
        旅格测试为趣味分型工具，用于自我觉察与社交分享；不构成心理学诊断，不可替代专业评估。
      </p>
    )
  }
  return (
    <footer className="tbti-disclaimer">
      <p>
        <strong>定位</strong>
        ：基于旅行中的偏好、决策与习惯的趣味分型工具，用于自我觉察与社交分享。
      </p>
      <p>
        <strong>非临床</strong>
        ：不构成心理学诊断；不可替代专业评估。
      </p>
    </footer>
  )
}
