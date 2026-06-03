import { nextTick } from 'vue'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeTraceListItem, TraceDetailResponse } from '@/types/runtime'

enableAutoUnmount(afterEach)

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
    traceBySessionIdSend: vi.fn(),
    traceBlockingPointSend: vi.fn(),
    tracePathSend: vi.fn(),
    worklineDetailSend: vi.fn(),
    queryTracesMethod: vi.fn(),
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

vi.mock('vue-router', async () => {
  const { reactive } = await vi.importActual<typeof import('vue')>('vue')
  mocks.route = reactive(mocks.route)

  return {
    useRoute: () => mocks.route,
    useRouter: () => mocks.router
  }
})

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => mocks.sseStore
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    traceByTraceId: () => ({ send: mocks.traceByTraceIdSend }),
    traceBySessionId: () => ({ send: mocks.traceBySessionIdSend }),
    traceBlockingPoint: () => ({ send: mocks.traceBlockingPointSend }),
    tracePath: () => ({ send: mocks.tracePathSend }),
    worklineDetail: () => ({ send: mocks.worklineDetailSend }),
    queryTraces: mocks.queryTracesMethod
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
  const { default: CaseConsolePage } =
    await import('@/views/runtime/cases/CaseConsolePage.vue')

  return shallowMount(CaseConsolePage, {
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
        RuntimeCaseQueue: true,
        'el-button': true,
        'el-card': { template: '<section><slot name="header" /><slot /></section>' },
        'el-input': {
          name: 'ElInput',
          props: ['modelValue'],
          template: '<input data-test="case-anchor-input" :value="modelValue" />'
        },
        'el-option': true,
        'el-select': {
          name: 'ElSelect',
          props: ['modelValue'],
          template: '<select data-test="case-anchor-type" :value="modelValue"><slot /></select>'
        },
        'el-switch': true,
        'el-tab-pane': { template: '<section><slot /></section>' },
        'el-table': true,
        'el-table-column': true,
        'el-tabs': { template: '<section><slot /></section>' }
      }
    }
  })
}

describe('CaseConsolePage layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = { traceId: 'trace-1' }
    mocks.router.replace.mockImplementation(async ({ query }: { query: Record<string, unknown> }) => {
      mocks.route.query = { ...query }
      await nextTick()
    })
    mocks.traceByTraceIdSend.mockResolvedValue(createTraceDetail())
    mocks.traceBySessionIdSend.mockResolvedValue(createTraceDetail())
    mocks.traceBlockingPointSend.mockRejectedValue(new Error('no blocking point'))
    mocks.queryTracesMethod.mockImplementation(() => ({ send: mocks.queryTracesSend }))
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

  it('loads a case directly by session id as the primary route anchor', async () => {
    mocks.route.query = { sessionId: '1' }

    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBySessionIdSend).toHaveBeenCalled()
    expect(mocks.traceByTraceIdSend).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('运行案件处置台')
  })

  it('normalizes trace deep links to the loaded session id', async () => {
    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(mocks.traceByTraceIdSend).toHaveBeenCalled()
    expect(mocks.router.replace).toHaveBeenCalledWith({
      query: {
        sessionId: '1',
        traceId: undefined,
        requestId: undefined,
        commandCode: undefined,
        dispatchKey: undefined,
        barcode: undefined
      }
    })
    expect(mocks.tracePathSend).toHaveBeenCalled()
    expect(mocks.worklineDetailSend).toHaveBeenCalled()
    expect(wrapper.findComponent({ name: 'ElSelect' }).props('modelValue')).toBe('session')
    expect(wrapper.findComponent({ name: 'ElInput' }).props('modelValue')).toBe('1')
    expect(wrapper.text()).toContain('运行案件处置台')
  })

  it('prefers session id when a route contains both session and trace anchors', async () => {
    mocks.route.query = { traceId: 'trace-other', sessionId: '1' }

    await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBySessionIdSend).toHaveBeenCalled()
    expect(mocks.traceByTraceIdSend).not.toHaveBeenCalled()
  })

  it('prefers session id when next actions include both session and trace anchors', async () => {
    const wrapper = await mountPage()
    await flushViewUpdates()

    await wrapper.findComponent({ name: 'TraceNextActions' }).vm.$emit('open-trace', {
      sessionId: 1,
      traceId: 'trace-other',
      worklineId: 10,
      deviceId: 20
    })
    await flushViewUpdates()

    expect(mocks.router.replace).toHaveBeenLastCalledWith({
      query: {
        sessionId: '1',
        traceId: undefined,
        requestId: undefined,
        commandCode: undefined,
        dispatchKey: undefined,
        barcode: undefined,
        deviceId: '20',
        worklineId: '10'
      }
    })
  })

  it('prefers session lookup for barcode search results that also include a trace id', async () => {
    mocks.route.query = { barcode: 'PKG-001' }
    mocks.queryTracesSend.mockResolvedValue({
      total: 1,
      items: [createTraceListItem({ session_id: 2, trace_id: 'trace-2' })]
    })

    await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBySessionIdSend).toHaveBeenCalled()
    expect(mocks.traceByTraceIdSend).not.toHaveBeenCalled()
  })

  it('keeps case detail focused on the current case instead of related cases', async () => {
    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(wrapper.findComponent({ name: 'TraceTopologySummary' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TraceRelatedSidebar' }).exists()).toBe(false)
  })

  it('shows active cases when no case anchor is selected', async () => {
    mocks.route.query = { worklineId: '10', deviceId: '20' }

    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(mocks.queryTracesMethod).toHaveBeenCalledWith({
      only_active: true,
      limit: 30,
      offset: 0,
      workline_id: 10,
      device_id: 20
    })
    expect(wrapper.text()).toContain('当前活动案件')
    expect(wrapper.text()).not.toContain('当前活动 SESSION / TRACE')
    expect(wrapper.text()).not.toContain('Trace 处置台')
    expect(wrapper.findComponent({ name: 'RuntimeCaseQueue' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TraceTopologySummary' }).exists()).toBe(false)
  })
})
