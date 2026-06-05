<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">运行案件处置台</h1>
        <p class="runtime-page__subtitle">
          先看阻塞点和建议动作，再沿 Timeline 与证据分组还原运行案件。
        </p>
      </div>
      <div class="runtime-page__status-bar runtime-control-cluster">
        <RuntimeStatusBadge
          :label="sseStore.connectionLabel"
          :tone="sseStore.connectionTone"
          :pulse="sseStore.live && sseStore.state === 'connected'"
        />
        <el-switch
          :model-value="sseStore.live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          @change="value => sseStore.toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="sseStore.lastRefreshedAt"
          :frozen="!sseStore.live"
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
            label="案件 / Session"
            value="session"
          />
          <el-option
            label="Trace ID"
            value="trace"
          />
          <el-option
            label="Request ID"
            value="request"
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
            queryType === 'barcode' ? '输入物料条码（6 合 1 码或其他码）' : '输入案件或证据锚点'
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
        <el-button
          :type="showContrast ? 'warning' : 'default'"
          class="trace-query-bar__submit"
          :disabled="!traceDetail"
          @click="showContrast = !showContrast"
        >
          {{ showContrast ? '关闭对比' : '证据对比' }}
        </el-button>
      </div>
    </el-card>

    <RuntimeFrozenNotice v-if="!sseStore.live" />

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
              <TraceTopologySummary
                :detail="traceDetail"
                :blocking-point="blockingPoint"
                :path="tracePathData"
                :workline-detail="worklineDetailData"
                :path-loading="tracePathLoading"
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
                :detail="traceDetail"
                :diagnosis-verdict="tracePathData?.diagnosis_verdict ?? traceDetail.diagnosis_verdict"
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
                  <div class="trace-section__title">案件过程</div>
                  <div class="trace-section__desc">
                    用业务语言还原案件推进，技术字段按需展开
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
                          {{ traceDetail.trace.trace_id || primaryTraceSession?.trace_id || '--' }}
                        </strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Session Code</span>
                        <strong>{{ primaryTraceSession?.session_code || '--' }}</strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Run Mode</span>
                        <strong>{{ primaryTraceSession?.run_mode || '--' }}</strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Started / Ended</span>
                        <strong>
                          {{ formatRuntimeDateTime(primaryTraceSession?.started_at) }} ->
                          {{ formatRuntimeDateTime(primaryTraceSession?.ended_at) }}
                        </strong>
                      </div>
                      <div class="trace-session-card">
                        <span>Failure Message</span>
                        <strong>{{ primaryTraceSession?.failure_message || '--' }}</strong>
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
                        label="运行进度"
                        min-width="140"
                      >
                        <template #default="scope">
                          {{ resolveRuntimeProgressLabel(scope.row) }}
                        </template>
                      </el-table-column>
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
          v-else-if="showActiveTraceBoard"
          shadow="never"
          class="runtime-panel trace-active-board"
        >
          <template #header>
            <div class="runtime-panel__header">
              <div>
                <div class="runtime-panel__title">当前活动案件</div>
                <div class="runtime-panel__subtitle">
                  未关闭的运行、等待和人工挂起会话；点击进入单个运行案件。
                </div>
              </div>
              <RuntimeStatusBadge
                :label="`${activeTraceItems.length} ACTIVE`"
                tone="primary"
                size="small"
              />
            </div>
          </template>
          <RuntimeCaseQueue
            :traces="activeTraceItems"
            :active-traces="activeTraceItems"
            :failed-traces="[]"
            :loading="activeTraceLoading"
            :max-display="30"
            @select="openTraceFromList"
          />
        </el-card>

        <el-card
          v-else
          shadow="never"
          class="runtime-panel trace-layout__empty-state"
        >
          <RuntimeEmptyState
            title="当前没有活动案件"
            description="没有未关闭的运行、等待或人工挂起会话。"
            hint="可以使用上方案件或证据锚点搜索历史运行。"
          />
        </el-card>
      </div>
    </div>

    <TraceContrastPanel
      v-if="showContrast"
      class="trace-contrast-section"
      @close="showContrast = false"
    />
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
import RuntimeCaseQueue from '@/components/runtime/overview/RuntimeCaseQueue.vue'
import TraceBlockingPointCard from '@/components/runtime/trace/TraceBlockingPointCard.vue'
import TraceNextActions from '@/components/runtime/trace/TraceNextActions.vue'
import TraceContrastPanel from '@/components/runtime/trace/TraceContrastPanel.vue'
import TraceTimeline from '@/components/runtime/trace/TraceTimeline.vue'
import TraceTopologySummary from '@/components/runtime/trace/TraceTopologySummary.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'
import { useRuntimeStickyContextVisibility } from '@/composables/useRuntimeStickyContextVisibility'
import type {
  RuntimeTracePathResponse,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  TraceBlockingPointResponse,
  TraceDetailResponse
} from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import { isRelevantRuntimeEvent } from '@/utils/runtime-event'
import {
  buildRuntimeCaseQuery,
  buildRuntimeTraceQuery,
  type RuntimeTraceQueryInput
} from '@/utils/runtime-route'
import { displaySession } from '@/utils/runtime-display-identity'
import {
  compactEnumLabel,
  formatRuntimeDateTime,
  formatRuntimeDurationMs,
  readPositiveInt,
  resolveRuntimeProgressLabel
} from '@/utils/runtime-display'
import {
  buildRuntimeDiagnosisVerdict,
  resolveRuntimeBlockingPointFetch
} from '@/utils/runtime-diagnosis-verdict'

