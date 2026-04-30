<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <!-- 面包屑导航（选中设备时显示） -->
      <div
        v-if="selectedDeviceId && selectedDeviceDetail"
        class="runtime-context-nav"
      >
        <button
          type="button"
          class="runtime-context-nav__back"
          @click="closeDevicePanel"
        >
          ← 返回工作线
        </button>
        <span class="runtime-context-nav__workline">
          {{ currentWorklineSummary?.line_name || '工作线' }}
        </span>
        <span class="runtime-context-nav__sep">›</span>
        <span class="runtime-context-nav__device">
          {{ selectedDeviceDetail.device_name }}
        </span>
        <span class="runtime-context-nav__meta">
          {{ selectedDeviceDetail.device_code }} · {{ selectedDeviceDetail.device_role }}
        </span>
      </div>
      <!-- 默认标题（未选中设备时显示） -->
      <div v-else>
        <h1 class="runtime-page__title">工作线运行监控</h1>
        <p class="runtime-page__subtitle">
          先看线体摘要，再下钻拓扑、运行队列与失败链路，确认阻塞是局部节点问题还是线体级异常。
        </p>
      </div>
      <div class="runtime-page__status-bar runtime-control-cluster">
        <RuntimeStatusBadge
          :label="connectionLabel"
          :tone="connectionTone"
          :pulse="live && state === 'connected'"
        />
        <el-switch
          :model-value="live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          @change="value => toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="lastRefreshedAt"
          :frozen="!live"
        />
        <el-button
          plain
          class="runtime-page__refresh-action"
          @click="refreshWorklines"
        >
          刷新当前视图
        </el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="runtime-layout">
      <el-card
        shadow="never"
        class="runtime-panel runtime-layout__list"
      >
        <template #header>
          <div class="runtime-panel__header runtime-panel__header--compact">
            <div
              v-if="selectedWorklineContextName"
              class="runtime-workline-context runtime-workline-context--compact runtime-compact-context"
            >
              <strong
                class="runtime-workline-context__name runtime-compact-context__name"
                :title="selectedWorklineContextName"
              >
                {{ selectedWorklineContextName }}
              </strong>
              <span class="runtime-workline-context__meta runtime-compact-context__meta">
                {{ selectedWorklineContextMeta }}
              </span>
            </div>
            <div
              v-else
              class="runtime-workline-placeholder"
            >
              选择工作线后查看线体运行态
            </div>
          </div>
        </template>

        <div class="runtime-layout__list-scroll">
          <div
            v-if="worklines.length"
            class="runtime-directory-list"
          >
            <button
              v-for="item in orderedWorklines"
              :key="item.id"
              type="button"
              class="runtime-directory-card"
              :class="{ 'is-active': item.id === selectedWorklineId }"
              @click="selectWorkline(item)"
            >
              <div class="runtime-directory-card__top">
                <RuntimeStatusBadge
                  :label="worklineRiskLabel(item)"
                  :tone="worklineRiskTone(item)"
                  size="small"
                />
                <span class="runtime-directory-card__time">
                  {{ worklineLastActivityLabel(item) }}
                </span>
              </div>
              <div class="runtime-directory-card__title">{{ item.line_name }}</div>
              <div class="runtime-directory-card__meta">
                <span class="runtime-directory-card__run-mode">{{ item.run_mode }}</span>
                {{ item.line_code }} · {{ item.zone_name || '未配置区域' }}
              </div>
              <div class="runtime-directory-card__hint">
                活跃 {{ item.active_session_count }} · 等待 {{ item.waiting_session_count }} · 失败
                {{ item.failed_session_count }} · 离线 {{ item.offline_device_count }}
              </div>
            </button>
          </div>
          <RuntimeEmptyState
            v-else
            title="暂无工作线数据"
            description="当前还没有可用于运行监控的工作线样本。"
            hint="请确认后端工作线主数据、权限与 API 返回是否正常。"
          />
        </div>
      </el-card>

      <div class="runtime-layout__detail">
        <template v-if="detail">
          <!-- Mode Switcher (SIMULATION worklines only) -->
          <div
            v-if="sandboxAllowed === 'allowed'"
            class="runtime-mode-switcher"
          >
            <button
              type="button"
              class="runtime-mode-tab"
              :class="{ 'is-active': effectiveMode === 'live' }"
              @click="switchToLive()"
            >
              实时态势
            </button>
            <button
              type="button"
              class="runtime-mode-tab"
              :class="{ 'is-active': effectiveMode === 'sandbox' }"
              @click="switchToSandbox()"
            >
              Sandbox
            </button>
          </div>

          <template v-if="effectiveMode === 'trace' && (modeSessionId || modeTraceId)">
            <TraceFocusPanel
              :workline-id="detail.summary.id"
              :session-id="modeSessionId ? Number(modeSessionId) : null"
              :trace-id="modeTraceId"
              @back-to-live="switchToLive()"
            />
          </template>
          <template v-else-if="effectiveMode === 'sandbox'">
            <SandboxWorkbench
              :workline-id="detail.summary.id"
              :devices="detail.devices"
              :device-id="selectedDeviceId"
              :run-mode="detail.summary.run_mode"
              @refresh="refreshWorklines"
            />
          </template>
          <template v-else>
            <WorklineLiveOverview
              :workline-summary="detail.summary"
              :devices="detail.devices"
              :active-sessions="detail.active_sessions"
              :recent-failed-traces="detail.recent_failed_traces"
              :selected-device-id="selectedDeviceId"
              :session-counts-by-device="sessionCountsByDevice"
              @select-device="openDevice"
              @select-session="handleSelectSession"
            />

            <el-card
              shadow="never"
              class="runtime-panel"
            >
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">异常热点</div>
                    <div class="runtime-panel__subtitle">
                      帮助判断这是局部节点问题，还是线体级模式性异常
                    </div>
                  </div>
                </div>
              </template>

              <div class="hotspot-grid">
                <div class="hotspot-card">
                  <span>焦点设备</span>
                  <strong>{{ hotspotDevice?.device_name || '—' }}</strong>
                  <p>
                    {{
                      hotspotDevice
                        ? `${hotspotDevice.device_code} · ${hotspotDevice.error_code || hotspotDevice.device_status}`
                        : '当前未识别到明显异常节点'
                    }}
                  </p>
                </div>
                <div class="hotspot-card">
                  <span>高频失败 Step</span>
                  <strong>{{ mostFailedStep || '—' }}</strong>
                  <p>基于最近失败 Trace 的 step 分布</p>
                </div>
                <div class="hotspot-card">
                  <span>主要等待 Step</span>
                  <strong>{{ dominantActiveStep || '—' }}</strong>
                  <p>基于当前活跃 Session 的 step 聚合</p>
                </div>
                <div class="hotspot-card">
                  <span>最近活动</span>
                  <strong>{{ worklineLastActivityLabel(detail.summary) }}</strong>
                  <p>
                    {{ detail.summary.owner_team || '未配置 owner' }} /
                    {{ detail.summary.support_contact || '未配置 support' }}
                  </p>
                </div>
              </div>
            </el-card>

            <!-- 设备详情抽屉 -->
            <el-drawer
              v-model="isDevicePanelOpen"
              direction="rtl"
              size="600px"
              :close-on-click-modal="true"
              :close-on-press-escape="true"
              class="runtime-device-drawer"
              @close="closeDevicePanel"
            >
              <template #header>
                <div
                  v-if="selectedDeviceDetail"
                  class="runtime-device-drawer__header"
                >
                  <strong class="runtime-device-drawer__title">
                    {{ selectedDeviceDetail.device_name }}
                  </strong>
                  <span class="runtime-device-drawer__meta">
                    {{ selectedDeviceDetail.device_code }} · {{ selectedDeviceDetail.device_role }}
                  </span>
                </div>
              </template>

              <RuntimeDeviceInspector
                v-if="selectedDeviceId"
                :device-id="selectedDeviceId"
                :workline-id="detail.summary.id"
                :mode="effectiveMode"
                :show-header="false"
                @close="closeDevicePanel"
                @select-session="handleSelectSession"
              />
            </el-drawer>
          </template>
        </template>

        <el-card
          v-else
          shadow="never"
          class="runtime-panel runtime-layout__empty-state"
        >
          <RuntimeEmptyState
            title="还没有选中工作线"
            description="请从左侧线体目录选择一条工作线，进入拓扑与运行队列视图。"
            hint="目录会保持稳定排序；当前选中的工作线只高亮，不再置顶。"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RuntimeDeviceInspector from '@/components/common/runtime/RuntimeDeviceInspector.vue'
