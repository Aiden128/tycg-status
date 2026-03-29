'use client'

import type { CategoryName, StatusLevel } from '@/lib/types'
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/lib/categories'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  selectedCategory: CategoryName | 'all'
  onCategoryChange: (v: CategoryName | 'all') => void
  selectedStatus: StatusLevel | 'all'
  onStatusChange: (v: StatusLevel | 'all') => void
  counts: Record<CategoryName, number>
}

const statusOptions: { value: StatusLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: '全部', color: 'text-[var(--text-secondary)]' },
  { value: 'up', label: '正常', color: 'text-[var(--green)]' },
  { value: 'down', label: '中斷', color: 'text-[var(--red)]' },
  { value: 'slow', label: '緩慢', color: 'text-[var(--yellow)]' },
]

export default function SearchFilter({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  counts,
}: Props) {
  return (
    <div className="mb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="搜尋網域名稱..."
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#444] transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedStatus === opt.value
                ? 'bg-[var(--bg-hover)] border-[#444] text-[var(--text-primary)]'
                : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#444] hover:text-[var(--text-secondary)]'
            } ${opt.color}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[var(--bg-hover)] border-[#444] text-[var(--text-primary)]'
              : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#444] hover:text-[var(--text-secondary)]'
          }`}
        >
          全部分類
        </button>
        {CATEGORY_ORDER.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${
              selectedCategory === cat
                ? 'bg-[var(--bg-hover)] border-[#444] text-[var(--text-primary)]'
                : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#444] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{cat}</span>
            <span className="text-[var(--text-muted)]">({counts[cat] ?? 0})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
