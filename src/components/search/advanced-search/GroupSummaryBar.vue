<template>
  <section class="group-summary-bar">
    <span class="group-summary-bar__label">当前筛选</span>
    <div ref="summaryContentRef" class="group-summary-bar__content">
      <p
        class="group-summary-bar__text"
        :class="{ 'group-summary-bar__text--expanded': summaryExpanded }"
      >
        {{ summary }}
      </p>
      <p ref="summaryMeasureRef" class="group-summary-bar__measure">
        {{ summary }}
      </p>
    </div>
    <el-button
      v-if="summaryOverflow"
      text
      class="group-summary-bar__toggle"
      @click="summaryExpanded = !summaryExpanded"
    >
      {{ summaryExpanded ? '收起' : '展开' }}
    </el-button>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  summary: string
  active?: boolean
  resetToken?: number
}

const props = defineProps<Props>()

const summaryExpanded = ref(false)
const summaryOverflow = ref(false)
const summaryContentRef = ref<HTMLElement>()
const summaryMeasureRef = ref<HTMLElement>()
let summaryResizeObserver: ResizeObserver | null = null

function measureSummaryOverflow(): void {
  const content = summaryContentRef.value
  const measure = summaryMeasureRef.value

  if (!content || !measure) {
    summaryOverflow.value = false
    return
  }

  summaryOverflow.value = measure.scrollWidth > content.clientWidth
}

function startSummaryObserver(): void {
  if (summaryResizeObserver || !summaryContentRef.value) {
    return
  }

  summaryResizeObserver = new ResizeObserver(() => {
    measureSummaryOverflow()
  })
  summaryResizeObserver.observe(summaryContentRef.value)
}

function stopSummaryObserver(): void {
  if (!summaryResizeObserver) {
    return
  }

  summaryResizeObserver.disconnect()
  summaryResizeObserver = null
}

watch(() => props.summary, () => {
  void nextTick(() => measureSummaryOverflow())
}, { immediate: true })

watch(() => props.active, active => {
  if (!active) {
    return
  }

  summaryExpanded.value = false
  void nextTick(() => measureSummaryOverflow())
}, { immediate: true })

watch(() => props.resetToken, () => {
  summaryExpanded.value = false
  void nextTick(() => measureSummaryOverflow())
})

watch(summaryExpanded, expanded => {
  if (!expanded) {
    void nextTick(() => measureSummaryOverflow())
  }
})

watch(summaryContentRef, element => {
  if (!element) {
    stopSummaryObserver()
    return
  }

  startSummaryObserver()
  void nextTick(() => measureSummaryOverflow())
})

onBeforeUnmount(() => {
  stopSummaryObserver()
})
</script>

<style scoped lang="scss">
.group-summary-bar {
  position: sticky;
  bottom: -1px;
  z-index: 2;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--el-bg-color) 82%, transparent), var(--el-bg-color)),
    var(--el-bg-color);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 16%, var(--el-border-color));
  border-radius: 16px;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.05);

  &__content {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  &__label {
    flex-shrink: 0;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--el-color-primary-dark-2);
    background: color-mix(in srgb, var(--el-color-primary-light-8) 78%, transparent);
    border-radius: 999px;
  }

  &__text {
    margin: 2px 0 0;
    line-height: 1.6;
    color: var(--el-text-color-primary);

    &:not(.group-summary-bar__text--expanded) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__text--expanded {
    white-space: normal;
  }

  &__measure {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    margin: 0;
    overflow: hidden;
    visibility: hidden;
    white-space: nowrap;
    pointer-events: none;
  }

  &__toggle {
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .group-summary-bar {
    flex-direction: column;
  }
}
</style>
