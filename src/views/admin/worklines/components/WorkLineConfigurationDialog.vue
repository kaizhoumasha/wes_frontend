<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createSoftDeleteCrudRequestAdapterFromMethods,
  type PaginationData,
  type QueryOptionsInput
} from '@/api/base/crud-request-adapter'
import {
  devicesApiMethods,
  type CreateDevicesInput,
  type DevicesItem,
  type UpdateDevicesInput
} from '@/api/modules/devices'
import {
  workLinesApiMethods,
  type AvailablePluginsResult,
  type ConfigurationStatusResult,
  type WorkLinesItem as Workline
} from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'
import { getWorkLinePluginConfigDefinition } from '../config/pluginConfigCatalog'

const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const refresh = inject(CRUD_PAGE_REFRESH_KEY)
const { hasPermission } = usePermission()

const deviceAdapter = createSoftDeleteCrudRequestAdapterFromMethods<
  DevicesItem,
  CreateDevicesInput,
  UpdateDevicesInput
>(devicesApiMethods)

const sessionVisible = ref(false)
const currentWorkline = ref<Workline | null>(null)
const plugins = ref<AvailablePluginsResult>([])
const configurationStatus = ref<ConfigurationStatusResult | null>(null)
const devices = ref<DevicesItem[]>([])
const selectedDeviceCodes = ref<string[]>([])
const pluginKey = ref('')
const pluginConfigValue = ref<unknown>(null)
const validationErrors = ref<string[]>([])
const loadError = ref('')
const deactivationError = ref('')
const loading = ref(false)
const submitting = ref(false)
const deactivating = ref(false)
let loadSequence = 0

const canConfigure = computed(() => hasPermission(BIZ_PERMISSIONS.workline.configure))
const canDeactivate = computed(() => hasPermission(BIZ_PERMISSIONS.workline.deactivate))
const activePluginDefinition = computed(() =>
  getWorkLinePluginConfigDefinition(pluginKey.value || null)
)
const selectedPluginSummary = computed(() =>
  plugins.value.find(plugin => plugin.plugin_key === pluginKey.value)
)
const selectedDeviceCodeSet = computed(() => new Set(selectedDeviceCodes.value))
const readonly = computed(() => currentWorkline.value?.is_active === true || !canConfigure.value)
const formDisabled = computed(() => readonly.value || submitting.value || deactivating.value)
const hasUnsupportedPluginEditor = computed(
  () => pluginKey.value !== '' && activePluginDefinition.value === null
)
const hasUnavailableSelectedPlugin = computed(
  () => pluginKey.value !== '' && selectedPluginSummary.value === undefined
)
const confirmDisabled = computed(
  () =>
    loading.value ||
    submitting.value ||
    deactivating.value ||
    readonly.value ||
    !currentWorkline.value ||
    Boolean(loadError.value) ||
    hasUnavailableSelectedPlugin.value ||
    hasUnsupportedPluginEditor.value
)
const dialogVisible = computed({
  get: () => sessionVisible.value,
  set: value => {
    if (!value && (submitting.value || deactivating.value)) return
    sessionVisible.value = value
    if (modelValue.value !== value) modelValue.value = value
  }
})

function resetState(): void {
  currentWorkline.value = null
  plugins.value = []
  configurationStatus.value = null
  devices.value = []
  selectedDeviceCodes.value = []
  pluginKey.value = ''
  pluginConfigValue.value = null
  validationErrors.value = []
  loadError.value = ''
  deactivationError.value = ''
}

async function fetchAllDevices(): Promise<DevicesItem[]> {
  const items: DevicesItem[] = []
  const limit = 100
  let offset = 0
  let total: number
  do {
    const options: QueryOptionsInput = {
      offset,
      limit,
      sort: [
        { field: 'device_role', order: 'asc' },
        { field: 'role_index', order: 'asc' },
        { field: 'device_code', order: 'asc' }
      ]
    }
    const page: PaginationData<DevicesItem> = await deviceAdapter.query(options)
    items.push(...page.items)
    total = page.total
    if (page.items.length === 0 && items.length < total) {
      throw new Error('设备列表分页未返回剩余数据')
    }
    offset += page.items.length
  } while (items.length < total)
  return items
}