const route = useRoute()
const router = useRouter()
const sseStore = useRuntimeSSEStore()

const loading = ref(false)
const blockingPointLoading = ref(false)
const queryType = ref<TraceAnchorType>('session')
const queryValue = ref('')
const activeTab = ref('diagnostics')
const traceDetail = ref<TraceDetailResponse | null>(null)
const activeTraceItems = ref<RuntimeTraceListItem[]>([])
const blockingPoint = ref<TraceBlockingPointResponse | null>(null)
const tracePathData = ref<RuntimeTracePathResponse | null>(null)
const worklineDetailData = ref<RuntimeWorklineDetailResponse | null>(null)
const detailScrollRef = ref<HTMLElement | null>(null)
const detailHeroRef = ref<HTMLElement | null>(null)
const showContrast = ref(false)
const activeTraceLoading = ref(false)
const tracePathLoading = ref(false)
let traceRequestSeq = 0
let pendingRouteRequestSeq: number | null = null
let suppressNextRouteSync = false
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

type TraceSession = TraceDetailResponse['sessions'][number]
interface TracePathAnchor {
  sessionId?: number | null
  traceId?: string | null
}

const TRACE_QUERY_KEYS: Record<TraceAnchorType, string> = {
  trace: 'traceId',
  session: 'sessionId',
  request: 'requestId',
  command: 'commandCode',
  dispatch: 'dispatchKey',
  barcode: 'barcode'
}

function primarySession(detail: TraceDetailResponse | null | undefined): TraceSession | null {
  return detail?.sessions?.[0] ?? null
}

const primaryTraceSession = computed(() => primarySession(traceDetail.value))
const sessionJson = computed(() => JSON.stringify(primaryTraceSession.value ?? {}, null, 2))
const rawJson = computed(() => JSON.stringify(traceDetail.value ?? {}, null, 2))
const selectedSessionId = computed(() => traceDetail.value?.trace.session_id ?? null)
const selectedTraceId = computed(
  () => traceDetail.value?.trace.trace_id ?? primaryTraceSession.value?.trace_id ?? null
)

const traceStickyTitle = computed(() => {
  const session = primaryTraceSession.value
  return displaySession({
    session_code: session?.session_code,
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
  return traceDetail.value?.summary.session_status || primaryTraceSession.value?.status || null
})

const traceStickyFacts = computed(() => {
  const detail = traceDetail.value
  if (!detail) {
    return []
  }
  const session = primarySession(detail)

  const failureText =
    [session?.failure_domain, session?.failure_code].filter(Boolean).join(' / ') ||
    '--'

  return [
    {
      label: '运行进度',
      value: resolveRuntimeProgressLabel({
        ...detail.summary,
        status: session?.status
      })
    },
    { label: '失败域 / 码', value: failureText }
  ]
})

const showActiveTraceBoard = computed(
  () => activeTraceLoading.value || activeTraceItems.value.length > 0
)

function readRouteAnchor(): TraceAnchor | null {
  const anchorTypes: TraceAnchorType[] = [
    'session',
    'trace',
    'request',
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
  if (query.sessionId !== null && query.sessionId !== undefined && query.sessionId !== '') {
    const value = String(query.sessionId)
    if (Number.isFinite(Number(value))) {
      return { type: 'session', value }
    }
  }

  if (query.traceId) {
    return { type: 'trace', value: String(query.traceId) }
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

function readFirstRouteQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return readFirstRouteQueryValue(value[0])
  }
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return String(value)
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
      ...(type === 'session'
        ? buildRuntimeCaseQuery({
            ...query,
            [TRACE_QUERY_KEYS[type]]: value
          } as RuntimeTraceQueryInput)
        : buildRuntimeTraceQuery({
            ...query,
            [TRACE_QUERY_KEYS[type]]: value
          } as RuntimeTraceQueryInput))
    }
  })
}

