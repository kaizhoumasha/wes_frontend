/* eslint-disable vue/one-component-per-file -- 页面测试使用两个局部交互 stub。 */
import { defineComponent, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'
import TransportDiagnosticsPage from '@/views/ops/transport-diagnostics/TransportDiagnosticsPage.vue'

const diagnosticsMocks = vi.hoisted(() => ({
  loadRecent: vi.fn().mockResolvedValue(undefined),
  loadMore: vi.fn().mockResolvedValue(undefined),
  selectTask: vi.fn().mockResolvedValue(undefined),
  handleStreamTask: vi.fn().mockResolvedValue(undefined),
  submitTask: vi.fn().mockResolvedValue(undefined),
  previewTaskReset: vi.fn().mockResolvedValue({
    transport_task_id: 'transport-1',
    status: 'RECONCILING',
    evidence_count: 0,
    callback_receipt_count: 0,
    position_projection_count: 0,
    outcome_version: 0,
    member_count: 1,
    binding_count: 1,
    active_binding_count: 1
  }),
  resetTask: vi.fn().mockResolvedValue({
    transport_task_id: 'transport-1',
    deleted_callback_receipt_count: 0,
    deleted_evidence_count: 0,
    deleted_position_projection_count: 0,
    deleted_member_count: 1,
    deleted_binding_count: 1
  }),
  setFilters: vi.fn()
}))
const streamMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  reconnect: vi.fn(),
  disconnect: vi.fn()
}))
const streamOptions = vi.hoisted(() => ({
  value: null as null | {
    onEvent: (event: { payload: { transport_task_id: string | null } }) => void
    onReconnect: () => void
  }
}))
const diagnosticsState = vi.hoisted(() => ({
  selectedTaskId: 'transport-1' as string | null,
  resetPreview: {
    transport_task_id: 'transport-1',
    status: 'RECONCILING',
    evidence_count: 0,
    callback_receipt_count: 0,
    position_projection_count: 0,
    outcome_version: 0,
    member_count: 1,
    binding_count: 1,
    active_binding_count: 1
  }
}))
const permissionMocks = vi.hoisted(() => ({
  granted: new Set<string>()
}))

