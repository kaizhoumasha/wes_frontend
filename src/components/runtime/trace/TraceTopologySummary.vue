<template>
  <section
    class="trace-topology-summary"
    :class="`is-${model.verdict}`"
  >
    <div class="trace-topology-summary__header">
      <div class="trace-topology-summary__identity">
        <div class="trace-topology-summary__eyebrow-row">
          <span class="trace-topology-summary__eyebrow">工作线拓扑</span>
          <span class="trace-topology-summary__code">{{ anchorText }}</span>
        </div>
        <div class="trace-topology-summary__title-row">
          <h2 class="trace-topology-summary__title">{{ heroTitle }}</h2>
          <RuntimeStatusBadge
            :status="detail.summary.session_status || detail.session?.status"
            size="small"
            pulse
          />
        </div>
        <p class="trace-topology-summary__verdict">{{ model.verdictTitle }}</p>
        <p class="trace-topology-summary__description">{{ model.verdictDescription }}</p>
      </div>

      <div class="trace-topology-summary__facts">
        <div class="trace-topology-summary__fact">
          <span>当前在</span>
          <strong>{{ model.currentLabel }}</strong>
        </div>
        <div class="trace-topology-summary__fact">
          <span>异常</span>
          <strong>{{ model.exceptionText }}</strong>
        </div>
      </div>
    </div>

    <div class="trace-topology-summary__main">
      <div class="trace-topology-summary__route">
        <div class="trace-topology-summary__route-label">
          <span>乐观路径</span>
          <strong>{{ model.optimisticPathLabel }}</strong>
        </div>

        <WorklineRouteMap
          v-if="worklineDevices.length"
          class="trace-topology-summary__route-map"
          :devices="worklineDevices"
          :selected-device-id="selectedDeviceId"
          :trace-path-nodes="path?.devices ?? []"
          :blocking-device-id="path?.current_blocking_device_id ?? null"
          compact
          @select="selectedDeviceId = $event"
        />

        <div class="trace-topology-summary__nodes">
          <div
            v-for="(node, index) in model.pathNodes"
            :key="node.key"
            class="trace-topology-summary__node-wrap"
          >
            <article
              class="trace-topology-summary__node"
              :class="`is-${node.state}`"
            >
              <div class="trace-topology-summary__node-top">
                <span class="trace-topology-summary__node-step">{{ node.stepLabel }}</span>
                <span class="trace-topology-summary__node-state">
                  {{ nodeStateLabel(node.state) }}
                </span>
              </div>
              <strong class="trace-topology-summary__node-name">{{ node.deviceName }}</strong>
              <div class="trace-topology-summary__node-meta">
                <span>{{ node.actionLabel }}</span>
                <span>{{ node.statusLabel }}</span>
              </div>
            </article>
            <span
              v-if="index < model.pathNodes.length - 1"
              class="trace-topology-summary__connector"
            />
          </div>
        </div>
      </div>

      <aside class="trace-topology-summary__focus">
        <div class="trace-topology-summary__focus-block">
          <span>现在在哪</span>
          <strong>{{ model.currentNode?.deviceName || '未知位置' }}</strong>
          <p>{{ model.currentNode?.actionLabel || '暂无动作证据' }}</p>
        </div>
        <div
          class="trace-topology-summary__focus-block"
          :class="{ 'is-empty': !model.exceptionNode }"
        >
          <span>异常发生在哪里</span>
          <strong>{{ model.exceptionNode?.deviceName || '未发现异常节点' }}</strong>
          <p>{{ model.exceptionText }}</p>
        </div>
        <div
          class="trace-topology-summary__focus-block trace-topology-summary__focus-block--action"
        >
          <span>下一步</span>
          <strong>{{ model.operatorAction }}</strong>
          <p v-if="pathLoading">正在补全设备路径证据...</p>
          <p v-else>{{ nextStepHint }}</p>
        </div>
      </aside>
    </div>

    <div class="trace-topology-summary__evidence">
      <div
        v-for="item in model.evidenceCounts"
        :key="item.label"
        class="trace-topology-summary__evidence-item"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
