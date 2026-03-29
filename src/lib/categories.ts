import type { CategoryName } from './types'

// Extract the subdomain prefix from a full domain like "xxx.tycg.gov.tw"
function getSubdomain(domain: string): string {
  return domain.replace(/\.tycg\.gov\.tw$/, '').replace(/\.tycg$/, '').toLowerCase()
}

export function categorize(domain: string): CategoryName {
  const sub = getSubdomain(domain)

  // 市府核心
  if (
    sub === 'www' ||
    sub === 'eng' ||
    sub.includes('e-service') ||
    sub === '1950' ||
    sub === '1950online' ||
    sub === 'cas' ||
    sub === 'portal' ||
    sub === 'eservice' ||
    sub === 'service'
  ) {
    return '市府核心'
  }

  // 區公所 — check district names first (they contain keywords that overlap)
  if (
    sub.includes('bade') ||
    sub.includes('daxi') ||
    sub.includes('dayuan') ||
    sub.includes('guishan') ||
    sub.includes('luzhu') ||
    sub.includes('yangmei') ||
    sub.includes('zhongli') ||
    sub.includes('pingzhen') ||
    sub.includes('longtan') ||
    sub.includes('fuxing') ||
    sub.includes('xinwu') ||
    sub.includes('guanyin') ||
    sub === 'taoyuan' ||
    sub.includes('district') ||
    sub.endsWith('.taoyuan') ||
    /^\d{4}\.(bade|daxi|dayuan|guishan|luzhu|yangmei|zhongli|pingzhen|longtan|fuxing|xinwu|guanyin)$/.test(sub)
  ) {
    return '區公所'
  }

  // 交通/公車/停車
  if (
    sub.includes('ebus') ||
    sub.includes('epark') ||
    sub.includes('traffic') ||
    sub.includes('bus') ||
    sub.includes('parking') ||
    sub.includes('dorts') ||
    sub.includes('cctv') ||
    sub.includes('transport') ||
    sub.includes('road') ||
    sub.includes('speed') ||
    sub.includes('detection') ||
    sub.includes('averagespeed') ||
    sub.includes('drone') ||
    sub.includes('fly') ||
    sub.includes('aviation') ||
    sub.includes('airport')
  ) {
    return '交通/公車/停車'
  }

  // 市民卡/支付
  if (
    sub.includes('card') ||
    sub.includes('typass') ||
    sub.includes('citycard') ||
    sub.includes('mpay') ||
    sub.includes('pay') ||
    sub.includes('wallet') ||
    sub.includes('points')
  ) {
    return '市民卡/支付'
  }

  // 衛生/醫療
  if (
    sub.includes('health') ||
    sub.includes('vaccine') ||
    sub.includes('covid') ||
    sub.includes('dmcare') ||
    sub.includes('food-safety') ||
    sub.includes('foodsafety') ||
    sub.includes('dentures') ||
    sub.includes('medical') ||
    sub.includes('hospital') ||
    sub.includes('clinic') ||
    sub.includes('dph') ||
    sub.includes('drug') ||
    sub.includes('pharmacy')
  ) {
    return '衛生/醫療'
  }

  // 社會福利/托育
  if (
    sub.includes('baby') ||
    sub.includes('care') ||
    sub.includes('family') ||
    sub.includes('agefriendly') ||
    sub.includes('singlefamily') ||
    sub.includes('welfare') ||
    sub.includes('social') ||
    sub.includes('elderly') ||
    sub.includes('disability') ||
    sub.includes('labor') ||
    sub.includes('labour') ||
    sub.includes('work') ||
    sub.includes('job') ||
    sub.includes('employ')
  ) {
    return '社會福利/托育'
  }

  // 地政/GIS
  if (
    sub.includes('gis') ||
    sub.includes('3dmap') ||
    sub.includes('3dgis') ||
    sub.includes('land') ||
    sub.includes('addr') ||
    sub.includes('address') ||
    sub.includes('urplanning') ||
    sub.includes('sewergis') ||
    sub.includes('map') ||
    sub.includes('geo') ||
    sub.includes('cadastral') ||
    sub.includes('urban') ||
    sub.includes('urdb') ||
    sub.includes('arch')
  ) {
    return '地政/GIS'
  }

  // 觀光/活動
  if (
    sub.includes('travel') ||
    sub.includes('event') ||
    sub.includes('explore') ||
    sub.includes('enjoy') ||
    sub.includes('tourism') ||
    sub.includes('expo') ||
    sub.includes('kite') ||
    sub.includes('festival') ||
    sub.includes('cihu') ||
    sub.includes('hakka') ||
    sub.includes('arthakka') ||
    sub.includes('halloweencity') ||
    sub.includes('funcihu') ||
    sub.includes('2022') ||
    sub.includes('2024')
  ) {
    return '觀光/活動'
  }

  // 教育/文化
  if (
    sub.includes('ebook') ||
    sub.includes('emuseum') ||
    sub.includes('confucius') ||
    sub.includes('creative') ||
    sub.includes('culture') ||
    sub.includes('edu') ||
    sub.includes('school') ||
    sub.includes('library') ||
    sub.includes('museum') ||
    sub.includes('academy') ||
    sub.includes('sport') ||
    sub.includes('youth')
  ) {
    return '教育/文化'
  }

  // 環保/農業
  if (
    sub.includes('agriculture') ||
    sub.includes('animal') ||
    sub.includes('fish') ||
    sub.includes('farm') ||
    sub.includes('algal') ||
    sub.includes('food') ||
    sub.includes('env') ||
    sub.includes('green') ||
    sub.includes('recycle') ||
    sub.includes('waste') ||
    sub.includes('water') ||
    sub.includes('agri') ||
    sub.includes('plant') ||
    sub.includes('forest') ||
    sub.includes('ecology')
  ) {
    return '環保/農業'
  }

  // 開放資料
  if (
    sub.includes('opendata') ||
    sub.includes('bigdata') ||
    sub.includes('apidata') ||
    sub.includes('ckan') ||
    sub.includes('data') ||
    sub.includes('api') ||
    sub.includes('open')
  ) {
    return '開放資料'
  }

  // 警消/災害
  if (
    sub.includes('disaster') ||
    sub.includes('eoc') ||
    sub.includes('accident') ||
    sub.includes('fire') ||
    sub.includes('police') ||
    sub.includes('rescue') ||
    sub.includes('emergency') ||
    sub.includes('safe')
  ) {
    return '警消/災害'
  }

  // 局處官網 — government bureau codes
  if (
    sub.includes('doit') ||
    sub.includes('sab') ||
    sub.includes('cab') ||
    sub.includes('legal') ||
    sub.includes('tytax') ||
    sub.includes('budget') ||
    sub.includes('dowc') ||
    sub.includes('dfcd') ||
    sub.includes('csed') ||
    sub.includes('amlo') ||
    sub.includes('dept') ||
    sub.includes('bureau') ||
    sub.includes('office') ||
    sub.includes('dept') ||
    sub.includes('civil') ||
    sub.includes('finance') ||
    sub.includes('tax') ||
    sub.includes('audit') ||
    sub.includes('research') ||
    sub.includes('info') ||
    sub.includes('personnel') ||
    sub.includes('hr')
  ) {
    return '局處官網'
  }

  return '其他'
}

export const CATEGORY_ORDER: CategoryName[] = [
  '市府核心',
  '交通/公車/停車',
  '市民卡/支付',
  '局處官網',
  '衛生/醫療',
  '社會福利/托育',
  '地政/GIS',
  '觀光/活動',
  '教育/文化',
  '環保/農業',
  '開放資料',
  '警消/災害',
  '區公所',
  '其他',
]

export const CATEGORY_ICONS: Record<CategoryName, string> = {
  '市府核心': '🏛️',
  '交通/公車/停車': '🚌',
  '市民卡/支付': '💳',
  '局處官網': '🏢',
  '衛生/醫療': '🏥',
  '社會福利/托育': '👨‍👩‍👧',
  '地政/GIS': '🗺️',
  '觀光/活動': '🎪',
  '教育/文化': '📚',
  '環保/農業': '🌱',
  '開放資料': '📊',
  '警消/災害': '🚒',
  '區公所': '🏘️',
  '其他': '📋',
}
