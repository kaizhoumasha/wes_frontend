/* eslint-disable vue/one-component-per-file -- local UI stubs keep the feature test isolated. */
import { defineComponent } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransportDebugRunDialog from '@/views/ops/transport-diagnostics/TransportDebugRunDialog.vue'

const bin = vi.hoisted(() => ({ rack_code: '510056', rack_slot_code: 'S1', bin_code: 'B1', mount_status: 'MOUNTED' }))
const configState = vi.hoisted(() => ({ selectedRackId: { value: '510056' }, groups: { value: [] as Array<{ face: string; bins: unknown[] }> } }))
const runState = vi.hoisted(() => ({ activeRun: { value: null as ReturnType<typeof snapshot> | null }, currentRun: { value: null as ReturnType<typeof snapshot> | null } }))
const actions = vi.hoisted(() => ({ startRun: vi.fn(), abortRun: vi.fn(), refreshRun: vi.fn(), loadRecentRuns: vi.fn() }))
const configActions = vi.hoisted(() => ({ load: vi.fn() }))
const streamActions = vi.hoisted(() => ({ connect: vi.fn(), disconnect: vi.fn() }))
const streamOptions = vi.hoisted(() => ({ value: null as null | { refreshRun(runId: string): Promise<void> } }))

function snapshot() {
  return {
    run_id: 'run-1', status: 'NEEDS_ATTENTION' as const, rack_id: '510056',
    face_groups: [{ face: '270', bins: [{ bin_id: 'B1', slot_id: 'S1' }] }],
    current_group_index: 0, current_phase: 'WAIT_SCAN12' as const,
    current_step: { transport_task_id: 'transport-3', ordinal: 2, phase: 'WAIT_SCAN12', status: 'NEEDS_ATTENTION', group_index: 0, client_request_id: null, evidence_high_watermark: 1, evidence_not_before_ms: 1, observed_bin_ids: [], reason_code: 'EVIDENCE_RECONCILING', created_at: 'now', updated_at: 'now' },
    observed_bin_ids: [], attention_code: 'EVIDENCE_RECONCILING', attention_detail: '等待设备事实',
    can_abort: true, version: 7, created_by_user_id: 1, aborted_by_user_id: null, aborted_reason: null,
    created_at: 'now', updated_at: 'now'
  }
}

vi.mock('@/views/ops/transport-diagnostics/useTransportDebugRunConfig', () => ({
  buildTransportDebugRunInput: (rackId: string) => ({ rack_id: rackId, face_groups: [{ face: ' 90 ', bins: [{ bin_id: 'B1', slot_id: 'S1' }] }] }),
  useTransportDebugRunConfig: () => ({
    selectedRackId: configState.selectedRackId, groups: configState.groups,
    loading: { value: false }, lastError: { value: null }, rackIds: { value: ['510056'] }, rackBins: { value: [bin] },
    validationError: { value: null }, preview: { value: '"target_face": " 90 "\n"rcs_template_id": "CTU03"' },
    load: configActions.load, selectRack: vi.fn(), addGroup: vi.fn(), removeGroup: vi.fn()
  })
}))
vi.mock('@/views/ops/transport-diagnostics/useTransportDebugRun', () => ({
  useTransportDebugRun: () => ({ ...runState, loading: { value: false }, starting: { value: false }, aborting: { value: false }, lastError: { value: null }, ...actions })
}))
vi.mock('@/views/ops/transport-diagnostics/useTransportDebugRunStream', () => ({
  useTransportDebugRunStream: (options: { refreshRun(runId: string): Promise<void> }) => {
    streamOptions.value = options
    return { connectionState: { value: 'DISCONNECTED' }, lastError: { value: null }, hasGap: { value: false }, ...streamActions }
  }
}))

const StandardDialogStub = defineComponent({
  props: { modelValue: Boolean, title: { type: String, default: '' } },
  template: '<section v-if="modelValue"><h2>{{ title }}</h2><slot/><slot name="footer"/></section>'
})
const AppButtonStub = defineComponent({
  props: { disabled: Boolean }, emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot/></button>'
})
const ElAlertStub = defineComponent({
  props: { title: { type: String, default: '' } },
  template: '<div>{{ title }}</div>'
})

