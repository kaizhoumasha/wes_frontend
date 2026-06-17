<template>
  <div
    class="runtime-scene-map"
    data-test="runtime-scene-map"
  >
    <div class="runtime-scene-map__header">
      <div
        class="runtime-scene-map__meta"
        data-test="runtime-scene-readiness"
      >
        {{ model.worklineCode }} · {{ model.readinessLabel }} · {{ model.runtimeStatusLabel }}
      </div>
      <div
        v-if="model.resourceEvidenceTruncated"
        class="runtime-scene-map__count"
        data-test="runtime-scene-truncated"
      >
        仅展示前 {{ resourceEvidenceVisibleCount }} 条证据 / 共
        {{ model.resourceEvidenceTotalCount }} 条
      </div>
    </div>

    <div
      v-if="model.semanticFallback"
      class="runtime-scene-map__fallback"
      data-test="runtime-scene-fallback"
    >
      {{ model.semanticFallbackMessage }}
    </div>

    <RuntimeSceneDeviceFlow
      :devices="model.deviceNodes"
      :explicit-nodes="layoutExplicitNodes"
      :explicit-edges="layoutExplicitEdges"
      :selected-device-id="selectedDeviceId"
      @select="emit('selectDevice', $event)"
      @select-rack-position="rackCode => emit('selectRackPosition', rackCode)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import type { RuntimeSceneModel } from '@/utils/runtime-scene'
import {
  expandManifestEdgesForLayout,
  type ExplicitLayoutEdge,
  type LayoutNodeInput,
  type ManifestTopologyEdgeInput
} from '@/utils/runtime-topology'

const props = withDefaults(
  defineProps<{
    model: RuntimeSceneModel
    selectedDeviceId?: number | null
  }>(),
  {
    selectedDeviceId: null
  }
)

const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectRackPosition: [rackCode: string]
}>()

const resourceEvidenceVisibleCount = computed(() => props.model.resourceEvidence.length)

// 显式拓扑输入：把 `model.topologyNodes` / `model.topologyEdges`（来自
// plugin manifest 的 `topology` 段）转换为 `LayoutNodeInput[]` /
// `ExplicitLayoutEdge[]` 喂给 `RuntimeSceneDeviceFlow`。当 manifest 没有
// 任何 topology 节点/边时返回 undefined，让 layout 走 device-only
// fallback 路径（保持 v3 之前的行为）。
const layoutExplicitNodes = computed<LayoutNodeInput[] | undefined>(() => {
  const topologyNodes = props.model.topologyNodes ?? []
  const topologyEdges = props.model.topologyEdges ?? []
  if (topologyNodes.length === 0 && topologyEdges.length === 0) {
    return undefined
  }

  const inputs: LayoutNodeInput[] = []
  for (const device of props.model.deviceNodes) {
    inputs.push({ kind: 'device', device })
  }
  for (const node of topologyNodes) {
    if (node.kind === 'RACK_POSITION' && node.resolved) {
      inputs.push({ kind: 'rack_position', code: node.ref })
    }
  }
  return inputs
})

const layoutExplicitEdges = computed<ExplicitLayoutEdge[] | undefined>(() => {
  const topologyEdges = props.model.topologyEdges ?? []
  if (topologyEdges.length === 0) return undefined

  const knownRackPositions = new Set(
    (props.model.topologyNodes ?? [])
      .filter(node => node.kind === 'RACK_POSITION' && node.resolved)
      .map(node => node.ref)
  )

  const manifestInputs: ManifestTopologyEdgeInput[] = topologyEdges.map(edge => ({
    fromNode: { kind: edge.fromNode.kind, ref: edge.fromNode.ref },
    toNode: { kind: edge.toNode.kind, ref: edge.toNode.ref },
    type: edge.type
  }))
  return expandManifestEdgesForLayout(
    manifestInputs,
    props.model.deviceNodes,
    knownRackPositions
  )
})
</script>

<style scoped>
.runtime-scene-map {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;

  /*
   * 占满父级可视口：el-card body 是 flex column 容器，把 runtime-scene-map
   * 也撑开。min-height: 0 是 flex item 在 column 容器里能正确收缩的前提
   * （否则 flex 容器会按内容自然高度撑开，导致内部出现滚动条）。
   */
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.runtime-scene-map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-scene-map__meta {
  margin-top: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-map__count {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--runtime-surface-accent, rgb(245, 158, 11, 0.12));
  color: var(--runtime-text-emphasis, rgb(245, 158, 11));
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__fallback {
  padding: 10px 12px;
  border: 1px solid rgb(245, 158, 11, 0.32);
  border-radius: 8px;
  background: var(--runtime-surface-accent, rgb(245, 158, 11, 0.12));
  color: var(--runtime-text-emphasis, rgb(245, 158, 11));
  font-size: 12px;
  font-weight: 600;
}
</style>
