import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

type StatusLevel = 'up' | 'down' | 'slow' | 'unknown'

type DomainResult = {
  domain: string
  url: string
  status: StatusLevel
  httpCode: number | null
  latencyMs: number | null
  checkedAt: string
  error?: string
}

type StatusData = {
  checkedAt: string
  totalCount: number
  upCount: number
  downCount: number
  slowCount: number
  unknownCount: number
  results: DomainResult[]
}

const TIMEOUT_MS = 10_000
const SLOW_THRESHOLD_MS = 3_000
const BATCH_SIZE = 50

async function checkDomain(domain: string): Promise<DomainResult> {
  const url = `https://${domain}`
  const checkedAt = new Date().toISOString()
  const start = Date.now()

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'tycg-status-monitor/1.0 (+https://github.com/tycg-status)',
      },
    })

    clearTimeout(timer)
    const latencyMs = Date.now() - start
    const httpCode = res.status

    let status: StatusLevel
    if (httpCode >= 200 && httpCode < 400) {
      status = latencyMs > SLOW_THRESHOLD_MS ? 'slow' : 'up'
    } else {
      status = 'down'
    }

    return { domain, url, status, httpCode, latencyMs, checkedAt }
  } catch (err: unknown) {
    const latencyMs = Date.now() - start
    const isTimeout =
      err instanceof Error &&
      (err.name === 'AbortError' || err.message.includes('abort'))

    return {
      domain,
      url,
      status: 'down',
      httpCode: null,
      latencyMs: isTimeout ? TIMEOUT_MS : latencyMs,
      checkedAt,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function checkBatch(domains: string[]): Promise<DomainResult[]> {
  return Promise.all(domains.map(checkDomain))
}

async function main() {
  const domainsPath = join(ROOT, 'data', 'domains.json')
  const domains: string[] = JSON.parse(readFileSync(domainsPath, 'utf-8'))

  console.log(`Checking ${domains.length} domains in batches of ${BATCH_SIZE}...`)

  const results: DomainResult[] = []
  const total = domains.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = domains.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(total / BATCH_SIZE)
    process.stdout.write(`Batch ${batchNum}/${totalBatches}...`)
    const batchResults = await checkBatch(batch)
    results.push(...batchResults)
    const upInBatch = batchResults.filter(r => r.status === 'up').length
    const downInBatch = batchResults.filter(r => r.status === 'down').length
    console.log(` done (up: ${upInBatch}, down: ${downInBatch})`)
  }

  const upCount = results.filter(r => r.status === 'up').length
  const downCount = results.filter(r => r.status === 'down').length
  const slowCount = results.filter(r => r.status === 'slow').length
  const unknownCount = results.filter(r => r.status === 'unknown').length

  const statusData: StatusData = {
    checkedAt: new Date().toISOString(),
    totalCount: results.length,
    upCount,
    downCount,
    slowCount,
    unknownCount,
    results,
  }

  // Write latest status
  const publicDataDir = join(ROOT, 'public', 'data')
  mkdirSync(publicDataDir, { recursive: true })
  writeFileSync(
    join(publicDataDir, 'status-latest.json'),
    JSON.stringify(statusData, null, 2),
    'utf-8'
  )
  console.log(`\nWrote public/data/status-latest.json`)

  // Append to daily history
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const historyDir = join(publicDataDir, 'history')
  mkdirSync(historyDir, { recursive: true })
  const historyPath = join(historyDir, `${today}.json`)

  type HistoryFile = { date: string; checks: StatusData[] }
  let historyFile: HistoryFile
  if (existsSync(historyPath)) {
    historyFile = JSON.parse(readFileSync(historyPath, 'utf-8')) as HistoryFile
  } else {
    historyFile = { date: today, checks: [] }
  }

  historyFile.checks.push(statusData)

  // Keep only last 288 checks per day (5-min interval = 12/hr * 24 = 288)
  if (historyFile.checks.length > 288) {
    historyFile.checks = historyFile.checks.slice(-288)
  }

  writeFileSync(historyPath, JSON.stringify(historyFile, null, 2), 'utf-8')
  console.log(`Wrote public/data/history/${today}.json`)

  console.log(`\nSummary: ${upCount} up, ${downCount} down, ${slowCount} slow, ${unknownCount} unknown`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
