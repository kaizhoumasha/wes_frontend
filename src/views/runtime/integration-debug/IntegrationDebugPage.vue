<template>
  <div
    v-loading="loading"
    class="runtime-page integration-debug"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">集成调试台</h1>
        <p class="runtime-page__subtitle">
          {{ envLabel }} 环境只读定位，聚合入口、Session、命令、设备回调和外部同步证据。
        </p>
      </div>
      <div class="runtime-page__status-bar integration-debug__status">
        <RuntimeStatusBadge
          :label="sseStore.connectionLabel"
          :tone="sseStore.connectionTone"
          :pulse="sseStore.live && sseStore.state === 'connected'"
        />
        <RuntimeLastUpdated
          :value="sseStore.lastRefreshedAt"
          :frozen="!sseStore.live"
        />
        <el-button
          plain
          :icon="Refresh"
          @click="refresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!sseStore.live" />

    <section class="integration-debug__query runtime-panel">
      <el-select
        v-model="anchorType"
        class="integration-debug__anchor-type"
      >
        <el-option
          label="Session Code"
          value="session_code"
        />
        <el-option
          label="Session ID"
          value="session_id"
        />
        <el-option
          label="Command Code"
          value="command_code"
        />
        <el-option
          label="Trace ID"
          value="trace_id"
        />
        <el-option
          label="Request ID"
          value="request_id"
        />
        <el-option
          label="Dispatch Key"
          value="dispatch_key"
        />
        <el-option
          label="Barcode"
          value="barcode"
        />
        <el-option
          label="Business Key"
          value="business_key"
        />
      </el-select>
      <el-input
        v-model="anchor"
        class="integration-debug__anchor-input"
        placeholder="输入集成调试锚点"
        clearable
        @keyup.enter="lookupCase"
      />
      <el-button
        type="primary"
        :icon="Search"
        @click="lookupCase"
      >
        定位
      </el-button>
    </section>

    <div class="integration-debug__layout">
      <aside class="integration-debug__latest runtime-panel">
        <div class="integration-debug__panel-head">
          <div>
            <h2>最新案件</h2>
            <span>{{ latestCases.length }} / {{ latestTotal }}</span>
          </div>
          <el-select
            v-model="latestStatus"
            class="integration-debug__status-filter"
            clearable
            placeholder="状态"
            @change="loadLatestCases"
          >
            <el-option
              label="MANUAL_HOLD"
              value="MANUAL_HOLD"
            />
            <el-option
              label="WAITING_EXTERNAL"
              value="WAITING_EXTERNAL"
            />
            <el-option
              label="FAILED"
              value="FAILED"
            />
            <el-option
              label="RUNNING"
              value="RUNNING"
            />
          </el-select>
        </div>

        <div class="integration-debug__case-list">
          <button
            v-for="item in latestCases"
            :key="item.case_id"
            type="button"
            class="integration-debug__case-row"
            :class="{
              'integration-debug__case-row--active': item.case_id === selectedCase?.case_id
            }"
            @click="selectCase(item)"
          >
            <span>
              <strong>{{ item.session_code || item.case_id }}</strong>
              <small>{{ item.summary }}</small>
            </span>
            <RuntimeStatusBadge
              :label="item.verdict"
              :tone="verdictTone(item.verdict)"
            />
          </button>
          <RuntimeEmptyState
            v-if="latestCases.length === 0"
            title="暂无案件"
            description="当前筛选条件下没有可定位的集成调试数据"
          />
        </div>
      </aside>

      <main class="integration-debug__main">
        <template v-if="selectedCase">
          <section class="integration-debug__verdict runtime-panel">
            <div class="integration-debug__verdict-copy">
              <RuntimeStatusBadge
                :label="selectedCase.verdict"
                :tone="verdictTone(selectedCase.verdict)"
              />
              <h2>{{ selectedCase.summary }}</h2>
              <div class="integration-debug__meta">
                <span>{{ selectedCase.phase }}</span>
                <span>{{ selectedCase.owner }}</span>
                <span>{{ selectedCase.blocking_code || '--' }}</span>
              </div>
            </div>
            <el-button
              plain
              :icon="Link"
              @click="openTrace(selectedCase)"
            >
              Trace
            </el-button>
          </section>

          <section class="integration-debug__pipeline runtime-panel">
            <div
              v-for="stage in selectedCase.stage_checks"
              :key="stage.key"
              class="integration-debug__stage"
              :class="`integration-debug__stage--${stage.state}`"
            >
              <span>{{ stage.label }}</span>
              <strong>{{ stageLabel(stage.state) }}</strong>
            </div>
          </section>

          <section class="integration-debug__content-grid">
            <div class="runtime-panel integration-debug__facts">
              <div class="integration-debug__panel-head">
                <h2>关键事实</h2>
              </div>
              <dl>
                <template
                  v-for="fact in visibleFacts"
                  :key="fact.label"
                >
                  <dt>{{ fact.label }}</dt>
                  <dd>{{ fact.value }}</dd>
                </template>
              </dl>
            </div>

            <div class="runtime-panel integration-debug__actions">
              <div class="integration-debug__panel-head">
                <h2>下一步</h2>
              </div>
              <button
                v-for="action in selectedCase.next_actions"
                :key="action.kind"
                type="button"
                class="integration-debug__action"
                @click="openAction(action)"
              >
                <strong>{{ action.label }}</strong>
                <span>{{ action.description }}</span>
              </button>
            </div>
          </section>

          <section class="runtime-panel integration-debug__evidence">
            <div class="integration-debug__panel-head">
              <h2>证据入口</h2>
            </div>
            <el-table
              :data="selectedCase.evidence_links"
              size="small"
            >
              <el-table-column
                prop="kind"
                label="类型"
                width="140"
              />
              <el-table-column
                prop="label"
                label="入口"
                min-width="180"
              />
              <el-table-column
                prop="api_path"
                label="API"
                min-width="260"
                show-overflow-tooltip
              />
            </el-table>
          </section>
        </template>

        <RuntimeEmptyState
          v-else
          class="runtime-panel integration-debug__empty"
          title="选择或查询一个案件"
          description="支持 Session、Command、Trace、Request、Dispatch、条码和业务键"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Link, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { env } from '@/config/env'