function initializePluginConfig(latest: Workline): void {
  pluginKey.value = latest.plugin_key ?? ''
  const definition = getWorkLinePluginConfigDefinition(latest.plugin_key ?? null)
  pluginConfigValue.value = definition ? definition.read(latest.config ?? {}) : null
}

async function loadLatest(row: Workline): Promise<void> {
  const sequence = ++loadSequence
  resetState()
  if (!sessionVisible.value) return
  loading.value = true
  try {
    const [latest, availablePlugins, status, allDevices] = await Promise.all([
      workLinesApiMethods.getById(row.id).send(),
      workLinesApiMethods.availablePlugins({ id: row.id }).send(),
      workLinesApiMethods.configurationStatus({ id: row.id }).send(),
      fetchAllDevices()
    ])
    if (sequence !== loadSequence) return
    currentWorkline.value = latest
    plugins.value = availablePlugins
    configurationStatus.value = status
    devices.value = allDevices
    selectedDeviceCodes.value = allDevices
      .filter(device => device.work_line_id === latest.id)
      .map(device => device.device_code)
    initializePluginConfig(latest)
  } catch (error) {
    if (sequence !== loadSequence) return
    resetState()
    loadError.value = `工作线业务装配加载失败：${getSafeErrorMessage(error)}`
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

function selectPlugin(value: string | null | undefined): void {
  pluginKey.value = value ?? ''
  validationErrors.value = []
  if (!pluginKey.value) {
    pluginConfigValue.value = null
    return
  }
  const definition = getWorkLinePluginConfigDefinition(pluginKey.value)
  pluginConfigValue.value = definition?.read(currentWorkline.value?.config ?? {}) ?? null
}

function isOwnedByOtherWorkline(device: DevicesItem): boolean {
  return device.work_line_id != null && device.work_line_id !== currentWorkline.value?.id
}

function toggleDevice(deviceCode: string, checked: boolean): void {
  if (checked) {
    if (!selectedDeviceCodes.value.includes(deviceCode)) {
      selectedDeviceCodes.value.push(deviceCode)
    }
    return
  }
  selectedDeviceCodes.value = selectedDeviceCodes.value.filter(code => code !== deviceCode)
}

function checkLabel(code: string): string {
  const labels: Record<string, string> = {
    PLUGIN_SELECTED: '已选择业务插件',
    PLUGIN_INSTALLED: '业务插件已安装',
    PLUGIN_CONFIGURATION_COMPATIBLE: '插件配置与设备兼容',
    RUN_MODE_SUPPORTED: '运行模式有效',
    RUNTIME_CONFIG_VALID: '运行配置有效'
  }
  return labels[code] ?? code
}

function checkDetail(check: NonNullable<ConfigurationStatusResult['checks']>[number]): string {
  const reasons = check.context?.reasons
  return Array.isArray(reasons) ? reasons.map(String).join('；') : ''
}

async function refreshList(): Promise<void> {
  if (!refresh) return
  try {
    await refresh()
  } catch {
    ElMessage.warning('操作成功，列表刷新失败，请手动刷新')
  }
}

async function submit(): Promise<void> {
  const workline = currentWorkline.value
  if (!workline || confirmDisabled.value) return

  validationErrors.value = []
  let config: Record<string, unknown> = {}
  if (pluginKey.value) {
    const definition = activePluginDefinition.value
    if (!definition) return
    validationErrors.value = definition.validate(pluginConfigValue.value)
    if (validationErrors.value.length > 0) return
    config = definition.write(workline.config ?? {}, pluginConfigValue.value)
  }

  submitting.value = true
  try {
    await workLinesApiMethods
      .configuration(
        { id: workline.id },
        {
          version: workline.version,
          plugin_key: pluginKey.value || null,
          config,
          device_codes: [...selectedDeviceCodes.value].sort()
        }
      )
      .send()
  } catch (error) {
    ElMessage.error(`保存业务装配失败：${getSafeErrorMessage(error)}`)
    return
  } finally {
    submitting.value = false
  }

  dialogVisible.value = false
  ElMessage.success('工作线业务装配保存成功')
  await refreshList()
}

async function deactivate(): Promise<void> {
  const workline = currentWorkline.value
  if (!workline?.is_active || !canDeactivate.value || deactivating.value) return
  try {
    await ElMessageBox.confirm(
      `确认停用“${workline.line_name}”？系统会再次检查 Transport、BinExecution、MaterialExecution 等未结束任务。`,
      '停用工作线',
      { confirmButtonText: '确认停用', cancelButtonText: '取消', type: 'warning' }
    )
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    throw error
  }

  deactivating.value = true
  deactivationError.value = ''
  try {
    const updated = await workLinesApiMethods
      .deactivate({ id: workline.id }, { version: workline.version })
      .send()
    ElMessage.success('工作线已停用，可以修改业务装配')
    await loadLatest(updated)
    await refreshList()
  } catch (error) {
    deactivationError.value = getSafeErrorMessage(error)
    ElMessage.error(`停用工作线失败：${deactivationError.value}`)
  } finally {
    deactivating.value = false
  }
}

watch(
  modelValue,
  isOpen => {
    if (!isOpen && (submitting.value || deactivating.value)) return
    sessionVisible.value = isOpen
  },
  { immediate: true }
)

watch(
  sessionVisible,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen && props.workline) void loadLatest(props.workline)
    else if (!isOpen && wasOpen) {
      ++loadSequence
      resetState()
    }
  },
  { immediate: true }
)
</script>

