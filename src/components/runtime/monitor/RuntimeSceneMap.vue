<template>
  <div class="runtime-scene-map">
    <div
      v-if="model.verdict.manifestWarning"
      class="runtime-scene-map__warning"
    >
      {{ model.verdict.manifestWarning }}
    </div>

    <div
      v-if="model.gaps.length"
      class="runtime-scene-map__gaps"
    >
      <span
        v-for="gap in model.gaps"
        :key="gap.id"
        class="runtime-scene-map__gap"
      >
        缺少 {{ gap.label }} {{ gap.actualCount }}/{{ gap.requiredCount }}
      </span>
    </div>

    <div
      v-if="model.overlays.length"
      class="runtime-scene-map__overlays"
    >
      <span
        v-for="overlay in model.overlays"
        :key="overlay.id"
        class="runtime-scene-map__overlay"
        :class="`is-${overlay.tone}`"
      >
        {{ overlay.label }}
        <template v-if="overlay.deviceId">· #{{ overlay.deviceId }}</template>
      </span>
    </div>

    <div
      v-if="model.flows.length"
      class="runtime-scene-map__flows"
    >
      <span
        v-for="flow in readableFlows"
        :key="flow.id"
        class="runtime-scene-map__flow"
      >
        {{ flow.from }} → {{ flow.to }}
      </span>
    </div>

    <div
      v-if="model.lanes.length"
      class="runtime-scene-map__canvas"
    >
      <section
        v-for="lane in lanesWithNodes"
        :key="lane.id"
        class="runtime-scene-map__lane"
        :class="{ 'is-gap': lane.nodes.length === 0 }"
      >
        <div class="runtime-scene-map__lane-header">
          <div class="runtime-scene-map__lane-title">{{ lane.label }}</div>
          <div class="runtime-scene-map__lane-meta">{{ lane.nodes.length }} 设备</div>
        </div>

        <div class="runtime-scene-map__nodes">
          <button
            v-for="node in lane.nodes"
            :key="node.id"
            type="button"
            class="runtime-scene-map__node"
            :class="[
              `is-${node.state}`,
              {
                'is-selected': node.isSelected,
                'is-current': node.isCurrent,
                'is-maintenance': node.maintenanceMode
              }
            ]"
            @click="emit('select', node.deviceId)"
          >
            <div class="runtime-scene-map__node-top">
              <RuntimeStatusBadge
                :status="node.status"
                size="small"
              />
              <span class="runtime-scene-map__role">#{{ node.roleIndex }}</span>
            </div>
            <div class="runtime-scene-map__name">{{ node.deviceName }}</div>
            <div class="runtime-scene-map__code">{{ node.deviceCode }}</div>
            <div
              v-if="node.errorCode"
              class="runtime-scene-map__error"
            >
              ERROR: {{ node.errorCode }}
            </div>
            <div
              v-if="node.badges.length"
              class="runtime-scene-map__badges"
            >
              <span
                v-for="badge in node.badges"
                :key="`${node.id}:${badge.kind}`"
                class="runtime-scene-map__badge"
                :class="`is-${badge.tone}`"
              >
                {{ badge.label }}
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>

    <div
      v-else
      class="runtime-scene-map__empty"
    >
      暂无设备现场数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type {
  RuntimeSceneFlow,
  RuntimeSceneLane,
  RuntimeSceneModel,
  RuntimeSceneNode
} from '@/types/runtime'

const props = defineProps<{
  model: RuntimeSceneModel
}>()

const emit = defineEmits<{
  select: [deviceId: number]
}>()

const lanesWithNodes = computed(() =>
  props.model.lanes.map(lane => ({
    ...lane,
    nodes: nodesForLane(lane)
  }))
)

const readableFlows = computed(() =>
  props.model.flows.map(flow => ({
    id: flow.id,
    from: flowNodeLabel(flow, 'fromNodeId'),
    to: flowNodeLabel(flow, 'toNodeId')
  }))
)

function nodesForLane(lane: RuntimeSceneLane): RuntimeSceneNode[] {
  return props.model.nodes.filter(node => node.laneId === lane.id)
}

function flowNodeLabel(flow: RuntimeSceneFlow, key: 'fromNodeId' | 'toNodeId'): string {
  const node = props.model.nodes.find(item => item.id === flow[key])
  return node?.deviceCode ?? flow[key].replace('device:', '#')
}
</script>

