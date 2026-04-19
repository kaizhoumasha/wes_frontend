<template>
  <div v-loading="loading" class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">设备监控</h1>
        <p class="runtime-page__subtitle">先判断单机健康，再看最近命令、回调和关联 Trace，确认它是不是当前系统瓶颈。</p>
      </div>
      <div class="runtime-page__status-bar">
        <RuntimeStatusBadge :label="connectionLabel" :tone="connectionTone" :pulse="live && state === 'connected'" />
        <el-switch :model-value="live" inline-prompt active-text="Live" inactive-text="Frozen" @change="value => toggleLive(Boolean(value))" />
        <RuntimeLastUpdated :value="lastRefreshedAt" :frozen="!live" />
        <el-button type="primary" @click="loadDevices">刷新</el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="runtime-layout">
      <el-card shadow="never" class="runtime-panel runtime-layout__list">
        <template #header>
          <div class="runtime-panel__header">
            <div>
              <div class="runtime-panel__title">设备目录</div>
              <div class="runtime-panel__subtitle">按风险与负载排序，快速找到当前瓶颈设备</div>
            </div>
          </div>
        </template>

        <div v-if="devices.length" class="runtime-directory-list">
          <button
            v-for="item in orderedDevices"
            :key="item.id"
            type="button"
            class="runtime-directory-card"
            :class="{ 'is-active': item.id === selectedDeviceId }"
            @click="selectDevice(item)"
          >
            <div class="runtime-directory-card__top">
              <RuntimeStatusBadge :status="item.device_status" size="small" />
              <span class="runtime-directory-card__time">{{ deviceActivityLabel(item) }}</span>
            </div>
            <div class="runtime-directory-card__title">{{ item.device_name }}</div>
            <div class="runtime-directory-card__meta">{{ item.device_code }} · {{ item.workline_name || '未关联工作线' }}</div>
            <div class="runtime-directory-card__hint">未结命令 {{ item.pending_command_count }} · 维护 {{ item.maintenance_mode ? 'ON' : 'OFF' }} · 错误码 {{ item.error_code || '—' }}</div>
          </button>
        </div>
        <RuntimeEmptyState
          v-else
          title="暂无设备数据"
          description="当前还没有可用于设备监控的运行样本。"
          hint="请确认设备主数据、权限与 runtime API 返回是否正常。"
        />
      </el-card>

      <div class="runtime-layout__detail">
        <template v-if="detail">
          <DeviceHealthHero :summary="detail.summary" />

          <el-card shadow="never" class="runtime-panel">
            <template #header>
              <div class="runtime-panel__header">
                <div>
                  <div class="runtime-panel__title">最近行为时间线</div>
                  <div class="runtime-panel__subtitle">把命令发送、回调进入和结果信号放在同一条设备叙事线上。</div>
                </div>
              </div>
            </template>

            <div v-if="activityFeed.length" class="device-activity-list">
              <article v-for="item in activityFeed" :key="item.key" class="device-activity-item" :class="`device-activity-item--${item.tone}`">
                <div class="device-activity-item__top">
                  <div>
                    <div class="device-activity-item__time">{{ item.timeLabel }}</div>
                    <div class="device-activity-item__title-row">
                      <h3 class="device-activity-item__title">{{ item.title }}</h3>
                      <RuntimeStatusBadge :label="item.statusLabel" :tone="item.tone" size="small" />
                    </div>
                  </div>
                  <el-button v-if="item.traceAction" plain size="small" @click="item.traceAction">查看 Trace</el-button>
                </div>
                <div class="device-activity-item__meta">{{ item.meta }}</div>
                <p class="device-activity-item__summary">{{ item.summary }}</p>
              </article>
            </div>
            <RuntimeEmptyState
              v-else
              title="暂无最近行为记录"
              description="近期没有命令或回调样本，可先从设备目录切换到其他活跃设备。"
            />
          </el-card>

          <div class="device-grid device-grid--two">
            <el-card shadow="never" class="runtime-panel">
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">关联 Trace</div>
                    <div class="runtime-panel__subtitle">确认这个设备是否正在阻塞活跃链路</div>
                  </div>
                </div>
              </template>

              <div v-if="detail.active_sessions.length" class="trace-list">
                <button v-for="item in detail.active_sessions" :key="item.session_id" type="button" class="trace-list__item" @click="openSessionTrace(item.session_id)">
                  <div class="trace-list__head">
                    <RuntimeStatusBadge :status="item.status" size="small" />
                    <span>{{ formatRuntimeElapsed(item.started_at) }}</span>
                  </div>
                  <div class="trace-list__title">{{ item.session_code }}</div>
                  <div class="trace-list__meta">{{ item.step_code || '—' }} · {{ item.workline_name || '未关联工作线' }}</div>
                  <div class="trace-list__hint">{{ item.latest_timeline_message || item.current_wait_type || '进入 Trace 查看更多证据' }}</div>
                </button>
              </div>
              <RuntimeEmptyState
                v-else
                title="当前没有活跃 Trace 关联到该设备"
                description="这台设备目前没有正在阻塞的活跃链路。"
              />
            </el-card>

            <el-card shadow="never" class="runtime-panel">
              <template #header>
                <div class="runtime-panel__header">
                  <div>
                    <div class="runtime-panel__title">异常模式</div>
                    <div class="runtime-panel__subtitle">从最近命令与回调中提炼重复问题，而不是逐条翻表</div>
                  </div>
                </div>
              </template>

              <div v-if="failurePatterns.length" class="hotspot-grid hotspot-grid--single">
                <div v-for="pattern in failurePatterns" :key="pattern.title" class="hotspot-card">
                  <span>{{ pattern.title }}</span>
                  <strong>{{ pattern.value }}</strong>
                  <p>{{ pattern.hint }}</p>
                </div>
              </div>
              <RuntimeEmptyState
                v-else
                title="暂未识别到明显异常模式"
                description="最近命令与回调样本较平稳，没有形成可重复的异常模式。"
              />
            </el-card>
          </div>
        </template>

        <el-card v-else shadow="never" class="runtime-panel runtime-layout__empty-state">
          <RuntimeEmptyState
            title="还没有选中设备"
            description="请从左侧设备目录选择一台设备，查看它的健康状态、最近行为和关联 Trace。"
            hint="目录按风险和负载排序；当前选中的设备也会固定置顶。"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeviceHealthHero from '@/components/common/runtime/DeviceHealthHero.vue'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { RuntimeDeviceDetailResponse, RuntimeDeviceSummary, TraceCallbackLogItem, TraceCommandItem } from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'
