<template>
  <div v-loading="loading" class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">运行监控中心</h1>
        <p class="runtime-page__subtitle">先判断系统有没有问题，再决定先处理哪一条链路、哪一条工作线、哪一台设备。</p>
      </div>
      <div class="runtime-page__status-bar">
        <RuntimeStatusBadge :label="connectionLabel" :tone="connectionTone" :pulse="live && state === 'connected'" />
        <el-switch :model-value="live" inline-prompt active-text="Live" inactive-text="Frozen" @change="value => toggleLive(Boolean(value))" />
        <RuntimeLastUpdated :value="lastRefreshedAt" :frozen="!live" />
        <el-button type="primary" @click="refresh">刷新</el-button>
      </div>
    </div>

    <RuntimeSignalStrip :cards="signalCards" />

    <RuntimeFrozenNotice v-if="!live" />

    <div class="runtime-overview__priority-grid">
      <el-card shadow="never" class="runtime-panel">
        <template #header>
          <div class="runtime-panel__header">
            <div>
              <div class="runtime-panel__title">最危险 Trace</div>
              <div class="runtime-panel__subtitle">优先处理失败、超时、长时间卡住的链路</div>
            </div>
          </div>
        </template>

        <div v-if="topTraces.length" class="runtime-risk-list">
          <button v-for="item in topTraces" :key="item.session_id" type="button" class="runtime-risk-item" @click="openTrace(item.session_id)">
            <div class="runtime-risk-item__top">
              <RuntimeStatusBadge :status="item.status" size="small" />
              <span class="runtime-risk-item__time">{{ formatRuntimeDateTime(item.last_ingress_at || item.started_at) }}</span>
            </div>
            <div class="runtime-risk-item__title">{{ item.session_code }}</div>
            <div class="runtime-risk-item__meta">{{ item.workline_name || '未关联工作线' }} · {{ item.device_name || '未关联设备' }}</div>
            <div class="runtime-risk-item__hint">卡点 {{ item.step_code || '—' }} · {{ item.latest_timeline_message || item.failure_domain || item.current_wait_type || '等待进一步证据' }}</div>
            <div class="runtime-risk-item__footer">
              <span>滞留 {{ formatRuntimeElapsed(item.last_ingress_at || item.started_at) }}</span>
              <span>进入 Trace →</span>
            </div>
          </button>
        </div>
        <RuntimeEmptyState
          v-else
          title="近 24 小时暂无高风险 Trace"
          description="当前没有失败、超时或明显长时间卡住的链路需要优先处理。"
        />
      </el-card>

      <el-card shadow="never" class="runtime-panel">
        <template #header>
          <div class="runtime-panel__header">
            <div>
              <div class="runtime-panel__title">最危险工作线</div>
              <div class="runtime-panel__subtitle">判断是局部故障，还是线体级阻塞</div>
            </div>
          </div>
        </template>

        <div v-if="topWorklines.length" class="runtime-risk-list runtime-risk-list--compact">
          <button v-for="item in topWorklines" :key="item.id" type="button" class="runtime-risk-item" @click="openWorkline(item.id)">
            <div class="runtime-risk-item__top">
              <RuntimeStatusBadge :label="worklineRiskLabel(item)" :tone="worklineRiskTone(item)" size="small" />
              <span class="runtime-risk-item__time">{{ formatRuntimeDateTime(item.last_activity_at) }}</span>
            </div>
            <div class="runtime-risk-item__title">{{ item.line_name }}</div>
            <div class="runtime-risk-item__meta">{{ item.line_code }} · {{ item.zone_name || '未配置区域' }}</div>
            <div class="runtime-risk-item__hint">失败 {{ item.failed_session_count }} · 等待 {{ item.waiting_session_count }} · 离线 {{ item.offline_device_count }}</div>
          </button>
        </div>
        <RuntimeEmptyState
          v-else
          title="暂无风险工作线"
          description="当前没有出现等待堆积、失败链路或异常设备集中的工作线。"
        />
      </el-card>

      <el-card shadow="never" class="runtime-panel">
        <template #header>
          <div class="runtime-panel__header">
            <div>
              <div class="runtime-panel__title">最危险设备</div>
              <div class="runtime-panel__subtitle">判断当前瓶颈是否收敛到单台设备</div>
            </div>
          </div>
        </template>

        <div v-if="topDevices.length" class="runtime-risk-list runtime-risk-list--compact">
          <button v-for="item in topDevices" :key="item.id" type="button" class="runtime-risk-item" @click="openDevice(item.id)">
            <div class="runtime-risk-item__top">
              <RuntimeStatusBadge :status="item.device_status" size="small" />
              <span class="runtime-risk-item__time">{{ formatRuntimeDateTime(item.recent_callback_at || item.last_heartbeat_at) }}</span>
            </div>
            <div class="runtime-risk-item__title">{{ item.device_name }}</div>
            <div class="runtime-risk-item__meta">{{ item.device_code }} · {{ item.workline_name || '未关联工作线' }}</div>
            <div class="runtime-risk-item__hint">未结命令 {{ item.pending_command_count }} · 维护 {{ item.maintenance_mode ? 'ON' : 'OFF' }} · 错误码 {{ item.error_code || '—' }}</div>
          </button>
        </div>
        <RuntimeEmptyState
          v-else
          title="暂无风险设备"
          description="当前没有明显的异常设备或高负载瓶颈设备。"
        />
      </el-card>
    </div>

    <div class="runtime-overview__health-grid">
      <RuntimeHealthBreakdown title="工作线结构健康" subtitle="判断故障是否集中在某几条线体" :total="worklines.length" :items="worklineHealthItems" />
      <RuntimeHealthBreakdown title="设备健康分布" subtitle="识别异常、维护与高负载设备占比" :total="devices.length" :items="deviceHealthItems" />
      <RuntimeHealthBreakdown title="Session 结构信号" subtitle="把运行 / 等待 / 失败 / 积压放在同一视图里" :total="sessionStructureTotal" :items="sessionStructureItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeHealthBreakdown from '@/components/common/runtime/RuntimeHealthBreakdown.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeSignalStrip from '@/components/common/runtime/RuntimeSignalStrip.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { RuntimeDeviceSummary, RuntimeOverviewResponse, RuntimeWorklineSummary } from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'
