<template>
  <div
    v-loading="store.loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <!-- 面包屑导航（选中设备时显示） -->
      <div
        v-if="selectedDeviceId && selectedDeviceDetail"
        class="runtime-context-nav"
      >
        <button
          type="button"
          class="runtime-context-nav__back"
          @click="closeDevicePanel"
        >
          ← 返回工作线
        </button>
        <span class="runtime-context-nav__workline">
          {{ currentWorklineSummary?.line_name || '工作线' }}
        </span>
        <span class="runtime-context-nav__sep">›</span>
        <span class="runtime-context-nav__device">
          {{ selectedDeviceDetail.device_name }}
        </span>
        <span class="runtime-context-nav__meta">
          {{ selectedDeviceDetail.device_code }} · {{ selectedDeviceDetail.device_role }}
        </span>
      </div>
      <!-- 默认标题（未选中设备时显示） -->
      <div v-else>
        <h1 class="runtime-page__title">工作线运行监控</h1>
        <p class="runtime-page__subtitle">
          先看线体摘要，再下钻拓扑、运行队列与失败链路，确认阻塞是局部节点问题还是线体级异常。
        </p>
      </div>
      <div class="runtime-page__status-bar runtime-control-cluster">
        <RuntimeStatusBadge
          :label="connectionLabel"
          :tone="connectionTone"
          :pulse="live && state === 'connected'"
        />
        <el-switch
          :model-value="live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          @change="value => toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="lastRefreshedAt"
          :frozen="!live"
        />
        <el-button
          v-if="currentWorklineSafetyVerdict.safetyLocked"
          plain
          type="warning"
          class="runtime-page__recovery-action"
          @click="focusRecoveryPanel"
        >
          {{ selectedRecoveryActionLabel }}
        </el-button>
        <el-button
          plain
          class="runtime-page__refresh-action"
          @click="refreshWorklines"
        >
          刷新当前视图
        </el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />
    <div
      v-if="isStale"
      class="runtime-workline__stale-hint"
    >
      数据可能已过期 (SSE &gt; 15s)
    </div>

    <div class="runtime-layout">
      <el-card
        shadow="never"
        class="runtime-panel runtime-layout__list"
      >
        <template #header>
          <div class="runtime-panel__header runtime-panel__header--compact">
            <div
              v-if="selectedWorklineContextName"
              class="runtime-workline-context runtime-workline-context--compact runtime-compact-context"
            >
              <strong
                class="runtime-workline-context__name runtime-compact-context__name"
                :title="selectedWorklineContextName"
              >
                {{ selectedWorklineContextName }}
              </strong>
              <span class="runtime-workline-context__meta runtime-compact-context__meta">
                {{ selectedWorklineContextMeta }}
              </span>
            </div>
            <div
              v-else
              class="runtime-workline-placeholder"
            >
              选择工作线后查看线体运行态
            </div>
          </div>
        </template>

        <div class="runtime-layout__list-scroll">
          <div
            v-if="store.worklines.length"
            class="runtime-directory-list"
          >
            <button
              v-for="item in store.orderedWorklines"
              :key="item.id"
              type="button"
              class="runtime-directory-card"
              :class="{ 'is-active': item.id === selectedWorklineId }"
              @click="selectWorkline(item)"
            >
              <div class="runtime-directory-card__top">
                <RuntimeStatusBadge
                  :label="worklineRiskLabel(item)"
                  :tone="worklineRiskTone(item)"
                  size="small"
                />
                <span
                  v-if="worklineRecoveryLabel(item)"
                  class="runtime-directory-card__recovery-pill"
                  :class="`is-${worklineRecoveryTone(item)}`"
                >
                  {{ worklineRecoveryLabel(item) }}
                </span>
                <span class="runtime-directory-card__time">
                  {{ worklineLastActivityLabel(item) }}
                </span>
              </div>
              <div class="runtime-directory-card__title">{{ item.line_name }}</div>
              <div class="runtime-directory-card__meta">
                <span class="runtime-directory-card__run-mode">{{ item.run_mode }}</span>
                {{ item.line_code }} · {{ item.zone_name || '未配置区域' }}
              </div>
              <div class="runtime-directory-card__hint">
                活跃 {{ item.active_session_count }} · 等待 {{ item.waiting_session_count }} · 失败
                {{ item.failed_session_count }} · 离线 {{ item.offline_device_count }}
              </div>
              <div
                v-if="worklineRecoveryHint(item)"
                class="runtime-directory-card__recovery-row"
              >
                <span>恢复入口</span>
                <strong>{{ worklineRecoveryHint(item) }}</strong>
              </div>
            </button>
          </div>
          <RuntimeEmptyState
            v-else
            title="暂无工作线数据"
            description="当前还没有可用于运行监控的工作线样本。"
            hint="请确认后端工作线主数据、权限与 API 返回是否正常。"
          />
        </div>
      </el-card>

      <div class="runtime-layout__detail">
        <template v-if="store.detail">
          <div
            v-if="currentWorklineSafetyVerdict.safetyLocked"
            ref="recoveryPanelRef"
            class="runtime-recovery-anchor"
          >
            <WorklineRuntimeHoldSummaryPanel
              v-if="hasRuntimeHoldProjection"
              :summary="store.detail.summary"
              :detail="store.detail"
              :can-view-hold="canViewRuntimeHold"
            />

            <WorklineSafetyIncidentPanel
              v-else
              :summary="store.detail.summary"
              :verdict="currentWorklineSafetyVerdict"
              :can-clear-estop="canClearWorklineEstop"
              :clear-estop-loading="clearingWorklineEstop"
              @refresh="refreshDetail"
              @clear-estop="clearWorklineEstop"
            />
          </div>

          <!-- Mode Switcher (SIMULATION worklines only) -->
          <div
            v-if="sandboxAllowed === 'allowed'"
            class="runtime-mode-switcher"
          >
            <button
              type="button"
              class="runtime-mode-tab"
              :class="{ 'is-active': effectiveMode === 'live' }"
              @click="switchToLive()"
            >
              实时态势
            </button>
            <button
              type="button"
              class="runtime-mode-tab"
              :class="{ 'is-active': effectiveMode === 'sandbox' }"
              @click="switchToSandbox()"
            >
              Sandbox
            </button>
          </div>

          <template v-if="effectiveMode === 'sandbox'">
            <SandboxWorkbench
              :workline-id="store.detail.summary.id"
              :devices="store.detail.devices"
              :device-id="selectedDeviceId"
              :run-mode="store.detail.summary.run_mode"
              :safety-locked="currentWorklineSafetyVerdict.safetyLocked"
              :safety-lock-reason="currentWorklineSafetyVerdict.blockedReason"
              :can-clear-estop="
                canClearWorklineEstop && currentWorklineSafetyVerdict.canAttemptClear
              "
              :clear-estop-disabled-reason="clearWorklineEstopDisabledReason"
              :clear-estop-loading="clearingWorklineEstop"
              @refresh="refreshAfterSandboxAction"
              @safety-simulated="refreshAfterSafetySimulation"
              @clear-estop="clearWorklineEstop"
            />
          </template>
          <template v-else>
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
              @select-session="handleSelectSession"
            />
          </template>

          <!-- 设备详情抽屉 -->
          <StandardDrawer
            v-model="isDevicePanelOpen"
            direction="rtl"
            size="lg"
            :close-on-click-modal="true"
            :close-on-press-escape="true"
            custom-class="runtime-device-drawer"
            @close="closeDevicePanel"
          >
            <template #header>
              <div
                v-if="selectedDeviceDetail"
                class="runtime-device-drawer__header"
              >
                <strong class="runtime-device-drawer__title">
                  {{ selectedDeviceDetail.device_name }}
                </strong>
                <span class="runtime-device-drawer__meta">
                  {{ selectedDeviceDetail.device_code }} · {{ selectedDeviceDetail.device_role }}
                </span>
              </div>
            </template>

            <RuntimeDeviceInspector
              v-if="selectedDeviceId"
              :device-id="selectedDeviceId"
              :workline-id="store.detail.summary.id"
              :mode="effectiveMode"
              :show-header="false"
              @close="closeDevicePanel"
              @select-session="handleSelectSession"
            />
          </StandardDrawer>

          <!-- Trace 侧滑面板 -->
          <StandardDrawer
            v-model="isTraceDrawerOpen"
            direction="rtl"
            size="xl"
            :close-on-click-modal="true"
            :close-on-press-escape="true"
            custom-class="runtime-trace-drawer"
            @close="closeTraceDrawer"
          >
            <template #header>
              <div class="runtime-trace-drawer__header">
                <AppIconButton
                  icon="lucide:arrow-left"
                  :icon-size="16"
                  size="small"
                  plain
                  class="runtime-trace-drawer__back"
                  @click="closeTraceDrawer"
                >
                  <span>返回实时态势</span>
                </AppIconButton>
                <strong class="runtime-trace-drawer__title">
                  {{ traceDrawerHeaderTitle }}
                </strong>
              </div>
            </template>

            <TraceFocusPanel
              v-if="isTraceDrawerOpen && store.detail"
              :workline-id="store.detail.summary.id"
              :session-id="modeSessionId ? Number(modeSessionId) : null"
              :trace-id="modeTraceId"
              :show-header="false"
              @back-to-live="closeTraceDrawer"
              @header-change="handleTraceHeaderChange"
            />
          </StandardDrawer>
        </template>

        <el-card
          v-else
          shadow="never"
          class="runtime-panel runtime-layout__empty-state"
        >
          <RuntimeEmptyState
            title="还没有选中工作线"
            description="请从左侧线体目录选择一条工作线，进入拓扑与运行队列视图。"
            hint="目录会保持稳定排序；当前选中的工作线只高亮，不再置顶。"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNow } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import RuntimeDeviceInspector from '@/components/common/runtime/RuntimeDeviceInspector.vue'
