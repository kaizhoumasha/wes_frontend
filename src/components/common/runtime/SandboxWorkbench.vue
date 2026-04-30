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

    : Stacked Layout -->
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

      <!-- Bottom: Pending Outbox (Full Width) -->
      <el-card
        shadow="never"
        class="sandbox-workbench__card sandbox-workbench__card--fill"
      >
        <template #header>
          <div class="sandbox-workbench__card-header">
            <svg
              class="sandbox-workbench__card-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path
                d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
              />
            </svg>
            <span>Pending Outbox</span>
            <span class="sandbox-workbench__card-badge">
              {{ pendingItems.length }}
            </span>
          </div>
        </template>

        <!-- Filter Tags -->
        <div class="sandbox-workbench__outbox-filters">
          <button
            type="button"
            class="sandbox-workbench__filter-tag"
            :class="{ 'is-active': filterStatus === null }"
            @click="filterStatus = null"
          >
            全部 {{ filterCounts.all }}
          </button>
          <button
            type="button"
            class="sandbox-workbench__filter-tag"
            :class="{ 'is-active': filterStatus === 'NEW' }"
            @click="filterStatus = 'NEW'"
          >
            待发送 {{ filterCounts.new }}
          </button>
          <button
            type="button"
            class="sandbox-workbench__filter-tag"
            :class="{ 'is-active': filterStatus === 'SENT' }"
            @click="filterStatus = 'SENT'"
          >
            已发送 {{ filterCounts.sent }}
          </button>
          <button
            type="button"
            class="sandbox-workbench__filter-tag"
            :class="{ 'is-active': filterStatus === 'ACKED' }"
            @click="filterStatus = 'ACKED'"
          >
            已确认 {{ filterCounts.acked }}
          </button>
          <button
            type="button"
            class="sandbox-workbench__filter-tag is-danger"
            :class="{ 'is-active': filterStatus === 'FAILED' }"
            @click="filterStatus = 'FAILED'"
          >
            失败 {{ filterCounts.failed }}
          </button>
        </div>

        <!-- Loading -->
        <div
          v-if="pendingLoading"
          class="sandbox-workbench__loading"
        >
          <div class="sandbox-workbench__loading-spinner" />
          <span>加载中...</span>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!filteredItems.length"
          class="sandbox-workbench__empty"
        >
          <svg
            class="sandbox-workbench__empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>暂无待处理命令</span>
        </div>

        <!-- Outbox Timeline -->
        <div
          v-else
          class="sandbox-workbench__timeline"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="sandbox-workbench__tl-item"
            :class="`is-${item.status?.toLowerCase()}`"
            @click="handleSelectOutbox(item)"
          >
            <div class="sandbox-workbench__tl-rail">
              <span class="sandbox-workbench__tl-dot" />
            </div>
            <div class="sandbox-workbench__tl-content">
              <div class="sandbox-workbench__tl-flow">
                <span class="sandbox-workbench__tl-source">
                  {{ item.source_device || '系统' }}
                </span>
                <svg
                  class="sandbox-workbench__tl-arrow"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 10a1 1 0 011-1h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="sandbox-workbench__tl-target">
                  {{ item.target_code || '未知设备' }}
                </span>
              </div>
              <div class="sandbox-workbench__tl-meta">
                <span class="sandbox-workbench__tl-command">
                  {{ getCommandLabel(item.dispatch_key) }}
                </span>
                <span class="sandbox-workbench__tl-type">
                  {{ item.dispatch_type || '' }}
                </span>
              </div>
              <div class="sandbox-workbench__tl-footer">
                <span
                  class="sandbox-workbench__tl-status"
                  :class="`is-${item.status?.toLowerCase()}`"
                >
                  {{ statusLabel(item.status) }}
                </span>
                <span class="sandbox-workbench__tl-id">#{{ item.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
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
              {{ getCommandLabel(selectedOutbox.dispatch_key) }}
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
import WorklineRouteMap from '@/components/common/runtime/WorklineRouteMap.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { sandboxProcess } from '@/api/modules/workline'
import { useRuntimeSSE } from '@/composables/useRuntimeSSE'
import type { RuntimeWorklineDeviceItem, SandboxPendingOutbox } from '@/types/runtime'