<style scoped>
.runtime-scene-map {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-scene-map__warning {
  padding: 10px 12px;
  border: 1px solid rgb(245 158 11 / 0.28);
  border-radius: 8px;
  background: rgb(245 158 11 / 0.08);
  color: #fbbf24;
  font-size: 13px;
}

.runtime-scene-map__gaps,
.runtime-scene-map__overlays,
.runtime-scene-map__flows {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.runtime-scene-map__gap {
  padding: 6px 10px;
  border: 1px solid rgb(239 68 68 / 0.28);
  border-radius: 999px;
  background: rgb(239 68 68 / 0.08);
  color: #fecaca;
  font-size: 12px;
  line-height: 1.2;
}

.runtime-scene-map__overlay,
.runtime-scene-map__flow {
  max-width: 100%;
  overflow: hidden;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-scene-map__overlay.is-info {
  border: 1px solid rgb(148 163 184 / 0.22);
  background: rgb(148 163 184 / 0.1);
  color: #cbd5e1;
}

.runtime-scene-map__overlay.is-primary {
  border: 1px solid rgb(59 130 246 / 0.28);
  background: rgb(59 130 246 / 0.1);
  color: #bfdbfe;
}

.runtime-scene-map__overlay.is-warning {
  border: 1px solid rgb(245 158 11 / 0.28);
  background: rgb(245 158 11 / 0.1);
  color: #fde68a;
}

.runtime-scene-map__overlay.is-danger {
  border: 1px solid rgb(239 68 68 / 0.28);
  background: rgb(239 68 68 / 0.1);
  color: #fecaca;
}

.runtime-scene-map__flow {
  border: 1px solid rgb(59 130 246 / 0.2);
  background: rgb(59 130 246 / 0.08);
  color: #bfdbfe;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.runtime-scene-map__canvas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.runtime-scene-map__lane {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgb(148 163 184 / 0.16);
  border-radius: 8px;
  background: rgb(15 23 42 / 0.38);
}

.runtime-scene-map__lane.is-gap {
  border-style: dashed;
  opacity: 0.72;
}

.runtime-scene-map__lane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.runtime-scene-map__lane-title {
  min-width: 0;
  overflow: hidden;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-scene-map__lane-meta {
  flex: 0 0 auto;
  color: #94a3b8;
  font-size: 12px;
}

.runtime-scene-map__nodes {
  display: grid;
  gap: 10px;
}

.runtime-scene-map__node {
  display: grid;
  gap: 7px;
  min-width: 0;
  min-height: 132px;
  padding: 12px;
  border: 1px solid rgb(148 163 184 / 0.18);
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 150ms ease-out,
    box-shadow 150ms ease-out,
    transform 150ms ease-out;
}

.runtime-scene-map__node:hover {
  transform: translateY(-1px);
  border-color: rgb(59 130 246 / 0.36);
}

.runtime-scene-map__node.is-selected {
  box-shadow: inset 0 0 0 1px rgb(59 130 246 / 0.44);
}

.runtime-scene-map__node.is-current {
  border-color: rgb(59 130 246 / 0.52);
}

.runtime-scene-map__node.is-error,
.runtime-scene-map__node.is-hold {
  border-color: rgb(239 68 68 / 0.48);
}

.runtime-scene-map__node.is-waiting {
  border-color: rgb(245 158 11 / 0.42);
}

.runtime-scene-map__node.is-running {
  border-color: rgb(59 130 246 / 0.38);
}

.runtime-scene-map__node.is-maintenance {
  opacity: 0.8;
}

.runtime-scene-map__node-top,
.runtime-scene-map__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.runtime-scene-map__role {
  color: #94a3b8;
  font-size: 12px;
}

.runtime-scene-map__name,
.runtime-scene-map__code,
.runtime-scene-map__error {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-scene-map__name {
  color: #f8fafc;
  font-weight: 700;
}

.runtime-scene-map__code {
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.runtime-scene-map__error {
  color: #fca5a5;
  font-size: 12px;
}

.runtime-scene-map__badge {
  max-width: 100%;
  overflow: hidden;
  padding: 4px 7px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-scene-map__badge.is-info {
  background: rgb(148 163 184 / 0.14);
  color: #cbd5e1;
}

.runtime-scene-map__badge.is-primary {
  background: rgb(59 130 246 / 0.14);
  color: #bfdbfe;
}

.runtime-scene-map__badge.is-warning {
  background: rgb(245 158 11 / 0.14);
  color: #fde68a;
}

.runtime-scene-map__badge.is-danger {
  background: rgb(239 68 68 / 0.14);
  color: #fecaca;
}

.runtime-scene-map__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed rgb(148 163 184 / 0.2);
  border-radius: 8px;
  color: #94a3b8;
}

@media (width <= 720px) {
  .runtime-scene-map__canvas {
    grid-template-columns: 1fr;
  }
}
</style>
