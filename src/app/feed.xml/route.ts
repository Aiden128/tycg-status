import { readFileSync } from 'fs'
import { join } from 'path'
import type { StatusData, DomainStatus } from '@/lib/types'

export const dynamic = 'force-static'
export const revalidate = 300

const BASE_URL = 'https://aiden128.github.io/tycg-status'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function statusLabel(s: DomainStatus['status']): string {
  switch (s) {
    case 'up': return '正常'
    case 'down': return '中斷'
    case 'slow': return '緩慢'
    default: return '未知'
  }
}

export async function GET(): Promise<Response> {
  let data: StatusData

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'status-latest.json')
    data = JSON.parse(readFileSync(filePath, 'utf-8')) as StatusData
  } catch {
    return new Response('Failed to read status data', { status: 500 })
  }

  // Only include down/slow items in feed — changes worth notifying
  const notable = data.results.filter(r => r.status === 'down' || r.status === 'slow')

  const pubDate = new Date(data.checkedAt).toUTCString()

  const items = notable
    .slice(0, 50)
    .map(r => {
      const title = `[${statusLabel(r.status)}] ${escapeXml(r.domain)}`
      const latencyStr = r.latencyMs !== null ? `回應時間：${r.latencyMs}ms` : '回應時間：N/A'
      const httpStr = r.httpCode !== null ? `HTTP ${r.httpCode}` : '無回應'
      const description = escapeXml(
        `${r.domain} 狀態：${statusLabel(r.status)}。${httpStr}，${latencyStr}。檢測時間：${new Date(r.checkedAt).toLocaleString('zh-TW')}`
      )
      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(r.url)}</link>
      <guid isPermaLink="false">${escapeXml(r.domain)}-${escapeXml(r.checkedAt)}</guid>
      <description>${description}</description>
      <pubDate>${new Date(r.checkedAt).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>桃園市政府系統健康監控</title>
    <link>${BASE_URL}</link>
    <description>即時監控桃園市政府 ${data.totalCount} 個子網域的服務狀態。目前：${data.upCount} 正常，${data.downCount} 中斷，${data.slowCount} 緩慢。</description>
    <language>zh-TW</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <ttl>5</ttl>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
