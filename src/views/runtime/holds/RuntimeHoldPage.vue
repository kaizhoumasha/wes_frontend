<template>
  <main class="runtime-hold-page">
    <div
      v-if="store.loading && !store.detail"
      class="runtime-hold-state"
    >
      加载中
    </div>

    <div
      v-else-if="loadError"
      class="runtime-hold-state"
    >
      <h1>无法打开 Runtime Hold</h1>
      <p>{{ loadError }}</p>
      <button
        data-test="runtime-hold-retry"
        type="button"
        @click="load"
      >
        重试
      </button>
    </div>

    <template v-else-if="detail">
      <RuntimeHoldDecisionBar
        :hold-id="detail.summary.id"
        :workline-id="detail.summary.workline_id"
        :status="detail.summary.status"
        :source-reason="detail.summary.source_reason"
        :version="detail.summary.version"
        :evidence-hash="detail.release_eligibility.latest_evidence_hash"
      />

      <RuntimeHoldConflictNotice :conflict="store.lastConflict" />

      <div
        v-if="isResolved"
        class="runtime-hold-state is-compact"
      >
        已闭环
      </div>

      <div class="runtime-hold-grid">
        <section class="runtime-hold-grid__primary">
          <RuntimeHoldChecklist
            v-model="checks"
            :required-checks="detail.release_eligibility.required_checks ?? []"
          />
          <RuntimeHoldDispositionForm
            v-if="!isResolved"
            :disposition="disposition"
            :allowed-dispositions="detail.release_eligibility.allowed_material_dispositions ?? []"
            :resolution="resolution"
            :allowed-resolutions="resolutionOptions"
            :ng-reasons="store.ngReasons"
            :ng-reason-code="ngReasonCode"
            :reason-catalog-error="Boolean(store.ngReasonLoadError)"
            :ng-location-scan="ngLocationScan"
            :material-scan-payload="materialScanPayload"
            :line-clear-checked="lineClearChecked"
            :late-callback-reviewed="lateCallbackReviewed"
            :operator-note="operatorNote"
            @update:disposition="setDisposition"
            @update:resolution="value => (resolution = value)"
            @update:ng-reason-code="value => (ngReasonCode = value)"
            @update:ng-location-scan="value => (ngLocationScan = value)"
            @update:material-scan-payload="value => (materialScanPayload = value)"
            @update:line-clear-checked="value => (lineClearChecked = value)"
            @update:late-callback-reviewed="value => (lateCallbackReviewed = value)"
            @update:operator-note="value => (operatorNote = value)"
          />
        </section>

        <aside class="runtime-hold-grid__evidence">
          <RuntimeHoldEvidencePanel
            :evidence-snapshot="detail.evidence_snapshot_json"
            :failed-command-evidence="detail.failed_command_evidence"
          />
          <RuntimeHoldAuditTrail
            :summary="detail.summary"
            :source="detail.source"
          />
        </aside>
      </div>

      <div
        v-if="!isResolved"
        class="runtime-hold-submit-bar"
      >
        <button
          data-test="runtime-hold-submit"
          type="button"
          :disabled="!canSubmit || store.submitting"
          @click="submit"
        >
          确认处置
        </button>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RuntimeHoldAuditTrail from '@/components/common/runtime/RuntimeHoldAuditTrail.vue'
import RuntimeHoldChecklist from '@/components/common/runtime/RuntimeHoldChecklist.vue'
import RuntimeHoldConflictNotice from '@/components/common/runtime/RuntimeHoldConflictNotice.vue'
import RuntimeHoldDecisionBar from '@/components/common/runtime/RuntimeHoldDecisionBar.vue'
import RuntimeHoldDispositionForm from '@/components/common/runtime/RuntimeHoldDispositionForm.vue'
import RuntimeHoldEvidencePanel from '@/components/common/runtime/RuntimeHoldEvidencePanel.vue'
import { useRuntimeHoldStore } from '@/stores/runtime-hold'
import type { NgReasonOption, ResolveRuntimeHoldRequest } from '@/types/runtime'

const route = useRoute()
const store = useRuntimeHoldStore()
const loadError = ref<string | null>(null)
const checks = ref<Record<string, boolean>>({})
const disposition = ref('CONTINUE')
const resolution = ref('COMPLETED')
const ngReasonCode = ref('')
const ngLocationScan = ref('')
const materialScanPayload = ref('')
const lineClearChecked = ref(false)
const lateCallbackReviewed = ref(false)
const operatorNote = ref('')

const holdId = computed(() => Number(route.params.holdId))
const detail = computed(() => store.detail)
const isResolved = computed(() => detail.value?.release_eligibility.can_resolve === false)

const selectedReason = computed<NgReasonOption | null>(
  () => store.ngReasons.find(item => item.code === ngReasonCode.value) ?? null
)

const allowedResolutions = computed(
  () => detail.value?.release_eligibility.allowed_resolutions ?? []
)

const defaultResolution = computed(() => allowedResolutions.value[0] ?? 'COMPLETED')

