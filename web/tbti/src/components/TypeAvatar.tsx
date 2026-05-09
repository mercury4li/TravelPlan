import type { JSX } from 'react'

/**
 * 18 型 SVG 头像。设计原则：
 *   - 统一 96×96 viewBox，圆头 + 表情 + 1 个标志物
 *   - 颜色全部走 CSS variable（var(--tbti-accent-soft / accent / text-strong)）
 *   - 描边 2、圆角 linecap，扁平几何风
 *   - 标志物以 fill var(--tbti-accent) 强调，与脸部 var(--tbti-text-strong) 形成色彩层次
 */

type AvatarProps = {
  typeId: number
  size?: number
  ariaLabel?: string
}

const cx = 48
const cy = 50
const r = 32

export function TypeAvatar({ typeId, size = 96, ariaLabel }: AvatarProps) {
  const Body = AVATARS[typeId] ?? Default
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel ?? `旅格 #${typeId} 头像`}
      className="tbti-avatar"
    >
      <BaseHead />
      <Body />
    </svg>
  )
}

function BaseHead() {
  return <circle cx={cx} cy={cy} r={r} className="tbti-avatar__head" />
}

/* ────────────── 复用元素：表情库 ────────────── */

const lineProps = {
  fill: 'none',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const Eye = (x: number, y: number) => (
  <circle cx={x} cy={y} r={2.5} className="tbti-avatar__face" />
)

const ClosedEye = (x: number, y: number) => (
  <path
    d={`M ${x - 4} ${y} Q ${x} ${y - 3.5}, ${x + 4} ${y}`}
    className="tbti-avatar__line"
    {...lineProps}
  />
)

const SmileMouth = (
  <path d="M 41 60 Q 48 66, 55 60" className="tbti-avatar__line" {...lineProps} />
)
const FlatMouth = (
  <line x1={42} y1={62} x2={54} y2={62} className="tbti-avatar__line" {...lineProps} />
)
const FrownMouth = (
  <path d="M 41 64 Q 48 58, 55 64" className="tbti-avatar__line" {...lineProps} />
)
const OMouth = (
  <ellipse cx={48} cy={61} rx={3.5} ry={4} className="tbti-avatar__face" />
)
const SmirkMouth = (
  <path d="M 42 62 Q 48 66, 56 60" className="tbti-avatar__line" {...lineProps} />
)
const SidewaysMouth = (
  <path d="M 41 61 L 55 63" className="tbti-avatar__line" {...lineProps} />
)

/* ────────────── 18 型头像 ────────────── */

// #1 路书精：方框眼镜 + 头顶虚线路径 + 终点小标记
function Avatar1MapKing() {
  return (
    <g>
      <rect x={32} y={43} width={11} height={8} rx={1.5} className="tbti-avatar__line" {...lineProps} />
      <rect x={53} y={43} width={11} height={8} rx={1.5} className="tbti-avatar__line" {...lineProps} />
      <line x1={43} y1={47} x2={53} y2={47} className="tbti-avatar__line" {...lineProps} />
      {FlatMouth}
      <path
        d="M 28 24 Q 36 14, 48 22 T 70 22"
        className="tbti-avatar__line tbti-avatar__line--accent"
        {...lineProps}
        strokeDasharray="3 3"
      />
      <circle cx={70} cy={22} r={3} className="tbti-avatar__accent" />
    </g>
  )
}

// #2 队长瘾：自信微笑 + 头顶旗
function Avatar2Captain() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {SmirkMouth}
      <line x1={62} y1={20} x2={62} y2={36} className="tbti-avatar__line" {...lineProps} />
      <path d="M 62 20 L 80 23 L 62 28 Z" className="tbti-avatar__accent" />
    </g>
  )
}

// #3 先冲为敬：兴奋圆睁眼 + O 嘴 + 风线
function Avatar3SendIt() {
  return (
    <g>
      {Eye(38, 46)}
      {Eye(58, 46)}
      {OMouth}
      <line x1={10} y1={46} x2={20} y2={46} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <line x1={6} y1={54} x2={18} y2={54} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <line x1={12} y1={62} x2={20} y2={62} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
    </g>
  )
}