import { formatRuntimeDateTime, formatRuntimeElapsed, getDeviceRiskScore, getTraceRiskScore, getWorklineRiskLabel as worklineRiskLabel, getWorklineRiskScore, getWorklineRiskTone as worklineRiskTone } from '@/utils/runtime-display'

const router = useRouter()
const { connectionLabel, connectionTone, lastEvent, lastRefreshedAt, live, markRefreshedAt, state, toggleLive } = useRuntimePageChrome()

const loading = ref(false)
const overview = ref<RuntimeOverviewResponse>({
  stats: [],
  recent_failed_traces: [],
  hot_worklines: [],
  abnormal_devices: []
})
const worklines = ref<RuntimeWorklineSummary[]>([])
const devices = ref<RuntimeDeviceSummary[]>([])

const statMeta: Record<string, { icon: string; hint: string; status?: RuntimeTone }> = {
  running_sessions: { icon: 'ep:refresh-right', hint: '当前仍在运行的作业链路', status: 'primary' },
  waiting_sessions: { icon: 'ep:timer', hint: '等待设备/外部结果的链路数量', status: 'warning' },
  failed_sessions: { icon: 'ep:warning-filled', hint: '近 24 小时失败或超时的关键链路', status: 'danger' },
  inbox_backlog: { icon: 'ep:download', hint: '尚未完全消费的入口消息', status: 'warning' },
  outbox_backlog: { icon: 'ep:upload', hint: '尚未完成派发的指令/消息', status: 'warning' },
  abnormal_devices: { icon: 'ep:cpu', hint: '状态处于 ERROR / OFFLINE 的设备', status: 'danger' }
}

const signalCards = computed(() => {
  return overview.value.stats.map(card => ({
    key: card.key,
    label: card.label,
    value: card.value,
    status: statMeta[card.key]?.status ?? (card.status as RuntimeTone),
    icon: statMeta[card.key]?.icon ?? 'ep:data-analysis',
    hint: statMeta[card.key]?.hint ?? '运行信号指标'
  }))
})

const topTraces = computed(() => {
  return [...overview.value.recent_failed_traces]
    .sort((left, right) => getTraceRiskScore(right) - getTraceRiskScore(left))
    .slice(0, 5)
})

const topWorklines = computed(() => {
  return [...worklines.value]
    .sort((left, right) => getWorklineRiskScore(right) - getWorklineRiskScore(left))
    .slice(0, 5)
})

const topDevices = computed(() => {
  return [...devices.value]
    .sort((left, right) => getDeviceRiskScore(right) - getDeviceRiskScore(left))
    .slice(0, 5)
})

