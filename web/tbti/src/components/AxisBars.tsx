import {
  AXIS_KEYS,
  AXIS_LABELS,
  type AxisDelta,
  type AxisKey,
} from '../lib/scoring'

type Props = {
  normalized: AxisDelta
}

export function AxisBars({ normalized }: Props) {
  return (
    <div className="tbti-axes">
      <h3 className="tbti-axes__title">四轴得分</h3>
      <ul className="tbti-axes__list">
        {AXIS_KEYS.map((key: AxisKey) => (
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
                  left: `${((normalized[key] + 1) / 2) * 100}%`,
                }}
                title={`${key}: ${normalized[key].toFixed(2)}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
