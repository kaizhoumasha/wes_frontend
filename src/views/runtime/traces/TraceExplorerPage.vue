<template>
  <div v-loading="loading" class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">Trace 案件工作台</h1>
        <p class="runtime-page__subtitle">先看案件摘要，再沿 Timeline 与证据分组还原故障链路，并回到工作线 / 设备上下文继续处置。</p>
      </div>
      <div class="runtime-page__status-bar">
        <RuntimeStatusBadge :label="connectionLabel" :tone="connectionTone" :pulse="live && state === 'connected'" />
        <el-switch :model-value="live" inline-prompt active-text="Live" inactive-text="Frozen" @change="value => toggleLive(Boolean(value))" />
        <RuntimeLastUpdated :value="lastRefreshedAt" :frozen="!live" />
        <el-button plain @click="refreshCurrent">刷新当前视图</el-button>
      </div>
    </div>

    <el-card shadow="never" class="runtime-panel">
      <div class="trace-query-bar">
        <el-select v-model="queryType" class="trace-query-bar__type">
          <el-option label="Session ID" value="session" />
          <el-option label="Request ID" value="request" />
          <el-option label="Correlation ID" value="correlation" />
          <el-option label="Command Code" value="command" />
          <el-option label="Dispatch Key" value="dispatch" />
        </el-select>
        <el-input v-model="queryValue" class="trace-query-bar__input" placeholder="输入 trace 锚点" @keyup.enter="runTraceLookup" />
        <el-button type="primary" @click="runTraceLookup">查询案件</el-button>
        <div class="trace-query-bar__presets">
          <el-button :type="currentPreset === 'active' ? 'primary' : 'default'" plain @click="applyListPreset('active')">仅活跃</el-button>
          <el-button :type="currentPreset === 'failed' ? 'danger' : 'default'" plain @click="applyListPreset('failed')">仅失败/超时</el-button>
          <el-button :type="currentPreset === 'all' ? 'success' : 'default'" plain @click="applyListPreset('all')">全部</el-button>
        </div>
      </div>
    </el-card>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="trace-layout">
      <el-card shadow="never" class="runtime-panel trace-layout__context">
        <template #header>
          <div class="runtime-panel__header runtime-panel__header--compact">
            <div v-if="selectedTraceContextName" class="trace-context-summary trace-context-summary--compact">
              <strong class="trace-context-summary__name" :title="selectedTraceContextName">{{ selectedTraceContextName }}</strong>
              <span class="trace-context-summary__meta">{{ selectedTraceContextMeta }}</span>
            </div>
            <div v-else class="trace-context-placeholder">选择案件后查看上下文 Trace</div>
          </div>
        </template>

        <div class="trace-layout__context-scroll">
          <div v-if="traceListItems.length" class="trace-context-list">
          <button
            v-for="item in traceListItems"
            :key="item.session_id"
            type="button"
            class="trace-context-card"
            :class="{ 'is-active': item.session_id === selectedSessionId }"
            @click="selectTraceRow(item)"
          >
            <div class="trace-context-card__top">
              <RuntimeStatusBadge :status="item.status" size="small" />
              <span class="trace-context-card__time">{{ formatRuntimeDateTime(item.last_ingress_at || item.started_at) }}</span>
            </div>
            <div class="trace-context-card__title">{{ item.session_code }}</div>
            <div class="trace-context-card__meta">{{ traceWorklineText(item) }} · {{ traceDeviceText(item) }}</div>
            <div class="trace-context-card__hint">{{ item.step_code || '—' }} · {{ item.latest_timeline_message || item.failure_domain || item.current_wait_type || '等待更多证据' }}</div>
          </button>
        </div>
          <RuntimeEmptyState
            v-else
            title="当前筛选下没有上下文 Trace"
            description="你仍可使用上方锚点搜索直接进入案件；当前筛选只影响周边上下文，不影响已打开案件。"
            hint="尝试切换到‘全部’或‘仅失败/超时’，查看更多相邻链路。"
          />
        </div>
      </el-card>

      <div class="trace-layout__detail">
        <template v-if="traceDetail">
          <TraceCaseHero :detail="traceDetail" :workline-name="selectedWorklineName" :device-name="selectedDeviceName" class="trace-layout__hero" />

          <div class="trace-layout__detail-scroll">
            <el-card shadow="never" class="runtime-panel">
            <template #header>
              <div class="runtime-panel__header">
                <div>
                  <div class="runtime-panel__title">Timeline 主叙事</div>
                  <div class="runtime-panel__subtitle">先看最后成功节点、首次失败节点和当前终态，再展开证据。</div>
                </div>
              </div>
            </template>
            <TraceTimeline :items="traceDetail.timelines" />
          </el-card>

          <el-card shadow="never" class="runtime-panel">
            <template #header>
              <div class="runtime-panel__header">
                <div>
                  <div class="runtime-panel__title">证据分组</div>
                  <div class="runtime-panel__subtitle">先看能帮助判断的结构化证据，Raw JSON 放在最后兜底。</div>
                </div>
              </div>
            </template>

            <el-tabs v-model="activeTab" class="trace-evidence-tabs">
              <el-tab-pane label="诊断" name="diagnostics">
                <el-table :data="traceDetail.diagnostics" size="small">
                  <el-table-column prop="device_code" label="设备" min-width="120" />
                  <el-table-column prop="plugin_key" label="插件" min-width="120" />
                  <el-table-column prop="canonical_event_type" label="事件" min-width="150">
                    <template #default="scope">{{ compactEnumLabel(scope.row.canonical_event_type) }}</template>
                  </el-table-column>
                  <el-table-column prop="transition" label="转移" min-width="140">
                    <template #default="scope">{{ compactEnumLabel(scope.row.transition) }}</template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <el-tab-pane :label="`入口证据 (${traceDetail.callback_logs.length + traceDetail.inboxes.length})`" name="ingress">
                <div class="trace-evidence__section">
                  <div class="trace-evidence__section-title">Callback</div>
                  <el-table :data="traceDetail.callback_logs" size="small">
                    <el-table-column prop="callback_type" label="类型" width="120" />
                    <el-table-column prop="ingress_outcome" label="入口结果" width="120" />
                    <el-table-column prop="failure_stage" label="失败阶段" min-width="160" />
                    <el-table-column prop="response_status" label="响应" width="100" />
                    <el-table-column label="时间" min-width="180">
                      <template #default="scope">{{ formatRuntimeDateTime(scope.row.created_at) }}</template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="trace-evidence__section">
                  <div class="trace-evidence__section-title">Inbox</div>
                  <el-table :data="traceDetail.inboxes" size="small">
                    <el-table-column prop="kind" label="Kind" width="140" />
                    <el-table-column label="状态" width="120">
                      <template #default="scope">
                        <RuntimeStatusBadge :status="scope.row.status" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="attempt_count" label="重试" width="80" />
                    <el-table-column label="接收时间" min-width="180">
                      <template #default="scope">{{ formatRuntimeDateTime(scope.row.received_at) }}</template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <el-tab-pane label="会话证据" name="session">
                <div class="trace-session-grid">
                  <div class="trace-session-card">
                    <span>Session Code</span>
                    <strong>{{ traceDetail.session?.session_code || '—' }}</strong>
                  </div>
                  <div class="trace-session-card">
                    <span>Run Mode</span>
                    <strong>{{ traceDetail.session?.run_mode || '—' }}</strong>
                  </div>
                  <div class="trace-session-card">
                    <span>Started / Ended</span>
                    <strong>{{ formatRuntimeDateTime(traceDetail.session?.started_at) }} → {{ formatRuntimeDateTime(traceDetail.session?.ended_at) }}</strong>
                  </div>
                  <div class="trace-session-card">
                    <span>Failure Message</span>
                    <strong>{{ traceDetail.session?.failure_message || '—' }}</strong>
                  </div>
                </div>
                <pre class="trace-detail__json">{{ sessionJson }}</pre>
              </el-tab-pane>

              <el-tab-pane :label="`执行证据 (${traceDetail.commands.length + traceDetail.outboxes.length})`" name="execution">
                <div class="trace-evidence__section">
                  <div class="trace-evidence__section-title">Command</div>
                  <el-table :data="traceDetail.commands" size="small">
                    <el-table-column prop="command_code" label="指令" min-width="180" />
                    <el-table-column prop="task_type" label="任务" width="140" />
                    <el-table-column label="状态" width="120">
                      <template #default="scope">
                        <RuntimeStatusBadge :status="scope.row.status" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="耗时" width="120">
                      <template #default="scope">{{ formatRuntimeDurationMs(scope.row.duration_ms) }}</template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="trace-evidence__section">
                  <div class="trace-evidence__section-title">Outbox</div>
                  <el-table :data="traceDetail.outboxes" size="small">
                    <el-table-column prop="dispatch_type" label="派发类型" width="140" />
                    <el-table-column prop="target_code" label="目标" min-width="160" />
                    <el-table-column label="状态" width="120">
                      <template #default="scope">
                        <RuntimeStatusBadge :status="scope.row.status" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="attempt_count" label="重试" width="80" />
                  </el-table>
                </div>
              </el-tab-pane>

              <el-tab-pane label="Raw JSON" name="raw">
                <pre class="trace-detail__json">{{ rawJson }}</pre>
              </el-tab-pane>
            </el-tabs>
          </el-card>

            <TraceNextActions :detail="traceDetail" />
          </div>
        </template>

        <el-card v-else shadow="never" class="runtime-panel trace-layout__empty-state">
          <RuntimeEmptyState
            title="还没有打开任何案件"
            description="请从左侧上下文列表选择一个 Trace，或使用 session / request / correlation 等锚点直接进入案件工作台。"
            hint="深链链接会自动恢复案件上下文；如果没有命中，可先切换筛选范围。"
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
import TraceCaseHero from '@/components/common/runtime/TraceCaseHero.vue'
import TraceNextActions from '@/components/common/runtime/TraceNextActions.vue'
import TraceTimeline from '@/components/common/runtime/TraceTimeline.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { RuntimeTraceListItem, RuntimeTraceListResponse, TraceDetailResponse, TraceQueryPayload } from '@/types/runtime'
import { compactEnumLabel, formatRuntimeDateTime, formatRuntimeDurationMs } from '@/utils/runtime-display'

