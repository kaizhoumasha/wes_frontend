<template>
  <el-card shadow="never" class="device-health-hero">
    <div class="device-health-hero__header">
      <div class="device-health-hero__identity">
        <div class="device-health-hero__eyebrow-row">
          <div class="device-health-hero__eyebrow">设备健康</div>
          <span class="device-health-hero__code runtime-hero__code">{{ summary.device_code }}</span>
        </div>
        <div class="device-health-hero__title-row">
          <h2 class="device-health-hero__title">{{ summary.device_name }}</h2>
          <RuntimeStatusBadge :status="summary.device_status" pulse />
        </div>
        <p class="device-health-hero__meta">{{ summary.device_role }} · 角色序号 #{{ summary.role_index }}</p>
      </div>
    </div>

    <div class="device-health-hero__facts runtime-hero__facts">
      <div class="device-health-hero__fact runtime-hero__fact">
        <span>所属工作线</span>
        <strong>{{ summary.workline_name || '—' }}</strong>
      </div>
      <div class="device-health-hero__fact runtime-hero__fact">
        <span>最近心跳</span>
        <strong>{{ formatRuntimeDateTime(summary.last_heartbeat_at) }}</strong>
      </div>
      <div class="device-health-hero__fact device-health-hero__fact--signal runtime-hero__fact">
        <span>命令态势</span>
        <strong>当前 {{ summary.current_command_id || '—' }} · 未结 {{ summary.pending_command_count }}</strong>
      </div>
      <div class="device-health-hero__fact runtime-hero__fact">
        <span>最近回调</span>
        <strong>{{ formatRuntimeDateTime(summary.recent_callback_at) }}</strong>
      </div>
      <div class="device-health-hero__fact runtime-hero__fact">
        <span>维护模式</span>
        <strong>{{ summary.maintenance_mode ? 'ON' : 'OFF' }}</strong>
      </div>
      <div class="device-health-hero__fact runtime-hero__fact">
        <span>错误码</span>
        <strong>{{ summary.error_code || '—' }}</strong>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeDeviceSummary } from '@/types/runtime'
import { formatRuntimeDateTime } from '@/utils/runtime-display'

defineProps<{
  summary: RuntimeDeviceSummary
}>()
</script>

<style scoped>
.device-health-hero {
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgb(245, 158, 11, 0.12), transparent 32%),
    linear-gradient(180deg, rgb(30, 41, 59, 0.96), rgb(15, 23, 42, 0.94));
}

.device-health-hero :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}

.device-health-hero__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.device-health-hero__identity {
  min-width: 0;
}

.device-health-hero__eyebrow-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.device-health-hero__eyebrow,
.device-health-hero__fact span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.device-health-hero__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.device-health-hero__title {
  margin: 0;
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.device-health-hero__meta {
  margin: 8px 0 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

.device-health-hero__facts {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.device-health-hero__fact strong {
  display: block;
  margin-top: 6px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.device-health-hero__fact--signal strong {
  font-size: 14px;
}

@media (width <= 1279px) {
  .device-health-hero__title {
    font-size: 22px;
  }

  .device-health-hero__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .device-health-hero :deep(.el-card__body) {
    padding: 16px;
  }

  .device-health-hero__facts {
    grid-template-columns: 1fr;
  }
}
</style>
