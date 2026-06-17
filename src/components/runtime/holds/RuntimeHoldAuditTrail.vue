<template>
  <section class="runtime-hold-panel">
    <header>
      <h2>审计</h2>
      <span>{{ summary.status }}</span>
    </header>
    <dl class="runtime-hold-kv">
      <div>
        <dt>Source</dt>
        <dd>{{ source.source_kind }}</dd>
      </div>
      <div>
        <dt>Reason</dt>
        <dd>{{ source.source_reason }}</dd>
      </div>
      <div>
        <dt>Session</dt>
        <dd>{{ summary.session_id || '—' }}</dd>
      </div>
      <div>
        <dt>Created</dt>
        <dd>{{ summary.created_at || '—' }}</dd>
      </div>
      <div>
        <dt>Resolved</dt>
        <dd>{{ summary.resolved_at || '—' }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { RuntimeHoldSource, RuntimeHoldSummary } from '@/types/runtime'

defineProps<{
  summary: RuntimeHoldSummary
  source: RuntimeHoldSource
}>()
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

.runtime-hold-kv {
  display: grid;
  gap: 10px;
  margin: 0;
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
  min-width: 0;
  margin: 0;
  color: var(--color-industrial-dark-text);
  overflow-wrap: anywhere;
  font-family: 'JetBrains Mono', monospace;
}
</style>
