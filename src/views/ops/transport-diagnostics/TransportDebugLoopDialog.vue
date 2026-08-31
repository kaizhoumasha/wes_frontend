<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import type { DebugTasksInput, DebugTasksResult, ResetResult } from '@/api/modules/transport'
import {
  type TransportDebugStepConfirmationInput,
  useTransportDebugLoop
} from './useTransportDebugLoop'

const props = defineProps<{
  createTask: (input: DebugTasksInput) => Promise<DebugTasksResult>
  confirmAndReset: (
    transportTaskId: string,
    confirmation: TransportDebugStepConfirmationInput
  ) => Promise<ResetResult>
}>()

const isOpen = ref(false)
let launcher: HTMLElement | null = null
const loop = useTransportDebugLoop({
  createTask: input => props.createTask(input),
  confirmAndReset: (taskId, confirmation) => props.confirmAndReset(taskId, confirmation)
})

const actionLabel = computed(() => {
  if (!loop.started.value) return '开始第一轮'
  if (loop.isComplete.value) return '开始下一轮'
  if (!loop.currentStep.value.createsTransportTask) return '确认料箱已到 CNV0302'
  if (!loop.activeTaskId.value) return '重试下发当前步骤'
  if (loop.currentStep.value.key === 'RACK_TO_STORAGE') return '确认回库并完成本轮'
  return '确认现场完成并进入下一步'
})

function open(launcherElement?: HTMLElement): void {
  launcher = launcherElement ?? null
  isOpen.value = true
}

function close(): void {
  if (loop.busy.value) return
  isOpen.value = false
  const focusTarget = launcher
  launcher = null
  void nextTick(() => focusTarget?.focus())
}

async function runAction(): Promise<void> {
  try {
    if (!loop.started.value || loop.isComplete.value) {
      await loop.start()
    } else {
      await loop.advance()
    }
  } catch {
    // composable 已保留错误与当前安全步骤，操作员可在同一步重试。
  }
}

defineExpose({ open, close })
</script>

<template>
  <StandardDialog
    :model-value="isOpen"
    title="510056 现场联调步进"
    title-icon="warning"
    size="xl"
    :closable="!loop.busy.value"
    :close-on-click-modal="false"
    @update:model-value="value => !value && close()"
  >
    <el-alert
      title="仅在亲眼确认当前物理动作已完成后推进。系统不会伪造 WMS 回调或业务货架投影，也不会自动重发不确定任务。"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="loop.lastError.value"
      :title="loop.lastError.value.message"
      type="error"
      :closable="false"
      show-icon
    />

    <section class="asset-summary">
      <div>
        <span>货架</span>
        <strong>510056</strong>
      </div>
      <div>
        <span>料箱</span>
        <strong>A000001922 / A000002653</strong>
      </div>
      <div>
        <span>路径</span>
        <strong>WH01 → KT16 → CNV0301 → CNV0302 → WH01</strong>
      </div>
    </section>

    <ol class="step-list">
      <li
        v-for="(step, index) in loop.steps"
        :key="step.key"
        :class="{
          active:
            loop.started.value && !loop.isComplete.value && index === loop.currentStepIndex.value,
          completed:
            loop.isComplete.value || (loop.started.value && index < loop.currentStepIndex.value)
        }"
      >
        <span class="step-index">{{ index + 1 }}</span>
        <div>
          <strong>{{ step.title }}</strong>
          <p>{{ step.instruction }}</p>
        </div>
      </li>
    </ol>

    <section
      v-if="loop.started.value"
      class="current-step"
    >
      <div>
        <span>当前步骤</span>
        <strong>{{ loop.currentStep.value.title }}</strong>
      </div>
      <div>
        <span>Transport Task</span>
        <strong>{{ loop.activeTaskId.value || '本步骤无 Transport 任务' }}</strong>
      </div>
      <p>{{ loop.currentStep.value.instruction }}</p>
      <p class="audit-note">
        Transport 步骤确认后会先写入 source=OPERATOR_DEBUG、business_authoritative=false
        的审计记录，再清理本地联调任务并进入下一步。
      </p>
    </section>

    <template #footer>
      <div class="dialog-actions">
        <span v-if="loop.completedRounds.value">已完成 {{ loop.completedRounds.value }} 轮</span>
        <AppButton
          :disabled="loop.busy.value"
          @click="close"
        >
          关闭
        </AppButton>
        <AppButton
          type="danger"
          :loading="loop.busy.value"
          @click="runAction"
        >
          {{ actionLabel }}
        </AppButton>
      </div>
    </template>
  </StandardDialog>
</template>

<style scoped>
.asset-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.asset-summary div,
.current-step {
  padding: 14px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.asset-summary span,
.current-step span {
  display: block;
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.asset-summary strong,
.current-step strong {
  font-family: 'JetBrains Mono', monospace;
}

.step-list {
  display: grid;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.step-list li {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.step-list li.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.step-list li.completed {
  border-color: var(--color-success);
}

.step-index {
  display: grid;
  flex: 0 0 28px;
  height: 28px;
  place-items: center;
  background: var(--el-fill-color);
  border-radius: 50%;
  font-family: 'JetBrains Mono', monospace;
}

.step-list p,
.current-step p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.current-step {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.current-step > p {
  grid-column: 1 / -1;
}

.audit-note {
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color);
  font-size: 12px;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.dialog-actions > span {
  margin-right: auto;
  color: var(--color-success);
  font-family: 'JetBrains Mono', monospace;
}

@media (width < 768px) {
  .asset-summary,
  .current-step {
    grid-template-columns: 1fr;
  }
}
</style>
