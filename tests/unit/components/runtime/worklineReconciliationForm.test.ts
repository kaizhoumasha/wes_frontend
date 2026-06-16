import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import WorklineReconciliationForm from '@/components/runtime/monitor/WorklineReconciliationForm.vue'
import type {
  RuntimeMonitorReconciliationCandidate,
  RuntimeWorklineSummary
} from '@/types/runtime'

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 1,
    line_code: 'LINE-1',
    line_name: 'Line 1',
    line_type: 'SMT',
    is_active: true,
    device_count: 2,
    active_session_count: 0,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    runtime_status: 'RECONCILING',
    active_safety_incident_id: null,
    stopped_at: '2026-06-10T11:59:00Z',
    stopped_reason: 'CALLBACK_DEADLINE_EXPIRED',
    ...overrides
  }
}

function createCandidate(
  overrides: Partial<RuntimeMonitorReconciliationCandidate> = {}
): RuntimeMonitorReconciliationCandidate {
  return {
    session_id: 909,
    session_code: 'S-909',
    trace_id: 'TRACE-909',
    request_id: 'REQ-909',
    reason: 'CALLBACK_DEADLINE_EXPIRED',
    source_kind: 'WMS_CALLBACK',
    device_id: 201,
    command_id: 301,
    wait_token: 'WAIT-909',
    occurred_at: '2026-06-10T11:59:00Z',
    deadline_at: '2026-06-10T12:00:00Z',
    late_evidence_received: false,
    ...overrides
  }
}

const elementStubs = {
  RuntimeStatusBadge: true,
  ElButton: {
    props: ['disabled', 'loading', 'title', 'plain', 'type'],
    template:
      '<button :disabled="disabled" :title="title" :data-loading="loading ? true : undefined" :data-test="$attrs[\'data-test\']"><slot /></button>'
  },
  ElRadioGroup: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<div class="el-radio-group" @click="$emit(`update:modelValue`, $event.target.dataset.value)"><slot /></div>'
  },
  ElRadioButton: {
    props: ['label'],
    template:
      '<button type="button" :data-value="label" :data-test="$attrs[\'data-test\']"><slot /></button>'
  },
  ElCheckboxGroup: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-checkbox-group"><slot /></div>'
  },
  ElCheckbox: {
    props: ['label'],
    template:
      '<label><input type="checkbox" :data-key="label" @change="$emit(`update-key`, label)"/><slot /></label>'
  },
  ElInput: {
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
    template:
      '<textarea :placeholder="placeholder" :value="modelValue" :data-test="$attrs[\'data-test\']" @input="$emit(`update:modelValue`, $event.target.value)" />'
  }
}

