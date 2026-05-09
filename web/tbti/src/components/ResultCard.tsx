import { useMemo, useState } from 'react'
import { AXIS_LABELS, type AxisKey, type QuizResult, type SecondaryMatchKind } from '../lib/scoring'
import { getFlavorNote } from '../lib/persona'
import { exportShareCard } from '../lib/shareCard'
import { AxisBars } from './AxisBars'
import { Disclaimer } from './Disclaimer'
import { TypePortrait } from './TypePortrait'

type Props = {
  result: QuizResult
  onRestart: () => void
}

function buildSecondaryNote(
  primaryCode: string,
  secondaryCode: string,
  kind: SecondaryMatchKind,
  axis: AxisKey | null,
): string {
  if (primaryCode === '一人成团' && secondaryCode === '比价CPU') {
    return '你不是只会一个人玩，而是会一个人把路线、价格和节奏都算明白再出发。主型讲你的独行姿态，副型解释你的预算脑。'
  }

  if (kind === 'borderline') {
    return `你和「${secondaryCode}」的距离也很近。主型是最像你的那一面，副型可以当作另一条解释线索。`
  }

  const axisName = axis ? `${AXIS_LABELS[axis].left} / ${AXIS_LABELS[axis].right}` : '某个维度'
  return `主型是你的旅行主旋律，副型补上「${axisName}」这条更明显的偏好：你身上也带着「${secondaryCode}」的特质。`
}

export function ResultCard({ result, onRestart }: Props) {
  const { primary, secondaryMatch, normalized } = result
  const flavorNote = useMemo(() => getFlavorNote(normalized, primary), [normalized, primary])
  const secondaryNote = secondaryMatch
    ? buildSecondaryNote(primary.code, secondaryMatch.type.code, secondaryMatch.kind, secondaryMatch.axis)
    : null

  const [exportState, setExportState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const onExportCard = async () => {
    setExportState('saving')
    try {
      const siteUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
      await exportShareCard(primary, normalized, siteUrl)
      setExportState('done')
    } catch {
      setExportState('error')
    }
    window.setTimeout(() => setExportState('idle'), 2000)
  }

  const exportLabel =
    exportState === 'saving'
      ? '生成中'
      : exportState === 'done'
        ? '已导出'
        : exportState === 'error'
          ? '导出失败'
          : '导出分享卡'

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

      {secondaryMatch ? (
        <section className="tbti-secondary" aria-label="副型倾向">
          <div className="tbti-secondary__meta">
            <span className="tbti-secondary__label">副型倾向</span>
            <strong className="tbti-secondary__code">{secondaryMatch.type.code}</strong>
            <span className="tbti-secondary__en">{secondaryMatch.type.enTag}</span>
          </div>
          {secondaryMatch.kind === 'complement' && secondaryMatch.axis ? (
            <p className="tbti-secondary__axis">
              补充维度：{AXIS_LABELS[secondaryMatch.axis].left} / {AXIS_LABELS[secondaryMatch.axis].right}
            </p>
          ) : null}
          <p className="tbti-secondary__note">{secondaryNote}</p>
        </section>
      ) : null}

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
      </section>

      <div className="tbti-actions">
        <button
          type="button"
          className="tbti-btn tbti-btn--secondary"
          onClick={onExportCard}
          disabled={exportState === 'saving'}
        >
          {exportLabel}
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