const route = useRoute()
const router = useRouter()
const { connectionLabel, connectionTone, lastEvent, lastRefreshedAt, live, markRefreshedAt, state, toggleLive } = useRuntimePageChrome()

const loading = ref(false)
const queryType = ref<'session' | 'request' | 'correlation' | 'command' | 'dispatch'>('session')
const queryValue = ref('')
const activeTab = ref('diagnostics')
const traceDetail = ref<TraceDetailResponse | null>(null)
const traceList = ref<RuntimeTraceListResponse>({ total: 0, items: [] })
const currentPreset = ref<'active' | 'failed' | 'all'>('active')
const currentListPayload = ref<TraceQueryPayload>({ only_active: true, limit: 20, offset: 0 })

type TraceAnchorType = 'session' | 'request' | 'correlation' | 'command' | 'dispatch'

interface TraceAnchor {
  type: TraceAnchorType
  value: string
}

const TRACE_QUERY_KEYS: Record<TraceAnchorType, string> = {
  session: 'sessionId',
  request: 'requestId',
  correlation: 'correlationId',
  command: 'commandCode',
  dispatch: 'dispatchKey',
}

const sessionJson = computed(() => JSON.stringify(traceDetail.value?.session ?? {}, null, 2))
const rawJson = computed(() => JSON.stringify(traceDetail.value ?? {}, null, 2))
const selectedSessionId = computed(() => traceDetail.value?.trace.session_id ?? null)

