<template>
  <div v-loading="loading" class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">工作线运行监控</h1>
        <p class="runtime-page__subtitle">先看线体摘要，再下钻拓扑、运行队列与失败链路，确认阻塞是局部节点问题还是线体级异常。</p>
      </div>
      <div class="runtime-page__status-bar runtime-control-cluster">
        <RuntimeStatusBadge :label="connectionLabel" :tone="connectionTone" :pulse="live && state === 'connected'" />
        <el-switch :model-value="live" inline-prompt active-text="Live" inactive-text="Frozen" @change="value => toggleLive(Boolean(value))" />
        <RuntimeLastUpdated :value="lastRefreshedAt" :frozen="!live" />
        <el-button plain class="runtime-page__refresh-action" @click="refreshWorklines">刷新当前视图</el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="runtime-layout">
      <el-card shadow="never" class="runtime-panel runtime-layout__list">
        <template #header>
          <div class="runtime-panel__header runtime-panel__header--compact">
            <div v-if="selectedWorklineContextName" class="runtime-workline-context runtime-workline-context--compact runtime-compact-context">
              <strong class="runtime-workline-context__name runtime-compact-context__name" :title="selectedWorklineContextName">{{ selectedWorklineContextName }}</strong>
              <span class="runtime-workline-context__meta runtime-compact-context__meta">{{ selectedWorklineContextMeta }}</span>
            </div>
            <div v-else class="runtime-workline-placeholder">选择工作线后查看线体运行态</div>
          </div>
        </template>

        <div class="runtime-layout__list-scroll">
          <div v-if="worklines.length" class="runtime-directory-list">
          <button
            v-for="item in orderedWorklines"
            :key="item.id"
            type="button"
            class="runtime-directory-card"
            :class="{ 'is-active': item.id === selectedWorklineId }"
            @click="selectWorkline(item)"
          >
            <div class="runtime-directory-card__top">
              <RuntimeStatusBadge :label="worklineRiskLabel(item)" :tone="worklineRiskTone(item)" size="small" />
              <span class="runtime-directory-card__time">{{ worklineLastActivityLabel(item) }}</span>
            </div>
            <div class="runtime-directory-card__title">{{ item.line_name }}</div>
            <div class="runtime-directory-card__meta">{{ item.line_code }} · {{ item.zone_name || '未配置区域' }}</div>
            <div class="runtime-directory-card__hint">活跃 {{ item.active_session_count }} · 等待 {{ item.waiting_session_count }} · 失败 {{ item.failed_session_count }} · 离线 {{ item.offline_device_count }}</div>
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
          <WorklineHealthHero :summary="detail.summary" class="runtime-layout__hero" />

          <div class="runtime-layout__detail-scroll">
            <el-card shadow="never" class="runtime-panel">
            <template #header>
              <div class="runtime-panel__header">
                <div>
                  <div class="runtime-panel__title">拓扑主视图</div>
                  <div class="runtime-panel__subtitle">用线体设备拓扑确认阻塞发生在哪个节点，再直接进入设备页。</div>
                </div>
                <RuntimeStatusBadge :label="hotspotDevice ? `焦点设备 ${hotspotDevice.device_code}` : '无明显热点'" :tone="hotspotDevice ? 'danger' : 'success'" size="small" />
              </div>
            </template>

            <WorklineTopologyStrip :devices="detail.devices" :selected-device-id="hotspotDevice?.id ?? null" @select="openDevice" />
          </el-card>

          <div class="workline-grid workline-grid--two">
            <el-card shadow="never" class="runtime-panel">
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">运行队列</div>
                    <div class="runtime-panel__subtitle">当前仍在这条线体上推进的 Session</div>
                  </div>
                </div>
              </template>

              <div v-if="detail.active_sessions.length" class="trace-list">
                <button v-for="item in detail.active_sessions" :key="item.session_id" type="button" class="trace-list__item" @click="openTrace(item.session_id)">
                  <div class="trace-list__head">
                    <RuntimeStatusBadge :status="item.status" size="small" />
                    <span>{{ formatRuntimeElapsed(item.started_at) }}</span>
                  </div>
                  <div class="trace-list__title">{{ item.session_code }}</div>
                  <div class="trace-list__meta">{{ item.step_code || '—' }} · {{ item.device_name || '等待设备绑定' }}</div>
                  <div class="trace-list__hint">{{ item.latest_timeline_message || item.current_wait_type || '查看时间轴获取更多信息' }}</div>
                </button>
              </div>
              <RuntimeEmptyState
                v-else
                title="当前没有活跃 Session"
                description="这条线当前没有正在推进中的链路，可能处于空闲期或暂未接收到新任务。"
              />
            </el-card>

            <el-card shadow="never" class="runtime-panel">
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">最近失败链路</div>
                    <div class="runtime-panel__subtitle">优先判断是否为同一设备 / 同一步骤重复失败</div>
                  </div>
                </div>
              </template>

              <div v-if="detail.recent_failed_traces.length" class="trace-list">
                <button v-for="item in detail.recent_failed_traces" :key="item.session_id" type="button" class="trace-list__item trace-list__item--danger" @click="openTrace(item.session_id)">
                  <div class="trace-list__head">
                    <RuntimeStatusBadge :status="item.status" size="small" />
                    <span>{{ formatRuntimeDateTime(item.last_ingress_at || item.started_at) }}</span>
                  </div>
                  <div class="trace-list__title">{{ item.session_code }}</div>
                  <div class="trace-list__meta">{{ item.step_code || '—' }} · {{ item.device_name || '未关联设备' }}</div>
                  <div class="trace-list__hint">{{ item.failure_domain || item.failure_code || item.latest_timeline_message || '查看 Trace 获得故障原因' }}</div>
                </button>
              </div>
              <RuntimeEmptyState
                v-else
                title="近 24 小时暂无失败链路"
                description="当前未发现需要优先排障的线体级失败样本。"
              />
            </el-card>
          </div>

            <el-card shadow="never" class="runtime-panel">
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">异常热点</div>
                    <div class="runtime-panel__subtitle">帮助判断这是局部节点问题，还是线体级模式性异常</div>
                  </div>
                </div>
              </template>

              <div class="hotspot-grid">
                <div class="hotspot-card">
                  <span>焦点设备</span>
                  <strong>{{ hotspotDevice?.device_name || '—' }}</strong>
                  <p>{{ hotspotDevice ? `${hotspotDevice.device_code} · ${hotspotDevice.error_code || hotspotDevice.device_status}` : '当前未识别到明显异常节点' }}</p>
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
                  <p>{{ detail.summary.owner_team || '未配置 owner' }} / {{ detail.summary.support_contact || '未配置 support' }}</p>
                </div>
              </div>
            </el-card>
          </div>
        </template>

        <el-card v-else shadow="never" class="runtime-panel runtime-layout__empty-state">
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
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import WorklineHealthHero from '@/components/common/runtime/WorklineHealthHero.vue'
import WorklineTopologyStrip from '@/components/common/runtime/WorklineTopologyStrip.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { buildRuntimeDeviceQuery, buildRuntimeTraceQuery, buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { RuntimeWorklineDetailResponse, RuntimeWorklineDeviceItem, RuntimeWorklineSummary } from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { formatRuntimeDateTime, formatRuntimeElapsed, getWorklineRiskLabel as worklineRiskLabel, getWorklineRiskScore, getWorklineRiskTone as worklineRiskTone, pickDominantValue, readPositiveInt, sortByScoreDesc } from '@/utils/runtime-display'

