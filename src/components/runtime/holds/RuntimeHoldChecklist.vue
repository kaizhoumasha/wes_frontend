<template>
  <section class="runtime-hold-panel">
    <header>
      <h2>释放检查</h2>
      <span>{{ completedCount }}/{{ requiredChecks.length }}</span>
    </header>
    <label
      v-for="check in requiredChecks"
      :key="check"
      class="runtime-hold-check"
    >
      <input
        type="checkbox"
        :checked="modelValue[check] === true"
        @change="toggleCheck(check, ($event.target as HTMLInputElement).checked)"
      />
      <span>{{ checkLabel(check) }}</span>
    </label>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  requiredChecks: string[]
  modelValue: Record<string, boolean>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, boolean>]
}>()

const completedCount = computed(
  () => props.requiredChecks.filter(check => props.modelValue[check] === true).length
)

function toggleCheck(key: string, checked: boolean): void {
  emit('update:modelValue', { ...props.modelValue, [key]: checked })
}

function checkLabel(value: string): string {
  return value.replace(/_/g, ' ')
}
</script>

<style scoped>
.runtime-hold-panel {
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.14);
  border-radius: 8px;
  background: rgb(30, 41, 59, 0.74);
}

.runtime-hold-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.runtime-hold-panel h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 16px;
}

.runtime-hold-panel header span {
  color: #f59e0b;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.runtime-hold-check {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 10px;
  color: #cbd5e1;
}
</style>
