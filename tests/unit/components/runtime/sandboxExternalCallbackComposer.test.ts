import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SandboxExternalCallbackComposer from '@/components/runtime/sandbox/SandboxExternalCallbackComposer.vue'
import type { SandboxPendingOutbox } from '@/types/runtime'

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    sandboxExternalCallback: vi.fn(() => ({ send: vi.fn() }))
  }
}))

function createExternalOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 4,
    session_id: 1,
    workline_id: 45,
    dispatch_key: 'rack-operation:external:trace-001:1:ALLOCATE_AND_MOVE_RACK',
    dispatch_type: 'EXTERNAL_HTTP',
    target_type: 'EXTERNAL_SYSTEM',
    target_code: 'WMS_RCS_RACK_OPERATION',
    status: 'SENT',
    payload_json: {
      callback_type: 'WMS_RACK_ARRIVED',
      operation_key: 'external:smt_rack_bin:trace-001:RACK_OPERATION',
      target_position_code: 'SINGLE_LAYER_A',
      rack_code: 'RACK-001',
      rack_kind: 'SINGLE_LAYER'
    },
    is_current_action: true,
    is_actionable: true,
    ...overrides
  }
}

describe('SandboxExternalCallbackComposer', () => {
  it('shows editable callback payload generated from external HTTP outbox', () => {
    const wrapper = mount(SandboxExternalCallbackComposer, {
      props: {
        outbox: createExternalOutbox()
      },
      global: {
        stubs: {
          ElAlert: true,
          ElButton: {
            template: '<button><slot /></button>'
          },
          ElCard: {
            template: '<section><slot name="header" /><slot /></section>'
          },
          ElForm: {
            template: '<form><slot /></form>'
          },
          ElFormItem: {
            template: '<div><slot /></div>'
          },
          ElInput: {
            props: ['modelValue'],
            template: '<textarea data-test="callback-payload-json" :value="modelValue" />'
          }
        }
      }
    })

    const payloadJson =
      wrapper.findAll('[data-test="callback-payload-json"]').at(1)?.attributes('value') ?? ''
    expect(payloadJson).toContain('"callback_type": "WMS_RACK_ARRIVED"')
    expect(payloadJson).toContain('"operation_key": "external:smt_rack_bin:trace-001:RACK_OPERATION"')
    expect(payloadJson).toContain('"position_code": "SINGLE_LAYER_A"')
    expect(payloadJson).toContain('"rack_code": "RACK-001"')
  })
})
