<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { ElDrawer } from 'element-plus'
import type { WmsObservation } from '@/api/streaming/wmsDiagnosticsStream'
import type { ConfirmationsResult, EvidencesResult } from '@/api/modules/wmsDiagnostics'
import WmsExchangeInspector from '@/views/ops/wms-diagnostics/WmsExchangeInspector.vue'
import WmsReliableFacts from '@/views/ops/wms-diagnostics/WmsReliableFacts.vue'
defineProps<{
  detail: WmsObservation | null
  loadingDetail: boolean
  detailError: Error | null
  confirmation: ConfirmationsResult | null
  evidence: EvidencesResult | null
  confirmationError: Error | null
  evidenceError: Error | null
  loadingReliable: boolean
  canReadConfirmation: boolean
  canReadEvidence: boolean
}>()
const emit = defineEmits<{ close: [] }>()
const compact = useMediaQuery('(max-width: 1000px)')
</script>
<template>
  <aside
    v-if="!compact"
    class="inspector"
    aria-label="交互详情"
  >
    <button
      v-if="detail || confirmation || evidence || confirmationError || evidenceError"
      class="close-detail"
      @click="emit('close')"
    >
      关闭详情
    </button>
    <p
      v-if="loadingDetail"
      role="status"
    >
      正在读取详情…
    </p>
    <p
      v-else-if="detailError"
      class="error-message"
      role="alert"
    >
      详情读取失败：{{ detailError.message }}
    </p>
    <WmsExchangeInspector
      v-else-if="detail"
      :exchange="detail"
    />
    <p
      v-else
      class="empty-state"
    >
      选择一条交互，查看请求、响应与合同差异。
    </p>
    <WmsReliableFacts
      :confirmation="confirmation"
      :evidence="evidence"
      :confirmation-error="confirmationError"
      :evidence-error="evidenceError"
      :loading="loadingReliable"
      :can-read-confirmation="canReadConfirmation"
      :can-read-evidence="canReadEvidence"
    />
  </aside>
  <ElDrawer
    v-if="compact"
    :model-value="
      Boolean(
        detail ||
        loadingDetail ||
        detailError ||
        loadingReliable ||
        confirmation ||
        evidence ||
        confirmationError ||
        evidenceError
      )
    "
    title="当次交互详情"
    size="100%"
    append-to-body
    @close="emit('close')"
  >
    <p v-if="loadingDetail">正在读取详情…</p>
    <p
      v-else-if="detailError"
      role="alert"
    >
      详情读取失败：{{ detailError.message }}
    </p>
    <WmsExchangeInspector
      v-else-if="detail"
      :exchange="detail"
    />
    <WmsReliableFacts
      :confirmation="confirmation"
      :evidence="evidence"
      :confirmation-error="confirmationError"
      :evidence-error="evidenceError"
      :loading="loadingReliable"
      :can-read-confirmation="canReadConfirmation"
      :can-read-evidence="canReadEvidence"
    />
  </ElDrawer>
</template>
<style scoped>
.inspector {
  min-width: 0;
  max-height: 80vh;
  overflow: auto;
}
.close-detail {
  margin-bottom: 8px;
  padding: 8px 12px;
  color: inherit;
  background: var(--diag-panel);
  border: 1px solid var(--diag-border);
  border-radius: 6px;
  cursor: pointer;
}
.close-detail:focus-visible {
  outline: 2px solid var(--diag-accent);
  outline-offset: 2px;
}
.empty-state {
  padding: 32px 20px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
.error-message {
  color: var(--el-color-danger);
}
</style>
