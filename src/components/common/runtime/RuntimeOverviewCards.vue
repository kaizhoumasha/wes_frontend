<template>
  <div class="runtime-overview-cards">
    <el-card
      v-for="card in cards"
      :key="card.key"
      class="runtime-overview-card"
      :class="`runtime-overview-card--${card.status}`"
      shadow="hover"
    >
      <div class="runtime-overview-card__label">{{ card.label }}</div>
      <div class="runtime-overview-card__value">{{ card.value }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { RuntimeStatCard } from '@/types/runtime'

defineProps<{
  cards: RuntimeStatCard[]
}>()
</script>

<style scoped>
.runtime-overview-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.runtime-overview-card {
  position: relative;
  overflow: hidden;
  min-height: 120px;
  background: rgb(30, 41, 59, 0.92);
  border: 1px solid rgb(245, 158, 11, 0.16);
}

.runtime-overview-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: #3b82f6;
}

.runtime-overview-card--warning::before {
  background: #f59e0b;
}

.runtime-overview-card--danger::before {
  background: #dc2626;
}

.runtime-overview-card--success::before {
  background: #16a34a;
}

.runtime-overview-card__label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runtime-overview-card__value {
  margin-top: 12px;
  color: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  font-weight: 700;
}
</style>
