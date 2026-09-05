<script setup lang="ts">
import { ROUGH_SORTER_DEVICE_ROLES, type RoughSorterConfig } from '../config/roughSorterConfig'

defineProps<{ disabled: boolean }>()
const form = defineModel<RoughSorterConfig>({ required: true })

const DEVICE_ROLE_LABELS: Record<(typeof ROUGH_SORTER_DEVICE_ROLES)[number], string> = {
  MEASUREMENT_DEVICE: '测量设备',
  TRANSFER_DEVICE: '输送设备',
  PLACEMENT_DEVICE: '放置设备'
}
</script>

<template>
  <div class="rough-sorter-plugin-config">
    <section
      v-for="role in ROUGH_SORTER_DEVICE_ROLES"
      :key="role"
      class="rough-sorter-plugin-config__section"
    >
      <h4>{{ DEVICE_ROLE_LABELS[role] }}</h4>
      <div class="rough-sorter-plugin-config__grid">
        <ElFormItem label="ECS 合同版本">
          <ElInput
            v-model="form.device_contracts[role].ecs_version"
            :data-field="`${role}.ecs_version`"
            :disabled="disabled"
          />
        </ElFormItem>
        <ElFormItem label="网关合同版本">
          <ElInput
            v-model="form.device_contracts[role].gateway_version"
            :data-field="`${role}.gateway_version`"
            :disabled="disabled"
          />
        </ElFormItem>
        <ElFormItem label="设备型号">
          <ElInput
            v-model="form.device_contracts[role].device_model"
            :data-field="`${role}.device_model`"
            :disabled="disabled"
          />
        </ElFormItem>
        <ElFormItem label="固件版本">
          <ElInput
            v-model="form.device_contracts[role].firmware_version"
            :data-field="`${role}.firmware_version`"
            :disabled="disabled"
          />
        </ElFormItem>
        <ElFormItem label="状态最大时效（毫秒）">
          <ElInputNumber
            v-model="form.device_contracts[role].status_max_age_ms"
            :data-field="`${role}.status_max_age_ms`"
            :disabled="disabled"
            :min="1"
          />
        </ElFormItem>
        <ElFormItem label="命令超时（毫秒）">
          <ElInputNumber
            v-model="form.device_contracts[role].command_timeout_ms"
            :data-field="`${role}.command_timeout_ms`"
            :disabled="disabled"
            :min="1"
          />
        </ElFormItem>
        <ElFormItem label="时间源">
          <ElInput
            v-model="form.device_contracts[role].time_source"
            :data-field="`${role}.time_source`"
            :disabled="disabled"
          />
        </ElFormItem>
        <ElFormItem label="允许时钟偏差（毫秒）">
          <ElInputNumber
            v-model="form.device_contracts[role].allowed_clock_skew_ms"
            :data-field="`${role}.allowed_clock_skew_ms`"
            :disabled="disabled"
            :min="1"
          />
        </ElFormItem>
        <ElFormItem label="回调重试窗口（毫秒）">
          <ElInputNumber
            v-model="form.device_contracts[role].callback_retry_window_ms"
            :data-field="`${role}.callback_retry_window_ms`"
            :disabled="disabled"
            :min="1"
          />
        </ElFormItem>
        <ElFormItem label="证据保留天数">
          <ElInputNumber
            v-model="form.device_contracts[role].evidence_retention_days"
            :data-field="`${role}.evidence_retention_days`"
            :disabled="disabled"
            :min="1"
          />
        </ElFormItem>
      </div>
    </section>

    <section class="rough-sorter-plugin-config__section">
      <h4>位置绑定</h4>
      <div class="rough-sorter-plugin-config__grid">
        <ElFormItem label="测量位置">
          <ElInput
            v-model="form.position_bindings.MEASUREMENT_POSITION"
            data-field="MEASUREMENT_POSITION"
            :disabled="disabled"
            maxlength="120"
          />
        </ElFormItem>
        <ElFormItem label="管线入口">
          <ElInput
            v-model="form.position_bindings.PIPELINE_INLET"
            data-field="PIPELINE_INLET"
            :disabled="disabled"
            maxlength="120"
          />
        </ElFormItem>
        <ElFormItem label="管线出口">
          <ElInput
            v-model="form.position_bindings.PIPELINE_OUTLET"
            data-field="PIPELINE_OUTLET"
            :disabled="disabled"
            maxlength="120"
          />
        </ElFormItem>
        <ElFormItem label="NG 位置">
          <ElInput
            v-model="form.position_bindings.NG_POSITION"
            data-field="NG_POSITION"
            :disabled="disabled"
            maxlength="120"
          />
        </ElFormItem>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rough-sorter-plugin-config,
.rough-sorter-plugin-config__section {
  display: grid;
  gap: var(--spacing-md);
}

.rough-sorter-plugin-config__section h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.rough-sorter-plugin-config__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm) var(--spacing-lg);
}

@media (width <= 768px) {
  .rough-sorter-plugin-config__grid {
    grid-template-columns: 1fr;
  }
}
</style>