<template>
  <StandardDialog
    v-model="dialogVisible"
    :title="`业务装配${currentWorkline ? `：${currentWorkline.line_name}` : ''}`"
    size="xl"
    confirm-text="保存装配"
    confirm-icon="lucide:save"
    :closable="!submitting && !deactivating"
    :hide-cancel="submitting || deactivating"
    :confirm-loading="submitting"
    :confirm-disabled="confirmDisabled"
    @confirm="submit"
  >
    <div
      v-if="loading"
      class="workline-configuration__loading"
    >
      正在加载最新配置…
    </div>

    <ElAlert
      v-else-if="loadError"
      type="error"
      :closable="false"
      :title="loadError"
      show-icon
    />

    <ElForm
      v-else-if="currentWorkline"
      label-position="top"
      class="workline-configuration"
    >
      <section class="workline-configuration__section">
        <div class="workline-configuration__section-heading">
          <div>
            <h3>工作线状态</h3>
            <p>{{ currentWorkline.line_code }} · {{ currentWorkline.line_type }}</p>
          </div>
          <div class="workline-configuration__status-actions">
            <ElTag :type="currentWorkline.is_active ? 'success' : 'info'">
              {{ currentWorkline.is_active ? '已启用' : '已停用' }}
            </ElTag>
            <ElButton
              v-if="currentWorkline.is_active && canDeactivate"
              type="warning"
              :loading="deactivating"
              @click="deactivate"
            >
              停用工作线
            </ElButton>
          </div>
        </div>
        <ElAlert
          v-if="currentWorkline.is_active"
          type="info"
          :closable="false"
          title="已启用工作线只读；停用成功后才能更换插件或设备。"
          show-icon
        />
        <ElAlert
          v-if="deactivationError"
          type="error"
          :closable="false"
          :title="`停用被阻止：${deactivationError}`"
          show-icon
        />
        <div
          v-if="configurationStatus"
          class="workline-configuration__checks"
        >
          <div
            v-for="check in configurationStatus.checks"
            :key="check.code"
            class="workline-configuration__check"
          >
            <ElTag
              :type="
                check.status === 'PASS'
                  ? 'success'
                  : check.severity === 'BLOCKER'
                    ? 'danger'
                    : 'warning'
              "
            >
              {{ check.status }}
            </ElTag>
            <span>{{ checkLabel(check.code) }}</span>
            <small v-if="checkDetail(check)">{{ checkDetail(check) }}</small>
          </div>
        </div>
      </section>

      <section class="workline-configuration__section">
        <div class="workline-configuration__section-heading">
          <div>
            <h3>设备全集</h3>
            <p>设备归属只在此处维护；已属于其他工作线的设备不可选择。</p>
          </div>
          <ElTag type="info">已选 {{ selectedDeviceCodes.length }} 台</ElTag>
        </div>
        <div class="workline-configuration__device-table-wrap">
          <table class="workline-configuration__device-table">
            <thead>
              <tr>
                <th>选择</th>
                <th>角色</th>
                <th>设备编码</th>
                <th>设备名称</th>
                <th>当前归属</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="device in devices"
                :key="device.id"
              >
                <td>
                  <ElCheckbox
                    :model-value="selectedDeviceCodeSet.has(device.device_code)"
                    :disabled="formDisabled || isOwnedByOtherWorkline(device)"
                    :aria-label="`选择设备 ${device.device_code}`"
                    @change="toggleDevice(device.device_code, Boolean($event))"
                  />
                </td>
                <td>{{ device.device_role }}</td>
                <td>{{ device.device_code }}</td>
                <td>{{ device.device_name }}</td>
                <td>
                  {{
                    device.work_line_id == null
                      ? '未分配'
                      : device.work_line_id === currentWorkline.id
                        ? '当前工作线'
                        : `工作线 #${device.work_line_id}`
                  }}
                </td>
              </tr>
              <tr v-if="devices.length === 0">
                <td
                  colspan="5"
                  class="workline-configuration__empty"
                >
                  暂无可用设备
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="workline-configuration__section">
        <div class="workline-configuration__section-heading">
          <div>
            <h3>业务插件</h3>
            <p>可在停用且无未结束任务时切换。</p>
          </div>
        </div>
        <ElFormItem label="业务插件">
          <ElSelect
            :model-value="pluginKey"
            :disabled="formDisabled"
            placeholder="请选择业务插件"
            clearable
            @change="selectPlugin"
          >
            <ElOption
              v-for="plugin in plugins"
              :key="plugin.plugin_key"
              :label="`${plugin.display_name} (${plugin.plugin_version})`"
              :value="plugin.plugin_key"
            />
          </ElSelect>
        </ElFormItem>
        <ElAlert
          v-if="hasUnavailableSelectedPlugin"
          type="error"
          :closable="false"
          title="当前业务插件未包含在部署清单中，已阻止保存。请先选择当前部署提供的插件。"
          show-icon
        />
        <ElAlert
          v-else-if="hasUnsupportedPluginEditor"
          type="error"
          :closable="false"
          title="该部署插件尚无对应的前端配置表单，已阻止保存。"
          show-icon
        />
        <ElAlert
          v-else-if="selectedPluginSummary && !selectedPluginSummary.compatible"
          type="warning"
          :closable="false"
          :title="`当前已保存设备不兼容：${selectedPluginSummary.incompatibility_reasons.join('；')}。修改设备全集后可一起保存，服务端会按新装配重新校验。`"
          show-icon
        />
        <div
          v-if="validationErrors.length"
          data-testid="validation-errors"
          class="workline-configuration__errors"
        >
          <div
            v-for="error in validationErrors"
            :key="error"
          >
            {{ error }}
          </div>
        </div>
        <component
          :is="activePluginDefinition.component"
          v-if="activePluginDefinition"
          v-model="pluginConfigValue"
          :disabled="formDisabled"
        />
      </section>
    </ElForm>
  </StandardDialog>