import { compactEnumLabel, formatRuntimeDateTime, formatRuntimeDurationMs, formatRuntimeElapsed, getDeviceRiskScore, pickDominantValue, sortByRiskWithSelection } from '@/utils/runtime-display'

const route = useRoute()
const router = useRouter()
const { connectionLabel, connectionTone, lastEvent, lastRefreshedAt, live, markRefreshedAt, state, toggleLive } = useRuntimePageChrome()

const loading = ref(false)
const devices = ref<RuntimeDeviceSummary[]>([])
const detail = ref<RuntimeDeviceDetailResponse | null>(null)

const selectedDeviceId = computed(() => detail.value?.summary.id ?? (Number(route.query.deviceId || 0) || null))

const orderedDevices = computed(() => {
  return sortByRiskWithSelection(devices.value, selectedDeviceId.value, getDeviceRiskScore)
})

const activityFeed = computed(() => {
  if (!detail.value) return []

  const commandItems = detail.value.recent_commands.map(command => buildCommandActivity(command))
  const callbackItems = detail.value.recent_callbacks.map(callback => buildCallbackActivity(callback))

  return [...commandItems, ...callbackItems]
    .sort((left, right) => right.sortTime - left.sortTime)
    .slice(0, 8)
})

const failurePatterns = computed(() => {
  if (!detail.value) return []

  const callbackFailures = detail.value.recent_callbacks.filter(item => item.failure_stage || item.response_status >= 400)
  const failedCommands = detail.value.recent_commands.filter(item => ['FAILED', 'CANCELLED', 'TIMEOUT'].includes(item.status))

  const frequentFailureStage = pickDominantValue(callbackFailures.map(item => item.failure_stage || item.ingress_outcome || `HTTP ${item.response_status}`))
  const frequentCommandStatus = pickDominantValue(failedCommands.map(item => item.status))
  const frequentTaskType = pickDominantValue(detail.value.recent_commands.map(item => item.task_type))

  return [
    { title: '回调失败热点', value: frequentFailureStage || '—', hint: callbackFailures.length ? `近样本中共有 ${callbackFailures.length} 次可疑回调失败` : '暂无明显回调失败热点' },
    { title: '命令失败状态', value: frequentCommandStatus || '—', hint: failedCommands.length ? `失败命令 ${failedCommands.length} 条，优先检查同状态模式` : '近期命令执行稳定' },
    { title: '高频任务类型', value: frequentTaskType || '—', hint: '帮助判断当前设备主要承载哪类任务' },
    { title: '活跃 Trace 数', value: String(detail.value.active_sessions.length), hint: '判断单机问题是否正在影响多条链路' }
  ]
})

function deviceActivityLabel(item: RuntimeDeviceSummary) {
  return item.recent_callback_at || item.last_heartbeat_at ? formatRuntimeDateTime(item.recent_callback_at || item.last_heartbeat_at) : '暂无活动'
}