const pinnedTraceItem = computed<RuntimeTraceListItem | null>(() => {
  const detail = traceDetail.value
  const sessionId = detail?.trace.session_id
  if (!detail || !sessionId) {
    return null
  }

  const existing = traceList.value.items.find(item => item.session_id === sessionId)
  return {
    session_id: sessionId,
    session_code: detail.session?.session_code ?? existing?.session_code ?? `SES-${sessionId}`,
    correlation_id: detail.trace.correlation_id ?? existing?.correlation_id ?? null,
    request_id: detail.trace.request_id ?? existing?.request_id ?? null,
    workline_id: detail.session?.workline_id ?? detail.trace.workline_id ?? existing?.workline_id ?? -1,
    workline_name: existing?.workline_name ?? null,
    workline_code: existing?.workline_code ?? null,
    device_id: detail.trace.device_id ?? existing?.device_id ?? detail.commands[0]?.device_id ?? null,
    device_name: existing?.device_name ?? null,
    device_code: detail.trace.device_code ?? existing?.device_code ?? null,
    command_code: detail.trace.command_code ?? detail.commands[0]?.command_code ?? existing?.command_code ?? null,
    status: detail.summary.session_status ?? detail.session?.status ?? existing?.status ?? 'UNKNOWN',
    step_code: detail.summary.step_code ?? detail.session?.step_code ?? existing?.step_code ?? null,
    current_wait_type: detail.summary.current_wait_type ?? detail.session?.current_wait_type ?? existing?.current_wait_type ?? null,
    failure_domain: detail.session?.failure_domain ?? existing?.failure_domain ?? null,
    failure_code: detail.session?.failure_code ?? existing?.failure_code ?? null,
    latest_timeline_action: detail.summary.latest_timeline_action ?? existing?.latest_timeline_action ?? null,
    latest_timeline_status: detail.summary.latest_timeline_status ?? existing?.latest_timeline_status ?? null,
    latest_timeline_message: detail.summary.latest_timeline_message ?? existing?.latest_timeline_message ?? null,
    started_at: detail.session?.started_at ?? existing?.started_at ?? null,
    last_ingress_at: detail.session?.last_ingress_at ?? existing?.last_ingress_at ?? null,
    deadline_at: detail.session?.deadline_at ?? existing?.deadline_at ?? null,
    is_timed_out: existing?.is_timed_out ?? false,
  }
})

