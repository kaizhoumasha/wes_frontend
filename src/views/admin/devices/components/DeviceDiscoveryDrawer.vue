<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
import type { DeviceDiscoveryItem, DeviceDiscoveryStatus } from '../deviceDiscovery'
import { useDeviceDiscovery, type DeviceDiscoveryApiPort } from '../useDeviceDiscovery'

type DiscoveryFilter = 'all' | 'attention' | 'unmanaged' | 'managed'

interface Props {
  modelValue: boolean
  openCreate: (options?: { initialValues?: Record<string, unknown> }) => void
  api?: DeviceDiscoveryApiPort
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const discovery = useDeviceDiscovery({ api: props.api })
const activeFilter = ref<DiscoveryFilter>('all')
const searchText = ref('')
const uiError = ref('')

const filterCounts = computed(() => ({
  all: discovery.items.value.length,
  attention: discovery.items.value.filter(item => item.rank === 0).length,
  unmanaged: discovery.items.value.filter(item => item.status === 'DISCOVERED_UNMANAGED').length,
  managed: discovery.items.value.filter(item => item.status === 'MANAGED').length
}))

const visibleItems = computed(() => {
  const query = searchText.value.trim().toLocaleLowerCase()
  return discovery.items.value.filter(item => {
    if (!matchesFilter(item, activeFilter.value)) return false
    if (!query) return true
    return [item.deviceCode, item.ecs?.device.device_name, item.wes?.device_name]
      .filter((value): value is string => typeof value === 'string')
      .some(value => value.toLocaleLowerCase().includes(query))
  })
})

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      discovery.open()
      return
    }
    resetUi()
    discovery.close()
  },
  { immediate: true }
)

async function handleRefresh(): Promise<boolean> {
  uiError.value = ''
  try {
    await discovery.refresh()
    return true
  } catch (error) {
    uiError.value = errorMessage(error)
    return false
  }
}

function handleVisibleChange(value: boolean): void {
  if (!value) {
    resetUi()
    discovery.close()
  }
  emit('update:modelValue', value)
}

function onboard(item: DeviceDiscoveryItem): void {
  if (!discovery.canOnboard(item) || !item.ecs || !discovery.snapshotEndpoint.value) return
  const initialValues: Record<string, unknown> = {
    device_code: item.deviceCode,
    endpoint_base_url: discovery.snapshotEndpoint.value
  }
  if (item.ecs.device.device_name !== null) {
    initialValues.device_name = item.ecs.device.device_name
  }
  props.openCreate({ initialValues })
}

async function refreshAfterCreate(): Promise<boolean> {
  if (!props.modelValue || !discovery.hasSnapshot.value) return true
  return await handleRefresh()
}

function resetUi(): void {
  activeFilter.value = 'all'
  searchText.value = ''
  uiError.value = ''
}

function matchesFilter(item: DeviceDiscoveryItem, filter: DiscoveryFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'attention') return item.rank === 0
  if (filter === 'unmanaged') return item.status === 'DISCOVERED_UNMANAGED'
  return item.status === 'MANAGED'
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function displayName(item: DeviceDiscoveryItem): string {
  return item.ecs?.device.device_name ?? item.wes?.device_name ?? '未命名设备'
}

function statusLabel(status: DeviceDiscoveryStatus): string {
  return {
    ENDPOINT_CONFLICT: 'Endpoint 冲突',
    INFORMATION_DIFFERS: '信息不一致',
    MANAGED_NOT_DISCOVERED: '本次未发现',
    DISCOVERED_UNMANAGED: '待接管',
    MANAGED: '已接管'
  }[status]
}

function statusTagType(status: DeviceDiscoveryStatus): 'danger' | 'warning' | 'info' | 'success' {
  if (status === 'ENDPOINT_CONFLICT') return 'danger'
  if (status === 'INFORMATION_DIFFERS' || status === 'MANAGED_NOT_DISCOVERED') return 'warning'
  if (status === 'DISCOVERED_UNMANAGED') return 'info'
  return 'success'
}