const props = defineProps<{
  worklineId: number
  devices?: RuntimeWorklineDeviceItem[]
  deviceId?: number | null
  runMode?: string | null
}>()

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
    name: device.device_name || device.device_code || `设备 #${device.id}`,
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
  }
})

// State
const pendingItems = ref<SandboxPendingOutbox[]>([])
const pendingLoading = ref(false)
const processing = ref(false)
const actionLoading = ref(false)
const selectedOutbox = ref<SandboxPendingOutbox | null>(null)
const eventDrawerVisible = ref(false)
const resultDrawerVisible = ref(false)
const showResultComposer = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

// Filter
const filterStatus = ref<string | null>(null)

// Pending counts for filter tags
const filterCounts = computed(() => ({
  all: pendingItems.value.length,
  new: pendingItems.value.filter(i => i.status === 'NEW').length,
  sent: pendingItems.value.filter(i => i.status === 'SENT').length,
  acked: pendingItems.value.filter(i => i.status === 'ACKED').length,
  failed: pendingItems.value.filter(i => i.status === 'FAILED').length
}))

// Filtered items
const filteredItems = computed(() => {
  if (!filterStatus.value) return pendingItems.value
  return pendingItems.value.filter(i => i.status === filterStatus.value)
})

// Pending counts by device
const pendingCountsByDevice = computed(() => {
  return {} as Record<number, number>
})

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// Methods
async function loadPending() {
  pendingLoading.value = true
  try {
    // 按 workline 获取所有 outbox，不按 device 过滤
    const items = await runtimeApiMethods.sandboxPending(50, props.worklineId).send()
    // 最新的排在最前面（id 越大越新）
    pendingItems.value = (items || []).sort((a, b) => b.id - a.id)
  } finally {
    pendingLoading.value = false
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

function statusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    NEW: '待发送',
    DISPATCHING: '派发中',
    SENT: '已发送',
    ACKED: '已确认',
    FAILED: '失败'
  }
  return map[status || ''] || status || ''
}

function getCommandLabel(dispatchKey: string | null | undefined): string {
  if (!dispatchKey) return '未知命令'
  const parts = dispatchKey.split(':')
  return parts[parts.length - 1] || dispatchKey
}

onMounted(() => {
  void loadPending()
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
  color: #f1f5f9;
  font-size: 18px;
  font-weight: 700;
}

.sandbox-workbench__hint {
  color: #94a3b8;
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
  background: rgb(15, 23, 42, 0.6);
  border: 1px solid rgb(51, 65, 85, 0.4);
}

.sandbox-workbench__card--fill {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sandbox-workbench__card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f1f5f9;
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
  background: rgb(6, 182, 212, 0.2);
  color: #22d3ee;
  font-size: 11px;
  font-weight: 600;
}

/* ===== Loading & Empty ===== */
.sandbox-workbench__loading,
.sandbox-workbench__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #94a3b8;
  font-size: 13px;
}

.sandbox-workbench__loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgb(6, 182, 212, 0.2);
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sandbox-workbench__empty-icon {
  width: 48px;
  height: 48px;
  color: #22c55e;
}

/* ===== Timeline ===== */
.sandbox-workbench__timeline {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sandbox-workbench__tl-item {
  display: flex;
  gap: 14px;
  cursor: pointer;
  padding: 4px 0;
}

.sandbox-workbench__tl-item:hover .sandbox-workbench__tl-content {
  background: rgb(30, 41, 59, 0.6);
  border-color: rgb(6, 182, 212, 0.3);
}

.sandbox-workbench__tl-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
  position: relative;
}

.sandbox-workbench__tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #64748b;
  border: 2px solid #334155;
  margin-top: 8px;
  flex-shrink: 0;
}

/* Timeline connector line */
.sandbox-workbench__tl-item:not(:last-child) .sandbox-workbench__tl-rail::after {
  content: '';
  width: 2px;
  flex: 1;
  background: rgb(51, 65, 85, 0.5);
  margin-top: 4px;
}

/* Status-colored dots */
.sandbox-workbench__tl-item.is-new .sandbox-workbench__tl-dot {
  background: #64748b;
  border-color: #475569;
}

.sandbox-workbench__tl-item.is-sent .sandbox-workbench__tl-dot {
  background: #f59e0b;
  border-color: rgb(245, 158, 11, 0.4);
}

