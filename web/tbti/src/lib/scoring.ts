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
 * 可达区间：对每根轴，逐题取该题所有选项在该轴上的 min/max，再对全量题目求和得到
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
  /** 海报金句：10–18 字，用于结果首屏与分享卡主标题 */
  hook: string
  /** 画像描述：1–2 句，用于结果页「旅行人格描述」与分享文案主体 */
  description: string
  /** 详情自嘲：2–3 句，用于结果详情段落与"自嘲文案"复制 */
  selfRoast: string
  /** @ 队友传播句：发到群聊 / 朋友圈，制造"被认领"钩子 */
  calloutCp: string
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

export type SecondaryMatchKind = 'borderline' | 'complement'

export interface SecondaryMatch {
  type: TravelType
  kind: SecondaryMatchKind
  /** complement 模式下，副型主要补充的强特征轴 */
  axis: AxisKey | null
  distance: number
  gap: number
}

export interface QuizResult {
  raw: AxisDelta
  normalized: AxisDelta
  bounds: AxisBoundsMap
  ranked: RankedType[]
  primary: TravelType
  secondary: TravelType | null
  secondaryMatch: SecondaryMatch | null
  borderline: boolean
}

/** 若榜一与榜二的距离差小于该阈值，视为边界型（并列接近） */
export const BORDERLINE_GAP = 0.05
/** 副型候选需要解释用户至少一根足够明显的轴向偏好 */
export const SECONDARY_AXIS_GATE = 0.45
/** 副型自身也要在该轴上有足够鲜明的典型特征 */
export const SECONDARY_TYPE_AXIS_GATE = 0.45
/** 副型在该轴上需要比主型更能解释用户 */
export const SECONDARY_COMPLEMENT_GAIN = 0.28
/** 互补副型不能离用户太远，否则会稀释主结果 */
export const SECONDARY_DISTANCE_ALLOWANCE = 0.55

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

function sameDirection(a: number, b: number): boolean {
  return a !== 0 && b !== 0 && Math.sign(a) === Math.sign(b)
}

function strengthInDirection(value: number, axisValue: number): number {
  return sameDirection(value, axisValue) ? Math.abs(axisValue) : 0
}

function findSecondaryMatch(
  normalized: AxisDelta,
  primary: TravelType,
  ranked: RankedType[],
): SecondaryMatch | null {
  const primaryRank = ranked[0]
  const secondRank = ranked[1]
  if (!primaryRank || !secondRank) return null

  const nearestGap = secondRank.distance - primaryRank.distance
  if (nearestGap < BORDERLINE_GAP) {
    return {
      type: secondRank.type,
      kind: 'borderline',
      axis: null,
      distance: secondRank.distance,
      gap: nearestGap,
    }
  }

  let best:
    | {
        rankedType: RankedType
        axis: AxisKey
        score: number
      }
    | null = null

  for (const candidate of ranked.slice(1)) {
    const distanceGap = candidate.distance - primaryRank.distance
    if (distanceGap > SECONDARY_DISTANCE_ALLOWANCE) continue

    for (const axis of AXIS_KEYS) {
      const userStrength = Math.abs(normalized[axis])
      if (userStrength < SECONDARY_AXIS_GATE) continue
      if (!sameDirection(normalized[axis], candidate.type.fingerprint[axis])) continue

      const primaryStrength = strengthInDirection(normalized[axis], primary.fingerprint[axis])
      const candidateStrength = Math.abs(candidate.type.fingerprint[axis])
      const complementGain = candidateStrength - primaryStrength

      if (candidateStrength < SECONDARY_TYPE_AXIS_GATE) continue
      if (complementGain < SECONDARY_COMPLEMENT_GAIN) continue

      const score = userStrength + complementGain + candidateStrength - distanceGap * 0.35
      if (!best || score > best.score) {
        best = { rankedType: candidate, axis, score }
      }
    }
  }

  if (!best) return null

  return {
    type: best.rankedType.type,
    kind: 'complement',
    axis: best.axis,
    distance: best.rankedType.distance,
    gap: best.rankedType.distance - primaryRank.distance,
  }
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
  const secondaryMatch = findSecondaryMatch(normalized, primary, ranked)
  const secondary = secondaryMatch?.type ?? null
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
    secondaryMatch,
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