const route = useRoute()
const router = useRouter()
const { connectionLabel, connectionTone, lastEvent, lastRefreshedAt, live, markRefreshedAt, state, toggleLive } = useRuntimePageChrome()

const loading = ref(false)
const worklines = ref<RuntimeWorklineSummary[]>([])
const detail = ref<RuntimeWorklineDetailResponse | null>(null)

const selectedWorklineId = computed(() => readPositiveInt(route.query.worklineId))

const selectedWorklineSummary = computed(() => {
  const selectedId = selectedWorklineId.value
  if (!selectedId) {
    return detail.value?.summary ?? null
  }

  return worklines.value.find(item => item.id === selectedId) ?? detail.value?.summary ?? null
})

const selectedWorklineContextName = computed(() => selectedWorklineSummary.value?.line_name ?? null)

const selectedWorklineContextMeta = computed(() => {
  const summary = selectedWorklineSummary.value
  if (!summary) {
    return ''
  }

  return `${summary.line_code} · ${summary.zone_name || '未配置区域'} · 活跃 ${summary.active_session_count} · 失败 ${summary.failed_session_count}`
})

const orderedWorklines = computed(() => sortByScoreDesc(worklines.value, getWorklineRiskScore, item => item.id))

const hotspotDevice = computed<RuntimeWorklineDeviceItem | null>(() => {
  const devices = detail.value?.devices ?? []
  return devices.find(item => ['ERROR', 'OFFLINE'].includes(item.device_status))
    ?? devices.find(item => Boolean(item.error_code))
    ?? devices.find(item => Boolean(item.current_command_id))
    ?? null
})

