<template>
  <div class="runtime-priority-queue">
    <div
      v-if="loading"
      class="runtime-priority-queue__skeleton"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="runtime-priority-queue__skeleton-card"
      />
    </div>
    <template v-else>
      <div
        v-if="criticalItems.length"
        class="runtime-priority-queue__tier"
      >
        <div
          class="runtime-priority-queue__tier-header runtime-priority-queue__tier-header--critical"
        >
          <span class="runtime-priority-queue__tier-label">立即处理</span>
          <span class="runtime-priority-queue__tier-count">{{ criticalItems.length }}</span>
        </div>
        <div class="runtime-priority-queue__cards">
          <button
            v-for="item in criticalItems"
            :key="item.id"
            type="button"
            class="runtime-priority-queue__card"
            :data-item-id="item.id"
            :tabindex="focusedId === item.id ? 0 : -1"
            @click="emit('navigate', item)"
            @keydown="onKeyDown($event, item)"
          >
            <div
              class="runtime-priority-queue__card-strip runtime-priority-queue__card-strip--critical"
            />
            <div class="runtime-priority-queue__card-body">
              <div class="runtime-priority-queue__card-summary">{{ item.summary }}</div>
              <div class="runtime-priority-queue__card-context">{{ item.context }}</div>
            </div>
            <span class="runtime-priority-queue__card-arrow">&rarr;</span>
          </button>
        </div>
      </div>

      <div
        v-if="watchItems.length"
        class="runtime-priority-queue__tier"
      >
        <div class="runtime-priority-queue__tier-header runtime-priority-queue__tier-header--watch">
          <span class="runtime-priority-queue__tier-label">需要关注</span>
          <span class="runtime-priority-queue__tier-count">{{ watchItems.length }}</span>
        </div>
        <div class="runtime-priority-queue__cards">
          <button
            v-for="item in watchItems"
            :key="item.id"
            type="button"
            class="runtime-priority-queue__card"
            :data-item-id="item.id"
            :tabindex="focusedId === item.id ? 0 : -1"
            @click="emit('navigate', item)"
            @keydown="onKeyDown($event, item)"
          >
            <div
              class="runtime-priority-queue__card-strip runtime-priority-queue__card-strip--watch"
            />
            <div class="runtime-priority-queue__card-body">
              <div class="runtime-priority-queue__card-summary">{{ item.summary }}</div>
              <div class="runtime-priority-queue__card-context">{{ item.context }}</div>
            </div>
            <span class="runtime-priority-queue__card-arrow">&rarr;</span>
          </button>
        </div>
      </div>

      <div
        v-if="knownItems.length"
        class="runtime-priority-queue__tier"
      >
        <button
          type="button"
          class="runtime-priority-queue__tier-toggle"
          @click="knownExpanded = !knownExpanded"
        >
          <div
            class="runtime-priority-queue__tier-header runtime-priority-queue__tier-header--known"
          >
            <span class="runtime-priority-queue__tier-label">已知</span>
            <span class="runtime-priority-queue__tier-count">{{ knownItems.length }}</span>
          </div>
          <span class="runtime-priority-queue__expand-icon">
            {{ knownExpanded ? '&#9660;' : '&#9654;' }}
          </span>
        </button>
        <div
          v-if="knownExpanded"
          class="runtime-priority-queue__cards"
        >
          <button
            v-for="item in knownItems"
            :key="item.id"
            type="button"
            class="runtime-priority-queue__card"
            :data-item-id="item.id"
            :tabindex="focusedId === item.id ? 0 : -1"
            @click="emit('navigate', item)"
            @keydown="onKeyDown($event, item)"
          >
            <div
              class="runtime-priority-queue__card-strip runtime-priority-queue__card-strip--known"
            />
            <div class="runtime-priority-queue__card-body">
              <div class="runtime-priority-queue__card-summary">{{ item.summary }}</div>
              <div class="runtime-priority-queue__card-context">{{ item.context }}</div>
            </div>
            <span class="runtime-priority-queue__card-arrow">&rarr;</span>
          </button>
        </div>
      </div>

      <div
        v-if="!criticalItems.length && !watchItems.length && !knownItems.length"
        class="runtime-priority-queue__empty"
      >
        系统运行正常
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PriorityItem } from '@/utils/runtime-priority'

const props = defineProps<{
  items: PriorityItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate', item: PriorityItem): void
}>()

const knownExpanded = ref(false)
const focusedId = ref<number | string | null>(null)

