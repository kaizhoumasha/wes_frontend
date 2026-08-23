/* eslint-disable vue/one-component-per-file -- test-local component stubs */
import { defineComponent, nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ManualDebugCommandDialog from '@/views/ops/device-diagnostics/ManualDebugCommandDialog.vue'

const apiMocks = vi.hoisted(() => ({
  debugPreflight: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({
      endpoint_base_url: 'http://10.24.209.26:8080',
      devices: [
        {
          device: {
            device_code: 'ARM-01',
            device_name: 'Robot Arm',
            device_type: 'ROBOT_ARM',
            role: null,
            supported_commands: ['MOVE'],
            supported_events: ['ARRIVED']
          },
          state: {
            device_code: 'ARM-01',
            mode: 'AUTO',
            status: 'IDLE',
            is_online: true,
            current_command_code: null,
            scenario: null,
            updated_at: 1
          },
          admissible: true,
          rejection_code: null
        }
      ]
    })
  })),
  debug: vi.fn(),
  getByCommandCode: vi.fn()
}))

vi.mock('@/api/modules/device', () => ({ deviceApiMethods: apiMocks }))

const StandardDialogStub = defineComponent({
  name: 'StandardDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' }
  },
  template:
    '<section v-if="modelValue"><h2>{{ title }}</h2><slot /><slot name="footer" /></section>'
})
const AppButtonStub = defineComponent({
  name: 'AppButton',
  emits: ['click'],
  template: '<button @click="$emit(\'click\')"><slot /></button>'
})
const SlotStub = defineComponent({ template: '<div><slot /></div>' })
const ElAlertStub = defineComponent({
  props: { title: { type: String, default: '' } },
  template: '<div>{{ title }}</div>'
})
const elementStubs = {
  ElAlert: ElAlertStub,
  ElForm: SlotStub,
  ElFormItem: SlotStub,
  ElInput: true,
  ElInputNumber: true,
  ElSelect: SlotStub,
  ElOption: true,
  ElCheckbox: SlotStub
}

describe('ManualDebugCommandDialog', () => {
  it('renders truthful real-device wording, immutable preview and no Authorization data', async () => {
    const wrapper = shallowMount(ManualDebugCommandDialog, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          StandardDialog: StandardDialogStub,
          AppButton: AppButtonStub,
          ...elementStubs
        }
      }
    })
    const exposed = wrapper.vm as unknown as {
      open: (candidate?: string) => void
      command: {
        form: Record<string, string | number>
        preflight: () => Promise<void>
        preview: () => void
        confirmRealAction: { value: boolean }
      }
    }
    exposed.open('ARM-01')
    exposed.command.form.endpointBaseUrl = 'http://10.24.209.26:8080'
    await exposed.command.preflight()
    exposed.command.form.deviceCode = 'ARM-01'
    exposed.command.form.taskType = 'MOVE'
    exposed.command.form.paramsText = '{}'
    exposed.command.form.reason = '现场供应商联调'
    exposed.command.preview()
    await nextTick()

    expect(wrapper.text()).toContain('现场联调下发')
    expect(wrapper.text()).toContain('确认创建真实设备命令')
    expect(wrapper.text()).toContain('不代表设备已完成')
    expect(wrapper.text()).not.toContain('Authorization')
  })

  it('surfaces invalid JSON and restores launcher focus after close', async () => {
    const wrapper = shallowMount(ManualDebugCommandDialog, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          StandardDialog: StandardDialogStub,
          AppButton: AppButtonStub,
          ...elementStubs
        }
      }
    })
    const focus = vi.fn()
    const launcher = document.createElement('button')
    launcher.focus = focus
    const exposed = wrapper.vm as unknown as {
      open: (candidate: string | undefined, launcher: HTMLElement) => void
      close: () => void
      command: {
        form: Record<string, string | number>
        preflight: () => Promise<void>
      }
    }
    exposed.open('ARM-01', launcher)
    exposed.command.form.endpointBaseUrl = 'http://10.24.209.26:8080'
    await exposed.command.preflight()
    exposed.command.form.deviceCode = 'ARM-01'
    exposed.command.form.taskType = 'MOVE'
    exposed.command.form.paramsText = '[]'
    exposed.command.form.reason = '现场联调'

    const previewButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('生成不可变预览'))
    await previewButton?.trigger('click')
    expect(wrapper.text()).toContain('params 必须是 JSON object')

    exposed.close()
    await nextTick()
    expect(focus).toHaveBeenCalledOnce()
  })
})
