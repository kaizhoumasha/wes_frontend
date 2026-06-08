import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WorklineLiveOverview from '@/components/runtime/monitor/WorklineLiveOverview.vue'
import type { RuntimeWorklineDetailResponse, RuntimeWorklineSummary } from '@/types/runtime'

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

function createDetail(summary = createSummary()): RuntimeWorklineDetailResponse {
  return {
    summary,
    workline_readiness: 'READY',
    station_lease: 'IDLE',
    single_layer_rack_snapshot: 'ACTIVE',
    rack_operation_wait: 'NONE',
    resource_evidence_kind: 'WES_ACTIVE_SNAPSHOT',
    resource_evidence_items: [],
    resource_evidence_total_count: 0,
    resource_evidence_truncated: false,
    devices: [],
    active_sessions: [],
    recent_failed_traces: [],
    recent_completed_traces: []
  }
}

function mountOverview() {
  const summary = createSummary()
  return shallowMount(WorklineLiveOverview, {
    props: {
      worklineSummary: summary,
      worklineDetail: createDetail(summary),
      devices: [],
      activeSessions: [],
      recentFailedTraces: [],
      recentCompletedTraces: []
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
        worklineDetail: createDetail(summary),
        devices: [],
        activeSessions: [],
        recentFailedTraces: [],
        recentCompletedTraces: []
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
        worklineDetail: createDetail(summary),
        devices: [],
        activeSessions: [],
        recentFailedTraces: [],
        recentCompletedTraces: []
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
})
