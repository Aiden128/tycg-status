import type { StatusLevel } from '@/lib/types'

type Props = {
  status: StatusLevel
  size?: 'sm' | 'md'
}

const labels: Record<StatusLevel, string> = {
  up: '正常',
  down: '中斷',
  slow: '緩慢',
  unknown: '未知',
}

const dots: Record<StatusLevel, string> = {
  up: '🟢',
  down: '🔴',
  slow: '🟡',
  unknown: '⚪',
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} badge-${status}`}
    >
      <span className="text-[10px]">{dots[status]}</span>
      {labels[status]}
    </span>
  )
}
