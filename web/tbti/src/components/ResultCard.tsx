import { useMemo, useState } from 'react'
import type { QuizResult } from '../lib/scoring'
import { buildShareText, getFlavorNote } from '../lib/persona'
import { AxisBars } from './AxisBars'
import { Disclaimer } from './Disclaimer'
import { TypePortrait } from './TypePortrait'

type Props = {
  result: QuizResult
  onRestart: () => void
}

export function ResultCard({ result, onRestart }: Props) {
  const { primary, secondary, borderline, normalized } = result
  const flavorNote = useMemo(() => getFlavorNote(normalized, primary), [normalized, primary])
  const shareText = useMemo(() => buildShareText(primary, normalized), [primary, normalized])

  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      /* clipboard 不可用时仍给反馈 */
    } finally {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="tbti-result">
      {/* Hero：SBTI 风格的型代号大字 + 短码 + 一句 hook，配头像 */}
      <header className="tbti-hero">
        <p className="tbti-hero__eyebrow">你的旅行人格是</p>
        <div className="tbti-hero__avatar">
          <TypePortrait typeId={primary.id} label={`${primary.code} 人物形象`} />
        </div>
        <h2 className="tbti-hero__code">{primary.code}</h2>
        <p className="tbti-hero__en">{primary.enTag}</p>
        <p className="tbti-hero__hook">「{primary.hook}」</p>
      </header>

      {/* 旅行人格描述（立体化） */}
      <section className="tbti-section">
        <h3 className="tbti-section__title">旅行人格描述</h3>
        <p className="tbti-persona__base">{primary.description}</p>
        {flavorNote ? <p className="tbti-result__flavor">{flavorNote}</p> : null}
      </section>

      {/* 维度画像 */}
      <section className="tbti-section">
        <h3 className="tbti-section__title">维度画像</h3>
        <AxisBars normalized={normalized} showTitle={false} />
      </section>

      {/* 和你出门是什么体验 */}
      <section className="tbti-section">
        <h3 className="tbti-section__title">和你出门是什么体验</h3>
        <p className="tbti-result__roast">{primary.selfRoast}</p>
        <div className="tbti-result__callout">
          <p className="tbti-result__callout-label">@ 队友</p>
          <p className="tbti-result__callout-text">{primary.calloutCp}</p>
        </div>
        {borderline && secondary ? (
          <p className="tbti-result__borderline">
            与「{secondary.code}」非常接近，可当副型参考。
          </p>
        ) : null}
      </section>

      <div className="tbti-actions">
        <button
          type="button"
          className="tbti-btn tbti-btn--secondary"
          onClick={onCopy}
        >
          {copied ? '已复制' : '复制全文'}
        </button>
        <button
          type="button"
          className="tbti-btn tbti-btn--primary"
          onClick={onRestart}
        >
          再测一次
        </button>
      </div>

      <Disclaimer />
    </div>
  )
}
