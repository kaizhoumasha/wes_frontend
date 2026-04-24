<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">运行监控中心</h1>
        <p class="runtime-page__subtitle">
          先判断系统有没有问题，再决定先处理哪一条链路、哪一条工作线、哪一台设备。
        </p>
      </div>
      <div class="runtime-page__status-bar">
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
        <RuntimeLastUpdated :value="lastRefreshedAt" :frozen="!live" />
        <el-button type="primary" @click="refresh">刷新</el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="runtime-overview__dashboard">
      <div class="runtime-overview__column runtime-overview__column--action">
        <RuntimeSystemVerdict :summary="verdictSummary" :loading="loading" />
        <div class="runtime-overview__queue-wrapper">
          <RuntimePriorityQueue :items="priorityItems" :loading="loading" @navigate="handleNavigate" />
          <div v-if="isStale" class="runtime-overview__stale-hint">数据可能已过期 (SSE &gt; 15s)</div>
        </div>
      </div>

      <div class="runtime-overview__column runtime-overview__column--signal">
        <RuntimeSignalStrip :cards="overview.stats" />
        <el-collapse class="runtime-overview__health-collapse">
          <el-collapse-item name="health">
            <template #title>
              <span class="runtime-overview__health-title">结构健康</span>
            </template>
            <div class="runtime-overview__health-grid">
              <RuntimeHealthBreakdown title="工作线结构健康" subtitle="判断故障是否集中在某几条线体" :total="worklines.length" :items="worklineHealthItems" />
              <RuntimeHealthBreakdown title="设备健康分布" subtitle="识别异常、维护与高负载设备占比" :total="overview.device_health.total" :items="deviceHealthItems" />
              <RuntimeHealthBreakdown title="Session 结构信号" subtitle="把运行 / 等待 / 失败 / 积压放在同一视图里" :total="sessionStructureTotal" :items="sessionStructureItems" />
            </div>
          </el-collapse-item>
        </el-collapse>
        <RuntimeTraceList :traces="overview.recent_failed_traces" :loading="loading" @select="openTrace" @show-more="goTraceExplorer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNow } from '@vueuse/core'
import RuntimeHealthBreakdown from '@/components/common/runtime/RuntimeHealthBreakdown.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimePriorityQueue from '@/components/common/runtime/RuntimePriorityQueue.vue'
import RuntimeSignalStrip from '@/components/common/runtime/RuntimeSignalStrip.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import RuntimeSystemVerdict from '@/components/common/runtime/RuntimeSystemVerdict.vue'
import RuntimeTraceList from '@/components/common/runtime/RuntimeTraceList.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { RuntimeOverviewResponse, RuntimeWorklineSummary } from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'
import type { RuntimeTone } from '@/utils/runtime-display'
import { classifyToTiers, computeVerdictSummary, type PriorityItem } from '@/utils/runtime-priority'

const router = useRouter()
const {
  connectionLabel, connectionTone, lastEvent, lastRawEvent,
  lastRefreshedAt, live, markRefreshedAt, state, toggleLive
} = useRuntimePageChrome()

const loading = ref(false)
const overview = ref<RuntimeOverviewResponse>({
  stats: [], recent_failed_traces: [], hot_worklines: [], abnormal_devices: [],
  device_health: { total: 0, abnormal: 0, maintenance: 0, loaded: 0, healthy: 0 }
})
const worklines = ref<RuntimeWorklineSummary[]>([])

const priorityItems = computed(() => classifyToTiers(overview.value))
const verdictSummary = computed(() => computeVerdictSummary(priorityItems.value, overview.value, worklines.value))

const now = useNow()
const isStale = computed(() => {
  if (!live.value || !lastRawEvent.value) return false
  const ts = (lastRawEvent.value.original as MessageEvent | undefined)?.timeStamp
  if (!ts) return false
  return now.value.getTime() - ts > 15_000
})

function statValue(key: string): number {
  return overview.value.stats.find(s => s.key === key)?.value ?? 0
}

function ratio(value: number, total: number): number {
  return total <= 0 ? 0 : Math.min(100, Math.round((value / total) * 100))
}

const worklineHealthItems = computed(() => {
  const total = worklines.value.length || 1
  const blocked = worklines.value.filter(i => i.failed_session_count > 0 || i.offline_device_count > 0 || i.error_device_count > 0).length
  const waiting = worklines.value.filter(i => i.waiting_session_count > 0 && i.failed_session_count === 0).length
  const stable = worklines.value.filter(i => i.failed_session_count === 0 && i.offline_device_count === 0 && i.error_device_count === 0 && i.waiting_session_count === 0).length
  const active = worklines.value.filter(i => i.active_session_count > 0).length
  return [
    { label: '阻塞 / 告警', value: blocked, ratio: ratio(blocked, total), tone: 'danger' as RuntimeTone, hint: '存在失败 Session 或异常设备' },
    { label: '等待堆积', value: waiting, ratio: ratio(waiting, total), tone: 'warning' as RuntimeTone, hint: '等待态 Session 已开始堆积' },
    { label: '稳定运行', value: stable, ratio: ratio(stable, total), tone: 'success' as RuntimeTone, hint: '无失败 / 离线 / 等待堆积' },
    { label: '有作业活动', value: active, ratio: ratio(active, total), tone: 'primary' as RuntimeTone, hint: '当前仍在承载运行链路' }
  ]
})

