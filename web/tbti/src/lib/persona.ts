/**
 * 结果叙事的规则中枢（三段式，但 UI 不再以「层」呈现）：
 *
 *   axes        四轴归一化得分 → 每轴 5 档偏向描述
 *   persona     立体化人格描述 = 16 象限基础句 + 主导轴强度修饰
 *   flavorNote  18 型最近邻匹配 → 用户与典型主型的偏差风味提示
 *
 * 设计原则：
 *   - axes / persona 完全由用户得分决定，立体感天然；不依赖 18 型指纹
 *   - 18 型在 UI 中是「最像的旅格代号」，不是诊断结论
 *   - 所有话术集中在本文件，便于运营 / 文案统一替换
 */

import type { AxisDelta, AxisKey, TravelType } from './scoring'

/* ────────────── Layer 1：5 档轴偏向描述 ────────────── */

export type AxisGrade = 'farLeft' | 'left' | 'mid' | 'right' | 'farRight'

const GRADE_THRESHOLDS = {
  farLeft: -0.6,
  left: -0.2,
  right: 0.2,
  farRight: 0.6,
} as const

export function gradeOf(value: number): AxisGrade {
  if (value <= GRADE_THRESHOLDS.farLeft) return 'farLeft'
  if (value <= GRADE_THRESHOLDS.left) return 'left'
  if (value < GRADE_THRESHOLDS.right) return 'mid'
  if (value < GRADE_THRESHOLDS.farRight) return 'right'
  return 'farRight'
}

/** 每根轴 × 5 档话术（用于 Layer 1 每条轴下的小字 verdict） */
export const AXIS_VERDICTS: Record<AxisKey, Record<AxisGrade, string>> = {
  xing: {
    farLeft:  '极致攻略卷王，行程精确到分钟',
    left:     '偏卷王，做完功课才出门',
    mid:      '行程随手能定，灵活居中',
    right:    '偏冲，路上再调整也无妨',
    farRight: '说走就走选手，落地再说',
  },
  qian: {
    farLeft:  '极致算账，每分钱都有计划',
    left:     '偏算账，能省则省',
    mid:      '花得均衡，性价比也讲体验',
    right:    '偏体验，舍得为感觉买单',
    farRight: '来都来了，账单回家再算',
  },
  xian: {
    farLeft:  '风险雷达全开，Plan B/C/D 备齐',
    left:     '偏稳，留好退路再行动',
    mid:      '该躲则躲，该闯则闯',
    right:    '偏冒险，先试试再说',
    farRight: '冒险体质拉满，刺激就完事',
  },
  ren: {
    farLeft:  '社交发动机，群聊和拼车不停',
    left:     '偏社交，喜欢有同行人',
    mid:      '看心情，能群也能独',
    right:    '偏独立，人多容易累',
    farRight: '独狼模式，独处是充电桩',
  },
}

/* ────────────── Layer 2：16 象限组合 → 人格描述 ────────────── */

/** 4 字母代码：行 / 钱 / 险 / 人，每位 A=负向、B=正向 */
export type Quadrant =
  | 'AAAA' | 'AAAB' | 'AABA' | 'AABB'
  | 'ABAA' | 'ABAB' | 'ABBA' | 'ABBB'
  | 'BAAA' | 'BAAB' | 'BABA' | 'BABB'
  | 'BBAA' | 'BBAB' | 'BBBA' | 'BBBB'

/** |v| < NEUTRAL_BAND 视为接近原点；4 轴全部接近原点 → 中庸特例 */
const NEUTRAL_BAND = 0.12

export function isAllNearZero(n: AxisDelta): boolean {
  return (
    Math.abs(n.xing) < NEUTRAL_BAND &&
    Math.abs(n.qian) < NEUTRAL_BAND &&
    Math.abs(n.xian) < NEUTRAL_BAND &&
    Math.abs(n.ren) < NEUTRAL_BAND
  )
}

export function quadrantOf(n: AxisDelta): Quadrant {
  const code =
    (n.xing >= 0 ? 'B' : 'A') +
    (n.qian >= 0 ? 'B' : 'A') +
    (n.xian >= 0 ? 'B' : 'A') +
    (n.ren >= 0 ? 'B' : 'A')
  return code as Quadrant
}

