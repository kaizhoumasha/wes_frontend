<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  workLinesApiMethods,
  type UpdateWorkLinesInput,
  type WorkLinesItem as Workline
} from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'
import {
  ROUGH_SORTER_DEVICE_ROLES,
  RoughSorterConfigSchema,
  createEmptyRoughSorterConfig,
  mergeRoughSorterConfig,
  readRoughSorterConfig,
  type RoughSorterConfig
} from '../config/roughSorterConfig'

const DEVICE_ROLE_LABELS: Record<(typeof ROUGH_SORTER_DEVICE_ROLES)[number], string> = {
  MEASUREMENT_DEVICE: '测量设备',
  TRANSFER_DEVICE: '输送设备',
  PLACEMENT_DEVICE: '放置设备'
}

const props = defineProps<{ workline: Workline | null }>()
const visible = defineModel<boolean>({ default: false })
const refresh = inject(CRUD_PAGE_REFRESH_KEY)
const { hasPermission } = usePermission()
const currentWorkline = ref<Workline | null>(null)
const form = ref<RoughSorterConfig>(createEmptyRoughSorterConfig())
const errors = ref<string[]>([])
const loading = ref(false)
const loadFailed = ref(false)
const submitting = ref(false)
let loadSequence = 0

const canUpdate = computed(() => hasPermission(BIZ_PERMISSIONS.workline.update))
const readonly = computed(() => currentWorkline.value?.is_active === true || !canUpdate.value)

function resetLoadState(): void {
  currentWorkline.value = null
  form.value = createEmptyRoughSorterConfig()
  errors.value = []
  loadFailed.value = false
}