const worklineHealthItems = computed(() => {
  const total = worklines.value.length || 1
  const blocked = worklines.value.filter(item => item.failed_session_count > 0 || item.offline_device_count > 0 || item.error_device_count > 0).length
  const waiting = worklines.value.filter(item => item.waiting_session_count > 0 && item.failed_session_count === 0).length
  const stable = worklines.value.filter(item => item.failed_session_count === 0 && item.offline_device_count === 0 && item.error_device_count === 0 && item.waiting_session_count === 0).length
  const active = worklines.value.filter(item => item.active_session_count > 0).length

  return [
    { label: '阻塞 / 告警', value: blocked, ratio: ratio(blocked, total), tone: 'danger' as RuntimeTone, hint: '存在失败 Session 或异常设备' },
    { label: '等待堆积', value: waiting, ratio: ratio(waiting, total), tone: 'warning' as RuntimeTone, hint: '等待态 Session 已开始堆积' },
    { label: '稳定运行', value: stable, ratio: ratio(stable, total), tone: 'success' as RuntimeTone, hint: '无失败 / 离线 / 等待堆积' },
    { label: '有作业活动', value: active, ratio: ratio(active, total), tone: 'primary' as RuntimeTone, hint: '当前仍在承载运行链路' }
  ]
})

const deviceHealthItems = computed(() => {
  const total = devices.value.length || 1
  const abnormal = devices.value.filter(item => ['ERROR', 'OFFLINE'].includes(item.device_status)).length
  const maintenance = devices.value.filter(item => item.maintenance_mode).length
  const loaded = devices.value.filter(item => item.pending_command_count > 0 && !['ERROR', 'OFFLINE'].includes(item.device_status)).length
  const healthy = devices.value.filter(item => !['ERROR', 'OFFLINE'].includes(item.device_status) && !item.maintenance_mode).length

  return [
    { label: '异常设备', value: abnormal, ratio: ratio(abnormal, total), tone: 'danger' as RuntimeTone, hint: '状态为 ERROR / OFFLINE' },
    { label: '维护模式', value: maintenance, ratio: ratio(maintenance, total), tone: 'warning' as RuntimeTone, hint: '人工维护中的设备' },
    { label: '高负载设备', value: loaded, ratio: ratio(loaded, total), tone: 'primary' as RuntimeTone, hint: '存在未结命令' },
    { label: '健康可用', value: healthy, ratio: ratio(healthy, total), tone: 'success' as RuntimeTone, hint: '适合继续承担链路执行' }
  ]
})

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

const sessionStructureTotal = computed(() => {
  return statValue('running_sessions') + statValue('waiting_sessions') + statValue('failed_sessions') + statValue('inbox_backlog') + statValue('outbox_backlog')
})

function statValue(key: string) {
  return overview.value.stats.find(item => item.key === key)?.value ?? 0
}

function ratio(value: number, total: number) {
  return total <= 0 ? 0 : Math.min(100, Math.round((value / total) * 100))
}

async function refresh() {
  loading.value = true
  try {
    const [overviewData, worklineData, deviceData] = await Promise.all([
      runtimeApiMethods.overview().send(),
      runtimeApiMethods.worklines().send(),
      runtimeApiMethods.devices().send()
    ])

    overview.value = overviewData
    worklines.value = worklineData
    devices.value = deviceData
    markRefreshedAt()
  } finally {
    loading.value = false
  }
}

function openTrace(sessionId: number) {
  router.push({ name: 'RuntimeTraceExplorer', query: { sessionId: String(sessionId) } })
}

function openWorkline(worklineId: number) {
  router.push({ name: 'RuntimeWorklines', query: { worklineId: String(worklineId) } })
}

function openDevice(deviceId: number) {
  router.push({ name: 'RuntimeDevices', query: { deviceId: String(deviceId) } })
}

onMounted(refresh)

watch(
  () => lastEvent.value,
  event => {
    if (!live.value || !event) return
    refresh()
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
  max-width: 840px;
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

.runtime-overview__priority-grid,
.runtime-overview__health-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.runtime-risk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-risk-item {
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

.runtime-risk-item:hover {
  transform: translateY(-2px);
  border-color: rgb(245, 158, 11, 0.28);
  background: rgb(30, 41, 59, 0.92);
}

.runtime-risk-item__top,
.runtime-risk-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.runtime-risk-item__time,
.runtime-risk-item__meta,
.runtime-risk-item__hint,
.runtime-risk-item__footer {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.runtime-risk-item__title {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.runtime-risk-item__meta {
  color: #cbd5e1;
}

.runtime-risk-item__footer {
  font-family: var(--font-mono);
}

@media (width <= 1279px) {
  .runtime-page__header {
    flex-direction: column;
  }

  .runtime-page__status-bar,
  .runtime-overview__priority-grid,
  .runtime-overview__health-grid {
    grid-template-columns: 1fr;
    justify-content: flex-start;
  }
}
</style>
