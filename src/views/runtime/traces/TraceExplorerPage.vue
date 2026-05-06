<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">Trace 处置台</h1>
        <p class="runtime-page__subtitle">
          先看阻塞点和建议动作，再沿 Timeline 与证据分组还原链路。
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
          @click="refreshCurrent"
        >
          刷新当前视图
        </el-button>
      </div>
    </div>

    <el-card
      shadow="never"
      class="runtime-panel"
    >
      <div class="trace-query-bar">
        <el-select
          v-model="queryType"
          class="trace-query-bar__type"
        >
          <el-option
            label="Trace ID"
            value="trace"
          />
          <el-option
            label="Request ID"
            value="request"
          />
          <el-option
            label="Session ID"
            value="session"
          />
          <el-option
            label="Command Code"
            value="command"
          />
          <el-option
            label="Dispatch Key"
            value="dispatch"
          />
          <el-option
            label="条码"
            value="barcode"
          />
        </el-select>
        <el-input
          v-model="queryValue"
          class="trace-query-bar__input"
          :placeholder="
            queryType === 'barcode' ? '输入物料条码（6 合 1 码或其他码）' : '输入 trace 锚点'
          "
          @keyup.enter="runTraceLookup"
        />
        <el-button
          type="primary"
          class="trace-query-bar__submit"
          @click="runTraceLookup"
        >
          查询案件
        </el-button>
      </div>
    </el-card>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="trace-layout">
      <div class="trace-layout__detail">
        <template v-if="traceDetail">
          <div
            ref="detailScrollRef"
            class="trace-layout__detail-scroll"
          >
            <div
              ref="detailHeroRef"
              class="trace-layout__hero"
            >
              <TraceCaseHero
                :detail="traceDetail"
                :workline-name="selectedWorklineName"
                :device-name="selectedDeviceName"
              />
            </div>

            <RuntimeStickyContextBar
              v-show="showStickyContext"
              eyebrow="案件上下文"
              :title="traceStickyTitle"
              :code="traceStickyCode"
              :status="traceStickyStatus"
              :facts="traceStickyFacts"
            />

            <section class="trace-section">
              <div class="trace-section__step">
                <span class="trace-section__num">01</span>
                <div>
                  <div class="trace-section__title">处置焦点</div>
                  <div class="trace-section__desc">先确认阻塞点，再决定下一步行动</div>
                </div>
              </div>
              <TraceBlockingPointCard
                :blocking-point="blockingPoint"
                :loading="blockingPointLoading"
              />
              <TraceNextActions
                :detail="traceDetail"
                @open-trace="openTraceFromAction"
              />
            </section>

            <section class="trace-section">
              <div class="trace-section__step">
                <span class="trace-section__num">02</span>
                <div>
                  <div class="trace-section__title">Timeline 主叙事</div>
                  <div class="trace-section__desc">
                    先看首次失败节点和最后成功节点，再沿时间线还原
                  </div>
                </div>
              </div>
              <el-card
                shadow="never"
                class="runtime-panel"
              >
                <TraceTimeline :items="traceDetail.timelines" />
              </el-card>
            </section>

            <section class="trace-section trace-section--evidence">
              <div class="trace-section__step">
                <span class="trace-section__num trace-section__num--dim">03</span>
                <div>
                  <div class="trace-section__title trace-section__title--dim">证据分组</div>
                  <div class="trace-section__desc">按需查看，优先读诊断，Raw JSON 仅作兜底</div>
                </div>
              </div>
              <el-card
                shadow="never"
                class="runtime-panel"
              >
                <el-tabs
                  v-model="activeTab"
                  class="trace-evidence-tabs"
                >
                  <el-tab-pane
                    label="诊断"
                    name="diagnostics"
                  >
                    <el-table
                      :data="traceDetail.diagnostics"
                      size="small"
                    >
                      <el-table-column
                        prop="trace_id"
                        label="Trace"
                        min-width="180"
                      />
                      <el-table-column
                        prop="device_code"
                        label="设备"
                        min-width="120"
                      />
                      <el-table-column
                        prop="plugin_key"
                        label="插件"
                        min-width="120"
                      />
                      <el-table-column
                        prop="canonical_event_type"
                        label="事件"
                        min-width="150"
                      >
                        <template #default="scope">
                          {{ compactEnumLabel(scope.row.canonical_event_type) }}
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="transition"
                        label="转移"
                        min-width="140"
                      >
                        <template #default="scope">
                          {{ compactEnumLabel(scope.row.transition) }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>

                  <el-tab-pane
                    :label="`入口证据 (${traceDetail.callback_logs.length + traceDetail.inboxes.length})`"
                    name="ingress"
                  >
                    <div class="trace-evidence__section">
                      <div class="trace-evidence__section-title">Callback</div>
                      <el-table
                        :data="traceDetail.callback_logs"
                        size="small"
                      >
                        <el-table-column
                          prop="callback_type"
                          label="类型"
                          width="120"
                        />
                        <el-table-column
                          prop="trace_id"
                          label="Trace"
                          min-width="180"
                        />
                        <el-table-column
                          prop="ingress_outcome"
                          label="入口结果"
                          width="120"
                        />
                        <el-table-column
                          prop="failure_stage"
                          label="失败阶段"
                          min-width="160"
                        />
                        <el-table-column
                          prop="response_status"
                          label="响应"
                          width="100"
                        />
                        <el-table-column
                          label="时间"
                          min-width="180"
                        >
                          <template #default="scope">
                            {{ formatRuntimeDateTime(scope.row.created_at) }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>

                    <div class="trace-evidence__section">
                      <div class="trace-evidence__section-title">Inbox</div>
                      <el-table
                        :data="traceDetail.inboxes"
                        size="small"
                      >
                        <el-table-column
                          prop="kind"
                          label="Kind"
                          width="140"
                        />
                        <el-table-column
                          prop="trace_id"
                          label="Trace"
                          min-width="180"
                        />
                        <el-table-column
                          label="状态"
                          width="120"
                        >
                          <template #default="scope">
                            <RuntimeStatusBadge
                              :status="scope.row.status"
                              size="small"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="attempt_count"
                          label="重试"
                          width="80"
                        />
                        <el-table-column
                          label="接收时间"
                          min-width="180"
                        >
                          <template #default="scope">
                            {{ formatRuntimeDateTime(scope.row.received_at) }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane
                    label="会话证据"
                    name="session"
                  >
                    <div class="trace-session-grid">
                      <div class="trace-session-card">
                        <span>Trace ID</span>
                        <strong>
                          {{ traceDetail.trace.trace_id || traceDetail.session?.trace_id || '--' }}
                        </strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Session Code</span>
                        <strong>{{ traceDetail.session?.session_code || '--' }}</strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Run Mode</span>
                        <strong>{{ traceDetail.session?.run_mode || '--' }}</strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Started / Ended</span>
                        <strong>
                          {{ formatRuntimeDateTime(traceDetail.session?.started_at) }} ->
                          {{ formatRuntimeDateTime(traceDetail.session?.ended_at) }}
                        </strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Failure Message</span>
                        <strong>{{ traceDetail.session?.failure_message || '--' }}</strong>
                      </div>
                    </div>
                    <el-table
                      v-if="traceDetail.sessions.length > 1"
                      :data="traceDetail.sessions"
                      size="small"
                      class="trace-evidence__section"
                    >
                      <el-table-column
                        prop="session_code"
                        label="Session"
                        min-width="180"
                      />
                      <el-table-column
                        prop="run_mode"
                        label="Run Mode"
                        width="120"
                      />
                      <el-table-column
                        prop="status"
                        label="状态"
                        width="120"
                      >
                        <template #default="scope">
                          <RuntimeStatusBadge
                            :status="scope.row.status"
                            size="small"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="step_code"
                        label="Step"
                        min-width="140"
                      />
                    </el-table>
                    <pre class="trace-detail__json">{{ sessionJson }}</pre>
                  </el-tab-pane>

                  <el-tab-pane
                    :label="`执行证据 (${traceDetail.commands.length + traceDetail.outboxes.length})`"
                    name="execution"
                  >
                    <div class="trace-evidence__section">
                      <div class="trace-evidence__section-title">Command</div>
                      <el-table
                        :data="traceDetail.commands"
                        size="small"
                      >
                        <el-table-column
                          prop="command_code"
                          label="指令"
                          min-width="180"
                        />
                        <el-table-column
                          prop="task_type"
                          label="任务"
                          width="140"
                        />
                        <el-table-column
                          label="状态"
                          width="120"
                        >
                          <template #default="scope">
                            <RuntimeStatusBadge
                              :status="scope.row.status"
                              size="small"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="耗时"
                          width="120"
                        >
                          <template #default="scope">
                            {{ formatRuntimeDurationMs(scope.row.duration_ms) }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>

                    <div class="trace-evidence__section">
                      <div class="trace-evidence__section-title">Outbox</div>
                      <el-table
                        :data="traceDetail.outboxes"
                        size="small"
                      >
                        <el-table-column
                          prop="dispatch_type"
                          label="派发类型"
                          width="140"
                        />
                        <el-table-column
                          prop="target_code"
                          label="目标"
                          min-width="160"
                        />
                        <el-table-column
                          label="状态"
                          width="120"
                        >
                          <template #default="scope">
                            <RuntimeStatusBadge
                              :status="scope.row.status"
                              size="small"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="attempt_count"
                          label="重试"
                          width="80"
                        />
                      </el-table>
                    </div>

                    <div class="trace-evidence__section">
                      <div class="trace-evidence__section-title">Dispatch Attempts</div>
                      <el-table
                        :data="traceDetail.dispatch_attempts"
                        size="small"
                      >
                        <el-table-column
                          prop="attempt_no"
                          label="#"
                          width="80"
                        />
                        <el-table-column
                          prop="dispatch_key"
                          label="Dispatch Key"
                          min-width="200"
                        />
                        <el-table-column
                          prop="target_code"
                          label="目标"
                          min-width="140"
                        />
                        <el-table-column
                          label="状态"
                          width="120"
                        >
                          <template #default="scope">
                            <RuntimeStatusBadge
                              :status="scope.row.status"
                              size="small"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="error_message"
                          label="错误"
                          min-width="220"
                        />
                      </el-table>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane
                    label="Raw JSON"
                    name="raw"
                  >
                    <pre class="trace-detail__json">{{ rawJson }}</pre>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
            </section>
          </div>
        </template>

        <el-card
          v-else
          shadow="never"
          class="runtime-panel trace-layout__empty-state"
        >
          <RuntimeEmptyState
            title="还没有打开任何案件"
            description="使用上方锚点搜索直接进入案件。"
            hint="支持 Trace ID、Request ID、Session ID、Command Code、Dispatch Key 等锚点直接跳转。"
          />
        </el-card>
      </div>

      <el-card
        v-if="traceDetail"
        shadow="never"
        class="runtime-panel trace-layout__sidebar"
      >
        <TraceRelatedSidebar
          :current-trace-id="selectedSessionId"
          :workline-id="relatedWorklineId"
          :device-id="relatedDeviceId"
          :failure-domain="relatedFailureDomain"
          @select="handleRelatedSelect"
        />
      </el-card>
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
import RuntimeStickyContextBar from '@/components/common/runtime/RuntimeStickyContextBar.vue'
import TraceBlockingPointCard from '@/components/common/runtime/TraceBlockingPointCard.vue'
import TraceCaseHero from '@/components/common/runtime/TraceCaseHero.vue'
import TraceNextActions from '@/components/common/runtime/TraceNextActions.vue'
import TraceRelatedSidebar from '@/components/common/runtime/TraceRelatedSidebar.vue'
import TraceTimeline from '@/components/common/runtime/TraceTimeline.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import { useRuntimeStickyContextVisibility } from '@/composables/useRuntimeStickyContextVisibility'
import type {
  RuntimeTraceListItem,
  TraceBlockingPointResponse,
  TraceDetailResponse
} from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { isRelevantRuntimeEvent } from '@/utils/runtime-event'
import { buildRuntimeTraceQuery, type RuntimeTraceQueryInput } from '@/utils/runtime-route'
import { displayDevice, displaySession, displayWorkline } from '@/utils/runtime-display-identity'
import {
  compactEnumLabel,
  formatRuntimeDateTime,
  formatRuntimeDurationMs,
  readPositiveInt
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
const blockingPointLoading = ref(false)
const queryType = ref<TraceAnchorType>('trace')
const queryValue = ref('')
const activeTab = ref('diagnostics')
const traceDetail = ref<TraceDetailResponse | null>(null)
const blockingPoint = ref<TraceBlockingPointResponse | null>(null)
const detailScrollRef = ref<HTMLElement | null>(null)
const detailHeroRef = ref<HTMLElement | null>(null)
const showStickyContext = useRuntimeStickyContextVisibility({
  heroRef: detailHeroRef,
  scrollRootRef: detailScrollRef,
  enabled: computed(() => Boolean(traceDetail.value))
})

type TraceAnchorType = 'trace' | 'request' | 'session' | 'command' | 'dispatch' | 'barcode'

interface TraceAnchor {
  type: TraceAnchorType
  value: string
}

const TRACE_QUERY_KEYS: Record<TraceAnchorType, string> = {
  trace: 'traceId',
  session: 'sessionId',
  request: 'requestId',
  command: 'commandCode',
  dispatch: 'dispatchKey',
  barcode: 'barcode'
}

const sessionJson = computed(() => JSON.stringify(traceDetail.value?.session ?? {}, null, 2))
const rawJson = computed(() => JSON.stringify(traceDetail.value ?? {}, null, 2))
const selectedSessionId = computed(() => traceDetail.value?.trace.session_id ?? null)
const selectedTraceId = computed(
  () => traceDetail.value?.trace.trace_id ?? traceDetail.value?.session?.trace_id ?? null
)

const relatedWorklineId = computed(() => {
  const detail = traceDetail.value
  if (!detail) return null
  return detail.session?.workline_id ?? detail.trace.workline_id ?? null
})

const relatedDeviceId = computed(() => {
  const detail = traceDetail.value
  if (!detail) return null
  return detail.trace.device_id ?? detail.commands[0]?.device_id ?? null
})

const relatedFailureDomain = computed(() => {
  return traceDetail.value?.session?.failure_domain ?? null
})

const selectedWorklineName = computed(() => {
  const detail = traceDetail.value
  if (!detail) return null
  return displayWorkline({
    line_name: null,
    line_code: null,
    workline_id: detail.session?.workline_id ?? detail.trace.workline_id
  })
})

const selectedDeviceName = computed(() => {
  const detail = traceDetail.value
  if (!detail) return null
  return displayDevice({
    device_name: null,
    device_code: detail.trace.device_code,
    device_id: detail.trace.device_id
  })
})

const traceStickyTitle = computed(() => {
  const detail = traceDetail.value
  return displaySession({
    session_code: detail?.session?.session_code,
    session_id: selectedSessionId.value
  })
})
const traceStickyCode = computed(() => {
  return (
    selectedTraceId.value ||
    (traceDetail.value?.trace.session_id ? `Session #${traceDetail.value.trace.session_id}` : null)
  )
})

const traceStickyStatus = computed(() => {
  return traceDetail.value?.summary.session_status || traceDetail.value?.session?.status || null
})

const traceStickyFacts = computed(() => {
  const detail = traceDetail.value
  if (!detail) {
    return []
  }

  const failureText =
    [detail.session?.failure_domain, detail.session?.failure_code].filter(Boolean).join(' / ') ||
    '--'

  return [
    { label: '当前 Step', value: detail.summary.step_code || detail.session?.step_code || '--' },
    { label: '失败域 / 码', value: failureText }
  ]
})

function readRouteAnchor(): TraceAnchor | null {
  const anchorTypes: TraceAnchorType[] = [
    'trace',
    'request',
    'session',
    'command',
    'dispatch',
    'barcode'
  ]

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
    value
  }
}

function resolveTraceAnchorFromQuery(query: RuntimeTraceQueryInput): TraceAnchor | null {
  if (query.traceId) {
    return { type: 'trace', value: String(query.traceId) }
  }

  if (query.sessionId !== null && query.sessionId !== undefined && query.sessionId !== '') {
    const value = String(query.sessionId)
    if (Number.isFinite(Number(value))) {
      return { type: 'session', value }
    }
  }

  if (query.requestId) {
    return { type: 'request', value: String(query.requestId) }
  }

  if (query.commandCode) {
    return { type: 'command', value: String(query.commandCode) }
  }

  if (query.dispatchKey) {
    return { type: 'dispatch', value: String(query.dispatchKey) }
  }

  if (query.barcode) {
    return { type: 'barcode', value: String(query.barcode) }
  }

  return null
}

async function syncRouteQuery(
  type: TraceAnchorType,
  value: string,
  query: RuntimeTraceQueryInput = {}
) {
  const nextQuery = { ...route.query }

  for (const queryKey of Object.values(TRACE_QUERY_KEYS)) {
    delete nextQuery[queryKey]
  }

  await router.replace({
    query: {
      ...nextQuery,
      ...buildRuntimeTraceQuery({
        ...query,
        [TRACE_QUERY_KEYS[type]]: value
      } as RuntimeTraceQueryInput)
    }
  })
}

async function loadTraceBySession(sessionId: number) {
  await setTraceDetail(await runtimeApiMethods.traceBySessionId(sessionId).send())
  markRefreshedAt()
}

async function loadTraceByTraceId(traceId: string) {
  await setTraceDetail(await runtimeApiMethods.traceByTraceId(traceId).send())
  markRefreshedAt()
}

async function loadTraceByAnchor(
  type: Exclude<TraceAnchorType, 'session' | 'trace' | 'barcode'>,
  value: string
) {
  const requestMap = {
    request: runtimeApiMethods.traceByRequestId,
    command: runtimeApiMethods.traceByCommandCode,
    dispatch: runtimeApiMethods.traceByDispatchKey
  }

  await setTraceDetail(await requestMap[type](value).send())
  markRefreshedAt()
}

async function loadTraceByBarcode(barcode: string) {
  let result = await runtimeApiMethods
    .queryTraces({ keyword: barcode, only_active: true, limit: 5 })
    .send()
  if (result.items.length === 0) {
    result = await runtimeApiMethods.queryTraces({ keyword: barcode, limit: 5 }).send()
  }
  if (result.items.length === 0) {
    traceDetail.value = null
    blockingPoint.value = null
    return
  }
  const item = result.items[0]
  if (item.trace_id) {
    await loadTraceByTraceId(item.trace_id)
  } else {
    await loadTraceBySession(item.session_id)
  }
}

async function loadTraceDetail(anchor: TraceAnchor): Promise<void> {
  if (anchor.type === 'trace') {
    await loadTraceByTraceId(anchor.value)
    return
  }

  if (anchor.type === 'session') {
    await loadTraceBySession(Number(anchor.value))
    return
  }

  if (anchor.type === 'barcode') {
    await loadTraceByBarcode(anchor.value)
    return
  }

  await loadTraceByAnchor(anchor.type, anchor.value)
}

function normalizeTraceDetail(detail: TraceDetailResponse): TraceDetailResponse {
  return {
    ...detail,
    sessions: detail.sessions ?? (detail.session ? [detail.session] : []),
    callback_logs: detail.callback_logs ?? [],
    inboxes: detail.inboxes ?? [],
    commands: detail.commands ?? [],
    outboxes: detail.outboxes ?? [],
    dispatch_attempts: detail.dispatch_attempts ?? [],
    timelines: detail.timelines ?? [],
    diagnostics: detail.diagnostics ?? []
  }
}

async function setTraceDetail(detail: TraceDetailResponse): Promise<void> {
  const nextDetail = normalizeTraceDetail(detail)
  traceDetail.value = nextDetail
  await loadBlockingPoint(nextDetail.trace.trace_id ?? nextDetail.session?.trace_id ?? null)
}

async function loadBlockingPoint(traceId: string | null): Promise<void> {
  blockingPoint.value = null
  if (!traceId) {
    return
  }

  blockingPointLoading.value = true
  try {
    blockingPoint.value = await runtimeApiMethods.traceBlockingPoint(traceId).send()
  } catch {
    blockingPoint.value = null
  } finally {
    blockingPointLoading.value = false
  }
}

async function runTraceLookup() {
  const anchor = getLookupAnchor()
  if (!anchor) return

  applyAnchorToInputs(anchor)
  await syncRouteQuery(anchor.type, anchor.value)
}

async function openTraceFromAction(query: RuntimeTraceQueryInput) {
  const anchor = resolveTraceAnchorFromQuery(query)
  if (!anchor) return

  applyAnchorToInputs(anchor)
  await syncRouteQuery(anchor.type, anchor.value, query)
}

async function handleRelatedSelect(trace: RuntimeTraceListItem) {
  await openTraceFromAction({
    traceId: trace.trace_id,
    sessionId: trace.trace_id ? undefined : String(trace.session_id),
    worklineId: trace.workline_id,
    deviceId: trace.device_id
  })
}

async function refreshCurrent() {
  loading.value = true
  try {
    const activeSessionId = traceDetail.value?.trace.session_id
    const activeTraceId = selectedTraceId.value
    if (activeTraceId) {
      await loadTraceByTraceId(activeTraceId)
      return
    }

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

const refreshCurrentCoalesced = createCoalescedAsyncTask(refreshCurrent)

async function syncTraceRouteState() {
  loading.value = true
  try {
    const routeAnchor = readRouteAnchor()
    if (routeAnchor) {
      applyAnchorToInputs(routeAnchor)
      await loadTraceDetail(routeAnchor)
    } else {
      queryValue.value = ''
      traceDetail.value = null
      blockingPoint.value = null
    }
  } finally {
    loading.value = false
  }
}

const syncTraceRouteStateCoalesced = createCoalescedAsyncTask(syncTraceRouteState)

onMounted(() => {
  void syncTraceRouteStateCoalesced()
})

watch(
  () => [
    route.query.sessionId,
    route.query.traceId,
    route.query.requestId,
    route.query.commandCode,
    route.query.dispatchKey,
    route.query.worklineId,
    route.query.deviceId
  ],
  () => {
    void syncTraceRouteStateCoalesced()
  }
)

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return

    if (
      !isRelevantRuntimeEvent(event, {
        sessionId: traceDetail.value?.trace.session_id ?? null,
        traceId: selectedTraceId.value,
        worklineId: readPositiveInt(route.query.worklineId),
        deviceId: readPositiveInt(route.query.deviceId)
      })
    ) {
      return
    }

    await refreshCurrentCoalesced()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 900px;
}

.trace-query-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.trace-query-bar__type {
  width: 170px;
}

.trace-query-bar__input {
  flex: 1;
  min-width: 280px;
}

.trace-query-bar__submit {
  min-width: 112px;
  white-space: nowrap;
}

.trace-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: stretch;
}

.trace-layout__detail,
.trace-layout__sidebar {
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

.trace-evidence-tabs :deep(.el-tabs__content) {
  padding-top: 8px;
}

.trace-evidence__section + .trace-evidence__section {
  margin-top: 20px;
}

.trace-evidence__section-title {
  margin-bottom: 10px;
  color: var(--runtime-text-primary);
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
  background: var(--runtime-surface);
}

.trace-session-card span {
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-session-card strong {
  display: block;
  margin-top: 8px;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.trace-detail__json {
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: var(--runtime-hero-bg);
  color: var(--runtime-text-emphasis);
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

.trace-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-section__step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgb(148, 163, 184, 0.1);
}

.trace-section__num {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgb(59, 130, 246, 0.3);
  border-radius: 999px;
  background: rgb(59, 130, 246, 0.12);
  color: #60a5fa;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.trace-section__num--dim {
  border-color: rgb(148, 163, 184, 0.18);
  background: rgb(148, 163, 184, 0.06);
  color: #475569;
}

.trace-section__title {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.trace-section__title--dim {
  color: #475569;
}

.trace-section__desc {
  margin-top: 2px;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

@media (width >= 1280px) and (height >= 900px) {
  .trace-layout {
    height: calc(100vh - 285px);
    min-height: 620px;
    overflow: hidden;
  }

  .trace-layout__detail,
  .trace-layout__sidebar {
    height: 100%;
    min-height: 0;
  }

  .trace-layout__sidebar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .trace-layout__sidebar :deep(.el-card__body) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .trace-layout__detail-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }
}

@media (width >= 1280px) and (height <= 899px) {
  .trace-layout {
    align-items: start;
  }

  .trace-layout__detail-scroll {
    overflow: visible;
    padding-right: 0;
  }
}

@media (width <= 1279px) {
  .runtime-page__header {
    display: flex;
    flex-direction: column;
  }

  .trace-layout {
    display: flex;
    flex-direction: column;
  }

  .trace-layout__detail-scroll {
    overflow: visible;
    padding-right: 0;
  }

  .trace-session-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
