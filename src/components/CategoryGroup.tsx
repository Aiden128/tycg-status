'use client'

import type { DomainStatus, CategoryName } from '@/lib/types'
import { CATEGORY_ICONS } from '@/lib/categories'
import StatusCard from './StatusCard'
import StatusBadge from './StatusBadge'

type Props = {
  name: CategoryName
  domains: DomainStatus[]
  latencyMap?: Record<string, (number | null)[]>
}

export default function CategoryGroup({ name, domains, latencyMap }: Props) {
  const upCount = domains.filter(d => d.status === 'up').length
  const downCount = domains.filter(d => d.status === 'down').length
  const slowCount = domains.filter(d => d.status === 'slow').length
  const icon = CATEGORY_ICONS[name]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span>{icon}</span>
          <span>{name}</span>
        </h2>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="text-[var(--green)]">▲ {upCount}</span>
          {downCount > 0 && <span className="text-[var(--red)]">▼ {downCount}</span>}
          {slowCount > 0 && <span className="text-[var(--yellow)]">◆ {slowCount}</span>}
          <span>/ {domains.length}</span>
        </div>
      </div>

      {downCount > 0 && (
        <div className="mb-3 p-2 rounded-md bg-[#450a0a] border border-[#7f1d1d] text-xs text-[var(--red)]">
          ⚠️ {downCount} 個服務中斷中
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {domains.map(d => (
          <StatusCard key={d.domain} item={d} latencyHistory={latencyMap?.[d.domain]} />
        ))}
      </div>
    </section>
  )
}
