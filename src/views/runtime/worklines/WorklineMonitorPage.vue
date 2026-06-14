<template>
  <div
    v-loading="store.loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">工作线监控</h1>
        <p class="runtime-page__subtitle">
          选择工作线查看设备拓扑、活跃会话与失败链路。先看线体摘要，再下钻设备与运行案件。
        </p>
      </div>
    </div>

    <div class="monitor-layout">
      <!-- 左侧工作线目录 -->
      <el-card
        shadow="never"
        class="monitor-panel monitor-layout__list"
      >
        <template #header>
          <div class="monitor-panel__header">
            <el-input
              v-model="searchText"
              placeholder="搜索工作线名称/编码/区域..."
              clearable
              size="small"
            />
          </div>
        </template>

        <div class="monitor-layout__list-scroll">
          <div
            v-if="filteredWorklines.length"
            class="monitor-directory-list"
          >
            <button
              v-for="item in filteredWorklines"
              :key="item.id"
              type="button"
              class="monitor-directory-card"
              :class="{ 'is-active': item.id === selectedWorklineId }"
              @click="selectWorkline(item)"
            >
              <div class="monitor-directory-card__top">
                <RuntimeStatusBadge
                  :label="worklineRiskLabel(item)"
                  :tone="worklineRiskTone(item)"
                  size="small"
                />
                <span class="monitor-directory-card__time">{{ lastActivityLabel(item) }}</span>
              </div>
              <div class="monitor-directory-card__title">{{ item.line_name }}</div>
              <div class="monitor-directory-card__meta">
                {{ item.line_code }} · {{ item.zone_name || '未配置区域' }}
              </div>
              <div class="monitor-directory-card__hint">
                活跃 {{ item.active_session_count }} · 等待 {{ item.waiting_session_count }} · 失败
                {{ item.failed_session_count }} · 离线 {{ item.offline_device_count }}
              </div>
            </button>
          </div>
          <RuntimeEmptyState
            v-else-if="store.worklines.length === 0"
            title="暂无工作线数据"
            description="当前还没有可用于运行监控的工作线样本。"
            hint="请确认后端工作线主数据、权限与 API 返回是否正常。"
          />
          <RuntimeEmptyState
            v-else
            title="无匹配工作线"
            description="当前搜索条件下没有匹配的工作线。"
            hint="请调整搜索关键词。"
          />
        </div>
      </el-card>

      <!-- 中央实时总览 -->
      <div
        v-if="store.projection"
        class="monitor-layout__live"
      >
        <WorklineLiveOverview
          :workline-summary="store.projection.summary"
          :workline-projection="store.projection"
          :devices="store.projection.device_nodes || []"
          :active-sessions="store.projection.active_sessions.items || []"
          :recent-failed-traces="store.projection.recent_failed_traces.items || []"
          :recent-completed-traces="store.projection.recent_completed_traces.items || []"
          :selected-device-id="selectedDeviceId"
          @select-device="openDevice"
          @select-session="openTrace"
        />
      </div>

      <!-- 右侧行动舱 -->
      <div
        v-if="store.projection"
        class="monitor-layout__actions"
      >
        <el-card
          shadow="never"
          class="monitor-panel monitor-action-cabin"
          aria-label="工作线行动舱"
        >
          <template #header>
            <div class="monitor-action-cabin__header">
              <div>
                <div class="monitor-action-cabin__title">行动舱</div>
                <div class="monitor-action-cabin__meta">
                  {{ store.projection.summary.line_code }} ·
                  {{ formatRuntimeDateTime(store.projection.generated_at) }}
                </div>
              </div>
              <el-button
                size="small"
                plain
                :loading="store.loading"
                data-test="monitor-refresh-projection"
                @click="forceRefreshProjection"
              >
                刷新投影
              </el-button>
            </div>
          </template>
          <RuntimeEmptyState
            v-if="!pendingReconciliationCandidate"
            data-test="monitor-no-reconciliation"
            title="暂无可核销对象"
            description="当前投影没有 pending runtime reconciliation owner。"
            hint="如现场状态刚变化，可手动刷新投影后再处置。"
          />
          <p
            v-else
            class="monitor-action-cabin__hint"
          >
            已发现待核销对象，请在下方完成现场确认后解除隔离。
          </p>
        </el-card>
        <template v-if="store.projection">
          <WorklineRuntimeHoldSummaryPanel
            v-if="hasRuntimeHoldProjection"
            :summary="store.projection.summary"
            :projection="store.projection"
            :can-view-hold="canViewRuntimeHold"
          />
          <WorklineSafetyIncidentPanel
            v-if="currentWorklineSafetyVerdict.safetyLocked && !hasRuntimeHoldProjection"
            :summary="store.projection.summary"
            :verdict="currentWorklineSafetyVerdict"
            :can-clear-estop="canClearWorklineEstop"
            :clear-estop-loading="clearingWorklineEstop"
            @refresh="forceRefreshProjection"
            @clear-estop="clearWorklineEstop"
          />
          <WorklineReconciliationPanel
            v-if="pendingReconciliationCandidate"
            :summary="store.projection.summary"
            :candidate="pendingReconciliationCandidate"
            :can-resolve="canResolveReconciliation"
            :resolving="resolvingReconciliation"
            @refresh="forceRefreshProjection"
            @resolve="resolveRuntimeReconciliation"
          />
        </template>
      </div>

      <el-card
        v-else
        shadow="never"
        class="monitor-panel monitor-layout__empty"
      >
        <RuntimeEmptyState
          title="还没有选中工作线"
          description="请从左侧工作线目录选择一条工作线，进入拓扑与运行队列视图。"
          hint="目录会保持稳定排序。"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import WorklineLiveOverview from '@/components/runtime/monitor/WorklineLiveOverview.vue'
