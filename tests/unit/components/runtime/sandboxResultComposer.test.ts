import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SandboxResultComposer from '@/components/runtime/sandbox/SandboxResultComposer.vue'
import type { SandboxPendingOutbox } from '@/types/runtime'

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    sandboxResult: vi.fn(() => ({ send: vi.fn() }))
  }
}))

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 45,
    dispatch_key: 'device-command:CMD-20260529-MEASUREMENT_REEL-A33C3A15',
    dispatch_type: 'DEVICE_COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM03',
    status: 'ACKED',
    payload_json: {
      command_code: 'CMD-20260529-MEASUREMENT_REEL-A33C3A15',
      task_type: 'MEASUREMENT_REEL',
      command_type: 'MEASUREMENT_REEL',
      params: {
        six_in_one: {
          PkgID: 'SVYU00125TP4LCR02_1'
        }
      }
    },
    ...overrides
  }
}

describe('SandboxResultComposer', () => {
  it('uses task_type to generate measurement result payload for device commands', async () => {
    const wrapper = mount(SandboxResultComposer, {
      props: {
        outbox: createOutbox()
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
            template: '<textarea data-test="payload-json" :value="modelValue" />'
          },
          ElOption: true,
          ElSelect: {
            template:
              '<button data-test="select-success" @click="$emit(`change`, `SUCCESS`)"><slot /></button>'
          }
        }
      }
    })

    await wrapper.get('[data-test="select-success"]').trigger('click')

    const payloadJson = wrapper.get('[data-test="payload-json"]').attributes('value') ?? ''
    expect(payloadJson).toContain('"PkgID": "SVYU00125TP4LCR02_1"')
    expect(payloadJson).toContain('"reel_diameter"')
    expect(payloadJson).toContain('"reel_thickness"')
    expect(payloadJson).not.toContain('"command_code"')
  })
})
