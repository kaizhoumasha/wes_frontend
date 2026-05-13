<template>
  <el-card
    shadow="never"
    class="workline-health-hero"
  >
    <div class="workline-health-hero__header">
      <div class="workline-health-hero__identity">
        <div class="workline-health-hero__eyebrow-row runtime-hero__eyebrow-row">
          <div class="workline-health-hero__eyebrow">线体摘要</div>
          <span class="workline-health-hero__run-mode-badge">{{ summary.run_mode }}</span>
          <span class="workline-health-hero__code runtime-hero__code">{{ summary.line_code }}</span>
        </div>
        <div class="workline-health-hero__title-row runtime-hero__title-row">
          <h2 class="workline-health-hero__title">{{ summary.line_name }}</h2>
          <RuntimeStatusBadge
            :label="heroStatusLabel"
            :tone="heroTone"
            pulse
          />
        </div>
        <p class="workline-health-hero__meta">
          {{ summary.zone_name || '未配置区域' }} · {{ summary.line_type || '未配置线型' }}
        </p>
      </div>
    </div>

    <div class="workline-health-hero__facts runtime-hero__facts">
      <div class="workline-health-hero__fact runtime-hero__fact">
        <span>插件 / 契约</span>
        <strong>{{ summary.plugin_key || '—' }} / {{ summary.contract_version || '—' }}</strong>
      </div>
      <div class="workline-health-hero__fact workline-health-hero__fact--signal runtime-hero__fact">
        <span>设备态势</span>
        <strong>
          总 {{ summary.device_count }} · 异常 {{ summary.error_device_count }} · 维护
          {{ summary.maintenance_device_count }}
        </strong>
      </div>
      <div class="workline-health-hero__fact runtime-hero__fact">
        <span>会话态势</span>
        <strong>
          活跃 {{ summary.active_session_count }} · 等待 {{ summary.waiting_session_count }}
        </strong>
      </div>
      <div class="workline-health-hero__fact runtime-hero__fact">
        <span>阻塞指标</span>
        <strong>
          失败 {{ summary.failed_session_count }} · 离线 {{ summary.offline_device_count }}
        </strong>
      </div>
      <div class="workline-health-hero__fact runtime-hero__fact">
        <span>运行结论</span>
        <strong>{{ heroStatusLabel }}</strong>
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
  if (
    props.summary.failed_session_count > 0 ||
    props.summary.offline_device_count > 0 ||
    props.summary.error_device_count > 0
  ) {
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

.workline-health-hero :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}

.workline-health-hero__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.workline-health-hero__identity {
  min-width: 0;
}

.workline-health-hero__eyebrow,
.workline-health-hero__fact span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workline-health-hero__run-mode-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.15);
  color: rgb(245, 158, 11);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.workline-health-hero__title {
  margin: 0;
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.workline-health-hero__meta {
  margin: 8px 0 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

.workline-health-hero__facts {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.workline-health-hero__fact strong {
  display: block;
  margin-top: 6px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.workline-health-hero__fact--signal strong {
  font-size: 14px;
}

@media (width <= 1279px) {
  .workline-health-hero__title {
    font-size: 22px;
  }

  .workline-health-hero__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .workline-health-hero :deep(.el-card__body) {
    padding: 16px;
  }

  .workline-health-hero__facts {
    grid-template-columns: 1fr;
  }
}
</style>