function nextTraceRequestSeq(): number {
  traceRequestSeq += 1
  return traceRequestSeq
}

function isLatestTraceRequest(requestSeq: number): boolean {
  return requestSeq === traceRequestSeq
}

function clearTraceSecondaryState(): void {
  blockingPoint.value = null
  tracePathData.value = null
  worklineDetailData.value = null
  blockingPointLoading.value = false
  tracePathLoading.value = false
}

async function loadActiveTraces(): Promise<void> {
  activeTraceLoading.value = true
  try {
    const worklineId = readPositiveInt(route.query.worklineId)
    const deviceId = readPositiveInt(route.query.deviceId)
    const response = await runtimeApiMethods
      .queryTraces({
        only_active: true,
        limit: 30,
        offset: 0,
        workline_id: worklineId ?? undefined,
        device_id: deviceId ?? undefined
      })
      .send()
    activeTraceItems.value = response.items
    sseStore.markRefreshedAt()
  } catch {
    activeTraceItems.value = []
  } finally {
    activeTraceLoading.value = false
  }
}

async function loadTraceBySession(sessionId: number, requestSeq = nextTraceRequestSeq()) {
  const detail = await runtimeApiMethods.traceBySessionId(sessionId).send()
  if (!isLatestTraceRequest(requestSeq)) return
  await setTraceDetail(detail, requestSeq)
  sseStore.markRefreshedAt()
}

async function loadTraceByTraceId(traceId: string, requestSeq = nextTraceRequestSeq()) {
  const detail = await runtimeApiMethods.traceByTraceId(traceId).send()
  if (!isLatestTraceRequest(requestSeq)) return
  await setTraceDetail(detail, requestSeq)
  sseStore.markRefreshedAt()
}

async function loadTraceByAnchor(
  type: Exclude<TraceAnchorType, 'session' | 'trace' | 'barcode'>,
  value: string,
  requestSeq = nextTraceRequestSeq()
) {
  const requestMap = {
    request: runtimeApiMethods.traceByRequestId,
    command: runtimeApiMethods.traceByCommandCode,
    dispatch: runtimeApiMethods.traceByDispatchKey
  }

  const detail = await requestMap[type](value).send()
  if (!isLatestTraceRequest(requestSeq)) return
  await setTraceDetail(detail, requestSeq)
  sseStore.markRefreshedAt()
}

async function loadTraceByBarcode(barcode: string, requestSeq = nextTraceRequestSeq()) {
  let result = await runtimeApiMethods
    .queryTraces({ keyword: barcode, only_active: true, limit: 5 })
    .send()
  if (!isLatestTraceRequest(requestSeq)) return
  if (result.items.length === 0) {
    result = await runtimeApiMethods.queryTraces({ keyword: barcode, limit: 5 }).send()
  }
  if (!isLatestTraceRequest(requestSeq)) return
  if (result.items.length === 0) {
    traceDetail.value = null
    clearTraceSecondaryState()
    return
  }
  const item = result.items[0]
  if (item.session_id) {
    await loadTraceBySession(item.session_id, requestSeq)
  } else if (item.trace_id) {
    await loadTraceByTraceId(item.trace_id, requestSeq)
  }
}

async function loadTraceDetail(
  anchor: TraceAnchor,
  requestSeq = nextTraceRequestSeq()
): Promise<void> {
  if (anchor.type === 'trace') {
    await loadTraceByTraceId(anchor.value, requestSeq)
    return
  }

  if (anchor.type === 'session') {
    await loadTraceBySession(Number(anchor.value), requestSeq)
    return
  }

  if (anchor.type === 'barcode') {
    await loadTraceByBarcode(anchor.value, requestSeq)
    return
  }

  await loadTraceByAnchor(anchor.type, anchor.value, requestSeq)
}

