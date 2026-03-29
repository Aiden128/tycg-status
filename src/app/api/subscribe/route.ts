export const dynamic = 'force-static'

// This static export site uses localStorage for subscription preferences.
// This endpoint returns metadata for the subscription feature.
export async function GET(): Promise<Response> {
  const info = {
    message: '桃園市政府系統健康監控 — 訂閱說明',
    rss: 'https://aiden128.github.io/tycg-status/feed.xml',
    note: '訂閱偏好設定儲存於瀏覽器本機（localStorage）。Email 通知功能開發中。',
  }
  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
