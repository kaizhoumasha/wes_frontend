<template>
  <div class="runtime-signal-strip">
    <article
      v-for="card in cards"
      :key="card.key"
      class="runtime-signal-card"
      :class="`runtime-signal-card--${card.status}`"
    >
      <div class="runtime-signal-card__header">
        <div class="runtime-signal-card__icon">
          <AppIcon :icon="card.icon" size="18" />
        </div>
        <span class="runtime-signal-card__label">{{ card.label }}</span>
      </div>
      <div class="runtime-signal-card__value">{{ card.value }}</div>
      <div v-if="card.hint" class="runtime-signal-card__hint">{{ card.hint }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { RuntimeTone } from '@/utils/runtime-display'

interface RuntimeSignalCard {
  key: string
  label: string
  value: string | number
  status: RuntimeTone
  icon?: string
  hint?: string
}

defineProps<{
  cards: RuntimeSignalCard[]
}>()
</script>

<style scoped>
.runtime-signal-strip {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.runtime-signal-card {
  position: relative;
  overflow: hidden;
  min-height: 144px;
  padding: 20px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgb(30, 41, 59, 0.96), rgb(15, 23, 42, 0.94)),
    rgb(30, 41, 59, 0.92);
  box-shadow: inset 0 1px 0 rgb(255, 255, 255, 0.03);
}

.runtime-signal-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: rgb(148, 163, 184, 0.7);
}

.runtime-signal-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.runtime-signal-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgb(255, 255, 255, 0.04);
}

.runtime-signal-card__label {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runtime-signal-card__value {
  margin-top: 18px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.runtime-signal-card__hint {
  margin-top: 12px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.runtime-signal-card--primary::before {
  background: #3b82f6;
}

.runtime-signal-card--success::before {
  background: #16a34a;
}

.runtime-signal-card--warning::before {
  background: #eab308;
}

.runtime-signal-card--danger::before {
  background: #dc2626;
}

.runtime-signal-card--info::before {
  background: #94a3b8;
}
</style>
