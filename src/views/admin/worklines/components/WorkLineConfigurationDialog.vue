<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DevicesItem } from '@/api/modules/devices'
import { fetchWorkLineDevices } from './fetchWorkLineDevices'
import {
  workLinesApiMethods,
  type AvailablePluginsResult,
  type BaseConfigurationResult,
  type ConfigurationStatusResult,
  type WorkLinesItem as Workline
} from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'

const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const refresh = inject(CRUD_PAGE_REFRESH_KEY)
const { hasPermission } = usePermission()

const sessionVisible = ref(false)
const currentWorkline = ref<Workline | null>(null)
const plugins = ref<AvailablePluginsResult>([])
const configurationStatus = ref<ConfigurationStatusResult | null>(null)
const devices = ref<DevicesItem[]>([])
const positions = ref<BaseConfigurationResult['positions']>([])
const positionBindings = ref<Record<string, string>>({})
const savedDraft = ref('')
const pluginKey = ref('')
const deviceBindings = ref<Record<string, string>>({})
const validationErrors = ref<string[]>([])
const loadError = ref('')
const deactivationError = ref('')
const loading = ref(false)
const submitting = ref(false)
const deactivating = ref(false)
let loadSequence = 0

const canConfigure = computed(() => hasPermission(BIZ_PERMISSIONS.workline.configure))
const canDeactivate = computed(() => hasPermission(BIZ_PERMISSIONS.workline.deactivate))
const selectedPluginSummary = computed(() =>
  plugins.value.find(plugin => plugin.plugin_key === pluginKey.value)
)
const deviceRoles = computed(() => selectedPluginSummary.value?.device_roles ?? [])
const positionSlots = computed(() => selectedPluginSummary.value?.position_slots ?? [])
const draftSnapshot = computed(() =>
  JSON.stringify({
    plugin: pluginKey.value,
    positions: Object.entries(positionBindings.value).sort(([left], [right]) =>
      left.localeCompare(right)
    ),
    bindings: Object.entries(deviceBindings.value).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  })
)
const isDirty = computed(() => savedDraft.value !== '' && draftSnapshot.value !== savedDraft.value)
const readonly = computed(() => currentWorkline.value?.is_active === true || !canConfigure.value)
const formDisabled = computed(() => readonly.value || submitting.value || deactivating.value)
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
    hasUnavailableSelectedPlugin.value
)
const dialogVisible = computed({
  get: () => sessionVisible.value,
  set: value => {
    if (!value && (submitting.value || deactivating.value)) return
    if (!value && isDirty.value) {
      void discardAndClose()
      return
    }
    sessionVisible.value = value
    if (modelValue.value !== value) modelValue.value = value
  }
})

async function discardAndClose(): Promise<void> {
  try {
    await ElMessageBox.confirm('插件关联尚未保存，确认放弃修改？', '未保存的修改', {
      confirmButtonText: '放弃修改',
      cancelButtonText: '继续编辑',
      type: 'warning'
    })
    sessionVisible.value = false
    modelValue.value = false
  } catch {
    /* 取消后保留草稿。 */
  }
}

function resetState(): void {
  currentWorkline.value = null
  plugins.value = []
  configurationStatus.value = null
  devices.value = []
  positions.value = []
  positionBindings.value = {}
  savedDraft.value = ''
  pluginKey.value = ''
  deviceBindings.value = {}
  validationErrors.value = []
  loadError.value = ''
  deactivationError.value = ''
}

