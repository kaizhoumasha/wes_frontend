<template>
  <div class="trace-contrast">
    <div class="trace-contrast__header">
      <span class="trace-contrast__title">Trace 对比</span>
      <el-button
        size="small"
        text
        @click="$emit('close')"
      >
        关闭对比
      </el-button>
    </div>

    <div class="trace-contrast__inputs">
      <div class="trace-contrast__input-group">
        <span class="trace-contrast__label">Trace A</span>
        <el-input
          v-model="traceIdA"
          placeholder="输入 Trace ID"
          size="small"
          @keyup.enter="loadBoth"
        />
        <span
          v-if="errorA"
          class="trace-contrast__error"
        >
          {{ errorA }}
        </span>
      </div>
      <div class="trace-contrast__divider">vs</div>
      <div class="trace-contrast__input-group">
        <span class="trace-contrast__label">Trace B</span>
        <el-input
          v-model="traceIdB"
          placeholder="输入 Trace ID"
          size="small"
          @keyup.enter="loadBoth"
        />
        <span
          v-if="errorB"
          class="trace-contrast__error"
        >
          {{ errorB }}
        </span>
      </div>
      <el-button
        type="primary"
        size="small"
        :loading="loading"
        :disabled="!traceIdA || !traceIdB"
        @click="loadBoth"
      >
        对比
      </el-button>
    </div>

    <div
      v-if="detailA && detailB"
      class="trace-contrast__panels"
    >
      <div class="trace-contrast__panel trace-contrast__panel--a">
        <div class="trace-contrast__panel-header">
          <span class="trace-contrast__panel-label">{{ labelA }}</span>
        </div>
        <div class="trace-contrast__timeline">
          <div
            v-for="(node, i) in nodesA"
            :key="i"
            class="trace-contrast__node"
            :class="{
              'is-fork': forkIndex !== null && i === forkIndex,
              'is-before-fork': forkIndex !== null && i < forkIndex,
              'is-after-fork': forkIndex !== null && i > forkIndex
            }"
          >
            <div class="trace-contrast__node-dot" />
            <div class="trace-contrast__node-content">
              <div class="trace-contrast__node-stage">{{ node.stage }}</div>
              <div class="trace-contrast__node-action">{{ node.actionType }}</div>
              <div class="trace-contrast__node-result">{{ node.message }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="trace-contrast__panel trace-contrast__panel--b">
        <div class="trace-contrast__panel-header">
          <span class="trace-contrast__panel-label">{{ labelB }}</span>
        </div>
        <div class="trace-contrast__timeline">
          <div
            v-for="(node, i) in nodesB"
            :key="i"
            class="trace-contrast__node"
            :class="{
              'is-fork': forkIndex !== null && i === forkIndex,
              'is-before-fork': forkIndex !== null && i < forkIndex,
              'is-after-fork': forkIndex !== null && i > forkIndex
            }"
          >
            <div class="trace-contrast__node-dot" />
            <div class="trace-contrast__node-content">
              <div class="trace-contrast__node-stage">{{ node.stage }}</div>
              <div class="trace-contrast__node-action">{{ node.actionType }}</div>
              <div class="trace-contrast__node-result">{{ node.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <RuntimeEmptyState
      v-else-if="loaded && (!detailA || !detailB)"
      title="对比数据不完整"
      description="请确认两个 Trace ID 都有效。"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import type { TraceDetailResponse } from '@/types/runtime'
import { getErrorMessage } from '@/utils/string'

interface TimelineNode {
  stage: string
  actionType: string
  message: string
}

defineEmits<{
  (e: 'close'): void
}>()

const traceIdA = ref('')
const traceIdB = ref('')
const detailA = ref<TraceDetailResponse | null>(null)
const detailB = ref<TraceDetailResponse | null>(null)
const loading = ref(false)
const loaded = ref(false)

const labelA = computed(() => detailA.value?.trace?.trace_id ?? 'Trace A')
const labelB = computed(() => detailB.value?.trace?.trace_id ?? 'Trace B')

const nodesA = computed<TimelineNode[]>(() =>
  (detailA.value?.timelines ?? []).map(t => ({
    stage: t.stage ?? '',
    actionType: t.action_type,
    message: t.message ?? ''
  }))
)

const nodesB = computed<TimelineNode[]>(() =>
  (detailB.value?.timelines ?? []).map(t => ({
    stage: t.stage ?? '',
    actionType: t.action_type,
    message: t.message ?? ''
  }))
)

const forkIndex = computed<number | null>(() => {
  const a = nodesA.value
  const b = nodesB.value
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) {
    const na = a[i]
    const nb = b[i]
    if (!na || !nb) return i
    if (na.actionType !== nb.actionType || na.message !== nb.message) return i
  }
  return null
})

const errorA = ref<string | null>(null)
const errorB = ref<string | null>(null)

async function loadBoth() {
  if (!traceIdA.value || !traceIdB.value) return
  loading.value = true
  loaded.value = false
  errorA.value = null
  errorB.value = null

  const [ra, rb] = await Promise.allSettled([
    runtimeApiMethods.traceByTraceId(traceIdA.value).send(),
    runtimeApiMethods.traceByTraceId(traceIdB.value).send()
  ])

  if (ra.status === 'fulfilled') {
    detailA.value = ra.value
  } else {
    detailA.value = null
    errorA.value = getErrorMessage(ra.reason, 'Trace A 查询失败')
  }

  if (rb.status === 'fulfilled') {
    detailB.value = rb.value
  } else {
    detailB.value = null
    errorB.value = getErrorMessage(rb.reason, 'Trace B 查询失败')
  }

  loading.value = false
  loaded.value = true
}
</script>

<style scoped>
.trace-contrast {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trace-contrast__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trace-contrast__title {
  color: var(--color-industrial-dark-text);
  font-size: 16px;
  font-weight: 700;
}

.trace-contrast__inputs {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  border-radius: 10px;
  background: var(--color-industrial-dark-surface);
}

.trace-contrast__input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.trace-contrast__label {
  color: var(--color-industrial-dark-text-secondary);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trace-contrast__error {
  color: var(--color-danger);
  font-size: 11px;
  margin-top: 2px;
}

.trace-contrast__divider {
  color: var(--color-industrial-dark-text-muted);
  font-size: 12px;
  font-weight: 700;
  padding-bottom: 6px;
}

.trace-contrast__panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.trace-contrast__panel {
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  border-radius: 10px;
  background: var(--color-industrial-dark-surface);
  overflow: hidden;
}

.trace-contrast__panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid rgb(var(--color-primary-rgb) / 0.08);
  background: rgb(15 23 42 / 0.6);
}

.trace-contrast__panel-label {
  color: var(--color-industrial-dark-text);
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 13px;
  font-weight: 700;
}

.trace-contrast__timeline {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.trace-contrast__node {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  position: relative;
}

.trace-contrast__node:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 19px;
  top: 32px;
  bottom: 0;
  width: 1px;
  background: rgb(var(--color-primary-rgb) / 0.12);
}

.trace-contrast__node-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-industrial-light-text-secondary);
  margin-top: 6px;
}

.trace-contrast__node.is-before-fork .trace-contrast__node-dot {
  background: var(--color-success);
}

.trace-contrast__node.is-fork .trace-contrast__node-dot {
  background: var(--color-primary);
  box-shadow: 0 0 6px rgb(var(--color-primary-rgb) / 0.5);
}

.trace-contrast__node.is-after-fork .trace-contrast__node-dot {
  background: var(--color-danger);
}

.trace-contrast__node.is-fork {
  background: rgb(var(--color-primary-rgb) / 0.06);
  border-top: 1px solid rgb(var(--color-primary-rgb) / 0.16);
  border-bottom: 1px solid rgb(var(--color-primary-rgb) / 0.16);
}

.trace-contrast__node-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.trace-contrast__node-stage {
  color: var(--color-industrial-dark-text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trace-contrast__node-action {
  color: var(--color-industrial-dark-text);
  font-size: 13px;
  font-weight: 600;
}

.trace-contrast__node-result {
  color: var(--color-industrial-dark-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 12px;
}
</style>
