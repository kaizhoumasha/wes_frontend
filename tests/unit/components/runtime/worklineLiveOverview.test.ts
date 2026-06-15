import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WorklineLiveOverview from '@/components/runtime/monitor/WorklineLiveOverview.vue'
import type {
  RuntimeWorklineMonitorProjectionResponse,
  RuntimeWorklineSummary
} from '@/types/runtime'

const mocks = vi.hoisted(() => ({
  buildRuntimeSceneModel: vi.fn(),
  loadManifest: vi.fn(),
  manifestRef: { value: null as { plugin_key: string; contract_version: string } | null },
  errorRef: { value: null as unknown }
}))

vi.mock('@/utils/runtime-scene', () => ({
  buildRuntimeSceneModel: mocks.buildRuntimeSceneModel
}))

vi.mock('@/composables/useRuntimeSceneManifest', () => ({
  useRuntimeSceneManifest: () => ({
    manifest: mocks.manifestRef,
    error: mocks.errorRef,
    loadManifest: mocks.loadManifest
  })
}))

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 45,
    line_code: 'WL-45',
    line_name: '粗分线',
    line_type: 'SORTING',
    is_active: true,
    device_count: 1,
    active_session_count: 0,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    runtime_status: 'READY',
    plugin_key: 'rough_sorter',
    ...overrides
  }
}

function createProjection(summary = createSummary()): RuntimeWorklineMonitorProjectionResponse {
  return {
    summary,
    boundary: {
      workline_readiness: 'READY',
      station_lease: 'IDLE',
      single_layer_rack_snapshot: 'ACTIVE',
      rack_operation_wait: 'NONE',
      resource_evidence_kind: 'WES_ACTIVE_SNAPSHOT'
    },
    device_nodes: [],
    active_sessions: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_failed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_completed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    resource_evidence: {
      items: [],
      total_count: 0,
      truncated: false
    },
    action_candidates: {
      pending_reconciliation: null
    },
    generated_at: '2026-06-10T12:00:00Z'
  }
}

function mountOverview() {
  const summary = createSummary()
  return shallowMount(WorklineLiveOverview, {
    props: {
      worklineSummary: summary,
      worklineProjection: createProjection(summary),
      eventLogEntries: []
    },
    global: {
      stubs: {
        ElCard: {
          template: '<div><slot name="header" /><slot /></div>'
        }
      }
    }
  })
}

describe('WorklineLiveOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.manifestRef.value = null
    mocks.buildRuntimeSceneModel.mockReturnValue({
      worklineId: 45,
      worklineName: '粗分线',
      worklineCode: 'WL-45',
      readiness: 'READY',
      readinessLabel: '待机 / 可接收生产事件',
      runtimeStatusLabel: '现场 START 后待机 / 可接收',
      boundaries: [],
      deviceNodes: [],
      resourceEvidence: [],
      positionGroups: [],
      unlocatedAuditItems: [],
      resourceEvidenceTotalCount: 0,
      resourceEvidenceTruncated: false,
      semanticFallback: false,
      semanticFallbackMessage: null
    })
    mocks.errorRef.value = null
  })

  it('handles manifest load failures started by the background watcher', () => {
    const catchSpy = vi.fn(() => Promise.resolve(null))
    mocks.loadManifest.mockReturnValueOnce({ catch: catchSpy })

    mountOverview()

    expect(mocks.loadManifest).toHaveBeenCalledWith('rough_sorter', null)
    expect(catchSpy).toHaveBeenCalled()
  })

  it('does not pass a stale manifest from a previous plugin into the scene model', () => {
    mocks.manifestRef.value = { plugin_key: 'other_plugin', contract_version: 'v1' }
    mocks.loadManifest.mockReturnValueOnce({ catch: vi.fn() })

    mountOverview()

    expect(mocks.buildRuntimeSceneModel).toHaveBeenCalledWith(
      expect.objectContaining({
        manifest: null
      })
    )
  })

  it('fails closed instead of using a manifest with a mismatched contract version', () => {
    const summary = createSummary({ contract_version: 'v2' })
    mocks.manifestRef.value = { plugin_key: 'rough_sorter', contract_version: 'v1' }
    mocks.loadManifest.mockReturnValueOnce({ catch: vi.fn() })

    shallowMount(WorklineLiveOverview, {
      props: {
        worklineSummary: summary,
        worklineProjection: createProjection(summary)
      },
      global: {
        stubs: {
          ElCard: {
            template: '<div><slot name="header" /><slot /></div>'
          }
        }
      }
    })

    expect(mocks.loadManifest).toHaveBeenCalledWith('rough_sorter', 'v2')
    expect(mocks.buildRuntimeSceneModel).toHaveBeenCalledWith(
      expect.objectContaining({
        manifest: null
      })
    )
  })

  it('passes only the matching manifest and forwards manifest failure to scene model fallback', () => {
    const matchingManifest = { plugin_key: 'rough_sorter', contract_version: 'v1' }
    const summary = createSummary({ contract_version: 'v1' })
    mocks.manifestRef.value = matchingManifest
    mocks.errorRef.value = new Error('manifest failed')
    mocks.loadManifest.mockReturnValueOnce({ catch: vi.fn() })

    shallowMount(WorklineLiveOverview, {
      props: {
        worklineSummary: summary,
        worklineProjection: createProjection(summary)
      },
      global: {
        stubs: {
          ElCard: {
            template: '<div><slot name="header" /><slot /></div>'
          }
        }
      }
    })

    expect(mocks.buildRuntimeSceneModel).toHaveBeenCalledWith(
      expect.objectContaining({
        manifest: matchingManifest,
        manifestLoadFailed: true
      })
    )
  })

  it('uses an immediate SSE log console instead of the historical session board in the center pane', () => {
    mocks.loadManifest.mockReturnValueOnce({ catch: vi.fn() })
    const summary = createSummary()

    const wrapper = shallowMount(WorklineLiveOverview, {
      props: {
        worklineSummary: summary,
        worklineProjection: createProjection(summary),
        eventLogEntries: [
          {
            id: 'evt-1',
            time: '15:40:04',
            level: 'err',
            tag: 'ERROR',
            text: 'ECS 设备事件回调：[ST-02] 抛出急停警报 ERR_CONVEYOR_JAM_102'
          }
        ]
      },
      global: {
        stubs: {
          ElCard: {
            template: '<div><slot name="header" /><slot /></div>'
          }
        }
      }
    })

    expect(wrapper.text()).not.toContain('会话面板')
    expect(wrapper.get('[data-test="monitor-event-log-panel"]').text()).toContain(
      'ECS 设备事件回调'
    )
    expect(wrapper.get('[data-test="monitor-event-log-panel"]').text()).toContain('ERROR')
  })
})