const resolutionOptions = computed(() => {
  if (disposition.value !== 'RETURN_TO_NG') return allowedResolutions.value
  return allowedResolutions.value.includes('FAILED') ? ['FAILED'] : []
})

const checksComplete = computed(() => {
  const required = detail.value?.release_eligibility.required_checks ?? []
  return required.every(key => checks.value[key] === true)
})

const canSubmit = computed(() => {
  if (!detail.value || isResolved.value || !checksComplete.value || !operatorNote.value.trim()) {
    return false
  }
  if (!allowedResolutions.value.includes(resolution.value)) return false
  if (disposition.value !== 'RETURN_TO_NG') return true
  return (
    resolution.value === 'FAILED' &&
    store.ngReasonLoadError === null &&
    selectedReason.value !== null &&
    Boolean(ngLocationScan.value.trim()) &&
    Boolean(materialScanPayload.value.trim()) &&
    lineClearChecked.value &&
    lateCallbackReviewed.value
  )
})

function syncFormState(): void {
  const eligibility = detail.value?.release_eligibility
  if (!eligibility) return

  for (const key of eligibility.required_checks ?? []) {
    checks.value = { ...checks.value, [key]: checks.value[key] ?? false }
  }
  disposition.value = eligibility.allowed_material_dispositions?.[0] ?? 'CONTINUE'
  resolution.value = defaultResolution.value
}

function setDisposition(value: string): void {
  disposition.value = value
  resolution.value = value === 'RETURN_TO_NG' ? 'FAILED' : defaultResolution.value
}

async function load(): Promise<void> {
  loadError.value = null
  try {
    const loaded = await store.loadHold(holdId.value)
    syncFormState()
    await store
      .loadNgReasons(loaded.summary.plugin_key, loaded.summary.contract_version)
      .catch(() => undefined)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载失败'
  }
}

function buildPayload(): ResolveRuntimeHoldRequest {
  if (!detail.value) throw new Error('Runtime Hold detail is not loaded')

  const payload: ResolveRuntimeHoldRequest = {
    checks: { ...checks.value },
    hold_version: detail.value.summary.version,
    latest_evidence_hash: detail.value.release_eligibility.latest_evidence_hash,
    material_disposition: disposition.value as ResolveRuntimeHoldRequest['material_disposition'],
    operator_note: operatorNote.value.trim(),
    resolution: resolution.value as ResolveRuntimeHoldRequest['resolution'],
    result_payload: null
  }

  if (disposition.value === 'RETURN_TO_NG' && selectedReason.value) {
    payload.ng_reason = {
      source: selectedReason.value.source,
      code: selectedReason.value.code,
      label: selectedReason.value.label
    }
    payload.physical_handoff_evidence = {
      ng_location_code: ngLocationScan.value.trim(),
      ng_location_scan: ngLocationScan.value.trim(),
      material_scan_payload: materialScanPayload.value.trim(),
      line_clear_checked: lineClearChecked.value,
      late_callback_reviewed: lateCallbackReviewed.value
    }
  }

  return payload
}

async function submit(): Promise<void> {
  if (!canSubmit.value) return
  await store.resolveHold(holdId.value, buildPayload())
  await load()
}

watch(() => route.params.holdId, load)
onMounted(load)
</script>

<style scoped>
.runtime-hold-page {
  min-height: 100%;
  padding: 24px;
  background:
    linear-gradient(rgb(245 158 11 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(245 158 11 / 4%) 1px, transparent 1px), #0f172a;
  background-size: 28px 28px;
  color: #f8fafc;
}

.runtime-hold-state {
  display: grid;
  gap: 12px;
  max-width: 560px;
  margin: 64px auto;
  padding: 22px;
  border: 1px solid rgb(245 158 11 / 18%);
  border-radius: 8px;
  background: rgb(30 41 59 / 82%);
  color: #cbd5e1;
}

.runtime-hold-state.is-compact {
  max-width: none;
  margin: 16px 0;
  color: #86efac;
}

.runtime-hold-state h1 {
  margin: 0;
  color: #f8fafc;
}

.runtime-hold-state button,
.runtime-hold-submit-bar button {
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #0f172a;
  padding: 0 18px;
  font-weight: 700;
}

.runtime-hold-submit-bar button:disabled {
  cursor: not-allowed;
  background: #475569;
  color: #94a3b8;
}

.runtime-hold-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1.1fr);
  gap: 16px;
  margin-top: 16px;
}

.runtime-hold-grid__primary,
.runtime-hold-grid__evidence {
  display: grid;
  align-content: start;
  gap: 16px;
}

.runtime-hold-submit-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 12px 0 0;
  background: linear-gradient(to top, #0f172a 72%, rgb(15 23 42 / 0%));
}

@media (width <= 720px) {
  .runtime-hold-page {
    padding: 12px;
    padding-bottom: 84px;
  }

  .runtime-hold-grid {
    grid-template-columns: 1fr;
  }

  .runtime-hold-submit-bar {
    position: fixed;
    right: 12px;
    bottom: 12px;
    left: 12px;
    padding: 0;
  }

  .runtime-hold-submit-bar button {
    width: 100%;
  }
}
</style>
