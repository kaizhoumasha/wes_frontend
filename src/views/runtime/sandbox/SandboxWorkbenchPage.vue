<template>
  <div
    v-loading="pageLoading"
    class="sandbox-wb"
  >
    <!-- Top Bar -->
    <header class="sandbox-wb__bar">
      <div class="sandbox-wb__bar-left">
        <button
          type="button"
          class="sandbox-wb__back"
          @click="goBack"
        >
          <svg viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" /></svg>
        </button>
        <div class="sandbox-wb__badge">
          <span class="sandbox-wb__badge-dot" />
          <span>SANDBOX</span>
        </div>
        <div class="sandbox-wb__bar-info">
          <span class="sandbox-wb__bar-title">{{ worklineName }}</span>
          <span class="sandbox-wb__bar-code">{{ worklineCode }}</span>
        </div>
      </div>
      <div class="sandbox-wb__bar-actions">
        <el-button
          type="primary"
          :disabled="!selectedDeviceId || safetyLocked"
          @click="eventPanelOpen = true"
        >
          <svg class="sandbox-wb__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
          发送 Event
        </el-button>
        <el-button
          type="danger"
          size="small"
          plain
          :loading="simulatingEstop"
          :disabled="safetyLocked"
          @click="simulateEstop"
        >
          模拟急停
        </el-button>
        <el-button
          v-if="safetyLocked"
          type="success"
          size="small"
          plain
          :loading="clearEstopLoading"
          :disabled="!canClearEstop"
          @click="requestClearEstop"
        >
          恢复接收
        </el-button>
        <el-button
          size="small"
          @click="refreshAll"
        >
          <svg class="sandbox-wb__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" /></svg>
          刷新
        </el-button>
      </div>
    </header>

    <!-- Safety Lock Banner -->
    <el-alert
      v-if="safetyLocked"
      type="error"
      :closable="false"
      show-icon
      class="sandbox-wb__safety"
    >
      <template #title>软件急停冻结</template>
      <template #default>{{ safetyBlockedReason }}</template>
    </el-alert>

    <!-- Three-Column Workbench -->
    <div class="sandbox-wb__body">
      <!-- Left: Device Topology -->
      <aside class="sandbox-wb__devices">
        <div class="sandbox-wb__panel-head">
          <span class="sandbox-wb__panel-title">设备拓扑</span>
          <span
            v-if="selectedDeviceId"
            class="sandbox-wb__selected-tag"
          >{{ selectedDeviceName }}</span>
        </div>
        <div class="sandbox-wb__topology-wrap">
          <WorklineRouteMap
            :devices="deviceListWithCounters"
            :selected-device-id="selectedDeviceId"
            :open-command-counts-by-device="openCommandCountsByDevice"
            @select="handleSelectDevice"
            @send-event="handleSendEventFromTopology"
            @view-outbox="handleViewOutboxFromTopology"
            @show-context-menu="handleShowContextMenu"
          />
        </div>
      </aside>

      <!-- Center: Action Workspace -->
      <main class="sandbox-wb__workspace">
        <SandboxCycleStatus
          :active-sessions="activeSessions"
          :pending-outboxes="actionablePendingItems"
        />

        <SandboxActionList
          :items="actionablePendingItems"
          :active-sessions="activeSessions"
          :completed-items="completedItems"
          :loading="actionLoadingForItem"
          :disabled="safetyLocked"
          :disabled-reason="safetyBlockedReason"
          :submitted-result-outbox-ids="submittedResultOutboxIds"
          :submitted-result-outbox-keys="submittedResultOutboxKeys"
          :submitted-result-reason="SUBMITTED_RESULT_REASON"
          @ack="handleActionAck"
          @result="handleActionResult"
        />
      </main>

      <!-- Right: Event Panel (slide-in) -->
      <aside
        class="sandbox-wb__event-panel"
        :class="{ 'is-open': eventPanelOpen }"
      >
        <div class="sandbox-wb__panel-head">
          <span class="sandbox-wb__panel-title">Event Composer</span>
          <button
            type="button"
            class="sandbox-wb__panel-close"
            @click="eventPanelOpen = false"
          >
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
        </div>
        <div class="sandbox-wb__event-panel-body">
          <SandboxEventComposer
            :workline-id="worklineId"
            :device-id="selectedDeviceId"
            :device-name="selectedDeviceInfo?.name"
            :device-code="selectedDeviceInfo?.code"
            :device-role="selectedDeviceInfo?.role"
            :device-status="selectedDeviceInfo?.status"
            :disabled="safetyLocked"
            :disabled-reason="safetyBlockedReason"
            @submitted="handleEventSubmitted"
          />
        </div>
      </aside>
    </div>

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="sandbox-wb__ctx-overlay"
        @click="contextMenu.visible = false"
      />
      <div
        v-if="contextMenu.visible"
        class="sandbox-wb__ctx"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <button
          type="button"
          class="sandbox-wb__ctx-item"
          :disabled="safetyLocked"
          @click="handleCtxAction('sendEvent')"
        >发送 Event</button>
        <button
          type="button"
          class="sandbox-wb__ctx-item"
          @click="handleCtxAction('viewOutbox')"
        >查看 Outbox</button>
      </div>
    </Teleport>

    <!-- Result Drawer -->
    <StandardDrawer
      v-model="resultDrawerVisible"
      title="命令操作"
      direction="rtl"
      size="lg"
    >
      <div v-if="selectedOutbox">
        <div class="sandbox-wb__result-detail">
          <div class="sandbox-wb__result-row">
            <span class="sandbox-wb__result-label">目标设备</span>
            <span class="sandbox-wb__result-value">{{ selectedOutbox.target_code }}</span>
          </div>
          <div class="sandbox-wb__result-row">
            <span class="sandbox-wb__result-label">命令</span>
            <span class="sandbox-wb__result-value mono">{{ selectedOutbox.dispatch_key }}</span>
          </div>
          <div class="sandbox-wb__result-row">
            <span class="sandbox-wb__result-label">状态</span>
            <span
              class="sandbox-wb__result-value"
              :class="`is-${(selectedOutbox.status || '').toLowerCase()}`"
            >{{ statusLabel(selectedOutbox.status) }}</span>
          </div>
        </div>

        <div class="sandbox-wb__result-actions">
          <el-button
            v-if="canAckSandboxOutbox(selectedOutbox)"
            type="success"
            :loading="actionLoading"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            @click="handleAck"
          >模拟 ACK</el-button>
          <el-button
            v-if="canSubmitSandboxResult(selectedOutbox)"
            type="primary"
            :loading="actionLoading"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            @click="showResultComposer = true"
          >模拟 Result</el-button>
        </div>

        <template v-if="showResultComposer">
          <el-divider />
          <SandboxResultComposer
            :outbox="selectedOutbox"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            :disabled-reason="selectedOutboxDisabledReason"
            @submitted="handleResultSubmitted"
          />
        </template>
      </div>
    </StandardDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SandboxCycleStatus from '@/components/runtime/sandbox/SandboxCycleStatus.vue'
