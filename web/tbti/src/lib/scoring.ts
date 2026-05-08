/**
 * TBTI 四轴刻度约定（与 docs/TBTI.md 一致）
 *
 * 数值为连续得分；原始分由题库选项 delta 累加，再按本题库可达区间线性映射到 [-1, 1]。
 *
 * | 轴   | 键名 | 左极（较小 / 负向） | 右极（较大 / 正向） |
 * |------|------|---------------------|---------------------|
 * | 行   | xing | 攻略卷王            | 说走就走            |
 * | 钱   | qian | 算账大师            | 体验至上            |
 * | 险   | xian | 风险雷达            | 冒险体质            |
 * | 人   | ren  | 社交发动机          | 独狼模式            |
 *
 * 可达区间：对每根轴，逐题取该题所有选项在该轴上的 min/max，再对 20 题求和得到
 * [minAchievable, maxAchievable]；归一化公式：
 *   u = 0                         若 max === min
 *   u = 2 * (raw - min) / (max - min) - 1   否则
 */

export const AXIS_KEYS = ['xing', 'qian', 'xian', 'ren'] as const
export type AxisKey = (typeof AXIS_KEYS)[number]

/** 条形图左右标签（左极小端 → 右极大端） */
export const AXIS_LABELS: Record<
  AxisKey,
  { left: string; right: string }
> = {
  xing: { left: '攻略卷王', right: '说走就走' },
  qian: { left: '算账大师', right: '体验至上' },
  xian: { left: '风险雷达', right: '冒险体质' },
  ren: { left: '社交发动机', right: '独狼模式' },
}

export interface AxisDelta {
  xing: number
  qian: number
  xian: number
  ren: number
}

export interface QuizOption {
  id: string
  label: string
  delta: AxisDelta
}

export interface Question {
  id: string
  text: string
  options: QuizOption[]
}

export interface TravelType {
  id: number
  code: string
  enTag: string
  resonance: string
  fingerprint: AxisDelta
}

export interface AxisBounds {
  min: number
  max: number
}

export type AxisBoundsMap = Record<AxisKey, AxisBounds>

export interface RankedType {
  type: TravelType
  distance: number
}

export interface QuizResult {
  raw: AxisDelta
  normalized: AxisDelta
  bounds: AxisBoundsMap
  ranked: RankedType[]
  primary: TravelType
  secondary: TravelType | null
  borderline: boolean
}

/** 若榜一与榜二的距离差小于该阈值，视为边界型（并列接近） */
export const BORDERLINE_GAP = 0.08

export function computeAxisBounds(questions: Question[]): AxisBoundsMap {
  const bounds = {} as AxisBoundsMap
  for (const axis of AXIS_KEYS) {
    let sumMin = 0
    let sumMax = 0
    for (const q of questions) {
      const vals = q.options.map((o) => o.delta[axis])
      sumMin += Math.min(...vals)
      sumMax += Math.max(...vals)
    }
    bounds[axis] = { min: sumMin, max: sumMax }
  }
  return bounds
}

function normalizeAxis(raw: number, min: number, max: number): number {
  if (max === min) return 0
  return (2 * (raw - min)) / (max - min) - 1
}

export function aggregateRaw(
  answers: Record<string, string>,
  questions: Question[],
): AxisDelta {
  const raw: AxisDelta = { xing: 0, qian: 0, xian: 0, ren: 0 }
  for (const q of questions) {
    const optId = answers[q.id]
    if (!optId) continue
    const opt = q.options.find((o) => o.id === optId)
    if (!opt) continue
    for (const axis of AXIS_KEYS) {
      raw[axis] += opt.delta[axis]
    }
  }
  return raw
}

export function normalizeScores(raw: AxisDelta, bounds: AxisBoundsMap): AxisDelta {
  return {
    xing: normalizeAxis(raw.xing, bounds.xing.min, bounds.xing.max),
    qian: normalizeAxis(raw.qian, bounds.qian.min, bounds.qian.max),
    xian: normalizeAxis(raw.xian, bounds.xian.min, bounds.xian.max),
    ren: normalizeAxis(raw.ren, bounds.ren.min, bounds.ren.max),
  }
}

function distance(a: AxisDelta, b: AxisDelta): number {
  let s = 0
  for (const k of AXIS_KEYS) {
    const d = a[k] - b[k]
    s += d * d
  }
  return Math.sqrt(s)
}

export function rankTypesByDistance(
  normalized: AxisDelta,
  types: TravelType[],
): RankedType[] {
  return types
    .map((type) => ({
      type,
      distance: distance(normalized, type.fingerprint),
    }))
    .sort((x, y) => x.distance - y.distance)
}

export function computeQuizResult(
  answers: Record<string, string>,
  questions: Question[],
  types: TravelType[],
): QuizResult {
  const bounds = computeAxisBounds(questions)
  const raw = aggregateRaw(answers, questions)
  const normalized = normalizeScores(raw, bounds)
  const ranked = rankTypesByDistance(normalized, types)
  const primary = ranked[0]!.type
  const secondary = ranked[1]?.type ?? null
  const borderline =
    ranked.length >= 2 &&
    ranked[1]!.distance - ranked[0]!.distance < BORDERLINE_GAP

  return {
    raw,
    normalized,
    bounds,
    ranked,
    primary,
    secondary,
    borderline,
  }
}

/** 用于测试 / 校准：每题选取指定轴上更靠左极或右极的选项（贪心逐题最大幅度） */
export function answersForAxisExtreme(
  questions: Question[],
  axis: AxisKey,
  pole: 'left' | 'right',
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const q of questions) {
    let pick = q.options[0]!
    for (const o of q.options) {
      if (pole === 'left') {
        if (o.delta[axis] < pick.delta[axis]) pick = o
      } else if (o.delta[axis] > pick.delta[axis]) pick = o
    }
    out[q.id] = pick.id
  }
  return out
}
