import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SandboxPendingOutbox } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const pendingSend = vi.fn()
  const completedSend = vi.fn()
  const refresh = vi.fn()

  return {
    pendingSend,
    completedSend,
    refresh,
    runtimeApiMethods: {
      sandboxPending: vi.fn(() => ({ send: pendingSend })),
      sandboxCompleted: vi.fn(() => ({ send: completedSend }))
    }
  }
})

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

vi.mock('@/composables/useRuntimeSSE', () => ({
  useRuntimeSSE: () => ({ lastEvent: ref(null) })
}))

vi.mock('@/stores/workline-runtime', () => ({
  useWorklineRuntimeStore: () => ({
    detail: { active_sessions: [] }
  })
}))

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 20,
    dispatch_key: 'device-command:CMD-1',
    dispatch_type: 'COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM01',
    status: 'ACKED',
    payload_json: {},
    ...overrides
  }
}

async function flushAsync() {
  await Promise.resolve()
  await nextTick()
}

describe('sandbox result flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.pendingSend
      .mockResolvedValueOnce([createOutbox()])
      .mockResolvedValueOnce([createOutbox()])
      .mockResolvedValue([
        createOutbox({ id: 2, session_id: 11, dispatch_key: 'device-command:CMD-2' })
      ])
    mocks.completedSend.mockResolvedValue([])
  })

  it('locks the submitted result immediately and refreshes later pending operations', async () => {
    const { default: SandboxWorkbench } =
      await import('@/components/common/runtime/SandboxWorkbench.vue')

    const wrapper = mount(SandboxWorkbench, {
      props: {
        worklineId: 20,
        devices: [{ id: 101, device_code: 'ARM01', device_name: '机械臂' }],
        deviceId: 101,
        safetyLocked: false
      },
      global: {
        stubs: {
          SandboxCycleStatus: true,
          WorklineRouteMap: true,
          SandboxEventComposer: true,
          ElAlert: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElDivider: true,
          ElDrawer: {
            props: ['modelValue'],
            template: '<aside v-if="modelValue"><slot /></aside>'
          },
          ElButton: {
            props: ['disabled', 'loading'],
            template:
              '<button :disabled="disabled" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
          },
          SandboxActionList: {
            props: ['items', 'submittedResultOutboxIds', 'submittedResultOutboxKeys'],
            emits: ['result'],
            template:
              '<div><button v-for="item in items" :key="item.id" class="result-action" :disabled="submittedResultOutboxIds?.has(item.id) || submittedResultOutboxKeys?.has(item.dispatch_key)" @click="$emit(`result`, item)">模拟 Result {{ item.id }}</button></div>'
          },
          SandboxResultComposer: {
            props: ['outbox', 'disabled'],
            emits: ['submitted'],
            template:
              '<button class="submit-result" :disabled="disabled" @click="$emit(`submitted`, outbox)">提交 Result</button>'
          }
        }
      }
    })

    await flushAsync()

    expect(wrapper.text()).toContain('模拟 Result 1')

    await wrapper.get('.result-action').trigger('click')
    await nextTick()
    await wrapper.get('.submit-result').trigger('click')
    await flushAsync()

    expect(wrapper.text()).toContain('模拟 Result 1')
    expect(wrapper.get('.result-action').attributes('disabled')).toBeDefined()

    await vi.advanceTimersByTimeAsync(800)
    await flushAsync()

    expect(wrapper.emitted('refresh')).toBeTruthy()
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledWith(50, 20)
    expect(wrapper.text()).toContain('模拟 Result 2')
  })

  it('uses StandardDrawer presets for sandbox event and result drawers', async () => {
    const { default: SandboxWorkbench } =
      await import('@/components/common/runtime/SandboxWorkbench.vue')

    const wrapper = mount(SandboxWorkbench, {
      props: {
        worklineId: 20,
        devices: [{ id: 101, device_code: 'ARM01', device_name: '机械臂' }],
        deviceId: 101,
        safetyLocked: false
      },
      global: {
        stubs: {
          SandboxCycleStatus: true,
          WorklineRouteMap: true,
          SandboxEventComposer: true,
          ElAlert: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElDivider: true,
          ElDrawer: {
            props: ['modelValue', 'size', 'class'],
            template:
              '<aside v-if="modelValue" :class="$attrs.class" :data-size="size"><slot /></aside>'
          },
          ElButton: {
            props: ['disabled', 'loading'],
            template:
              '<button :disabled="disabled" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
          },
          SandboxActionList: {
            props: ['items'],
            emits: ['result'],
            template:
              '<div><button v-for="item in items" :key="item.id" class="result-action" @click="$emit(`result`, item)">模拟 Result {{ item.id }}</button></div>'
          },
          SandboxResultComposer: true
        }
      }
    })

    await flushAsync()

    await wrapper.get('.sandbox-workbench__header-actions button').trigger('click')
    await nextTick()

    expect(wrapper.findAll('aside').map(drawer => drawer.attributes('data-size'))).toContain(
      'min(640px, 92vw)'
    )

    await wrapper.get('.result-action').trigger('click')
    await nextTick()

    expect(wrapper.findAll('aside').map(drawer => drawer.attributes('data-size'))).toContain(
      'min(800px, 92vw)'
    )
  })

  it('disables clear-estop action when caller lacks permission', async () => {
    const { default: SandboxWorkbench } =
      await import('@/components/common/runtime/SandboxWorkbench.vue')

    const wrapper = mount(SandboxWorkbench, {
      props: {
        worklineId: 20,
        devices: [{ id: 101, device_code: 'ARM01', device_name: '机械臂' }],
        deviceId: 101,
        safetyLocked: true,
        safetyLockReason: '软件急停冻结',
        canClearEstop: false
      },
      global: {
        stubs: {
          SandboxCycleStatus: true,
          WorklineRouteMap: true,
          SandboxEventComposer: true,
          ElAlert: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElDivider: true,
          ElDrawer: {
            props: ['modelValue'],
            template: '<aside v-if="modelValue"><slot /></aside>'
          },
          ElButton: {
            props: ['disabled', 'loading', 'title'],
            template:
              '<button :disabled="disabled" :title="title" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
          },
          SandboxActionList: true,
          SandboxResultComposer: true
        }
      }
    })

    await flushAsync()

    const clearButton = wrapper.findAll('button').find(button => button.text().includes('恢复接收'))

    expect(clearButton).toBeDefined()
    expect(clearButton?.attributes('disabled')).toBeDefined()
    expect(clearButton?.attributes('title')).toContain('biz:workline:clear-estop')
  })
})
