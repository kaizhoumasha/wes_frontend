<template>
  <el-card
    shadow="never"
    class="trace-next-actions"
  >
    <template #header>
      <div class="trace-next-actions__header">
        <div>
          <div class="trace-next-actions__title">下一步动作</div>
          <div class="trace-next-actions__subtitle">
            沿责任对象继续排查，而不是停留在当前证据页。
          </div>
        </div>
      </div>
    </template>

    <div class="trace-next-actions__grid">
      <el-button
        v-if="detail.trace.workline_id"
        type="primary"
        @click="openWorkline"
      >
        查看所属工作线
      </el-button>
      <el-button
        v-if="canOpenRuntimeDevice && detail.trace.device_id && detail.trace.workline_id"
        plain
        @click="openDevice"
      >
        查看线内设备
      </el-button>
      <el-button
        v-if="detail.trace.session_id || detail.trace.trace_id"
        plain
        @click="openTraceId"
      >
        查询当前案件
      </el-button>
      <el-button
        v-if="detail.trace.command_code"
        plain
        @click="openCommand"
      >
        查询同 Command
      </el-button>
      <el-button
        v-if="detail.trace.dispatch_key"
        plain
        @click="openDispatch"
      >
        查询同 Dispatch
      </el-button>
      <el-button
        v-if="detail.trace.request_id"
        plain
        @click="openRequest"
      >
        打开当前 Request
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import type { TraceDetailResponse } from '@/types/runtime'
import { buildRuntimeWorklineQuery, type RuntimeTraceQueryInput } from '@/utils/runtime-route'

const props = defineProps<{
  detail: TraceDetailResponse
}>()

const emit = defineEmits<{
  'open-trace': [query: RuntimeTraceQueryInput]
}>()

const router = useRouter()
const { hasPermission } = usePermission()
const canOpenRuntimeDevice = computed(() => hasPermission(BIZ_PERMISSIONS.device.page))

function openWorkline() {
  if (!props.detail.trace.workline_id) return
  router.push({
    name: 'RuntimeMonitor',
    query: buildRuntimeWorklineQuery(props.detail.trace.workline_id)
  })
}

function openDevice() {
  if (!props.detail.trace.device_id || !props.detail.trace.workline_id) return
  router.push({
    name: 'RuntimeMonitor',
    query: buildRuntimeWorklineQuery(props.detail.trace.workline_id, props.detail.trace.device_id)
  })
}

function openTraceId() {
  if (!props.detail.trace.session_id && !props.detail.trace.trace_id) return
  emit('open-trace', {
    sessionId: props.detail.trace.session_id,
    traceId: props.detail.trace.session_id ? undefined : props.detail.trace.trace_id,
    worklineId: props.detail.trace.workline_id,
    deviceId: props.detail.trace.device_id
  })
}

function openCommand() {
  if (!props.detail.trace.command_code) return
  emit('open-trace', { commandCode: props.detail.trace.command_code })
}

function openDispatch() {
  if (!props.detail.trace.dispatch_key) return
  emit('open-trace', { dispatchKey: props.detail.trace.dispatch_key })
}

function openRequest() {
  if (!props.detail.trace.request_id) return
  emit('open-trace', {
    requestId: props.detail.trace.request_id,
    worklineId: props.detail.trace.workline_id,
    deviceId: props.detail.trace.device_id
  })
}
</script>

<style scoped>
.trace-next-actions {
  border: 1px solid rgb(245, 158, 11, 0.12);
  background: var(--runtime-surface);
}

.trace-next-actions__title {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.trace-next-actions__subtitle {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.trace-next-actions__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
