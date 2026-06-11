import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRuntimeSSE } from '@/composables/useRuntimeSSE'

const sseMock = vi.hoisted(() => {
  type Listener = (event: { type: string; data: unknown; original: MessageEvent }) => void
  type StateListener = (state: string) => void

  const listeners = new Map<string, Set<Listener>>()
  const stateListeners = new Set<StateListener>()

  const api = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    getState: vi.fn(() => 'connected'),
    on: vi.fn((eventType: string, listener: Listener) => {
      const eventListeners = listeners.get(eventType) ?? new Set<Listener>()
      eventListeners.add(listener)
      listeners.set(eventType, eventListeners)
      return () => {
        eventListeners.delete(listener)
      }
    }),
    onStateChange: vi.fn((listener: StateListener) => {
      stateListeners.add(listener)
      listener('connected')
      return () => {
        stateListeners.delete(listener)
      }
    }),
    emit(eventType: string, data: unknown) {
      const event = {
        type: eventType,
        data,
        original: new MessageEvent(eventType, { data: JSON.stringify(data) })
      }
      listeners.get(eventType)?.forEach(listener => listener(event))
    },
    reset() {
      listeners.clear()
      stateListeners.clear()
      api.connect.mockClear()
      api.disconnect.mockClear()
      api.getState.mockClear()
      api.on.mockClear()
      api.onStateChange.mockClear()
    }
  }

  return api
})

vi.mock('@/api/services/sse-client', () => ({
  useSSE: () => ({
    connect: sseMock.connect,
    disconnect: sseMock.disconnect,
    getState: sseMock.getState,
    on: sseMock.on,
    onStateChange: sseMock.onStateChange
  })
}))

const RuntimeSSEHost = defineComponent({
  setup() {
    return useRuntimeSSE(true)
  },
  template: '<div>{{ lastEvent?.entity ?? "empty" }}</div>'
})

describe('useRuntimeSSE', () => {
  beforeEach(() => {
    sseMock.reset()
  })

  it('accepts runtime events delivered through the generic SSE message channel', async () => {
    const wrapper = mount(RuntimeSSEHost)

    expect(sseMock.connect).toHaveBeenCalledOnce()
    expect(sseMock.on).toHaveBeenCalledWith('message', expect.any(Function))

    sseMock.emit('message', {
      domain: 'workline_runtime',
      entity: 'session',
      action: 'updated',
      keys: {
        workline_id: 45,
        session_id: 553
      }
    })
    await nextTick()

    expect(wrapper.text()).toBe('session')
  })

  it('ignores non-runtime events delivered through the generic SSE message channel', async () => {
    const wrapper = mount(RuntimeSSEHost)

    sseMock.emit('message', {
      title: '系统通知',
      message: '非运行态事件'
    })
    await nextTick()

    expect(wrapper.text()).toBe('empty')
  })
})
