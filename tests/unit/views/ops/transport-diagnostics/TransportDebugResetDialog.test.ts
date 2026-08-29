/* eslint-disable vue/one-component-per-file -- 弹窗测试使用局部 StandardDialog 与 ElAlert stub。 */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TransportDebugResetDialog from '@/views/ops/transport-diagnostics/TransportDebugResetDialog.vue'
import type { ResetPreviewResult } from '@/api/modules/transport'

const StandardDialogStub = defineComponent({
  name: 'StandardDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    confirmDisabled: { type: Boolean, required: true }
  },
  emits: ['confirm', 'update:modelValue'],
  template: `
    <section v-if="modelValue">
      <slot />
      <button data-test="dialog-confirm" :disabled="confirmDisabled" @click="$emit('confirm')">
        确认
      </button>
    </section>
  `
})

const ElAlertStub = defineComponent({
  name: 'ElAlert',
  template: '<div><slot name="title" /><slot /></div>'
})

function preview(overrides: Partial<ResetPreviewResult> = {}): ResetPreviewResult {
  return {
    transport_task_id: 'transport-1',
    status: 'RECONCILING',
    evidence_count: 0,
    callback_receipt_count: 0,
    position_projection_count: 0,
    outcome_version: 0,
    member_count: 1,
    binding_count: 1,
    active_binding_count: 1,
    ...overrides
  }
}

function mountDialog(value: ResetPreviewResult) {
  return mount(TransportDebugResetDialog, {
    props: { modelValue: true, preview: value, submitting: false, canReset: true },
    global: {
      stubs: { StandardDialog: StandardDialogStub, ElAlert: ElAlertStub, ElTag: true }
    }
  })
}

describe('TransportDebugResetDialog', () => {
  it('shows the complete local chain counts and allows cleanup', async () => {
    const wrapper = mountDialog(
      preview({ evidence_count: 2, callback_receipt_count: 1, position_projection_count: 1 })
    )

    expect(wrapper.text()).toContain('transport-1')
    expect(wrapper.text()).toContain('1 个成员')
    expect(wrapper.text()).toContain('1 个资源绑定')
    expect(wrapper.text()).toContain('2 条')
    expect(wrapper.text()).toContain('1 条回执')
    expect(wrapper.text()).toContain('1 条位置投影')
    expect(wrapper.get('[data-test="dialog-confirm"]').attributes('disabled')).toBeUndefined()

    await wrapper.get('[data-test="dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('allows cleanup regardless of task status, evidence or outcome', () => {
    const wrapper = mountDialog(preview({ status: 'ACCEPTED', evidence_count: 1, outcome_version: 2 }))

    expect(wrapper.text()).toContain('ACCEPTED')
    expect(wrapper.get('[data-test="dialog-confirm"]').attributes('disabled')).toBeUndefined()
  })

  it('allows preview-only operators to inspect the chain without confirming cleanup', () => {
    const wrapper = mount(TransportDebugResetDialog, {
      props: {
        modelValue: true,
        preview: preview(),
        submitting: false,
        canReset: false
      },
      global: {
        stubs: { StandardDialog: StandardDialogStub, ElAlert: ElAlertStub, ElTag: true }
      }
    })

    expect(wrapper.text()).toContain('缺少清理权限')
    expect(wrapper.get('[data-test="dialog-confirm"]').attributes('disabled')).toBeDefined()
  })
})
