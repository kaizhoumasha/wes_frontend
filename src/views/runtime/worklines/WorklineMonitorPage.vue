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

      <!-- 右侧详情面板 -->
      <div class="monitor-layout__detail">
        <template v-if="store.detail">
          <WorklineRuntimeHoldSummaryPanel
            v-if="hasRuntimeHoldProjection"
            :summary="store.detail.summary"
            :detail="store.detail"
            :can-view-hold="canViewRuntimeHold"
          />
          <WorklineSafetyIncidentPanel
            v-if="currentWorklineSafetyVerdict.safetyLocked && !hasRuntimeHoldProjection"
            :summary="store.detail.summary"
            :verdict="currentWorklineSafetyVerdict"
            :can-clear-estop="canClearWorklineEstop"
            :clear-estop-loading="clearingWorklineEstop"
            @refresh="refreshDetail"
            @clear-estop="clearWorklineEstop"
          />
          <WorklineLiveOverview
            :workline-summary="store.detail.summary"
            :workline-detail="store.detail"
            :devices="store.detail.devices"
            :active-sessions="store.detail.active_sessions"
            :recent-failed-traces="store.detail.recent_failed_traces"
            :recent-completed-traces="store.detail.recent_completed_traces"
            :selected-device-id="selectedDeviceId"
            :session-counts-by-device="store.sessionCountsByDevice"
            @select-device="openDevice"
            @select-session="openTrace"
          />
        </template>

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
  RuntimeTraceListItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

const route = useRoute()
const router = useRouter()
const store = useWorklineRuntimeStore()
const sseStore = useRuntimeSSEStore()
const { hasPermission } = usePermission()
const canClearWorklineEstop = computed(() => hasPermission(BIZ_PERMISSIONS.workline.clearEstop))
const canViewRuntimeHold = computed(() => hasPermission(BIZ_PERMISSIONS.workline.viewRuntimeHold))

const clearingWorklineEstop = ref(false)
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
  if (store.detail?.summary.id === id) return store.detail.summary
  return store.findSummary(id) ?? null
})

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
    store.detail?.summary.id === s.id
      ? getWorklineDeviceSafetyEvidence(store.detail.devices)
      : undefined
  )
})

const hasRuntimeHoldProjection = computed(() => {
  const ids = new Set<number>()
  for (const d of store.detail?.devices ?? []) {
    for (const hid of d.active_runtime_hold_ids ?? []) ids.add(hid)
  }
  const openIssues = (store.detail?.devices ?? []).reduce(
    (t, d) => t + (d.open_issue_count ?? 0),
    0
  )
  const blockedOutbox = (store.detail?.devices ?? []).reduce(
    (t, d) => t + (d.blocked_outbox_count ?? 0),
    0
  )
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

const refreshDetail = createCoalescedAsyncTask(async () => {
  if (!selectedWorklineId.value) {
    store.clearDetail()
    return
  }
  if (store.detail?.summary.id === selectedWorklineId.value) return
  store.loading = true
  try {
    await store.loadDetail(selectedWorklineId.value)
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

function openTrace(session: RuntimeTraceListItem) {
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
    await refreshDetail()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '恢复接收失败'))
  } finally {
    clearingWorklineEstop.value = false
  }
}

onMounted(() => {
  void (async () => {
    await refreshWorklines()
    if (selectedWorklineId.value && store.detail?.summary.id !== selectedWorklineId.value) {
      await refreshDetail()
    }
  })()
})

watch(
  () => selectedWorklineId.value,
  (next, prev) => {
    if (next && next !== prev) void refreshDetail()
  }
)

watch(
  () => sseStore.lastEvent,
  event => {
    if (!sseStore.live || !event) return
    if (
      !isRelevantRuntimeEvent(event, {
        worklineId: store.detail?.summary.id ?? selectedWorklineId.value
      })
    )
      return
    const targets = classifyRuntimeRefresh(event)
    if (targets.detail && selectedWorklineId.value) void refreshDetail()
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
  grid-template-columns: 340px minmax(0, 1fr);
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

.monitor-layout__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
}

.monitor-layout__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
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
  .monitor-layout__detail {
    height: 100%;
    min-height: 0;
  }
}

@media (width <= 1279px) {
  .monitor-layout {
    display: flex;
    flex-direction: column;
  }
}
</style>