vi.mock('@/views/ops/transport-diagnostics/useTransportDiagnostics', () => ({
  useTransportDiagnostics: () => ({
    tasks: ref([]),
    detail: ref(null),
    selectedTaskId: ref(diagnosticsState.selectedTaskId),
    nextCursor: ref(null),
    loading: ref(false),
    loadingDetail: ref(false),
    submitting: ref(false),
    previewingReset: ref(false),
    resetting: ref(false),
    resetPreview: ref(diagnosticsState.resetPreview),
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
  usePermission: () => ({
    hasPermission: (permission: string) => permissionMocks.granted.has(permission)
  })
}))

const AppButtonStub = defineComponent({
  name: 'AppButton',
  props: {
    disabled: { type: Boolean, default: false }
  },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>'
})

const TransportDebugResetDialogStub = defineComponent({
  name: 'TransportDebugResetDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    preview: { type: Object, default: null },
    submitting: { type: Boolean, required: true },
    canReset: { type: Boolean, required: true }
  },
  emits: ['update:modelValue', 'confirm'],
  template: `
    <div v-if="modelValue" data-test="reset-dialog">
      <span>{{ preview?.transport_task_id }}</span>
      <button data-test="confirm-reset" @click="$emit('confirm')">确认清理</button>
    </div>
  `
})

function mountPage() {
  return shallowMount(TransportDiagnosticsPage, {
    global: {
      renderStubDefaultSlot: true,
      stubs: {
        AppButton: AppButtonStub,
        TransportTaskTable: true,
        TransportTaskDetail: true,
        TransportDebugTaskDialog: true,
        TransportDebugResetDialog: TransportDebugResetDialogStub,
        ElAlert: true,
        ElInput: true,
        ElSelect: true,
        ElOption: true,
        ElTag: true
      }
    }
  })
}

function getResetButton(wrapper: ReturnType<typeof mountPage>) {
  const button = wrapper
    .findAllComponents(AppButtonStub)
    .find(candidate => candidate.text().includes('清理联调任务'))
  if (!button) throw new Error('Reset button not found')
  return button
}

describe('TransportDiagnosticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    streamOptions.value = null
    diagnosticsState.selectedTaskId = 'transport-1'
    permissionMocks.granted.clear()
    permissionMocks.granted.add(OPS_PERMISSIONS.transportTask.read)
    permissionMocks.granted.add(OPS_PERMISSIONS.transportEvidence.stream)
    permissionMocks.granted.add(OPS_PERMISSIONS.transport.debugCreate)
    permissionMocks.granted.add(OPS_PERMISSIONS.transport.debugPreview)
    permissionMocks.granted.add(OPS_PERMISSIONS.transport.debugReset)
  })

  it('loads durable tasks, connects live notifications and refreshes the related task', async () => {
    mountPage()

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
    const wrapper = mountPage()
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

  it('previews the selected task before opening the reset confirmation and resets once', async () => {
    const wrapper = mountPage()
    const resetButton = getResetButton(wrapper)

    await resetButton.trigger('click')
    await vi.waitFor(() =>
      expect(diagnosticsMocks.previewTaskReset).toHaveBeenCalledWith('transport-1')
    )
    expect(wrapper.get('[data-test="reset-dialog"]').text()).toContain('transport-1')

    await wrapper.get('[data-test="confirm-reset"]').trigger('click')
    await vi.waitFor(() => expect(diagnosticsMocks.resetTask).toHaveBeenCalledWith('transport-1'))
    expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(false)
  })

  it('hides the reset entry without preview permission', () => {
    permissionMocks.granted.delete(OPS_PERMISSIONS.transport.debugPreview)

    const wrapper = mountPage()

    expect(
      wrapper.findAll('button').some(button => button.text().includes('清理联调任务'))
    ).toBe(false)
  })

  it('does not preview a reset without a selected task', async () => {
    diagnosticsState.selectedTaskId = null
    const wrapper = mountPage()
    const resetButton = getResetButton(wrapper)

    expect(resetButton.props('disabled')).toBe(true)
    resetButton.vm.$emit('click', new MouseEvent('click'))
    await wrapper.vm.$nextTick()

    expect(diagnosticsMocks.previewTaskReset).not.toHaveBeenCalled()
  })

  it('shows a preview failure without opening the reset dialog', async () => {
    diagnosticsMocks.previewTaskReset.mockRejectedValueOnce(new Error('preview unavailable'))
    const wrapper = mountPage()
    const resetButton = getResetButton(wrapper)

    await resetButton.trigger('click')
    await vi.waitFor(() => expect(wrapper.html()).toContain('preview unavailable'))

    expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(false)
  })

  it('does not reset when the operator has preview-only permission', async () => {
    permissionMocks.granted.delete(OPS_PERMISSIONS.transport.debugReset)
    const wrapper = mountPage()
    const resetButton = getResetButton(wrapper)

    await resetButton.trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(true))
    const resetDialog = wrapper.getComponent(TransportDebugResetDialogStub)
    expect(resetDialog.props('canReset')).toBe(false)

    resetDialog.vm.$emit('confirm')
    await wrapper.vm.$nextTick()

    expect(diagnosticsMocks.resetTask).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(true)
  })

  it('keeps the dialog open and shows the error when reset fails', async () => {
    diagnosticsMocks.resetTask.mockRejectedValueOnce(new Error('reset rejected'))
    const wrapper = mountPage()
    const resetButton = getResetButton(wrapper)

    await resetButton.trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(true))
    wrapper.getComponent(TransportDebugResetDialogStub).vm.$emit('confirm')
    await vi.waitFor(() => expect(wrapper.html()).toContain('reset rejected'))

    expect(wrapper.find('[data-test="reset-dialog"]').exists()).toBe(true)
  })
})
