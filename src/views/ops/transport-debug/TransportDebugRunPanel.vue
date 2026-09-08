<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import TransportDebugRunObserver from './TransportDebugRunObserver.vue'
import TransportDebugRunForm from './TransportDebugRunForm.vue'
import AppButton from '@/components/ui/AppButton.vue'
import {
  buildTransportDebugRunInput,
  useTransportDebugRunConfig
} from './useTransportDebugRunConfig'
import { useTransportDebugRun } from './useTransportDebugRun'
import { useTransportDebugRunStream } from './useTransportDebugRunStream'
import { nextRoundInput, useTransportDebugSequence } from './useTransportDebugSequence'

const props = defineProps<{
  canStart: boolean
  canAbort: boolean
  canStream: boolean
  canRead: boolean
  canReadTask: boolean
}>()
const emit = defineEmits<{ selectTask: [transportTaskId: string] }>()

const isOpen = ref(false)
const uiError = ref('')
const resultWarning = ref('')
const abortReason = ref('')
const totalRounds = ref<number | undefined>(1)
const roundError = computed(() =>
  !Number.isInteger(totalRounds.value) ||
  !totalRounds.value ||
  totalRounds.value < 1 ||
  totalRounds.value > 1000
    ? '联调轮数必须为 1～1000 的整数'
    : null
)
let lifecycleGeneration = 0
const config = useTransportDebugRunConfig()
const run = useTransportDebugRun()
const sequence = useTransportDebugSequence({
  currentRun: run.currentRun,
  startRun: run.startRun,
  canStart: () => props.canStart
})
const appliedResults = new Set<string>()
watch(
  () => run.currentRun.value,
  current => {
    if (current?.status !== 'COMPLETED') {
      resultWarning.value = ''
      return
    }
    if (appliedResults.has(current.run_id)) return
    try {
      appliedResults.add(current.run_id)
      const input = nextRoundInput(current)
      config.rackId.value = input.rack_id
      config.worklineCode.value = input.workline_code
      config.groups.value = input.face_groups
      resultWarning.value = ''
    } catch (error) {
      resultWarning.value = `${errorMessage(error)}；请按现场实际情况重新填写初始化数据`
    }
  }
)
const activeRunId = computed(() => run.activeRun.value?.run_id ?? null)
const snapshot = computed(() => run.activeRun.value ?? run.currentRun.value)
const observing = computed(() =>
  Boolean(
    snapshot.value &&
    (snapshot.value.status === 'RUNNING' || snapshot.value.status === 'NEEDS_ATTENTION')
  )
)
const stream = useTransportDebugRunStream({
  visible: isOpen,
  activeRunId,
  refreshRun: refreshObservedRun,
  loadRecentRuns: run.loadRecentRuns
})

async function load(): Promise<void> {
  const generation = ++lifecycleGeneration
  isOpen.value = true
  uiError.value = ''
  const runError = await run.loadRecentRuns().then(() => null, errorMessage)
  if (generation !== lifecycleGeneration || !isOpen.value) return
  if (runError) uiError.value = runError
  stream.connect(props.canStream)
}

function refreshObservedRun(runId: string): Promise<void> {
  return props.canRead ? run.refreshRun(runId) : run.loadRecentRuns()
}

async function start(): Promise<void> {
  if (
    !props.canStart ||
    observing.value ||
    run.loading.value ||
    uiError.value ||
    config.validationError.value ||
    roundError.value
  )
    return
  uiError.value = ''
  try {
    await sequence.start(
      buildTransportDebugRunInput(
        config.rackId.value,
        config.groups.value,
        config.worklineCode.value
      ),
      totalRounds.value!
    )
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function abort(): Promise<void> {
  const current = snapshot.value
  if (!props.canAbort || !current?.can_abort) return
  uiError.value = ''
  try {
    sequence.stop()
    await run.abortRun(current.run_id, abortReason.value)
    abortReason.value = ''
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

onUnmounted(() => {
  lifecycleGeneration += 1
  stream.disconnect()
})

onMounted(load)
</script>

<template>
  <section class="debug-run-panel">
    <el-alert
      title="启动会创建真实 WMS/RCS 任务。请核对工作线、货架和料箱当前槽位；回架槽位由 WMS 分配，下一轮使用确认后的实际槽位。"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="uiError || sequence.error.value || run.lastError.value || stream.lastError.value"
      :title="
        uiError ||
        sequence.error.value ||
        run.lastError.value?.message ||
        stream.lastError.value?.message
      "
      type="error"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="resultWarning"
      :title="resultWarning"
      type="warning"
      :closable="false"
    />
    <el-alert
      v-if="stream.hasGap.value"
      title="实时通知曾中断，页面已回读持久轮次；断线期间每 15 秒兜底查询。"
      type="warning"
      :closable="false"
    />

    <section
      v-if="snapshot"
      class="run-observer"
    >
      <TransportDebugRunObserver
        :snapshot="snapshot"
        :can-read-task="props.canReadTask"
        @select-task="emit('selectTask', $event)"
      />
      <section
        v-if="props.canAbort && snapshot.can_abort"
        class="abort-panel"
      >
        <el-alert
          title="终止只关闭本地轮次，不会取消远端任务或自动返库。仅在现场确认全部机构静止后使用。"
          type="error"
          :closable="false"
        />
        <el-input
          v-model="abortReason"
          placeholder="现场核验说明（必填）"
        />
        <AppButton
          type="danger"
          :loading="run.aborting.value"
          :disabled="!abortReason.trim()"
          @click="abort"
        >
          确认物理状态并终止
        </AppButton>
      </section>
    </section>

    <el-alert
      v-if="snapshot && !observing"
      :title="`上一轮 ${snapshot.run_id}：${snapshot.status}`"
      type="info"
      :closable="false"
    />
    <TransportDebugRunForm
      v-if="!observing && !sequence.running.value"
      v-model:total-rounds="totalRounds"
      :config="config"
      :round-error="roundError"
      @update:workline-code="config.worklineCode.value = $event"
      @update:rack-id="config.rackId.value = $event"
    />

    <footer>
      <p
        v-if="sequence.planned.value"
        data-test="sequence-progress"
      >
        本次计划 {{ sequence.planned.value }} 轮 · 已启动 {{ sequence.started.value }} 轮 · 已完成
        {{ sequence.completed.value }} 轮
      </p>
      <AppButton
        v-if="sequence.running.value"
        @click="sequence.stop"
      >
        完成当前轮后停止
      </AppButton>
      <p>
        每轮创建独立任务，CTU03
        返库成功后接续下一轮。关闭、离开或刷新页面后，仅继续执行当前轮，不再创建后续轮次。
      </p>
      <AppButton
        :loading="run.loading.value"
        @click="load"
      >
        刷新联调记录
      </AppButton>
      <div class="dialog-actions">
        <span>{{ props.canStream ? stream.connectionState.value : '无自动联调 SSE 权限' }}</span>
        <AppButton
          v-if="!observing && !sequence.running.value && props.canStart"
          type="danger"
          :loading="run.starting.value"
          :disabled="
            run.loading.value || Boolean(uiError || config.validationError.value || roundError)
          "
          @click="start"
        >
          启动自动联调
        </AppButton>
      </div>
    </footer>
  </section>
</template>

<style scoped src="./TransportDebugRunPanel.css"></style>
