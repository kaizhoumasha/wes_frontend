<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import DiagnosticsFilters from '@/views/ops/wms-diagnostics/DiagnosticsFilters.vue'
import DiagnosticsDetailPanel from '@/views/ops/wms-diagnostics/DiagnosticsDetailPanel.vue'
import {
  useWmsDiagnostics,
  type WmsConsoleRow
} from '@/views/ops/wms-diagnostics/useWmsDiagnostics'

const { hasPermission } = usePermission()
const canQuery = computed(() => hasPermission(OPS_PERMISSIONS.wmsDiagnostics.query))
const canRead = computed(() => hasPermission(OPS_PERMISSIONS.wmsDiagnostics.read))
const canStream = computed(() => hasPermission(OPS_PERMISSIONS.wmsDiagnostics.stream))
const state = useWmsDiagnostics()
const {
  mode,
  exchanges,
  detail,
  paused,
  bufferBytes,
  evictedCount,
  pendingCount,
  hasGap,
  connectionState,
  streamError,
  historyError,
  detailError,
  loading,
  loadingDetail,
  nextCursor,
  scanIncomplete,
  retentionHours
} = state
const consoleElement = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)
const connectionLabel = computed(
  () =>
    ({
      DISCONNECTED: '已断开',
      CONNECTING: '正在连接',
      CONNECTED: '已连接',
      RECONNECTED: '已重连'
    })[connectionState.value]
)
const contractLabel = (row: WmsConsoleRow) =>
  ({ PASS: '接口符合合同', ERROR: '合同错误', NOT_VALIDATED: '未取得校验日志' })[
    row.exchange.contract_status ?? 'NOT_VALIDATED'
  ]
const isError = (row: WmsConsoleRow) =>
  Boolean(row.exchange.error_code) || row.exchange.contract_status === 'ERROR'
function select(row: WmsConsoleRow) {
  selectedId.value = row.exchange.attempt_id
  void state.select(row)
}
function clear() {
  selectedId.value = null
  state.clearView()
}
function reconnect() {
  state.disconnect()
  state.connect()
}
function onScroll() {
  const element = consoleElement.value
  if (element && element.scrollHeight - element.scrollTop - element.clientHeight > 32)
    paused.value = true
}
watch([exchanges, paused], async () => {
  if (mode.value !== 'live' || paused.value) return
  await nextTick()
  const element = consoleElement.value
  if (element) element.scrollTop = element.scrollHeight
})
onMounted(() => {
  if (canStream.value) state.connect()
  else if (canQuery.value) void state.setMode('recent')
})
</script>

