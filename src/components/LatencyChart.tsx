'use client'

type Props = {
  values: (number | null)[]
  height?: number
}

export default function LatencyChart({ values, height = 24 }: Props) {
  if (!values.length) return null

  const valid = values.filter((v): v is number => v !== null)
  if (!valid.length) return null

  const max = Math.max(...valid, 1)

  return (
    <div
      className="flex items-end gap-px"
      style={{ height }}
      aria-label="延遲歷史圖表"
    >
      {values.map((v, i) => {
        const pct = v !== null ? (v / max) * 100 : 0
        const color =
          v === null
            ? '#374151'
            : v > 3000
            ? '#eab308'
            : v > 1000
            ? '#f97316'
            : '#22c55e'

        return (
          <span
            key={i}
            className="sparkline-bar"
            style={{
              height: `${Math.max(pct, 5)}%`,
              backgroundColor: color,
              opacity: v === null ? 0.3 : 1,
            }}
            title={v !== null ? `${v}ms` : '無資料'}
          />
        )
      })}
    </div>
  )
}
