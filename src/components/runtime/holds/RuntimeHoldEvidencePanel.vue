<template>
  <section class="runtime-hold-panel">
    <header>
      <h2>证据</h2>
      <span>{{ materialIdentityLabel }}</span>
    </header>
    <div
      v-if="materialIdentityTone === 'danger'"
      class="runtime-hold-alert is-danger"
    >
      {{ materialIdentityLabel }}
    </div>
    <div
      v-else-if="materialIdentityTone === 'warning'"
      class="runtime-hold-alert is-warning"
    >
      {{ materialIdentityLabel }}
    </div>
    <dl class="runtime-hold-kv">
      <div>
        <dt>Command</dt>
        <dd>{{ failedCommandEvidence?.command_code || '—' }}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{{ failedCommandEvidence?.status || '—' }}</dd>
      </div>
      <div>
        <dt>Error</dt>
        <dd>{{ failedCommandError }}</dd>
      </div>
    </dl>
    <pre>{{ evidenceSnapshotJson }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FailedCommandEvidence } from '@/types/runtime'

const props = defineProps<{
  evidenceSnapshot: Record<string, unknown>
  failedCommandEvidence?: FailedCommandEvidence | null
}>()

const materialIdentityStatus = computed(() =>
  typeof props.evidenceSnapshot.material_identity_status === 'string'
    ? props.evidenceSnapshot.material_identity_status
    : 'RESOLVED'
)

const materialIdentityLabel = computed(() => {
  if (materialIdentityStatus.value === 'MISSING') return '物料身份缺失'
  if (materialIdentityStatus.value === 'AMBIGUOUS') return '物料身份冲突'
  return '物料身份已解析'
})

const materialIdentityTone = computed(() => {
  if (materialIdentityStatus.value === 'MISSING') return 'danger'
  if (materialIdentityStatus.value === 'AMBIGUOUS') return 'warning'
  return 'success'
})

const failedCommandError = computed(() => {
  const error = props.failedCommandEvidence?.error_detail
  if (!error || typeof error !== 'object') return '—'
  const message = error.message
  return typeof message === 'string' ? message : JSON.stringify(error)
})

const evidenceSnapshotJson = computed(() => JSON.stringify(props.evidenceSnapshot, null, 2))
</script>

<style scoped>
.runtime-hold-panel {
  padding: 18px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.14);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-surface-rgb) / 0.74);
}

.runtime-hold-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.runtime-hold-panel h2 {
  margin: 0;
  color: var(--color-industrial-dark-text);
  font-size: 16px;
}

.runtime-hold-panel header span {
  color: var(--color-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.runtime-hold-alert {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
}

.runtime-hold-alert.is-danger {
  color: var(--color-danger-light);
  background: rgb(var(--color-danger-rgb) / 0.14);
}

.runtime-hold-alert.is-warning {
  color: var(--color-primary-200);
  background: rgb(var(--color-primary-rgb) / 0.14);
}

.runtime-hold-kv {
  display: grid;
  gap: 10px;
  margin: 0 0 14px;
}

.runtime-hold-kv div {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
}

.runtime-hold-kv dt {
  color: var(--color-industrial-dark-text-secondary);
}

.runtime-hold-kv dd {
  margin: 0;
  color: var(--color-industrial-dark-text);
  font-family: 'JetBrains Mono', monospace;
}

pre {
  overflow: auto;
  max-height: 260px;
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  color: var(--color-industrial-light-border-hover);
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.78);
  font-size: 12px;
}
</style>