import type {
  RuntimeTracePathResponse,
  RuntimeWorklineDetailResponse,
  TraceBlockingPointResponse,
  TraceDetailResponse
} from '@/types/runtime'
import {
  buildRuntimeTraceTopology,
  type RuntimeTraceTopologyNodeState
} from '@/utils/runtime-trace-topology'
import { displaySession, displayTrace } from '@/utils/runtime-display-identity'

const props = withDefaults(
  defineProps<{
    detail: TraceDetailResponse
    blockingPoint?: TraceBlockingPointResponse | null
    path?: RuntimeTracePathResponse | null
    worklineDetail?: RuntimeWorklineDetailResponse | null
    pathLoading?: boolean
  }>(),
  {
    blockingPoint: null,
    path: null,
    worklineDetail: null,
    pathLoading: false
  }
)

const selectedDeviceId = ref<number | null>(null)

const model = computed(() =>
  buildRuntimeTraceTopology({
    detail: props.detail,
    blockingPoint: props.blockingPoint,
    path: props.path
  })
)

const heroTitle = computed(() => {
  return (
    props.detail.session?.barcode ||
    displaySession({
      session_code: props.detail.session?.session_code,
      session_id: props.detail.trace.session_id
    })
  )
})

const anchorText = computed(() =>
  displayTrace({
    trace_id: props.detail.trace.trace_id,
    session_code: props.detail.session?.session_code,
    session_id: props.detail.trace.session_id
  })
)

const worklineDevices = computed(() => props.worklineDetail?.devices ?? [])

const nextStepHint = computed(() => {
  if (model.value.verdict === 'success') {
    return '可直接进入 Timeline 或证据分组复核。'
  }

  if (model.value.exceptionNode) {
    return '先处理异常节点，再回到阻塞点卡片执行处置。'
  }

  return '继续观察当前位置和等待类型。'
})

function nodeStateLabel(state: RuntimeTraceTopologyNodeState): string {
  const map: Record<RuntimeTraceTopologyNodeState, string> = {
    completed: '已通过',
    current: '当前位置',
    exception: '异常点',
    pending: '未到达',
    unknown: '未知'
  }
  return map[state]
}
</script>

<style scoped>
.trace-topology-summary {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgb(148 163 184 / 0.18);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgb(15 23 42 / 0.98), rgb(30 41 59 / 0.94)), var(--runtime-surface);
  box-shadow: 0 18px 50px rgb(2 6 23 / 0.24);
}

.trace-topology-summary.is-success {
  border-color: rgb(34 197 94 / 0.28);
}

.trace-topology-summary.is-danger {
  border-color: rgb(239 68 68 / 0.36);
}

.trace-topology-summary.is-warning {
  border-color: rgb(245 158 11 / 0.34);
}

.trace-topology-summary__header,
.trace-topology-summary__main {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: stretch;
}

.trace-topology-summary__identity,
.trace-topology-summary__route {
  min-width: 0;
}

