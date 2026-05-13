<template>
  <div class="sandbox-workbench">
    <!-- Header -->
    <div class="sandbox-workbench__header">
      <div class="sandbox-workbench__header-left">
        <div class="sandbox-workbench__badge">
          <span class="sandbox-workbench__badge-dot" />
          <span class="sandbox-workbench__badge-text">SANDBOX</span>
        </div>
        <span class="sandbox-workbench__title">沙箱调试</span>
        <span class="sandbox-workbench__hint">模拟设备行为进行调试</span>
      </div>
      <div class="sandbox-workbench__header-actions">
        <el-button
          type="primary"
          :disabled="!selectedDeviceId || safetyLocked"
          :title="safetyLocked ? safetyBlockedReason : undefined"
          @click="eventDrawerVisible = true"
        >
          <svg
            class="sandbox-workbench__btn-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clip-rule="evenodd"
            />
          </svg>
          发送 Event
        </el-button>
        <el-button
          type="danger"
          size="small"
          plain
          :loading="simulatingEstop"
          :disabled="safetyLocked"
          :title="safetyLocked ? safetyBlockedReason : '模拟 WorkLine 软件急停冻结'"
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
          :disabled="!canClearEstop || clearEstopLoading"
          :title="clearEstopDisabledReason"
          @click="requestClearEstop"
        >
          恢复接收
        </el-button>
        <el-button
          size="small"
          @click="refresh"
        >
          <svg
            class="sandbox-workbench__btn-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
              clip-rule="evenodd"
            />
          </svg>
          刷新
        </el-button>
      </div>
    </div>

    <!-- Cycle Status Bar -->
    <SandboxCycleStatus
      :active-sessions="activeSessions"
      :pending-outboxes="actionablePendingItems"
    />

    <el-alert
      v-if="safetyLocked"
      type="error"
      :closable="false"
      show-icon
      class="sandbox-workbench__safety-lock"
    >
      <template #title>软件急停冻结</template>
      <template #default>{{ safetyBlockedReason }}</template>
    </el-alert>

    <!-- Stacked Layout -->
    <div class="sandbox-workbench__main">
      <!-- Top: Device Topology (Compact Horizontal) -->
      <section class="sandbox-workbench__topology-panel">
        <div class="sandbox-workbench__topology-header">
          <div>
            <div class="sandbox-workbench__topology-title">拓扑主视图</div>
            <div class="sandbox-workbench__topology-subtitle">点击设备节点选择 Event 来源</div>
          </div>
          <span
            v-if="selectedDeviceId"
            class="sandbox-workbench__topology-badge"
          >
            {{ selectedDeviceName }}
          </span>
        </div>
        <WorklineRouteMap
          :devices="deviceListWithSandboxCounters"
          :selected-device-id="selectedDeviceId"
          :open-command-counts-by-device="openCommandCountsByDevice"
          @select="handleSelectDevice"
          @send-event="handleSendEventFromTopology"
          @view-outbox="handleViewOutboxFromTopology"
          @show-context-menu="handleShowContextMenu"
        />
      </section>

      <!-- Context Menu -->
      <Teleport to="body">
        <div
          v-if="contextMenu.visible"
          class="sandbox-workbench__context-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          @click.stop
        >
          <button
            type="button"
            class="sandbox-workbench__context-menu-item"
            :disabled="safetyLocked"
            @click="handleContextMenuAction('sendEvent')"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              class="sandbox-workbench__context-menu-icon"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clip-rule="evenodd"
              />
            </svg>
            发送 Event
          </button>
          <button
            type="button"
            class="sandbox-workbench__context-menu-item"
            @click="handleContextMenuAction('viewOutbox')"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              class="sandbox-workbench__context-menu-icon"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
            查看 Outbox
          </button>
        </div>
      </Teleport>

      <!-- Click outside to close context menu -->
      <div
        v-if="contextMenu.visible"
        class="sandbox-workbench__context-menu-overlay"
        @click="handleClickOutside"
      />

      <!-- Bottom: Action List -->
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
    </div>

    <!-- Event Drawer -->
    <StandardDrawer
      v-model="eventDrawerVisible"
      title="发送 Event"
      direction="rtl"
      size="md"
      custom-class="sandbox-event-drawer"
    >
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
    </StandardDrawer>

    <!-- Result Drawer -->
    <StandardDrawer
      v-model="resultDrawerVisible"
      title="命令操作"
      direction="rtl"
      size="lg"
      custom-class="sandbox-result-drawer"
    >
      <div v-if="selectedOutbox">
        <!-- Outbox Detail -->
        <div class="sandbox-workbench__drawer-detail">
          <div class="sandbox-workbench__drawer-row">
            <span class="sandbox-workbench__drawer-label">目标设备</span>
            <span class="sandbox-workbench__drawer-value">
              {{ selectedOutbox.target_code }}
            </span>
          </div>
          <div class="sandbox-workbench__drawer-row">
            <span class="sandbox-workbench__drawer-label">命令</span>
            <span class="sandbox-workbench__drawer-value mono">
              {{
                displayCommand({ command_code: null, dispatch_key: selectedOutbox.dispatch_key })
              }}
            </span>
          </div>
          <div class="sandbox-workbench__drawer-row">
            <span class="sandbox-workbench__drawer-label">状态</span>
            <span
              class="sandbox-workbench__drawer-value"
              :class="`is-${selectedOutbox.status?.toLowerCase()}`"
            >
              {{ statusLabel(selectedOutbox.status) }}
            </span>
          </div>
        </div>

        <!-- Actions based on status -->
        <div class="sandbox-workbench__drawer-actions">
          <el-button
            v-if="canAckSandboxOutbox(selectedOutbox)"
            type="success"
            :loading="actionLoading"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            @click="handleAck"
          >
            <svg
              class="sandbox-workbench__btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
            模拟 ACK
          </el-button>

          <!-- ACKED: Result -->
          <el-button
            v-if="canSubmitSandboxResult(selectedOutbox)"
            type="primary"
            :loading="actionLoading"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            @click="openResultComposer"
          >
            模拟 Result
          </el-button>
        </div>

        <!-- Result Composer (shown after ACKED) -->
        <div v-if="showResultComposer">
          <el-divider />
          <SandboxResultComposer
            :outbox="selectedOutbox"
            :disabled="safetyLocked || selectedOutboxCompleted || selectedOutboxResultSubmitted"
            :disabled-reason="selectedOutboxDisabledReason"
            @submitted="handleResultSubmitted"
          />
        </div>
      </div>
    </StandardDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SandboxEventComposer from '@/components/runtime/sandbox/SandboxEventComposer.vue'