describe('WorklineReconciliationForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses callback-timeout checks for CALLBACK_DEADLINE_EXPIRED reason', () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate({ reason: 'CALLBACK_DEADLINE_EXPIRED' }),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    const text = wrapper.text()
    expect(text).toContain('已检查设备状态')
    expect(text).toContain('已确认现场物理状态')
    expect(text).toContain('已核对库存/位置状态')
    expect(text).toContain('已检查迟到 callback 证据')
    expect(text).not.toContain('已确认设备通信可达')
  })

  it('switches to dispatch-ack checks for COMMAND_ACK_EXHAUSTED reason', () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary({ stopped_reason: 'COMMAND_ACK_EXHAUSTED' }),
        candidate: createCandidate({ reason: 'COMMAND_ACK_EXHAUSTED' }),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    const text = wrapper.text()
    expect(text).toContain('已确认设备通信可达')
    expect(text).toContain('已核对命令编码与现场动作')
    expect(text).not.toContain('已检查迟到 callback 证据')
  })

  it('disables submit when candidate is null', () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: null,
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('解除隔离'))
    if (!submitButton) throw new Error('missing submit button')
    expect(submitButton.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('等待 pending reconciliation session 证据')
  })

  it('disables submit and explains permission gating when canResolve is false', () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate(),
        canResolve: false
      },
      global: { stubs: elementStubs }
    })

    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('解除隔离'))
    if (!submitButton) throw new Error('missing submit button')
    expect(submitButton.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('需要 biz:workline:resolve-reconciliation 权限')
  })

  it('emits resolve with full payload including all expected checks for FAILED resolution', async () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate(),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    // Tick all 4 callback-timeout checks
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(4)
    const vm = wrapper.vm as unknown as { checkedKeys: string[]; operatorNote: string }
    vm.checkedKeys = [
      'device_inspected',
      'physical_state_confirmed',
      'inventory_or_position_reconciled',
      'late_callback_reviewed'
    ]
    vm.operatorNote = '现场已确认完成'
    await wrapper.vm.$nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('解除隔离'))
    if (!submitButton) throw new Error('missing submit button')
    expect(submitButton.attributes('disabled')).toBeUndefined()

    await submitButton.trigger('click')

    const events = wrapper.emitted('resolve')
    expect(events?.length).toBe(1)
    const payload = events![0][0] as {
      sessionId: number
      resolution: string
      checks: Record<string, boolean>
      operatorNote: string
      resultPayload: Record<string, unknown> | null
    }
    expect(payload.sessionId).toBe(909)
    expect(payload.resolution).toBe('FAILED')
    expect(payload.operatorNote).toBe('现场已确认完成')
    expect(payload.checks).toEqual({
      device_inspected: true,
      physical_state_confirmed: true,
      inventory_or_position_reconciled: true,
      late_callback_reviewed: true
    })
    expect(payload.resultPayload).toBeNull()
  })

  it('emits resolve with COMPLETED resolution and parsed JSON result payload', async () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate({ reason: 'CALLBACK_DEADLINE_EXPIRED' }),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    // Switch to COMPLETED resolution via the data-test hook
    const completedRadio = wrapper.find('[data-test="resolution-completed"]')
    expect(completedRadio.exists()).toBe(true)
    await completedRadio.trigger('click')
    await wrapper.vm.$nextTick()

    // Tick all 4 callback-timeout checks
    const vm = wrapper.vm as unknown as {
      checkedKeys: string[]
      operatorNote: string
      resultPayloadText: string
      resolution: 'FAILED' | 'COMPLETED' | 'CANCELLED'
    }
    vm.checkedKeys = [
      'device_inspected',
      'physical_state_confirmed',
      'inventory_or_position_reconciled',
      'late_callback_reviewed'
    ]
    vm.operatorNote = '已现场确认'
    vm.resultPayloadText = '{"confirmed_by":"operator","qty":12}'
    await wrapper.vm.$nextTick()

    // The result-payload textarea is now visible (only rendered for COMPLETED)
    const payloadTextarea = wrapper.find('[data-test="result-payload"]')
    expect(payloadTextarea.exists()).toBe(true)

    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('解除隔离'))
    if (!submitButton) throw new Error('missing submit button')
    expect(submitButton.attributes('disabled')).toBeUndefined()

    await submitButton.trigger('click')

    const events = wrapper.emitted('resolve')
    expect(events?.length).toBe(1)
    const payload = events![0][0] as {
      sessionId: number
      resolution: string
      checks: Record<string, boolean>
      operatorNote: string
      resultPayload: Record<string, unknown> | null
    }
    expect(payload.sessionId).toBe(909)
    expect(payload.resolution).toBe('COMPLETED')
    expect(payload.operatorNote).toBe('已现场确认')
    expect(payload.resultPayload).toEqual({
      confirmed_by: 'operator',
      qty: 12
    })
    expect(payload.checks).toEqual({
      device_inspected: true,
      physical_state_confirmed: true,
      inventory_or_position_reconciled: true,
      late_callback_reviewed: true
    })
  })

  it('does not emit resolve and reports an error when COMPLETED result payload is not valid JSON', async () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate({ reason: 'CALLBACK_DEADLINE_EXPIRED' }),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    const vm = wrapper.vm as unknown as {
      checkedKeys: string[]
      operatorNote: string
      resultPayloadText: string
      resolution: 'FAILED' | 'COMPLETED' | 'CANCELLED'
    }
    vm.resolution = 'COMPLETED'
    vm.checkedKeys = [
      'device_inspected',
      'physical_state_confirmed',
      'inventory_or_position_reconciled',
      'late_callback_reviewed'
    ]
    vm.operatorNote = 'JSON 解析失败'
    vm.resultPayloadText = '{ this is not json }'
    await wrapper.vm.$nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('解除隔离'))
    if (!submitButton) throw new Error('missing submit button')
    expect(submitButton.attributes('disabled')).toBeUndefined()

    await submitButton.trigger('click')
    expect(wrapper.emitted('resolve')).toBeUndefined()
  })

  it('emits refresh when refresh button is clicked', async () => {
    const wrapper = mount(WorklineReconciliationForm, {
      props: {
        summary: createSummary(),
        candidate: createCandidate(),
        canResolve: true
      },
      global: { stubs: elementStubs }
    })

    const refreshButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('刷新证据'))
    if (!refreshButton) throw new Error('missing refresh button')
    await refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')?.length).toBe(1)
  })
})