import SandboxWorkbench from '@/components/common/runtime/SandboxWorkbench.vue'
import TraceFocusPanel from '@/components/common/runtime/TraceFocusPanel.vue'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
import WorklineSafetyIncidentPanel from '@/components/common/runtime/WorklineSafetyIncidentPanel.vue'
import WorklineRuntimeHoldSummaryPanel from '@/components/common/runtime/WorklineRuntimeHoldSummaryPanel.vue'
import WorklineLiveOverview from '@/components/common/runtime/WorklineLiveOverview.vue'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { useWorklineMode } from '@/composables/useWorklineMode'
import { usePermission } from '@/composables/usePermission'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type {
  RuntimeTraceListItem,
  RuntimeWorklineSummary,
  RuntimeSafetyIncidentSummary
} from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { classifyRuntimeRefresh, isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { getWorklineDeviceSafetyEvidence, getWorklineRuntimeVerdict } from '@/utils/runtime-safety'
import { getErrorMessage } from '@/utils/string'
import { ESTOPPED_RUNTIME_STATUS, RECONCILING_RUNTIME_STATUS } from '@/constants/runtime-safety'
import {
  formatRuntimeDateTime,
  getWorklineRiskLabel as worklineRiskLabel,
  getWorklineRiskTone as worklineRiskTone,
  readPositiveInt
} from '@/utils/runtime-display'

const route = useRoute()
const router = useRouter()
const store = useWorklineRuntimeStore()
const { hasPermission } = usePermission()
const canClearWorklineEstop = computed(() => hasPermission(BIZ_PERMISSIONS.workline.clearEstop))
const canViewRuntimeHold = computed(() => hasPermission(BIZ_PERMISSIONS.workline.viewRuntimeHold))

const {
  connectionLabel,
  connectionTone,
  lastEvent,
  lastRawEvent,
  lastRefreshedAt,
  live,
  markRefreshedAt,
  state,
  toggleLive
} = useRuntimePageChrome()

const now = useNow()
const isStale = computed(() => {
  if (!live.value || !lastRawEvent.value) return false
  const ts = (lastRawEvent.value.original as MessageEvent | undefined)?.timeStamp
  if (!ts) return false
  return now.value.getTime() - ts > 15_000
})

const selectedDeviceId = computed(() => readPositiveInt(route.query.deviceId))
const isDevicePanelOpen = ref(false)
const isTraceDrawerOpen = ref(false)
const clearingWorklineEstop = ref(false)
const recoveryPanelRef = ref<HTMLElement | null>(null)
const traceDrawerTitle = ref<string | null>(null)

const selectedWorklineId = computed(() => readPositiveInt(route.query.worklineId))

const currentWorklineSummary = computed(() => {
  const selectedId = selectedWorklineId.value
  if (!selectedId) return store.detail?.summary ?? null
  if (store.detail?.summary.id === selectedId) return store.detail.summary
  return store.findSummary(selectedId) ?? null
})

const isCurrentWorklineReconciling = computed(
  () => currentWorklineSummary.value?.runtime_status === RECONCILING_RUNTIME_STATUS
)

const selectedRecoveryActionLabel = computed(() =>
  hasRuntimeHoldProjection.value ? '打开 Runtime Hold 处置' : '打开急停恢复'
)

const currentWorklineSafetyEvidence = computed(() => {
  const summary = currentWorklineSummary.value
  if (!summary || store.detail?.summary.id !== summary.id) return undefined
  return getWorklineDeviceSafetyEvidence(store.detail.devices)
})

const currentWorklineSafetyVerdict = computed(() => {
  const summary = currentWorklineSummary.value
  if (!summary) {
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
  }

  // 基于 summary.active_safety_incident_id 构造 stub incident，
  // 使 isActiveIncident() 能够被正确评估（该函数仅读取 status 字段）。
  const stubIncident = summary.active_safety_incident_id
    ? ({ status: 'OPEN' } as unknown as RuntimeSafetyIncidentSummary)
    : null

  return getWorklineRuntimeVerdict(summary, stubIncident, currentWorklineSafetyEvidence.value)
})

const clearWorklineEstopDisabledReason = computed(() => {
  if (!canClearWorklineEstop.value) return '需要 biz:workline:clear-estop 权限'
  if (!currentWorklineSafetyVerdict.value.canAttemptClear) {
    return currentWorklineSafetyVerdict.value.blockedReason || '当前状态不能通过急停恢复入口处理'
  }
  return undefined
})

const {
  effectiveMode,
  sessionId: modeSessionId,
  traceId: modeTraceId,
  sandboxAllowed,
  switchToLive,
  switchToTrace,
  switchToSandbox,
  selectWorkline: selectWorklineRoute
} = useWorklineMode(route, router, currentWorklineSummary)

const selectedWorklineContextName = computed(() => currentWorklineSummary.value?.line_name ?? null)

const selectedWorklineContextMeta = computed(() => {
  const summary = currentWorklineSummary.value
  if (!summary) return ''
  return `${summary.line_code} · ${summary.zone_name || '未配置区域'} · 活跃 ${summary.active_session_count} · 失败 ${summary.failed_session_count}`
})

const traceDrawerHeaderTitle = computed(
  () => traceDrawerTitle.value || modeTraceId.value || 'Trace 详情'
)

const selectedDeviceDetail = computed(() => {
  const deviceId = selectedDeviceId.value
  if (!deviceId || !store.detail) return null
  return store.detail.devices.find(item => item.id === deviceId) ?? null
})

const currentRuntimeHoldIds = computed(() => {
  const ids = new Set<number>()
  for (const device of store.detail?.devices ?? []) {
    for (const holdId of device.active_runtime_hold_ids ?? []) ids.add(holdId)
  }
  return Array.from(ids)
})

const currentRuntimeOpenIssueCount = computed(() =>
  (store.detail?.devices ?? []).reduce((total, device) => total + (device.open_issue_count ?? 0), 0)
)

const currentRuntimeBlockedOutboxCount = computed(() =>
  (store.detail?.devices ?? []).reduce(
    (total, device) => total + (device.blocked_outbox_count ?? 0),
    0
  )
)

const hasRuntimeHoldProjection = computed(
  () =>
    currentRuntimeHoldIds.value.length > 0 ||
    currentRuntimeOpenIssueCount.value > 0 ||
    currentRuntimeBlockedOutboxCount.value > 0 ||
    isCurrentWorklineReconciling.value
)

function worklineLastActivityLabel(item: RuntimeWorklineSummary) {
  return item.last_activity_at ? formatRuntimeDateTime(item.last_activity_at) : '暂无活动'
}

function isWorklineReconciling(item: RuntimeWorklineSummary): boolean {
  return item.runtime_status === RECONCILING_RUNTIME_STATUS
}

function isWorklineEstopped(item: RuntimeWorklineSummary): boolean {
  return item.runtime_status === ESTOPPED_RUNTIME_STATUS || Boolean(item.active_safety_incident_id)
}

function worklineRecoveryLabel(item: RuntimeWorklineSummary): string | null {
  if (isWorklineReconciling(item)) return '对账恢复'
  if (isWorklineEstopped(item)) return '急停恢复'
  return null
}

function worklineRecoveryTone(item: RuntimeWorklineSummary): 'warning' | 'danger' {
  return isWorklineReconciling(item) ? 'warning' : 'danger'
}

function worklineRecoveryHint(item: RuntimeWorklineSummary): string | null {
  if (isWorklineReconciling(item)) return '解除隔离'
  if (isWorklineEstopped(item)) return '恢复接收'
  return null
}

function focusRecoveryPanel() {
  recoveryPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadDetailAndSync(worklineId: number) {
  await store.loadDetail(worklineId)
  if (selectedDeviceId.value) {
    isDevicePanelOpen.value = true
  }
  markRefreshedAt()
}

async function ensureWorklineRouteSelection(): Promise<boolean> {
  if (selectedWorklineId.value || !store.worklines[0]?.id) return false
  await router.replace({
    query: { ...route.query, ...buildRuntimeWorklineQuery(store.worklines[0].id) }
  })
  return true
}

async function syncWorklineDetailFromRoute(): Promise<void> {
  if (!selectedWorklineId.value) {
    store.clearDetail()
    return
  }
  if (store.detail?.summary.id === selectedWorklineId.value) return
  await loadDetailAndSync(selectedWorklineId.value)
}

async function loadWorklinesWithRoute() {
  await store.loadWorklines()
  const routeChanged = await ensureWorklineRouteSelection()
  if (!routeChanged) {
    await syncWorklineDetailFromRoute()
  }
  markRefreshedAt()
}

const refreshWorklines = createCoalescedAsyncTask(async () => {
  store.loading = true
  try {
    await loadWorklinesWithRoute()
  } finally {
    store.loading = false
  }
})

const syncWorklineDetailFromRouteCoalesced = createCoalescedAsyncTask(async () => {
  store.loading = true
  try {
    await syncWorklineDetailFromRoute()
  } finally {
    store.loading = false
  }
})

const refreshDetail = createCoalescedAsyncTask(async () => {
  if (!selectedWorklineId.value) return
  store.loading = true
  try {
    await loadDetailAndSync(selectedWorklineId.value)
  } finally {
    store.loading = false
  }
})

async function refreshAfterSafetySimulation() {
  await refreshAfterSandboxAction()
}

async function refreshAfterSandboxAction() {
  await refreshDetail()
  await refreshWorklines()
}

function resolveSelectedWorklineId(): number | null {
  return store.detail?.summary.id ?? selectedWorklineId.value ?? null
}

async function clearWorklineEstop() {
  if (clearingWorklineEstop.value) return
  if (!canClearWorklineEstop.value) {
    ElMessage.error('需要 biz:workline:clear-estop 权限')
    return
  }
  if (!currentWorklineSafetyVerdict.value.canAttemptClear) {
    ElMessage.error('当前状态不能通过急停恢复入口处理')
    return
  }
  const worklineId = resolveSelectedWorklineId()
  if (!worklineId) {
    ElMessage.error('缺少 WorkLine')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确认现场/沙箱设备已复位、安全区域已清空，并允许 WES 恢复接收新流程？',
      '恢复 WorkLine 接收',
      {
        confirmButtonText: '恢复接收',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  clearingWorklineEstop.value = true
  try {
    await runtimeApiMethods
      .clearEstop(worklineId, {
        reason: '人工确认 WorkLine 软件急停解除',
        // checks 是操作员的确认声明，后端须独立验证，不能信任前端传入值。
        checks: {
          estop_button_reset: true,
          area_safe: true,
          devices_reset: true,
          operator_confirmed: true
        }
      })
      .send()
    ElMessage.success('已恢复接收新流程')
    await refreshAfterSafetySimulation()
  } catch (error: unknown) {
    ElMessage.error(getErrorMessage(error, '恢复接收失败'))
  } finally {
    clearingWorklineEstop.value = false
  }
}

async function selectWorkline(row: { id: number }) {
  if (selectedWorklineId.value === row.id) return
  selectWorklineRoute(row.id)
}

function handleSelectSession(session: RuntimeTraceListItem) {
  traceDrawerTitle.value = session.trace_id ?? null
  switchToTrace(String(session.session_id), session.trace_id ?? undefined)
}

function handleTraceHeaderChange(title: string | null) {
  traceDrawerTitle.value = title
}

function closeTraceDrawer() {
  traceDrawerTitle.value = null
  switchToLive()
}

function openDevice(deviceId: number) {
  isDevicePanelOpen.value = true
  router.replace({
    query: {
      ...route.query,
      ...buildRuntimeWorklineQuery(store.detail?.summary.id, deviceId)
    }
  })
}

function closeDevicePanel() {
  isDevicePanelOpen.value = false
  const query = { ...route.query }
  delete query.deviceId
  router.replace({ query })
}

onMounted(() => {
  void refreshWorklines()
})

watch(
  () => selectedWorklineId.value,
  (nextWorklineId, previousWorklineId) => {
    if (!nextWorklineId || nextWorklineId === previousWorklineId) return
    void syncWorklineDetailFromRouteCoalesced()
  }
)

watch(
  () => selectedDeviceId.value,
  nextDeviceId => {
    if (nextDeviceId && store.detail) {
      isDevicePanelOpen.value = true
    } else if (!nextDeviceId) {
      isDevicePanelOpen.value = false
    }
  }
)

watch(
  () => effectiveMode.value,
  mode => {
    isTraceDrawerOpen.value = mode === 'trace'
  },
  { immediate: true }
)

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    if (
      !isRelevantRuntimeEvent(event, {
        worklineId: store.detail?.summary.id ?? selectedWorklineId.value
      })
    )
      return
    const refreshTargets = classifyRuntimeRefresh(event)
    if (refreshTargets.detail && selectedWorklineId.value) {
      await refreshDetail()
    }
    if (refreshTargets.worklines) {
      await refreshWorklines()
    }
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 860px;
}

.runtime-workline__stale-hint {
  margin-bottom: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--runtime-surface-accent);
  color: var(--runtime-tier-watch);
  font-size: 11px;
  font-weight: 600;
}

.runtime-page__recovery-action {
  border-color: rgb(245, 158, 11, 0.48);
  background: rgb(245, 158, 11, 0.1);
  color: #f59e0b;
  font-weight: 700;
}

.runtime-page__recovery-action:hover {
  border-color: rgb(245, 158, 11, 0.72);
  background: rgb(245, 158, 11, 0.16);
  color: #fbbf24;
}

.runtime-context-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.runtime-context-nav__back {
  padding: 6px 12px;
  border: 1px solid var(--runtime-border-accent);
  border-radius: 6px;
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.runtime-context-nav__back:hover {
  background: var(--runtime-surface-accent);
  border-color: var(--runtime-border-accent);
}

.runtime-context-nav__workline {
  color: var(--runtime-text-emphasis);
  font-size: 14px;
}

.runtime-context-nav__sep {
  color: var(--runtime-text-muted);
  font-size: 14px;
}

.runtime-context-nav__device {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.runtime-context-nav__meta {
  margin-left: 8px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono);
}

.runtime-mode-switcher {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--runtime-border);
  border-radius: 10px;
  background: var(--runtime-surface);
}

.runtime-mode-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.runtime-mode-tab:hover {
  color: var(--runtime-text-primary);
}

.runtime-mode-tab.is-active {
  background: var(--runtime-surface-accent-strong);
  color: var(--color-primary);
}

.runtime-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 340px minmax(0, 1fr);
  align-items: stretch;
}

.runtime-layout__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.runtime-recovery-anchor {
  scroll-margin-top: 18px;
}

.runtime-layout__hero {
  flex: 0 0 auto;
}

.runtime-device-drawer__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-device-drawer__title {
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.runtime-device-drawer__meta {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono);
}

.runtime-trace-drawer__header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

:deep(.runtime-trace-drawer__back) {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgb(6, 182, 212, 0.2);
  border-radius: 8px;
  background: transparent;
  color: rgb(6, 182, 212);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.runtime-trace-drawer__back:hover) {
  border-color: rgb(6, 182, 212, 0.4);
  background: rgb(6, 182, 212, 0.1);
}

.runtime-trace-drawer__title {
  min-width: 0;
  overflow: hidden;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-workline-placeholder {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.runtime-workline-context--compact {
  flex: 1 1 auto;
}

.runtime-layout__list-scroll {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  flex-direction: column;
}

.runtime-directory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-directory-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--runtime-border);
  border-radius: 14px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.runtime-directory-card:hover {
  transform: translateY(-1px);
  border-color: var(--runtime-border-accent);
}

.runtime-directory-card.is-active {
  border-color: var(--runtime-border-strong);
  background: var(--runtime-surface-accent);
}

.runtime-directory-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.runtime-directory-card__time {
  margin-left: auto;
}

.runtime-directory-card__time,
.runtime-directory-card__meta,
.runtime-directory-card__hint {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.runtime-directory-card__title {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.runtime-directory-card__meta {
  color: var(--runtime-text-emphasis);
}

.runtime-directory-card__run-mode {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--runtime-surface-accent-strong);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-right: 4px;
}

.runtime-directory-card__recovery-pill {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.4;
}

.runtime-directory-card__recovery-pill.is-warning {
  border: 1px solid rgb(245, 158, 11, 0.42);
  background: rgb(245, 158, 11, 0.12);
  color: #f59e0b;
}

.runtime-directory-card__recovery-pill.is-danger {
  border: 1px solid rgb(239, 68, 68, 0.42);
  background: rgb(239, 68, 68, 0.12);
  color: #ef4444;
}

.runtime-directory-card__recovery-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.28);
  border-radius: 8px;
  background: rgb(245, 158, 11, 0.08);
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.runtime-directory-card__recovery-row strong {
  color: #f59e0b;
  font-size: 12px;
}

.runtime-layout__empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

@media (width >= 1280px) and (height >= 900px) {
  .runtime-layout {
    height: calc(100vh - 210px);
    min-height: 620px;
    overflow: hidden;
  }

  .runtime-layout__list,
  .runtime-layout__detail {
    height: 100%;
    min-height: 0;
  }

  .runtime-layout__detail {
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .runtime-layout__list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .runtime-layout__list :deep(.el-card__header) {
    flex: 0 0 auto;
  }

  .runtime-layout__list :deep(.el-card__body) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .runtime-layout__list-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }
}

@media (width >= 1280px) and (height <= 899px) {
  .runtime-layout {
    align-items: start;
  }

  .runtime-layout__list-scroll {
    overflow: visible;
    padding-right: 0;
  }
}

@media (width <= 1279px) {
  .runtime-page__header,
  .runtime-layout {
    display: flex;
    flex-direction: column;
  }

  .runtime-page__status-bar {
    justify-content: flex-start;
  }

  .runtime-layout__list-scroll {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