// #4 氛围脑袋：闭眼笑 + 头侧小心
function Avatar4VibeFirst() {
  return (
    <g>
      {ClosedEye(38, 48)}
      {ClosedEye(58, 48)}
      {SmileMouth}
      <path
        d="M 78 28 a 4 4 0 1 1 -8 0 a 4 4 0 1 1 -8 0 c 0 4 8 8 8 8 s 8 -4 8 -8"
        className="tbti-avatar__accent"
      />
    </g>
  )
}

// #5 全队妈咪：温柔笑 + 头顶/胸前医疗十字
function Avatar5TeamMom() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {SmileMouth}
      <rect x={66} y={20} width={14} height={14} rx={2} className="tbti-avatar__accent" />
      <line x1={73} y1={23} x2={73} y2={31} stroke="white" strokeWidth={2} strokeLinecap="round" />
      <line x1={69} y1={27} x2={77} y2={27} stroke="white" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// #6 行走ATM：豪爽笑 + 头边 ¥ 钞票
function Avatar6PayGo() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {SmileMouth}
      <rect x={64} y={20} width={20} height={14} rx={2} className="tbti-avatar__accent" />
      <text x={74} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill="white">¥</text>
    </g>
  )
}

// #7 比价CPU：精明半眯 + 嘴抿直 + % 符号
function Avatar7DealBot() {
  return (
    <g>
      <line x1={34} y1={47} x2={42} y2={47} className="tbti-avatar__line" {...lineProps} />
      <line x1={54} y1={47} x2={62} y2={47} className="tbti-avatar__line" {...lineProps} />
      {FlatMouth}
      <circle cx={70} cy={20} r={3} className="tbti-avatar__accent" />
      <circle cx={82} cy={32} r={3} className="tbti-avatar__accent" />
      <line x1={70} y1={32} x2={82} y2={20} stroke="currentColor" className="tbti-avatar__line--accent" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  )
}

// #8 坏事编剧：担忧皱眉 + 头顶 !
function Avatar8WhatIf() {
  return (
    <g>
      <path d="M 33 45 L 42 48" className="tbti-avatar__line" {...lineProps} />
      <path d="M 63 45 L 54 48" className="tbti-avatar__line" {...lineProps} />
      {Eye(38, 50)}
      {Eye(58, 50)}
      {FrownMouth}
      <line x1={75} y1={16} x2={75} y2={28} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <circle cx={75} cy={32} r={2} className="tbti-avatar__accent" />
    </g>
  )
}

// #9 都行挂件：平眼平嘴 + 三个点（…）
function Avatar9OkStick() {
  return (
    <g>
      <line x1={34} y1={47} x2={42} y2={47} className="tbti-avatar__line" {...lineProps} />
      <line x1={54} y1={47} x2={62} y2={47} className="tbti-avatar__line" {...lineProps} />
      {FlatMouth}
      <circle cx={68} cy={28} r={1.8} className="tbti-avatar__accent" />
      <circle cx={75} cy={28} r={1.8} className="tbti-avatar__accent" />
      <circle cx={82} cy={28} r={1.8} className="tbti-avatar__accent" />
    </g>
  )
}

// #10 瞎溜达王：歪嘴 + 头顶 ?
function Avatar10NoPlan() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {SidewaysMouth}
      <path
        d="M 70 22 Q 70 14, 78 14 Q 86 14, 80 22 Q 74 26, 74 30"
        className="tbti-avatar__line tbti-avatar__line--accent"
        {...lineProps}
      />
      <circle cx={74} cy={34} r={1.8} className="tbti-avatar__accent" />
    </g>
  )
}

// #11 九宫格命：摆 pose 笑 + 一个相机框
function Avatar11GridLife() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {SmileMouth}
      <rect x={64} y={18} width={20} height={16} rx={2} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <circle cx={74} cy={26} r={3.2} className="tbti-avatar__accent" />
    </g>
  )
}

// #12 天黑开机：左眨右眼 + 头顶月牙
function Avatar12NightMode() {
  return (
    <g>
      {ClosedEye(38, 47)}
      {Eye(58, 46)}
      {SmirkMouth}
      <path
        d="M 78 18 a 8 8 0 1 0 4 13 a 6.5 6.5 0 1 1 -4 -13 z"
        className="tbti-avatar__accent"
      />
    </g>
  )
}