function normalizeTraceDetail(detail: TraceDetailResponse): TraceDetailResponse {
  return {
    ...detail,
    sessions: detail.sessions ?? [],
    callback_logs: detail.callback_logs ?? [],
    inboxes: detail.inboxes ?? [],
    commands: detail.commands ?? [],
    outboxes: detail.outboxes ?? [],
    dispatch_attempts: detail.dispatch_attempts ?? [],
    timelines: detail.timelines ?? [],
    diagnostics: detail.diagnostics ?? []
  }
}

async function setTraceDetail(detail: TraceDetailResponse, requestSeq: number): Promise<void> {
  if (!isLatestTraceRequest(requestSeq)) return
  const nextDetail = normalizeTraceDetail(detail)
  traceDetail.value = nextDetail
  const session = primarySession(nextDetail)
  const traceId = nextDetail.trace.trace_id ?? session?.trace_id ?? null
  const sessionId = nextDetail.trace.session_id ?? session?.id ?? null
  const worklineId = session?.workline_id ?? nextDetail.trace.workline_id ?? null
  await normalizeRouteToSession(nextDetail)
  const [pathData] = await Promise.all([
    loadTracePath({ sessionId, traceId }, requestSeq),
    loadWorklineDetail(worklineId, requestSeq)
  ])
  if (!isLatestTraceRequest(requestSeq)) return
  const diagnosis = buildRuntimeDiagnosisVerdict({
    detail: nextDetail,
    verdict: pathData?.diagnosis_verdict ?? nextDetail.diagnosis_verdict
  })
  const blockingTraceId = pathData?.trace_id ?? traceId
  activeTab.value = diagnosis.defaultTab
  await (resolveRuntimeBlockingPointFetch(diagnosis)
    ? loadBlockingPoint(blockingTraceId, requestSeq)
    : skipBlockingPoint(requestSeq))
}

async function normalizeRouteToSession(detail: TraceDetailResponse): Promise<void> {
  const sessionId = detail.trace.session_id ?? primarySession(detail)?.id ?? null
  if (!sessionId || route.query.sessionId === String(sessionId)) {
    return
  }

  const nextQuery = { ...route.query }
  for (const queryKey of Object.values(TRACE_QUERY_KEYS)) {
    delete nextQuery[queryKey]
  }

  suppressNextRouteSync = true
  try {
    await router.replace({
      query: {
        ...nextQuery,
        ...buildRuntimeCaseQuery({
          sessionId,
          worklineId: readFirstRouteQueryValue(route.query.worklineId),
          deviceId: readFirstRouteQueryValue(route.query.deviceId)
        })
      }
    })
    applyAnchorToInputs({ type: 'session', value: String(sessionId) })
  } finally {
    suppressNextRouteSync = false
  }
}

async function loadBlockingPoint(traceId: string | null, requestSeq: number): Promise<void> {
  blockingPoint.value = null
  if (!traceId) {
    if (isLatestTraceRequest(requestSeq)) {
      blockingPointLoading.value = false
    }
    return
  }

  blockingPointLoading.value = true
  try {
    const nextBlockingPoint = await runtimeApiMethods.traceBlockingPoint(traceId).send()
    if (isLatestTraceRequest(requestSeq)) {
      blockingPoint.value = nextBlockingPoint
    }
  } catch {
    if (isLatestTraceRequest(requestSeq)) {
      blockingPoint.value = null
    }
  } finally {
    if (isLatestTraceRequest(requestSeq)) {
      blockingPointLoading.value = false
    }
  }
}

function skipBlockingPoint(requestSeq: number): void {
  if (!isLatestTraceRequest(requestSeq)) {
    return
  }
  blockingPoint.value = null
  blockingPointLoading.value = false
}

