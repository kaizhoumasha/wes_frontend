<template>
  <main
    v-loading="store.loading"
    class="runtime-page"
    aria-label="工作线监控"
  >
    <header
      class="monitor-shell-topbar"
      data-test="monitor-shell-topbar"
    >
      <div class="monitor-shell-topbar__brand">
        <button
          type="button"
          class="monitor-shell-topbar__back"
          data-test="monitor-back-overview"
          @click="goRuntimeOverview"
        >
          运行总览
        </button>
        <div>
          <h1 class="monitor-shell-topbar__title">WES 运行监控中心</h1>
          <p class="monitor-shell-topbar__subtitle">
            {{ currentWorklineSummary?.line_code || '未选中工作线' }} · WES / ECS 合同监控
          </p>
        </div>
      </div>
      <div class="monitor-shell-topbar__controls">
        <RuntimeStatusBadge
          :label="sseStore.connectionLabel"
          :tone="sseStore.connectionTone"
          :pulse="sseStore.live && sseStore.state === 'connected'"
        />
        <el-switch
          :model-value="sseStore.live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          data-test="monitor-live-toggle"
          @change="value => sseStore.toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="sseStore.lastRefreshedAt"
          :frozen="!sseStore.live"
        />
        <button
          type="button"
          class="monitor-shell-topbar__theme"
          :aria-pressed="isDark"
          data-test="monitor-theme-toggle"
          @click="toggleTheme()"
        >
          {{ isDark ? '浅色' : '深色' }}
        </button>
        <el-button
          size="small"
          plain
          :loading="store.loading"
          data-test="monitor-shell-refresh"
          @click="forceRefreshProjection"
        >
          刷新
        </el-button>
      </div>
    </header>

    <div
      class="monitor-pane-switcher"
      role="tablist"
      aria-label="工作线监控视图"
    >
      <button
        type="button"
        class="monitor-pane-switcher__button"
        :class="{ 'is-active': activeMobilePane === 'line' }"
        :aria-pressed="activeMobilePane === 'line'"
        data-test="monitor-mobile-pane-line"
        @click="activeMobilePane = 'line'"
      >
        线体
      </button>
      <button
        type="button"
        class="monitor-pane-switcher__button"
        :class="{ 'is-active': activeMobilePane === 'scene' }"
        :aria-pressed="activeMobilePane === 'scene'"
        data-test="monitor-mobile-pane-scene"
        @click="activeMobilePane = 'scene'"
      >
        场景
      </button>
      <button
        type="button"
        class="monitor-pane-switcher__button"
        :class="{ 'is-active': activeMobilePane === 'actions' }"
        :aria-pressed="activeMobilePane === 'actions'"
        data-test="monitor-mobile-pane-actions"
        @click="activeMobilePane = 'actions'"
      >
        行动
      </button>
    </div>

    <div class="monitor-layout">
      <!-- 左侧工作线目录 -->
      <aside
        class="monitor-layout__list"
        :class="{ 'is-mobile-pane-active': activeMobilePane === 'line' }"
        aria-label="工作线目录"
      >
        <el-card
          shadow="never"
          class="monitor-panel monitor-layout__list-card"
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
                data-test="monitor-workline-card"
                @click="selectWorkline(item)"
              >
                <div class="monitor-directory-card__top">
                  <span class="monitor-directory-card__title">{{ item.line_name }}</span>
                  <RuntimeStatusBadge
                    :label="worklineRiskLabel(item)"
                    :tone="worklineRiskTone(item)"
                    size="small"
                  />
                  <span class="monitor-directory-card__time">{{ lastActivityLabel(item) }}</span>
                </div>
                <div class="monitor-directory-card__meta">
                  {{ item.line_code }} · {{ item.zone_name || '未配置区域' }}
                </div>
                <div class="monitor-directory-card__stats">
                  <div data-test="monitor-workline-card-stat">
                    <span>活跃</span>
                    <strong>{{ item.active_session_count }}</strong>
                  </div>
                  <div data-test="monitor-workline-card-stat">
                    <span>积压</span>
                    <strong>{{ item.waiting_session_count }}</strong>
                  </div>
                  <div data-test="monitor-workline-card-stat">
                    <span>故障</span>
                    <strong>{{ item.failed_session_count }}</strong>
                  </div>
                  <div data-test="monitor-workline-card-stat">
                    <span>离线</span>
                    <strong>{{ item.offline_device_count }}</strong>
                  </div>
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
      </aside>

      <!-- 中央实时总览 -->
      <section
        v-if="store.projection"
        class="monitor-layout__live"
        :class="{ 'is-mobile-pane-active': activeMobilePane === 'scene' }"
        aria-label="运行场景"
      >
        <WorklineLiveOverview
          :workline-summary="store.projection.summary"
          :workline-projection="store.projection"
          :event-log-entries="eventLogEntries"
          :selected-device-id="selectedDeviceId"
          @select-device="openDevice"
        />
      </section>

      <!-- 右侧行动舱 -->
      <aside
        v-if="store.projection"
        class="monitor-layout__actions"
        :class="{ 'is-mobile-pane-active': activeMobilePane === 'actions' }"
        aria-label="工作线行动舱"
      >
        <section
          v-if="selectedDevice"
          class="monitor-panel monitor-device-panel"
          data-test="monitor-selected-device-panel"
          aria-label="选中设备诊断"
        >
          <header class="monitor-device-panel__header">
            <div>
              <div class="monitor-device-panel__eyebrow">选中设备</div>
              <h2 class="monitor-device-panel__title">{{ selectedDevice.device_name }}</h2>
              <p class="monitor-device-panel__meta">
                {{ selectedDevice.device_code }} · {{ selectedDevice.device_role }} #{{
                  selectedDevice.role_index
                }}
              </p>
            </div>
            <RuntimeStatusBadge
              :status="selectedDevice.device_status"
              size="small"
            />
          </header>

          <div
            class="monitor-device-panel__tabs"
            role="tablist"
            aria-label="设备详情视图"
          >
            <button
              type="button"
              class="monitor-device-panel__tab"
              :class="{ 'is-active': activeSideTab === 'control' }"
              :aria-pressed="activeSideTab === 'control'"
              data-test="monitor-side-tab-control"
              @click="activeSideTab = 'control'"
            >
              诊断与控制
            </button>
            <button
              type="button"
              class="monitor-device-panel__tab"
              :class="{ 'is-active': activeSideTab === 'business' }"
              :aria-pressed="activeSideTab === 'business'"
              data-test="monitor-side-tab-business"
              @click="activeSideTab = 'business'"
            >
              业务关联投影
            </button>
          </div>

          <section
            v-if="activeSideTab === 'control'"
            class="monitor-device-panel__tab-panel"
            data-test="monitor-device-control-panel"
          >
            <MonitorAlertCard
              v-if="deviceAlertContent"
              :tone="deviceAlertContent.tone"
              :title="deviceAlertContent.title"
              :message="deviceAlertContent.message"
              :source="deviceAlertContent.source"
            />

            <MonitorCommandChain :command="deviceCommandView" />

            <MonitorDeviceActionGroup
              :mode="deviceActionMode"
              :can-clear-estop="canClearWorklineEstop"
              :can-attempt-clear="currentWorklineSafetyVerdict.canAttemptClear"
              :can-resolve="canResolveReconciliation"
              :can-manage-maintenance="canUpdateDevice"
              :maintenance-active="isSelectedDeviceInMaintenance"
              :busy="busyAnyAction"
              :blocked-reason="currentWorklineSafetyVerdict.blockedReason"
              @clear-estop="clearWorklineEstop"
              @resolve-reconciliation="onResolveReconciliationFromActionGroup"
              @enter-maintenance="onEnterMaintenanceFromActionGroup"
              @exit-maintenance="onExitMaintenanceFromActionGroup"
            />
          </section>

          <section
            v-else
            class="monitor-device-panel__tab-panel monitor-business-projection"
            data-test="monitor-business-projection"
          >
            <MonitorToteTwinCard
              v-if="deviceToteTwinView"
              :view="deviceToteTwinView"
            />

            <MonitorRackOccupancyMatrix
              v-if="deviceRackOccupancyView"
              :view="deviceRackOccupancyView"
              @select="onRackCellSelect"
            />

            <p
              v-if="!deviceToteTwinView && !deviceRackOccupancyView"
              class="monitor-device-panel__hint"
            >
              选中设备没有可投影的物料/货格信息。
            </p>

            <div
              v-if="selectedDeviceSessions.length"
              class="monitor-device-panel__sessions"
            >
              <div class="monitor-device-panel__section-title">关联会话</div>
              <button
                v-for="session in selectedDeviceSessions.slice(0, 3)"
                :key="`${session.session_id}-${session.status}`"
                type="button"
                class="monitor-device-panel__session"
                @click="openTrace(session)"
              >
                <span>{{ session.session_code }}</span>
                <strong>{{ session.status }}</strong>
              </button>
            </div>
          </section>
        </section>

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
          <WorklineReconciliationForm
            v-if="pendingReconciliationCandidate"
            :summary="store.projection.summary"
            :candidate="pendingReconciliationCandidate"
            :can-resolve="canResolveReconciliation"
            :resolving="resolvingReconciliation"
            @refresh="forceRefreshProjection"
            @resolve="resolveRuntimeReconciliation"
          />
        </template>
      </aside>

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
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { devicesApiMethods } from '@/api/modules/devices'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import WorklineLiveOverview from '@/components/runtime/monitor/WorklineLiveOverview.vue'
import WorklineReconciliationForm from '@/components/runtime/monitor/WorklineReconciliationForm.vue'
import WorklineRuntimeHoldSummaryPanel from '@/components/runtime/monitor/WorklineRuntimeHoldSummaryPanel.vue'
import MonitorAlertCard from '@/components/runtime/monitor/MonitorAlertCard.vue'
import MonitorCommandChain from '@/components/runtime/monitor/MonitorCommandChain.vue'
import MonitorDeviceActionGroup from '@/components/runtime/monitor/MonitorDeviceActionGroup.vue'
import MonitorToteTwinCard from '@/components/runtime/monitor/MonitorToteTwinCard.vue'
import MonitorRackOccupancyMatrix from '@/components/runtime/monitor/MonitorRackOccupancyMatrix.vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { usePermission } from '@/composables/usePermission'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { RECONCILING_RUNTIME_STATUS } from '@/constants/runtime-safety'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import {
  classifyRuntimeRefresh,
  isRelevantRuntimeEvent,
  type RuntimeSSEPayload
} from '@/utils/runtime-event'
import { getWorklineDeviceSafetyEvidence, getWorklineRuntimeVerdict } from '@/utils/runtime-safety'
import { getErrorMessage } from '@/utils/string'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import {
  buildRackOccupancyView,
  buildSelectedDeviceCommandView,
  buildSelectedDeviceToteTwinView
} from '@/utils/runtime-scene'
import {
  formatRuntimeDateTime,
  getWorklineRiskLabel as worklineRiskLabel,
  getWorklineRiskTone as worklineRiskTone,
  readPositiveInt
} from '@/utils/runtime-display'
import type {
  RuntimeMonitorDeviceNode,
  RuntimeSafetyIncidentSummary,
  RuntimeMonitorReconciliationCandidate,
  RuntimeMonitorSessionItem,
  RuntimeMonitorTraceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

type MonitorMobilePane = 'line' | 'scene' | 'actions'
type MonitorSideTab = 'control' | 'business'

interface MonitorEventLogEntry {
  id: string
  time: string
  level: 'info' | 'warn' | 'err'
  tag: string
  text: string
}

const MAX_MONITOR_EVENT_LOGS = 20

const route = useRoute()
const router = useRouter()
const store = useWorklineRuntimeStore()
const sseStore = useRuntimeSSEStore()
const { isDark, toggle: toggleTheme } = useDarkMode()
const { hasPermission } = usePermission()
const canClearWorklineEstop = computed(() => hasPermission(BIZ_PERMISSIONS.workline.clearEstop))
const canViewRuntimeHold = computed(() => hasPermission(BIZ_PERMISSIONS.workline.viewRuntimeHold))
const canResolveReconciliation = computed(() =>
  hasPermission(BIZ_PERMISSIONS.workline.resolveReconciliation)
)
const canUpdateDevice = computed(() => hasPermission(BIZ_PERMISSIONS.device.update))

const clearingWorklineEstop = ref(false)
const resolvingReconciliation = ref(false)
const enteringDeviceMaintenance = ref(false)
const exitingDeviceMaintenance = ref(false)
const searchText = ref('')
const activeMobilePane = ref<MonitorMobilePane>('line')
const activeSideTab = ref<MonitorSideTab>('control')
const hasInitializedProjectionPane = ref(false)
const eventLogEntries = ref<MonitorEventLogEntry[]>([])

const selectedWorklineId = computed(() => readPositiveInt(route.query.worklineId))
const selectedDeviceId = computed(() => readPositiveInt(route.query.deviceId))
const selectedDevice = computed<RuntimeMonitorDeviceNode | null>(() => {
  const id = selectedDeviceId.value
  if (!id) return null
  return store.projection?.device_nodes?.find(device => device.id === id) ?? null
})

const selectedDeviceSessions = computed(() => {
  const device = selectedDevice.value
  if (!device || !store.projection) return []
  return [
    ...(store.projection.active_sessions.items ?? []),
    ...(store.projection.recent_failed_traces.items ?? []),
    ...(store.projection.recent_completed_traces.items ?? [])
  ].filter(session => session.device_id === device.id)
})

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

const deviceAlertContent = computed<{
  tone: 'danger' | 'warning'
  title: string
  message: string
  source?: string
} | null>(() => {
  if (currentWorklineSafetyVerdict.value.safetyLocked) {
    return {
      tone: 'danger',
      title: 'WORKLINE_ESTOPPED',
      message:
        currentWorklineSummary.value?.stopped_reason ||
        '工作线已软件急停冻结，请确认现场设备状态后恢复接收',
      source: currentWorklineSafetyVerdict.value.blockedReason ?? undefined
    }
  }
  const candidate = pendingReconciliationCandidate.value
  if (candidate) {
    return {
      tone: 'warning',
      title: candidate.reason ?? 'RECONCILE_PENDING',
      message: `Owner Session ${candidate.session_code} 已隔离派发，请在下方确认现场状态后解除`,
      source: candidate.occurred_at ? formatRuntimeDateTime(candidate.occurred_at) : undefined
    }
  }
  return null
})

const deviceCommandView = computed(() => buildSelectedDeviceCommandView(selectedDevice.value))

const deviceActionMode = computed<'idle' | 'estop' | 'reconciliation'>(() => {
  if (currentWorklineSafetyVerdict.value.safetyLocked) return 'estop'
  if (pendingReconciliationCandidate.value) return 'reconciliation'
  return 'idle'
})

const isSelectedDeviceInMaintenance = computed(() =>
  Boolean(selectedDevice.value?.maintenance_mode)
)

const busyAnyAction = computed(
  () =>
    clearingWorklineEstop.value ||
    resolvingReconciliation.value ||
    enteringDeviceMaintenance.value ||
    exitingDeviceMaintenance.value
)

const deviceToteTwinView = computed(() =>
  buildSelectedDeviceToteTwinView(selectedDevice.value, selectedDeviceSessions.value)
)

const deviceRackOccupancyView = computed(() => {
  if (!store.projection) return null
  return buildRackOccupancyView(store.projection, { columns: 4 })
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
  activeMobilePane.value = 'scene'
  router.push({ query: { ...route.query, ...buildRuntimeWorklineQuery(row.id) } })
}

function goRuntimeOverview() {
  router.push({
    name: 'RuntimeOverview',
    query: selectedWorklineId.value ? buildRuntimeWorklineQuery(selectedWorklineId.value) : {}
  })
}

function openDevice(deviceId: number) {
  activeMobilePane.value = 'actions'
  activeSideTab.value = 'control'
  router.push({ query: { ...route.query, deviceId: String(deviceId) } })
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

// T9 handlers wired up by T10 ActionGroup adapters below.
async function enterDeviceMaintenance(deviceId: number, reason?: string) {
  if (!canUpdateDevice.value) {
    ElMessage.error('需要 biz:device:update 权限')
    return
  }
  if (!Number.isInteger(deviceId) || deviceId <= 0) return
  try {
    await ElMessageBox.confirm('确认让该设备进入维护模式？维护期间设备将停止参与派发。', '设备进入维护', {
      confirmButtonText: '进入维护',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  enteringDeviceMaintenance.value = true
  try {
    await devicesApiMethods
      .runtimeEnterMaintenance({ id: deviceId }, { reason: reason ?? '人工触发设备进入维护' })
      .send()
    ElMessage.success('设备已进入维护')
    await forceRefreshProjection()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '设备进入维护失败'))
  } finally {
    enteringDeviceMaintenance.value = false
  }
}

async function exitDeviceMaintenance(deviceId: number, reason?: string) {
  if (!canUpdateDevice.value) {
    ElMessage.error('需要 biz:device:update 权限')
    return
  }
  if (!Number.isInteger(deviceId) || deviceId <= 0) return
  try {
    await ElMessageBox.confirm('确认让该设备退出维护并恢复派发？', '设备退出维护', {
      confirmButtonText: '退出维护',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  exitingDeviceMaintenance.value = true
  try {
    await devicesApiMethods
      .runtimeExitMaintenance({ id: deviceId }, { reason: reason ?? '人工触发设备退出维护' })
      .send()
    ElMessage.success('设备已退出维护')
    await forceRefreshProjection()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '设备退出维护失败'))
  } finally {
    exitingDeviceMaintenance.value = false
  }
}

function onResolveReconciliationFromActionGroup() {
  // The reconciliation form renders below whenever a pending candidate exists;
  // the ActionGroup button only signals operator intent — no extra work needed.
}

function onEnterMaintenanceFromActionGroup() {
  const id = selectedDeviceId.value
  if (!id) return
  void enterDeviceMaintenance(id)
}

function onExitMaintenanceFromActionGroup() {
  const id = selectedDeviceId.value
  if (!id) return
  void exitDeviceMaintenance(id)
}

function onRackCellSelect() {
  // Rack cell selection is forwarded for future highlighting linkage; T11 verifies.
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
    if (next !== prev) eventLogEntries.value = []
    if (next && next !== prev) void refreshProjection()
  }
)

watch(
  () => store.projection?.summary.id ?? null,
  projectionId => {
    if (!projectionId) {
      activeMobilePane.value = 'line'
      hasInitializedProjectionPane.value = false
      return
    }
    if (!hasInitializedProjectionPane.value) {
      activeMobilePane.value = 'scene'
      hasInitializedProjectionPane.value = true
    }
  }
)

watch(
  () => sseStore.lastEvent,
  event => {
    if (!sseStore.live || !event) return
    const worklineId = store.projection?.summary.id ?? selectedWorklineId.value
    if (
      !isRelevantRuntimeEvent(event, {
        worklineId
      })
    )
      return
    appendMonitorEventLog(event)
    const targets = classifyRuntimeRefresh(event)
    if (targets.projection && selectedWorklineId.value) void forceRefreshProjection()
    if (targets.worklines) void refreshWorklines()
  }
)

function appendMonitorEventLog(event: RuntimeSSEPayload): void {
  const entry = toMonitorEventLogEntry(event)
  eventLogEntries.value = [entry, ...eventLogEntries.value].slice(0, MAX_MONITOR_EVENT_LOGS)
}

function toMonitorEventLogEntry(event: RuntimeSSEPayload): MonitorEventLogEntry {
  const level = getMonitorEventLevel(event)
  return {
    id: `${Date.now()}-${event.entity ?? 'runtime'}-${event.action ?? 'event'}`,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    level,
    tag: level === 'err' ? 'ERROR' : level === 'warn' ? 'WARN' : 'INFO',
    text: getMonitorEventText(event)
  }
}

function getMonitorEventLevel(event: RuntimeSSEPayload): MonitorEventLogEntry['level'] {
  const action = String(event.action ?? '').toLowerCase()
  const entity = String(event.entity ?? '').toLowerCase()
  if (event.payload?.error_code || action.includes('estop') || action.includes('failed'))
    return 'err'
  if (entity.includes('reconciliation') || entity.includes('hold') || action.includes('wait')) {
    return 'warn'
  }
  return 'info'
}

function getMonitorEventText(event: RuntimeSSEPayload): string {
  const entity = event.entity ?? 'runtime'
  const action = event.action ?? 'event'
  const deviceCode = readStringEventValue(event.keys?.device_code ?? event.payload?.device_code)
  const errorCode = readStringEventValue(event.payload?.error_code ?? event.keys?.error_code)
  const target = deviceCode ? ` [${deviceCode}]` : ''
  const suffix = errorCode ? ` ${errorCode}` : ''
  return `SSE ${entity}.${action}${target}${suffix}`
}

function readStringEventValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}
</script>

<style scoped>
.runtime-page {
  --monitor-shell-border: var(--runtime-border-subtle, rgb(148 163 184 / 0.18));
  --monitor-shell-surface: var(--runtime-surface, rgb(15 23 42 / 0.78));
  --monitor-shell-surface-strong: var(--runtime-surface-strong, rgb(15 23 42 / 0.92));
  --monitor-shell-surface-muted: var(--runtime-surface-muted, rgb(30 41 59 / 0.72));
  --monitor-shell-accent: rgb(245 158 11 / 0.72);
  --runtime-text: var(--runtime-text-primary);

  gap: 12px;
  height: 100vh;
  height: 100dvh;
  min-height: 720px;
  padding: 10px;
  overflow: hidden;
  color: var(--runtime-text-primary);
  background: var(--monitor-shell-bg);
}

html.dark .runtime-page {
  --monitor-shell-bg:
    radial-gradient(circle at 58% 22%, rgb(245 158 11 / 0.09), transparent 28%),
    linear-gradient(135deg, #070b16 0%, #101827 52%, #0c1220 100%);
}

html:not(.dark) .runtime-page {
  --monitor-shell-bg:
    radial-gradient(circle at 58% 20%, rgb(var(--color-primary-rgb) / 0.13), transparent 30%),
    linear-gradient(135deg, #f8fafc 0%, #e8edf3 100%);
}

.monitor-shell-topbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 58px;
  padding: 8px 12px;
  border: 1px solid var(--monitor-shell-border);
  border-radius: 8px;
  background: var(--monitor-shell-surface-strong);
  box-shadow: var(--runtime-shadow, none);
}

.monitor-shell-topbar__brand,
.monitor-shell-topbar__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.monitor-shell-topbar__controls {
  flex: 0 0 auto;
  justify-content: flex-end;
}

.monitor-shell-topbar__back,
.monitor-shell-topbar__theme {
  min-height: 32px;
  border: 1px solid var(--monitor-shell-border);
  border-radius: 7px;
  background: var(--monitor-shell-surface-muted);
  color: var(--runtime-text-primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.monitor-shell-topbar__back {
  padding: 0 10px;
}

.monitor-shell-topbar__theme {
  width: 44px;
  padding: 0;
}

.monitor-shell-topbar__theme[aria-pressed='true'] {
  border-color: rgb(245 158 11 / 0.4);
  color: var(--runtime-text-primary);
}

.monitor-shell-topbar__title {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.monitor-shell-topbar__subtitle {
  margin: 3px 0 0;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 11px;
  overflow-wrap: anywhere;
}

.monitor-pane-switcher {
  display: none;
}

.monitor-layout {
  display: grid;
  flex: 1 1 auto;
  min-height: 0;
  gap: 10px;
  grid-template-columns: 300px minmax(520px, 1fr) minmax(340px, 380px);
  align-items: stretch;
}

.monitor-panel {
  border: 1px solid var(--monitor-shell-border);
  border-radius: 8px;
  background: var(--monitor-shell-surface);
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

.monitor-layout__list > .monitor-panel {
  flex: 1 1 auto;
  min-height: 0;
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
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}

.monitor-layout__live {
  overflow: hidden;
}

.monitor-layout__live :deep(.workline-live-overview) {
  height: 100%;
  min-height: 0;
}

.monitor-layout__live :deep(.el-card.runtime-panel) {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 8px;
  background:
    linear-gradient(var(--monitor-shell-surface), var(--monitor-shell-surface)),
    radial-gradient(rgb(148 163 184 / 0.15) 1px, transparent 1px),
    radial-gradient(rgb(148 163 184 / 0.1) 1px, transparent 1px);
  background-size:
    100% 100%,
    20px 20px,
    20px 20px;
  background-position:
    0 0,
    0 0,
    10px 10px;
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

.monitor-device-panel {
  padding: 14px;
}

.monitor-device-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.monitor-device-panel__eyebrow,
.monitor-device-panel__section-title {
  color: var(--monitor-shell-accent);
  font-size: 11px;
  font-weight: 800;
}

.monitor-device-panel__title {
  margin: 4px 0 0;
  color: var(--runtime-text-primary);
  font-size: 17px;
  line-height: 1.25;
}

.monitor-device-panel__meta,
.monitor-device-panel__hint {
  margin: 4px 0 0;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.monitor-device-panel__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 14px;
  padding: 4px;
  border: 1px solid var(--monitor-shell-border);
  border-radius: 8px;
  background: var(--monitor-shell-surface-muted);
}

.monitor-device-panel__tab {
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.monitor-device-panel__tab.is-active {
  border-color: rgb(245 158 11 / 0.34);
  background: rgb(245 158 11 / 0.09);
  color: var(--runtime-text-primary);
}

.monitor-device-panel__tab-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
  min-width: 0;
}

.monitor-business-projection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-device-panel__sessions {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.monitor-device-panel__session {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid var(--monitor-shell-border);
  border-radius: 7px;
  background: transparent;
  color: var(--runtime-text-primary);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
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
  border: 1px solid var(--monitor-shell-border);
  border-radius: 8px;
  background: var(--monitor-shell-surface-muted);
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
  gap: 8px;
  min-width: 0;
}

.monitor-directory-card__time {
  margin-left: auto;
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.monitor-directory-card__title {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.monitor-directory-card__meta {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.monitor-directory-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.monitor-directory-card__stats > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.monitor-directory-card__stats span {
  color: var(--runtime-text-muted);
}

.monitor-directory-card__stats strong {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 11px;
  font-weight: 900;
}

@media (width >= 1280px) and (height >= 900px) {
  .monitor-layout {
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
  .runtime-page {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    overflow-y: auto;
  }

  .monitor-shell-topbar {
    align-items: flex-start;
  }

  .monitor-shell-topbar,
  .monitor-shell-topbar__controls {
    flex-wrap: wrap;
  }

  .monitor-layout {
    display: flex;
    flex-direction: column;
  }
}

@media (width <= 767px) {
  .monitor-shell-topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .monitor-shell-topbar__brand,
  .monitor-shell-topbar__controls {
    width: 100%;
  }

  .monitor-shell-topbar__controls {
    flex: 1 1 auto;
    justify-content: flex-start;
    gap: 8px;
  }

  .monitor-shell-topbar__controls :deep(.runtime-last-updated) {
    flex: 1 1 150px;
    max-width: none;
    min-width: 150px;
  }

  .monitor-pane-switcher {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .monitor-pane-switcher__button {
    min-height: 36px;
    border: 1px solid var(--monitor-shell-border);
    border-radius: 8px;
    background: var(--monitor-shell-surface-muted);
    color: var(--runtime-text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  .monitor-pane-switcher__button.is-active {
    border-color: rgb(245 158 11 / 0.44);
    background: rgb(245 158 11 / 0.12);
    color: var(--runtime-text-primary);
  }

  .monitor-layout__list,
  .monitor-layout__live,
  .monitor-layout__actions {
    display: none;
  }

  .monitor-layout__list.is-mobile-pane-active,
  .monitor-layout__live.is-mobile-pane-active,
  .monitor-layout__actions.is-mobile-pane-active {
    display: flex;
  }
}
</style>