</template>

<style scoped>
.workline-configuration,
.workline-configuration__section {
  display: grid;
  gap: var(--spacing-md);
}

.workline-configuration__section {
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg-container);
}

.workline-configuration__section-heading,
.workline-configuration__status-actions,
.workline-configuration__check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.workline-configuration__section-heading h3,
.workline-configuration__section-heading p {
  margin: 0;
}

.workline-configuration__section-heading p,
.workline-configuration__check small {
  color: var(--color-text-secondary);
}

.workline-configuration__checks {
  display: grid;
  gap: var(--spacing-xs);
}

.workline-configuration__device-table-wrap {
  max-height: 280px;
  overflow: auto;
}

.workline-configuration__device-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.workline-configuration__device-table th,
.workline-configuration__device-table td {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-lighter);
  text-align: left;
  white-space: nowrap;
}

.workline-configuration__device-table th {
  position: sticky;
  z-index: 1;
  top: 0;
  color: var(--color-text-secondary);
  background: var(--color-bg-container);
}

.workline-configuration__device-table td.workline-configuration__empty {
  color: var(--color-text-secondary);
  text-align: center;
}

.workline-configuration__check {
  justify-content: flex-start;
}

.workline-configuration__errors {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  background: var(--color-danger-light-9);
}

.workline-configuration__loading {
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  text-align: center;
}

@media (width <= 768px) {
  .workline-configuration__section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
