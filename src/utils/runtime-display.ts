import { useTimezoneStore } from '@/stores/timezone'
import type { RuntimeDeviceSummary, RuntimeTraceListItem, RuntimeWorklineSummary } from '@/types/runtime'
import { formatDurationFromMilliseconds } from '@/views/logs/shared/formatters'
import { formatRelativeTime, parseApiTime } from '@/utils/timezone'

export type RuntimeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

const DANGER_STATUSES = new Set([
  'FAILED',
  'FAIL',
  'TIMEOUT',
  'ABORTED',
  'CANCELLED',
  'ERROR',
  'OFFLINE',
  'FAULT',
  'REJECTED',
  'EXPIRED'
])

const WARNING_STATUSES = new Set([
  'WAITING',
  'WAITING_DEVICE_RESULT',
  'WAITING_EXTERNAL',
  'PENDING',
  'MANUAL_HOLD',
  'DEGRADED',
  'BUSY',
  'RETRY',
  'DISPATCHING'
])

const PRIMARY_STATUSES = new Set([
  'RUNNING',
  'IN_PROGRESS',
  'PROCESSING',
  'NEW',
  'ACTIVE',
  'ACK_RECEIVED',
  'SENT'
])

const SUCCESS_STATUSES = new Set([
  'SUCCESS',
  'SUCCEEDED',
  'COMPLETED',
  'DONE',
  'ONLINE',
  'HEALTHY',
  'ACKED',
  'ACCEPTED',
  'IDLE',
  'READY',
  'AVAILABLE'
])

function toDate(value?: string | Date | null): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  try {
    return parseApiTime(value)
  } catch {
    return null
  }
}

export function compactEnumLabel(value?: string | null): string {
  if (!value) {
    return '—'
  }

  if (!value.includes('.')) {
    return value
  }

  const segments = value.split('.')
  return segments[segments.length - 1] || value
}

export function normalizeRuntimeStatus(status?: string | null): string {
  return compactEnumLabel(status).toUpperCase()
}

export function resolveRuntimeTone(status?: string | null): RuntimeTone {
  const normalized = normalizeRuntimeStatus(status)

  if (!normalized || normalized === '—') {
    return 'info'
  }

  if (DANGER_STATUSES.has(normalized)) {
    return 'danger'
  }

  if (WARNING_STATUSES.has(normalized)) {
    return 'warning'
  }

  if (PRIMARY_STATUSES.has(normalized)) {
    return 'primary'
  }

  if (SUCCESS_STATUSES.has(normalized)) {
    return 'success'
  }

  return 'info'
}

export function isFailureStatus(status?: string | null): boolean {
  return resolveRuntimeTone(status) === 'danger'
}

export function isWaitingStatus(status?: string | null): boolean {
  return resolveRuntimeTone(status) === 'warning'
}

export function isActiveStatus(status?: string | null): boolean {
  const tone = resolveRuntimeTone(status)
  return tone === 'primary' || tone === 'warning'
}

export function formatRuntimeDate(value?: string | Date | null, format = 'yyyy-MM-dd HH:mm:ss'): string {
  const date = toDate(value)
  if (!date) {
    return '—'
  }

  const timezoneStore = useTimezoneStore()
  return timezoneStore.formatInCurrentTimezone(date, format)
}

export function formatRuntimeRelative(value?: string | Date | null): string {
  if (!value) {
    return '—'
  }

  if (value instanceof Date) {
    return formatRelativeTime(value.toISOString())
  }

  try {
    return formatRelativeTime(value)
  } catch {
    return '—'
  }
}

export function formatRuntimeDateTime(value?: string | Date | null): string {
  const absolute = formatRuntimeDate(value)
  if (absolute === '—') {
    return absolute
  }

  const relative = formatRuntimeRelative(value)
  return relative === '—' ? absolute : `${absolute} · ${relative}`
}

export function formatRuntimeDurationMs(value?: number | null): string {
  const formatted = formatDurationFromMilliseconds(value)
  return formatted === '-' ? '—' : formatted
}

function formatHumanDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.max(Math.round(milliseconds), 0)} ms`
  }

  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.slice(0, 2).join(' ')
}

export function formatRuntimeElapsed(start?: string | Date | null, end?: string | Date | null): string {
  const startDate = toDate(start)
  const endDate = toDate(end) ?? new Date()

  if (!startDate) {
    return '—'
  }

  const diff = endDate.getTime() - startDate.getTime()
  if (Number.isNaN(diff) || diff < 0) {
    return '—'
  }

  return formatHumanDuration(diff)
}

export function formatRuntimeCount(value?: number | null): string {
  const numericValue = Number(value ?? 0)
  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US').format(numericValue)
}

export function readPositiveInt(value: unknown): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value
  const numericValue = Number(rawValue || 0)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

function compareByScoreDesc<T>(
  left: T,
  right: T,
  getScore: (item: T) => number,
  getTieBreaker?: (item: T) => number
): number {
  const scoreDelta = getScore(right) - getScore(left)
  if (scoreDelta !== 0) {
    return scoreDelta
  }

  if (!getTieBreaker) {
    return 0
  }

  return getTieBreaker(left) - getTieBreaker(right)
}

export function sortByScoreDesc<T>(
  items: T[],
  getScore: (item: T) => number,
  getTieBreaker?: (item: T) => number
): T[] {
  return [...items].sort((left, right) => compareByScoreDesc(left, right, getScore, getTieBreaker))
}

export function takeTopByScoreDesc<T>(
  items: T[],
  getScore: (item: T) => number,
  limit: number,
  getTieBreaker?: (item: T) => number
): T[] {
  return sortByScoreDesc(items, getScore, getTieBreaker).slice(0, limit)
}

export function getTraceRiskScore(item: RuntimeTraceListItem): number {
  let score = 0
  if (isFailureStatus(item.status)) score += 80
  if (item.is_timed_out) score += 50
  if (item.failure_domain) score += 20
  if (isWaitingStatus(item.status)) score += 15
  if (item.current_wait_type) score += 10
  return score
}

export function getWorklineRiskScore(item: RuntimeWorklineSummary): number {
  return item.failed_session_count * 7 + item.offline_device_count * 6 + item.error_device_count * 5 + item.waiting_session_count * 3 + item.active_session_count
}

export function getWorklineRiskTone(item: RuntimeWorklineSummary): RuntimeTone {
  if (item.failed_session_count > 0 || item.offline_device_count > 0 || item.error_device_count > 0) return 'danger'
  if (item.waiting_session_count > 0) return 'warning'
  if (item.active_session_count > 0) return 'primary'
  return 'success'
}

export function getWorklineRiskLabel(item: RuntimeWorklineSummary): string {
  const tone = getWorklineRiskTone(item)
  if (tone === 'danger') return '存在阻塞'
  if (tone === 'warning') return '有等待堆积'
  if (tone === 'primary') return '正在运行'
  return '稳定'
}

export function getDeviceRiskScore(item: RuntimeDeviceSummary): number {
  let score = item.pending_command_count * 3
  if (item.device_status === 'ERROR') score += 80
  if (item.device_status === 'OFFLINE') score += 90
  if (item.maintenance_mode) score += 10
  if (item.error_code) score += 15
  return score
}

export function aggregateSessionsByDevice(sessions: RuntimeTraceListItem[]): Map<number, number> {
  const counts = new Map<number, number>()

  for (const session of sessions) {
    if (session.device_id == null) continue
    counts.set(session.device_id, (counts.get(session.device_id) ?? 0) + 1)
  }

  return counts
}

export function pickDominantValue(values: string[]): string {
  const counts = new Map<string, number>()

  for (const value of values) {
    if (!value) {
      continue
    }

    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let winner = ''
  let max = 0
  counts.forEach((count, value) => {
    if (count > max) {
      winner = value
      max = count
    }
  })

  return winner
}