import SandboxActionList from '@/components/runtime/sandbox/SandboxActionList.vue'
import SandboxEventComposer from '@/components/runtime/sandbox/SandboxEventComposer.vue'
import SandboxResultComposer from '@/components/runtime/sandbox/SandboxResultComposer.vue'
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimeSSE } from '@/composables/useRuntimeSSE'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { classifyRuntimeRefresh, isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { displayDevice } from '@/utils/runtime-display-identity'
import { getErrorMessage } from '@/utils/string'
import {
  canAckSandboxOutbox,
  canSubmitSandboxResult,
  isCurrentSandboxAction,
} from '@/utils/sandbox-outbox'
import { SAFETY_LOCKED_REASON } from '@/constants/runtime-safety'
import { getWorklineDeviceSafetyEvidence, getWorklineRuntimeVerdict } from '@/utils/runtime-safety'
import type {
  RuntimeSafetyIncidentSummary,
  RuntimeTraceListItem,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary,
  SandboxCompletedSession,
  SandboxPendingOutbox,
} from '@/types/runtime'

const route = useRoute()
const router = useRouter()
const store = useWorklineRuntimeStore()

const worklineId = computed(() => Number(route.params.worklineId))
const SUBMITTED_RESULT_REASON = '该 Result 已提交，正在等待后续编排。'

// Page loading
const pageLoading = ref(true)
const worklineName = computed(() => store.detail?.summary?.line_name ?? store.findSummary(worklineId.value)?.line_name ?? '')
const worklineCode = computed(() => store.detail?.summary?.line_code ?? store.findSummary(worklineId.value)?.line_code ?? '')

// Safety — derived from workline summary + detail
const clearEstopLoading = ref(false)
const worklineSummary = computed<RuntimeWorklineSummary | null>(
  () => store.findSummary(worklineId.value),
)
const safetyVerdict = computed(() => {
  const s = worklineSummary.value
  if (!s) return { safetyLocked: false, canAttemptClear: false, blockedReason: null }
  const stub = s.active_safety_incident_id ? ({ status: 'OPEN' } as unknown as RuntimeSafetyIncidentSummary) : null
  const evidence = store.detail?.summary.id === s.id ? getWorklineDeviceSafetyEvidence(store.detail.devices) : undefined
  return getWorklineRuntimeVerdict(s, stub, evidence)
})
const safetyLocked = computed(() => safetyVerdict.value.safetyLocked)
const canClearEstop = computed(() => safetyVerdict.value.canAttemptClear)
const safetyBlockedReason = computed(() => safetyVerdict.value.blockedReason || SAFETY_LOCKED_REASON)

// Device selection
const selectedDeviceId = ref<number | null>(null)
const deviceList = computed<RuntimeWorklineDeviceItem[]>(
  () => store.detail?.devices ?? [],
)
const selectedDeviceName = computed(() => {
  if (!selectedDeviceId.value) return ''
  const d = deviceList.value.find(d => d.id === selectedDeviceId.value)
  return d?.device_name || d?.device_code || ''
})
const selectedDeviceInfo = computed(() => {
  if (!selectedDeviceId.value) return null
  const d = deviceList.value.find(d => d.id === selectedDeviceId.value)
  if (!d) return null
  return {
    name: displayDevice({ device_name: d.device_name, device_code: d.device_code, device_id: d.id }),
    code: d.device_code || '-',
    role: d.device_role || '-',
    status: d.device_status || '',
  }
})

// Active sessions
const activeSessions = computed<RuntimeTraceListItem[]>(
  () => (store.detail?.active_sessions as RuntimeTraceListItem[] | undefined) ?? [],
)

// Context menu
const contextMenu = ref({ visible: false, x: 0, y: 0, deviceId: null as number | null })

function handleShowContextMenu(payload: { deviceId: number; x: number; y: number }) {
  contextMenu.value = { visible: true, x: payload.x, y: payload.y, deviceId: payload.deviceId }
}

function handleCtxAction(action: 'sendEvent' | 'viewOutbox') {
  const deviceId = contextMenu.value.deviceId
  contextMenu.value.visible = false
  if (!deviceId) return
  if (action === 'sendEvent') {
    if (safetyLocked.value) { ElMessage.warning(safetyBlockedReason.value); return }
    handleSendEventFromTopology(deviceId)
  } else {
    handleViewOutboxFromTopology(deviceId)
  }
}

function handleSelectDevice(deviceId: number) {
  selectedDeviceId.value = deviceId
}

function handleSendEventFromTopology(deviceId: number) {
  selectedDeviceId.value = deviceId
  eventPanelOpen.value = true
}

function handleViewOutboxFromTopology(deviceId: number) {
  selectedDeviceId.value = deviceId
  const device = deviceList.value.find(d => d.id === deviceId)
  if (!device) return
  const item = actionablePendingItems.value.find(i => i.target_code === device.device_code)
  if (item) openResultDrawer(item)
}

// Event panel
const eventPanelOpen = ref(false)

// SSE
const { lastEvent } = useRuntimeSSE(true)

watch(lastEvent, event => {
  if (!event) return
  if (!isRelevantRuntimeEvent(event, { worklineId: worklineId.value })) return
  if (!classifyRuntimeRefresh(event).sandbox) return
  void loadPending()
  void loadCompleted()
})

// Pending / completed
const pendingItems = ref<SandboxPendingOutbox[]>([])
const completedItems = ref<SandboxCompletedSession[]>([])
const submittedResultOutboxIds = ref<Set<number>>(new Set())
const submittedResultOutboxKeys = ref<Set<string>>(new Set())

let refreshTimers: ReturnType<typeof setTimeout>[] = []

const openCommandCountsByDevice = computed(() => {
  const counts: Record<number, number> = {}
  for (const item of actionablePendingItems.value) {
    if (item.status === 'FAILED' || item.status === 'CANCELLED' || item.status === 'BLOCKED_RESOURCE') continue
    if (!isCurrentSandboxAction(item)) continue
    const device = deviceList.value.find(d => d.device_code === item.target_code)
    if (device) counts[device.id] = (counts[device.id] || 0) + 1
  }
  return counts
})

const blockedOutboxCountsByDevice = computed(() => {
  const counts: Record<number, number> = {}
  for (const item of actionablePendingItems.value) {
    if (item.status !== 'BLOCKED_RESOURCE') continue
    const device = deviceList.value.find(d => d.device_code === item.target_code)
    if (device) counts[device.id] = (counts[device.id] || 0) + 1
  }
  return counts
})

const deviceListWithCounters = computed(() =>
  deviceList.value.map(device => ({
    ...device,
    open_command_count: openCommandCountsByDevice.value[device.id] ?? 0,
    blocked_outbox_count: blockedOutboxCountsByDevice.value[device.id] ?? 0,
  })),
)

const completedItemIndex = computed(() => {
  const outboxIds = new Set<number>()
  const outboxKeys = new Set<string>()
  const sessionIds = new Set<number>()
  for (const sessionGroup of completedItems.value) {
    sessionIds.add(sessionGroup.session.id)
    for (const item of sessionGroup.outbox_items) {
      outboxIds.add(item.id)
      if (item.dispatch_key) outboxKeys.add(item.dispatch_key)
    }
  }
  return { outboxIds, outboxKeys, sessionIds }
})

const actionablePendingItems = computed(() =>
  pendingItems.value.filter(item => !isOutboxCompleted(item)),
)

// Outbox selection
const selectedOutbox = ref<SandboxPendingOutbox | null>(null)
const resultDrawerVisible = ref(false)
const showResultComposer = ref(false)
const actionLoading = ref(false)
const actionLoadingForItem = ref<number | null>(null)
const simulatingEstop = ref(false)

const selectedOutboxCompleted = computed(() => isOutboxCompleted(selectedOutbox.value))
const selectedOutboxResultSubmitted = computed(() => isResultSubmitted(selectedOutbox.value))
const selectedOutboxDisabledReason = computed(() => {
  if (selectedOutboxResultSubmitted.value) return SUBMITTED_RESULT_REASON
  if (selectedOutboxCompleted.value) return '该 Result 已完成，不能重复操作。'
  return safetyBlockedReason.value
})

function isOutboxCompleted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  const idx = completedItemIndex.value
  if (idx.outboxIds.has(outbox.id)) return true
  if (outbox.dispatch_key && idx.outboxKeys.has(outbox.dispatch_key)) return true
  return Boolean(outbox.session_id && idx.sessionIds.has(outbox.session_id))
}

