<template>
  <el-card shadow="never" class="trace-next-actions">
    <template #header>
      <div class="trace-next-actions__header">
        <div>
          <div class="trace-next-actions__title">下一步动作</div>
          <div class="trace-next-actions__subtitle">沿责任对象继续排查，而不是停留在当前证据页。</div>
        </div>
      </div>
    </template>

    <div class="trace-next-actions__grid">
      <el-button v-if="detail.trace.workline_id" type="primary" @click="openWorkline">查看所属工作线</el-button>
      <el-button v-if="detail.trace.device_id" plain @click="openDevice">查看所属设备</el-button>
      <el-button v-if="detail.trace.correlation_id" plain @click="openCorrelation">查询同 Correlation</el-button>
      <el-button v-if="detail.trace.command_code" plain @click="openCommand">查询同 Command</el-button>
      <el-button v-if="detail.trace.request_id" plain @click="openRequest">打开当前 Request</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { TraceDetailResponse } from '@/types/runtime'

const props = defineProps<{
  detail: TraceDetailResponse
}>()

const router = useRouter()

function openWorkline() {
  if (!props.detail.trace.workline_id) return
  router.push({ name: 'RuntimeWorklines', query: { worklineId: String(props.detail.trace.workline_id) } })
}

function openDevice() {
  if (!props.detail.trace.device_id) return
  router.push({ name: 'RuntimeDevices', query: { deviceId: String(props.detail.trace.device_id) } })
}

function openCorrelation() {
  if (!props.detail.trace.correlation_id) return
  router.push({ name: 'RuntimeTraceExplorer', query: { correlationId: props.detail.trace.correlation_id, worklineId: props.detail.trace.workline_id ? String(props.detail.trace.workline_id) : undefined, deviceId: props.detail.trace.device_id ? String(props.detail.trace.device_id) : undefined } })
}

function openCommand() {
  if (!props.detail.trace.command_code) return
  router.push({ name: 'RuntimeTraceExplorer', query: { commandCode: props.detail.trace.command_code } })
}

function openRequest() {
  if (!props.detail.trace.request_id) return
  router.push({ name: 'RuntimeTraceExplorer', query: { requestId: props.detail.trace.request_id, worklineId: props.detail.trace.workline_id ? String(props.detail.trace.workline_id) : undefined, deviceId: props.detail.trace.device_id ? String(props.detail.trace.device_id) : undefined } })
}
</script>

<style scoped>
.trace-next-actions {
  border: 1px solid rgb(245, 158, 11, 0.12);
  background: rgb(15, 23, 42, 0.72);
}

.trace-next-actions__title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
}

.trace-next-actions__subtitle {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.trace-next-actions__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
