<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'
import type { DebugTasksInput, TasksQuery } from '@/api/modules/transport'
import type { TransportEvidenceStreamEvent } from '@/api/streaming/transportEvidenceStream'
import { usePermission } from '@/composables/usePermission'
import TransportDebugTaskDialog from './TransportDebugTaskDialog.vue'
import TransportDebugRunDialog from './TransportDebugRunDialog.vue'
import TransportDebugResetDialog from './TransportDebugResetDialog.vue'
import TransportTaskDetail from './TransportTaskDetail.vue'
import TransportTaskTable from './TransportTaskTable.vue'
import { useTransportDiagnostics } from './useTransportDiagnostics'
import { useTransportEvidenceStream } from './useTransportEvidenceStream'

interface DebugDialogExpose {
  open(launcher?: HTMLElement): void
  close(): void
}

const diagnostics = useTransportDiagnostics()
const { hasPermission } = usePermission()
const canRead = computed(() => hasPermission(OPS_PERMISSIONS.transportTask.read))
const canStream = computed(() => hasPermission(OPS_PERMISSIONS.transportEvidence.stream))
const canCreate = computed(() => hasPermission(OPS_PERMISSIONS.transport.debugCreate))
const canPreviewReset = computed(() => hasPermission(OPS_PERMISSIONS.transport.debugPreview))
const canReset = computed(() => hasPermission(OPS_PERMISSIONS.transport.debugReset))
const canListDebugRuns = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.list))
const canReadDebugRun = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.read))
const canStartDebugRun = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.start))
const canStreamDebugRun = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.stream))
const canAbortDebugRun = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.abort))
const canOpenDebugRun = computed(
  () => canListDebugRuns.value && (canStartDebugRun.value || canReadDebugRun.value)
)
const filterForm = reactive({ kind: '', status: '' })
const uiError = ref('')
const dialogRef = ref<DebugDialogExpose | null>(null)
const runDialogRef = ref<DebugDialogExpose | null>(null)
const resetDialogOpen = ref(false)
const stream = useTransportEvidenceStream({
  onEvent: event => void refreshFromEvent(event),
  onReconnect: () => void refreshRecent()
})

const connectionLabel = computed(() => {
  const labels = {
    DISCONNECTED: '实时通知不可用',
    CONNECTING: '连接中',
    CONNECTED: '实时通知已连接',
    RECONNECTED: '实时通知已重连'
  }
  return labels[stream.connectionState.value]
})