/** 每个象限的人格描述（2 句，约 50 字） */
export const QUADRANT_PERSONAS: Record<Quadrant, string> = {
  AAAA: '行程精算到分钟，预算抠到小数点，备好 Plan B 再出发——典型的「用脑出门」派，最适合带一群人。',
  AAAB: '行程、预算、风险全部自己拍板，喜欢一个人按自己的节奏走完每一站，旅行就是「跟自己开会」。',
  AABA: '算盘打得响，胆子也不小——爱攒一群人去人少的地方，省钱的冒险才好玩。',
  AABB: '会做功课的独行侠，敢去冷门又便宜的地方，走的路都是自己研究出来的——朋友圈一开就是宝藏图鉴。',
  ABAA: '行程稳、预算敞，喜欢拉队友一起住好的吃好的，在群里被当作「金主+军师」的复合人设。',
  ABAB: '精致型独行客，路线安排周全、舍得花、不乱冒险——把「一个人也要好好玩」刻进 DNA 的那种。',
  ABBA: '能打的体验派——计划周全、敢花敢冒险，是把所有人带去高光时刻的那个人，群友最爱。',
  ABBB: '精算型冒险家：独自去人少的目的地体验奢野，行程表里写满「小众宝藏」，活成别人的旅行参考书。',
  BAAA: '说走就走的省钱团长——今晚定明早飞，机票券能薅就薅，群友是行程的共同参与者，下一站靠投票。',
  BAAB: '背包客气质满满——一个人、抢便宜票、求稳但敢上路，旅行就是把自己丢出去看看会发生什么。',
  BABA: '野生派召集人——便宜+刺激+人多，凑够人就出发，下一站？路上再说，活动半径靠脚算。',
  BABB: '极致自由的「穷游战士」，预算紧但选择多，敢闯敢省；朋友圈一年能解锁八个国家，照片都带泥点。',
  BBAA: '体验型团长——预算给得起，团队照顾得周全，临时改行程也不慌，是那种「跟着 TA 走最省心」的人。',
  BBAB: '享受派独行客——一个人也能说走就走，舍得花、不乱冒，把「一个人也精致」做到位的那种。',
  BBBA: '把整个团队拉去探险——现金、勇气、行动力一样都不缺，是别人朋友圈里反复出现的「传奇人物」。',
  BBBB: '独狼版传奇旅人——一人、冲、烧、敢，行程表唯一固定项是「出发」，回来发图朋友圈集体破防。',
}

/** 4 轴都接近 0 时的特殊文案（命中 9 都行挂件原型） */
export const NEUTRAL_PERSONA =
  '你像旅行界的淡人——四根轴几乎都在原点，去哪儿都行、怎么花都好。这趟没你队伍会乱，有你队伍会和。'

/**
 * 主导轴亮点：四轴 × 两极 = 8 句"突出特质"修饰句。
 * 当用户某根轴的 |v| ≥ HIGHLIGHT_GATE 时，把这句话追加在象限基础句之后，
 * 让「同一象限不同强度」的用户也能看到差异化描述。
 */
const AXIS_HIGHLIGHTS: Record<AxisKey, { left: string; right: string }> = {
  xing: {
    left: '计划力是你最大的安全感来源',
    right: '行动力是你最大的底气',
  },
  qian: {
    left: '省钱是写进肌肉记忆里的本能',
    right: '为体验买单从来不带犹豫',
  },
  xian: {
    left: '「凡事预案」是你的护城河',
    right: '「路上再说」是你最兴奋的开关',
  },
  ren: {
    left: '把一群人安排得明明白白是你的天赋',
    right: '独处对你来说是最重要的充电方式',
  },
}

const HIGHLIGHT_GATE = 0.5

