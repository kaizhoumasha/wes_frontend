import { defineComponent, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransportDiagnosticsPage from '@/views/ops/transport-diagnostics/TransportDiagnosticsPage.vue'

const diagnosticsMocks = vi.hoisted(() => ({
  loadRecent: vi.fn().mockResolvedValue(undefined),
  loadMore: vi.fn().mockResolvedValue(undefined),
  selectTask: vi.fn().mockResolvedValue(undefined),
  handleStreamTask: vi.fn().mockResolvedValue(undefined),
  submitTask: vi.fn().mockResolvedValue(undefined),
  setFilters: vi.fn()
}))
const streamMocks = vi.hoisted(() => ({ connect: vi.fn(), reconnect: vi.fn(), disconnect: vi.fn() }))
const streamOptions = vi.hoisted(() => ({
  value: null as null | {
    onEvent: (event: { payload: { transport_task_id: string | null } }) => void
    onReconnect: () => void
  }
}))

vi.mock('@/views/ops/transport-diagnostics/useTransportDiagnostics', () => ({
  useTransportDiagnostics: () => ({
    tasks: ref([]),
    detail: ref(null),
    selectedTaskId: ref(null),
    nextCursor: ref(null),
    loading: ref(false),
    loadingDetail: ref(false),
    submitting: ref(false),
    lastError: ref(null),
    ...diagnosticsMocks
  })
}))

vi.mock('@/views/ops/transport-diagnostics/useTransportEvidenceStream', () => ({
  useTransportEvidenceStream: (options: NonNullable<typeof streamOptions.value>) => {
    streamOptions.value = options
    return {
      connectionState: ref('CONNECTED'),
      lastError: ref(null),
      hasGap: ref(false),
      ...streamMocks
    }
  }
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true })
}))

const AppButtonStub = defineComponent({
  name: 'AppButton',
  emits: ['click'],
  template: '<button @click="$emit(\'click\', $event)"><slot /></button>'
})

describe('TransportDiagnosticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    streamOptions.value = null
  })

  it('loads durable tasks, connects live notifications and refreshes the related task', async () => {
    shallowMount(TransportDiagnosticsPage, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          AppButton: AppButtonStub,
          TransportTaskTable: true,
          TransportTaskDetail: true,
          TransportDebugTaskDialog: true,
          ElAlert: true,
          ElInput: true,
          ElSelect: true,
          ElOption: true,
          ElTag: true
        }
      }
    })

    expect(diagnosticsMocks.loadRecent).toHaveBeenCalledOnce()
    expect(streamMocks.connect).toHaveBeenCalledOnce()
    streamOptions.value?.onEvent({ payload: { transport_task_id: 'transport-1' } })
    await vi.waitFor(() =>
      expect(diagnosticsMocks.handleStreamTask).toHaveBeenCalledWith('transport-1')
    )
    streamOptions.value?.onReconnect()
    await vi.waitFor(() => expect(diagnosticsMocks.loadRecent).toHaveBeenCalledTimes(2))
  })

  it('maps explicit list filters without starting polling', async () => {
    vi.useFakeTimers()
    const wrapper = shallowMount(TransportDiagnosticsPage, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          AppButton: AppButtonStub,
          TransportTaskTable: true,
          TransportTaskDetail: true,
          TransportDebugTaskDialog: true,
          ElAlert: true,
          ElInput: true,
          ElSelect: true,
          ElOption: true,
          ElTag: true
        }
      }
    })
    const exposed = wrapper.vm as unknown as {
      filterForm: { kind: string; status: string }
      applyFilters: () => Promise<void>
    }
    Object.assign(exposed.filterForm, { kind: 'BIN_MOVE', status: 'FAILED' })
    await exposed.applyFilters()

    expect(diagnosticsMocks.setFilters).toHaveBeenCalledWith({ kind: 'BIN_MOVE', status: 'FAILED' })
    expect(diagnosticsMocks.loadRecent).toHaveBeenCalledTimes(2)
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })
})
