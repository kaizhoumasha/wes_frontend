/* eslint-disable vue/one-component-per-file -- local UI stubs keep the feature test isolated. */
import { defineComponent } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransportDebugRunPanel from '@/views/ops/transport-debug/TransportDebugRunPanel.vue'

const bin = vi.hoisted(() => ({ bin_code: 'B1', slot_id: 'S1' }))
const configState = vi.hoisted(() => ({
  worklineCode: { value: 'LINE-1' },
  rackId: { value: '510056' },
  groups: { value: [] as Array<{ face: string; bins: unknown[] }> }
}))
const runState = await vi.hoisted(async () => {
  const { shallowRef } = await import('vue')
  return {
    activeRun: shallowRef<ReturnType<typeof snapshot> | null>(null),
    currentRun: shallowRef<ReturnType<typeof snapshot> | null>(null)
  }
})
const actions = vi.hoisted(() => ({
  startRun: vi.fn(),
  abortRun: vi.fn(),
  refreshRun: vi.fn(),
  loadRecentRuns: vi.fn()
}))
const configActions = vi.hoisted(() => ({
  addGroup: vi.fn(),
  removeGroup: vi.fn(),
  addBin: vi.fn(),
  removeBin: vi.fn()
}))
const streamActions = vi.hoisted(() => ({ connect: vi.fn(), disconnect: vi.fn() }))
const streamOptions = vi.hoisted(() => ({
  value: null as null | { refreshRun(runId: string): Promise<void> }
}))

function snapshot() {
  const baseStep = {
    group_index: 0,
    client_request_id: null,
    evidence_high_watermark: null,
    evidence_not_before_ms: null,
    observed_bin_codes: [] as string[],
    reason_code: null,
    created_at: 'now',
    updated_at: 'now'
  }
  return {
    run_id: 'run-1',
    status: 'NEEDS_ATTENTION' as 'NEEDS_ATTENTION' | 'COMPLETED' | 'RUNNING',
    rack_id: '510056',
    face_groups: [{ face: '270', bins: [{ bin_code: 'B1', slot_id: 'S1' }] }],
    current_group_index: 0,
    current_phase: 'WAIT_SCAN12' as const,
    current_step: {
      ...baseStep,
      transport_task_id: 'transport-3',
      ordinal: 2,
      phase: 'WAIT_SCAN12',
      status: 'NEEDS_ATTENTION',
      evidence_high_watermark: 1,
      evidence_not_before_ms: 1,
      reason_code: 'EVIDENCE_RECONCILING'
    },
    steps: [
      {
        ...baseStep,
        ordinal: 0,
        phase: 'RACK_TO_STATION',
        status: 'SUCCEEDED',
        transport_task_id: 'transport-rack-out'
      },
      {
        ...baseStep,
        ordinal: 1,
        phase: 'BINS_TO_INFEED',
        status: 'SUCCEEDED',
        transport_task_id: 'transport-bin-out'
      },
      {
        ...baseStep,
        ordinal: 2,
        phase: 'WAIT_SCAN12',
        status: 'NEEDS_ATTENTION',
        transport_task_id: null,
        observed_bin_codes: []
      }
    ],
    observed_bin_codes: [],
    attention_code: 'EVIDENCE_RECONCILING',
    attention_detail: '等待设备事实',
    can_abort: true,
    version: 7,
    workline_code: 'LINE-1',
    returned_bins: [] as Array<{
      bin_code: string
      rack_id: string
      rack_face: string
      slot_id: string
    }>,
    created_by_user_id: 1,
    aborted_by_user_id: null,
    aborted_reason: null,
    created_at: 'now',
    updated_at: 'now'
  }
}

vi.mock('@/views/ops/transport-debug/useTransportDebugRunConfig', () => ({
  validateTransportDebugRunConfig: () => null,
  buildTransportDebugRunInput: (rackId: string) => ({
    rack_id: rackId,
    face_groups: [{ face: ' 90 ', bins: [{ bin_code: 'B1', slot_id: 'S1' }] }]
  }),
  useTransportDebugRunConfig: () => ({
    worklineCode: configState.worklineCode,
    rackId: configState.rackId,
    groups: configState.groups,
    validationError: { value: null },
    preview: { value: '"target_face": " 90 "\n"rcs_template_id": "CTU03"' },
    ...configActions
  })
}))
vi.mock('@/views/ops/transport-debug/useTransportDebugRun', () => ({
  useTransportDebugRun: () => ({
    ...runState,
    loading: { value: false },
    starting: { value: false },
    aborting: { value: false },
    lastError: { value: null },
    ...actions
  })
}))
vi.mock('@/views/ops/transport-debug/useTransportDebugRunStream', () => ({
  useTransportDebugRunStream: (options: { refreshRun(runId: string): Promise<void> }) => {
    streamOptions.value = options
    return {
      connectionState: { value: 'DISCONNECTED' },
      lastError: { value: null },
      hasGap: { value: false },
      ...streamActions
    }
  }
}))