function isResultSubmitted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (submittedResultOutboxIds.value.has(outbox.id)) return true
  return Boolean(outbox.dispatch_key && submittedResultOutboxKeys.value.has(outbox.dispatch_key))
}

function ensureOutboxActionable(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (!isCurrentSandboxAction(outbox)) { ElMessage.warning('这是历史步骤，当前不可操作。'); return false }
  if (!isOutboxCompleted(outbox)) return true
  ElMessage.warning('该 Result 已完成，不能重复操作。')
  return false
}

function ensureResultNotSubmitted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (!isResultSubmitted(outbox)) return true
  ElMessage.warning(SUBMITTED_RESULT_REASON)
  return false
}

// API
async function loadPending() {
  try {
    const items = await runtimeApiMethods.sandboxPending(50, worklineId.value).send()
    pendingItems.value = (items || []).sort((a, b) => b.id - a.id)
  } catch { /* SSE will retry */ }
}

async function loadCompleted() {
  try {
    const items = await runtimeApiMethods.sandboxCompleted(50, worklineId.value).send()
    completedItems.value = items || []
  } catch { /* silent */ }
}

async function loadPage() {
  pageLoading.value = true
  try {
    await Promise.all([
      store.loadWorklines(),
      store.loadDetail(worklineId.value),
    ])
    await Promise.all([loadPending(), loadCompleted()])
  } finally {
    pageLoading.value = false
  }
}

