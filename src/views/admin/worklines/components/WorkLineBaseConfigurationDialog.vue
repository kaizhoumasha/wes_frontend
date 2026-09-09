<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { DevicesItem } from '@/api/modules/devices'
import {
  workLinesApiMethods,
  type BaseConfigurationResult,
  type UpdateBaseConfigurationInput,
  type WorkLinesItem as Workline
} from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'
import { fetchWorkLineDevices } from './fetchWorkLineDevices'

type Position = UpdateBaseConfigurationInput['positions'][number]
const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const refresh = inject(CRUD_PAGE_REFRESH_KEY)
const { hasPermission } = usePermission()
const current = ref<BaseConfigurationResult | null>(null)
const devices = ref<DevicesItem[]>([])
const selectedCodes = ref<string[]>([])
const positions = ref<Position[]>([])
const selectedPosition = ref<number | null>(null)
const search = ref('')
const loading = ref(false)
const submitting = ref(false)
const loadError = ref('')
const saveError = ref('')
const savedDraft = ref('')
let sequence = 0

const roleLabels: Record<NonNullable<Position['position_role']>, string> = {
  SMT_CLASSIFIER_SINGLE_RACK_WORK: '单层货架工作位',
  SMT_RACK_EXCHANGE_AREA: '货架交换位',
  SMT_SORTER_QUEUE: '分拣排队位',
  SMT_SORTER_STATION: '分拣工作位',
  SMT_EMPTY_RACK_AREA: '空货架位',
  SMT_RETURN_RACK_POSITION: '退料货架位',
  SMT_TRANSFER_RACK_POSITION: '转运货架位'
}
const kindLabels: Record<NonNullable<Position['allowed_rack_kind']>, string> = {
  FIVE_LAYER: '五层货架',
  RETURN: '退料货架',
  TRANSFER: '转运货架',
  SINGLE_LAYER: '单层货架',
  PRODUCTION: '生产货架'
}
const snapshot = computed(() =>
  JSON.stringify({ devices: [...selectedCodes.value].sort(), positions: positions.value })
)
const isDirty = computed(() => savedDraft.value !== '' && savedDraft.value !== snapshot.value)
const readonly = computed(
  () => current.value?.is_active === true || !hasPermission(BIZ_PERMISSIONS.workline.configureBase)
)
const disabled = computed(() => readonly.value || loading.value || submitting.value)
const editedPosition = computed(() =>
  selectedPosition.value === null ? undefined : positions.value[selectedPosition.value]
)
const ownedChoices = computed(() =>
  devices.value.filter(device => selectedCodes.value.includes(device.device_code))
)
const visibleDevices = computed(() => {
  const query = search.value.trim().toLowerCase()
  return devices.value.filter(device =>
    `${device.device_code} ${device.device_name}`.toLowerCase().includes(query)
  )
})
const dialogVisible = computed({
  get: () => modelValue.value,
  set: value => {
    if (value) modelValue.value = true
    else void close()
  }
})