import SandboxResultComposer from '@/components/runtime/sandbox/SandboxResultComposer.vue'
import SandboxCycleStatus from '@/components/runtime/sandbox/SandboxCycleStatus.vue'
import SandboxActionList from '@/components/runtime/sandbox/SandboxActionList.vue'
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimeSSE } from '@/composables/useRuntimeSSE'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { classifyRuntimeRefresh, isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { displayCommand, displayDevice } from '@/utils/runtime-display-identity'
import { getErrorMessage } from '@/utils/string'
import {
  canAckSandboxOutbox,
  canSubmitSandboxResult,
  isCurrentSandboxAction
} from '@/utils/sandbox-outbox'
import { SAFETY_LOCKED_REASON } from '@/constants/runtime-safety'
import type {
  RuntimeTraceListItem,
  RuntimeWorklineDeviceItem,
  SandboxCompletedSession,
  SandboxPendingOutbox
} from '@/types/runtime'

const props = defineProps<{
  worklineId: number
  devices?: RuntimeWorklineDeviceItem[]
  deviceId?: number | null
  runMode?: string | null
  safetyLocked?: boolean
  safetyLockReason?: string | null
  canClearEstop?: boolean
  clearEstopDisabledReason?: string | null
  clearEstopLoading?: boolean
}>()

const store = useWorklineRuntimeStore()
const SUBMITTED_RESULT_REASON = '该 Result 已提交，正在等待后续编排。'
const safetyLocked = computed(() => props.safetyLocked ?? false)
const canClearEstop = computed(() => props.canClearEstop ?? false)
const clearEstopLoading = computed(() => props.clearEstopLoading ?? false)
const safetyBlockedReason = computed(() => props.safetyLockReason || SAFETY_LOCKED_REASON)
const clearEstopDisabledReason = computed(() => {
  if (canClearEstop.value) return undefined
  return props.clearEstopDisabledReason || '需要 biz:workline:clear-estop 权限'
})

// 活跃会话：来自 store 的 detail
const activeSessions = computed<RuntimeTraceListItem[]>(
  () => (store.detail?.active_sessions as RuntimeTraceListItem[] | undefined) ?? []
)

const deviceList = computed(() =>
  props.devices?.length ? props.devices : (store.detail?.devices ?? [])
)
const deviceListWithSandboxCounters = computed(() =>
  deviceList.value.map(device => ({
    ...device,
    open_command_count: openCommandCountsByDevice.value[device.id] ?? 0,
    blocked_outbox_count: blockedOutboxCountsByDevice.value[device.id] ?? 0
  }))
)
const selectedDeviceId = ref<number | null>(props.deviceId ?? null)

const selectedDeviceName = computed(() => {
  if (!selectedDeviceId.value) return ''
  const device = deviceList.value.find(d => d.id === selectedDeviceId.value)
  return device?.device_name || device?.device_code || ''
})

// 选中设备的详细信息
const selectedDeviceInfo = computed(() => {
  if (!selectedDeviceId.value) return null
  const device = deviceList.value.find(d => d.id === selectedDeviceId.value)
  if (!device) return null
  return {
    name: displayDevice({
      device_name: device.device_name,
      device_code: device.device_code,
      device_id: device.id
    }),
    code: device.device_code || '-',
    role: device.device_role || '-',
    status: device.device_status || ''
  }
})

// Context menu
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  deviceId: null as number | null
})

