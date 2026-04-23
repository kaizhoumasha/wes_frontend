import type {
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeWorklineSummary
} from '@/types/runtime'
import {
  buildRuntimeTraceQuery,
  buildRuntimeWorklineQuery
} from '@/utils/runtime-route'

export type ActionTier = 'critical' | 'watch' | 'known'

export interface PriorityItem {
  tier: ActionTier
  entity: 'workline' | 'device' | 'trace' | 'backlog'
  id: number | string
  summary: string
  context: string
  navigateTo: { name: string; query: Record<string, string | undefined> }
  score: number
}

const THRESHOLDS = {
  BACKLOG_CRITICAL: 50,
  WAITING_SESSION_WATCH: 5,
  REPEAT_FAILURE_MIN: 3
} as const

function statValue(stats: RuntimeOverviewResponse['stats'], key: string): number {
  return stats.find(s => s.key === key)?.value ?? 0
}

function classifyWorklines(
  worklines: RuntimeWorklineSummary[],
  items: PriorityItem[]
): void {
  for (const wl of worklines) {
    if (wl.failed_session_count > 0 || wl.offline_device_count > 0) {
      const score =
        wl.failed_session_count * 10 +
        wl.offline_device_count * 8 +
        wl.error_device_count * 6
      items.push({
        tier: 'critical',
        entity: 'workline',
        id: wl.id,
        summary: `${wl.line_name} — ${wl.failed_session_count} 失败 / ${wl.offline_device_count} 离线设备`,
        context: `${wl.line_code} · ${wl.zone_name || '未配置区域'}`,
        navigateTo: { name: 'RuntimeWorklines', query: buildRuntimeWorklineQuery(wl.id) },
        score
      })
    } else if (wl.waiting_session_count >= THRESHOLDS.WAITING_SESSION_WATCH) {
      items.push({
        tier: 'watch',
        entity: 'workline',
        id: wl.id,
        summary: `${wl.line_name} — 等待堆积 ${wl.waiting_session_count}`,
        context: `${wl.line_code} · 活跃 ${wl.active_session_count}`,
        navigateTo: { name: 'RuntimeWorklines', query: buildRuntimeWorklineQuery(wl.id) },
        score: wl.waiting_session_count * 2
      })
    }
  }
}

function classifyDevices(
  devices: RuntimeDeviceSummary[],
  items: PriorityItem[]
): void {
  for (const dev of devices) {
    if (dev.device_status === 'ERROR' || dev.device_status === 'OFFLINE') {
      items.push({
        tier: 'critical',
        entity: 'device',
        id: dev.id,
        summary: `${dev.device_name} — ${dev.device_status}`,
        context: `${dev.device_code} · ${dev.workline_name || '未关联工作线'}`,
        navigateTo: {
          name: 'RuntimeWorklines',
          query: buildRuntimeWorklineQuery(dev.workline_id, dev.id)
        },
        score: dev.device_status === 'OFFLINE' ? 90 : 80
      })
    } else if (dev.maintenance_mode) {
      items.push({
        tier: 'known',
        entity: 'device',
        id: dev.id,
        summary: `${dev.device_name} — 维护中`,
        context: `${dev.device_code}`,
        navigateTo: {
          name: 'RuntimeWorklines',
          query: buildRuntimeWorklineQuery(dev.workline_id, dev.id)
        },
        score: 10
      })
    }
  }
}

function classifyTraces(
  traces: RuntimeOverviewResponse['recent_failed_traces'],
  items: PriorityItem[]
): void {
  const failureCounts = new Map<string, number>()

  for (const trace of traces) {
    const dedupeKey = `${trace.device_id ?? 'none'}-${trace.step_code ?? 'none'}`
    failureCounts.set(dedupeKey, (failureCounts.get(dedupeKey) ?? 0) + 1)
  }

  for (const trace of traces) {
    const dedupeKey = `${trace.device_id ?? 'none'}-${trace.step_code ?? 'none'}`
    const repeatCount = failureCounts.get(dedupeKey) ?? 1

    if (repeatCount >= THRESHOLDS.REPEAT_FAILURE_MIN) {
      const existing = items.find(
        i => i.entity === 'trace' && i.id === `repeat-${dedupeKey}`
      )
      if (!existing) {
        items.push({
          tier: 'watch',
          entity: 'trace',
          id: `repeat-${dedupeKey}`,
          summary: `重复失败 (${repeatCount} 次) — ${trace.step_code || '未知步骤'}`,
          context: `${trace.device_name || '未关联设备'} · ${trace.workline_name || ''}`,
          navigateTo: {
            name: 'RuntimeTraceExplorer',
            query: buildRuntimeTraceQuery({
              sessionId: trace.session_id,
              worklineId: trace.workline_id
            })
          },
          score: repeatCount * 5
        })
      }
    } else if (trace.status === 'ENDED' || trace.status === 'COMPLETED') {
      items.push({
        tier: 'known',
        entity: 'trace',
        id: `ended-${trace.session_id}`,
        summary: `${trace.session_code} — 已结束`,
        context: `${trace.workline_name || ''} · ${trace.device_name || ''}`,
        navigateTo: {
          name: 'RuntimeTraceExplorer',
          query: buildRuntimeTraceQuery({ sessionId: trace.session_id })
        },
        score: 5
      })
    }
  }
}

function classifyBacklog(
  stats: RuntimeOverviewResponse['stats'],
  items: PriorityItem[]
): void {
  const backlog = statValue(stats, 'inbox_backlog') + statValue(stats, 'outbox_backlog')
  if (backlog >= THRESHOLDS.BACKLOG_CRITICAL) {
    items.push({
      tier: 'critical',
      entity: 'backlog',
      id: 'system-backlog',
      summary: `系统积压 ${backlog} — 超过阈值`,
      context: `inbox ${statValue(stats, 'inbox_backlog')} / outbox ${statValue(stats, 'outbox_backlog')}`,
      navigateTo: { name: 'RuntimeDashboard', query: {} },
      score: backlog * 0.5
    })
  }
}

export function classifyToTiers(overview: RuntimeOverviewResponse): PriorityItem[] {
  const items: PriorityItem[] = []

  classifyWorklines(overview.hot_worklines, items)
  classifyDevices(overview.abnormal_devices, items)
  classifyTraces(overview.recent_failed_traces, items)
  classifyBacklog(overview.stats, items)

  return items.sort((a, b) => {
    const tierOrder: Record<ActionTier, number> = { critical: 0, watch: 1, known: 2 }
    const tierDelta = tierOrder[a.tier] - tierOrder[b.tier]
    if (tierDelta !== 0) return tierDelta
    return b.score - a.score
  })
}

export interface VerdictSummary {
  critical: number
  watch: number
  known: number
  totalSessions: number
  totalDevices: number
  runningSessions: number
}

export function computeVerdictSummary(
  overview: RuntimeOverviewResponse,
  worklines: RuntimeWorklineSummary[]
): VerdictSummary {
  const items = classifyToTiers(overview)
  return {
    critical: items.filter(i => i.tier === 'critical').length,
    watch: items.filter(i => i.tier === 'watch').length,
    known: items.filter(i => i.tier === 'known').length,
    totalSessions: worklines.reduce((sum, wl) => sum + wl.active_session_count + wl.waiting_session_count, 0),
    totalDevices: overview.device_health.total,
    runningSessions: statValue(overview.stats, 'running_sessions')
  }
}