function statusReason(item: DeviceDiscoveryItem): string {
  if (item.status === 'ENDPOINT_CONFLICT') {
    return item.wes?.endpoint_base_url
      ? `WES 当前绑定 ${item.wes.endpoint_base_url}`
      : 'WES 当前未绑定 Endpoint'
  }
  if (item.status === 'INFORMATION_DIFFERS') {
    return `WES 名称：${item.wes?.device_name ?? '—'}；ECS 名称：${item.ecs?.device.device_name ?? '—'}`
  }
  if (item.status === 'MANAGED_NOT_DISCOVERED') {
    return 'WES 已绑定当前 Endpoint，但本次 ECS 未返回该设备'
  }
  if (item.status === 'DISCOVERED_UNMANAGED') {
    return 'active WES Device 中未找到同编码记录'
  }
  return 'ECS 与 active WES Device 静态身份一致'
}

defineExpose({ refreshAfterCreate, discovery })
</script>

<template>
  <StandardDrawer
    :model-value="modelValue"
    title="从 ECS 发现设备"
    width="min(760px, 94vw)"
    custom-class="device-discovery-drawer"
    @update:model-value="handleVisibleChange"
  >
    <div class="discovery-layout">
      <el-alert
        title="实时读取 ECS 并与 active WES Device 做本次比对；不会自动修改、停用或删除设备。"
        type="info"
        :closable="false"
        show-icon
      />

      <div class="endpoint-row">
        <el-input
          v-model="discovery.endpointBaseUrl.value"
          class="endpoint-input"
          placeholder="http://10.24.209.26:8080"
          aria-label="ECS Endpoint"
          :disabled="discovery.isLoading.value"
          @keyup.enter="handleRefresh"
        />
        <AppButton
          class="refresh-action"
          type="primary"
          icon="ep:refresh"
          :loading="discovery.isLoading.value"
          :disabled="!discovery.endpointBaseUrl.value.trim()"
          @click="handleRefresh"
        >
          刷新比对
        </AppButton>
      </div>

      <el-alert
        v-if="uiError"
        class="discovery-error"
        :title="uiError"
        type="error"
        :closable="false"
        show-icon
      />

      <el-alert
        v-if="discovery.isStale.value"
        class="stale-alert"
        title="当前展示的是上一次成功结果，接管操作已禁用；请重新刷新。"
        type="warning"
        :closable="false"
        show-icon
      />

      <div
        v-if="discovery.hasSnapshot.value"
        class="result-tools"
      >
        <div class="summary-filters">
          <button
            v-for="filter in ['all', 'attention', 'unmanaged', 'managed'] as const"
            :key="filter"
            class="summary-filter"
            :class="{ 'is-active': activeFilter === filter }"
            :data-filter="filter"
            type="button"
            @click="activeFilter = filter"
          >
            {{
              { all: '全部', attention: '需处理', unmanaged: '待接管', managed: '已接管' }[filter]
            }}
            <span>{{ filterCounts[filter] }}</span>
          </button>
        </div>

        <input
          v-model="searchText"
          class="device-search"
          type="search"
          placeholder="搜索设备编码或名称"
          aria-label="搜索发现设备"
        />
      </div>

      <div
        v-if="discovery.isLoading.value && !discovery.hasSnapshot.value"
        class="result-placeholder"
      >
        正在读取 ECS 并比对 WES Device…
      </div>
      <div
        v-else-if="!discovery.hasSnapshot.value"
        class="result-placeholder"
      >
        输入 ECS Endpoint 后点击“刷新比对”。
      </div>
      <div
        v-else-if="visibleItems.length === 0"
        class="result-placeholder"
      >
        当前筛选没有匹配设备。
      </div>

      <div
        v-else
        class="device-list"
      >
        <article
          v-for="item in visibleItems"
          :key="item.deviceCode"
          class="device-card"
          :class="{ 'device-card--managed': item.status === 'MANAGED' }"
          :data-code="item.deviceCode"
          :data-status="item.status"
        >
          <header class="device-card__header">
            <div class="device-identity">
              <strong>{{ item.deviceCode }}</strong>
              <span>{{ displayName(item) }}</span>
            </div>
            <div class="device-card__actions">
              <el-tag
                :type="statusTagType(item.status)"
                effect="plain"
              >
                {{ statusLabel(item.status) }}
              </el-tag>
              <AppButton
                v-if="item.status === 'DISCOVERED_UNMANAGED'"
                class="onboard-action"
                size="small"
                type="primary"
                :disabled="!discovery.canOnboard(item)"
                @click="onboard(item)"
              >
                接管
              </AppButton>
            </div>
          </header>

          <p class="status-reason">{{ statusReason(item) }}</p>

          <div
            v-if="item.ecs"
            class="runtime-summary"
          >
            <span :class="item.ecs.state.is_online ? 'is-online' : 'is-offline'">
              {{ item.ecs.state.is_online ? '在线' : '离线' }}
            </span>
            <span>{{ item.ecs.state.mode }}</span>
            <span>{{ item.ecs.state.status }}</span>
            <span v-if="item.ecs.state.current_command_code">
              {{ item.ecs.state.current_command_code }}
            </span>
          </div>

          <details :open="item.status !== 'MANAGED'">
            <summary>设备详情</summary>
            <div
              v-if="item.ecs"
              class="device-details"
            >
              <div class="detail-row">
                <span>设备类型</span>
                <code>{{ item.ecs.device.device_type ?? '未声明' }}</code>
              </div>
              <div class="detail-row">
                <span>ECS 角色</span>
                <code>{{ item.ecs.device.role ?? '未声明' }}</code>
              </div>
              <div class="capability-group">
                <span>supported_commands</span>
                <div class="capability-values">
                  <span v-if="item.ecs.device.supported_commands === null">未声明</span>
                  <span v-else-if="item.ecs.device.supported_commands.length === 0">无</span>
                  <el-tag
                    v-for="command in item.ecs.device.supported_commands"
                    v-else
                    :key="command"
                    size="small"
                    effect="plain"
                  >
                    {{ command }}
                  </el-tag>
                </div>
              </div>
              <div class="capability-group">
                <span>supported_events</span>
                <div class="capability-values">
                  <span v-if="item.ecs.device.supported_events === null">未声明</span>
                  <span v-else-if="item.ecs.device.supported_events.length === 0">无</span>
                  <el-tag
                    v-for="event in item.ecs.device.supported_events"
                    v-else
                    :key="event"
                    size="small"
                    effect="plain"
                  >
                    {{ event }}
                  </el-tag>
                </div>
              </div>
            </div>
            <p
              v-else
              class="no-snapshot"
            >
              本次 ECS 未返回设备，无能力快照。
            </p>
          </details>
        </article>
      </div>
    </div>
  </StandardDrawer>
