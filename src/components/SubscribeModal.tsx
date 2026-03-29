'use client'

import { useState, useEffect } from 'react'
import type { CategoryName } from '@/lib/types'
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/lib/categories'

type Props = {
  open: boolean
  onClose: () => void
  basePath: string
}

type Channel = 'rss' | 'telegram' | 'email'

export default function SubscribeModal({ open, onClose, basePath }: Props) {
  const [channel, setChannel] = useState<Channel>('rss')
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryName>>(
    new Set(CATEGORY_ORDER)
  )
  const [saved, setSaved] = useState(false)

  // Load saved email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tycg-status-email')
      if (stored) setEmail(stored)
    }
  }, [])

  if (!open) return null

  const rssUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${basePath}/feed.xml`

  function toggleCategory(cat: CategoryName) {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function toggleAll() {
    if (selectedCategories.size === CATEGORY_ORDER.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(CATEGORY_ORDER))
    }
  }

  function handleEmailSave() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tycg-status-email', email)
      localStorage.setItem(
        'tycg-status-categories',
        JSON.stringify([...selectedCategories])
      )
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">訂閱狀態通知</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Channel selector */}
        <div className="flex gap-2">
          {(['rss', 'telegram', 'email'] as Channel[]).map(ch => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                channel === ch
                  ? 'bg-[var(--bg-hover)] border-[#444] text-[var(--text-primary)]'
                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#444]'
              }`}
            >
              {ch === 'rss' ? '📡 RSS' : ch === 'telegram' ? '✈️ Telegram' : '📧 Email'}
            </button>
          ))}
        </div>

        {/* RSS */}
        {channel === 'rss' && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              訂閱 RSS 即可在任何 RSS 閱讀器中接收服務狀態變更通知。
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={rssUrl}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-xs font-mono text-[var(--text-secondary)] focus:outline-none"
              />
              <button
                onClick={() => navigator.clipboard?.writeText(rssUrl)}
                className="px-3 py-2 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded text-xs hover:border-[#444] transition-colors"
              >
                複製
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              推薦閱讀器：Feedly、Inoreader、NetNewsWire
            </p>
          </div>
        )}

        {/* Telegram */}
        {channel === 'telegram' && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              透過 Telegram Bot 接收即時通知（功能開發中）。
            </p>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] text-center">
              <p className="text-2xl mb-2">🚧</p>
              <p className="text-sm text-[var(--text-muted)]">Telegram 通知功能即將上線</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">目前請使用 RSS 訂閱</p>
            </div>
          </div>
        )}

        {/* Email */}
        {channel === 'email' && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              輸入 Email 以接收狀態變更通知（功能開發中，目前僅儲存於本機）。
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#444] transition-colors"
            />
            <button
              onClick={handleEmailSave}
              disabled={!email}
              className="w-full py-2 bg-[var(--green-dim)] border border-[var(--green)] text-[var(--green)] rounded text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? '✓ 已儲存' : '儲存設定'}
            </button>
          </div>
        )}

        {/* Category selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">監控分類</p>
            <button
              onClick={toggleAll}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {selectedCategories.size === CATEGORY_ORDER.length ? '取消全選' : '全選'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORY_ORDER.map(cat => (
              <label
                key={cat}
                className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded"
                />
                <span className="text-xs">
                  {CATEGORY_ICONS[cat]} {cat}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
