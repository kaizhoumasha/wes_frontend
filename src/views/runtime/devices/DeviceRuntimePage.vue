<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">设备运行时</h1>
        <p class="runtime-page__subtitle">
          跨工作线查看所有设备运行状态，按状态分组筛选，支持维护模式管理。
        </p>
      </div>
    </div>

    <div class="device-filter-bar">
      <el-select
        v-model="filterStatus"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
      >
        <el-option
          label="异常"
          value="abnormal"
        />
        <el-option
          label="维护中"
          value="maintenance"
        />
        <el-option
          label="正常"
          value="healthy"
        />
        <el-option
          label="离线"
          value="offline"
        />
      </el-select>
      <el-input
        v-model="searchText"
        placeholder="搜索设备名称/编码..."
        clearable
        style="width: 220px"
      />
    </div>

    <div
      v-if="loading"
      class="device-grid__loading"
    >
      <el-skeleton
        v-for="n in 6"
        :key="n"
        animated
        class="device-grid__skeleton"
      />
    </div>

    <RuntimeEmptyState
      v-else-if="loadError"
      title="加载失败"
      :description="loadError"
      hint="请检查后端连接后重试"
    />

    <RuntimeEmptyState
      v-else-if="!loading && allDevices.length === 0"
      title="当前无运行中的设备"
      description="未找到任何活跃设备数据。"
      hint="请确认后端工作线已绑定设备。"
    />

    <div
      v-else
      class="device-grid"
    >
      <div
        v-for="device in filteredDevices"
        :key="device.id"
        class="device-card"
        :class="`device-card--${deviceStatusTone(device)}`"
        @click="showDetail(device)"
      >
        <div class="device-card__top">
          <RuntimeStatusBadge
            :label="deviceStatusLabel(device)"
            :tone="deviceStatusTone(device)"
            size="small"
          />
          <span class="device-card__id">{{ device.device_code }}</span>
        </div>
        <div class="device-card__name">{{ device.device_name }}</div>
        <div class="device-card__meta">
          <span class="device-card__role">{{ device.device_role }}</span>
          <template v-if="device.workline_name">· {{ device.workline_name }}</template>
        </div>
        <div
          v-if="device.maintenance_mode"
          class="device-card__maintenance"
        >
          维护中
        </div>
      </div>
    </div>

    <StandardDrawer
      v-model="drawerOpen"
      direction="rtl"
      size="lg"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      custom-class="runtime-device-drawer"
      @close="selectedDevice = null"
    >
      <template #header>
        <div
          v-if="selectedDevice"
          class="device-drawer__header"
        >
          <strong class="device-drawer__title">
            {{ selectedDevice.device_name }}
          </strong>
          <span class="device-drawer__meta">
            {{ selectedDevice.device_code }} · {{ selectedDevice.device_role }}
          </span>
        </div>
      </template>

      <RuntimeDeviceInspector
        v-if="selectedDevice && selectedDevice.workline_id"
        :device-id="selectedDevice.id"
        :workline-id="selectedDevice.workline_id"
        :show-header="false"
        @close="drawerOpen = false"
        @select-session="openTrace"
      />
      <RuntimeEmptyState
        v-else-if="selectedDevice"
        title="无法加载设备详情"
        description="该设备缺少工作线关联信息。"
        hint="请通过工作线监控页面查看此设备。"
      />
    </StandardDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { runtimeApiMethods } from '@/api/modules/runtime'
import RuntimeDeviceInspector from '@/components/runtime/devices/RuntimeDeviceInspector.vue'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
import type {
  RuntimeDeviceSummary,
  RuntimeTraceListItem,
  RuntimeWorklineSummary
} from '@/types/runtime'
import { readPositiveInt, type RuntimeTone } from '@/utils/runtime-display'

interface DeviceWithWorkline extends RuntimeDeviceSummary {
  workline_name?: string | null
}

const loading = ref(false)
const loadError = ref<string | null>(null)
const allDevices = ref<DeviceWithWorkline[]>([])
const filterStatus = ref<string | null>(null)
const searchText = ref('')
const drawerOpen = ref(false)
const selectedDevice = ref<DeviceWithWorkline | null>(null)
const route = useRoute()
const router = useRouter()