const criticalItems = computed(() => props.items.filter(i => i.tier === 'critical'))
const watchItems = computed(() => props.items.filter(i => i.tier === 'watch'))
const knownItems = computed(() => props.items.filter(i => i.tier === 'known'))

const flatItems = computed(() => {
  const result = [...criticalItems.value, ...watchItems.value]
  if (knownExpanded.value) result.push(...knownItems.value)
  return result
})

function onKeyDown(event: KeyboardEvent, item: PriorityItem) {
  const list = flatItems.value
  const index = list.findIndex(i => i.id === item.id)
  if (index === -1) return

  let nextIndex = -1
  if (event.key === 'ArrowDown') {
    nextIndex = Math.min(index + 1, list.length - 1)
  } else if (event.key === 'ArrowUp') {
    nextIndex = Math.max(index - 1, 0)
  }

  if (nextIndex >= 0 && nextIndex !== index) {
    event.preventDefault()
    const nextItem = list[nextIndex]
    focusedId.value = nextItem.id
    const root = (event.target as HTMLElement).closest('.runtime-priority-queue')
    const el = root?.querySelector(`[data-item-id="${nextItem.id}"]`) as HTMLElement | undefined
    el?.focus()
  }
}
</script>

<style scoped>
.runtime-priority-queue {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.runtime-priority-queue__skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-priority-queue__skeleton-card {
  height: 56px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.08),
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.16),
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.08)
  );
  background-size: 200% 100%;
  animation: pq-shimmer 1.6s ease-in-out infinite;
}

@keyframes pq-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.runtime-priority-queue__tier-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.runtime-priority-queue__tier-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.runtime-priority-queue__tier-header--critical .runtime-priority-queue__tier-label {
  color: #f87171;
}

.runtime-priority-queue__tier-header--watch .runtime-priority-queue__tier-label {
  color: #facc15;
}

.runtime-priority-queue__tier-header--known .runtime-priority-queue__tier-label {
  color: var(--runtime-text-secondary);
}

.runtime-priority-queue__tier-count {
  padding: 1px 8px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.runtime-priority-queue__tier-header--critical .runtime-priority-queue__tier-count {
  background: rgb(var(--color-danger-rgb) / 0.15);
  color: #f87171;
}

.runtime-priority-queue__tier-header--watch .runtime-priority-queue__tier-count {
  background: rgb(var(--color-warning-rgb) / 0.15);
  color: #facc15;
}

.runtime-priority-queue__tier-header--known .runtime-priority-queue__tier-count {
  background: rgb(100, 116, 139, 0.15);
  color: var(--color-industrial-dark-text-secondary);
}

.runtime-priority-queue__tier-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.runtime-priority-queue__expand-icon {
  color: var(--runtime-text-secondary);
  font-size: 10px;
}

.runtime-priority-queue__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-priority-queue__card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--runtime-border, rgb(var(--color-primary-rgb) / 0.12));
  border-radius: 10px;
  background: var(--runtime-surface, rgb(30, 41, 59, 0.6));
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.runtime-priority-queue__card:hover,
.runtime-priority-queue__card:focus-visible {
  transform: translateY(-1px);
  border-color: var(--runtime-border-strong, rgb(var(--color-primary-rgb) / 0.28));
  background: var(--runtime-surface-strong, rgb(30, 41, 59, 0.88));
}

.runtime-priority-queue__card:focus-visible {
  outline: 2px solid var(--runtime-border-accent, rgb(var(--color-primary-rgb) / 0.5));
  outline-offset: 2px;
}

.runtime-priority-queue__card-strip {
  flex: 0 0 auto;
  width: 4px;
  height: 28px;
  border-radius: 2px;
}

.runtime-priority-queue__card-strip--critical {
  background: var(--runtime-tier-critical, var(--color-danger));
}

.runtime-priority-queue__card-strip--watch {
  background: var(--runtime-tier-watch, var(--color-warning));
}

.runtime-priority-queue__card-strip--known {
  background: var(--runtime-tier-known);
}

.runtime-priority-queue__card-body {
  flex: 1 1 auto;
  min-width: 0;
}

.runtime-priority-queue__card-summary {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.runtime-priority-queue__card-context {
  margin-top: 2px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.runtime-priority-queue__card-arrow {
  flex: 0 0 auto;
  color: var(--runtime-text-secondary);
  font-size: 14px;
}

.runtime-priority-queue__empty {
  padding: 24px;
  border: 1px dashed rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.28);
  border-radius: 14px;
  background: rgb(15, 23, 42, 0.42);
  color: var(--runtime-text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
</style>
