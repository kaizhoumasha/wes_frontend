<template>
  <section
    class="runtime-scene-evidence-panel"
    data-test="runtime-scene-evidence-panel"
  >
    <div
      v-if="resourceEvidenceTruncated"
      class="runtime-scene-evidence-panel__truncated"
      data-test="runtime-scene-evidence-truncated"
    >
      仅展示前 {{ resourceEvidenceVisibleCount }} 条证据 / 共 {{ resourceEvidenceTotalCount }} 条
    </div>

    <div
      v-if="items.length"
      class="runtime-scene-evidence-panel__rows"
    >
      <div
        v-for="item in items"
        :key="getRuntimeSceneEvidenceKey(item)"
        class="runtime-scene-evidence-panel__row"
        data-test="runtime-scene-evidence-row"
      >
        <div class="runtime-scene-evidence-panel__main">
          <span class="runtime-scene-evidence-panel__kind">
            {{ item.resourceKindLabel }}
          </span>
          <span class="runtime-scene-evidence-panel__code">
            {{ item.resourceCode }}
          </span>
        </div>
        <div class="runtime-scene-evidence-panel__meta">
          {{ item.evidenceKindLabel }}
        </div>
        <dl class="runtime-scene-evidence-panel__facts">
          <template v-if="item.positionCode">
            <dt>Position</dt>
            <dd>{{ item.positionCode }}</dd>
          </template>
          <template v-if="item.rackCode">
            <dt>Rack</dt>
            <dd>{{ item.rackCode }}</dd>
          </template>
          <template v-if="item.binCode">
            <dt>Bin</dt>
            <dd>{{ item.binCode }}</dd>
          </template>
          <template v-if="item.slotCode">
            <dt>Slot</dt>
            <dd>{{ item.slotCode }}</dd>
          </template>
          <template v-if="item.pkgCode">
            <dt>PKG</dt>
            <dd>{{ item.pkgCode }}</dd>
          </template>
          <template v-if="item.partSn">
            <dt>Part SN</dt>
            <dd>{{ item.partSn }}</dd>
          </template>
          <template v-if="item.sourceTraceId">
            <dt>Trace</dt>
            <dd>{{ item.sourceTraceId }}</dd>
          </template>
          <template v-if="item.sourceSessionId">
            <dt>Session</dt>
            <dd>{{ item.sourceSessionId }}</dd>
          </template>
          <template v-if="item.occurredAt">
            <dt>Time</dt>
            <dd>{{ item.occurredAt }}</dd>
          </template>
        </dl>
      </div>
    </div>

    <div
      v-else
      class="runtime-scene-evidence-panel__empty"
    >
      暂无审计证据
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  getRuntimeSceneEvidenceKey,
  type RuntimeSceneResourceEvidence
} from '@/utils/runtime-scene'

defineProps<{
  items: RuntimeSceneResourceEvidence[]
  resourceEvidenceTruncated: boolean
  resourceEvidenceVisibleCount: number
  resourceEvidenceTotalCount: number
}>()
</script>

<style scoped>
.runtime-scene-evidence-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.runtime-scene-evidence-panel__truncated {
  padding: 6px 8px;
  border: 1px solid rgb(245, 158, 11, 0.2);
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.1);
  color: rgb(146, 64, 14);
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-evidence-panel__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-scene-evidence-panel__row {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--runtime-surface);
}

.runtime-scene-evidence-panel__main {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  min-width: 0;
}

.runtime-scene-evidence-panel__kind {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-evidence-panel__code {
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.runtime-scene-evidence-panel__meta {
  margin-top: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-scene-evidence-panel__facts {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 8px;
  margin: 8px 0 0;
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.runtime-scene-evidence-panel__facts dt {
  color: var(--runtime-text-muted);
  font-weight: 600;
}

.runtime-scene-evidence-panel__facts dd {
  min-width: 0;
  margin: 0;
  color: var(--runtime-text);
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-scene-evidence-panel__empty {
  padding: 18px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.28));
  border-radius: 6px;
  color: var(--runtime-text-muted);
  font-size: 13px;
  text-align: center;
}
</style>