const traceListItems = computed<RuntimeTraceListItem[]>(() => {
  const items = [...traceList.value.items]
  const pinned = pinnedTraceItem.value

  if (!pinned) {
    return items
  }

  const index = items.findIndex(item => item.session_id === pinned.session_id)
  if (index === -1) {
    return [pinned, ...items]
  }

  items[index] = { ...items[index], ...pinned }
  return items
})

const selectedTracePinned = computed(() => {
  const pinned = pinnedTraceItem.value
  return Boolean(pinned && !traceList.value.items.some(item => item.session_id === pinned.session_id))
})

const selectedTraceContext = computed(() => {
  const sessionId = selectedSessionId.value
  if (!sessionId) {
    return pinnedTraceItem.value
  }

  return traceListItems.value.find(item => item.session_id === sessionId) ?? pinnedTraceItem.value
})

const selectedWorklineName = computed(() => {
  const item = selectedTraceContext.value
  return item?.workline_name || (item?.workline_id ? `工作线 #${item.workline_id}` : null)
})

const selectedDeviceName = computed(() => {
  const item = selectedTraceContext.value
  return item?.device_name || item?.device_code || (item?.device_id ? `设备 #${item.device_id}` : null)
})

const selectedTraceContextName = computed(() => {
  const item = selectedTraceContext.value
  return item?.session_code || (selectedSessionId.value ? `SES-${selectedSessionId.value}` : null)
})

const selectedTraceContextMeta = computed(() => {
  const item = selectedTraceContext.value
  if (!item) {
    return ''
  }

  const parts = [item.status || traceDetail.value?.summary.session_status || null, selectedWorklineName.value, selectedDeviceName.value]
  if (selectedTracePinned.value) {
    parts.push('已固定当前案件')
  }

  return parts.filter(Boolean).join(' · ')
})

function buildScopedListPayload(base: TraceQueryPayload = {}): TraceQueryPayload {
  return {
    ...base,
    limit: base.limit ?? 20,
    offset: base.offset ?? 0,
    workline_id: Number(route.query.worklineId || 0) || undefined,
    device_id: Number(route.query.deviceId || 0) || undefined,
  }
}

function resolvePresetForDetail(detail: TraceDetailResponse | null): 'active' | 'failed' | 'all' {
  const status = detail?.summary.session_status?.toUpperCase() ?? detail?.session?.status?.toUpperCase()
  if (!status) {
    return 'active'
  }

  if (detail?.session?.failure_domain || detail?.session?.failure_code || ['FAILED', 'TIMEOUT', 'CANCELLED', 'ABORTED'].includes(status)) {
    return 'failed'
  }

  if (['RUNNING', 'WAITING', 'PENDING', 'PROCESSING', 'IN_PROGRESS', 'WAITING_DEVICE_RESULT', 'WAITING_EXTERNAL'].includes(status)) {
    return 'active'
  }

  return 'all'
}

function traceWorklineText(item: RuntimeTraceListItem) {
  return item.workline_name || (item.workline_id ? `工作线 #${item.workline_id}` : '未关联工作线')
}

