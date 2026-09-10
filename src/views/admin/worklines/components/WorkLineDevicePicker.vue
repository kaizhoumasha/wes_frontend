<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { DevicesItem } from '@/api/modules/devices'
import type { FilterGroup } from '@/api/base/crud-request-adapter'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { getSafeErrorMessage } from '@/utils/string'
import { queryWorkLineDevices } from './fetchWorkLineDevices'

const props = defineProps<{ worklineId: number; selectedCodes: string[] }>()
const visible = defineModel<boolean>({ default: false })
const emit = defineEmits<{ select: [devices: DevicesItem[]] }>()
const search = ref('')
const ownership = ref('available')
const page = ref(1)
const items = ref<DevicesItem[]>([])
const total = ref(0)
const pending = ref<Record<string, DevicesItem>>({})
const selectedOnly = ref(false)
const loading = ref(false)
const error = ref('')
const limit = 50
let sequence = 0
const selected = computed(() => Object.values(pending.value))
const shown = computed(() =>
  selectedOnly.value
    ? selected.value.slice((page.value - 1) * limit, page.value * limit)
    : items.value
)
const count = computed(() => (selectedOnly.value ? selected.value.length : total.value))
function unavailable(device: DevicesItem): boolean {
  return (
    props.selectedCodes.includes(device.device_code) ||
    (device.work_line_id != null && device.work_line_id !== props.worklineId)
  )
}
function toggle(device: DevicesItem, checked: boolean): void {
  if (unavailable(device) || loading.value) return
  if (checked) pending.value[device.device_code] = device
  else delete pending.value[device.device_code]
  if (selectedOnly.value && (page.value - 1) * limit >= count.value)
    page.value = Math.max(1, Math.ceil(count.value / limit))
}
async function load(): Promise<void> {
  const turn = ++sequence
  error.value = ''
  items.value = []
  if (!visible.value || selectedOnly.value) {
    loading.value = false
    return
  }
  loading.value = true
  const conditions: NonNullable<FilterGroup['conditions']> = []
  if (ownership.value === 'available') conditions.push({ field: 'work_line_id', op: 'is_null' })
  if (ownership.value === 'owned')
    conditions.push({ field: 'work_line_id', op: 'eq', value: props.worklineId })
  if (ownership.value === 'other')
    conditions.push(
      { field: 'work_line_id', op: 'ne', value: props.worklineId },
      { field: 'work_line_id', op: 'not_null' }
    )
  if (search.value.trim())
    conditions.push({
      couple: 'or',
      conditions: ['device_code', 'device_name'].map(field => ({
        field,
        op: 'ilike',
        value: `%${search.value.trim()}%`
      }))
    })
  try {
    const result = await queryWorkLineDevices({
      offset: (page.value - 1) * limit,
      limit,
      filters: { couple: 'and', conditions }
    })
    if (turn !== sequence) return
    items.value = result.items
    total.value = result.total
  } catch (reason) {
    if (turn === sequence) {
      error.value = getSafeErrorMessage(reason)
      total.value = 0
    }
  } finally {
    if (turn === sequence) loading.value = false
  }
}
function changePage(value: number): void {
  page.value = value
  void load()
}
function searchChanged(): void {
  page.value = 1
  void load()
}
watchDebounced(search, searchChanged, { debounce: 300 })
watch(ownership, searchChanged)
watch(selectedOnly, searchChanged)
watch(
  visible,
  open => {
    if (open) {
      pending.value = {}
      search.value = ''
      ownership.value = 'available'
      selectedOnly.value = false
      page.value = 1
    }
    void load()
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  ++sequence
})
function apply(): void {
  if (loading.value || !selected.value.length) return
  emit('select', selected.value)
  visible.value = false
}
</script>

<template>
  <StandardDialog
    v-model="visible"
    title="添加本线设备"
    size="lg"
    :confirm-text="`添加已选设备（${selected.length}）`"
    :confirm-disabled="loading || selected.length === 0"
    @confirm="apply"
  >
    <div class="device-picker">
      <p>按名称或编码查找设备。跨页勾选会保留，添加后请保存本线设备。</p>
      <div class="device-picker__toolbar">
        <ElInput
          v-model="search"
          clearable
          placeholder="搜索设备名称或编码"
          aria-label="搜索候选设备"
          :disabled="selectedOnly"
        />
        <ElSelect
          v-model="ownership"
          aria-label="设备关联状态"
          :disabled="selectedOnly"
        >
          <ElOption
            value="available"
            label="可关联设备"
          />
          <ElOption
            value="owned"
            label="本线设备"
          />
          <ElOption
            value="other"
            label="其他线占用"
          />
          <ElOption
            value="all"
            label="全部设备"
          />
        </ElSelect>
        <ElCheckbox v-model="selectedOnly">仅看待添加（{{ selected.length }}）</ElCheckbox>
      </div>
      <div class="device-picker__toolbar">
        <ElButton
          :disabled="loading || !!error"
          @click="shown.forEach(device => toggle(device, true))"
        >
          选择当前页
        </ElButton>
        <ElButton
          :disabled="loading"
          @click="shown.forEach(device => toggle(device, false))"
        >
          取消当前页
        </ElButton>
        <span aria-live="polite">{{ count }} 台 · 已选 {{ selected.length }} 台</span>
      </div>
      <ElAlert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
      />
      <ElButton
        v-if="error"
        @click="load"
      >
        重试
      </ElButton>
      <div
        v-loading="loading"
        class="device-picker__list"
        aria-label="候选设备"
      >
        <div
          v-for="device in shown"
          :key="device.id"
          :data-device="device.device_code"
          class="device-picker__row"
        >
          <ElCheckbox
            :model-value="
              !!pending[device.device_code] || selectedCodes.includes(device.device_code)
            "
            :disabled="loading || unavailable(device)"
            @change="toggle(device, Boolean($event))"
          >
            {{ device.device_name }}
            <code>{{ device.device_code }}</code>
          </ElCheckbox>
          <ElTag
            :type="
              device.work_line_id != null && device.work_line_id !== worklineId ? 'warning' : 'info'
            "
          >
            {{
              device.work_line_id != null && device.work_line_id !== worklineId
                ? `工作线 ${device.work_line_id} 占用`
                : selectedCodes.includes(device.device_code)
                  ? '已关联本线'
                  : '可关联'
            }}
          </ElTag>
        </div>
        <ElEmpty
          v-if="!loading && !error && !shown.length"
          description="没有匹配的设备，请调整筛选条件"
          :image-size="64"
        />
      </div>
      <ElPagination
        :current-page="page"
        :page-size="limit"
        :total="count"
        :disabled="loading"
        layout="prev, pager, next, total"
        @current-change="changePage"
      />
    </div>
  </StandardDialog>
</template>

<style scoped>
.device-picker {
  display: grid;
  gap: var(--space-sm);
}
.device-picker p,
.device-picker code {
  color: var(--color-text-secondary);
}
.device-picker__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.device-picker__toolbar .el-input {
  flex: 1;
  min-width: 180px;
}
.device-picker__toolbar .el-select {
  width: 170px;
}
.device-picker__list {
  min-height: 160px;
  max-height: 45vh;
  overflow: auto;
}
.device-picker__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.device-picker__row :deep(.el-checkbox) {
  height: auto;
  min-width: 0;
}
.device-picker__row :deep(.el-checkbox__label) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.device-picker__row code {
  display: block;
}
</style>
