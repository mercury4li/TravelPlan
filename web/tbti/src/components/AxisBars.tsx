import {
  AXIS_KEYS,
  AXIS_LABELS,
  type AxisDelta,
  type AxisKey,
} from '../lib/scoring'
import { AXIS_VERDICTS, gradeOf } from '../lib/persona'

type Props = {
  normalized: AxisDelta
  /** 是否显示「四轴得分」标题。在已有层标的场景可关掉，避免重复。 */
  showTitle?: boolean
  /** 是否显示每根轴下方的 5 档 verdict 小字。默认 true。 */
  showVerdict?: boolean
}

export function AxisBars({ normalized, showTitle = true, showVerdict = true }: Props) {
  return (
    <div className="tbti-axes">
      {showTitle ? <h3 className="tbti-axes__title">四轴得分</h3> : null}
      <ul className="tbti-axes__list">
        {AXIS_KEYS.map((key: AxisKey) => {
          const value = normalized[key]
          return (
            <li key={key} className="tbti-axis">
              <div className="tbti-axis__labels">
                <span>{AXIS_LABELS[key].left}</span>
                <span>{AXIS_LABELS[key].right}</span>
              </div>
              <div className="tbti-axis__track">
                <span className="tbti-axis__mid" />
                <span
                  className="tbti-axis__marker"
                  style={{
                    left: `${((value + 1) / 2) * 100}%`,
                  }}
                  title={`${key}: ${value.toFixed(2)}`}
                />
              </div>
              {showVerdict ? (
                <p className="tbti-axis__verdict">
                  {AXIS_VERDICTS[key][gradeOf(value)]}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