function mountDialog(props = {
  canStart: true,
  canAbort: true,
  canStream: false,
  canRead: true,
  canReadTask: true
}) {
  return shallowMount(TransportDebugRunDialog, {
    props,
    global: { renderStubDefaultSlot: true, stubs: {
      StandardDialog: StandardDialogStub, AppButton: AppButtonStub,
      ElAlert: ElAlertStub, ElInput: true, ElSelect: true, ElOption: true
    } }
  })
}

describe('TransportDebugRunDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    runState.activeRun.value = null
    runState.currentRun.value = null
    configState.groups.value = [{ face: ' 90 ', bins: [bin] }]
    actions.loadRecentRuns.mockResolvedValue(undefined)
    configActions.load.mockResolvedValue(undefined)
  })

  it('shows exact preview and starts one persisted automatic run', async () => {
    const wrapper = mountDialog()
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    expect(wrapper.text()).toContain('Transport 自动联调')
    expect(wrapper.text()).toContain('"target_face": " 90 "')
    const start = wrapper.findAll('button').find(button => button.text().includes('启动自动联调'))
    await start?.trigger('click')
    expect(actions.startRun).toHaveBeenCalledWith(expect.objectContaining({ rack_id: '510056', face_groups: [expect.objectContaining({ face: ' 90 ' })] }))
  })

  it('freezes into observer mode and exposes the current task without a force-advance action', async () => {
    runState.activeRun.value = snapshot()
    const wrapper = mountDialog()
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    expect(wrapper.get('[data-test="run-observer"]').text()).toContain('WAIT_SCAN12')
    expect(wrapper.text()).toContain('EVIDENCE_RECONCILING')
    expect(wrapper.text()).not.toContain('强制推进')
    const task = wrapper.findAll('button').find(button => button.text().includes('transport-3'))
    await task?.trigger('click')
    expect(wrapper.emitted('selectTask')).toEqual([['transport-3']])
  })

  it('keeps run observation available when configuration choices fail to load', async () => {
    configActions.load.mockRejectedValueOnce(new Error('rack mounts unavailable'))
    const wrapper = mountDialog({ canStart: true, canAbort: false, canStream: true, canRead: true, canReadTask: true })
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    expect(streamActions.connect).toHaveBeenCalledWith(true)
    expect(wrapper.text()).toContain('rack mounts unavailable')
  })

  it('uses an authorized list refresh when run detail access is unavailable', async () => {
    const wrapper = mountDialog({ canStart: true, canAbort: false, canStream: true, canRead: false, canReadTask: true })
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    await streamOptions.value?.refreshRun('run-1')
    expect(actions.loadRecentRuns).toHaveBeenCalledTimes(2)
    expect(actions.refreshRun).not.toHaveBeenCalled()
  })

  it('does not reconnect after a pending open is closed', async () => {
    let release!: () => void
    actions.loadRecentRuns.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve }))
    const wrapper = mountDialog({ canStart: false, canAbort: false, canStream: true, canRead: true, canReadTask: true })
    const opening = (wrapper.vm as unknown as { open(): Promise<void>; close(): void }).open()
    ;(wrapper.vm as unknown as { close(): void }).close()
    release()
    await opening
    expect(streamActions.connect).not.toHaveBeenCalled()
  })

  it('hides the related Transport task action without task read permission', async () => {
    runState.activeRun.value = snapshot()
    const wrapper = mountDialog({
      canStart: false,
      canAbort: false,
      canStream: true,
      canRead: true,
      canReadTask: false
    })
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    expect(wrapper.findAll('button').some(button => button.text().includes('transport-3'))).toBe(false)
  })

  it('keeps terminal failure diagnostics and the related task accessible', async () => {
    runState.currentRun.value = { ...snapshot(), status: 'FAILED' }
    const wrapper = mountDialog()
    await (wrapper.vm as unknown as { open(): Promise<void> }).open()
    expect(wrapper.get('[data-test="terminal-failure"]').text()).toContain('EVIDENCE_RECONCILING')
    expect(wrapper.get('[data-test="terminal-failure"]').text()).toContain('WAIT_SCAN12')
    const task = wrapper.findAll('button').find(button => button.text().includes('transport-3'))
    await task?.trigger('click')
    expect(wrapper.emitted('selectTask')).toEqual([['transport-3']])
    expect(wrapper.get('[data-test="run-config"]').exists()).toBe(true)
  })
})
