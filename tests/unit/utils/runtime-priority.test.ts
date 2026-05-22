import { describe, expect, it } from 'vitest'
import { classifyToTiers, computeVerdictSummary, type PriorityItem } from '@/utils/runtime-priority'
import type {
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeTraceListItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

function createWorkline(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 101,
    line_code: 'WL-101',
    line_name: 'Workline 101',
    line_type: 'main',
    zone_name: 'Zone A',
    plugin_key: 'plugin-a',
    contract_version: 'v1',
    is_active: true,
    device_count: 4,
    active_session_count: 2,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    last_activity_at: '2026-04-27T01:00:00Z',
    ...overrides
  }
}

function createDevice(overrides: Partial<RuntimeDeviceSummary> = {}): RuntimeDeviceSummary {
  return {
    id: 201,
    device_code: 'DV-201',
    device_name: 'Scanner 201',
    device_role: 'scanner',
    role_index: 1,
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_status: 'ONLINE',
    maintenance_mode: false,
    current_command_id: null,
    pending_command_count: 0,
    last_heartbeat_at: '2026-04-27T01:00:00Z',
    recent_callback_at: '2026-04-27T01:00:00Z',
    error_code: null,
    ...overrides
  }
}

function createTrace(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 301,
    session_code: 'S-301',
    trace_id: 'trace-301',
    request_id: 'req-301',
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_id: 201,
    device_name: 'Scanner 201',
    device_code: 'DV-201',
    command_code: 'SCAN',
    status: 'FAILED',
    plugin_state: 'SCAN',
    current_wait_type: null,
    failure_domain: 'DEVICE',
    failure_code: 'DEVICE_TIMEOUT',
    started_at: '2026-04-27T01:00:00Z',
    last_ingress_at: '2026-04-27T01:01:00Z',
    deadline_at: null,
    is_timed_out: false,
    ...overrides
  }
}

function createOverview(overrides: Partial<RuntimeOverviewResponse> = {}): RuntimeOverviewResponse {
  return {
    stats: [
      { key: 'running_sessions', label: '运行中', value: 7, status: 'primary' },
      { key: 'inbox_backlog', label: 'Inbox', value: 0, status: 'success' },
      { key: 'outbox_backlog', label: 'Outbox', value: 0, status: 'success' }
    ],
    recent_active_traces: [],
    recent_failed_traces: [],
    hot_worklines: [],
    abnormal_devices: [],
    device_health: {
      total: 12,
      abnormal: 0,
      maintenance: 0,
      loaded: 12,
      healthy: 12
    },
    ...overrides
  }
}

describe('runtime-priority', () => {
  it('classifies critical worklines, devices, repeated traces, known ended traces, and backlog', () => {
    const repeatedTraces = [
      createTrace({ session_id: 301, trace_id: 'trace-a' }),
      createTrace({ session_id: 302, trace_id: 'trace-b' }),
      createTrace({ session_id: 303, trace_id: 'trace-c' })
    ]
    const items = classifyToTiers(
      createOverview({
        stats: [
          { key: 'running_sessions', label: '运行中', value: 7, status: 'primary' },
          { key: 'inbox_backlog', label: 'Inbox', value: 30, status: 'warning' },
          { key: 'outbox_backlog', label: 'Outbox', value: 25, status: 'warning' }
        ],
        hot_worklines: [
          createWorkline({
            failed_session_count: 2,
            offline_device_count: 1,
            error_device_count: 1
          }),
          createWorkline({ id: 102, line_code: 'WL-102', waiting_session_count: 5 })
        ],
        abnormal_devices: [
          createDevice({ device_status: 'OFFLINE' }),
          createDevice({ id: 202, device_status: 'ONLINE', maintenance_mode: true })
        ],
        recent_failed_traces: [
          ...repeatedTraces,
          createTrace({ session_id: 401, status: 'ENDED', trace_id: null, device_id: 999 })
        ]
      })
    )

    expect(items.map(item => item.tier)).toEqual([
      'critical',
      'critical',
      'critical',
      'watch',
      'watch',
      'known',
      'known'
    ])
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tier: 'critical',
          entity: 'device',
          id: 201,
          navigateTo: {
            name: 'RuntimeMonitor',
            query: expect.objectContaining({ worklineId: '101', deviceId: '201' })
          }
        }),
        expect.objectContaining({
          tier: 'watch',
          entity: 'trace',
          id: 'repeat-201-SCAN',
          navigateTo: {
            name: 'RuntimeTraces',
            query: expect.objectContaining({ traceId: 'trace-a', worklineId: '101', mode: 'trace' })
          }
        }),
        expect.objectContaining({
          tier: 'critical',
          entity: 'backlog',
          id: 'system-backlog',
          score: 27.5
        })
      ])
    )
  })

  it('summarizes verdict counts from priority tiers and overview totals', () => {
    const items: PriorityItem[] = [
      {
        tier: 'critical',
        entity: 'backlog',
        id: 'backlog',
        summary: '',
        context: '',
        navigateTo: { name: 'RuntimeMonitor', query: {} },
        score: 1
      },
      {
        tier: 'watch',
        entity: 'trace',
        id: 'trace',
        summary: '',
        context: '',
        navigateTo: { name: 'RuntimeTraces', query: {} },
        score: 1
      },
      {
        tier: 'known',
        entity: 'device',
        id: 'device',
        summary: '',
        context: '',
        navigateTo: { name: 'RuntimeMonitor', query: {} },
        score: 1
      }
    ]
    const overview = createOverview({
      stats: [{ key: 'running_sessions', label: '运行中', value: 9, status: 'primary' }],
      device_health: { total: 14, abnormal: 2, maintenance: 1, loaded: 14, healthy: 11 }
    })

    expect(
      computeVerdictSummary(items, overview, [
        createWorkline({ active_session_count: 2, waiting_session_count: 3 }),
        createWorkline({ id: 102, active_session_count: 4, waiting_session_count: 1 })
      ])
    ).toEqual({
      critical: 1,
      watch: 1,
      known: 1,
      totalSessions: 10,
      totalDevices: 14,
      runningSessions: 9
    })
  })
})