.trace-topology-summary__eyebrow-row,
.trace-topology-summary__title-row,
.trace-topology-summary__node-top,
.trace-topology-summary__node-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.trace-topology-summary__eyebrow,
.trace-topology-summary__fact span,
.trace-topology-summary__route-label span,
.trace-topology-summary__focus-block span,
.trace-topology-summary__evidence-item span,
.trace-topology-summary__node-step,
.trace-topology-summary__node-state {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.trace-topology-summary__code {
  min-width: 0;
  color: #64748b;
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.trace-topology-summary__title {
  min-width: 0;
  margin: 0;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 24px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.trace-topology-summary__verdict {
  margin: 12px 0 0;
  color: #f8fafc;
  font-size: 17px;
  font-weight: 800;
}

.trace-topology-summary__description {
  max-width: 760px;
  margin: 6px 0 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

.trace-topology-summary__facts {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.trace-topology-summary__fact,
.trace-topology-summary__focus-block {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgb(148 163 184 / 0.14);
  border-radius: 10px;
  background: rgb(15 23 42 / 0.52);
}

.trace-topology-summary__fact strong,
.trace-topology-summary__route-label strong,
.trace-topology-summary__focus-block strong,
.trace-topology-summary__evidence-item strong {
  display: block;
  margin-top: 6px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.trace-topology-summary__route {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgb(59 130 246 / 0.16);
  border-radius: 12px;
  background: rgb(2 6 23 / 0.22);
}

.trace-topology-summary__route-label strong {
  color: #bfdbfe;
}

.trace-topology-summary__nodes {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  align-items: stretch;
}

.trace-topology-summary__route-map {
  margin: 2px 0 4px;
}

.trace-topology-summary__route-map :deep(.workline-route-map__node) {
  min-width: 150px;
}

.trace-topology-summary__route-map :deep(.workline-route-map__role),
.trace-topology-summary__route-map :deep(.workline-route-map__code) {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.trace-topology-summary__node-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
}

.trace-topology-summary__node {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 122px;
  padding: 14px;
  border: 1px solid rgb(148 163 184 / 0.18);
  border-radius: 10px;
  background: rgb(15 23 42 / 0.82);
}

.trace-topology-summary__node.is-completed {
  border-color: rgb(34 197 94 / 0.26);
  background: linear-gradient(180deg, rgb(20 83 45 / 0.26), rgb(15 23 42 / 0.88));
}

.trace-topology-summary__node.is-current {
  border-color: rgb(59 130 246 / 0.42);
  background: linear-gradient(180deg, rgb(30 64 175 / 0.3), rgb(15 23 42 / 0.9));
}

.trace-topology-summary__node.is-exception {
  border-color: rgb(239 68 68 / 0.52);
  background: linear-gradient(180deg, rgb(127 29 29 / 0.42), rgb(15 23 42 / 0.9));
}

.trace-topology-summary__node.is-pending {
  opacity: 0.72;
}

.trace-topology-summary__node-top {
  justify-content: space-between;
}

.trace-topology-summary__node-name {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.trace-topology-summary__node-meta {
  justify-content: space-between;
  margin-top: auto;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.45;
}

.trace-topology-summary__connector {
  display: block;
  flex: 0 0 22px;
  height: 2px;
  margin: 0 8px;
  background: linear-gradient(90deg, rgb(59 130 246 / 0.2), rgb(34 197 94 / 0.48));
}

.trace-topology-summary__focus {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.trace-topology-summary__focus-block {
  border-color: rgb(59 130 246 / 0.18);
}

.trace-topology-summary__focus-block.is-empty {
  border-color: rgb(34 197 94 / 0.18);
}

.trace-topology-summary__focus-block--action {
  border-color: rgb(245 158 11 / 0.22);
}

.trace-topology-summary__focus-block p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.trace-topology-summary__evidence {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  padding-top: 12px;
  border-top: 1px solid rgb(148 163 184 / 0.12);
}

.trace-topology-summary__evidence-item {
  min-width: 0;
  padding: 10px;
  border-radius: 8px;
  background: rgb(15 23 42 / 0.46);
}

.trace-topology-summary__evidence-item strong {
  font-size: 16px;
}

@media (width <= 1279px) {
  .trace-topology-summary__header,
  .trace-topology-summary__main {
    grid-template-columns: 1fr;
  }

  .trace-topology-summary__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trace-topology-summary__focus {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .trace-topology-summary__evidence {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .trace-topology-summary {
    padding: 14px;
  }

  .trace-topology-summary__title {
    font-size: 20px;
  }

  .trace-topology-summary__facts,
  .trace-topology-summary__focus,
  .trace-topology-summary__evidence {
    grid-template-columns: 1fr;
  }

  .trace-topology-summary__node-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .trace-topology-summary__connector {
    width: 2px;
    height: 18px;
    margin: 6px auto;
    background: linear-gradient(180deg, rgb(59 130 246 / 0.2), rgb(34 197 94 / 0.48));
  }
}
</style>
