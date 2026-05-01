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
          :disabled="!selectedDeviceId"
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
          type="primary"
          size="small"
          :loading="processing"
          @click="triggerProcess"
        >
          <svg
            class="sandbox-workbench__btn-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
          触发编排
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
      :pending-outboxes="pendingItems"
    />

    <!-- Stacked Layout -->
    <div class="sandbox-workbench__main">
      <!-- Top: Device Topology (Compact Horizontal) -->
      <el-card
        v-if="deviceList.length"
        shadow="never"
        class="sandbox-workbench__card"
      >
        <template #header>
          <div class="sandbox-workbench__card-header">
            <svg
              class="sandbox-workbench__card-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span>设备拓扑</span>
            <span
              v-if="selectedDeviceId"
              class="sandbox-workbench__card-badge"
            >
              {{ selectedDeviceName }}
            </span>
          </div>
        </template>
        <WorklineRouteMap
          :devices="deviceList"
          :selected-device-id="selectedDeviceId"
          :pending-counts-by-device="pendingCountsByDevice"
          compact
          @select="handleSelectDevice"
          @send-event="handleSendEventFromTopology"
          @view-outbox="handleViewOutboxFromTopology"
          @show-context-menu="handleShowContextMenu"
        />
      </el-card>

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
        :items="pendingItems"
        :completed-items="completedItems"
        :loading="actionLoadingForItem"
        @trigger="handleActionTrigger"
        @ack="handleActionAck"
        @result="handleActionResult"
        @retry="handleActionRetry"
      />
    </div>

    <!-- Event Drawer -->
    <el-drawer
      v-model="eventDrawerVisible"
      title="发送 Event"
      direction="rtl"
      size="480px"
    >
      <SandboxEventComposer
        :workline-id="worklineId"
        :device-id="selectedDeviceId"
        :device-name="selectedDeviceInfo?.name"
        :device-code="selectedDeviceInfo?.code"
        :device-role="selectedDeviceInfo?.role"
        :device-status="selectedDeviceInfo?.status"
        @submitted="handleEventSubmitted"
      />
    </el-drawer>

    <!-- Result Drawer -->
    <el-drawer
      v-model="resultDrawerVisible"
      title="命令操作"
      direction="rtl"
      size="560px"
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
          <!-- NEW: Resend -->
          <el-button
            v-if="selectedOutbox.status === 'NEW'"
            type="primary"
            :loading="actionLoading"
            @click="handleResend"
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
            重新发送
          </el-button>

          <!-- SENT: ACK -->
          <el-button
            v-if="selectedOutbox.status === 'SENT'"
            type="success"
            :loading="actionLoading"
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
            v-if="selectedOutbox.status === 'ACKED'"
            type="primary"
            :loading="actionLoading"
            @click="openResultComposer"
          >
            模拟 Result
          </el-button>

          <!-- FAILED: Retry -->
          <el-button
            v-if="selectedOutbox.status === 'FAILED'"
            type="warning"
            :loading="actionLoading"
            @click="handleRetry"
          >
            重试
          </el-button>
        </div>

        <!-- Result Composer (shown after ACKED) -->
        <div v-if="showResultComposer">
          <el-divider />
          <SandboxResultComposer
            :outbox="selectedOutbox"
            @submitted="handleResultSubmitted"
          />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SandboxEventComposer from '@/components/common/runtime/SandboxEventComposer.vue'
import SandboxResultComposer from '@/components/common/runtime/SandboxResultComposer.vue'
import SandboxCycleStatus from '@/components/common/runtime/SandboxCycleStatus.vue'
import SandboxActionList from '@/components/common/runtime/SandboxActionList.vue'
import WorklineRouteMap from '@/components/common/runtime/WorklineRouteMap.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { sandboxProcess } from '@/api/modules/workline'
import { useRuntimeSSE } from '@/composables/useRuntimeSSE'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import { displayCommand, displayDevice } from '@/utils/runtime-display-identity'
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
}>()

const store = useWorklineRuntimeStore()

// 活跃会话：来自 store 的 detail
const activeSessions = computed<RuntimeTraceListItem[]>(
  () => (store.detail?.active_sessions as RuntimeTraceListItem[] | undefined) ?? []
)

const deviceList = computed(() => props.devices ?? [])
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
  selectedDeviceId.value = deviceId
  eventDrawerVisible.value = true
}

function handleViewOutboxFromTopology(deviceId: number) {
  selectedDeviceId.value = deviceId
  // Filter outbox by device and select first
  const deviceOutbox = pendingItems.value.filter(item => {
    // Match by target_code - need device code from device list
    const device = deviceList.value.find(d => d.id === deviceId)
    return device && item.target_code === device.device_code
  })
  if (deviceOutbox.length > 0) {
    handleSelectOutbox(deviceOutbox[0])
  }
}

const emit = defineEmits<{
  refresh: []
}>()

// SSE
const { lastEvent } = useRuntimeSSE(true)

