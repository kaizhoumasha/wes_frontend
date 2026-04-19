<template>
  <el-card shadow="never" class="workline-health-hero">
    <div class="workline-health-hero__top">
      <div>
        <div class="workline-health-hero__eyebrow">线体摘要</div>
        <div class="workline-health-hero__title-row">
          <h2 class="workline-health-hero__title">{{ summary.line_name }}</h2>
          <RuntimeStatusBadge :label="heroStatusLabel" :tone="heroTone" pulse />
        </div>
        <p class="workline-health-hero__meta">{{ summary.line_code }} · {{ summary.zone_name || '未配置区域' }} · {{ summary.line_type }}</p>
      </div>

      <div class="workline-health-hero__support">
        <div class="workline-health-hero__support-item">
          <span>插件 / 契约</span>
          <strong>{{ summary.plugin_key || '—' }} / {{ summary.contract_version || '—' }}</strong>
        </div>
        <div class="workline-health-hero__support-item">
          <span>Owner / Support</span>
          <strong>{{ summary.owner_team || '—' }} / {{ summary.support_contact || '—' }}</strong>
        </div>
      </div>
    </div>

    <div class="workline-health-hero__stats">
      <div class="workline-health-hero__stat">
        <span>设备数</span>
        <strong>{{ summary.device_count }}</strong>
      </div>
      <div class="workline-health-hero__stat">
        <span>活跃 Session</span>
        <strong>{{ summary.active_session_count }}</strong>
      </div>
      <div class="workline-health-hero__stat">
        <span>等待 Session</span>
        <strong>{{ summary.waiting_session_count }}</strong>
      </div>
      <div class="workline-health-hero__stat">
        <span>失败链路</span>
        <strong>{{ summary.failed_session_count }}</strong>
      </div>
      <div class="workline-health-hero__stat">
        <span>离线设备</span>
        <strong>{{ summary.offline_device_count }}</strong>
      </div>
      <div class="workline-health-hero__stat">
        <span>异常设备</span>
        <strong>{{ summary.error_device_count }}</strong>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeWorklineSummary } from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'

const props = defineProps<{
  summary: RuntimeWorklineSummary
}>()

const heroTone = computed<RuntimeTone>(() => {
  if (props.summary.failed_session_count > 0 || props.summary.offline_device_count > 0 || props.summary.error_device_count > 0) {
    return 'danger'
  }

  if (props.summary.waiting_session_count > 0 || props.summary.maintenance_device_count > 0) {
    return 'warning'
  }

  if (props.summary.active_session_count > 0) {
    return 'primary'
  }

  return 'success'
})

const heroStatusLabel = computed(() => {
  if (heroTone.value === 'danger') return '存在阻塞'
  if (heroTone.value === 'warning') return '有等待风险'
  if (heroTone.value === 'primary') return '运行中'
  return '稳定'
})
</script>

<style scoped>
.workline-health-hero {
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgb(245, 158, 11, 0.12), transparent 32%),
    linear-gradient(180deg, rgb(30, 41, 59, 0.96), rgb(15, 23, 42, 0.94));
}

.workline-health-hero__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.workline-health-hero__eyebrow,
.workline-health-hero__support-item span,
.workline-health-hero__stat span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workline-health-hero__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.workline-health-hero__title {
  margin: 0;
  color: #f8fafc;
  font-size: 28px;
  font-weight: 700;
}

.workline-health-hero__meta {
  margin-top: 10px;
  color: #cbd5e1;
}

.workline-health-hero__support {
  display: grid;
  gap: 12px;
  min-width: 320px;
}

.workline-health-hero__support-item,
.workline-health-hero__stat {
  padding: 14px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 12px;
  background: rgb(15, 23, 42, 0.5);
}

.workline-health-hero__support-item strong,
.workline-health-hero__stat strong {
  display: block;
  margin-top: 8px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 14px;
}

.workline-health-hero__stats {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

@media (width <= 1279px) {
  .workline-health-hero__top {
    flex-direction: column;
  }

  .workline-health-hero__support,
  .workline-health-hero__stats {
    width: 100%;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