const filteredDevices = computed(() => {
  let items = allDevices.value
  if (filterStatus.value) {
    items = items.filter(d => deviceStatusKey(d) === filterStatus.value)
  }
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    items = items.filter(
      d => d.device_name.toLowerCase().includes(q) || d.device_code.toLowerCase().includes(q)
    )
  }
  return [...items].sort((a, b) => {
    const sev: Record<string, number> = { abnormal: 0, offline: 1, maintenance: 2, healthy: 3 }
    return (sev[deviceStatusKey(a)] ?? 4) - (sev[deviceStatusKey(b)] ?? 4)
  })
})

function deviceStatusKey(d: RuntimeDeviceSummary): string {
  if (d.maintenance_mode) return 'maintenance'
  if (d.device_status === 'ERROR' || d.device_status === 'FAULT') return 'abnormal'
  if (d.device_status === 'OFFLINE') return 'offline'
  return 'healthy'
}

function deviceStatusLabel(d: RuntimeDeviceSummary): string {
  const m: Record<string, string> = {
    abnormal: '异常',
    offline: '离线',
    maintenance: '维护',
    healthy: '正常'
  }
  return m[deviceStatusKey(d)] ?? d.device_status
}

function deviceStatusTone(d: RuntimeDeviceSummary): RuntimeTone {
  const m: Record<string, RuntimeTone> = {
    abnormal: 'danger',
    offline: 'danger',
    maintenance: 'warning',
    healthy: 'success'
  }
  return m[deviceStatusKey(d)] ?? 'info'
}

function showDetail(device: DeviceWithWorkline) {
  selectedDevice.value = device
  drawerOpen.value = true
}

function syncSelectedDeviceFromRoute() {
  const deviceId = readPositiveInt(route.query.deviceId)
  if (!deviceId) return

  const device = allDevices.value.find(item => item.id === deviceId) ?? null
  selectedDevice.value = device
  drawerOpen.value = Boolean(device)
}

function openTrace(session: RuntimeTraceListItem) {
  router.push({
    name: 'RuntimeTraces',
    query: {
      sessionId: String(session.session_id),
      traceId: session.trace_id ?? undefined,
      worklineId: String(session.workline_id),
      deviceId: session.device_id ? String(session.device_id) : undefined
    }
  })
}

async function loadDevices() {
  loading.value = true
  loadError.value = null
  try {
    const worklineList: RuntimeWorklineSummary[] = await runtimeApiMethods.worklines().send()
    const results = await Promise.allSettled(
      worklineList.map(wl => runtimeApiMethods.devices(wl.id).send())
    )
    const devices: DeviceWithWorkline[] = []
    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      if (r.status === 'fulfilled') {
        for (const d of r.value) {
          devices.push({ ...d, workline_name: worklineList[i]?.line_name })
        }
      }
    }
    allDevices.value = devices
    syncSelectedDeviceFromRoute()
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDevices()
})

watch(
  () => route.query.deviceId,
  () => {
    syncSelectedDeviceFromRoute()
  }
)
</script>

<style scoped>
.device-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.device-grid__loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.device-grid__skeleton {
  height: 120px;
  border-radius: 10px;
}

.device-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgb(245 158 11 / 0.12);
  border-radius: 12px;
  border-left: 3px solid rgb(245 158 11 / 0.4);
  background: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}

.device-card:hover {
  border-color: rgb(245 158 11 / 0.28);
}

.device-card--danger {
  border-left-color: rgb(220 38 38 / 0.6);
}

.device-card--warning {
  border-left-color: rgb(234 179 8 / 0.5);
}

.device-card--success {
  border-left-color: rgb(22 163 74 / 0.5);
}

.device-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-card__id {
  margin-left: auto;
  color: #64748b;
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 12px;
}

.device-card__name {
  color: #f8fafc;
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 16px;
  font-weight: 700;
}

.device-card__meta {
  color: #94a3b8;
  font-size: 12px;
}

.device-card__role {
  color: #f59e0b;
  font-weight: 600;
}

.device-card__maintenance {
  margin-top: 2px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(234 179 8 / 0.12);
  color: #eab308;
  font-size: 11px;
  font-weight: 700;
  align-self: flex-start;
}

.device-drawer__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-drawer__title {
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono');
}

.device-drawer__meta {
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-mono, 'JetBrains Mono');
}

.runtime-page__subtitle {
  max-width: 600px;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}
</style>