function initializeBindings(latest: Workline): void {
  pluginKey.value = latest.plugin_key ?? ''
  const rawPositions =
    latest.config?.position_bindings === undefined ? {} : latest.config.position_bindings
  if (rawPositions === null || typeof rawPositions !== 'object' || Array.isArray(rawPositions))
    throw new Error('工作位绑定必须为对象')
  const slots = new Set(positionSlots.value.map(slot => slot.slot_key))
  positionBindings.value = {}
  for (const [key, value] of Object.entries(rawPositions)) {
    if (!slots.has(key)) throw new Error(`未知工作位插槽：${key}`)
    if (value === null) continue
    if (typeof value !== 'string' || !value.trim())
      throw new Error('工作位绑定必须包含有效工作位编码')
    positionBindings.value[key] = value
  }
  const bindings = latest.config?.device_bindings
  if (bindings === undefined) {
    deviceBindings.value = {}
    return
  }
  if (bindings === null || typeof bindings !== 'object' || Array.isArray(bindings)) {
    throw new Error('设备角色绑定必须为对象')
  }
  const roles = new Set(deviceRoles.value.map(role => role.role_key))
  for (const role of Object.keys(bindings)) {
    if (!roles.has(role)) throw new Error(`未知设备角色：${role}`)
  }
  const entries = Object.entries(bindings).filter(([, code]) => code !== null)
  if (entries.some(([, code]) => typeof code !== 'string' || !code.trim())) {
    throw new Error('设备角色绑定必须包含有效设备编码')
  }
  deviceBindings.value = Object.fromEntries(entries) as Record<string, string>
}

