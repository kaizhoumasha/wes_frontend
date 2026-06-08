<template>
  <div
    class="runtime-last-updated"
    :class="{ 'is-frozen': frozen }"
  >
    <span class="runtime-last-updated__label">{{ frozen ? '数据已冻结' : '最后刷新' }}</span>
    <span class="runtime-last-updated__value">{{ formattedValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimezoneStore } from '@/stores/timezone'
import { formatRuntimeRelative } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    value?: Date | null
    frozen?: boolean
  }>(),
  {
    value: null,
    frozen: false
  }
)

const timezoneStore = useTimezoneStore()

const formattedValue = computed(() => {
  if (!props.value) {
    return '—'
  }

  const absolute = timezoneStore.formatInCurrentTimezone(props.value, 'yyyy-MM-dd HH:mm:ss')
  const relative = formatRuntimeRelative(props.value)
  return relative === '—' ? absolute : `${absolute} · ${relative}`
})
</script>

<style scoped>
.runtime-last-updated {
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  flex: 1 1 180px;
  gap: 4px;
  min-width: 0;
  max-width: 220px;
  padding: 10px 14px;
  border: 1px solid rgb(245, 158, 11, 0.18);
  border-radius: 12px;
  background: var(--runtime-surface);
}

.runtime-last-updated.is-frozen {
  border-color: rgb(234, 179, 8, 0.28);
  background: rgb(234, 179, 8, 0.08);
}

.runtime-last-updated__label {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runtime-last-updated__value {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.4;
}
</style>