function toneFromHttpStatus(code: number): RuntimeTone {
  if (code >= 400) return 'danger'
  if (code >= 300) return 'warning'
  return 'success'
}

function buildCommandActivity(command: TraceCommandItem) {
  const time = command.completed_at || command.ack_received_at || command.sent_at
  return {
    key: `command-${command.id}`,
    sortTime: toEpoch(time),
    timeLabel: formatRuntimeDateTime(time),
    title: compactEnumLabel(command.task_type),
    statusLabel: compactEnumLabel(command.status),
    tone: command.status === 'FAILED' || command.status === 'CANCELLED' ? 'danger' as RuntimeTone : command.status === 'PENDING' ? 'warning' as RuntimeTone : 'primary' as RuntimeTone,
    meta: `${command.command_code} · ${command.step_code || '未绑定 Step'}`,
    summary: `耗时 ${formatRuntimeDurationMs(command.duration_ms)} · Retry ${command.retry_count} · Result ${command.result || '—'}`,
    traceAction: command.command_code ? () => openCommandTrace(command.command_code) : null
  }
}

function buildCallbackActivity(callback: TraceCallbackLogItem) {
  return {
    key: `callback-${callback.id}`,
    sortTime: toEpoch(callback.updated_at || callback.created_at),
    timeLabel: formatRuntimeDateTime(callback.updated_at || callback.created_at),
    title: compactEnumLabel(callback.callback_type),
    statusLabel: callback.ingress_outcome || `HTTP ${callback.response_status}`,
    tone: toneFromHttpStatus(callback.response_status),
    meta: `${callback.request_id || '无 Request ID'} · ${callback.correlation_id || '无 Correlation'}`,
    summary: `${callback.failure_stage || '入口正常'} · ${formatRuntimeDurationMs(callback.response_time_ms)} · ${callback.error_message || '无错误详情'}`,
    traceAction: callback.request_id ? () => openRequestTrace(callback.request_id as string) : null
  }
}

function toEpoch(value?: string | null) {
  if (!value) return 0
  try {
    return new Date(value).getTime()
  } catch {
    return 0
  }
}

async function loadDetail(deviceId: number) {
  detail.value = await runtimeApiMethods.deviceDetail(deviceId).send()
  markRefreshedAt()
}

async function loadDevices() {
  loading.value = true
  try {
    devices.value = await runtimeApiMethods.devices().send()
    const deviceId = Number(route.query.deviceId || devices.value[0]?.id || 0)
    if (deviceId) {
      await selectDevice({ id: deviceId } as RuntimeDeviceSummary)
    }
    markRefreshedAt()
  } finally {
    loading.value = false
  }
}

async function selectDevice(row: { id: number }) {
  await loadDetail(row.id)
  router.replace({ query: { ...route.query, deviceId: String(row.id) } })
}

function openSessionTrace(sessionId: number) {
  router.push({ name: 'RuntimeTraceExplorer', query: { sessionId: String(sessionId), deviceId: String(detail.value?.summary.id || '') } })
}

function openCommandTrace(commandCode: string) {
  router.push({ name: 'RuntimeTraceExplorer', query: { commandCode, deviceId: String(detail.value?.summary.id || '') } })
}

function openRequestTrace(requestId: string) {
  router.push({ name: 'RuntimeTraceExplorer', query: { requestId, deviceId: String(detail.value?.summary.id || '') } })
}

onMounted(loadDevices)

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    if (detail.value?.summary.id) {
      await loadDetail(detail.value.summary.id)
    }
    devices.value = await runtimeApiMethods.devices().send()
    markRefreshedAt()
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
  max-width: 860px;
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

.runtime-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 340px minmax(0, 1fr);
}

.runtime-layout__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.runtime-directory-list,
.trace-list,
.device-activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.runtime-directory-card,
.trace-list__item,
.device-activity-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 14px;
  background: rgb(30, 41, 59, 0.78);
  text-align: left;
}

.runtime-directory-card,
.trace-list__item {
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

.runtime-directory-card__top,
.trace-list__head,
.device-activity-item__top {
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
.trace-list__hint,
.device-activity-item__time,
.device-activity-item__meta,
.device-activity-item__summary,
.hotspot-card p {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.runtime-directory-card__title,
.trace-list__title,
.device-activity-item__title {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
}

.runtime-directory-card__meta,
.trace-list__meta {
  color: #cbd5e1;
}

.device-activity-item__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.device-grid--two,
.hotspot-grid--single {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hotspot-grid--single {
  grid-template-columns: 1fr;
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

.runtime-layout__empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

@media (width <= 1279px) {
  .runtime-page__header,
  .runtime-layout,
  .device-grid--two {
    display: flex;
    flex-direction: column;
  }

  .runtime-page__status-bar {
    justify-content: flex-start;
  }
}
</style>
