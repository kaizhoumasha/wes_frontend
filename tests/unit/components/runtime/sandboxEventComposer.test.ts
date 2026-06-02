import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SandboxEventComposer from '@/components/runtime/sandbox/SandboxEventComposer.vue'

const mocks = vi.hoisted(() => {
  const sandboxTemplatesSend = vi.fn()
  return {
    sandboxTemplatesSend,
    runtimeApiMethods: {
      sandboxTemplates: vi.fn(() => ({ send: sandboxTemplatesSend })),
      sandboxEvent: vi.fn(() => ({ send: vi.fn() }))
    },
    warning: vi.fn()
  }
})

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

vi.mock('element-plus', async importOriginal => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessage: {
      warning: mocks.warning,
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

function mountComposer(props: Record<string, unknown> = {}) {
  return mount(SandboxEventComposer, {
    props: {
      worklineId: 45,
      deviceId: 301,
      deviceName: 'ARM03',
      deviceCode: 'ARM03',
      deviceRole: 'ROBOT',
      deviceStatus: 'IDLE',
      ...props
    },
    global: {
      stubs: {
        ElAlert: { template: '<div><slot name="title" /><slot /></div>' },
        ElButton: {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template:
            '<button :disabled="disabled" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
        },
        ElDivider: true,
        ElForm: { template: '<form><slot /></form>' },
        ElFormItem: { template: '<div><slot /></div>' },
        ElInput: { template: '<input />' },
        ElOption: true,
        ElSelect: { template: '<div><slot /></div>' },
        ElTag: { template: '<span><slot /></span>' }
      }
    }
  })
}

describe('SandboxEventComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.sandboxTemplatesSend.mockResolvedValue({
      event_templates: [
        { event_type: 'WORKLINE_START_REQUESTED', label: '现场 START', payload_template: {} },
        { event_type: 'ESTOP_PRESSED', label: '急停', payload_template: {} },
        { event_type: 'SCAN_COMPLETED', label: '扫码完成', payload_template: {} }
      ],
      result_templates: []
    })
  })

  it('excludes reserved START and ESTOP events from normal production templates', async () => {
    const wrapper = mountComposer()
    await flushPromises()

    expect(wrapper.text()).toContain('扫码完成')
    expect(wrapper.text()).not.toContain('现场 START')
    expect(wrapper.text()).not.toContain('急停')
  })

  it('shows the supplied non-READY disabled reason', async () => {
    const wrapper = mountComposer({
      disabled: true,
      disabledReason: '工作线未 START，等待现场硬件 START'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('工作线未 START')
    expect(wrapper.text()).toContain('等待现场硬件 START')
  })
})