function handleShowContextMenu(payload: { deviceId: number; x: number; y: number }) {
  contextMenu.value = {
    visible: true,
    x: payload.x,
    y: payload.y,
    deviceId: payload.deviceId
  }
}

function handleContextMenuAction(action: 'sendEvent' | 'viewOutbox') {
  const deviceId = contextMenu.value.deviceId
  if (!deviceId) return
  contextMenu.value.visible = false

  if (action === 'sendEvent') {
    if (isSafetyLocked()) return
    handleSendEventFromTopology(deviceId)
  } else {
    handleViewOutboxFromTopology(deviceId)
  }
}

// Close context menu on click outside
function handleClickOutside() {
  contextMenu.value.visible = false
}

function handleSelectDevice(deviceId: number) {
  selectedDeviceId.value = deviceId
}

function handleSendEventFromTopology(deviceId: number) {
  if (isSafetyLocked()) return
  selectedDeviceId.value = deviceId
  eventDrawerVisible.value = true
}

function handleViewOutboxFromTopology(deviceId: number) {
  selectedDeviceId.value = deviceId
  const device = deviceList.value.find(d => d.id === deviceId)
  if (!device) return

  const deviceOutbox = actionablePendingItems.value.find(
    item => item.target_code === device.device_code
  )
  if (deviceOutbox) handleSelectOutbox(deviceOutbox)
}

const emit = defineEmits<{
  refresh: []
  safetySimulated: []
  clearEstop: []
}>()

// SSE
const { lastEvent } = useRuntimeSSE(true)

watch(lastEvent, event => {
  if (!event) return
  if (!isRelevantRuntimeEvent(event, { worklineId: props.worklineId })) return
  if (!classifyRuntimeRefresh(event).sandbox) return
  void loadPending()
  void loadCompleted()
})

// State
const pendingItems = ref<SandboxPendingOutbox[]>([])
const completedItems = ref<SandboxCompletedSession[]>([])
const submittedResultOutboxIds = ref<Set<number>>(new Set())
const submittedResultOutboxKeys = ref<Set<string>>(new Set())
const simulatingEstop = ref(false)
const actionLoading = ref(false)
const selectedOutbox = ref<SandboxPendingOutbox | null>(null)
const eventDrawerVisible = ref(false)
const resultDrawerVisible = ref(false)
const showResultComposer = ref(false)

let sandboxRefreshTimers: ReturnType<typeof setTimeout>[] = []

const openCommandCountsByDevice = computed(() => {
  const counts: Record<number, number> = {}
  for (const item of actionablePendingItems.value) {
    if (item.status === 'FAILED' || item.status === 'CANCELLED') continue
    if (item.status === 'BLOCKED_RESOURCE') continue
    if (!isCurrentSandboxAction(item)) continue
    const device = deviceList.value.find(d => d.device_code === item.target_code)
    if (device) {
      counts[device.id] = (counts[device.id] || 0) + 1
    }
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
  pendingItems.value.filter(item => !isOutboxCompleted(item))
)

const selectedOutboxCompleted = computed(() => isOutboxCompleted(selectedOutbox.value))

const selectedOutboxResultSubmitted = computed(() => isResultSubmitted(selectedOutbox.value))

const selectedOutboxDisabledReason = computed(resolveSelectedOutboxDisabledReason)

function resolveSelectedOutboxDisabledReason(): string {
  if (selectedOutboxResultSubmitted.value) {
    return SUBMITTED_RESULT_REASON
  }
  if (selectedOutboxCompleted.value) {
    return '该 Result 已完成，不能重复操作。'
  }
  return safetyBlockedReason.value
}

function isSafetyLocked(): boolean {
  if (!safetyLocked.value) return false
  ElMessage.warning(safetyBlockedReason.value)
  return true
}

function isOutboxCompleted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  const index = completedItemIndex.value
  if (index.outboxIds.has(outbox.id)) return true
  if (outbox.dispatch_key && index.outboxKeys.has(outbox.dispatch_key)) return true
  return Boolean(outbox.session_id && index.sessionIds.has(outbox.session_id))
}

function ensureOutboxActionable(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (!isCurrentSandboxAction(outbox)) {
    ElMessage.warning('这是历史步骤，当前不可操作。')
    return false
  }
  if (!isOutboxCompleted(outbox)) return true
  ElMessage.warning('该 Result 已完成，不能重复操作。')
  if (selectedOutbox.value?.id === outbox.id) {
    resultDrawerVisible.value = false
    showResultComposer.value = false
    selectedOutbox.value = null
  }
  return false
}

function isResultSubmitted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (submittedResultOutboxIds.value.has(outbox.id)) return true
  return Boolean(outbox.dispatch_key && submittedResultOutboxKeys.value.has(outbox.dispatch_key))
}

