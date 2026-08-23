<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { StreamQuery } from '@/api/modules/device'
import DeviceEvidenceTable from './DeviceEvidenceTable.vue'
import ManualDebugCommandDialog from './ManualDebugCommandDialog.vue'
import { useDeviceEvidenceStream } from './useDeviceEvidenceStream'

interface ManualDebugDialogExpose {
  open(candidateDeviceCode?: string, launcher?: HTMLElement): void
}

const stream = useDeviceEvidenceStream()
const { rows, connectionState, lastError, totalPayloadBytes } = stream
const dialogRef = ref<ManualDebugDialogExpose | null>(null)
const filterForm = reactive({ deviceCode: '', kind: '', commandCode: '', applyStatus: '' })

const connectionLabel = computed(() => {
  const labels = {
    DISCONNECTED: '未连接',
    CONNECTING: '连接中',
    CONNECTED: '已连接',
    RECONNECTED: '已重连'
  }
  return labels[connectionState.value]
})

const connectionType = computed(() => {
  if (connectionState.value === 'CONNECTED' || connectionState.value === 'RECONNECTED')
    return 'success'
  if (connectionState.value === 'CONNECTING') return 'warning'
  return 'info'
})

function applyFilters(): void {
  const filters: StreamQuery = {}
  if (filterForm.deviceCode.trim()) filters.device_code = filterForm.deviceCode.trim()
  if (filterForm.kind) filters.kind = filterForm.kind as NonNullable<StreamQuery['kind']>
  if (filterForm.commandCode.trim()) filters.command_code = filterForm.commandCode.trim()
  if (filterForm.applyStatus) {
    filters.apply_status = filterForm.applyStatus as NonNullable<StreamQuery['apply_status']>
  }
  stream.setFilters(filters)
}

function openGlobalDebug(event: MouseEvent): void {
  dialogRef.value?.open(undefined, event.currentTarget as HTMLElement)
}

function openRowDebug(deviceCode: string, launcher: HTMLElement | null): void {
  dialogRef.value?.open(deviceCode, launcher ?? undefined)
}

onMounted(stream.connect)

defineExpose({ filterForm, applyFilters })
</script>

<template>
  <main class="device-diagnostics-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">DEVICE INGRESS / LIVE ONLY</p>
        <h1>设备接入诊断</h1>
        <p class="page-description">
          实时查看当前页面活动期间的 RESULT、EVENT callback 尝试与 evidence 应用状态。
        </p>
      </div>
      <div class="connection-summary">
        <el-tag
          :type="connectionType"
          effect="dark"
        >
          {{ connectionLabel }}
        </el-tag>
        <span>{{ rows.length }} 行 · {{ totalPayloadBytes }} bytes</span>
      </div>
    </header>

    <el-alert
      v-if="lastError"
      :title="lastError.message"
      type="warning"
      :closable="false"
      show-icon
    />

    <section class="diagnostic-panel">
      <div class="toolbar">
        <el-input
          v-model="filterForm.deviceCode"
          clearable
          placeholder="device_code"
          aria-label="设备编码过滤"
        />
        <el-select
          v-model="filterForm.kind"
          clearable
          placeholder="RESULT / EVENT"
          aria-label="消息类型过滤"
        >
          <el-option
            label="DEVICE_RESULT"
            value="DEVICE_RESULT"
          />
          <el-option
            label="DEVICE_EVENT"
            value="DEVICE_EVENT"
          />
        </el-select>
        <el-input
          v-model="filterForm.commandCode"
          clearable
          placeholder="command_code"
          aria-label="指令编码过滤"
        />
        <el-select
          v-model="filterForm.applyStatus"
          clearable
          placeholder="apply_status"
          aria-label="Evidence 状态过滤"
        >
          <el-option
            label="PENDING"
            value="PENDING"
          />
          <el-option
            label="APPLIED"
            value="APPLIED"
          />
          <el-option
            label="IGNORED"
            value="IGNORED"
          />
          <el-option
            label="RECONCILING"
            value="RECONCILING"
          />
        </el-select>
        <div class="toolbar-actions">
          <AppButton @click="applyFilters">应用过滤</AppButton>
          <AppButton @click="stream.clear">清空</AppButton>
          <AppButton @click="stream.reconnect">重连</AppButton>
          <AppButton
            type="primary"
            @click="openGlobalDebug"
          >
            现场联调下发
          </AppButton>
        </div>
      </div>

      <DeviceEvidenceTable
        :rows="rows"
        @debug="openRowDebug"
      />
    </section>

    <ManualDebugCommandDialog ref="dialogRef" />
  </main>
</template>

<style scoped>
.device-diagnostics-page {
  display: grid;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 32px;
  line-height: 1.25;
}
.page-description {
  margin: 8px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.connection-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  white-space: nowrap;
}

.diagnostic-panel {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.toolbar-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-end;
  gap: 8px;
}

@media (width < 1024px) {
  .toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width < 768px) {
  .device-diagnostics-page {
    padding: 16px;
  }
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .toolbar {
    grid-template-columns: 1fr;
  }
  .toolbar-actions {
    flex-wrap: wrap;
    grid-column: 1;
    justify-content: flex-start;
  }
}
</style>