async function loadLatest(): Promise<void> {
  const row = props.workline
  const sequence = ++loadSequence
  resetLoadState()
  if (!visible.value || !row) return
  loading.value = true
  try {
    const latest = await workLinesApiMethods.getById(row.id).send()
    if (sequence !== loadSequence) return
    currentWorkline.value = latest
    form.value = readRoughSorterConfig(latest.config)
  } catch {
    if (sequence !== loadSequence) return
    resetLoadState()
    loadFailed.value = true
    errors.value = [
      '粗分机配置加载失败或不符合当前合同；已阻止覆盖。开发/测试数据请清理后重新配置。'
    ]
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

async function submit(): Promise<void> {
  if (!currentWorkline.value || readonly.value || loadFailed.value || submitting.value) return
  const parsed = RoughSorterConfigSchema.safeParse(form.value)
  if (!parsed.success) {
    errors.value = parsed.error.issues.map(issue => issue.message)
    return
  }
  errors.value = []
  submitting.value = true
  try {
    const payload = {
      version: currentWorkline.value.version,
      config: mergeRoughSorterConfig(currentWorkline.value.config, parsed.data)
    } satisfies UpdateWorkLinesInput
    await workLinesApiMethods.update(currentWorkline.value.id, payload).send()
    visible.value = false
    ElMessage.success('粗分机配置保存成功')
    if (refresh) {
      try {
        await refresh()
      } catch {
        ElMessage.warning('保存成功，列表刷新失败，请手动刷新')
      }
    }
  } catch (error) {
    ElMessage.error(`保存粗分机配置失败：${getSafeErrorMessage(error)}`)
  } finally {
    submitting.value = false
  }
}

watch(
  [visible, () => props.workline?.id],
  ([isOpen]) => {
    if (isOpen) void loadLatest()
    else {
      ++loadSequence
      resetLoadState()
    }
  },
  { immediate: true }
)
</script>

<template>
  <StandardDialog
    v-model="visible"
    :title="`粗分机配置${currentWorkline ? `：${currentWorkline.line_name}` : ''}`"
    size="xl"
    confirm-text="保存配置"
    confirm-icon="lucide:save"
    :confirm-loading="submitting"
    :confirm-disabled="loading || loadFailed || readonly || !currentWorkline"
    @confirm="submit"
  >
    <div
      v-if="loading"
      class="rough-sorter-config__loading"
    >
      正在加载最新配置…
    </div>

    <ElAlert
      v-else-if="loadFailed"
      type="error"
      :closable="false"
      :title="errors[0]"
      show-icon
    />

    <ElForm
      v-else-if="currentWorkline"
      label-position="top"
      class="rough-sorter-config"
    >
      <ElAlert
        v-if="readonly"
        type="info"
        :closable="false"
        :title="
          currentWorkline.is_active ? '作业线已激活，配置只读。' : '当前账号无更新权限，配置只读。'
        "
        show-icon
      />

      <div
        v-if="errors.length > 0"
        data-testid="validation-errors"
        class="rough-sorter-config__errors"
      >
        <div
          v-for="error in errors"
          :key="error"
        >
          {{ error }}
        </div>
      </div>

      <section
        v-for="role in ROUGH_SORTER_DEVICE_ROLES"
        :key="role"
        class="rough-sorter-config__section"
      >
        <h3>{{ DEVICE_ROLE_LABELS[role] }}</h3>
        <div class="rough-sorter-config__grid">
          <ElFormItem label="ECS 合同版本">
            <ElInput
              v-model="form.device_contracts[role].ecs_version"
              :data-field="`${role}.ecs_version`"
              :disabled="readonly"
            />
          </ElFormItem>
          <ElFormItem label="网关合同版本">
            <ElInput
              v-model="form.device_contracts[role].gateway_version"
              :data-field="`${role}.gateway_version`"
              :disabled="readonly"
            />
          </ElFormItem>
          <ElFormItem label="设备型号">
            <ElInput
              v-model="form.device_contracts[role].device_model"
              :data-field="`${role}.device_model`"
              :disabled="readonly"
            />
          </ElFormItem>
          <ElFormItem label="固件版本">
            <ElInput
              v-model="form.device_contracts[role].firmware_version"
              :data-field="`${role}.firmware_version`"
              :disabled="readonly"
            />
          </ElFormItem>
          <ElFormItem label="状态最大时效（毫秒）">
            <ElInputNumber
              v-model="form.device_contracts[role].status_max_age_ms"
              :data-field="`${role}.status_max_age_ms`"
              :disabled="readonly"
              :min="1"
            />
          </ElFormItem>
          <ElFormItem label="命令超时（毫秒）">
            <ElInputNumber
              v-model="form.device_contracts[role].command_timeout_ms"
              :data-field="`${role}.command_timeout_ms`"
              :disabled="readonly"
              :min="1"
            />
          </ElFormItem>
          <ElFormItem label="时间源">
            <ElInput
              v-model="form.device_contracts[role].time_source"
              :data-field="`${role}.time_source`"
              :disabled="readonly"
            />
          </ElFormItem>
          <ElFormItem label="允许时钟偏差（毫秒）">
            <ElInputNumber
              v-model="form.device_contracts[role].allowed_clock_skew_ms"
              :data-field="`${role}.allowed_clock_skew_ms`"
              :disabled="readonly"
              :min="1"
            />
          </ElFormItem>
          <ElFormItem label="回调重试窗口（毫秒）">
            <ElInputNumber
              v-model="form.device_contracts[role].callback_retry_window_ms"
              :data-field="`${role}.callback_retry_window_ms`"
              :disabled="readonly"
              :min="1"
            />
          </ElFormItem>
          <ElFormItem label="证据保留天数">
            <ElInputNumber
              v-model="form.device_contracts[role].evidence_retention_days"
              :data-field="`${role}.evidence_retention_days`"
              :disabled="readonly"
              :min="1"
            />
          </ElFormItem>
        </div>
      </section>

      <section class="rough-sorter-config__section">
        <h3>位置绑定</h3>
        <div class="rough-sorter-config__grid">
          <ElFormItem label="测量位置">
            <ElInput
              v-model="form.position_bindings.MEASUREMENT_POSITION"
              data-field="MEASUREMENT_POSITION"
              :disabled="readonly"
              maxlength="120"
            />
          </ElFormItem>
          <ElFormItem label="管线入口">
            <ElInput
              v-model="form.position_bindings.PIPELINE_INLET"
              data-field="PIPELINE_INLET"
              :disabled="readonly"
              maxlength="120"
            />
          </ElFormItem>
          <ElFormItem label="管线出口">
            <ElInput
              v-model="form.position_bindings.PIPELINE_OUTLET"
              data-field="PIPELINE_OUTLET"
              :disabled="readonly"
              maxlength="120"
            />
          </ElFormItem>
          <ElFormItem label="NG 位置">
            <ElInput
              v-model="form.position_bindings.NG_POSITION"
              data-field="NG_POSITION"
              :disabled="readonly"
              maxlength="120"
            />
          </ElFormItem>
        </div>
      </section>
    </ElForm>
  </StandardDialog>
</template>

<style scoped>
.rough-sorter-config,
.rough-sorter-config__section {
  display: grid;
  gap: 16px;
}

.rough-sorter-config__section h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 15px;
}

.rough-sorter-config__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.rough-sorter-config__errors {
  padding: 12px 16px;
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: 6px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.rough-sorter-config__loading {
  padding: 40px 0;
  color: var(--el-text-color-secondary);
  text-align: center;
}

@media (width <= 768px) {
  .rough-sorter-config__grid {
    grid-template-columns: 1fr;
  }
}
</style>