function ensureResultNotSubmitted(outbox: SandboxPendingOutbox | null | undefined): boolean {
  if (!outbox) return false
  if (!isResultSubmitted(outbox)) return true
  ElMessage.warning(SUBMITTED_RESULT_REASON)
  return false
}

// Methods
async function loadPending() {
  try {
    const items = await runtimeApiMethods.sandboxPending(50, props.worklineId).send()
    pendingItems.value = (items || []).sort((a, b) => b.id - a.id)
  } catch {
    // silent — SSE will trigger retry
  }
}

async function loadCompleted() {
  try {
    const items = await runtimeApiMethods.sandboxCompleted(50, props.worklineId).send()
    completedItems.value = items || []
  } catch {
    // silent
  }
}

function refresh() {
  refreshSandboxState()
}

function refreshSandboxState() {
  void loadPending()
  void loadCompleted()
  emit('refresh')
}

function queueSandboxRefresh() {
  clearSandboxRefreshTimers()
  refreshSandboxState()
  for (const delay of [800, 2000, 5000, 10000, 15000]) {
    sandboxRefreshTimers.push(setTimeout(refreshSandboxState, delay))
  }
}

function clearSandboxRefreshTimers() {
  for (const timer of sandboxRefreshTimers) {
    clearTimeout(timer)
  }
  sandboxRefreshTimers = []
}

async function simulateEstop() {
  if (isSafetyLocked()) return
  simulatingEstop.value = true
  try {
    await runtimeApiMethods
      .sandboxSimulateEstop(props.worklineId, {
        reason: 'Sandbox 模拟软件急停冻结',
        source_device_id: selectedDeviceId.value,
        payload: {
          trigger: 'sandbox_button'
        }
      })
      .send()
    ElMessage.success('已模拟软件急停冻结')
    emit('safetySimulated')
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '模拟急停失败'))
  } finally {
    simulatingEstop.value = false
  }
}

function requestClearEstop() {
  if (clearEstopLoading.value) return
  if (!canClearEstop.value) {
    ElMessage.error(clearEstopDisabledReason.value ?? '当前状态不能通过急停恢复入口处理')
    return
  }
  emit('clearEstop')
}

function handleSelectOutbox(outbox: SandboxPendingOutbox) {
  selectedOutbox.value = outbox
  showResultComposer.value = false
  resultDrawerVisible.value = true
}

function handleEventSubmitted() {
  eventDrawerVisible.value = false
  queueSandboxRefresh()
}

function openResultComposer() {
  if (isSafetyLocked()) return
  if (!ensureOutboxActionable(selectedOutbox.value)) return
  if (!ensureResultNotSubmitted(selectedOutbox.value)) return
  showResultComposer.value = true
}

function handleResultSubmitted(outbox: SandboxPendingOutbox) {
  const submittedOutbox = outbox ?? selectedOutbox.value
  if (submittedOutbox) {
    submittedResultOutboxIds.value = new Set([
      ...submittedResultOutboxIds.value,
      submittedOutbox.id
    ])
  }
  if (submittedOutbox?.dispatch_key) {
    submittedResultOutboxKeys.value = new Set([
      ...submittedResultOutboxKeys.value,
      submittedOutbox.dispatch_key
    ])
  }
  showResultComposer.value = false
  resultDrawerVisible.value = false
  selectedOutbox.value = null
  queueSandboxRefresh()
}

