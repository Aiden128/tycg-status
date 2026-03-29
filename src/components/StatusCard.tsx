'use client'

import type { DomainStatus } from '@/lib/types'
import StatusBadge from './StatusBadge'
import LatencyChart from './LatencyChart'

type Props = {
  item: DomainStatus
  latencyHistory?: (number | null)[]
}

function formatLatency(ms: number | null): string {
  if (ms === null) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

function latencyColor(ms: number | null, status: DomainStatus['status']): string {
  if (status === 'down' || ms === null) return 'text-[var(--text-muted)]'
  if (ms > 3000) return 'text-[var(--yellow)]'
  if (ms > 1000) return 'text-orange-400'
  return 'text-[var(--green)]'
}

export default function StatusCard({ item, latencyHistory }: Props) {
  const subdomain = item.domain.replace(/\.tycg\.gov\.tw$/, '')

  return (
    <div
      className={`card p-3 flex flex-col gap-2 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-l-2 ${
        item.status === 'up'
          ? 'border-l-[var(--green)]'
          : item.status === 'down'
          ? 'border-l-[var(--red)]'
          : item.status === 'slow'
          ? 'border-l-[var(--yellow)]'
          : 'border-l-[var(--gray)]'
      }`}
      title={`${item.domain} — HTTP ${item.httpCode ?? 'N/A'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-[var(--text-secondary)] truncate" title={item.domain}>
            {subdomain}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] truncate">.tycg.gov.tw</p>
        </div>
        <StatusBadge status={item.status} size="sm" />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className={`font-mono font-semibold ${latencyColor(item.latencyMs, item.status)}`}>
          {formatLatency(item.latencyMs)}
        </span>
        {item.httpCode && (
          <span className="text-[var(--text-muted)]">
            HTTP {item.httpCode}
          </span>
        )}
        <span className="text-[var(--text-muted)]">{formatTime(item.checkedAt)}</span>
      </div>

      {latencyHistory && latencyHistory.length > 1 && (
        <LatencyChart values={latencyHistory} height={20} />
      )}

      {item.error && (
        <p className="text-[10px] text-[var(--red)] truncate" title={item.error}>
          {item.error}
        </p>
      )}
    </div>
  )
}
