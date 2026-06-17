<template>
  <div class="runtime-sticky-context">
    <div class="runtime-sticky-context__header">
      <div class="runtime-sticky-context__identity">
        <div class="runtime-sticky-context__eyebrow-row">
          <span class="runtime-sticky-context__eyebrow">{{ eyebrow }}</span>
          <span
            v-if="code"
            class="runtime-sticky-context__code runtime-hero__code"
          >
            {{ code }}
          </span>
        </div>

        <div class="runtime-sticky-context__title-row">
          <strong
            class="runtime-sticky-context__title"
            :title="title"
          >
            {{ title }}
          </strong>
          <RuntimeStatusBadge
            v-if="status"
            :status="status"
            size="small"
          />
        </div>
      </div>
    </div>

    <div
      v-if="facts.length"
      class="runtime-sticky-context__facts"
    >
      <div
        v-for="item in facts"
        :key="item.label"
        class="runtime-sticky-context__fact"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'

interface RuntimeStickyContextFact {
  label: string
  value: string
}

withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    code?: string | null
    status?: string | null
    facts?: RuntimeStickyContextFact[]
  }>(),
  {
    code: null,
    status: null,
    facts: () => []
  }
)
</script>

<style scoped>
.runtime-sticky-context {
  position: sticky;
  top: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.16);
  border-radius: 16px;
  background:
    linear-gradient(180deg, var(--runtime-hero-bg), var(--runtime-hero-bg)),
    linear-gradient(135deg, rgb(var(--color-primary-rgb) / 0.1), transparent 42%);
  box-shadow:
    0 10px 24px rgb(var(--color-industrial-dark-bg-rgb) / 0.16),
    inset 0 1px 0 rgb(var(--color-industrial-light-surface-rgb) / 0.04);
  backdrop-filter: blur(14px);
}

.runtime-sticky-context__header,
.runtime-sticky-context__identity {
  min-width: 0;
}

.runtime-sticky-context__header {
  flex: 1 1 auto;
}

.runtime-sticky-context__eyebrow-row,
.runtime-sticky-context__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.runtime-sticky-context__title-row {
  margin-top: 6px;
}

.runtime-sticky-context__eyebrow,
.runtime-sticky-context__fact span {
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runtime-sticky-context__title {
  min-width: 0;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.runtime-sticky-context__facts {
  display: flex;
  gap: 8px;
  flex: 0 1 auto;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.runtime-sticky-context__fact {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  border-radius: 999px;
  background: var(--runtime-surface-subtle);
}

.runtime-sticky-context__fact strong {
  display: inline;
  margin-left: 6px;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (width <= 1279px) {
  .runtime-sticky-context {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .runtime-sticky-context__facts {
    justify-content: flex-start;
  }
}

@media (width <= 767px) {
  .runtime-sticky-context {
    padding: 12px 14px;
  }

  .runtime-sticky-context__fact {
    width: 100%;
    border-radius: 12px;
  }
}
</style>