import WorklineReconciliationPanel from '@/components/runtime/monitor/WorklineReconciliationPanel.vue'
import WorklineSafetyIncidentPanel from '@/components/runtime/monitor/WorklineSafetyIncidentPanel.vue'
import WorklineRuntimeHoldSummaryPanel from '@/components/runtime/monitor/WorklineRuntimeHoldSummaryPanel.vue'
import { usePermission } from '@/composables/usePermission'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { RECONCILING_RUNTIME_STATUS } from '@/constants/runtime-safety'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { classifyRuntimeRefresh, isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { getWorklineDeviceSafetyEvidence, getWorklineRuntimeVerdict } from '@/utils/runtime-safety'
import { getErrorMessage } from '@/utils/string'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import {
  formatRuntimeDateTime,
  getWorklineRiskLabel as worklineRiskLabel,
  getWorklineRiskTone as worklineRiskTone,
  readPositiveInt
} from '@/utils/runtime-display'
import type {
  RuntimeSafetyIncidentSummary,
  RuntimeMonitorReconciliationCandidate,
  RuntimeMonitorSessionItem,
  RuntimeMonitorTraceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

const route = useRoute()
const router = useRouter()
const store = useWorklineRuntimeStore()
const sseStore = useRuntimeSSEStore()
const { hasPermission } = usePermission()
const canClearWorklineEstop = computed(() => hasPermission(BIZ_PERMISSIONS.workline.clearEstop))
const canViewRuntimeHold = computed(() => hasPermission(BIZ_PERMISSIONS.workline.viewRuntimeHold))
const canResolveReconciliation = computed(() =>
  hasPermission(BIZ_PERMISSIONS.workline.resolveReconciliation)
)

const clearingWorklineEstop = ref(false)
const resolvingReconciliation = ref(false)
const searchText = ref('')

const selectedWorklineId = computed(() => readPositiveInt(route.query.worklineId))
const selectedDeviceId = computed(() => readPositiveInt(route.query.deviceId))

const filteredWorklines = computed(() => {
  if (!searchText.value) return store.orderedWorklines
  const q = searchText.value.toLowerCase()
  return store.orderedWorklines.filter(
    w =>
      w.line_name.toLowerCase().includes(q) ||
      w.line_code.toLowerCase().includes(q) ||
      (w.zone_name ?? '').toLowerCase().includes(q)
  )
})

const currentWorklineSummary = computed(() => {
  const id = selectedWorklineId.value
  if (!id) return null
  if (store.projection?.summary.id === id) return store.projection.summary
  return store.findSummary(id) ?? null
})

const pendingReconciliationCandidate = computed(
  () => store.projection?.action_candidates.pending_reconciliation ?? null
)

const currentWorklineSafetyVerdict = computed(() => {
  const s = currentWorklineSummary.value
  if (!s)
    return {
      tone: 'success' as const,
      label: '稳定',
      priority: 0,
      safetyLocked: false,
      canAttemptClear: false,
      blockedReason: null,
      evidenceFreshness: 'not_required' as const,
      state: 'UNLOCKED' as const
    }
  const stub = s.active_safety_incident_id
    ? ({ status: 'OPEN' } as unknown as RuntimeSafetyIncidentSummary)
    : null
  return getWorklineRuntimeVerdict(
    s,
    stub,
    store.projection?.summary.id === s.id
      ? getWorklineDeviceSafetyEvidence(store.projection.device_nodes ?? [])
      : undefined
  )
})

const hasRuntimeHoldProjection = computed(() => {
  const ids = new Set<number>()
  const deviceNodes = store.projection?.device_nodes ?? []
  for (const d of deviceNodes) {
    for (const hid of d.active_runtime_hold_ids ?? []) ids.add(hid)
  }
  const openIssues = deviceNodes.reduce((t, d) => t + (d.open_issue_count ?? 0), 0)
  const blockedOutbox = deviceNodes.reduce((t, d) => t + (d.blocked_outbox_count ?? 0), 0)
  return (
    ids.size > 0 ||
    openIssues > 0 ||
    blockedOutbox > 0 ||
    currentWorklineSummary.value?.runtime_status === RECONCILING_RUNTIME_STATUS
  )
})

function lastActivityLabel(item: RuntimeWorklineSummary) {
  return item.last_activity_at ? formatRuntimeDateTime(item.last_activity_at) : '暂无活动'
}

const refreshWorklines = createCoalescedAsyncTask(async () => {
  store.loading = true
  try {
    await store.loadWorklines()
    if (!selectedWorklineId.value && store.worklines[0]?.id) {
      await router.replace({
        query: { ...route.query, ...buildRuntimeWorklineQuery(store.worklines[0].id) }
      })
    }
    sseStore.markRefreshedAt()
  } finally {
    store.loading = false
  }
})

const refreshProjection = createCoalescedAsyncTask(async () => {
  if (!selectedWorklineId.value) {
    store.clearProjection()
    return
  }
  if (store.projection?.summary.id === selectedWorklineId.value) return
  await forceRefreshProjection()
})

const forceRefreshProjection = createCoalescedAsyncTask(async () => {
  if (!selectedWorklineId.value) {
    store.clearProjection()
    return
  }
  store.loading = true
  try {
    await store.loadProjection(selectedWorklineId.value)
    sseStore.markRefreshedAt()
  } finally {
    store.loading = false
  }
})

function selectWorkline(row: RuntimeWorklineSummary) {
  if (selectedWorklineId.value === row.id) return
  router.push({ query: { ...route.query, ...buildRuntimeWorklineQuery(row.id) } })
}

function openDevice(deviceId: number) {
  router.push({ name: 'RuntimeDevices', query: { deviceId: String(deviceId) } })
}

function openTrace(session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem) {
  router.push({
    name: 'RuntimeCases',
    query: {
      sessionId: String(session.session_id),
      traceId: undefined,
      worklineId: String(session.workline_id)
    }
  })
}

async function clearWorklineEstop() {
  if (!canClearWorklineEstop.value || !currentWorklineSafetyVerdict.value.canAttemptClear) return
  const wid = selectedWorklineId.value
  if (!wid) return
  try {
    await ElMessageBox.confirm('确认现场/沙箱设备已复位、安全区域已清空？', '恢复 WorkLine 接收', {
      confirmButtonText: '恢复接收',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  clearingWorklineEstop.value = true
  try {
    await runtimeApiMethods
      .clearEstop(wid, {
        reason: '人工确认 WorkLine 软件急停解除',
        checks: {
          estop_button_reset: true,
          area_safe: true,
          devices_reset: true,
          operator_confirmed: true
        }
      })
      .send()
    ElMessage.success('已解除冻结，等待现场硬件 START')
    await forceRefreshProjection()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '恢复接收失败'))
  } finally {
    clearingWorklineEstop.value = false
  }
}

async function resolveRuntimeReconciliation(payload: {
  sessionId: number
  resolution: 'COMPLETED' | 'FAILED' | 'CANCELLED'
  checks: Record<string, boolean>
  operatorNote: string
  resultPayload: Record<string, unknown> | null
}) {
  if (!canResolveReconciliation.value) return
  const candidate: RuntimeMonitorReconciliationCandidate | null =
    pendingReconciliationCandidate.value
  if (!candidate || candidate.session_id !== payload.sessionId) return

  resolvingReconciliation.value = true
  try {
    await runtimeApiMethods
      .resolveRuntimeReconciliation(payload.sessionId, {
        resolution: payload.resolution,
        checks: payload.checks,
        operator_note: payload.operatorNote,
        result_payload: payload.resultPayload,
        confirmed_at: new Date().toISOString()
      })
      .send()
    ElMessage.success('已解除运行时对账隔离')
    await forceRefreshProjection()
    await refreshWorklines()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '解除运行时对账隔离失败'))
  } finally {
    resolvingReconciliation.value = false
  }
}

onMounted(() => {
  void (async () => {
    await refreshWorklines()
    if (selectedWorklineId.value && store.projection?.summary.id !== selectedWorklineId.value) {
      await refreshProjection()
    }
  })()
})

watch(
  () => selectedWorklineId.value,
  (next, prev) => {
    if (next && next !== prev) void refreshProjection()
  }
)

watch(
  () => sseStore.lastEvent,
  event => {
    if (!sseStore.live || !event) return
    if (
      !isRelevantRuntimeEvent(event, {
        worklineId: store.projection?.summary.id ?? selectedWorklineId.value
      })
    )
      return
    const targets = classifyRuntimeRefresh(event)
    if (targets.projection && selectedWorklineId.value) void forceRefreshProjection()
    if (targets.worklines) void refreshWorklines()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 680px;
}

.monitor-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 340px minmax(0, 1fr) minmax(320px, 380px);
  align-items: stretch;
}

.monitor-panel {
  border: 1px solid rgb(245 158 11 / 0.12);
  border-radius: 14px;
  background: #1e293b;
}

.monitor-panel__header {
  display: flex;
  align-items: center;
}

.monitor-layout__list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.monitor-layout__list :deep(.el-card__header) {
  flex: 0 0 auto;
}

.monitor-layout__list :deep(.el-card__body) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.monitor-layout__list-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.monitor-layout__live,
.monitor-layout__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
}