import { useRuntimeSSEStore } from '@/stores/runtime-sse'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import type { IntegrationDebugCaseResponse, IntegrationDebugNextAction } from '@/types/runtime'

type AnchorType =
  | 'session_code'
  | 'session_id'
  | 'command_code'
  | 'trace_id'
  | 'request_id'
  | 'dispatch_key'
  | 'barcode'
  | 'business_key'

const route = useRoute()
const router = useRouter()
const sseStore = useRuntimeSSEStore()

const loading = ref(false)
const anchorType = ref<AnchorType>('session_code')
const anchor = ref('')
const latestStatus = ref<string | undefined>()
const latestCases = ref<IntegrationDebugCaseResponse[]>([])
const latestTotal = ref(0)
const selectedCase = ref<IntegrationDebugCaseResponse | null>(null)
const envLabel = computed(() => env.appEnv)

const visibleFacts = computed(() => {
  const facts = selectedCase.value?.facts ?? {}
  return [
    ['Session', selectedCase.value?.session_code || selectedCase.value?.session_id],
    ['Trace', selectedCase.value?.trace_id],
    ['Request', selectedCase.value?.request_id],
    ['Command', selectedCase.value?.command_code],
    ['工作线', facts.workline_id],
    ['物料', facts.barcode || facts.business_key],
    ['ACK', facts.command_acked === true ? '已收到' : '未确认'],
    ['命令结果', facts.command_completed === true ? '已完成' : '未完成'],
    ['WMS', [facts.wms_target_code, facts.wms_reason_code].filter(Boolean).join(' / ')]
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => ({ label: String(label), value: String(value) }))
})

const loadLatestCases = createCoalescedAsyncTask(async () => {
  const result = await runtimeApiMethods
    .integrationDebugLatest({
      limit: 10,
      status: latestStatus.value || undefined
    })
    .send()
  latestCases.value = result.items
  latestTotal.value = result.total
  if (!selectedCase.value && result.items.length > 0) {
    selectedCase.value = result.items[0]
  }
})

const refresh = createCoalescedAsyncTask(async () => {
  loading.value = true
  try {
    await loadLatestCases()
    sseStore.markRefreshedAt()
  } finally {
    loading.value = false
  }
})

async function lookupCase(): Promise<void> {
  const value = anchor.value.trim()
  if (!value) return
  loading.value = true
  try {
    selectedCase.value = await runtimeApiMethods
      .integrationDebugLookup({
        anchor_type: anchorType.value,
        anchor: value
      })
      .send()
    await router.replace({ query: { anchorType: anchorType.value, anchor: value } })
    sseStore.markRefreshedAt()
  } catch {
    selectedCase.value = null
    ElMessage.warning('未找到匹配的集成调试案件')
  } finally {
    loading.value = false
  }
}

function selectCase(item: IntegrationDebugCaseResponse): void {
  selectedCase.value = item
  anchorType.value = 'session_id'
  anchor.value = item.session_id ? String(item.session_id) : item.trace_id || item.case_id
}

function verdictTone(verdict: string): 'success' | 'warning' | 'danger' | 'info' {
  if (verdict === 'ok') return 'success'
  if (verdict === 'blocked' || verdict === 'failed') return 'danger'
  if (verdict === 'waiting') return 'warning'
  return 'info'
}

function stageLabel(state: string): string {
  const labels: Record<string, string> = {
    ok: 'OK',
    waiting: '等待',
    blocked: '阻塞',
    failed: '失败',
    unknown: '未知',
    not_started: '未开始'
  }
  return labels[state] ?? state
}

function openTrace(item: IntegrationDebugCaseResponse): void {
  router.push({
    name: 'RuntimeTraces',
    query: {
      traceId: item.trace_id || undefined,
      sessionId: item.trace_id ? undefined : item.session_id ? String(item.session_id) : undefined,
      commandCode: item.trace_id ? undefined : item.command_code || undefined
    }
  })
}