async function handleAck() {
  if (isSafetyLocked()) return
  if (!ensureOutboxActionable(selectedOutbox.value)) return
  if (!selectedOutbox.value?.dispatch_key) {
    ElMessage.error('缺少 dispatch_key')
    return
  }
  actionLoading.value = true
  try {
    await runtimeApiMethods
      .sandboxAck({
        dispatch_key: selectedOutbox.value.dispatch_key
      })
      .send()
    ElMessage.success('ACK 成功')
    resultDrawerVisible.value = false
    void loadPending()
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, 'ACK 失败'))
  } finally {
    actionLoading.value = false
  }
}

// SandboxActionList handlers
const actionLoadingForItem = ref<number | null>(null)

async function handleActionAck(item: SandboxPendingOutbox) {
  if (isSafetyLocked()) return
  if (!ensureOutboxActionable(item)) return
  if (!item.dispatch_key) {
    ElMessage.error('缺少 dispatch_key')
    return
  }
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
  if (isSafetyLocked()) return
  if (!ensureOutboxActionable(item)) return
  if (!ensureResultNotSubmitted(item)) return
  selectedOutbox.value = item
  showResultComposer.value = true
  resultDrawerVisible.value = true
}

function statusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    NEW: '待发送',
    DISPATCHING: '派发中',
    SENT: '已发送',
    ACKED: '已确认',
    BLOCKED_RESOURCE: '等待设备空闲',
    FAILED: '失败',
    CANCELLED: '已取消'
  }
  return map[status || ''] || status || ''
}

onMounted(() => {
  void loadPending()
  void loadCompleted()
})

onUnmounted(() => {
  clearSandboxRefreshTimers()
})

watch(
  () => [props.worklineId, selectedDeviceId.value],
  () => {
    void loadPending()
    void loadCompleted()
    resultDrawerVisible.value = false
    selectedOutbox.value = null
  }
)
</script>

<style scoped>
/* ===== Header ===== */
.sandbox-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  position: relative;
}

.sandbox-workbench__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.sandbox-workbench__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sandbox-workbench__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.15);
  border: 1px solid rgb(245, 158, 11, 0.3);
}

.sandbox-workbench__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sandbox-workbench__badge-text {
  color: #f59e0b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sandbox-workbench__title {
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.sandbox-workbench__hint {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.sandbox-workbench__header-actions {
  display: flex;
  gap: 8px;
}

.sandbox-workbench__btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.sandbox-workbench__safety-lock {
  border-color: rgb(239, 68, 68, 0.4);
}

/* ===== Main Layout ===== */
.sandbox-workbench__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ===== Topology ===== */
.sandbox-workbench__topology-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 236px;
  padding: 18px 20px 20px;
  border-radius: 8px;
  background: var(--runtime-surface-muted);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-workbench__topology-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sandbox-workbench__topology-title {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.sandbox-workbench__topology-subtitle {
  margin-top: 2px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.sandbox-workbench__topology-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 11px;
  font-weight: 600;
}

.sandbox-workbench__topology-panel :deep(.workline-route-map) {
  min-height: 152px;
}

/* ===== Drawer Detail ===== */
.sandbox-workbench__drawer-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
  margin-bottom: 20px;
}

.sandbox-workbench__drawer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sandbox-workbench__drawer-label {
  color: var(--runtime-text-secondary);
  font-size: 13px;
}

.sandbox-workbench__drawer-value {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 500;
}

.sandbox-workbench__drawer-value.mono {
  font-family: var(--font-mono, monospace);
}

.sandbox-workbench__drawer-value.is-sent {
  color: #f59e0b;
}
.sandbox-workbench__drawer-value.is-acked {
  color: #06b6d4;
}
.sandbox-workbench__drawer-value.is-failed {
  color: #ef4444;
}

.sandbox-workbench__drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== Context Menu ===== */
.sandbox-workbench__context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.sandbox-workbench__context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 160px;
  padding: 6px;
  border-radius: 10px;
  background: var(--runtime-surface-strong);
  border: 1px solid var(--runtime-border-neutral);
  box-shadow: 0 8px 32px rgb(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.sandbox-workbench__context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.sandbox-workbench__context-menu-item:hover {
  background: rgb(6, 182, 212, 0.15);
}

.sandbox-workbench__context-menu-item:disabled {
  color: var(--runtime-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.sandbox-workbench__context-menu-icon {
  width: 16px;
  height: 16px;
  color: var(--runtime-badge-info-text);
}

/* ===== Reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  .sandbox-workbench__badge-dot {
    animation: none;
  }
}
</style>
