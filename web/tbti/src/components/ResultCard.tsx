import { useState } from 'react'
import type { QuizResult, RankedType } from '../lib/scoring'
import { AxisBars } from './AxisBars'
import { Disclaimer } from './Disclaimer'

type Props = {
  result: QuizResult
  onRestart: () => void
}

function tripleLine(ranked: RankedType[]): string {
  const a = ranked[0]?.type.code ?? ''
  const b = ranked[1]?.type.code ?? ''
  const c = ranked[2]?.type.code ?? ''
  return `我是${a} × ${b} × ${c}（又累又稳）。`
}

function hashtags(): string {
  return '#旅格测试 #TBTI #旅行人格'
}

function teammateLine(primary: string, secondary: string | null): string {
  const extra = secondary ? ` + ${secondary}` : ''
  return `你这趟明明是${primary}${extra}，别装瞎溜达王。`
}

export function ResultCard({ result, onRestart }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied('fail')
      window.setTimeout(() => setCopied(null), 2000)
    }
  }

  const { primary, secondary, borderline, ranked } = result
  const secName = secondary?.code ?? null
  const triple = tripleLine(ranked)
  const tags = hashtags()
  const mate = teammateLine(primary.code, secName)

  return (
    <div className="tbti-result">
      <div className="tbti-result__card">
        <p className="tbti-eyebrow">你的旅格主型</p>
        <h2 className="tbti-result__code">{primary.code}</h2>
        <p className="tbti-result__en">{primary.enTag}</p>
        <p className="tbti-result__resonance">{primary.resonance}</p>
        {borderline && secName ? (
          <p className="tbti-result__borderline">
            与「{secName}」非常接近，可当副型参考。
          </p>
        ) : null}
      </div>

      <AxisBars normalized={result.normalized} />

      <section className="tbti-share" aria-label="分享文案">
        <h3 className="tbti-share__title">复制去玩</h3>
        <div className="tbti-share__block">
          <p className="tbti-share__label">自嘲三连</p>
          <p className="tbti-share__text">{triple}</p>
          <button
            type="button"
            className="tbti-btn tbti-btn--secondary"
            onClick={() => copy('triple', triple)}
          >
            {copied === 'triple' ? '已复制' : '复制'}
          </button>
        </div>
        <div className="tbti-share__block">
          <p className="tbti-share__label">@ 队友</p>
          <p className="tbti-share__text">{mate}</p>
          <button
            type="button"
            className="tbti-btn tbti-btn--secondary"
            onClick={() => copy('mate', mate)}
          >
            {copied === 'mate' ? '已复制' : '复制'}
          </button>
        </div>
        <div className="tbti-share__block">
          <p className="tbti-share__label">话题标签</p>
          <p className="tbti-share__text">{tags}</p>
          <button
            type="button"
            className="tbti-btn tbti-btn--secondary"
            onClick={() => copy('tags', tags)}
          >
            {copied === 'tags' ? '已复制' : '复制'}
          </button>
        </div>
      </section>

      <button type="button" className="tbti-btn tbti-btn--primary" onClick={onRestart}>
        再测一次
      </button>

      <Disclaimer />
    </div>
  )
}
