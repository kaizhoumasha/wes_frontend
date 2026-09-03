<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import {
  buildTransportDebugRunInput,
  useTransportDebugRunConfig
} from './useTransportDebugRunConfig'
import { useTransportDebugRun } from './useTransportDebugRun'
import { useTransportDebugRunStream } from './useTransportDebugRunStream'

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
const abortReason = ref('')
const FACE_PLACEHOLDER = '原样输入，例如 "90"、"270"'
let launcher: HTMLElement | null = null
let lifecycleGeneration = 0
const config = useTransportDebugRunConfig()
const run = useTransportDebugRun()
const activeRunId = computed(() => run.activeRun.value?.run_id ?? null)
const snapshot = computed(() => run.activeRun.value ?? run.currentRun.value)
const observing = computed(() =>
  Boolean(
    snapshot.value &&
    (snapshot.value.status === 'RUNNING' || snapshot.value.status === 'NEEDS_ATTENTION')
  )
)
const currentGroup = computed(
  () => snapshot.value?.face_groups[snapshot.value.current_group_index] ?? null
)
const pendingBins = computed(() => {
  const observed = new Set(snapshot.value?.observed_bin_ids ?? [])
  return currentGroup.value?.bins.map(bin => bin.bin_id).filter(binId => !observed.has(binId)) ?? []
})
const stream = useTransportDebugRunStream({
  visible: isOpen,
  activeRunId,
  refreshRun: refreshObservedRun,
  loadRecentRuns: run.loadRecentRuns
})

async function open(launcherElement?: HTMLElement): Promise<void> {
  const generation = ++lifecycleGeneration
  launcher = launcherElement ?? null
  isOpen.value = true
  uiError.value = ''
  const runError = await run.loadRecentRuns().then(() => null, errorMessage)
  if (generation !== lifecycleGeneration || !isOpen.value) return
  if (runError) uiError.value = runError
  stream.connect(props.canStream)
}

function close(): void {
  if (run.starting.value || run.aborting.value) return
  lifecycleGeneration += 1
  isOpen.value = false
  stream.disconnect()
  const focusTarget = launcher
  launcher = null
  void nextTick(() => focusTarget?.focus())
}

function refreshObservedRun(runId: string): Promise<void> {
  return props.canRead ? run.refreshRun(runId) : run.loadRecentRuns()
}

