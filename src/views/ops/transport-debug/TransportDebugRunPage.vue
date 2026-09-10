<script setup lang="ts">
import { computed } from 'vue'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import TransportTaskDetail from '@/views/ops/transport-diagnostics/TransportTaskDetail.vue'
import { useTransportDiagnostics } from '@/views/ops/transport-diagnostics/useTransportDiagnostics'
import TransportDebugRunPanel from './TransportDebugRunPanel.vue'

const { hasPermission } = usePermission()
const canList = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.list))
const canStart = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.start))
const canRead = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.read))
const canStream = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.stream))
const canAbort = computed(() => hasPermission(OPS_PERMISSIONS.transportDebugRun.abort))
const canReadTask = computed(() => hasPermission(OPS_PERMISSIONS.transportTask.read))
const canReadCallbackReceipt = computed(() =>
  hasPermission(OPS_PERMISSIONS.transportCallbackReceipt.read)
)
const diagnostics = useTransportDiagnostics()

async function selectTask(taskId: string): Promise<void> {
  if (!canReadTask.value) return
  try {
    await diagnostics.selectTask(taskId)
  } catch {
    // 查询错误由共享诊断状态展示。
  }
}
</script>

<template>
  <main class="transport-debug-page">
    <header>
      <h1>自动联调</h1>
      <p>配置货架、分面料箱和联调轮数，查看后台执行进度。</p>
    </header>
    <TransportDebugRunPanel
      v-if="canList"
      :can-start="canStart"
      :can-read="canRead"
      :can-stream="canStream"
      :can-abort="canAbort"
      :can-read-task="canReadTask"
      @select-task="selectTask"
    />
    <el-alert
      v-else
      title="无自动联调查询权限"
      type="warning"
      :closable="false"
    />
    <el-alert
      v-if="diagnostics.lastError.value"
      :title="diagnostics.lastError.value.message"
      type="error"
      :closable="false"
    />
    <TransportTaskDetail
      v-if="canReadTask && diagnostics.selectedTaskId.value"
      :detail="diagnostics.detail.value"
      :loading="diagnostics.loadingDetail.value"
      :can-read="canReadTask"
      :can-read-callback-receipt="canReadCallbackReceipt"
      :callback-receipt="diagnostics.callbackReceipt.value"
      :callback-receipt-unknown="diagnostics.callbackReceiptUnknown.value"
      :callback-receipt-error="diagnostics.callbackReceiptError.value"
      :loading-callback-receipt="diagnostics.loadingCallbackReceipt.value"
      @lookup-callback-receipt="diagnostics.loadCallbackReceipt"
    />
  </main>
</template>

<style scoped>
.transport-debug-page {
  display: grid;
  gap: 24px;
  padding: 24px;
}

header h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 24px;
}

header p {
  color: var(--el-text-color-secondary);
}
</style>
