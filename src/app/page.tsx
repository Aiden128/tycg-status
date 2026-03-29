'use client'

import { useState, useEffect, useMemo } from 'react'
import type { StatusData, DomainStatus, CategoryName, StatusLevel } from '@/lib/types'
import { categorize, CATEGORY_ORDER } from '@/lib/categories'
import CategoryGroup from '@/components/CategoryGroup'
import SearchFilter from '@/components/SearchFilter'
import SubscribeModal from '@/components/SubscribeModal'

const BASE_PATH = '/tycg-status'

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function HomePage() {
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const [latencyMap, setLatencyMap] = useState<Record<string, (number | null)[]>>({})

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<StatusLevel | 'all'>('all')
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  async function fetchStatus() {
    try {
      const res = await fetch(`${BASE_PATH}/data/status-latest.json?t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: StatusData = await res.json()
      setData(json)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  async function fetchHistory() {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const res = await fetch(`${BASE_PATH}/data/history/${today}.json?t=${Date.now()}`)
      if (!res.ok) return
      const history: { date: string; checks: StatusData[] } = await res.json()
      const map: Record<string, (number | null)[]> = {}
      for (const check of history.checks) {
        for (const r of check.results) {
          if (!map[r.domain]) map[r.domain] = []
          map[r.domain].push(r.latencyMs)
        }
      }
      setLatencyMap(map)
    } catch {
      // History data is optional — silently ignore errors
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchHistory()
    const interval = setInterval(() => { fetchStatus(); fetchHistory() }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Group results by category
  const categorized = useMemo<Record<CategoryName, DomainStatus[]>>(() => {
    const groups = Object.fromEntries(CATEGORY_ORDER.map(c => [c, [] as DomainStatus[]])) as unknown as Record<CategoryName, DomainStatus[]>
    if (!data) return groups
    for (const item of data.results) {
      const cat = categorize(item.domain)
      groups[cat].push(item)
    }
    return groups
  }, [data])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORY_ORDER.map(c => [c, 0])) as unknown as Record<CategoryName, number>
    for (const cat of CATEGORY_ORDER) {
      counts[cat] = categorized[cat]?.length ?? 0
    }
    return counts
  }, [categorized])

  // Filtered results
  const filteredGroups = useMemo<Record<CategoryName, DomainStatus[]>>(() => {
    const result = Object.fromEntries(CATEGORY_ORDER.map(c => [c, [] as DomainStatus[]])) as unknown as Record<CategoryName, DomainStatus[]>
    if (!data) return result
    for (const cat of CATEGORY_ORDER) {
      if (selectedCategory !== 'all' && selectedCategory !== cat) continue
      let items = categorized[cat] ?? []
      if (selectedStatus !== 'all') {
        items = items.filter(i => i.status === selectedStatus)
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        items = items.filter(i => i.domain.toLowerCase().includes(q))
      }
      result[cat] = items
    }
    return result
  }, [categorized, selectedCategory, selectedStatus, search, data])

  const totalVisible = useMemo(
    () => Object.values(filteredGroups).reduce((sum, arr) => sum + arr.length, 0),
    [filteredGroups]
  )

  const overallStatus = useMemo(() => {
    if (!data) return 'unknown'
    if (data.downCount > 10) return 'degraded'
    if (data.downCount > 0 || data.slowCount > 20) return 'partial'
    return 'operational'
  }, [data])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse"
              style={{
                backgroundColor:
                  overallStatus === 'operational'
                    ? 'var(--green)'
                    : overallStatus === 'degraded'
                    ? 'var(--red)'
                    : 'var(--yellow)',
              }}
            />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                桃園市政府系統健康監控
              </h1>
              {data && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  更新於 {formatDateTime(data.checkedAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-3 py-1.5 rounded-md text-xs border transition-colors disabled:opacity-50"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
            >
              {loading ? '更新中…' : '重新整理'}
            </button>
            <button
              onClick={() => setSubscribeOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs border transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
            >
              訂閱通知
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', border: '1px solid #7f1d1d', color: 'var(--red)' }}>
            ⚠️ 無法取得最新資料：{error}
          </div>
        )}

        {/* Summary cards */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.totalCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>監控總數</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{data.upCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>🟢 正常運作</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--red)' }}>{data.downCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>🔴 服務中斷</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>{data.slowCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>🟡 回應緩慢</p>
            </div>
          </div>
        )}

        {/* Overall status banner */}
        {data && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor:
                overallStatus === 'operational' ? '#052e16' :
                overallStatus === 'degraded' ? '#450a0a' : '#422006',
              border: `1px solid ${
                overallStatus === 'operational' ? '#166534' :
                overallStatus === 'degraded' ? '#7f1d1d' : '#713f12'
              }`,
            }}
          >
            <span className="text-xl">
              {overallStatus === 'operational' ? '🟢' : overallStatus === 'degraded' ? '🔴' : '🟡'}
            </span>
            <div>
              <p className="text-sm font-medium" style={{
                color: overallStatus === 'operational' ? 'var(--green)' :
                       overallStatus === 'degraded' ? 'var(--red)' : 'var(--yellow)',
              }}>
                {overallStatus === 'operational'
                  ? '所有系統正常運作'
                  : overallStatus === 'degraded'
                  ? `系統異常：${data.downCount} 個服務中斷`
                  : `部分異常：${data.downCount} 個中斷、${data.slowCount} 個緩慢`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                正常率 {data.totalCount > 0 ? Math.round((data.upCount / data.totalCount) * 100) : 0}%
                （{data.upCount} / {data.totalCount}）
              </p>
            </div>
          </div>
        )}

        {/* Search & filters */}
        {data && (
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            counts={categoryCounts}
          />
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="card p-3 h-16 animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
            ))}
          </div>
        )}

        {/* Results count when filtering */}
        {data && (search || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            顯示 {totalVisible} / {data.totalCount} 個網域
          </p>
        )}

        {/* Domain groups */}
        {data && CATEGORY_ORDER.map(cat => {
          const items = filteredGroups[cat]
          if (!items || items.length === 0) return null
          return (
            <CategoryGroup key={cat} name={cat} domains={items} latencyMap={latencyMap} />
          )
        })}

        {/* Empty state */}
        {data && totalVisible === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>找不到符合條件的網域</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedStatus('all') }}
              className="mt-3 text-xs underline"
              style={{ color: 'var(--text-muted)' }}
            >
              清除篩選條件
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>桃園市政府系統健康監控 · 每 5 分鐘自動更新</p>
          <div className="flex items-center gap-4">
            <a
              href={`${BASE_PATH}/feed.xml`}
              className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1"
            >
              📡 RSS 訂閱
            </a>
            <a
              href="https://github.com/Aiden128/tycg-status"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-secondary)] transition-colors"
            >
              GitHub
            </a>
            {lastRefresh && (
              <span>最後整理：{lastRefresh.toLocaleTimeString('zh-TW')}</span>
            )}
          </div>
        </div>
      </footer>

      {/* Subscribe modal */}
      <SubscribeModal
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        basePath={BASE_PATH}
      />
    </div>
  )
}
