import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSSE, type SSEConnectionState, type SSEEvent } from '@/api/services/sse-client'
import { isRuntimeDomainAllowed } from '@/utils/runtime-event'

export interface RuntimeSSEPayload {
  domain?: string
  entity?: string
  action?: string
  keys?: Record<string, unknown>
  payload?: Record<string, unknown>
}

function isRuntimeSSEPayload(value: unknown): value is RuntimeSSEPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const payload = value as RuntimeSSEPayload
  return Boolean(payload.domain || payload.entity || payload.action || payload.keys)
}

export function useRuntimeSSE(autoConnect = true) {
  const sse = useSSE()
  const live = ref(true)
  const state = ref<SSEConnectionState>(sse.getState())
  const lastEvent = ref<RuntimeSSEPayload | null>(null)
  const lastRawEvent = ref<SSEEvent | null>(null)

  const cleanupState = sse.onStateChange(nextState => {
    state.value = nextState
  })

  const cleanupMessage = sse.on('message', event => {
    if (!isRuntimeSSEPayload(event.data)) return
    const payload = event.data
    if (!isRuntimeDomainAllowed(payload.domain)) {
      return
    }
    lastEvent.value = payload
    lastRawEvent.value = event
  })

  function connect() {
    if (!live.value) {
      live.value = true
    }
    sse.connect()
  }

  function disconnect() {
    sse.disconnect()
  }

  function toggleLive(next?: boolean) {
    const target = next ?? !live.value
    live.value = target
    if (target) {
      sse.connect()
      return
    }
    sse.disconnect()
  }

  onMounted(() => {
    if (autoConnect) {
      sse.connect()
    }
  })

  onBeforeUnmount(() => {
    cleanupState()
    cleanupMessage()
    if (autoConnect) {
      sse.disconnect()
    }
  })

  return {
    live,
    state,
    lastEvent,
    lastRawEvent,
    connect,
    disconnect,
    toggleLive
  }
}