function openAction(action: IntegrationDebugNextAction): void {
  if (action.route_name === 'RuntimeTraces' && selectedCase.value) {
    openTrace(selectedCase.value)
  }
}

onMounted(() => {
  const queryAnchorType = route.query.anchorType
  const queryAnchor = route.query.anchor
  if (typeof queryAnchorType === 'string' && typeof queryAnchor === 'string') {
    anchorType.value = queryAnchorType as AnchorType
    anchor.value = queryAnchor
    void lookupCase()
  }
  void refresh()
})

watch(
  () => sseStore.lastEvent,
  event => {
    if (!sseStore.live || !event) return
    void refresh()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 860px;
  color: #94a3b8;
}

.runtime-page__title {
  color: #f8fafc;
}

.integration-debug {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 20px;
}

.integration-debug__status,
.integration-debug__query,
.integration-debug__panel-head,
.integration-debug__meta,
.integration-debug__content-grid {
  display: flex;
  align-items: center;
}

.integration-debug__query {
  gap: 12px;
  padding: 14px;
}

.integration-debug__anchor-type {
  width: 180px;
  flex: 0 0 auto;
}

.integration-debug__anchor-input {
  min-width: 260px;
  flex: 1;
}

.integration-debug__layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.integration-debug__latest,
.integration-debug__main,
.integration-debug__case-list,
.integration-debug__actions {
  display: flex;
  flex-direction: column;
}

.integration-debug__latest,
.integration-debug__main {
  gap: 14px;
}

.integration-debug__panel-head {
  justify-content: space-between;
  gap: 12px;
}

.integration-debug__panel-head h2 {
  margin: 0;
  color: #e2e8f0;
  font-size: 15px;
}

.integration-debug__panel-head span {
  color: #94a3b8;
  font-size: 12px;
}

.integration-debug__status-filter {
  width: 150px;
}

.integration-debug__case-list {
  gap: 10px;
  margin-top: 12px;
}

.integration-debug__case-row,
.integration-debug__action {
  border: 1px solid rgb(148 163 184 / 0.16);
  border-radius: 8px;
  background: rgb(15 23 42 / 0.62);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.integration-debug__case-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.integration-debug__case-row--active {
  border-color: rgb(245 158 11 / 0.72);
  background: rgb(245 158 11 / 0.1);
}

.integration-debug__case-row strong,
.integration-debug__action strong {
  display: block;
  color: #f8fafc;
  font-size: 13px;
}

.integration-debug__case-row small,
.integration-debug__action span {
  display: -webkit-box;
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.integration-debug__verdict {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.integration-debug__verdict-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.integration-debug__verdict h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 22px;
  line-height: 1.3;
}

.integration-debug__meta {
  flex-wrap: wrap;
  gap: 8px;
}

.integration-debug__meta span {
  padding: 3px 8px;
  border: 1px solid rgb(148 163 184 / 0.16);
  border-radius: 999px;
  color: #cbd5e1;
  font-size: 12px;
}

.integration-debug__pipeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
  padding: 14px;
}

.integration-debug__stage {
  min-height: 74px;
  padding: 10px;
  border: 1px solid rgb(148 163 184 / 0.16);
  border-radius: 8px;
  background: rgb(15 23 42 / 0.5);
}

.integration-debug__stage span,
.integration-debug__stage strong {
  display: block;
}

.integration-debug__stage span {
  color: #94a3b8;
  font-size: 12px;
}

.integration-debug__stage strong {
  margin-top: 12px;
  color: #e2e8f0;
  font-size: 15px;
}

.integration-debug__stage--ok {
  border-color: rgb(34 197 94 / 0.36);
}

.integration-debug__stage--waiting {
  border-color: rgb(245 158 11 / 0.4);
}

.integration-debug__stage--blocked,
.integration-debug__stage--failed {
  border-color: rgb(239 68 68 / 0.55);
  background: rgb(127 29 29 / 0.22);
}

.integration-debug__content-grid {
  align-items: stretch;
  gap: 14px;
}

.integration-debug__facts,
.integration-debug__actions {
  flex: 1;
  min-width: 0;
  padding: 14px;
}

.integration-debug__facts dl {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 10px 14px;
  margin: 14px 0 0;
}

.integration-debug__facts dt {
  color: #94a3b8;
  font-size: 12px;
}

.integration-debug__facts dd {
  min-width: 0;
  margin: 0;
  color: #e2e8f0;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.integration-debug__actions {
  gap: 10px;
}

.integration-debug__action {
  padding: 12px;
}

.integration-debug__evidence {
  padding: 14px;
}

.integration-debug__evidence :deep(.el-table) {
  margin-top: 12px;
}

.integration-debug__empty {
  min-height: 420px;
}

@media (width <= 1100px) {
  .integration-debug__layout,
  .integration-debug__content-grid,
  .integration-debug__pipeline {
    grid-template-columns: 1fr;
  }

  .integration-debug__content-grid {
    flex-direction: column;
  }
}

@media (width <= 720px) {
  .integration-debug__query,
  .integration-debug__status {
    align-items: stretch;
    flex-direction: column;
  }

  .integration-debug__anchor-type,
  .integration-debug__status-filter {
    width: 100%;
  }
}
</style>