function dominantAxis(n: AxisDelta): { axis: AxisKey; value: number } | null {
  const list: { axis: AxisKey; value: number }[] = (['xing', 'qian', 'xian', 'ren'] as const)
    .map((axis) => ({ axis, value: n[axis] }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  const top = list[0]
  if (!top || Math.abs(top.value) < HIGHLIGHT_GATE) return null
  return top
}

export interface PersonaParts {
  /** 16 象限基础叙事，或中庸特例 */
  base: string
  /** 主导轴亮点；用户没有显著主导轴时为 null */
  highlight: string | null
}

export function getPersonaParts(n: AxisDelta): PersonaParts {
  if (isAllNearZero(n)) return { base: NEUTRAL_PERSONA, highlight: null }
  const dom = dominantAxis(n)
  const highlight = dom
    ? AXIS_HIGHLIGHTS[dom.axis][dom.value >= 0 ? 'right' : 'left']
    : null
  return { base: QUADRANT_PERSONAS[quadrantOf(n)], highlight }
}

/* ────────────── Layer 3：风味提示（与主型偏差） ────────────── */

const AXIS_KEY_LIST: AxisKey[] = ['xing', 'qian', 'xian', 'ren']

const AXIS_FLAVOR_WORDS: Record<AxisKey, { left: string; right: string }> = {
  xing: { left: '更卷', right: '更冲' },
  qian: { left: '更会算', right: '更舍得花' },
  xian: { left: '更稳', right: '更敢' },
  ren: { left: '更社交', right: '更独立' },
}

/** 阈值：用户在某轴的得分与主型指纹差超过该值，才视为有风味偏差 */
const FLAVOR_GAP = 0.35

/**
 * 找出用户与主型偏差最大的 1–2 根轴，生成一句「你比典型的 XX 更 YY」。
 * 若所有轴都贴近主型，返回 null（不显示风味提示）。
 */
export function getFlavorNote(
  normalized: AxisDelta,
  primary: TravelType,
): string | null {
  const diffs = AXIS_KEY_LIST.map((axis) => ({
    axis,
    diff: normalized[axis] - primary.fingerprint[axis],
  }))
    .filter((d) => Math.abs(d.diff) >= FLAVOR_GAP)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 2)

  if (diffs.length === 0) return null

  const phrases = diffs.map((d) => {
    const word = d.diff > 0 ? AXIS_FLAVOR_WORDS[d.axis].right : AXIS_FLAVOR_WORDS[d.axis].left
    return word
  })

  return `你比典型的「${primary.code}」${phrases.join('、')}。`
}

/* ────────────── 装配：用于 UI 与一键复制 ────────────── */

export interface PersonaResult {
  /** 每根轴的得分 + 5 档 verdict，UI 用作维度画像章节 */
  axes: { axis: AxisKey; value: number; verdict: string }[]
  /** 立体化人格描述：基础句 + 可选的主导轴亮点 */
  persona: PersonaParts
  /** 与主型典型指纹的偏差风味提示，可能为 null */
  flavorNote: string | null
}

export function buildPersona(
  normalized: AxisDelta,
  primary: TravelType,
): PersonaResult {
  return {
    axes: AXIS_KEY_LIST.map((axis) => ({
      axis,
      value: normalized[axis],
      verdict: AXIS_VERDICTS[axis][gradeOf(normalized[axis])],
    })),
    persona: getPersonaParts(normalized),
    flavorNote: getFlavorNote(normalized, primary),
  }
}

const AXIS_DISPLAY_NAME: Record<AxisKey, string> = {
  xing: '行',
  qian: '钱',
  xian: '险',
  ren: '人',
}

export function buildShareText(
  primary: TravelType,
  normalized: AxisDelta,
): string {
  const axisLines = AXIS_KEY_LIST
    .map((axis) => {
      const value = normalized[axis]
      const verdict = AXIS_VERDICTS[axis][gradeOf(value)]
      const sign = value > 0 ? '+' : value < 0 ? '−' : ' '
      const abs = Math.abs(value).toFixed(2)
      const num = value === 0 ? '0.00' : `${sign}${abs}`
      return `${AXIS_DISPLAY_NAME[axis]} ${num}  ${verdict}`
    })
    .join('\n')

  const flavorNote = getFlavorNote(normalized, primary)
  const flavorLine = flavorNote ? `\n${flavorNote}` : ''

  return [
    `【我的旅格人格 · ${primary.code}（${primary.enTag}）】`,
    primary.hook,
    '',
    primary.description,
    '',
    axisLines,
    '',
    `@ 队友：${primary.calloutCp}${flavorLine}`,
    '',
    '#旅格测试 #TBTI',
  ].join('\n')
}