function traceDeviceText(item: RuntimeTraceListItem) {
  return item.device_name || item.device_code || (item.device_id ? `设备 #${item.device_id}` : '未关联设备')
}

function readRouteAnchor(): TraceAnchor | null {
  const anchorTypes: TraceAnchorType[] = ['session', 'request', 'correlation', 'command', 'dispatch']

  for (const type of anchorTypes) {
    const queryKey = TRACE_QUERY_KEYS[type]
    const value = String(route.query[queryKey] || '')
    if (!value) {
      continue
    }

    if (type === 'session' && !Number.isFinite(Number(value))) {
      continue
    }

    return { type, value }
  }

  return null
}

function applyAnchorToInputs(anchor: TraceAnchor): void {
  queryType.value = anchor.type
  queryValue.value = anchor.value
}

function getLookupAnchor(): TraceAnchor | null {
  const value = queryValue.value.trim()
  if (!value) {
    return null
  }

  if (queryType.value === 'session' && !Number.isFinite(Number(value))) {
    return null
  }

  return {
    type: queryType.value,
    value,
  }
}

function syncRouteQuery(type: TraceAnchorType, value: string) {
  const nextQuery = { ...route.query }

  for (const queryKey of Object.values(TRACE_QUERY_KEYS)) {
    delete nextQuery[queryKey]
  }

  nextQuery[TRACE_QUERY_KEYS[type]] = value
  router.replace({ query: nextQuery })
}

async function loadTraceList(payload: TraceQueryPayload = currentListPayload.value) {
  currentListPayload.value = payload
  traceList.value = await runtimeApiMethods.queryTraces(payload).send()
  markRefreshedAt()
}

async function loadTraceBySession(sessionId: number) {
  traceDetail.value = await runtimeApiMethods.traceBySessionId(sessionId).send()
  markRefreshedAt()
}

async function loadTraceByAnchor(type: Exclude<TraceAnchorType, 'session'>, value: string) {
  const requestMap = {
    request: runtimeApiMethods.traceByRequestId,
    correlation: runtimeApiMethods.traceByCorrelationId,
    command: runtimeApiMethods.traceByCommandCode,
    dispatch: runtimeApiMethods.traceByDispatchKey,
  }

  traceDetail.value = await requestMap[type](value).send()
  markRefreshedAt()
}

async function loadTraceDetail(anchor: TraceAnchor): Promise<void> {
  if (anchor.type === 'session') {
    await loadTraceBySession(Number(anchor.value))
    return
  }

  await loadTraceByAnchor(anchor.type, anchor.value)
}

async function runTraceLookup() {
  const anchor = getLookupAnchor()
  if (!anchor) return

  loading.value = true
  try {
    await loadTraceDetail(anchor)
    syncRouteQuery(anchor.type, anchor.value)
    await applyListPreset(resolvePresetForDetail(traceDetail.value))
  } finally {
    loading.value = false
  }
}

async function selectTraceRow(row: { session_id: number }) {
  loading.value = true
  try {
    await loadTraceBySession(row.session_id)
    syncRouteQuery('session', String(row.session_id))
  } finally {
    loading.value = false
  }
}

async function applyListPreset(preset: 'active' | 'failed' | 'all') {
  currentPreset.value = preset

  if (preset === 'active') {
    await loadTraceList(buildScopedListPayload({ only_active: true }))
    return
  }

  if (preset === 'failed') {
    await loadTraceList(buildScopedListPayload({ only_failed: true }))
    return
  }

  await loadTraceList(buildScopedListPayload())
}

async function refreshCurrent() {
  loading.value = true
  try {
    await loadTraceList(currentListPayload.value)

    const activeSessionId = traceDetail.value?.trace.session_id
    if (activeSessionId) {
      await loadTraceBySession(activeSessionId)
      return
    }

    const routeAnchor = readRouteAnchor()
    if (routeAnchor) {
      await loadTraceDetail(routeAnchor)
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const routeAnchor = readRouteAnchor()
    if (routeAnchor) {
      applyAnchorToInputs(routeAnchor)
      await loadTraceDetail(routeAnchor)
    }

    await applyListPreset(resolvePresetForDetail(traceDetail.value))
  } finally {
    loading.value = false
  }
})

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    await loadTraceList(currentListPayload.value)
    const activeSessionId = traceDetail.value?.trace.session_id
    const eventSessionId = Number(event.keys?.session_id || 0)
    if (activeSessionId && eventSessionId === activeSessionId) {
      await loadTraceBySession(activeSessionId)
    }
  }
)
</script>

