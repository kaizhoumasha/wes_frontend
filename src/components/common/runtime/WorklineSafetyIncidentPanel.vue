<template>
  <section
    class="workline-safety-panel"
    role="alert"
    aria-live="assertive"
  >
    <div class="workline-safety-panel__status-bar" />
    <div class="workline-safety-panel__body">
      <div class="workline-safety-panel__main">
        <RuntimeStatusBadge
          label="软件急停冻结"
          tone="danger"
          size="small"
        />
        <h2 class="workline-safety-panel__title">软件急停冻结</h2>
        <p class="workline-safety-panel__copy">
          仅表示 WES 软件侧已阻断新流程接收，不代表 PLC/设备物理急停已复位。
        </p>
      </div>

      <dl class="workline-safety-panel__facts">
        <div class="workline-safety-panel__fact">
          <dt>工作线</dt>
          <dd>{{ summary.line_name }}</dd>
        </div>
        <div class="workline-safety-panel__fact">
          <dt>状态来源</dt>
          <dd>{{ sourceLabel }}</dd>
        </div>
        <div class="workline-safety-panel__fact">
          <dt>停止时间</dt>
          <dd>{{ stoppedAtLabel }}</dd>
        </div>
        <div class="workline-safety-panel__fact">
          <dt>原因</dt>
          <dd>{{ summary.stopped_reason || '等待 safety incident 证据' }}</dd>
        </div>
      </dl>

      <div class="workline-safety-panel__actions">
        <el-button
          plain
          @click="emit('refresh')"
        >
          刷新证据
        </el-button>
        <el-button
          type="primary"
          :loading="clearEstopLoading"
          :disabled="!canClearEstop || clearEstopLoading"
          :title="clearEstopDisabledReason"
          @click="requestClearEstop"
        >
          解除软件冻结 / 恢复接收
        </el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeWorklineSummary } from '@/types/runtime'
import type { WorklineRuntimeVerdict } from '@/utils/runtime-safety'
import { formatRuntimeDateTime } from '@/utils/runtime-display'

const props = defineProps<{
  summary: RuntimeWorklineSummary
  verdict: WorklineRuntimeVerdict
  canClearEstop?: boolean
  clearEstopLoading?: boolean
}>()

const emit = defineEmits<{
  refresh: []
  clearEstop: []
}>()

const canClearEstop = computed(() => props.canClearEstop ?? false)
const clearEstopLoading = computed(() => props.clearEstopLoading ?? false)
const clearEstopDisabledReason = computed(() =>
  canClearEstop.value ? undefined : '需要 biz:workline:clear-estop 权限'
)

const stoppedAtLabel = computed(() =>
  props.summary.stopped_at
    ? formatRuntimeDateTime(props.summary.stopped_at)
    : '等待 safety incident 证据'
)

const sourceLabel = computed(() => {
  if (props.summary.active_safety_incident_id) {
    return `Incident #${props.summary.active_safety_incident_id}`
  }
  if (props.summary.runtime_status === 'ESTOPPED') {
    return '运行态 summary'
  }
  if (props.verdict.blockedReason?.includes('WORKLINE_ESTOPPED')) {
    return '设备安全错误回推'
  }
  return props.verdict.evidenceFreshness === 'error' ? '安全证据加载失败' : '安全证据'
})

function requestClearEstop() {
  if (clearEstopLoading.value) return
  if (!canClearEstop.value) {
    ElMessage.error('需要 biz:workline:clear-estop 权限')
    return
  }
  emit('clearEstop')
}
</script>

<style scoped>
.workline-safety-panel {
  display: flex;
  overflow: hidden;
  border: 1px solid rgb(239, 68, 68, 0.34);
  border-radius: 8px;
  background: var(--runtime-surface, #111827);
}

.workline-safety-panel__status-bar {
  width: 4px;
  flex: 0 0 auto;
  background: #ef4444;
}

.workline-safety-panel__body {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 1fr) auto;
  gap: 18px;
  width: 100%;
  padding: 16px;
  align-items: start;
}

.workline-safety-panel__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.workline-safety-panel__title {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.workline-safety-panel__copy {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.workline-safety-panel__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  margin: 0;
}

.workline-safety-panel__fact {
  min-width: 0;
}

.workline-safety-panel__fact dt {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.workline-safety-panel__fact dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: var(--runtime-text-primary);
  font-size: 13px;
}

.workline-safety-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

@media (width <= 920px) {
  .workline-safety-panel__body {
    grid-template-columns: 1fr;
  }

  .workline-safety-panel__actions {
    min-width: 0;
  }
}
</style>