const mostFailedStep = computed(() => pickDominantValue(detail.value?.recent_failed_traces.map(item => item.step_code || '—') ?? []))
const dominantActiveStep = computed(() => pickDominantValue(detail.value?.active_sessions.map(item => item.step_code || '—') ?? []))

function worklineLastActivityLabel(item: RuntimeWorklineSummary) {
  return item.last_activity_at ? formatRuntimeDateTime(item.last_activity_at) : '暂无活动'
}

async function loadDetail(worklineId: number) {
  detail.value = await runtimeApiMethods.worklineDetail(worklineId).send()
  markRefreshedAt()
}

async function ensureWorklineRouteSelection(): Promise<boolean> {
  if (selectedWorklineId.value || !worklines.value[0]?.id) {
    return false
  }

  await router.replace({ query: { ...route.query, ...buildRuntimeWorklineQuery(worklines.value[0].id) } })
  return true
}

async function syncWorklineDetailFromRoute(): Promise<void> {
  if (!selectedWorklineId.value) {
    detail.value = null
    return
  }

  if (detail.value?.summary.id === selectedWorklineId.value) {
    return
  }

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
  if (selectedWorklineId.value === row.id) {
    return
  }

  await router.replace({ query: { ...route.query, ...buildRuntimeWorklineQuery(row.id) } })
}

function openTrace(sessionId: number) {
  router.push({ name: 'RuntimeTraceExplorer', query: buildRuntimeTraceQuery({ sessionId, worklineId: detail.value?.summary.id }) })
}

function openDevice(deviceId: number) {
  router.push({ name: 'RuntimeDevices', query: buildRuntimeDeviceQuery(deviceId, detail.value?.summary.id) })
}

onMounted(() => {
  void refreshWorklines()
})

watch(
  () => selectedWorklineId.value,
  (nextWorklineId, previousWorklineId) => {
    if (!nextWorklineId || nextWorklineId === previousWorklineId) {
      return
    }

    void syncWorklineDetailFromRouteCoalesced()
  }
)

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    if (!isRelevantRuntimeEvent(event, {
      worklineId: detail.value?.summary.id ?? selectedWorklineId.value
    })) {
      return
    }

    await refreshWorklines()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 860px;
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

.runtime-layout__detail-scroll {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.runtime-layout__detail-scroll > * {
  flex: 0 0 auto;
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

.runtime-directory-list,
.trace-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-directory-card,
.trace-list__item {
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

.runtime-directory-card:hover,
.trace-list__item:hover {
  transform: translateY(-1px);
  border-color: rgb(245, 158, 11, 0.28);
}

.runtime-directory-card.is-active {
  border-color: rgb(245, 158, 11, 0.38);
  background: rgb(245, 158, 11, 0.08);
}

.trace-list__item--danger {
  border-color: rgb(220, 38, 38, 0.18);
}

.runtime-directory-card__top,
.trace-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.runtime-directory-card__time,
.runtime-directory-card__meta,
.runtime-directory-card__hint,
.trace-list__head span,
.trace-list__meta,
.trace-list__hint {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.runtime-directory-card__title,
.trace-list__title {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.runtime-directory-card__meta,
.trace-list__meta {
  color: #cbd5e1;
}

.workline-grid--two,
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

@media (width >= 1280px) {
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

  .runtime-layout__list-scroll,
  .runtime-layout__detail-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }
}

@media (width <= 1279px) {
  .runtime-page__header,
  .runtime-layout,
  .workline-grid--two,
  .hotspot-grid {
    display: flex;
    flex-direction: column;
  }

  .runtime-page__status-bar {
    justify-content: flex-start;
  }

  .runtime-layout__detail-scroll,
  .runtime-layout__list-scroll {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