function refreshAll() {
  queueSandboxRefresh()
}

function queueSandboxRefresh() {
  clearRefreshTimers()
  void loadPending()
  void loadCompleted()
  void store.loadDetail(worklineId.value)
  for (const delay of [800, 2000, 5000, 10000, 15000]) {
    refreshTimers.push(setTimeout(() => {
      void loadPending()
      void loadCompleted()
      void store.loadDetail(worklineId.value)
    }, delay))
  }
}

function clearRefreshTimers() {
  for (const timer of refreshTimers) clearTimeout(timer)
  refreshTimers = []
}

async function simulateEstop() {
  if (safetyLocked.value) { ElMessage.warning(safetyBlockedReason.value); return }
  simulatingEstop.value = true
  try {
    await runtimeApiMethods.sandboxSimulateEstop(worklineId.value, {
      reason: 'Sandbox 模拟软件急停冻结',
      source_device_id: selectedDeviceId.value,
      payload: { trigger: 'sandbox_button' },
    }).send()
    ElMessage.success('已模拟软件急停冻结')
    await loadPage()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '模拟急停失败'))
  } finally {
    simulatingEstop.value = false
  }
}

function requestClearEstop() {
  if (!canClearEstop.value) { ElMessage.error('当前状态不能恢复'); return }
  clearEstopLoading.value = true
  store.loadDetail(worklineId.value).finally(() => { clearEstopLoading.value = false })
}