watch(lastEvent, event => {
  if (!event) return
  // 后端目前只推送 device.status.changed，设备状态变化时刷新 outbox
  if (
    event.action === 'status.changed' ||
    event.action === 'device.status.changed' ||
    event.entity === 'device' ||
    event.entity === 'outbox' ||
    event.entity === 'command'
  ) {
    void loadPending()
    void loadCompleted()
  }
})

// State
const pendingItems = ref<SandboxPendingOutbox[]>([])
const completedItems = ref<SandboxCompletedSession[]>([])
const processing = ref(false)
const actionLoading = ref(false)
const selectedOutbox = ref<SandboxPendingOutbox | null>(null)
const eventDrawerVisible = ref(false)
const resultDrawerVisible = ref(false)
const showResultComposer = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

// Pending counts by device
const pendingCountsByDevice = computed(() => {
  const counts: Record<number, number> = {}
  for (const item of pendingItems.value) {
    if (item.status === 'FAILED' || item.status === 'CANCELLED') continue
    const device = deviceList.value.find(d => d.device_code === item.target_code)
    if (device) {
      counts[device.id] = (counts[device.id] || 0) + 1
    }
  }
  return counts
})

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
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
  void loadPending()
  emit('refresh')
}

async function triggerProcess() {
  processing.value = true
  try {
    await sandboxProcess().send()
    setTimeout(() => {
      void loadPending()
    }, 1000)
  } finally {
    processing.value = false
  }
}

function handleSelectOutbox(outbox: SandboxPendingOutbox) {
  selectedOutbox.value = outbox
  showResultComposer.value = false
  resultDrawerVisible.value = true
}

function handleEventSubmitted() {
  eventDrawerVisible.value = false
  // 后端 Celery 异步处理 event -> outbox，延迟刷新确保能看到新数据
  setTimeout(() => void loadPending(), 800)
  setTimeout(() => void loadPending(), 2000)
}

function openResultComposer() {
  showResultComposer.value = true
}

async function handleResultSubmitted() {
  showResultComposer.value = false
  resultDrawerVisible.value = false
  selectedOutbox.value = null
  void loadPending()
  void loadCompleted()
}

async function handleAck() {
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
    ElMessage.error(errorMessage(e, 'ACK 失败'))
  } finally {
    actionLoading.value = false
  }
}

async function handleResend() {
  actionLoading.value = true
  try {
    // Trigger process to resend
    await sandboxProcess().send()
    ElMessage.success('已重新发送')
    resultDrawerVisible.value = false
    setTimeout(() => void loadPending(), 500)
  } catch (e: unknown) {
    ElMessage.error(errorMessage(e, '重发失败'))
  } finally {
    actionLoading.value = false
  }
}

async function handleRetry() {
  actionLoading.value = true
  try {
    await sandboxProcess().send()
    ElMessage.success('已重试')
    resultDrawerVisible.value = false
    setTimeout(() => void loadPending(), 500)
  } catch (e: unknown) {
    ElMessage.error(errorMessage(e, '重试失败'))
  } finally {
    actionLoading.value = false
  }
}

// SandboxActionList handlers
const actionLoadingForItem = ref<number | null>(null)

async function handleActionTrigger(item: SandboxPendingOutbox) {
  actionLoadingForItem.value = item.id
  try {
    await sandboxProcess().send()
    ElMessage.success('已触发编排')
    setTimeout(() => void loadPending(), 500)
  } catch (e: unknown) {
    ElMessage.error(errorMessage(e, '触发失败'))
  } finally {
    actionLoadingForItem.value = null
  }
}

async function handleActionAck(item: SandboxPendingOutbox) {
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
    ElMessage.error(errorMessage(e, 'ACK 失败'))
  } finally {
    actionLoadingForItem.value = null
  }
}

function handleActionResult(item: SandboxPendingOutbox) {
  selectedOutbox.value = item
  showResultComposer.value = true
  resultDrawerVisible.value = true
}

async function handleActionRetry(item: SandboxPendingOutbox) {
  actionLoadingForItem.value = item.id
  try {
    await sandboxProcess().send()
    ElMessage.success('已重试')
    setTimeout(() => void loadPending(), 500)
  } catch (e: unknown) {
    ElMessage.error(errorMessage(e, '重试失败'))
  } finally {
    actionLoadingForItem.value = null
  }
}

function statusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    NEW: '待发送',
    DISPATCHING: '派发中',
    SENT: '已发送',
    ACKED: '已确认',
    FAILED: '失败',
    CANCELLED: '已取消'
  }
  return map[status || ''] || status || ''
}

onMounted(() => {
  void loadPending()
  void loadCompleted()
  // 移除频繁轮询，改用 SSE 监听 + 手动刷新
  // pollTimer = setInterval(() => {
  //   void loadPending()
  // }, 3000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
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

/* ===== Main Layout ===== */
.sandbox-workbench__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ===== Cards ===== */
.sandbox-workbench__card {
  background: var(--runtime-surface-muted);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-workbench__card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.sandbox-workbench__card-icon {
  width: 18px;
  height: 18px;
  color: #06b6d4;
}

.sandbox-workbench__card-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 11px;
  font-weight: 600;
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