import SandboxWorkbench from '@/components/common/runtime/SandboxWorkbench.vue'
import TraceFocusPanel from '@/components/common/runtime/TraceFocusPanel.vue'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import WorklineLiveOverview from '@/components/common/runtime/WorklineLiveOverview.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { useWorklineMode } from '@/composables/useWorklineMode'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type {
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { isRelevantRuntimeEvent } from '@/utils/runtime-event'
import {
  aggregateSessionsByDevice,
  formatRuntimeDateTime,
  getWorklineRiskLabel as worklineRiskLabel,
  getWorklineRiskScore,
  getWorklineRiskTone as worklineRiskTone,
  pickDominantValue,
  readPositiveInt,
  sortByScoreDesc
} from '@/utils/runtime-display'

const route = useRoute()
const router = useRouter()
const {
  connectionLabel,
  connectionTone,
  lastEvent,
  lastRefreshedAt,
  live,
  markRefreshedAt,
  state,
  toggleLive
} = useRuntimePageChrome()

const loading = ref(false)
const worklines = ref<RuntimeWorklineSummary[]>([])
const detail = ref<RuntimeWorklineDetailResponse | null>(null)

const selectedDeviceId = computed(() => readPositiveInt(route.query.deviceId))
const isDevicePanelOpen = ref(false)

