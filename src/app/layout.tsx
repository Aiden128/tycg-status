import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '桃園市政府系統健康監控',
  description: '即時監控桃園市政府 896 個子網域的服務狀態、回應時間與歷史紀錄',
  keywords: '桃園市政府, 系統狀態, 服務監控, tycg.gov.tw',
  openGraph: {
    title: '桃園市政府系統健康監控',
    description: '即時監控桃園市政府 896 個子網域的服務狀態',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
