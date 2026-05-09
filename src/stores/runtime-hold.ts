import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type {
  NgReasonOption,
  ResolveRuntimeHoldRequest,
  ResolveRuntimeHoldResponse,
  RuntimeHoldConflictModel,
  RuntimeHoldDetailResponse,
  RuntimeHoldReleaseEligibility
} from '@/types/runtime'

const RUNTIME_HOLD_CONFLICT_CODES = new Set([
  'RUNTIME_HOLD_VERSION_CONFLICT',
  'RUNTIME_HOLD_EVIDENCE_CHANGED',
  'RUNTIME_HOLD_ALREADY_RESOLVED',
  'RUNTIME_HOLD_MATERIAL_CONFLICT'
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function extractRuntimeHoldConflict(error: unknown): RuntimeHoldConflictModel | null {
  if (!isRecord(error)) return null

  const data = isRecord(error.data) ? error.data : {}
  const code = optionalString(error.code)
  const isRuntimeHoldConflict =
    (code !== undefined && RUNTIME_HOLD_CONFLICT_CODES.has(code)) ||
    data.current_hold_version !== undefined ||
    data.current_status !== undefined ||
    data.release_eligibility !== undefined

  if (!isRuntimeHoldConflict) return null

  return {
    code,
    message: optionalString(error.message) ?? 'Runtime Hold 决策已过期',
    current_hold_version: optionalNumber(data.current_hold_version),
    current_status: optionalString(data.current_status),
    release_eligibility: isRecord(data.release_eligibility)
      ? (data.release_eligibility as RuntimeHoldReleaseEligibility)
      : undefined,
    refresh_url: optionalString(data.refresh_url),
    material_identity_key: optionalString(data.material_identity_key),
    existing_ng_return_item_id: optionalNumber(data.existing_ng_return_item_id),
    existing_runtime_hold_id: optionalNumber(data.existing_runtime_hold_id),
    existing_status: optionalString(data.existing_status)
  }
}

export const useRuntimeHoldStore = defineStore('runtime-hold', () => {
  const detail = ref<RuntimeHoldDetailResponse | null>(null)
  const ngReasons = ref<NgReasonOption[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const lastConflict = ref<RuntimeHoldConflictModel | null>(null)
  const ngReasonLoadError = ref<unknown>(null)

  const canResolve = computed(() => detail.value?.release_eligibility.can_resolve ?? false)
  const ngReasonCatalogReady = computed(
    () => ngReasons.value.length > 0 && ngReasonLoadError.value === null
  )

  async function loadHold(holdId: number): Promise<RuntimeHoldDetailResponse> {
    loading.value = true
    try {
      const response = await runtimeApiMethods.runtimeHoldDetail(holdId).send()
      detail.value = response
      lastConflict.value = null
      return response
    } finally {
      loading.value = false
    }
  }

  async function loadNgReasons(
    pluginKey?: string | null,
    contractVersion?: string | null
  ): Promise<NgReasonOption[]> {
    ngReasonLoadError.value = null
    try {
      const response = await runtimeApiMethods
        .runtimeHoldNgReasons({ plugin_key: pluginKey, contract_version: contractVersion })
        .send()
      ngReasons.value = response
      return response
    } catch (error) {
      ngReasons.value = []
      ngReasonLoadError.value = error
      throw error
    }
  }

  function applyConflictModel(conflict: RuntimeHoldConflictModel): void {
    lastConflict.value = conflict
    if (detail.value === null) return

    detail.value = {
      ...detail.value,
      summary: {
        ...detail.value.summary,
        version: conflict.current_hold_version ?? detail.value.summary.version,
        status: conflict.current_status ?? detail.value.summary.status
      },
      release_eligibility: conflict.release_eligibility ?? detail.value.release_eligibility
    }
  }

  function assertCanSubmit(payload: ResolveRuntimeHoldRequest): void {
    if (payload.material_disposition !== 'RETURN_TO_NG') return
    if (ngReasonLoadError.value !== null || ngReasons.value.length === 0) {
      throw new Error('NG reason catalog is not available')
    }
  }

  async function resolveHold(
    holdId: number,
    payload: ResolveRuntimeHoldRequest
  ): Promise<ResolveRuntimeHoldResponse> {
    assertCanSubmit(payload)
    submitting.value = true
    lastConflict.value = null
    try {
      return await runtimeApiMethods.resolveRuntimeHold(holdId, payload).send()
    } catch (error) {
      const conflict = extractRuntimeHoldConflict(error)
      if (conflict !== null) {
        applyConflictModel(conflict)
      }
      throw error
    } finally {
      submitting.value = false
    }
  }

  return {
    detail,
    ngReasons,
    loading,
    submitting,
    lastConflict,
    ngReasonLoadError,
    canResolve,
    ngReasonCatalogReady,
    loadHold,
    loadNgReasons,
    resolveHold,
    applyConflictModel
  }
})