const selectedWorklineId = computed(() => readPositiveInt(route.query.worklineId))

const currentWorklineSummary = computed(() => {
  const selectedId = selectedWorklineId.value
  if (!selectedId) return detail.value?.summary ?? null
  return worklines.value.find(item => item.id === selectedId) ?? detail.value?.summary ?? null
})

const {
  effectiveMode,
  sessionId: modeSessionId,
  traceId: modeTraceId,
  sandboxAllowed,
  switchToLive,
  switchToTrace,
  switchToSandbox,
  selectWorkline: selectWorklineRoute
} = useWorklineMode(route, router, currentWorklineSummary)

const selectedWorklineContextName = computed(() => currentWorklineSummary.value?.line_name ?? null)

const selectedWorklineContextMeta = computed(() => {
  const summary = currentWorklineSummary.value
  if (!summary) return ''
  return `${summary.line_code} · ${summary.zone_name || '未配置区域'} · 活跃 ${summary.active_session_count} · 失败 ${summary.failed_session_count}`
})

const orderedWorklines = computed(() =>
  sortByScoreDesc(worklines.value, getWorklineRiskScore, item => item.id)
)

const hotspotDevice = computed<RuntimeWorklineDeviceItem | null>(() => {
  const devices = detail.value?.devices ?? []
  return (
    devices.find(item => ['ERROR', 'OFFLINE'].includes(item.device_status)) ??
    devices.find(item => Boolean(item.error_code)) ??
    devices.find(item => Boolean(item.current_command_id)) ??
    null
  )
})

const selectedDeviceDetail = computed<RuntimeWorklineDeviceItem | null>(() => {
  const deviceId = selectedDeviceId.value
  if (!deviceId || !detail.value) return null
  return detail.value.devices.find(item => item.id === deviceId) ?? null
})

const mostFailedStep = computed(() =>
  pickDominantValue(detail.value?.recent_failed_traces.map(item => item.step_code || '—') ?? [])
)
const dominantActiveStep = computed(() =>
  pickDominantValue(detail.value?.active_sessions.map(item => item.step_code || '—') ?? [])
)
const sessionCountsByDevice = computed(() =>
  aggregateSessionsByDevice(detail.value?.active_sessions ?? [])
)

function worklineLastActivityLabel(item: RuntimeWorklineSummary) {
  return item.last_activity_at ? formatRuntimeDateTime(item.last_activity_at) : '暂无活动'
}

async function loadDetail(worklineId: number) {
  detail.value = await runtimeApiMethods.worklineDetail(worklineId).send()
  if (selectedDeviceId.value) {
    isDevicePanelOpen.value = true
  }
  markRefreshedAt()
}

async function ensureWorklineRouteSelection(): Promise<boolean> {
  if (selectedWorklineId.value || !worklines.value[0]?.id) return false
  await router.replace({
    query: { ...route.query, ...buildRuntimeWorklineQuery(worklines.value[0].id) }
  })
  return true
}

async function syncWorklineDetailFromRoute(): Promise<void> {
  if (!selectedWorklineId.value) {
    detail.value = null
    return
  }
  if (detail.value?.summary.id === selectedWorklineId.value) return
  await loadDetail(selectedWorklineId.value)
}

async function loadWorklines() {
  worklines.value = await runtimeApiMethods.worklines().send()
  const routeChanged = await ensureWorklineRouteSelection()
  if (!routeChanged) {
    await syncWorklineDetailFromRoute()
  }
  markRefreshedAt()
}

const refreshWorklines = createCoalescedAsyncTask(async () => {
  loading.value = true
  try {
    await loadWorklines()
  } finally {
    loading.value = false
  }
})

const syncWorklineDetailFromRouteCoalesced = createCoalescedAsyncTask(async () => {
  loading.value = true
  try {
    await syncWorklineDetailFromRoute()
  } finally {
    loading.value = false
  }
})

async function selectWorkline(row: { id: number }) {
  if (selectedWorklineId.value === row.id) return
  selectWorklineRoute(row.id)
}

function handleSelectSession(session: RuntimeTraceListItem) {
  switchToTrace(String(session.session_id), session.trace_id ?? undefined)
}

function openDevice(deviceId: number) {
  isDevicePanelOpen.value = true
  router.replace({
    query: {
      ...route.query,
      ...buildRuntimeWorklineQuery(detail.value?.summary.id, deviceId)
    }
  })
}

