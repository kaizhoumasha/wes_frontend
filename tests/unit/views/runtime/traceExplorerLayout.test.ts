import { nextTick } from 'vue'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DiagnosisVerdict, RuntimeTraceListItem, TraceDetailResponse } from '@/types/runtime'

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
    traceBlockingPointMethod: vi.fn(),
    traceBlockingPointSend: vi.fn(),
    sessionPathSend: vi.fn(),
    tracePathSend: vi.fn(),
    worklineProjectionSend: vi.fn(),
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
    traceBlockingPoint: mocks.traceBlockingPointMethod,
    sessionPath: () => ({ send: mocks.sessionPathSend }),
    tracePath: () => ({ send: mocks.tracePathSend }),
    worklineProjection: () => ({ send: mocks.worklineProjectionSend }),
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
    sessions: [
      {
        id: 1,
        session_code: 'S-1',
        workline_id: 10,
        plugin_key: 'rough_sorter',
        run_mode: 'MOCK',
        status: 'COMPLETED',
        trace_id: 'trace-1',
        ingress_count: 1,
        context_json: {}
      }
    ],
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
    diagnostics: [],
    diagnosis_verdict: createDiagnosisVerdict({})
  }
}

function createDiagnosisVerdict(overrides: Partial<DiagnosisVerdict>): DiagnosisVerdict {
  return {
    state: 'completed_clear',
    severity: 'success',
    title: '流程已完成',
    summary: '当前案件已正常结束，未发现阻塞点。',
    requires_operator_action: false,
    primary_action: '无需现场处置',
    blocking_point: 'none',
    owner: null,
    evidence_health: {
      level: 'complete',
      summary: '证据完整',
      missing: [],
      items: [
        {
          key: 'session',
          label: 'Session',
          count: 1,
          state: 'present',
          hint: '主证据'
        }
      ]
    },
    ...overrides
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
  const { default: CaseConsolePage } = await import('@/views/runtime/cases/CaseConsolePage.vue')

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
    mocks.router.replace.mockImplementation(
      async ({ query }: { query: Record<string, unknown> }) => {
        mocks.route.query = { ...query }
        await nextTick()
      }
    )
    mocks.traceByTraceIdSend.mockResolvedValue(createTraceDetail())
    mocks.traceBySessionIdSend.mockResolvedValue(createTraceDetail())
    mocks.traceBlockingPointMethod.mockImplementation(() => ({ send: mocks.traceBlockingPointSend }))
    mocks.traceBlockingPointSend.mockRejectedValue(new Error('no blocking point'))
    mocks.queryTracesMethod.mockImplementation(() => ({ send: mocks.queryTracesSend }))
    mocks.queryTracesSend.mockResolvedValue({ total: 1, items: [createTraceListItem()] })
    mocks.sessionPathSend.mockResolvedValue({
      workline_id: 10,
      session_id: 1,
      trace_id: 'trace-1',
      diagnosis_verdict: createDiagnosisVerdict({}),
      sessions: [],
      resource_view: {
        active_bin_racks: []
      },
      devices: [],
      timeline_groups: []
    })
    mocks.tracePathSend.mockResolvedValue({
      workline_id: 10,
      session_id: 1,
      trace_id: 'trace-1',
      diagnosis_verdict: createDiagnosisVerdict({}),
      sessions: [],
      resource_view: {
        active_bin_racks: []
      },
      devices: [],
      timeline_groups: []
    })
    mocks.worklineProjectionSend.mockResolvedValue({
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

  it(
    'loads a case directly by session id as the primary route anchor',
    async () => {
      mocks.route.query = { sessionId: '1' }

      const wrapper = await mountPage()
      await flushViewUpdates()

      expect(mocks.traceBySessionIdSend).toHaveBeenCalled()
      expect(mocks.traceByTraceIdSend).not.toHaveBeenCalled()
      expect(mocks.sessionPathSend).toHaveBeenCalled()
      expect(mocks.tracePathSend).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('运行案件处置台')
    },
    10_000
  )

  it('uses session path when detail has a session but no trace id', async () => {
    mocks.route.query = { sessionId: '1' }
    mocks.traceBySessionIdSend.mockResolvedValue({
      ...createTraceDetail(),
      trace: {
        ...createTraceDetail().trace,
        trace_id: null
      },
      sessions: [
        {
          ...createTraceDetail().sessions[0],
          trace_id: null
        }
      ]
    })

    await mountPage()
    await flushViewUpdates()

    expect(mocks.sessionPathSend).toHaveBeenCalled()
    expect(mocks.tracePathSend).not.toHaveBeenCalled()
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
    expect(mocks.sessionPathSend).toHaveBeenCalled()
    expect(mocks.tracePathSend).not.toHaveBeenCalled()
    expect(mocks.worklineProjectionSend).toHaveBeenCalled()
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

  it('skips blocking-point endpoint for completed clear verdicts', async () => {
    mocks.traceByTraceIdSend.mockResolvedValue({
      ...createTraceDetail(),
      diagnosis_verdict: createDiagnosisVerdict({
        state: 'completed_clear',
        requires_operator_action: false
      })
    })

    await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBlockingPointSend).not.toHaveBeenCalled()
    expect(mocks.sessionPathSend).toHaveBeenCalled()
    expect(mocks.tracePathSend).not.toHaveBeenCalled()
  })

  it('skips blocking-point endpoint for non-actionable running verdicts', async () => {
    mocks.traceByTraceIdSend.mockResolvedValue({
      ...createTraceDetail(),
      summary: {
        ...createTraceDetail().summary,
        session_status: 'RUNNING',
        latest_timeline_action: 'COMMAND_SENT',
        latest_timeline_status: 'SENT'
      },
      sessions: [
        {
          ...createTraceDetail().sessions[0],
          status: 'RUNNING'
        }
      ],
      diagnosis_verdict: createDiagnosisVerdict({
        state: 'running',
        severity: 'info',
        title: '流程运行中',
        summary: '当前流程正常推进。',
        requires_operator_action: false,
        primary_action: '继续观察',
        blocking_point: 'none'
      })
    })

    await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBlockingPointSend).not.toHaveBeenCalled()
  })

  it('fetches blocking-point endpoint for blocked verdicts', async () => {
    const blockedVerdict = createDiagnosisVerdict({
      state: 'blocked',
      severity: 'danger',
      title: '流程已阻塞',
      summary: '存在明确阻塞点。',
      requires_operator_action: true,
      primary_action: '处理阻塞点',
      blocking_point: 'command',
      owner: 'device'
    })
    const completedVerdict = createDiagnosisVerdict({
      state: 'completed_clear',
      requires_operator_action: false
    })
    mocks.sessionPathSend.mockResolvedValueOnce({
      workline_id: 10,
      session_id: 1,
      trace_id: 'trace-1',
      diagnosis_verdict: blockedVerdict,
      sessions: [],
      resource_view: {
        active_bin_racks: []
      },
      devices: [],
      timeline_groups: []
    })
    mocks.traceByTraceIdSend.mockResolvedValue({
      ...createTraceDetail(),
      diagnosis_verdict: completedVerdict
    })

    const wrapper = await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBlockingPointSend).toHaveBeenCalled()
    expect(
      wrapper.findComponent({ name: 'TraceBlockingPointCard' }).props('diagnosisVerdict')
    ).toStrictEqual(blockedVerdict)
  })

  it('uses path trace id when fetching blocking-point for session-only detail', async () => {
    const blockedVerdict = createDiagnosisVerdict({
      state: 'blocked',
      severity: 'danger',
      title: '流程已阻塞',
      summary: 'Path 返回了阻塞点。',
      requires_operator_action: true,
      primary_action: '处理阻塞点',
      blocking_point: 'command',
      owner: 'device'
    })
    mocks.route.query = { sessionId: '1' }
    mocks.traceBySessionIdSend.mockResolvedValue({
      ...createTraceDetail(),
      trace: {
        ...createTraceDetail().trace,
        trace_id: null
      },
      sessions: [
        {
          ...createTraceDetail().sessions[0],
          trace_id: null
        }
      ]
    })
    mocks.sessionPathSend.mockResolvedValueOnce({
      workline_id: 10,
      session_id: 1,
      trace_id: 'trace-from-path',
      diagnosis_verdict: blockedVerdict,
      sessions: [],
      resource_view: {
        active_bin_racks: []
      },
      devices: [],
      timeline_groups: []
    })

    await mountPage()
    await flushViewUpdates()

    expect(mocks.traceBlockingPointMethod).toHaveBeenCalledWith('trace-from-path')
    expect(mocks.traceBlockingPointSend).toHaveBeenCalledTimes(1)
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
