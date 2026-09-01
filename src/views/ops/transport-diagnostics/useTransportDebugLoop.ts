import { computed, ref } from 'vue'
import type { DebugTasksInput, DebugTasksResult, ResetInput } from '@/api/modules/transport'
import { createUuid7 } from '@/utils/uuid7'

export type TransportDebugStepConfirmationInput = Exclude<ResetInput, null>

export type TransportDebugStepKey =
  | 'RACK_TO_STATION'
  | 'BINS_TO_INFEED'
  | 'CONVEYOR_TO_OUTFEED'
  | 'BINS_TO_RACK'
  | 'RACK_TO_STORAGE'

export interface TransportDebugLoopPort {
  createTask(input: DebugTasksInput): Promise<DebugTasksResult>
  confirmAndReset(
    transportTaskId: string,
    confirmation: TransportDebugStepConfirmationInput
  ): Promise<unknown>
}

export interface TransportDebugLoopStep {
  key: TransportDebugStepKey
  title: string
  instruction: string
  createsTransportTask: boolean
}

const RACK_ID = '510056'
const STATION_ID = 'CTU01'
const FACE_VALUE = '90'
const BINS = [
  { binId: 'A000001922', slotId: '510056A3F2C101' },
  { binId: 'A000002653', slotId: '510056A2F2C101' }
] as const

const STEPS: readonly TransportDebugLoopStep[] = [
  {
    key: 'RACK_TO_STATION',
    title: '货架进站',
    instruction: '确认 AGV 已把货架 510056 从 ZONE WH01 搬到点位 KT16，面向值为“90”。',
    createsTransportTask: true
  },
  {
    key: 'BINS_TO_INFEED',
    title: '料箱投料',
    instruction: '确认 CTU 已把两个料箱从货架取下并投入 CNV0301。',
    createsTransportTask: true
  },
  {
    key: 'CONVEYOR_TO_OUTFEED',
    title: '滚筒线通行',
    instruction: '等待既有 ECS is_debug 流程通过 SCAN9～12；确认两个料箱均到达 CNV0302。',
    createsTransportTask: false
  },
  {
    key: 'BINS_TO_RACK',
    title: '料箱回架',
    instruction: '确认 CTU 已从 CNV0302 取出两个料箱并放回各自原储位。',
    createsTransportTask: true
  },
  {
    key: 'RACK_TO_STORAGE',
    title: '货架回库',
    instruction: '确认 AGV 已把货架 510056 从 KT16 搬回 WH01。',
    createsTransportTask: true
  }
] as const

export function useTransportDebugLoop(port: TransportDebugLoopPort) {
  const currentStepIndex = ref(0)
  const activeTaskId = ref<string | null>(null)
  const busy = ref(false)
  const started = ref(false)
  const isComplete = ref(false)
  const completedRounds = ref(0)
  const lastError = ref<Error | null>(null)
  const currentStep = computed(() => STEPS[currentStepIndex.value])

  async function start(): Promise<void> {
    if (busy.value) throw new Error('联调步进操作正在执行')
    currentStepIndex.value = 0
    activeTaskId.value = null
    started.value = true
    isComplete.value = false
    await dispatchCurrentStep()
  }

  async function advance(): Promise<void> {
    if (busy.value) throw new Error('联调步进操作正在执行')
    if (!started.value || isComplete.value) {
      await start()
      return
    }
    const step = currentStep.value
    if (step.createsTransportTask && activeTaskId.value === null) {
      await dispatchCurrentStep()
      return
    }

    busy.value = true
    lastError.value = null
    try {
      if (activeTaskId.value !== null) {
        const confirmationStep = step.key as TransportDebugStepConfirmationInput['step']
        await port.confirmAndReset(activeTaskId.value, {
          step: confirmationStep,
          assertion: 'PHYSICAL_TARGET_REACHED'
        })
        activeTaskId.value = null
      }
      if (currentStepIndex.value === STEPS.length - 1) {
        completedRounds.value += 1
        isComplete.value = true
        return
      }
      currentStepIndex.value += 1
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      busy.value = false
    }

    if (currentStep.value.createsTransportTask) {
      await dispatchCurrentStep()
    }
  }

  async function dispatchCurrentStep(): Promise<void> {
    if (busy.value) throw new Error('联调步进操作正在执行')
    const input = buildTaskInput(currentStep.value.key)
    if (input === null) return
    busy.value = true
    lastError.value = null
    try {
      const created = await port.createTask(input)
      activeTaskId.value = created.transport_task_id
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      busy.value = false
    }
  }

  return {
    steps: STEPS,
    currentStep,
    currentStepIndex,
    activeTaskId,
    busy,
    started,
    isComplete,
    completedRounds,
    lastError,
    start,
    advance
  }
}

function buildTaskInput(step: TransportDebugStepKey): DebugTasksInput | null {
  const common = { client_request_id: createUuid7(), station_id: STATION_ID }
  if (step === 'RACK_TO_STATION' || step === 'RACK_TO_STORAGE') {
    const outbound = step === 'RACK_TO_STATION'
    return {
      ...common,
      kind: 'RACK_MOVE',
      data: {
        rack_id: RACK_ID,
        source: outbound
          ? { kind: 'ZONE' as const, location_code: 'WH01' }
          : { kind: 'RACK_POSITION' as const, location_code: 'KT16' },
        target: outbound
          ? { kind: 'RACK_POSITION' as const, location_code: 'KT16' }
          : { kind: 'ZONE' as const, location_code: 'WH01' },
        target_face: FACE_VALUE,
        rcs_template_id: outbound ? ('CTU01' as const) : ('CTU03' as const)
      }
    }
  }
  if (step === 'BINS_TO_INFEED' || step === 'BINS_TO_RACK') {
    const outbound = step === 'BINS_TO_INFEED'
    return {
      ...common,
      kind: 'BIN_MOVE',
      data: {
        moves: BINS.map(bin => ({
          bin_id: bin.binId,
          source: outbound
            ? rackSlot(bin.slotId)
            : { kind: 'HANDOFF_POSITION' as const, location_code: 'CNV0302' },
          target: outbound
            ? { kind: 'HANDOFF_POSITION' as const, location_code: 'CNV0301' }
            : rackSlot(bin.slotId)
        }))
      }
    }
  }
  return null
}

function rackSlot(slotId: string) {
  return {
    kind: 'RACK_BIN_SLOT' as const,
    rack_id: RACK_ID,
    rack_face: FACE_VALUE,
    slot_id: slotId
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