async function loadTracePath(
  anchor: TracePathAnchor,
  requestSeq: number
): Promise<RuntimeTracePathResponse | null> {
  tracePathData.value = null
  const sessionId = anchor.sessionId ?? null
  const traceId = anchor.traceId ?? null
  if (!sessionId && !traceId) {
    if (isLatestTraceRequest(requestSeq)) {
      tracePathLoading.value = false
    }
    return null
  }

  tracePathLoading.value = true
  try {
    const nextPathData = sessionId
      ? await runtimeApiMethods.sessionPath(sessionId).send()
      : await runtimeApiMethods.tracePath(traceId as string).send()
    if (isLatestTraceRequest(requestSeq)) {
      const normalizedPathData = {
        ...nextPathData,
        devices: nextPathData.devices ?? [],
        timeline_groups: nextPathData.timeline_groups ?? []
      }
      tracePathData.value = normalizedPathData
      return normalizedPathData
    }
  } catch {
    if (isLatestTraceRequest(requestSeq)) {
      tracePathData.value = null
    }
  } finally {
    if (isLatestTraceRequest(requestSeq)) {
      tracePathLoading.value = false
    }
  }
  return null
}

async function loadWorklineDetail(
  worklineId: number | null | undefined,
  requestSeq: number
): Promise<void> {
  worklineDetailData.value = null
  if (!worklineId) {
    return
  }

  try {
    const nextWorklineDetail = await runtimeApiMethods.worklineDetail(worklineId).send()
    if (isLatestTraceRequest(requestSeq)) {
      worklineDetailData.value = nextWorklineDetail
    }
  } catch {
    if (isLatestTraceRequest(requestSeq)) {
      worklineDetailData.value = null
    }
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

async function openTraceFromList(trace: RuntimeTraceListItem) {
  await openTraceFromAction({
    sessionId: String(trace.session_id),
    traceId: undefined,
    worklineId: trace.workline_id,
    deviceId: trace.device_id
  })
}

async function refreshCurrent() {
  const requestSeq = nextTraceRequestSeq()
  loading.value = true
  try {
    const activeSessionId = traceDetail.value?.trace.session_id ?? primaryTraceSession.value?.id
    if (activeSessionId) {
      await loadTraceBySession(activeSessionId, requestSeq)
      return
    }

    const activeTraceId = selectedTraceId.value
    if (activeTraceId) {
      await loadTraceByTraceId(activeTraceId, requestSeq)
      return
    }

    const routeAnchor = readRouteAnchor()
    if (routeAnchor) {
      await loadTraceDetail(routeAnchor, requestSeq)
    } else {
      await loadActiveTraces()
    }
  } finally {
    if (isLatestTraceRequest(requestSeq)) {
      loading.value = false
    }
  }
}

const refreshCurrentCoalesced = createCoalescedAsyncTask(refreshCurrent)

async function syncTraceRouteState() {
  const requestSeq = pendingRouteRequestSeq ?? nextTraceRequestSeq()
  pendingRouteRequestSeq = null
  loading.value = true
  try {
    const routeAnchor = readRouteAnchor()
    if (routeAnchor) {
      if (
        routeAnchor.type === 'session' &&
        traceDetail.value &&
        (traceDetail.value.trace.session_id === Number(routeAnchor.value) ||
          primaryTraceSession.value?.id === Number(routeAnchor.value))
      ) {
        applyAnchorToInputs(routeAnchor)
        return
      }
      activeTraceItems.value = []
      applyAnchorToInputs(routeAnchor)
      await loadTraceDetail(routeAnchor, requestSeq)
    } else {
      queryValue.value = ''
      traceDetail.value = null
      clearTraceSecondaryState()
      await loadActiveTraces()
    }
  } finally {
    if (isLatestTraceRequest(requestSeq)) {
      loading.value = false
    }
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
    route.query.barcode,
    route.query.worklineId,
    route.query.deviceId
  ],
  () => {
    if (suppressNextRouteSync) {
      return
    }
    pendingRouteRequestSeq = nextTraceRequestSeq()
    void syncTraceRouteStateCoalesced()
  }
)

watch(
  () => sseStore.lastEvent,
  async event => {
    if (!sseStore.live || !event) return

    if (!traceDetail.value && !readRouteAnchor()) {
      await loadActiveTraces()
      return
    }

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
.trace-contrast-section {
  margin-top: 16px;
  padding: 20px;
  border: 1px solid rgb(245 158 11 / 0.14);
  border-radius: 14px;
  background: #1e293b;
}
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
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
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

  .trace-layout__detail {
    height: 100%;
    min-height: 0;
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