async function refreshRecent(): Promise<void> {
  uiError.value = ''
  try {
    await diagnostics.loadRecent()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function applyFilters(): Promise<void> {
  const filters: Pick<TasksQuery, 'kind' | 'status'> = {}
  if (filterForm.kind) filters.kind = filterForm.kind as NonNullable<TasksQuery['kind']>
  if (filterForm.status) filters.status = filterForm.status as NonNullable<TasksQuery['status']>
  diagnostics.setFilters(filters)
  await refreshRecent()
}

async function selectTask(transportTaskId: string): Promise<void> {
  if (!canRead.value) return
  uiError.value = ''
  try {
    await diagnostics.selectTask(transportTaskId)
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function loadMore(): Promise<void> {
  uiError.value = ''
  try {
    await diagnostics.loadMore()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function refreshFromEvent(event: TransportEvidenceStreamEvent): Promise<void> {
  try {
    await diagnostics.handleStreamTask(event.payload.transport_task_id)
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function submitTask(input: DebugTasksInput): Promise<void> {
  uiError.value = ''
  try {
    await diagnostics.submitTask(input)
    dialogRef.value?.close()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function openReset(): Promise<void> {
  const transportTaskId = diagnostics.selectedTaskId.value
  if (!transportTaskId || !canPreviewReset.value) return
  uiError.value = ''
  try {
    await diagnostics.previewTaskReset(transportTaskId)
    resetDialogOpen.value = true
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function confirmReset(): Promise<void> {
  const transportTaskId = diagnostics.resetPreview.value?.transport_task_id
  if (!transportTaskId || !canReset.value) return
  uiError.value = ''
  try {
    await diagnostics.resetTask(transportTaskId)
    resetDialogOpen.value = false
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function openDebug(event: MouseEvent): void {
  dialogRef.value?.open(event.currentTarget as HTMLElement)
}

function openDebugRun(event: MouseEvent): void {
  runDialogRef.value?.open(event.currentTarget as HTMLElement)
}

async function selectRunTask(transportTaskId: string): Promise<void> {
  await selectTask(transportTaskId)
  runDialogRef.value?.close()
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

onMounted(() => {
  void refreshRecent()
  if (canStream.value) stream.connect()
})

defineExpose({ filterForm, applyFilters })
</script>

<template>
  <main class="transport-diagnostics-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">TRANSPORT / DURABLE QUERY + LIVE NOTIFY</p>
        <h1>运输接入诊断</h1>
        <p class="page-description">
          查询持久 Transport 证据；SSE 只通知在线变化，不承载完整结果。
        </p>
      </div>
      <div class="connection-summary">
        <el-tag
          :type="
            stream.connectionState.value === 'CONNECTED' ||
            stream.connectionState.value === 'RECONNECTED'
              ? 'success'
              : 'warning'
          "
          effect="dark"
        >
          {{ canStream ? connectionLabel : '无 SSE 权限' }}
        </el-tag>
        <AppButton
          v-if="canStream"
          @click="stream.reconnect"
        >
          重连
        </AppButton>
      </div>
    </header>

    <el-alert
      v-if="stream.hasGap.value"
      title="实时通知可能有缺口；已在重连后重新查询最近持久任务。"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="uiError || diagnostics.lastError.value || stream.lastError.value"
      :title="uiError || diagnostics.lastError.value?.message || stream.lastError.value?.message"
      type="error"
      :closable="false"
      show-icon
    />

    <section class="toolbar">
      <el-select
        v-model="filterForm.kind"
        clearable
        placeholder="Transport kind"
        aria-label="Transport 能力过滤"
      >
        <el-option
          v-for="kind in ['RACK_MOVE', 'RACK_ROTATE', 'BIN_MOVE', 'BIN_EXCHANGE']"
          :key="kind"
          :label="kind"
          :value="kind"
        />
      </el-select>
      <el-select
        v-model="filterForm.status"
        clearable
        placeholder="Transport status"
        aria-label="Transport 状态过滤"
      >
        <el-option
          v-for="status in [
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'SUCCEEDED',
            'FAILED',
            'RECONCILING'
          ]"
          :key="status"
          :label="status"
          :value="status"
        />
      </el-select>
      <div class="toolbar-actions">
        <AppButton
          :loading="diagnostics.loading.value"
          @click="applyFilters"
        >
          应用过滤
        </AppButton>
        <AppButton @click="refreshRecent">刷新持久任务</AppButton>
        <AppButton
          v-if="canPreviewReset"
          type="danger"
          :loading="diagnostics.previewingReset.value"
          :disabled="!diagnostics.selectedTaskId.value"
          @click="openReset"
        >
          清理联调任务
        </AppButton>
        <AppButton
          v-if="canCreate"
          type="danger"
          @click="openDebug"
        >
          创建真实调试任务
        </AppButton>
        <AppButton
          v-if="canOpenDebugRun"
          type="danger"
          @click="openDebugRun"
        >
          自动联调
        </AppButton>
      </div>
    </section>

    <section class="diagnostics-grid">
      <TransportTaskTable
        :tasks="diagnostics.tasks.value"
        :selected-task-id="diagnostics.selectedTaskId.value"
        :loading="diagnostics.loading.value"
        :has-more="Boolean(diagnostics.nextCursor.value)"
        @select="selectTask"
        @load-more="loadMore"
      />
      <TransportTaskDetail
        :detail="diagnostics.detail.value"
        :loading="diagnostics.loadingDetail.value"
        :can-read="canRead"
      />
    </section>

    <TransportDebugTaskDialog
      ref="dialogRef"
      :submitting="diagnostics.submitting.value"
      @submit="submitTask"
    />
    <TransportDebugRunDialog
      ref="runDialogRef"
      :can-start="canStartDebugRun"
      :can-abort="canAbortDebugRun"
      :can-stream="canStreamDebugRun"
      :can-read="canReadDebugRun"
      :can-read-task="canRead"
      @select-task="selectRunTask"
    />
    <TransportDebugResetDialog
      v-model="resetDialogOpen"
      :preview="diagnostics.resetPreview.value"
      :submitting="diagnostics.resetting.value"
      :can-reset="canReset"
      @confirm="confirmReset"
    />
  </main>
</template>

<style scoped src="./TransportDiagnosticsPage.css"></style>
