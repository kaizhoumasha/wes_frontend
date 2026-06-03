import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeTraceListItem, TraceDetailResponse } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  return {
    route: {
      query: {
        traceId: 'trace-1'
      } as Record<string, unknown>
    },
    router: {
      replace: vi.fn()
    },
    traceByTraceIdSend: vi.fn(),
    traceBlockingPointSend: vi.fn(),
    tracePathSend: vi.fn(),
    worklineDetailSend: vi.fn(),
    queryTracesSend: vi.fn(),
    sseStore: {
      live: true,
      state: 'connected',
      connectionLabel: 'SSE Connected',
      connectionTone: 'success',
      lastEvent: null,
      lastRefreshedAt: null,
      markRefreshedAt: vi.fn(),
      toggleLive: vi.fn()
    }
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => mocks.sseStore
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    traceByTraceId: () => ({ send: mocks.traceByTraceIdSend }),
    traceBlockingPoint: () => ({ send: mocks.traceBlockingPointSend }),
    tracePath: () => ({ send: mocks.tracePathSend }),
    worklineDetail: () => ({ send: mocks.worklineDetailSend }),
    queryTraces: vi.fn(() => ({ send: mocks.queryTracesSend }))
  }
}))

function createTraceDetail(): TraceDetailResponse {
  return {
    trace: {
      trace_id: 'trace-1',
      session_id: 1,
      workline_id: 10,
      device_id: 20,
      device_code: 'DV-20'
    },
    summary: {
      callback_logs: 0,
      inboxes: 0,
      commands: 0,
      outboxes: 0,
      timelines: 1,
      diagnostics: 0,
      session_status: 'COMPLETED',
      latest_timeline_action: 'SESSION_COMPLETED',
      latest_timeline_status: 'SUCCESS'
    },
    session: {
      id: 1,
      session_code: 'S-1',
      workline_id: 10,
      plugin_key: 'rough_sorter',
      run_mode: 'MOCK',
      status: 'COMPLETED',
      trace_id: 'trace-1',
      ingress_count: 1,
      context_json: {}
    },
    sessions: [],
    callback_logs: [],
    inboxes: [],
    commands: [],
    outboxes: [],
    dispatch_attempts: [],
    timelines: [
      {
        id: 1,
        session_id: 1,
        workline_id: 10,
        trace_id: 'trace-1',
        seq_no: 1,
        occurred_at: '2026-06-03T01:00:00Z',
        stage: 'COMPLETE',
        action_type: 'SESSION_COMPLETED',
        actor_type: 'ORCHESTRATOR',
        status: 'SUCCESS'
      }
    ],
    diagnostics: []
  }
}

function createTraceListItem(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 2,
    session_code: 'S-2',
    trace_id: 'trace-2',
    request_id: 'req-2',
    workline_id: 10,
    workline_name: '工作线 10',
    workline_code: 'WL-10',
    device_id: 20,
    device_name: '设备 20',
    device_code: 'DV-20',
    command_code: 'PICK',
    status: 'RUNNING',
    current_wait_type: null,
    failure_domain: null,
    started_at: '2026-06-03T01:00:00Z',
    last_ingress_at: '2026-06-03T01:01:00Z',
    deadline_at: null,
    is_timed_out: false,
    ...overrides
  }
}

async function flushViewUpdates() {
  await flushPromises()
  await Promise.resolve()
}

async function mountPage() {
  const { default: TraceExplorerPage } =
    await import('@/views/runtime/traces/TraceExplorerPage.vue')

  return shallowMount(TraceExplorerPage, {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        RuntimeEmptyState: true,
        RuntimeFrozenNotice: true,
        RuntimeLastUpdated: true,
        RuntimeStatusBadge: true,
        RuntimeStickyContextBar: true,
        TraceBlockingPointCard: true,
        TraceContrastPanel: true,
        TraceNextActions: true,
        TraceRelatedSidebar: true,
        TraceTimeline: true,
        TraceTopologySummary: true,
        RuntimeTraceList: true,
        'el-button': true,
        'el-card': { template: '<section><slot /></section>' },
        'el-input': true,
        'el-option': true,
        'el-select': true,
        'el-switch': true,
        'el-tab-pane': { template: '<section><slot /></section>' },
        'el-table': true,
        'el-table-column': true,
        'el-tabs': { template: '<section><slot /></section>' }
      }
    }
  })
}

describe('TraceExplorerPage layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = { traceId: 'trace-1' }
    mocks.traceByTraceIdSend.mockResolvedValue(createTraceDetail())
    mocks.traceBlockingPointSend.mockRejectedValue(new Error('no blocking point'))
    mocks.queryTracesSend.mockResolvedValue({ total: 1, items: [createTraceListItem()] })
    mocks.tracePathSend.mockResolvedValue({
      workline_id: 10,
      session_id: 1,
      trace_id: 'trace-1',
      devices: [],
      timeline_groups: []
    })
    mocks.worklineDetailSend.mockResolvedValue({
      summary: {
        id: 10,
        line_code: 'WL-10',
        line_name: '工作线 10',
        line_type: 'SORTING',
        is_active: true,
        device_count: 0,
        active_session_count: 0,
        waiting_session_count: 0,
        failed_session_count: 0,
        error_device_count: 0,
        offline_device_count: 0,
        maintenance_device_count: 0,
        run_mode: 'MOCK'
      },
      devices: [],
      active_sessions: [],
      recent_failed_traces: [],
      recent_completed_traces: []
    })
  })

  it('keeps trace detail focused on the current trace instead of related cases', async () => {
    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(wrapper.findComponent({ name: 'TraceTopologySummary' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TraceRelatedSidebar' }).exists()).toBe(false)
  })

  it('shows active sessions and traces when no trace anchor is selected', async () => {
    mocks.route.query = {}

    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(mocks.queryTracesSend).toHaveBeenCalled()
    expect(wrapper.findComponent({ name: 'RuntimeTraceList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TraceTopologySummary' }).exists()).toBe(false)
  })
})