<template>
  <main class="wms-console">
    <header class="console-header">
      <div>
        <p class="eyebrow">WES OBSERVED / 当前环境</p>
        <h1>WMS 联调诊断</h1>
      </div>
      <span
        class="connection"
        role="status"
      >
        {{ mode === 'live' ? `● ${connectionLabel}` : '◷ 近期记录' }}
      </span>
    </header>
    <p class="scope-note">
      WES 观察到的双方请求、响应与校验日志。接口结果是采集时快照，不代表当前业务状态或物理完成。
    </p>
    <nav
      class="console-toolbar"
      aria-label="诊断视图"
    >
      <button
        data-mode="live"
        :disabled="!canStream"
        :aria-pressed="mode === 'live'"
        @click="state.setMode('live')"
      >
        实时观察
      </button>
      <button
        data-mode="recent"
        :disabled="!canQuery"
        :aria-pressed="mode === 'recent'"
        @click="state.setMode('recent')"
      >
        近期记录
      </button>
      <template v-if="mode === 'live'">
        <button
          data-action="pause"
          :aria-pressed="paused"
          @click="paused = !paused"
        >
          {{ paused ? `恢复跟随 · ${pendingCount} 条更新` : '暂停滚动' }}
        </button>
        <button
          :disabled="!canStream"
          @click="reconnect"
        >
          重新连接
        </button>
      </template>
      <button
        v-else
        :disabled="loading"
        @click="state.loadRecent()"
      >
        刷新记录
      </button>
      <button
        data-action="clear"
        @click="clear"
      >
        清空视图
      </button>
    </nav>
    <DiagnosticsFilters
      :recent="mode === 'recent'"
      :loading="loading"
      @apply="state.applyFilters"
    />
    <p
      v-if="hasGap"
      class="notice"
    >
      △ 实时记录可能存在间隙；断开期间不会补推，可切换近期记录手动查询。
    </p>
    <p
      v-if="streamError && mode === 'live'"
      class="error-message"
      role="alert"
    >
      实时连接异常：{{ streamError.message }}。正在按连接策略重试。
    </p>
    <p
      v-if="historyError"
      class="error-message"
      role="alert"
    >
      近期记录查询失败：{{ historyError.message }}。请重新查询；这不代表没有调用。
    </p>
    <div class="console-workspace">
      <section
        class="console-list"
        aria-label="交互记录"
      >
        <div class="list-status">
          <span>{{ exchanges.length }} 条交互 · {{ (bufferBytes / 1024).toFixed(0) }} KiB</span>
          <span>最多 500 条 / 2 MiB</span>
        </div>
        <p
          v-if="evictedCount"
          class="notice"
        >
          已淘汰 {{ evictedCount }} 条最早记录；已选详情保留至关闭。
        </p>
        <div
          ref="consoleElement"
          class="console-scroll"
          @scroll.passive="onScroll"
        >
          <p
            v-if="!exchanges.length"
            class="empty-state"
          >
            {{
              loading
                ? '正在查询近期记录…'
                : mode === 'live'
                  ? '等待新的交互。没有日志不代表没有调用，可查询近期记录或检查连接。'
                  : '暂无匹配记录。可调整筛选；没有记录不代表没有调用。'
            }}
          </p>
          <button
            v-for="row in exchanges"
            :key="row.exchange.attempt_id"
            class="console-row"
            :class="{
              'is-error': isError(row),
              'is-selected': selectedId === row.exchange.attempt_id
            }"
            :disabled="row.phase === 'recorded' && !canRead"
            :title="
              row.phase === 'recorded' && !canRead ? '当前账号没有详情读取权限' : '查看当次交互详情'
            "
            @click="select(row)"
          >
            <span class="row-top">
              <time :title="row.exchange.observed_at">{{ row.exchange.observed_at }}</time>
              <span class="direction">
                {{ row.exchange.direction === 'WMS_TO_WES' ? 'WMS → WES' : 'WES → WMS' }}
              </span>
              <span>
                {{ row.phase === 'started' ? '收发中' : `HTTP ${row.exchange.status_code ?? '—'}` }}
                · {{ row.exchange.elapsed_ms?.toFixed(1) ?? '—' }} ms
              </span>
            </span>
            <strong>{{ row.exchange.operation || '未识别 operation' }}</strong>
            <span class="identity">{{ row.exchange.operation_id || '未识别 operation_id' }}</span>
            <span
              v-if="row.exchange.business_reference"
              class="identity"
            >
              关联 {{ row.exchange.business_reference }}
            </span>
            <span class="row-result">
              <span>{{ isError(row) ? '! ' : '' }}{{ contractLabel(row) }}</span>
              <span
                :class="{
                  warning: ['WAIT', 'REJECTED', 'DUPLICATE'].includes(row.exchange.result ?? '')
                }"
              >
                {{ row.exchange.result }}
              </span>
              <span v-if="row.exchange.error_code">{{ row.exchange.error_code }}</span>
              <span v-if="row.exchange.incomplete">△ 采集不完整</span>
            </span>
          </button>
        </div>
        <footer v-if="mode === 'recent'">
          <span v-if="retentionHours">保留 {{ retentionHours }} 小时</span>
          <span v-if="scanIncomplete">本页扫描未完成</span>
          <button
            v-if="nextCursor"
            :disabled="loading"
            @click="state.loadMore()"
          >
            继续查询
          </button>
        </footer>
      </section>
      <DiagnosticsDetailPanel
        :detail="detail"
        :loading-detail="loadingDetail"
        :detail-error="detailError"
        @close="state.closeDetail()"
      />
    </div>
  </main>
</template>

<style scoped src="./wms-diagnostics.css"></style>
