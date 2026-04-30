import { computed, type ComputedRef } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { RuntimeWorklineSummary } from '@/types/runtime'

export type WorklineMode = 'live' | 'trace' | 'sandbox'
export type SandboxPermission = 'pending' | 'allowed' | 'denied'

export interface UseWorklineModeResult {
  worklineId: ComputedRef<string | undefined>
  deviceId: ComputedRef<string | undefined>
  sessionId: ComputedRef<string | undefined>
  traceId: ComputedRef<string | undefined>
  mode: ComputedRef<WorklineMode>
  sandboxAllowed: ComputedRef<SandboxPermission>
  effectiveMode: ComputedRef<WorklineMode>
  switchToLive: () => void
  switchToTrace: (sessionId: string, traceId?: string) => void
  switchToSandbox: () => void
  selectDevice: (deviceId: string) => void
  selectWorkline: (worklineId: string | number) => void
}

export function useWorklineMode(
  route: RouteLocationNormalized,
  router: { push: (to: { query: Record<string, string | undefined> }) => Promise<unknown> },
  currentWorkline: ComputedRef<RuntimeWorklineSummary | null | undefined>,
): UseWorklineModeResult {
  const worklineId = computed(() => route.query.worklineId as string | undefined)
  const deviceId = computed(() => route.query.deviceId as string | undefined)
  const sessionId = computed(() => route.query.sessionId as string | undefined)
  const traceId = computed(() => route.query.traceId as string | undefined)

  const mode = computed<WorklineMode>(() => {
    const explicit = route.query.mode as string
    if (explicit === 'sandbox') return 'sandbox'
    if (sessionId.value || traceId.value || explicit === 'trace') return 'trace'
    return 'live'
  })

  const sandboxAllowed = computed<SandboxPermission>(() => {
    if (!currentWorkline.value) return 'pending'
    return currentWorkline.value.run_mode === 'SIMULATION' ? 'allowed' : 'denied'
  })

  const effectiveMode = computed<WorklineMode>(() =>
    mode.value === 'sandbox' && sandboxAllowed.value !== 'allowed' ? 'live' : mode.value,
  )

  function buildQuery(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
    return {
      worklineId: worklineId.value,
      deviceId: deviceId.value,
      sessionId: sessionId.value,
      traceId: traceId.value,
      mode: mode.value === 'live' ? undefined : mode.value,
      ...overrides,
    }
  }

  function cleanQuery(query: Record<string, string | undefined>): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        result[key] = value
      }
    }
    return result
  }

  function switchToLive() {
    router.push({ query: cleanQuery(buildQuery({ mode: undefined, sessionId: undefined, traceId: undefined })) })
  }

  function switchToTrace(sid: string, tid?: string) {
    router.push({
      query: cleanQuery(buildQuery({ mode: 'trace', sessionId: sid, traceId: tid })),
    })
  }

  function switchToSandbox() {
    if (sandboxAllowed.value !== 'allowed') return
    router.push({
      query: cleanQuery(buildQuery({ mode: 'sandbox', sessionId: undefined, traceId: undefined })),
    })
  }

  function selectDevice(did: string) {
    router.push({ query: cleanQuery(buildQuery({ deviceId: did })) })
  }

  function selectWorkline(wid: string | number) {
    router.push({
      query: cleanQuery({
        worklineId: String(wid),
        deviceId: undefined,
        sessionId: undefined,
        traceId: undefined,
        mode: undefined,
      }),
    })
  }

  return {
    worklineId,
    deviceId,
    sessionId,
    traceId,
    mode,
    sandboxAllowed,
    effectiveMode,
    switchToLive,
    switchToTrace,
    switchToSandbox,
    selectDevice,
    selectWorkline,
  }
}