</template>

<style scoped>
.discovery-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.endpoint-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.result-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  cursor: pointer;
}

.summary-filter:hover,
.summary-filter.is-active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.summary-filter span {
  font-family: var(--font-family-mono);
}

.device-search {
  width: min(220px, 100%);
  padding: 8px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.device-search:focus {
  border-color: var(--color-primary);
  outline: 2px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  outline-offset: 1px;
}

.result-placeholder {
  padding: 48px 16px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--color-warning);
  border-radius: 10px;
  background: var(--el-bg-color);
}

.device-card[data-status='DISCOVERED_UNMANAGED'] {
  border-left-color: var(--color-info);
}

.device-card--managed {
  border-left-color: var(--color-success);
  opacity: 0.68;
}

.device-card__header,
.device-card__actions,
.runtime-summary,
.capability-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-card__header {
  justify-content: space-between;
}

.device-identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.device-identity strong,
.detail-row code {
  font-family: var(--font-family-mono);
}

.device-identity span,
.status-reason,
.runtime-summary,
.detail-row > span,
.capability-group > span,
.no-snapshot {
  color: var(--el-text-color-secondary);
}

.status-reason {
  margin: 10px 0;
}

.runtime-summary {
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-family: var(--font-family-mono);
  font-size: 12px;
}

.is-online {
  color: var(--color-success);
}

.is-offline {
  color: var(--color-warning);
}

details {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 10px;
}

summary {
  color: var(--el-text-color-regular);
  cursor: pointer;
  font-weight: 600;
}

.device-details {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.detail-row,
.capability-group {
  display: grid;
  grid-template-columns: minmax(132px, auto) minmax(0, 1fr);
  gap: 12px;
}

.capability-values {
  min-width: 0;
  flex-wrap: wrap;
}

@media (width < 640px) {
  .endpoint-row,
  .detail-row,
  .capability-group {
    grid-template-columns: 1fr;
  }

  .result-tools {
    align-items: stretch;
    flex-direction: column;
  }

  .device-search {
    width: 100%;
  }

  .device-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
