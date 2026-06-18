<template>
  <section class="runtime-hold-decision-bar">
    <div>
      <span
        class="runtime-hold-decision-bar__status"
        :class="`is-${tone}`"
      >
        {{ statusLabel }}
      </span>
      <h1>Runtime Hold #{{ holdId }}</h1>
      <p>{{ sourceReason }} · WorkLine {{ worklineId }}</p>
    </div>
    <div class="runtime-hold-decision-bar__hash">
      <span>VERSION</span>
      <strong>{{ version }}</strong>
      <span>HASH</span>
      <code>{{ evidenceHash || '—' }}</code>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  holdId: number
  worklineId: number
  status: string
  sourceReason: string
  version: number
  evidenceHash?: string | null
}>()

const activeStatuses = new Set(['OPEN', 'IN_PROGRESS', 'REOPENED'])
const statusLabel = computed(() => (activeStatuses.has(props.status) ? '待处置' : '已闭环'))
const tone = computed(() => (activeStatuses.has(props.status) ? 'warning' : 'success'))
</script>

<style scoped>
.runtime-hold-decision-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.2);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.92);
}

.runtime-hold-decision-bar h1 {
  margin: 10px 0 6px;
  color: var(--color-industrial-dark-text);
  font-size: 28px;
  line-height: 1.2;
}

.runtime-hold-decision-bar p {
  margin: 0;
  color: var(--color-industrial-dark-text-secondary);
}

.runtime-hold-decision-bar__status {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.runtime-hold-decision-bar__status.is-warning {
  color: var(--color-primary);
  background: rgb(var(--color-primary-rgb) / 0.12);
}

.runtime-hold-decision-bar__status.is-success {
  color: var(--color-success);
  background: rgb(var(--color-success-rgb) / 0.12);
}

.runtime-hold-decision-bar__hash {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  color: var(--color-industrial-dark-text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-align: right;
}

.runtime-hold-decision-bar__hash strong,
.runtime-hold-decision-bar__hash code {
  color: var(--color-industrial-dark-text);
}

@media (width <= 720px) {
  .runtime-hold-decision-bar {
    flex-direction: column;
  }

  .runtime-hold-decision-bar__hash {
    text-align: left;
  }
}
</style>