function closeDevicePanel() {
  isDevicePanelOpen.value = false
  const query = { ...route.query }
  delete query.deviceId
  router.replace({ query })
}

onMounted(() => {
  void refreshWorklines()
})

watch(
  () => selectedWorklineId.value,
  (nextWorklineId, previousWorklineId) => {
    if (!nextWorklineId || nextWorklineId === previousWorklineId) return
    void syncWorklineDetailFromRouteCoalesced()
  }
)

watch(
  () => selectedDeviceId.value,
  nextDeviceId => {
    if (nextDeviceId && detail.value) {
      isDevicePanelOpen.value = true
    } else if (!nextDeviceId) {
      isDevicePanelOpen.value = false
    }
  }
)

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    if (
      !isRelevantRuntimeEvent(event, {
        worklineId: detail.value?.summary.id ?? selectedWorklineId.value
      })
    )
      return
    await refreshWorklines()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 860px;
}

.runtime-context-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.runtime-context-nav__back {
  padding: 6px 12px;
  border: 1px solid rgb(245, 158, 11, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgb(245, 158, 11);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.runtime-context-nav__back:hover {
  background: rgb(245, 158, 11, 0.1);
  border-color: rgb(245, 158, 11, 0.3);
}

.runtime-context-nav__workline {
  color: #cbd5e1;
  font-size: 14px;
}

.runtime-context-nav__sep {
  color: #64748b;
  font-size: 14px;
}

.runtime-context-nav__device {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 600;
}

.runtime-context-nav__meta {
  margin-left: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-mono);
}

.runtime-mode-switcher {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 10px;
  background: rgb(30, 41, 59, 0.78);
}

.runtime-mode-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.runtime-mode-tab:hover {
  color: #f8fafc;
}

.runtime-mode-tab.is-active {
  background: rgb(245, 158, 11, 0.18);
  color: rgb(245, 158, 11);
}

.runtime-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 340px minmax(0, 1fr);
  align-items: stretch;
}

.runtime-layout__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.runtime-layout__hero {
  flex: 0 0 auto;
}

/* Device Drawer Styles */
.runtime-device-drawer :deep(.el-drawer__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgb(245, 158, 11, 0.12);
  margin-bottom: 0;
}

.runtime-device-drawer :deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.runtime-device-drawer__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-device-drawer__title {
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.runtime-device-drawer__meta {
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-mono);
}

.runtime-workline-placeholder {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 12px;
  line-height: 1.5;
}

.runtime-workline-context--compact {
  flex: 1 1 auto;
}

.runtime-layout__list-scroll {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  flex-direction: column;
}

.runtime-directory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-directory-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 14px;
  background: rgb(30, 41, 59, 0.78);
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.runtime-directory-card:hover {
  transform: translateY(-1px);
  border-color: rgb(245, 158, 11, 0.28);
}

.runtime-directory-card.is-active {
  border-color: rgb(245, 158, 11, 0.38);
  background: rgb(245, 158, 11, 0.08);
}

.runtime-directory-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.runtime-directory-card__time,
.runtime-directory-card__meta,
.runtime-directory-card__hint {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.runtime-directory-card__title {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.runtime-directory-card__meta {
  color: #cbd5e1;
}

.runtime-directory-card__run-mode {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgb(245, 158, 11, 0.12);
  color: rgb(245, 158, 11);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-right: 4px;
}

.hotspot-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hotspot-card {
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 14px;
  background: rgb(30, 41, 59, 0.78);
}

.hotspot-card span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hotspot-card strong {
  display: block;
  margin-top: 8px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
}

.hotspot-card p {
  margin-top: 10px;
  color: #94a3b8;
  line-height: 1.6;
}

.runtime-layout__empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

@media (width >= 1280px) and (height >= 900px) {
  .runtime-layout {
    height: calc(100vh - 210px);
    min-height: 620px;
    overflow: hidden;
  }

  .runtime-layout__list,
  .runtime-layout__detail {
    height: 100%;
    min-height: 0;
  }

  .runtime-layout__detail {
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .runtime-layout__list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .runtime-layout__list :deep(.el-card__header) {
    flex: 0 0 auto;
  }

  .runtime-layout__list :deep(.el-card__body) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .runtime-layout__list-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }
}

@media (width >= 1280px) and (height <= 899px) {
  .runtime-layout {
    align-items: start;
  }

  .runtime-layout__list-scroll {
    overflow: visible;
    padding-right: 0;
  }
}

@media (width <= 1279px) {
  .runtime-page__header,
  .runtime-layout,
  .hotspot-grid {
    display: flex;
    flex-direction: column;
  }

  .runtime-page__status-bar {
    justify-content: flex-start;
  }

  .runtime-layout__list-scroll {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