// #13 一人成团：平视 + 头戴大耳机
function Avatar13SoloRun() {
  return (
    <g>
      {Eye(38, 48)}
      {Eye(58, 48)}
      {FlatMouth}
      <path d="M 16 50 Q 16 18, 48 18 Q 80 18, 80 50" className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <rect x={12} y={46} width={10} height={16} rx={3} className="tbti-avatar__accent" />
      <rect x={74} y={46} width={10} height={16} rx={3} className="tbti-avatar__accent" />
    </g>
  )
}

// #14 灵魂关机：闭眼平嘴 + 头顶 Z
function Avatar14Offline() {
  return (
    <g>
      {ClosedEye(38, 48)}
      {ClosedEye(58, 48)}
      {FlatMouth}
      <path d="M 66 16 L 80 16 L 66 30 L 80 30" className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
    </g>
  )
}

// #15 网红过敏：翻白眼 + 嘴角下拉 + 禁止符号
function Avatar15NoHype() {
  return (
    <g>
      <circle cx={38} cy={49} r={2.5} className="tbti-avatar__face" />
      <circle cx={58} cy={49} r={2.5} className="tbti-avatar__face" />
      <line x1={34} y1={45} x2={42} y2={45} className="tbti-avatar__line" {...lineProps} />
      <line x1={54} y1={45} x2={62} y2={45} className="tbti-avatar__line" {...lineProps} />
      {FrownMouth}
      <circle cx={75} cy={24} r={9} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <line x1={68} y1={17} x2={82} y2={31} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
    </g>
  )
}

// #16 铁腿特种兵：喘气 O 嘴 + 头边脚印
function Avatar16LegDay() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {OMouth}
      <ellipse cx={72} cy={22} rx={4} ry={5.5} className="tbti-avatar__accent" />
      <circle cx={78} cy={16} r={1.8} className="tbti-avatar__accent" />
      <circle cx={80} cy={20} r={1.8} className="tbti-avatar__accent" />
      <circle cx={68} cy={32} r={1.4} className="tbti-avatar__accent" />
      <circle cx={82} cy={28} r={1.4} className="tbti-avatar__accent" />
    </g>
  )
}

// #17 反复横跳：左右眼方向不一 + 双向箭头
function Avatar17FlipFlip() {
  return (
    <g>
      <circle cx={36} cy={47} r={2.5} className="tbti-avatar__face" />
      <circle cx={60} cy={47} r={2.5} className="tbti-avatar__face" />
      {SidewaysMouth}
      <line x1={62} y1={22} x2={86} y2={22} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <path d="M 66 18 L 62 22 L 66 26" className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
      <path d="M 82 18 L 86 22 L 82 26" className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} />
    </g>
  )
}

// #18 一键换皮肤：左笑右平 + 中线分割
function Avatar18SkinSwap() {
  return (
    <g>
      <line x1={48} y1={20} x2={48} y2={80} className="tbti-avatar__line tbti-avatar__line--accent" {...lineProps} strokeDasharray="3 3" />
      {ClosedEye(38, 48)}
      {Eye(58, 47)}
      <path d="M 41 62 Q 44 65, 47 62" className="tbti-avatar__line" {...lineProps} />
      <line x1={49} y1={62} x2={55} y2={62} className="tbti-avatar__line" {...lineProps} />
    </g>
  )
}

function Default() {
  return (
    <g>
      {Eye(38, 47)}
      {Eye(58, 47)}
      {FlatMouth}
    </g>
  )
}

const AVATARS: Record<number, () => JSX.Element> = {
  1: Avatar1MapKing,
  2: Avatar2Captain,
  3: Avatar3SendIt,
  4: Avatar4VibeFirst,
  5: Avatar5TeamMom,
  6: Avatar6PayGo,
  7: Avatar7DealBot,
  8: Avatar8WhatIf,
  9: Avatar9OkStick,
  10: Avatar10NoPlan,
  11: Avatar11GridLife,
  12: Avatar12NightMode,
  13: Avatar13SoloRun,
  14: Avatar14Offline,
  15: Avatar15NoHype,
  16: Avatar16LegDay,
  17: Avatar17FlipFlip,
  18: Avatar18SkinSwap,
}
