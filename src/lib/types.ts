export type StatusLevel = 'up' | 'down' | 'slow' | 'unknown'

export type DomainStatus = {
  domain: string
  url: string
  status: StatusLevel
  httpCode: number | null
  latencyMs: number | null
  checkedAt: string
  error?: string
}

export type StatusData = {
  checkedAt: string
  totalCount: number
  upCount: number
  downCount: number
  slowCount: number
  unknownCount: number
  results: DomainStatus[]
}

export type HistoryEntry = {
  checkedAt: string
  domain: string
  status: StatusLevel
  latencyMs: number | null
  httpCode: number | null
}

export type CategoryName =
  | '市府核心'
  | '交通/公車/停車'
  | '市民卡/支付'
  | '局處官網'
  | '衛生/醫療'
  | '社會福利/托育'
  | '地政/GIS'
  | '觀光/活動'
  | '教育/文化'
  | '環保/農業'
  | '開放資料'
  | '警消/災害'
  | '區公所'
  | '其他'

export type CategoryGroup = {
  name: CategoryName
  domains: DomainStatus[]
}