async function loadLatest(row: Workline): Promise<void> {
  const sequence = ++loadSequence
  resetState()
  if (!sessionVisible.value) return
  loading.value = true
  try {
    const [latest, availablePlugins, status, allDevices, base] = await Promise.all([
      workLinesApiMethods.getById(row.id).send(),
      workLinesApiMethods.availablePlugins({ id: row.id }).send(),
      workLinesApiMethods.configurationStatus({ id: row.id }).send(),
      fetchWorkLineDevices(),
      workLinesApiMethods.baseConfiguration({ id: row.id }).send()
    ])
    if (sequence !== loadSequence) return
    if (base.version !== latest.version) throw new Error('配置已变化，请重新打开后编辑')
    positions.value = base.positions
    currentWorkline.value = latest
    plugins.value = availablePlugins
    configurationStatus.value = status
    devices.value = allDevices.filter(device => device.work_line_id === latest.id)
    initializeBindings(latest)
    savedDraft.value = draftSnapshot.value
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
  deviceBindings.value = {}
  positionBindings.value = {}
  validationErrors.value = []
}

function bindDevice(roleKey: string, code: string | null | undefined): void {
  if (!code) delete deviceBindings.value[roleKey]
  else deviceBindings.value = { ...deviceBindings.value, [roleKey]: code }
}

function bindPosition(key: string, code: string | null | undefined): void {
  if (!code) delete positionBindings.value[key]
  else positionBindings.value = { ...positionBindings.value, [key]: code }
}

function matchingPosition(
  position: BaseConfigurationResult['positions'][number],
  slot: NonNullable<AvailablePluginsResult[number]['position_slots']>[number]
): boolean {
  return (
    position.enabled !== false &&
    position.position_type === slot.position_type &&
    (!slot.allowed_rack_kind || position.allowed_rack_kind === slot.allowed_rack_kind) &&
    Boolean(position.logic_location_code)
  )
}

function validateBindings(): string[] {
  const roles = new Set(deviceRoles.value.map(role => role.role_key))
  const codes = new Set(devices.value.map(device => device.device_code))
  const used = new Set<string>()
  const errors: string[] = []
  for (const [role, code] of Object.entries(deviceBindings.value)) {
    if (!roles.has(role)) errors.push(`未知设备角色：${role}`)
    if (!codes.has(code)) errors.push(`设备 ${code} 不在本线已保存的物理设备集合中`)
    if (used.has(code)) errors.push('设备绑定不能重复')
    used.add(code)
  }
  const usedPositions = new Set<string>()
  for (const [key, code] of Object.entries(positionBindings.value)) {
    const slot = positionSlots.value.find(item => item.slot_key === key)
    const position = positions.value.find(item => item.position_code === code)
    if (!slot || !position || !matchingPosition(position, slot))
      errors.push(`工作位 ${code} 不符合插槽 ${key} 要求，请检查基础配置`)
    if (usedPositions.has(code)) errors.push('工作位绑定不能重复')
    usedPositions.add(code)
  }
  return errors
}

function checkLabel(code: string): string {
  const labels: Record<string, string> = {
    PLUGIN_SELECTED: '已选择业务插件',
    PLUGIN_INSTALLED: '业务插件已安装',
    PLUGIN_CONFIGURATION_COMPATIBLE: '插件配置与本线资源兼容',
    RUN_MODE_ALLOWED: '运行模式有效',
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
  if (pluginKey.value) {
    validationErrors.value = validateBindings()
    if (validationErrors.value.length > 0) return
  }
  const config = pluginKey.value
    ? {
        device_bindings: { ...deviceBindings.value },
        position_bindings: { ...positionBindings.value }
      }
    : {}

  submitting.value = true
  try {
    await workLinesApiMethods
      .configuration(
        { id: workline.id },
        {
          version: workline.version,
          plugin_key: pluginKey.value || null,
          config
        }
      )
      .send()
  } catch (error) {
    ElMessage.error(`保存业务装配失败：${getSafeErrorMessage(error)}`)
    return
  } finally {
    submitting.value = false
  }

  savedDraft.value = draftSnapshot.value
  dialogVisible.value = false
  ElMessage.success('工作线插件关联保存成功')
  await refreshList()
}

async function deactivate(): Promise<void> {
  const workline = currentWorkline.value
  if (!workline?.is_active || !canDeactivate.value || deactivating.value) return
  try {
    await ElMessageBox.confirm(
      `确认停用“${workline.line_name}”？请先停止接料并完成现场物理清线；系统会检查未完成任务、待处理结果和位置占用。`,
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
    confirm-text="保存插件关联"
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
            <h3>{{ currentWorkline.line_name }}</h3>
            <p>
              {{ currentWorkline.line_code }} ·
              {{
                { AUTO: '自动线', MANUAL: '人工线', HYBRID: '混合线' }[currentWorkline.line_type]
              }}
            </p>
            <p v-if="currentWorkline.plugin_key">
              当前插件：{{ currentWorkline.plugin_key }} · 启动版本
              {{ currentWorkline.plugin_version ?? '尚未启动' }}
            </p>
          </div>
          <div class="workline-configuration__status-actions">
            <ElTag
              v-if="isDirty"
              type="warning"
            >
              未保存
            </ElTag>
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
          title="已启用工作线只读；停用成功后才能更换插件或角色绑定。"
          show-icon
        />
        <ElAlert
          v-if="deactivationError"
          type="error"
          :closable="false"
          :title="`停用被阻止：${deactivationError}`"
          show-icon
        />
      </section>

      <section class="workline-configuration__section">
        <div class="workline-configuration__section-heading">
          <div>
            <h3>业务插件</h3>
            <p>
              先选择插件，再将其工作位和设备插槽关联到本线资源。草稿可暂不绑定，启动前必须全部完成。
            </p>
          </div>
        </div>
        <ElFormItem label="业务插件">
          <ElSelect
            data-testid="plugin-select"
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
              :disabled="!plugin.compatible"
            />
          </ElSelect>
        </ElFormItem>
        <ElAlert
          v-if="plugins.length === 0 && !hasUnavailableSelectedPlugin"
          type="info"
          :closable="false"
          show-icon
          title="当前环境没有可用业务插件，请联系部署管理员配置插件。基础配置可独立维护。"
        />
        <ElAlert
          v-if="hasUnavailableSelectedPlugin"
          type="error"
          :closable="false"
          title="当前业务插件未包含在部署清单中，已阻止保存。请先恢复该插件部署。"
          show-icon
        />
        <ElAlert
          v-else-if="selectedPluginSummary && !selectedPluginSummary.compatible"
          type="warning"
          :closable="false"
          :title="`插件不支持当前工作线类型：${selectedPluginSummary.incompatibility_reasons.join('；')}`"
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
        <template v-if="selectedPluginSummary">
          <h4 class="workline-configuration__slot-heading">
            工作位插槽 · {{ Object.keys(positionBindings).length }} / {{ positionSlots.length }}
          </h4>
          <p class="workline-configuration__hint">
            资源来自基础配置。缺少工作位或设备时，请先到基础配置补充。
          </p>
          <ElFormItem
            v-for="slot in positionSlots"
            :key="slot.slot_key"
            :label="`${slot.display_name} · ${slot.slot_key}`"
          >
            <ElSelect
              :model-value="positionBindings[slot.slot_key] ?? ''"
              :data-slot="slot.slot_key"
              :disabled="formDisabled"
              placeholder="选择本线工作位（可暂不绑定）"
              clearable
              @change="bindPosition(slot.slot_key, $event)"
            >
              <ElOption
                v-for="position in positions"
                :key="position.position_code"
                :value="position.position_code"
                :label="`${position.position_name} (${position.position_code}) → ${position.logic_location_code || '缺少执行编码'}`"
                :disabled="
                  !matchingPosition(position, slot) ||
                  Object.entries(positionBindings).some(
                    ([key, code]) => key !== slot.slot_key && code === position.position_code
                  )
                "
              />
            </ElSelect>
          </ElFormItem>
          <h4 class="workline-configuration__slot-heading">
            设备插槽 · {{ Object.keys(deviceBindings).length }} / {{ deviceRoles.length }}
          </h4>
        </template>
        <ElFormItem
          v-for="role in deviceRoles"
          :key="role.role_key"
          :label="role.display_name"
        >
          <ElSelect
            :model-value="deviceBindings[role.role_key] ?? ''"
            :data-role="role.role_key"
            :disabled="formDisabled"
            placeholder="请选择已配置的本线设备（可暂不绑定）"
            clearable
            @change="bindDevice(role.role_key, $event)"
          >
            <ElOption
              v-for="device in devices"
              :key="device.id"
              :value="device.device_code"
              :disabled="
                Object.entries(deviceBindings).some(
                  ([key, code]) => key !== role.role_key && code === device.device_code
                )
              "
              :label="`${device.device_name} (${device.device_code})`"
            />
          </ElSelect>
        </ElFormItem>
      </section>
      <section class="workline-configuration__section workline-configuration__saved-checks">
        <div class="workline-configuration__section-heading">
          <h3>启用检查</h3>
          <ElTag :type="isDirty ? 'warning' : 'info'">
            {{ isDirty ? '草稿待校验' : '已保存配置' }}
          </ElTag>
        </div>
        <p
          v-if="isDirty"
          class="workline-configuration__hint"
        >
          以下结果来自已保存配置。保存插件关联后重新检查。
        </p>
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
        <p class="workline-configuration__hint">保存插件关联不会启用工作线，也不会修改基础配置。</p>
      </section>
    </ElForm>
  </StandardDialog>
</template>

<style scoped>
.workline-configuration,
.workline-configuration__section {
  display: grid;
  gap: var(--space-sm);
}

.workline-configuration {
  grid-template-columns: minmax(0, 1fr);
  color: var(--color-text-primary);
}

.workline-configuration__section :deep(.el-form-item) {
  margin-bottom: 0;
}

.workline-configuration__section {
  min-width: 0;
  align-content: start;
  padding: var(--space-md);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
}

.workline-configuration__section-heading,
.workline-configuration__status-actions,
.workline-configuration__check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2xs);
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
  gap: var(--space-3xs);
}

.workline-configuration__check {
  justify-content: flex-start;
}

.workline-configuration__errors {
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  background: var(--el-color-danger-light-9);
}

.workline-configuration__slot-heading {
  margin: var(--space-2xs) 0 0;
}

.workline-configuration__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}

.workline-configuration__loading {
  padding: var(--space-lg);
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
