<script setup lang="ts">
import { computed } from 'vue'
import type { DebugRunResult } from '@/api/modules/transport'
import AppButton from '@/components/ui/AppButton.vue'
const props = defineProps<{ snapshot: DebugRunResult; canReadTask: boolean }>()
const emit = defineEmits<{ selectTask: [taskId: string] }>()
const snapshot = computed(() => props.snapshot)
type DebugRunStep = NonNullable<DebugRunResult['current_step']>
const PHASE_LABELS: Record<DebugRunStep['phase'], string> = {
  RACK_TO_STATION: '货架搬至工作位',
  BINS_TO_INFEED: '料箱搬至入库口',
  WAIT_SCAN12: '等待出料口扫码',
  BINS_TO_RACK: '料箱回架',
  ROTATE_TO_NEXT_FACE: '货架旋转至下一面',
  RACK_TO_STORAGE: '货架返库'
}
const currentGroup = computed(
  () => snapshot.value?.face_groups[snapshot.value.current_group_index] ?? null
)
const observedBins = computed(
  () =>
    snapshot.value?.steps
      .slice()
      .reverse()
      .find(
        step =>
          step.phase === 'WAIT_SCAN12' && step.group_index === snapshot.value?.current_group_index
      )?.observed_bin_codes ?? []
)
const pendingBins = computed(() => {
  const observed = new Set(observedBins.value)
  return (
    currentGroup.value?.bins.map(bin => bin.bin_code).filter(binCode => !observed.has(binCode)) ??
    []
  )
})
const runSteps = computed(() => snapshot.value?.steps ?? [])
function stepGroup(step: DebugRunStep) {
  if (step.group_index === null) return null
  return snapshot.value?.face_groups[step.group_index] ?? null
}

function stepPendingBins(step: DebugRunStep): string[] {
  const group = stepGroup(step)
  if (!group) return []
  const observed = new Set(step.observed_bin_codes)
  return group.bins.map(bin => bin.bin_code).filter(binCode => !observed.has(binCode))
}

function showsStepGroup(step: DebugRunStep): boolean {
  return step.phase !== 'RACK_TO_STORAGE' && stepGroup(step) !== null
}
</script>
<template>
  <section
    v-if="snapshot"
    class="run-observer"
    data-test="run-observer"
  >
    <div class="run-summary">
      <div>
        <span>联调记录</span>
        <strong>{{ snapshot.run_id }}</strong>
      </div>
      <div>
        <span>货架</span>
        <strong>{{ snapshot.rack_id }}</strong>
      </div>
      <div>
        <span>进度</span>
        <strong>第 {{ snapshot.current_group_index + 1 }} 面 / {{ snapshot.current_phase }}</strong>
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

    <section
      v-if="snapshot.status === 'FAILED'"
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
    </section>

    <section
      class="step-progress"
      data-test="run-step-progress"
    >
      <h3>联调步骤记录</h3>
      <ol>
        <li
          v-for="step in runSteps"
          :key="step.ordinal"
          class="step-card"
        >
          <header>
            <span>步骤 {{ step.ordinal + 1 }}</span>
            <strong>{{ PHASE_LABELS[step.phase] }}</strong>
            <span :class="['step-status', `step-status--${step.status.toLowerCase()}`]">
              {{ step.status }}
            </span>
          </header>
          <p>
            面组选中对象：
            <strong v-if="step.phase.startsWith('RACK_') || step.phase === 'ROTATE_TO_NEXT_FACE'">
              货架 {{ snapshot.rack_id }}
            </strong>
            <strong v-else>
              料箱
              {{
                stepGroup(step)
                  ?.bins.map(bin => bin.bin_code)
                  .join(' / ') || '无'
              }}
            </strong>
          </p>
          <p v-if="showsStepGroup(step)">
            货架面：
            <code>{{ stepGroup(step)?.face }}</code>
            · 初始槽位：{{
              stepGroup(step)
                ?.bins.map(bin => bin.slot_id)
                .join(' / ')
            }}
          </p>
          <p v-if="step.phase === 'WAIT_SCAN12'">
            已扫描：{{ step.observed_bin_codes.join(' / ') || '无' }} · 待扫描：{{
              stepPendingBins(step).join(' / ') || '无'
            }}
          </p>
          <p v-if="step.reason_code">原因：{{ step.reason_code }}</p>
          <AppButton
            v-if="props.canReadTask && step.transport_task_id"
            @click="emit('selectTask', step.transport_task_id)"
          >
            查询任务记录 {{ step.transport_task_id }}
          </AppButton>
        </li>
      </ol>
    </section>

    <section class="progress-panel">
      <h3>冻结配置与当前 Evidence</h3>
      <p>
        当前面：
        <code>{{ currentGroup?.face }}</code>
      </p>
      <p>已扫描：{{ observedBins.join(' / ') || '无' }}</p>
      <p>待扫描：{{ pendingBins.join(' / ') || '无' }}</p>
      <AppButton
        v-if="props.canReadTask && snapshot.current_step?.transport_task_id"
        @click="emit('selectTask', snapshot.current_step.transport_task_id)"
      >
        查看任务 {{ snapshot.current_step.transport_task_id }}
      </AppButton>
      <p class="evidence-hint">
        设备诊断请筛选
        <code>device_code={{ snapshot?.scan_device_codes[3] }}</code>
        ，扫码值应携带料箱编码。
      </p>
    </section>

    <section
      v-if="snapshot.returned_bins?.length"
      class="progress-panel"
      data-test="returned-locations"
    >
      <h3>已确认的回架储位</h3>
      <p
        v-for="bin in snapshot.returned_bins"
        :key="bin.bin_code"
      >
        <code>{{ bin.bin_code }}</code>
        → 货架 {{ bin.rack_id }} / {{ bin.rack_face }} 面 /
        <code>{{ bin.slot_id }}</code>
      </p>
    </section>
  </section>
</template>
<style scoped src="./TransportDebugRunPanel.css"></style>
