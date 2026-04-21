import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { SSEConnectionState } from '@/api/services/sse-client'
import { useRuntimeSSE, type RuntimeSSEPayload } from '@/composables/useRuntimeSSE'
import type { RuntimeTone } from '@/utils/runtime-display'

export interface UseRuntimePageChromeResult {
  live: Ref<boolean>
  state: Ref<SSEConnectionState>
  lastEvent: Ref<RuntimeSSEPayload | null>
  lastRefreshedAt: Ref<Date | null>
  connectionTone: ComputedRef<RuntimeTone>
  connectionLabel: ComputedRef<string>
  toggleLive: (next?: boolean) => void
  markRefreshedAt: (value?: Date) => void
}

export function useRuntimePageChrome(): UseRuntimePageChromeResult {
  const { live, state, toggleLive, lastEvent } = useRuntimeSSE()
  const lastRefreshedAt = ref<Date | null>(null)

  const connectionTone = computed<RuntimeTone>(() => {
    if (!live.value) return 'warning'
    if (state.value === 'connected') return 'success'
    if (state.value === 'connecting') return 'primary'
    if (state.value === 'error') return 'danger'
    return 'info'
  })

  const connectionLabel = computed<string>(() => {
    if (!live.value) return 'SSE Frozen'
    if (state.value === 'connected') return 'SSE Connected'
    if (state.value === 'connecting') return 'SSE Reconnecting'
    if (state.value === 'error') return 'SSE Error'
    return `SSE ${state.value}`
  })

  function markRefreshedAt(value: Date = new Date()): void {
    lastRefreshedAt.value = value
  }

  return {
    live,
    state,
    lastEvent,
    lastRefreshedAt,
    connectionTone,
    connectionLabel,
    toggleLive,
    markRefreshedAt,
  }
}
