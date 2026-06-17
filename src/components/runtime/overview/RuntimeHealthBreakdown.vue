<template>
  <el-card
    shadow="never"
    class="runtime-health-breakdown"
  >
    <template #header>
      <div class="runtime-health-breakdown__header">
        <div>
          <div class="runtime-health-breakdown__title">{{ title }}</div>
          <div
            v-if="subtitle"
            class="runtime-health-breakdown__subtitle"
          >
            {{ subtitle }}
          </div>
        </div>
        <span class="runtime-health-breakdown__total">{{ totalLabel }}</span>
      </div>
    </template>

    <div
      v-if="items.length"
      class="runtime-health-breakdown__list"
    >
      <div
        v-for="item in items"
        :key="item.label"
        class="runtime-health-breakdown__item"
      >
        <div class="runtime-health-breakdown__item-head">
          <span class="runtime-health-breakdown__item-label">{{ item.label }}</span>
          <span class="runtime-health-breakdown__item-value">{{ item.value }}</span>
        </div>
        <div class="runtime-health-breakdown__bar">
          <span
            class="runtime-health-breakdown__bar-fill"
            :class="`runtime-health-breakdown__bar-fill--${item.tone}`"
            :style="{ width: `${item.ratio}%` }"
          />
        </div>
        <div
          v-if="item.hint"
          class="runtime-health-breakdown__item-hint"
        >
          {{ item.hint }}
        </div>
      </div>
    </div>
    <el-empty
      v-else
      description="暂无结构样本"
      :image-size="80"
    />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuntimeTone } from '@/utils/runtime-display'

interface RuntimeHealthBreakdownItem {
  label: string
  value: string | number
  ratio: number
  tone: RuntimeTone
  hint?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    total?: string | number
    items: RuntimeHealthBreakdownItem[]
  }>(),
  {
    subtitle: '',
    total: '—'
  }
)

const totalLabel = computed(() => `样本 ${props.total}`)
</script>

<style scoped>
.runtime-health-breakdown {
  height: 100%;
  background: var(--runtime-surface);
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
}

.runtime-health-breakdown__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-health-breakdown__title {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.runtime-health-breakdown__subtitle,
.runtime-health-breakdown__total,
.runtime-health-breakdown__item-hint {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.runtime-health-breakdown__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.runtime-health-breakdown__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.runtime-health-breakdown__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.runtime-health-breakdown__item-label {
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  font-weight: 600;
}

.runtime-health-breakdown__item-value {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.runtime-health-breakdown__bar {
  overflow: hidden;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--runtime-rail);
}

.runtime-health-breakdown__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.runtime-health-breakdown__bar-fill--primary {
  background: linear-gradient(90deg, rgb(var(--color-info-rgb) / 0.65), var(--color-info));
}

.runtime-health-breakdown__bar-fill--success {
  background: linear-gradient(90deg, rgb(var(--color-success-rgb) / 0.65), var(--color-success));
}

.runtime-health-breakdown__bar-fill--warning {
  background: linear-gradient(90deg, rgb(var(--color-warning-rgb) / 0.65), var(--color-warning));
}

.runtime-health-breakdown__bar-fill--danger {
  background: linear-gradient(90deg, rgb(var(--color-danger-rgb) / 0.65), var(--color-danger));
}

.runtime-health-breakdown__bar-fill--info {
  background: linear-gradient(90deg, rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.65), var(--color-industrial-dark-text-secondary));
}
</style>