async function start(): Promise<void> {
  if (!props.canStart || config.validationError.value) return
  uiError.value = ''
  try {
    await run.startRun(buildTransportDebugRunInput(config.rackId.value, config.groups.value))
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function abort(): Promise<void> {
  const current = snapshot.value
  if (!props.canAbort || !current?.can_abort) return
  uiError.value = ''
  try {
    await run.abortRun(current.run_id, abortReason.value)
    abortReason.value = ''
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function addGroup(): void {
  config.addGroup()
}

function addBin(groupIndex: number): void {
  config.addBin(groupIndex)
}

function removeBin(groupIndex: number, binIndex: number): void {
  config.removeBin(groupIndex, binIndex)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

onUnmounted(() => {
  lifecycleGeneration += 1
  stream.disconnect()
})

defineExpose({ open, close })
</script>

<template>
  <StandardDialog
    :model-value="isOpen"
    title="Transport 自动联调"
    title-icon="warning"
    size="xl"
    :closable="!run.starting.value && !run.aborting.value"
    :close-on-click-modal="false"
    @update:model-value="value => !value && close()"
  >
    <el-alert
      title="启动会创建真实 WMS/RCS Transport 任务。货架、料箱和原槽位按现场实际录入；面值按输入原样下发。系统只根据持久回调与 SCAN12 Evidence 自动推进。"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="uiError || run.lastError.value || stream.lastError.value"
      :title="uiError || run.lastError.value?.message || stream.lastError.value?.message"
      type="error"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="stream.hasGap.value"
      title="实时通知曾中断，页面已回读持久轮次；断线期间每 15 秒兜底查询。"
      type="warning"
      :closable="false"
    />

    <section
      v-if="observing && snapshot"
      class="run-observer"
      data-test="run-observer"
    >
      <div class="run-summary">
        <div>
          <span>轮次</span>
          <strong>{{ snapshot.run_id }}</strong>
        </div>
        <div>
          <span>货架</span>
          <strong>{{ snapshot.rack_id }}</strong>
        </div>
        <div>
          <span>进度</span>
          <strong>
            第 {{ snapshot.current_group_index + 1 }} 面 / {{ snapshot.current_phase }}
          </strong>
        </div>
        <div>
          <span>状态</span>
          <strong>{{ snapshot.status }}</strong>
        </div>
      </div>

      <el-alert
        v-if="snapshot.status === 'NEEDS_ATTENTION'"
        :title="`${snapshot.attention_code || 'NEEDS_ATTENTION'}：${snapshot.attention_detail || '请核对 Transport 与设备 Evidence'}`"
        type="error"
        :closable="false"
        show-icon
      />

      <section class="progress-panel">
        <h3>冻结配置与当前 Evidence</h3>
        <p>
          当前面：
          <code>{{ currentGroup?.face }}</code>
        </p>
        <p>已扫描：{{ snapshot.observed_bin_ids.join(' / ') || '无' }}</p>
        <p>待扫描：{{ pendingBins.join(' / ') || '无' }}</p>
        <AppButton
          v-if="props.canReadTask && snapshot.current_step?.transport_task_id"
          @click="emit('selectTask', snapshot.current_step.transport_task_id)"
        >
          查看任务 {{ snapshot.current_step.transport_task_id }}
        </AppButton>
        <p class="evidence-hint">
          设备诊断请筛选
          <code>device_code=SCAN12</code>
          ，扫码值应携带料箱编码。
        </p>
      </section>

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

    <section
      v-else
      class="run-config"
      data-test="run-config"
    >
      <el-alert
        v-if="snapshot && !observing"
        :title="`上一轮 ${snapshot.run_id}：${snapshot.status}`"
        type="info"
        :closable="false"
      />
      <section
        v-if="snapshot?.status === 'FAILED'"
        class="terminal-failure"
        data-test="terminal-failure"
      >
        <el-alert
          :title="`${snapshot.attention_code || snapshot.current_step?.reason_code || 'FAILED'}：${snapshot.attention_detail || '请核对失败阶段与关联 Transport 任务'}`"
          type="error"
          :closable="false"
          show-icon
        />
        <p>失败阶段：{{ snapshot.current_phase }}</p>
        <AppButton
          v-if="props.canReadTask && snapshot.current_step?.transport_task_id"
          @click="emit('selectTask', snapshot.current_step.transport_task_id)"
        >
          查看任务 {{ snapshot.current_step.transport_task_id }}
        </AppButton>
      </section>
      <div class="config-toolbar">
        <el-input
          v-model="config.rackId.value"
          placeholder="按现场实际输入货架编码，例如 510056"
          aria-label="自动联调货架编码"
        />
        <AppButton @click="addGroup">新增货架面</AppButton>
      </div>

      <article
        v-for="(group, groupIndex) in config.groups.value"
        :key="groupIndex"
        class="face-group"
      >
        <header>
          <strong>面组 {{ groupIndex + 1 }}</strong>
          <AppButton @click="config.removeGroup(groupIndex)">删除</AppButton>
        </header>
        <el-input
          v-model="group.face"
          :placeholder="FACE_PLACEHOLDER"
          aria-label="货架面原始值"
        />
        <div
          v-for="(bin, binIndex) in group.bins"
          :key="binIndex"
          class="bin-row"
        >
          <el-input
            v-model="bin.bin_id"
            placeholder="料箱编码，例如 A000001922"
            aria-label="料箱编码"
          />
          <el-input
            v-model="bin.slot_id"
            placeholder="原货架槽位，例如 510056A3F2C101"
            aria-label="原货架槽位"
          />
          <AppButton
            :disabled="group.bins.length <= 1"
            @click="removeBin(groupIndex, binIndex)"
          >
            删除料箱
          </AppButton>
        </div>
        <AppButton
          :disabled="group.bins.length >= 4"
          @click="addBin(groupIndex)"
        >
          新增料箱
        </AppButton>
      </article>

      <p
        v-if="config.validationError.value"
        class="validation-error"
      >
        {{ config.validationError.value }}
      </p>
      <section
        v-if="config.preview.value"
        class="preview-panel"
      >
        <h3>下发顺序预览</h3>
        <pre>{{ config.preview.value }}</pre>
      </section>
    </section>

    <template #footer>
      <div class="dialog-actions">
        <span>{{ props.canStream ? stream.connectionState.value : '无自动联调 SSE 权限' }}</span>
        <AppButton
          :disabled="run.starting.value || run.aborting.value"
          @click="close"
        >
          关闭
        </AppButton>
        <AppButton
          v-if="!observing && props.canStart"
          type="danger"
          :loading="run.starting.value"
          :disabled="Boolean(config.validationError.value)"
          @click="start"
        >
          启动自动联调
        </AppButton>
      </div>
    </template>
  </StandardDialog>
</template>

<style scoped>
.run-config,
.run-observer,
.progress-panel,
.abort-panel {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.config-toolbar,
.face-group header,
.dialog-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.config-toolbar :deep(.el-input) {
  width: 100%;
}

.bin-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.face-group,
.progress-panel,
.abort-panel {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.face-group {
  display: grid;
  gap: 12px;
}

.run-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.run-summary div {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.run-summary span,
.run-summary strong {
  display: block;
}

.run-summary span,
.evidence-hint,
.dialog-actions span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.run-summary strong,
code,
pre {
  font-family: 'JetBrains Mono', monospace;
}

.preview-panel pre {
  max-height: 320px;
  overflow: auto;
  padding: 14px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-darker);
  border-radius: 8px;
  white-space: pre-wrap;
}

.validation-error {
  color: var(--el-color-danger);
}

@media (width < 900px) {
  .run-summary {
    grid-template-columns: 1fr 1fr;
  }
  .config-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