<style scoped>
.runtime-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.runtime-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-page__title {
  margin: 0;
  color: #f8fafc;
  font-size: 32px;
}

.runtime-page__subtitle {
  max-width: 900px;
  margin: 8px 0 0;
  color: #94a3b8;
  line-height: 1.7;
}

.runtime-page__status-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.runtime-panel {
  background: rgb(15, 23, 42, 0.72);
  border: 1px solid rgb(245, 158, 11, 0.12);
}

.runtime-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-panel__header--compact {
  align-items: center;
  gap: 12px;
}

.trace-context-placeholder {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 12px;
  line-height: 1.5;
}

.runtime-panel__title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
}

.runtime-panel__subtitle {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.trace-query-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.trace-query-bar__type {
  width: 170px;
}

.trace-query-bar__input {
  flex: 1;
  min-width: 280px;
}

.trace-query-bar__presets {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-wrap: wrap;
}

.trace-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 360px minmax(0, 1fr);
  align-items: stretch;
}

.trace-layout__context,
.trace-layout__detail {
  min-height: 0;
}

.trace-layout__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.trace-layout__hero {
  flex: 0 0 auto;
}

.trace-layout__detail-scroll {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.trace-layout__detail-scroll > * {
  flex: 0 0 auto;
}

.trace-context-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--runtime-border-accent, rgb(245 158 11 / 0.16));
  border-radius: 14px;
  background: linear-gradient(180deg, var(--runtime-surface-strong, rgb(255 255 255 / 0.04)), var(--runtime-surface-accent, rgb(245 158 11 / 0.06)));
}

.trace-context-summary--compact {
  flex: 1 1 auto;
}

.trace-context-summary__name {
  color: var(--runtime-text-primary, #f8fafc);
  font-size: 14px;
  line-height: 1.3;
}

.trace-context-summary__meta {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 12px;
  line-height: 1.45;
}

.trace-layout__context-scroll {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  flex-direction: column;
}

.trace-context-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-context-card {
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

.trace-context-card:hover {
  transform: translateY(-1px);
  border-color: rgb(245, 158, 11, 0.28);
}

.trace-context-card.is-active {
  border-color: rgb(245, 158, 11, 0.38);
  background: rgb(245, 158, 11, 0.08);
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.18);
}

.trace-context-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.trace-context-card__time,
.trace-context-card__meta,
.trace-context-card__hint {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.trace-context-card__title {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.trace-context-card__meta {
  color: #cbd5e1;
}

.trace-evidence-tabs :deep(.el-tabs__content) {
  padding-top: 8px;
}

.trace-evidence__section + .trace-evidence__section {
  margin-top: 20px;
}

.trace-evidence__section-title {
  margin-bottom: 10px;
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.trace-session-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
}

.trace-session-card {
  padding: 14px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 12px;
  background: rgb(30, 41, 59, 0.72);
}

.trace-session-card span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-session-card strong {
  display: block;
  margin-top: 8px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.trace-detail__json {
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: rgb(15, 23, 42, 0.95);
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.6;
  overflow: auto;
}

.trace-layout__empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520px;
}

@media (width >= 1280px) {
  .trace-layout {
    height: calc(100vh - 285px);
    min-height: 620px;
    overflow: hidden;
  }

  .trace-layout__context,
  .trace-layout__detail {
    height: 100%;
    min-height: 0;
  }

  .trace-layout__context {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .trace-layout__context :deep(.el-card__header) {
    flex: 0 0 auto;
  }

  .trace-layout__context :deep(.el-card__body) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .trace-layout__context-scroll,
  .trace-layout__detail-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }
}

@media (width <= 1279px) {
  .runtime-page__header,
  .trace-layout {
    display: flex;
    flex-direction: column;
  }

  .runtime-page__status-bar,
  .trace-query-bar__presets {
    justify-content: flex-start;
  }

  .trace-layout__context-scroll,
  .trace-layout__detail-scroll {
    overflow: visible;
    padding-right: 0;
  }

  .trace-session-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