.monitor-layout__empty {
  grid-column: 2 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

.monitor-action-cabin__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.monitor-action-cabin__title {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.monitor-action-cabin__meta,
.monitor-action-cabin__hint {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.monitor-directory-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monitor-directory-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1px solid rgb(245 158 11 / 0.12);
  border-radius: 12px;
  background: rgb(30 41 59 / 0.6);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}

.monitor-directory-card:hover {
  border-color: rgb(245 158 11 / 0.24);
}

.monitor-directory-card.is-active {
  border-color: rgb(245 158 11 / 0.36);
  background: rgb(245 158 11 / 0.06);
}

.monitor-directory-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.monitor-directory-card__time {
  margin-left: auto;
  color: #64748b;
  font-size: 11px;
}

.monitor-directory-card__title {
  color: #f8fafc;
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 15px;
  font-weight: 700;
}

.monitor-directory-card__meta {
  color: #94a3b8;
  font-size: 12px;
}

.monitor-directory-card__hint {
  color: #64748b;
  font-size: 11px;
}

@media (width >= 1280px) and (height >= 900px) {
  .monitor-layout {
    height: calc(100vh - 180px);
    min-height: 620px;
    overflow: hidden;
  }

  .monitor-layout__list,
  .monitor-layout__live,
  .monitor-layout__actions {
    height: 100%;
    min-height: 0;
  }
}

@media (1280px <= width <= 1439px) {
  .monitor-layout {
    grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
    align-items: start;
  }

  .monitor-layout__actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    align-items: start;
    overflow-y: visible;
  }
}

@media (width <= 1279px) {
  .monitor-layout {
    display: flex;
    flex-direction: column;
  }
}
</style>