const deviceHealthItems = computed(() => {
  const total = overview.value.device_health.total || 1
  const { abnormal, maintenance, loaded, healthy } = overview.value.device_health
  return [
    { label: '异常设备', value: abnormal, ratio: ratio(abnormal, total), tone: 'danger' as RuntimeTone, hint: '状态为 ERROR / OFFLINE' },
    { label: '维护模式', value: maintenance, ratio: ratio(maintenance, total), tone: 'warning' as RuntimeTone, hint: '人工维护中的设备' },
    { label: '高负载设备', value: loaded, ratio: ratio(loaded, total), tone: 'primary' as RuntimeTone, hint: '存在未结命令' },
    { label: '健康可用', value: healthy, ratio: ratio(healthy, total), tone: 'success' as RuntimeTone, hint: '适合继续承担链路执行' }
  ]
})

const sessionStructureTotal = computed(() =>
  statValue('running_sessions') + statValue('waiting_sessions') + statValue('failed_sessions') + statValue('inbox_backlog') + statValue('outbox_backlog')
)

const sessionStructureItems = computed(() => {
  const running = statValue('running_sessions')
  const waiting = statValue('waiting_sessions')
  const failed = statValue('failed_sessions')
  const backlog = statValue('inbox_backlog') + statValue('outbox_backlog')
  const total = running + waiting + failed + backlog || 1
  return [
    { label: '运行中', value: running, ratio: ratio(running, total), tone: 'primary' as RuntimeTone, hint: '链路仍在向前推进' },
    { label: '等待中', value: waiting, ratio: ratio(waiting, total), tone: 'warning' as RuntimeTone, hint: '等待设备/外部结果' },
    { label: '失败/超时', value: failed, ratio: ratio(failed, total), tone: 'danger' as RuntimeTone, hint: '需要优先排障的链路' },
    { label: '入口/派发积压', value: backlog, ratio: ratio(backlog, total), tone: 'info' as RuntimeTone, hint: '系统吞吐可能开始堆积' }
  ]
})

async function loadOverviewData(): Promise<void> {
  const [overviewData, worklineData] = await Promise.all([
    runtimeApiMethods.overview().send(),
    runtimeApiMethods.worklines().send()
  ])
  overview.value = overviewData
  worklines.value = worklineData
  markRefreshedAt()
}

const refresh = createCoalescedAsyncTask(async () => {
  loading.value = true
  try { await loadOverviewData() } finally { loading.value = false }
})

function openTrace(sessionId: number) {
  router.push({ name: 'RuntimeTraceExplorer', query: { sessionId: String(sessionId) } })
}

function goTraceExplorer() {
  router.push({ name: 'RuntimeTraceExplorer' })
}

function handleNavigate(item: PriorityItem) {
  router.push(item.navigateTo)
}

onMounted(() => { void refresh() })

watch(() => lastEvent.value, event => {
  if (!live.value || !event) return
  void refresh()
})
</script>

<style scoped>
.runtime-page__subtitle { max-width: 840px; }

.runtime-overview__dashboard {
  display: grid;
  gap: 16px;
  grid-template-columns: 1.2fr 1fr;
}
.runtime-overview__column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.runtime-overview__column--signal { min-width: 380px; }
.runtime-overview__queue-wrapper { position: relative; }

.runtime-overview__stale-hint {
  margin-top: 6px; padding: 6px 12px; border-radius: 6px;
  background: var(--runtime-surface-accent, rgb(234, 179, 8, 0.08));
  color: var(--runtime-tier-watch, #eab308);
  font-size: 11px; font-weight: 600;
}

.runtime-overview__health-collapse {
  border: 1px solid var(--runtime-border, rgb(245, 158, 11, 0.12));
  border-radius: 14px; background: var(--runtime-surface, rgb(30, 41, 59, 0.8));
}
.runtime-overview__health-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px; border-bottom: none; background: transparent;
  color: var(--runtime-text-primary, #f8fafc); font-size: 14px;
  font-weight: 700; height: 44px; line-height: 44px;
}
.runtime-overview__health-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
  background: transparent;
}
.runtime-overview__health-collapse :deep(.el-collapse-item__content) { padding: 0 16px 16px; }

.runtime-overview__health-title {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
}

.runtime-overview__health-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (width <= 1439px) and (width >= 1280px) {
  .runtime-overview__dashboard { grid-template-columns: 1fr; }
  .runtime-overview__column--signal { min-width: 0; }
  .runtime-overview__health-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (width <= 1279px) {
  .runtime-page__header { flex-direction: column; }
  .runtime-page__status-bar { justify-content: flex-start; }
  .runtime-overview__dashboard { grid-template-columns: 1fr; }
  .runtime-overview__column--signal { min-width: 0; }
  .runtime-overview__health-grid { grid-template-columns: 1fr; }
}
</style>