const AppButtonStub = defineComponent({
  props: { disabled: Boolean },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot/></button>'
})
const ElAlertStub = defineComponent({
  props: { title: { type: String, default: '' } },
  template: '<div>{{ title }}</div>'
})
const ElInputStub = defineComponent({
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />'
})

const ElInputNumberStub = defineComponent({
  props: { modelValue: { type: Number, default: undefined } },
  emits: ['update:modelValue'],
  template:
    '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? undefined : Number($event.target.value))" />'
})

function mountDialog(
  props = {
    canStart: true,
    canAbort: true,
    canStream: false,
    canRead: true,
    canReadTask: true
  }
) {
  return shallowMount(TransportDebugRunPanel, {
    props,
    global: {
      renderStubDefaultSlot: true,
      stubs: {
        AppButton: AppButtonStub,
        TransportDebugRunObserver: false,
        TransportDebugRunForm: false,
        ElAlert: ElAlertStub,
        ElInput: ElInputStub,
        ElInputNumber: ElInputNumberStub,
        ElSelect: true,
        ElOption: true
      }
    }
  })
}

describe('TransportDebugRunPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    runState.activeRun.value = null
    runState.currentRun.value = null
    configState.rackId.value = '510056'
    configState.worklineCode.value = 'LINE-1'
    configState.groups.value = [{ face: ' 90 ', bins: [bin] }]
    actions.loadRecentRuns.mockResolvedValue(undefined)
    actions.startRun.mockResolvedValue({ ...snapshot(), status: 'RUNNING' })
  })

  it('shows exact preview and starts one persisted automatic run', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.text()).toContain('"target_face": " 90 "')
    const start = wrapper.findAll('button').find(button => button.text().includes('启动自动联调'))
    await start?.trigger('click')
    expect(actions.startRun).toHaveBeenCalledWith(
      expect.objectContaining({
        rack_id: '510056',
        face_groups: [expect.objectContaining({ face: ' 90 ' })]
      })
    )
  })

  it('starts only the first independent round and leaves it running on unmount', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    expect(actions.startRun).not.toHaveBeenCalled()
    await wrapper.get('[aria-label="自动联调轮数"]').setValue('3')
    await wrapper
      .findAll('button')
      .find(button => button.text().includes('启动自动联调'))
      ?.trigger('click')
    expect(actions.startRun).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ rack_id: '510056' })
    )
    wrapper.unmount()
    expect(actions.abortRun).not.toHaveBeenCalled()
  })

  it.each(['', '0', '-1', '1.5', '1001'])(
    'rejects invalid rounds %s before creating any task',
    async value => {
      const wrapper = mountDialog()
      await flushPromises()
      await wrapper.get('[aria-label="自动联调轮数"]').setValue(value)
      const start = wrapper
        .findAll('button')
        .find(button => button.text().includes('启动自动联调'))!
      expect(start.attributes('disabled')).toBeDefined()
      await start.trigger('click')
      expect(actions.startRun).not.toHaveBeenCalled()
      wrapper.unmount()
    }
  )

  it('blocks start until the initial persisted run lookup succeeds', async () => {
    actions.loadRecentRuns.mockRejectedValueOnce(new Error('query failed'))
    const wrapper = mountDialog()
    await flushPromises()
    const start = wrapper.findAll('button').find(button => button.text().includes('启动自动联调'))!
    expect(start.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('query failed')
    wrapper.unmount()
  })

  it('allows manual initialization after a historical run has no returned locations', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    runState.currentRun.value = { ...snapshot(), status: 'COMPLETED' }
    await flushPromises()
    expect(wrapper.text()).toContain('请按现场实际情况重新填写初始化数据')
    const start = wrapper.findAll('button').find(button => button.text().includes('启动自动联调'))!
    expect(start.attributes('disabled')).toBeUndefined()
    await start.trigger('click')
    expect(actions.startRun).toHaveBeenCalledOnce()
    runState.currentRun.value = { ...snapshot(), run_id: 'new-run', status: 'RUNNING' }
    await flushPromises()
    expect(wrapper.text()).not.toContain('请按现场实际情况重新填写初始化数据')
    wrapper.unmount()
  })

  it('prefills confirmed returned slots once without overwriting later manual edits', async () => {
    configState.worklineCode.value = 'KT16'
    const wrapper = mountDialog()
    await flushPromises()
    const result = {
      ...snapshot(),
      status: 'COMPLETED' as const,
      returned_bins: [{ bin_code: 'B1', rack_id: '510056', rack_face: '270', slot_id: 'S2' }]
    }
    runState.currentRun.value = result
    await flushPromises()
    expect(configState.worklineCode.value).toBe('KT16')
    expect(configState.groups.value).toEqual([
      { face: '270', bins: [{ bin_code: 'B1', slot_id: 'S2' }] }
    ])
    configState.rackId.value = 'manual-rack'
    runState.currentRun.value = { ...result }
    await flushPromises()
    expect(configState.rackId.value).toBe('manual-rack')
    wrapper.unmount()
  })

  it('freezes into observer mode and exposes the current task without a force-advance action', async () => {
    runState.activeRun.value = snapshot()
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.get('[data-test="run-observer"]').text()).toContain('WAIT_SCAN12')
    expect(wrapper.text()).toContain('EVIDENCE_RECONCILING')
    expect(wrapper.text()).not.toContain('强制推进')
    const task = wrapper.findAll('button').find(button => button.text().includes('transport-3'))
    await task?.trigger('click')
    expect(wrapper.emitted('selectTask')).toEqual([['transport-3']])
  })

  it('renders direct rack and bin inputs without a mounted-resource selector', async () => {
    const wrapper = mountDialog({
      canStart: true,
      canAbort: false,
      canStream: true,
      canRead: true,
      canReadTask: true
    })
    await flushPromises()

    expect(streamActions.connect).toHaveBeenCalledWith(true)
    expect(wrapper.find('[aria-label="自动联调货架编码"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="自动联调货架"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="料箱编码"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="当前货架槽位"]').exists()).toBe(true)
  })

  it('delegates face and bin edits while enforcing the one-to-four UI boundaries', async () => {
    const oneBin = mountDialog()
    await flushPromises()

    await oneBin
      .findAll('button')
      .find(button => button.text() === '新增货架面')
      ?.trigger('click')
    await oneBin
      .findAll('button')
      .find(button => button.text() === '删除')
      ?.trigger('click')
    const removeOnlyBin = oneBin.findAll('button').find(button => button.text() === '删除料箱')
    const addSecondBin = oneBin.findAll('button').find(button => button.text() === '新增料箱')
    expect(removeOnlyBin?.attributes('disabled')).toBeDefined()
    expect(addSecondBin?.attributes('disabled')).toBeUndefined()
    await addSecondBin?.trigger('click')

    expect(configActions.addGroup).toHaveBeenCalledOnce()
    expect(configActions.removeGroup).toHaveBeenCalledWith(0)
    expect(configActions.addBin).toHaveBeenCalledWith(0)
    expect(configActions.removeBin).not.toHaveBeenCalled()
    oneBin.unmount()

    configState.groups.value = [
      {
        face: '90',
        bins: [
          bin,
          { bin_code: 'B2', slot_id: 'S2' },
          { bin_code: 'B3', slot_id: 'S3' },
          { bin_code: 'B4', slot_id: 'S4' }
        ]
      }
    ]
    const fourBins = mountDialog()
    await flushPromises()

    const addFifthBin = fourBins.findAll('button').find(button => button.text() === '新增料箱')
    const removeFirstBin = fourBins.findAll('button').find(button => button.text() === '删除料箱')
    expect(addFifthBin?.attributes('disabled')).toBeDefined()
    expect(removeFirstBin?.attributes('disabled')).toBeUndefined()
    await removeFirstBin?.trigger('click')
    expect(configActions.removeBin).toHaveBeenCalledWith(0, 0)
  })

  it('uses an authorized list refresh when run detail access is unavailable', async () => {
    mountDialog({
      canStart: true,
      canAbort: false,
      canStream: true,
      canRead: false,
      canReadTask: true
    })
    await flushPromises()
    await streamOptions.value?.refreshRun('run-1')
    expect(actions.loadRecentRuns).toHaveBeenCalledTimes(2)
    expect(actions.refreshRun).not.toHaveBeenCalled()
  })

  it('does not reconnect after a pending load is unmounted', async () => {
    let release!: () => void
    actions.loadRecentRuns.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          release = resolve
        })
    )
    const wrapper = mountDialog({
      canStart: false,
      canAbort: false,
      canStream: true,
      canRead: true,
      canReadTask: true
    })
    wrapper.unmount()
    release()
    await flushPromises()
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
    await flushPromises()
    expect(wrapper.findAll('button').some(button => button.text().includes('transport-3'))).toBe(
      false
    )
  })

  it('aborts only after a physical-state reason and clears the reason on success', async () => {
    runState.activeRun.value = snapshot()
    actions.abortRun.mockResolvedValueOnce({ ...snapshot(), status: 'ABORTED' })
    const wrapper = mountDialog()
    await flushPromises()

    const reason = wrapper.get('input[placeholder="现场核验说明（必填）"]')
    const abortButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('确认物理状态并终止'))
    expect(abortButton?.attributes('disabled')).toBeDefined()

    await reason.setValue('现场确认机构静止')
    expect(abortButton?.attributes('disabled')).toBeUndefined()
    await abortButton?.trigger('click')

    expect(actions.abortRun).toHaveBeenCalledWith('run-1', '现场确认机构静止')
    expect((reason.element as HTMLInputElement).value).toBe('')
  })

  it('keeps the abort reason and reports the API error when abort is rejected', async () => {
    runState.activeRun.value = snapshot()
    actions.abortRun.mockRejectedValueOnce(new Error('仍有关联任务未终态'))
    const wrapper = mountDialog()
    await flushPromises()

    const reason = wrapper.get('input[placeholder="现场核验说明（必填）"]')
    await reason.setValue('现场确认机构静止')
    await wrapper
      .findAll('button')
      .find(button => button.text().includes('确认物理状态并终止'))
      ?.trigger('click')

    expect(wrapper.text()).toContain('仍有关联任务未终态')
    expect((reason.element as HTMLInputElement).value).toBe('现场确认机构静止')
  })

  it('does not expose abort when permission or persisted can_abort is false', async () => {
    runState.activeRun.value = { ...snapshot(), can_abort: false }
    const persistedGuard = mountDialog()
    await flushPromises()
    expect(persistedGuard.text()).not.toContain('确认物理状态并终止')
    persistedGuard.unmount()

    runState.activeRun.value = snapshot()
    const permissionGuard = mountDialog({
      canStart: true,
      canAbort: false,
      canStream: false,
      canRead: true,
      canReadTask: true
    })
    await flushPromises()
    expect(permissionGuard.text()).not.toContain('确认物理状态并终止')
  })

  it('keeps terminal failure diagnostics and the related task accessible', async () => {
    runState.currentRun.value = { ...snapshot(), status: 'FAILED' }
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.get('[data-test="terminal-failure"]').text()).toContain('EVIDENCE_RECONCILING')
    expect(wrapper.get('[data-test="terminal-failure"]').text()).toContain('WAIT_SCAN12')
    const task = wrapper.findAll('button').find(button => button.text().includes('transport-3'))
    await task?.trigger('click')
    expect(wrapper.emitted('selectTask')).toEqual([['transport-3']])
    expect(wrapper.get('[data-test="run-config"]').exists()).toBe(true)
  })

  it('keeps a centralized rack and bin step history visible after the run completes', async () => {
    const completed = snapshot()
    runState.currentRun.value = {
      ...completed,
      status: 'COMPLETED',
      current_phase: 'RACK_TO_STORAGE',
      current_step: {
        ...completed.current_step,
        ordinal: 4,
        phase: 'RACK_TO_STORAGE',
        status: 'SUCCEEDED',
        transport_task_id: 'transport-rack-return',
        reason_code: null
      },
      steps: [
        ...completed.steps.slice(0, 2),
        {
          ...completed.steps[2],
          status: 'SUCCEEDED',
          observed_bin_codes: ['B1']
        },
        {
          ...completed.steps[0],
          ordinal: 3,
          phase: 'BINS_TO_RACK',
          status: 'SUCCEEDED',
          transport_task_id: 'transport-bin-return'
        },
        {
          ...completed.steps[0],
          ordinal: 4,
          phase: 'RACK_TO_STORAGE',
          status: 'SUCCEEDED',
          transport_task_id: 'transport-rack-return'
        }
      ]
    }

    const wrapper = mountDialog()
    await flushPromises()

    const progress = wrapper.get('[data-test="run-step-progress"]')
    expect(progress.text()).toContain('货架搬至工作位')
    expect(progress.text()).toContain('料箱搬至入库口')
    expect(progress.text()).toContain('等待 SCAN12')
    expect(progress.text()).toContain('料箱回架')
    expect(progress.text()).toContain('货架返库')
    expect(progress.text()).toContain('B1')
    expect(progress.text()).toContain('transport-bin-return')
    const rackReturnStep = progress.findAll('li').find(step => step.text().includes('货架返库'))
    expect(rackReturnStep?.text()).not.toContain('货架面：')
    expect(rackReturnStep?.text()).not.toContain('槽位：')
    expect(wrapper.get('[data-test="run-config"]').exists()).toBe(true)
  })

  it('binds each step to the bins and face selected for that step group', async () => {
    const multiFace = snapshot()
    runState.activeRun.value = {
      ...multiFace,
      face_groups: [
        { face: '90', bins: [{ bin_code: 'B1', slot_id: 'S1' }] },
        { face: '270', bins: [{ bin_code: 'B2', slot_id: 'S2' }] }
      ],
      current_group_index: 1,
      current_phase: 'BINS_TO_INFEED',
      steps: [
        ...multiFace.steps,
        {
          ...multiFace.steps[0],
          ordinal: 3,
          group_index: 1,
          phase: 'ROTATE_TO_NEXT_FACE',
          status: 'SUCCEEDED',
          transport_task_id: 'transport-rotate'
        },
        {
          ...multiFace.steps[1],
          ordinal: 4,
          group_index: 1,
          status: 'WAITING',
          transport_task_id: 'transport-b2-out'
        }
      ]
    }

    const wrapper = mountDialog()
    await flushPromises()

    const progress = wrapper.get('[data-test="run-step-progress"]').text()
    expect(progress).toContain('货架旋转至下一面')
    expect(progress).toContain('货架面： 270')
    expect(progress).toContain('料箱 B2')
    expect(progress).toContain('初始槽位：S2')
  })

  it('uses step-level SCAN12 evidence and tolerates null or out-of-range step groups', async () => {
    const run = snapshot()
    runState.activeRun.value = {
      ...run,
      face_groups: [
        {
          face: '90',
          bins: [
            { bin_code: 'B1', slot_id: 'S1' },
            { bin_code: 'B2', slot_id: 'S2' }
          ]
        }
      ],
      observed_bin_codes: ['B2'],
      steps: [
        { ...run.steps[2]!, observed_bin_codes: ['B1'] },
        {
          ...run.steps[1]!,
          ordinal: 3,
          phase: 'BINS_TO_RACK',
          group_index: 99,
          transport_task_id: null
        },
        {
          ...run.steps[0]!,
          ordinal: 4,
          phase: 'RACK_TO_STORAGE',
          group_index: null,
          transport_task_id: null
        }
      ]
    }
    const wrapper = mountDialog()
    await flushPromises()

    const steps = wrapper.get('[data-test="run-step-progress"]').findAll('li')
    const scanStep = steps.find(step => step.text().includes('等待 SCAN12'))
    const outOfRangeStep = steps.find(step => step.text().includes('料箱回架'))
    const nullGroupStep = steps.find(step => step.text().includes('货架返库'))
    expect(scanStep?.text()).toContain('已扫描：B1 · 待扫描：B2')
    expect(wrapper.get('.progress-panel').text()).toContain('已扫描：B1')
    expect(wrapper.get('.progress-panel').text()).toContain('待扫描：B2')
    expect(outOfRangeStep?.text()).toContain('料箱 无')
    expect(outOfRangeStep?.text()).not.toContain('货架面：')
    expect(nullGroupStep?.text()).not.toContain('货架面：')
  })

  it('renders an empty persisted step list and an out-of-range current group safely', async () => {
    runState.activeRun.value = { ...snapshot(), current_group_index: 99, steps: [] }
    const wrapper = mountDialog()
    await flushPromises()

    expect(wrapper.get('[data-test="run-step-progress"]').findAll('li')).toHaveLength(0)
    expect(wrapper.get('.progress-panel').text()).toContain('待扫描：无')
  })
})
