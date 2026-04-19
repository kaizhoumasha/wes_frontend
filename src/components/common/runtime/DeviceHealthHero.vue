<template>
  <el-card shadow="never" class="device-health-hero">
    <div class="device-health-hero__top">
      <div>
        <div class="device-health-hero__eyebrow">设备健康</div>
        <div class="device-health-hero__title-row">
          <h2 class="device-health-hero__title">{{ summary.device_name }}</h2>
          <RuntimeStatusBadge :status="summary.device_status" pulse />
        </div>
        <p class="device-health-hero__meta">{{ summary.device_code }} · {{ summary.device_role }} · #{{ summary.role_index }}</p>
      </div>

      <div class="device-health-hero__support">
        <div class="device-health-hero__support-item">
          <span>所属工作线</span>
          <strong>{{ summary.workline_name || '—' }}</strong>
        </div>
        <div class="device-health-hero__support-item">
          <span>最近心跳</span>
          <strong>{{ formatRuntimeDateTime(summary.last_heartbeat_at) }}</strong>
        </div>
      </div>
    </div>

    <div class="device-health-hero__stats">
      <div class="device-health-hero__stat">
        <span>未结命令</span>
        <strong>{{ summary.pending_command_count }}</strong>
      </div>
      <div class="device-health-hero__stat">
        <span>最近回调</span>
        <strong>{{ formatRuntimeDateTime(summary.recent_callback_at) }}</strong>
      </div>
      <div class="device-health-hero__stat">
        <span>维护模式</span>
        <strong>{{ summary.maintenance_mode ? 'ON' : 'OFF' }}</strong>
      </div>
      <div class="device-health-hero__stat">
        <span>当前命令</span>
        <strong>{{ summary.current_command_id || '—' }}</strong>
      </div>
      <div class="device-health-hero__stat">
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

.device-health-hero__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.device-health-hero__eyebrow,
.device-health-hero__support-item span,
.device-health-hero__stat span {
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
  margin-top: 10px;
  flex-wrap: wrap;
}

.device-health-hero__title {
  margin: 0;
  color: #f8fafc;
  font-size: 28px;
  font-weight: 700;
}

.device-health-hero__meta {
  margin-top: 10px;
  color: #cbd5e1;
}

.device-health-hero__support {
  display: grid;
  gap: 12px;
  min-width: 320px;
}

.device-health-hero__support-item,
.device-health-hero__stat {
  padding: 14px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 12px;
  background: rgb(15, 23, 42, 0.5);
}

.device-health-hero__support-item strong,
.device-health-hero__stat strong {
  display: block;
  margin-top: 8px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
}

.device-health-hero__stats {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

@media (width <= 1279px) {
  .device-health-hero__top {
    flex-direction: column;
  }

  .device-health-hero__support,
  .device-health-hero__stats {
    width: 100%;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