async function close(): Promise<void> {
  if (submitting.value) return
  if (isDirty.value) {
    try {
      await ElMessageBox.confirm('基础配置尚未保存，确认放弃修改？', '未保存的修改', {
        confirmButtonText: '放弃修改',
        cancelButtonText: '继续编辑',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  modelValue.value = false
}

async function load(): Promise<void> {
  const turn = ++sequence
  current.value = null
  devices.value = []
  positions.value = []
  selectedCodes.value = []
  selectedPosition.value = null
  savedDraft.value = ''
  search.value = ''
  loadError.value = ''
  saveError.value = ''
  if (!modelValue.value || !props.workline) return
  loading.value = true
  try {
    const [base, allDevices] = await Promise.all([
      workLinesApiMethods.baseConfiguration({ id: props.workline.id }).send(),
      fetchWorkLineDevices()
    ])
    if (turn !== sequence) return
    current.value = base
    devices.value = allDevices
    selectedCodes.value = [...base.device_codes]
    positions.value = base.positions.map(position => ({ ...position }))
    savedDraft.value = snapshot.value
  } catch (error) {
    if (turn === sequence) loadError.value = `基础配置加载失败：${getSafeErrorMessage(error)}`
  } finally {
    if (turn === sequence) loading.value = false
  }
}

function addPosition(): void {
  if (disabled.value) return
  positions.value.push({
    position_code: '',
    position_name: '新工作位',
    position_type: 'STATION',
    position_role: null,
    allowed_rack_kind: null,
    capacity: 1,
    priority: 100,
    enabled: true,
    device_id: null,
    logic_location_code: null,
    external_location_code: null
  })
  selectedPosition.value = positions.value.length - 1
}

function changePositionType(value: 'STATION' | 'RACK_POSITION'): void {
  const position = editedPosition.value
  if (!position) return
  position.position_type = value
  position.position_role = value === 'RACK_POSITION' ? 'SMT_SORTER_STATION' : null
  position.allowed_rack_kind = value === 'RACK_POSITION' ? 'FIVE_LAYER' : null
}

function removePosition(): void {
  if (disabled.value || selectedPosition.value === null) return
  positions.value.splice(selectedPosition.value, 1)
  selectedPosition.value = null
}

function otherOwner(device: DevicesItem): boolean {
  return device.work_line_id != null && device.work_line_id !== current.value?.workline_id
}

function selectDevice(device: DevicesItem, selected: boolean): void {
  if (disabled.value || otherOwner(device)) return
  if (!selected && positions.value.some(position => position.device_id === device.id)) {
    ElMessage.warning('请先解除工作位与该设备的关联')
    return
  }
  selectedCodes.value = selected
    ? [...new Set([...selectedCodes.value, device.device_code])]
    : selectedCodes.value.filter(code => code !== device.device_code)
}

async function submit(): Promise<void> {
  if (disabled.value || !current.value || loadError.value) return
  saveError.value = ''
  const drafts = positions.value.map(position => ({
    ...position,
    position_code: position.position_code.trim(),
    position_name: position.position_name.trim(),
    logic_location_code: position.logic_location_code?.trim() || null,
    external_location_code: position.external_location_code?.trim() || null
  }))
  if (drafts.some(position => !position.position_code || !position.position_name)) {
    saveError.value = '请填写每个工作位的编码和名称'
    return
  }
  if (
    drafts.some(
      position =>
        !Number.isInteger(position.capacity) ||
        (position.capacity ?? 0) < 1 ||
        !Number.isInteger(position.priority) ||
        (position.priority ?? -1) < 0
    )
  ) {
    saveError.value = '容量必须为正整数，优先级必须为非负整数'
    return
  }
  for (const key of ['position_code', 'logic_location_code'] as const) {
    const codes = drafts.map(position => position[key]).filter(Boolean)
    if (new Set(codes).size !== codes.length) {
      saveError.value = `${key === 'position_code' ? '工作位' : '逻辑位置'}编码不能重复`
      return
    }
  }
  if (
    drafts.some(
      position =>
        position.device_id != null &&
        !ownedChoices.value.some(device => device.id === position.device_id)
    )
  ) {
    saveError.value = '工作位关联设备必须属于本线设备'
    return
  }
  submitting.value = true
  try {
    await workLinesApiMethods
      .updateBaseConfiguration(
        { id: current.value.workline_id },
        {
          version: current.value.version,
          device_codes: [...selectedCodes.value],
          positions: drafts
        }
      )
      .send()
    savedDraft.value = snapshot.value
    modelValue.value = false
    ElMessage.success('工作线基础配置保存成功')
    try {
      await refresh?.()
    } catch {
      ElMessage.warning('保存成功，列表刷新失败，请手动刷新')
    }
  } catch (error) {
    saveError.value = `保存基础配置失败：${getSafeErrorMessage(error)}`
  } finally {
    submitting.value = false
  }
}

watch(
  () => [modelValue.value, props.workline?.id] as const,
  () => {
    void load()
  },
  { immediate: true }
)
</script>

<template>
  <StandardDialog
    v-model="dialogVisible"
    :title="`基础配置${workline ? `：${workline.line_name}` : ''}`"
    size="xl"
    confirm-text="保存基础配置"
    confirm-icon="lucide:save"
    :closable="!submitting"
    :hide-cancel="submitting"
    :confirm-loading="submitting"
    :confirm-disabled="disabled || !current || Boolean(loadError)"
    @confirm="submit"
  >
    <p
      v-if="loading"
      class="workline-base__hint"
    >
      正在加载最新基础配置…
    </p>
    <ElAlert
      v-else-if="loadError"
      :title="loadError"
      type="error"
      :closable="false"
      show-icon
    />
    <div
      v-else-if="current"
      class="workline-base"
    >
      <header class="workline-base__heading">
        <p>工作位与设备独立保存，通常仅在建线、改造时修改。</p>
        <ElTag :type="isDirty ? 'warning' : 'info'">{{ isDirty ? '未保存' : '已保存配置' }}</ElTag>
      </header>
      <ElAlert
        v-if="readonly"
        :title="
          current.is_active
            ? '工作线已启用，基础配置只读；停用并完成现场清线后才能修改。'
            : '当前账号没有基础配置编辑权限。'
        "
        type="info"
        :closable="false"
        show-icon
      />
      <section>
        <div class="workline-base__heading">
          <div>
            <h3>工作位</h3>
            <p>定义实际工作位及对接编码，再在插件装配中关联插槽。</p>
          </div>
          <ElButton
            :disabled="disabled"
            @click="addPosition()"
          >
            添加工作位
          </ElButton>
        </div>
        <div
          v-if="positions.length === 0"
          class="workline-base__empty"
        >
          <p>尚未定义工作位。添加投料口、出料口或货架工作位。</p>
        </div>
        <div
          v-else
          class="workline-base__cards"
        >
          <button
            v-for="(position, index) in positions"
            :key="index"
            type="button"
            class="workline-base__card"
            :class="{ 'workline-base__card--selected': selectedPosition === index }"
            :aria-pressed="selectedPosition === index"
            @click="selectedPosition = index"
          >
            <strong>{{ position.position_name || '未命名工作位' }}</strong>
            <div
              v-if="position.position_type === 'RACK_POSITION'"
              class="workline-base__rack"
              aria-hidden="true"
            >
              <i
                v-for="level in position.allowed_rack_kind === 'FIVE_LAYER' ? 5 : 1"
                :key="level"
              />
            </div>
            <span>
              {{
                position.allowed_rack_kind ? kindLabels[position.allowed_rack_kind] : '普通工作位'
              }}
              · 容量 {{ position.capacity }}
            </span>
            <code>{{ position.position_code || '待填写工作位编码' }}</code>
            <small v-if="position.enabled === false">已禁用</small>
          </button>
        </div>
        <ElForm
          v-if="editedPosition"
          label-position="top"
          :disabled="disabled"
          class="workline-base__editor"
        >
          <div class="workline-base__heading workline-base__wide">
            <h4>工作位定义</h4>
            <ElButton
              :disabled="disabled"
              type="danger"
              text
              @click="removePosition"
            >
              移除工作位
            </ElButton>
          </div>
          <ElFormItem
            label="工作位编码"
            required
          >
            <ElInput
              v-model="editedPosition.position_code"
              maxlength="80"
              placeholder="填写现场工作位编码"
            />
          </ElFormItem>
          <ElFormItem
            label="工作位名称"
            required
          >
            <ElInput
              v-model="editedPosition.position_name"
              maxlength="120"
            />
          </ElFormItem>
          <ElFormItem label="工作位类型">
            <ElSelect
              :model-value="editedPosition.position_type"
              @change="changePositionType"
            >
              <ElOption
                label="普通工作位"
                value="STATION"
              />
              <ElOption
                label="货架工作位"
                value="RACK_POSITION"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="editedPosition.position_type === 'RACK_POSITION'"
            label="货架位用途"
          >
            <ElSelect v-model="editedPosition.position_role">
              <ElOption
                v-for="(label, role) in roleLabels"
                :key="role"
                :value="role"
                :label="label"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="editedPosition.position_type === 'RACK_POSITION'"
            label="允许货架类型"
          >
            <ElSelect v-model="editedPosition.allowed_rack_kind">
              <ElOption
                v-for="(label, kind) in kindLabels"
                :key="kind"
                :value="kind"
                :label="label"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            :label="editedPosition.position_type === 'RACK_POSITION' ? '容量（货架个数）' : '容量'"
          >
            <ElInputNumber
              v-model="editedPosition.capacity"
              :min="1"
              :precision="0"
            />
          </ElFormItem>
          <ElFormItem label="优先级">
            <ElInputNumber
              v-model="editedPosition.priority"
              :min="0"
              :precision="0"
            />
          </ElFormItem>
          <ElFormItem label="执行位置编码（WMS / RCS）">
            <ElInput
              :model-value="editedPosition.logic_location_code ?? ''"
              maxlength="120"
              placeholder="选填"
              @update:model-value="editedPosition.logic_location_code = $event || null"
            />
          </ElFormItem>
          <ElFormItem label="外部位置编码">
            <ElInput
              :model-value="editedPosition.external_location_code ?? ''"
              maxlength="120"
              placeholder="选填"
              @update:model-value="editedPosition.external_location_code = $event || null"
            />
          </ElFormItem>
          <ElFormItem label="关联物理设备">
            <ElSelect
              :model-value="editedPosition.device_id ?? undefined"
              clearable
              placeholder="从下方已选本线设备中关联"
              @update:model-value="editedPosition.device_id = $event || null"
            >
              <ElOption
                v-for="device in ownedChoices"
                :key="device.id"
                :value="device.id"
                :label="`${device.device_name} (${device.device_code})`"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="工作位状态">
            <ElSwitch
              v-model="editedPosition.enabled"
              active-text="启用"
              inactive-text="禁用"
            />
          </ElFormItem>
        </ElForm>
      </section>
      <section>
        <div class="workline-base__heading">
          <div>
            <h3>本线设备</h3>
            <p>选择本线物理设备，再在工作位中关联。插件仍引用设备时，需先解除角色绑定。</p>
          </div>
          <ElTag type="info">已选 {{ selectedCodes.length }} 台</ElTag>
        </div>
        <ElInput
          v-model="search"
          placeholder="搜索设备名称或编码"
          clearable
          aria-label="搜索设备"
        />
        <div class="workline-base__devices">
          <div
            v-for="device in visibleDevices"
            :key="device.id"
            class="workline-base__device"
          >
            <ElCheckbox
              :model-value="selectedCodes.includes(device.device_code)"
              :disabled="disabled || otherOwner(device)"
              @change="selectDevice(device, Boolean($event))"
            >
              {{ device.device_name }}
              <code>{{ device.device_code }}</code>
            </ElCheckbox>
            <ElTag :type="otherOwner(device) ? 'warning' : 'info'">
              {{
                otherOwner(device)
                  ? '其他线占用'
                  : selectedCodes.includes(device.device_code)
                    ? '本线设备'
                    : '可选'
              }}
            </ElTag>
          </div>
          <p
            v-if="visibleDevices.length === 0"
            class="workline-base__empty"
          >
            {{ search ? '没有匹配的设备，请调整搜索条件' : '暂无设备，请先在设备管理中添加' }}
          </p>
        </div>
      </section>
      <ElAlert
        v-if="saveError"
        :title="saveError"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
  </StandardDialog>
</template>

<style scoped>
.workline-base {
  display: grid;
  gap: var(--space-md);
  color: var(--color-text-primary);
}
.workline-base__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}
.workline-base__heading h3,
.workline-base__heading h4,
.workline-base__heading p {
  margin: 0;
}
.workline-base__heading p,
.workline-base__hint {
  color: var(--color-text-secondary);
}
.workline-base__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2xs);
}
.workline-base__card {
  display: grid;
  gap: var(--space-3xs);
  padding: var(--space-sm);
  border: 1px solid var(--el-border-color-light);
  border-top: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--el-bg-color);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  min-width: 0;
  overflow-wrap: anywhere;
}
.workline-base__card--selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.workline-base__card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.workline-base__card span,
.workline-base__card code,
.workline-base__card small {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.workline-base__rack {
  display: grid;
  align-content: space-between;
  width: 42px;
  height: 48px;
  margin: var(--space-2xs) 0;
  padding: 0 4px;
  border-inline: 2px solid var(--color-text-secondary);
}
.workline-base__rack i {
  border-top: 2px solid var(--color-text-secondary);
}
.workline-base__editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-sm);
  padding: var(--space-md);
  margin-top: var(--space-sm);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
}
.workline-base__wide {
  grid-column: 1 / -1;
}
.workline-base__devices {
  max-height: 260px;
  overflow: auto;
  margin-top: var(--space-2xs);
}
.workline-base__device {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-2xs) 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.workline-base__device code {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.workline-base__device :deep(.el-checkbox) {
  height: auto;
  min-width: 0;
}
.workline-base__device :deep(.el-checkbox__label) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.workline-base__empty {
  padding: var(--space-md);
  color: var(--color-text-secondary);
  text-align: center;
}

@media (width <= 768px) {
  .workline-base__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .workline-base__editor {
    grid-template-columns: minmax(0, 1fr);
    padding: var(--space-sm);
  }
  .workline-base__heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
