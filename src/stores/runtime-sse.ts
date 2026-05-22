import { computed, ref, readonly } from 'vue'
import { defineStore } from 'pinia'
import type { SSEConnectionState } from '@/api/services/sse-client'
import {
  connect as sseConnect,
  disconnect as sseDisconnect,
  addEventListener,
  addStateListener,
  getConnectionState
} from '@/api/services/sse-client'
import { isRuntimeDomainAllowed } from '@/utils/runtime-event'
import { ESTOPPED_RUNTIME_STATUS } from '@/constants/runtime-safety'
import type { RuntimeTone } from '@/utils/runtime-display'

export interface RuntimeSSEPayload {
  domain?: string
  entity?: string
  action?: string
  keys?: Record<string, unknown>
  payload?: Record<string, unknown>
}

function isRuntimeSSEPayload(value: unknown): value is RuntimeSSEPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const p = value as RuntimeSSEPayload
  return Boolean(p.domain || p.entity || p.action || p.keys)
}

const NOTIFICATION_COOLDOWN_MS = 60_000
const STALE_THRESHOLD_MS = 15_000

export const useRuntimeSSEStore = defineStore('runtime-sse', () => {
  const live = ref(true)
  const state = ref<SSEConnectionState>(getConnectionState())
  const lastEvent = ref<RuntimeSSEPayload | null>(null)
  const lastRefreshedAt = ref<Date | null>(null)
  const lastEventReceivedAt = ref<number>(0)

  const notificationCooldowns = new Map<string, number>()
  let listenersInitialized = false

  function ensureListeners(): void {
    if (listenersInitialized) return
    listenersInitialized = true

    addStateListener(nextState => {
      state.value = nextState
    })

    addEventListener('message', event => {
      if (!isRuntimeSSEPayload(event.data)) return
      const payload = event.data
      if (!isRuntimeDomainAllowed(payload.domain)) return

      lastEvent.value = payload
      lastEventReceivedAt.value = Date.now()

      tryNotify(payload)
    })
  }

  function connect(): void {
    ensureListeners()
    if (!live.value) {
      live.value = true
    }
    sseConnect()
  }

  function disconnect(): void {
    sseDisconnect()
  }

  function toggleLive(next?: boolean): void {
    const target = next ?? !live.value
    live.value = target
    if (target) {
      sseConnect()
    } else {
      sseDisconnect()
    }
  }

  function markRefreshedAt(value: Date = new Date()): void {
    lastRefreshedAt.value = value
  }

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

  const isStale = computed<boolean>(() => {
    if (!live.value || lastEventReceivedAt.value === 0) return false
    return Date.now() - lastEventReceivedAt.value > STALE_THRESHOLD_MS
  })

  // ---- Desktop notifications ----

  function tryNotify(payload: RuntimeSSEPayload): void {
    if (!live.value) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'denied') return

    const worklineId = extractWorklineId(payload)
    if (!worklineId) return

    const { title, body } = buildNotificationContent(payload)
    if (!title) return

    const lastNotified = notificationCooldowns.get(worklineId)
    if (lastNotified && Date.now() - lastNotified < NOTIFICATION_COOLDOWN_MS) return

    notificationCooldowns.set(worklineId, Date.now())

    if (Notification.permission === 'granted') {
      const n = new Notification(title, { body, tag: worklineId })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    }
  }

  function extractWorklineId(payload: RuntimeSSEPayload): string | null {
    const id = payload.keys?.workline_id ?? payload.payload?.workline_id
    return id != null ? String(id) : null
  }

  function buildNotificationContent(
    payload: RuntimeSSEPayload
  ): { title: string; body: string } {
    const isEstop =
      payload.payload?.runtime_status === ESTOPPED_RUNTIME_STATUS ||
      payload.keys?.status === ESTOPPED_RUNTIME_STATUS
    const isHold = payload.entity === 'runtime_hold' || payload.domain === 'runtime_hold'

    if (isEstop) {
      return {
        title: '工作线急停',
        body: `工作线 ${extractWorklineId(payload) ?? '未知'} 触发急停`
      }
    }
    if (isHold) {
      return {
        title: '新 Runtime Hold',
        body: `工作线 ${extractWorklineId(payload) ?? '未知'} 创建新的阻断`
      }
    }
    return { title: '', body: '' }
  }

  return {
    live: readonly(live),
    state: readonly(state),
    lastEvent: readonly(lastEvent),
    lastRefreshedAt: readonly(lastRefreshedAt),
    connectionTone,
    connectionLabel,
    isStale,
    connect,
    disconnect,
    toggleLive,
    markRefreshedAt,
  }
})
