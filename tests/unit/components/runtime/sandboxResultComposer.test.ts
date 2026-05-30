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
    dispatch_key: 'device-command:CMD-20260529-PICK_AND_PUT-A33C3A15',
    dispatch_type: 'DEVICE_COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM03',
    status: 'ACKED',
    payload_json: {
      command_code: 'CMD-20260529-PICK_AND_PUT-A33C3A15',
      task_type: 'PICK_AND_PUT',
      command_type: 'PICK_AND_PUT',
      params: {
        from_location: 'ARM01',
        to_location: 'PIPELINE-IN-01',
        six_in_one: {
          PkgID: 'SVYU00125TP4LCR02_1'
        }
      }
    },
    ...overrides
  }
}

function mountComposer(outbox: SandboxPendingOutbox) {
  return mount(SandboxResultComposer, {
    props: {
      outbox
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
}

describe('SandboxResultComposer', () => {
  it('uses task_type to generate measurement result payload for PICK_AND_PUT commands', async () => {
    const wrapper = mountComposer(createOutbox())

    await wrapper.get('[data-test="select-success"]').trigger('click')

    const payloadJson = wrapper.get('[data-test="payload-json"]').attributes('value') ?? ''
    expect(payloadJson).toContain('"PkgID": "SVYU00125TP4LCR02_1"')
    expect(payloadJson).toContain('"from_location": "ARM01"')
    expect(payloadJson).toContain('"to_location": "PIPELINE-IN-01"')
    expect(payloadJson).toContain('"reel_diameter"')
    expect(payloadJson).toContain('"reel_thickness"')
    expect(payloadJson).toContain('"measurement_result": "OK"')
    expect(payloadJson).not.toContain('"pick_and_put_result"')
    expect(payloadJson).not.toContain('"command_code"')
  })

  it('keeps MOVE_FORWARD success payload empty because callbacks only carry result status', async () => {
    const wrapper = mountComposer(
      createOutbox({
        dispatch_key: 'device-command:CMD-20260529-MOVE_FORWARD-A33C3A15',
        payload_json: {
          command_code: 'CMD-20260529-MOVE_FORWARD-A33C3A15',
          task_type: 'MOVE_FORWARD',
          command_type: 'MOVE_FORWARD',
          params: {
            from_location: 'PIPELINE-IN-01',
            to_location: 'SORTER-01',
            six_in_one: {
              PkgID: 'SVYU00125TP4LCR02_1'
            }
          }
        }
      })
    )

    await wrapper.get('[data-test="select-success"]').trigger('click')

    const payloadJson = wrapper.get('[data-test="payload-json"]').attributes('value') ?? ''
    expect(JSON.parse(payloadJson)).toEqual({})
  })
})