.sandbox-workbench__tl-item.is-acked .sandbox-workbench__tl-dot {
  background: #06b6d4;
  border-color: rgb(6, 182, 212, 0.4);
}

.sandbox-workbench__tl-item.is-failed .sandbox-workbench__tl-dot {
  background: #ef4444;
  border-color: rgb(239, 68, 68, 0.4);
}

.sandbox-workbench__tl-content {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgb(30, 41, 59, 0.4);
  border: 1px solid rgb(51, 65, 85, 0.3);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.sandbox-workbench__tl-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.sandbox-workbench__tl-source {
  color: #fbbf24;
  font-size: 13px;
  font-weight: 500;
}

.sandbox-workbench__tl-arrow {
  width: 14px;
  height: 14px;
  color: #64748b;
  flex-shrink: 0;
}

.sandbox-workbench__tl-target {
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
}

.sandbox-workbench__tl-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.sandbox-workbench__tl-command {
  color: #94a3b8;
  font-size: 11px;
  font-family: var(--font-mono, monospace);
}

.sandbox-workbench__tl-type {
  color: #475569;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sandbox-workbench__tl-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sandbox-workbench__tl-status {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.sandbox-workbench__tl-status.is-new {
  background: rgb(100, 116, 139, 0.2);
  color: #94a3b8;
}

.sandbox-workbench__tl-status.is-sent {
  background: rgb(245, 158, 11, 0.2);
  color: #fbbf24;
}

.sandbox-workbench__tl-status.is-acked {
  background: rgb(6, 182, 212, 0.2);
  color: #22d3ee;
}

.sandbox-workbench__tl-status.is-failed {
  background: rgb(239, 68, 68, 0.2);
  color: #fca5a5;
}

.sandbox-workbench__tl-id {
  color: #475569;
  font-size: 10px;
  font-family: var(--font-mono, monospace);
}

/* ===== Filter Tags ===== */
.sandbox-workbench__outbox-filters {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid rgb(51, 65, 85, 0.3);
  margin-bottom: 12px;
}

.sandbox-workbench__filter-tag {
  padding: 4px 12px;
  border-radius: 6px;
  background: rgb(51, 65, 85, 0.3);
  border: 1px solid transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sandbox-workbench__filter-tag:hover {
  background: rgb(51, 65, 85, 0.5);
  color: #f1f5f9;
}

.sandbox-workbench__filter-tag.is-active {
  background: rgb(6, 182, 212, 0.2);
  border-color: rgb(6, 182, 212, 0.4);
  color: #22d3ee;
}

.sandbox-workbench__filter-tag.is-danger.is-active {
  background: rgb(239, 68, 68, 0.2);
  border-color: rgb(239, 68, 68, 0.4);
  color: #fca5a5;
}

/* ===== Drawer Detail ===== */
.sandbox-workbench__drawer-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: rgb(15, 23, 42, 0.5);
  margin-bottom: 20px;
}

.sandbox-workbench__drawer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sandbox-workbench__drawer-label {
  color: #94a3b8;
  font-size: 13px;
}

.sandbox-workbench__drawer-value {
  color: #f1f5f9;
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

/* ===== FAB ===== */
.sandbox-workbench__fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(6, 182, 212, 0.4);
  z-index: 100;
}

.sandbox-workbench__fab svg {
  width: 24px;
  height: 24px;
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
  background: rgb(30, 41, 59, 0.95);
  border: 1px solid rgb(51, 65, 85, 0.6);
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
  color: #f1f5f9;
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
  color: #22d3ee;
}

/* ===== Responsive ===== */
@media (width <= 1023px) {
  .sandbox-workbench__fab {
    right: 16px;
    bottom: 16px;
  }
}

/* ===== Accessibility ===== */
.sandbox-workbench__tl-item:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

.sandbox-workbench__filter-tag:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sandbox-workbench__badge-dot {
    animation: none;
  }
  .sandbox-workbench__loading-spinner {
    animation: none;
  }
  .sandbox-workbench__tl-item .sandbox-workbench__tl-content {
    transition: none;
  }
  .sandbox-workbench__filter-tag {
    transition: none;
  }
}
</style>
