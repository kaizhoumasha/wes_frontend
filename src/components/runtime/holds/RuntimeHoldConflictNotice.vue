<template>
  <aside
    v-if="conflict"
    class="runtime-hold-conflict"
    :class="{
      'is-evidence': conflict.code === 'RUNTIME_HOLD_EVIDENCE_CHANGED',
      'is-material': conflict.code === 'RUNTIME_HOLD_MATERIAL_CONFLICT'
    }"
  >
    <strong>{{ title }}</strong>
    <span>{{ conflict.message }}</span>
    <dl v-if="materialConflictItems.length">
      <template
        v-for="item in materialConflictItems"
        :key="item.label"
      >
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
    <code v-if="conflict.current_hold_version">v{{ conflict.current_hold_version }}</code>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuntimeHoldConflictModel } from '@/types/runtime'

const props = defineProps<{
  conflict: RuntimeHoldConflictModel | null
}>()

interface MaterialConflictItem {
  label: string
  value: string | number
}

const title = computed(() => {
  if (props.conflict?.code === 'RUNTIME_HOLD_EVIDENCE_CHANGED') return '证据已更新'
  if (props.conflict?.code === 'RUNTIME_HOLD_MATERIAL_CONFLICT') return '物料已在 NG 队列'
  return '决策已过期'
})

const materialConflictItems = computed(() => {
  const conflict = props.conflict
  if (conflict?.code !== 'RUNTIME_HOLD_MATERIAL_CONFLICT') return []
  const items: Array<{ label: string; value: string | number | undefined }> = [
    { label: '物料', value: conflict.material_identity_key },
    { label: 'NG 项', value: conflict.existing_ng_return_item_id },
    { label: 'Runtime Hold', value: conflict.existing_runtime_hold_id },
    { label: '状态', value: conflict.existing_status }
  ]
  return items.filter((item): item is MaterialConflictItem => item.value !== undefined)
})
</script>

<style scoped>
.runtime-hold-conflict {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.26);
  border-radius: 8px;
  color: var(--color-primary-200);
  background: rgb(var(--color-primary-rgb) / 0.12);
}

.runtime-hold-conflict.is-evidence {
  border-color: rgb(var(--color-info-rgb) / 0.28);
  color: var(--color-info-light);
  background: rgb(var(--color-info-rgb) / 0.12);
}

.runtime-hold-conflict.is-material {
  border-color: rgb(239, 68, 68, 0.28);
  color: var(--color-danger-light);
  background: rgb(239, 68, 68, 0.12);
}

.runtime-hold-conflict strong {
  color: var(--color-industrial-dark-text);
}

.runtime-hold-conflict code {
  font-family: 'JetBrains Mono', monospace;
}

.runtime-hold-conflict dl {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 10px;
  margin: 4px 0 0;
  font-size: 12px;
}

.runtime-hold-conflict dt {
  color: rgb(var(--color-industrial-light-bg-rgb) / 0.68);
}

.runtime-hold-conflict dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--color-industrial-dark-text);
}
</style>