function handleEventSubmitted() {
  eventPanelOpen.value = false
  queueSandboxRefresh()
}

function openResultDrawer(outbox: SandboxPendingOutbox) {
  selectedOutbox.value = outbox
  showResultComposer.value = false
  resultDrawerVisible.value = true
}

async function handleAck() {
  if (safetyLocked.value) return
  if (!ensureOutboxActionable(selectedOutbox.value)) return
  if (!selectedOutbox.value?.dispatch_key) { ElMessage.error('缺少 dispatch_key'); return }
  actionLoading.value = true
  try {
    await runtimeApiMethods.sandboxAck({ dispatch_key: selectedOutbox.value.dispatch_key }).send()
    ElMessage.success('ACK 成功')
    resultDrawerVisible.value = false
    void loadPending()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, 'ACK 失败'))
  } finally {
    actionLoading.value = false
  }
}

async function handleActionAck(item: SandboxPendingOutbox) {
  if (safetyLocked.value) return
  if (!ensureOutboxActionable(item)) return
  if (!item.dispatch_key) { ElMessage.error('缺少 dispatch_key'); return }
  actionLoadingForItem.value = item.id
  try {
    await runtimeApiMethods.sandboxAck({ dispatch_key: item.dispatch_key }).send()
    ElMessage.success('ACK 成功')
    void loadPending()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, 'ACK 失败'))
  } finally {
    actionLoadingForItem.value = null
  }
}

function handleActionResult(item: SandboxPendingOutbox) {
  if (safetyLocked.value) return
  if (!ensureOutboxActionable(item)) return
  if (!ensureResultNotSubmitted(item)) return
  selectedOutbox.value = item
  showResultComposer.value = true
  resultDrawerVisible.value = true
}

function handleResultSubmitted(outbox: SandboxPendingOutbox) {
  const submitted = outbox ?? selectedOutbox.value
  if (submitted) {
    submittedResultOutboxIds.value = new Set([...submittedResultOutboxIds.value, submitted.id])
  }
  if (submitted?.dispatch_key) {
    submittedResultOutboxKeys.value = new Set([...submittedResultOutboxKeys.value, submitted.dispatch_key])
  }
  showResultComposer.value = false
  resultDrawerVisible.value = false
  selectedOutbox.value = null
  queueSandboxRefresh()
}

function statusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    NEW: '待发送', DISPATCHING: '派发中', SENT: '已发送', ACKED: '已确认',
    BLOCKED_RESOURCE: '等待设备空闲', FAILED: '失败', CANCELLED: '已取消',
  }
  return map[status || ''] || status || ''
}

function goBack() {
  router.push({ name: 'RuntimeSandbox' })
}

onMounted(() => void loadPage())

onUnmounted(() => {
  clearRefreshTimers()
  store.clearDetail()
})

watch(worklineId, () => {
  selectedDeviceId.value = null
  eventPanelOpen.value = false
  resultDrawerVisible.value = false
  selectedOutbox.value = null
  void loadPage()
})
</script>

<style scoped>
/* ===== Page Shell ===== */
.sandbox-wb {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* ===== Top Bar ===== */
.sandbox-wb__bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  background: var(--runtime-surface);
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
}

.sandbox-wb__bar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sandbox-wb__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--runtime-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.sandbox-wb__back:hover {
  background: rgb(245, 158, 11, 0.12);
  color: #f59e0b;
}

