<!--
  T4-T7 作业线资源活动监控页面。
  依赖已冻结的 v2 只读端点（scene/snapshot/active-objects）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import type { PlaneActiveObjectView, PlaneResource } from '@/api/types/plane-v2'
import { useActivityMonitor } from './composables/useActivityMonitor'
import ResourceMatrixPanel from './components/activity-monitor/ResourceMatrixPanel.vue'
import ResourceContextPanel from './components/activity-monitor/ResourceContextPanel.vue'
import ActiveObjectLedger from './components/activity-monitor/ActiveObjectLedger.vue'
import EvidenceDrawer from './components/activity-monitor/EvidenceDrawer.vue'

const route = useRoute()
const { hasPermission } = usePermission()
const canView = computed(() => hasPermission(BIZ_PERMISSIONS.workline.viewPlaneScene))

const workLineId = computed<number | null>(() => {
  const id = Number(route.params.id)
  return Number.isSafeInteger(id) && id > 0 ? id : null
})

const monitor = useActivityMonitor(() => (canView.value ? workLineId.value : null))

const selectedResource = computed<PlaneResource | null>(() => {
  const selected = monitor.selectedResourceRef.value
  const groups = monitor.scene.value?.resource_groups
  if (!selected || !groups) return null
  return (groups[selected.group] ?? []).find(resource => resource.key === selected.key) ?? null
})

const drawerOpen = ref(false)
const drawerToggleRef = ref<HTMLButtonElement | null>(null)
function closeSidePanelDrawer(): void {
  drawerOpen.value = false
  drawerToggleRef.value?.focus()
}

const evidenceObject = ref<PlaneActiveObjectView | null>(null)
const evidenceVisible = ref(false)
function inspectEvidence(object: PlaneActiveObjectView): void {
  evidenceObject.value = object
  evidenceVisible.value = true
}

async function handleRefresh(): Promise<void> {
  await monitor.refresh()
}
</script>

<template>
  <div class="activity-monitor">
    <ElAlert
      v-if="!canView"
      title="当前账号没有资源活动监控查看权限"
      type="info"
      :closable="false"
    />
    <template v-else>
      <header class="activity-monitor__header">
        <div>
          <h2>资源活动监控 · {{ monitor.scene.value?.workline.line_name || `#${workLineId}` }}</h2>
          <p class="mono">{{ monitor.scene.value?.workline.line_code }}</p>
        </div>
        <div class="activity-monitor__actions">
          <button
            ref="drawerToggleRef"
            type="button"
            class="activity-monitor__drawer-toggle"
            @click="drawerOpen = true"
          >
            资源上下文
          </button>
          <ElButton
            :loading="monitor.dynamicLoading.value"
            @click="handleRefresh"
          >
            刷新
          </ElButton>
        </div>
      </header>

      <div class="activity-monitor__layout">
        <div class="activity-monitor__matrix">
          <ResourceMatrixPanel
            :groups="monitor.scene.value?.resource_groups ?? null"
            :orphan-bindings="monitor.scene.value?.diagnostics.orphan_bindings ?? []"
            :resource-states="monitor.snapshot.value?.resource_states ?? []"
            :source-status="monitor.snapshot.value?.source_status ?? null"
            :loading="monitor.sceneLoading.value"
            :error="monitor.sceneError.value"
            :selected="monitor.selectedResourceRef.value"
            @select="monitor.selectResource"
          />
        </div>

        <aside class="activity-monitor__side">
          <ResourceContextPanel
            :line-name="monitor.scene.value?.workline.line_name ?? ''"
            :line-code="monitor.scene.value?.workline.line_code ?? ''"
            :snapshot="monitor.snapshot.value"
            :active-objects="monitor.activeObjects.value"
            :selected="monitor.selectedResourceRef.value"
            :selected-resource="selectedResource"
            :stale-banner-text="monitor.staleBannerText.value"
            :generated-at-label="monitor.generatedAtLabel.value"
            @clear="monitor.selectResource(null)"
          />
        </aside>
      </div>

      <div class="activity-monitor__ledger">
        <ActiveObjectLedger
          :objects="monitor.activeObjects.value?.objects ?? []"
          :loading="monitor.dynamicLoading.value"
          :trustworthy="monitor.snapshot.value?.source_status === 'COMPLETE'"
          :selected-resource-ref="monitor.selectedResourceRef.value"
          @inspect="inspectEvidence"
        />
      </div>

      <ElDrawer
        v-model="drawerOpen"
        title="资源上下文"
        size="90%"
        @closed="closeSidePanelDrawer"
      >
        <ResourceContextPanel
          :line-name="monitor.scene.value?.workline.line_name ?? ''"
          :line-code="monitor.scene.value?.workline.line_code ?? ''"
          :snapshot="monitor.snapshot.value"
          :active-objects="monitor.activeObjects.value"
          :selected="monitor.selectedResourceRef.value"
          :selected-resource="selectedResource"
          :stale-banner-text="monitor.staleBannerText.value"
          :generated-at-label="monitor.generatedAtLabel.value"
          @clear="monitor.selectResource(null)"
        />
      </ElDrawer>

      <EvidenceDrawer
        v-model="evidenceVisible"
        :object="evidenceObject"
      />
    </template>
  </div>
</template>

<style scoped>
.activity-monitor {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-md);
  color: var(--color-text-primary);
}
.mono {
  font-family: var(--font-mono);
}
.activity-monitor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.activity-monitor__header h2 {
  margin: 0;
  font-size: var(--el-font-size-extra-large);
  font-weight: 600;
}
.activity-monitor__header p {
  margin: var(--space-3xs) 0 0;
  color: var(--color-text-secondary);
}
.activity-monitor__actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.activity-monitor__drawer-toggle {
  display: none;
  min-height: 44px;
  padding: 0 var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}
.activity-monitor__layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: var(--space-md);
  align-items: start;
}
.activity-monitor__side {
  display: grid;
  gap: var(--space-md);
  position: sticky;
  top: var(--space-md);
}
.activity-monitor__ledger {
  min-width: 0;
  margin-top: var(--space-md);
}

@media (width <= 1199px) {
  .activity-monitor__layout {
    grid-template-columns: 1fr;
  }
  .activity-monitor__side {
    display: none;
  }
  .activity-monitor__drawer-toggle {
    display: inline-block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .activity-monitor * {
    transition: none !important;
  }
}
</style>