.sandbox-wb__back svg {
  width: 18px;
  height: 18px;
}

.sandbox-wb__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.15);
  border: 1px solid rgb(245, 158, 11, 0.3);
  color: #f59e0b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sandbox-wb__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  animation: sandbox-pulse 2s ease-in-out infinite;
}

@keyframes sandbox-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.sandbox-wb__bar-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sandbox-wb__bar-title {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.sandbox-wb__bar-code {
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-family: var(--font-mono);
}

.sandbox-wb__bar-actions {
  display: flex;
  gap: 8px;
}

.sandbox-wb__icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.sandbox-wb__safety {
  flex-shrink: 0;
  border-color: rgb(239, 68, 68, 0.4);
}

/* ===== Three-Column Body ===== */
.sandbox-wb__body {
  display: grid;
  grid-template-columns: 260px 1fr 0;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  transition: grid-template-columns 0.25s ease;
}

.sandbox-wb__body > .sandbox-wb__event-panel.is-open {
  /* When panel is open, expand right column */
}

.sandbox-wb__body:has(.sandbox-wb__event-panel.is-open) {
  grid-template-columns: 260px 1fr 380px;
}

/* ===== Left Panel: Devices ===== */
.sandbox-wb__devices {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding: 16px;
  background: var(--runtime-surface);
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
}

.sandbox-wb__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sandbox-wb__panel-title {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sandbox-wb__selected-tag {
  padding: 2px 8px;
  border-radius: 10px;
  background: rgb(245, 158, 11, 0.15);
  color: #f59e0b;
  font-size: 11px;
  font-weight: 600;
}

.sandbox-wb__topology-wrap {
  border-radius: 8px;
  overflow: hidden;
}

.sandbox-wb__topology-wrap :deep(.workline-route-map) {
  flex-direction: column;
  min-height: 0;
  gap: 6px;
}

.sandbox-wb__topology-wrap :deep(.workline-route-map__node) {
  min-width: 0;
  min-height: 0;
  padding: 10px 12px;
  border-radius: 10px;
}

.sandbox-wb__topology-wrap :deep(.workline-route-map__edge) {
  display: none;
}

/* ===== Center: Workspace ===== */
.sandbox-wb__workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  min-height: 0;
  padding: 16px;
  background: var(--runtime-surface);
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
}

/* ===== Right: Event Panel (slide-in) ===== */
.sandbox-wb__event-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--runtime-surface);
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sandbox-wb__event-panel.is-open {
  opacity: 1;
}

.sandbox-wb__event-panel .sandbox-wb__panel-head {
  flex-shrink: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--runtime-border-neutral);
}

.sandbox-wb__panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.sandbox-wb__panel-close:hover {
  background: rgb(239, 68, 68, 0.12);
  color: #ef4444;
}

.sandbox-wb__panel-close svg {
  width: 16px;
  height: 16px;
}

.sandbox-wb__event-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* ===== Result Drawer ===== */
.sandbox-wb__result-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
  margin-bottom: 16px;
}

.sandbox-wb__result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sandbox-wb__result-label {
  color: var(--runtime-text-secondary);
  font-size: 13px;
}

.sandbox-wb__result-value {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 500;
}

.sandbox-wb__result-value.mono { font-family: var(--font-mono); }
.sandbox-wb__result-value.is-sent { color: #f59e0b; }
.sandbox-wb__result-value.is-acked { color: #06b6d4; }
.sandbox-wb__result-value.is-failed { color: #ef4444; }

.sandbox-wb__result-actions {
  display: flex;
  gap: 8px;
}

/* ===== Context Menu ===== */
.sandbox-wb__ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.sandbox-wb__ctx {
  position: fixed;
  z-index: 1000;
  min-width: 150px;
  padding: 4px;
  border-radius: 10px;
  background: var(--runtime-surface-strong);
  border: 1px solid var(--runtime-border-neutral);
  box-shadow: 0 8px 32px rgb(0, 0, 0, 0.4);
}

.sandbox-wb__ctx-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-primary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.sandbox-wb__ctx-item:hover { background: rgb(6, 182, 212, 0.15); }
.sandbox-wb__ctx-item:disabled {
  color: var(--runtime-text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

/* ===== Reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  .sandbox-wb__badge-dot { animation: none; }
  .sandbox-wb__body { transition: none; }
  .sandbox-wb__event-panel { transition: none; }
}
</style>
