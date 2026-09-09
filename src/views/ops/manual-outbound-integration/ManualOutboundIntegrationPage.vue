<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermission } from '@/composables/usePermission'
import { OPS_WORKLINE_INTEGRATION_DEBUG_PERMISSION as PERMISSION } from '@/api/generated/permissions/user_api/ops/workline-integration-debug'
import { createUuid7 } from '@/utils/uuid7'
import {
  worklineIntegrationDebugApi as api,
  type IntegrationPhase,
  type IntegrationProfile,
  type IntegrationRun,
  type IntegrationRunStep,
  type DeviceActionInput,
  type TransportActionInput
} from '@/api/manualOutboundIntegrationApi'
import type {
  WmsBinInboundBatchInput,
  WmsBinReturnBatchInput,
  WmsCompletionApplyReportInput,
  WmsPrepareInput,
  WmsRackDepartureInput,
  WmsRetryInput,
  WmsTaskCompletionInput,
  WmsWorkAdmissionInput
} from '@/api/modules/worklineIntegrationDebug'
import { useManualOutboundIntegration } from './useManualOutboundIntegration'
import {
  buildDefaultDeviceData,
  buildDefaultWmsData,
  isWmsOutboundPhase,
  parseEditableJsonObject
} from './manualOutboundPayloads'

const manualOutboundSite = {
  outboundRcsTemplate: 'CTU01',
  returnRcsTemplate: 'CTU03',
  binRackPositions: ['KT16', 'KT17'],
  outboundTransferPosition: 'OUT65',
  returnZoneCode: 'WH05',
  infeedPosition: 'CNV0301',
  outfeedPosition: 'CNV0302',
  ecsEndpoint: 'http://10.24.209.26:8080/',
  scanDeviceCodes: ['STATION_SCAN9', 'STATION_SCAN10', 'STATION_SCAN11', 'STATION_SCAN12']
} as const

const state = useManualOutboundIntegration()
const { hasPermission } = usePermission()
const permissionAccess = computed(() => ({
  list: hasPermission(PERMISSION.list),
  create: hasPermission(PERMISSION.create),
  binInboundBatch: hasPermission(PERMISSION.binInboundBatch),
  binReturnBatch: hasPermission(PERMISSION.binReturnBatch),
  bindCompletion: hasPermission(PERMISSION.bindCompletion),
  bindTask: hasPermission(PERMISSION.bindTask),
  close: hasPermission(PERMISSION.close),
  complete: hasPermission(PERMISSION.complete),
  completionApplyReport: hasPermission(PERMISSION.completionApplyReport),
  confirmPhase: hasPermission(PERMISSION.confirmPhase),
  deviceCommand: hasPermission(PERMISSION.deviceCommand),
  export: hasPermission(PERMISSION.export),
  point2Scan: hasPermission(PERMISSION.point2Scan),
  prepareTask: hasPermission(PERMISSION.prepareTask),
  rackDeparture: hasPermission(PERMISSION.rackDeparture),
  read: hasPermission(PERMISSION.read),
  refreshDevice: hasPermission(PERMISSION.refreshDevice),
  refreshPlan: hasPermission(PERMISSION.refreshPlan),
  refreshTransport: hasPermission(PERMISSION.refreshTransport),
  refreshWms: hasPermission(PERMISSION.refreshWms),
  retryWms: hasPermission(PERMISSION.retryWms),
  stream: hasPermission(PERMISSION.stream),
  takeover: hasPermission(PERMISSION.takeover),
  taskCompletion: hasPermission(PERMISSION.taskCompletion),
  transport: hasPermission(PERMISSION.transport),
  workAdmission: hasPermission(PERMISSION.workAdmission)
}))
const busy = ref(false)
const taskId = ref('')
const binCode = ref('')
const completionOperationId = ref('')
const scanTimestamp = ref<number>()
const wmsDataText = ref('{}')
const deviceDataText = ref('{}')
const phaseNote = ref('现场已核对并完成该步骤')
const closeVisible = ref(false)
const transportVisible = ref(false)
const deviceVisible = ref(false)
const cleanup = reactive({ wms: false, site: false })
const createForm = reactive({
  workline_code: 'KT16',
  profile: 'CONTRACT_SIMULATION' as IntegrationProfile,
  environment_label: 'integration',
  device_code: 'STATION_SCAN10',
  rack_id: ''
})
const transportForm = reactive({
  rackId: '',
  kind: 'MOVE_RACK' as TransportActionInput['kind'],
  sourceLocation: '',
  targetLocation: '',
  rackFace: '',
  slotId: '',
  binCode: '',
  targetFace: '',
  rcsTemplateId: 'CTU01' as TransportActionInput['rcs_template_id']
})
const pendingActionBodies = new Map<string, object>()

const phases: IntegrationPhase[] = [
  'BIND_TASK',
  'TASK_PREPARE',
  'PLAN_RECEIPT',
  'RACK_TRANSPORT',
  'RACK_ARRIVAL',
  'BIN_INBOUND_BATCH',
  'BIN_TRANSPORT',
  'POINT1_ARRIVAL',
  'POINT2_SCAN',
  'WORK_ADMISSION',
  'WORK_COMPLETION',
  'POINT2_RELEASE',
  'COMPLETION_REPORT',
  'POINT3_ROUTE',
  'RETURN_BUFFER',
  'BIN_RETURN_BATCH',
  'BIN_RETURN_TRANSPORT',
  'RACK_DEPARTURE',
  'TASK_COMPLETION',
  'CLEANUP'
]
const selectedPhase = ref<IntegrationPhase>('BIND_TASK')
const phaseLabels: Record<IntegrationPhase, string> = {
  BIND_TASK: '选择 WMS issued 任务',
  TASK_PREPARE: '发送 PickingTask prepare',
  PLAN_RECEIPT: '接收 plan_delta 资源',
  RACK_TRANSPORT: '创建任务资源货架搬运',
  RACK_ARRIVAL: '确认五层货架到位',
  BIN_INBOUND_BATCH: '请求入站料箱批次',
  BIN_TRANSPORT: '创建料箱搬运',
  POINT1_ARRIVAL: '确认料箱到达 1 号口',
  POINT2_SCAN: 'point2 实际扫码',
  WORK_ADMISSION: 'WMS 准入决定',
  WORK_COMPLETION: 'WMS 完成决定',
  POINT2_RELEASE: 'point2 放行',
  POINT3_ROUTE: 'point3 路由',
  RETURN_BUFFER: '回流缓存',
  COMPLETION_REPORT: '完成应用报告',
  BIN_RETURN_BATCH: '请求退箱目标',
  BIN_RETURN_TRANSPORT: '创建退箱搬运',
  RACK_DEPARTURE: '货架离场决定与搬运',
  TASK_COMPLETION: '任务完成确认',
  CLEANUP: '完成与清理'
}
const phaseInteractions: Record<IntegrationPhase, { direction: string; operation: string }> = {
  BIND_TASK: { direction: 'WMS → WES', operation: 'outbound.picking_task.issued@v1' },
  TASK_PREPARE: { direction: 'WES → WMS', operation: 'outbound.picking_task.prepare@v1' },
  PLAN_RECEIPT: { direction: 'WMS → WES', operation: 'outbound.picking_task.plan_delta@v1' },
  RACK_TRANSPORT: { direction: 'WES → RCS', operation: 'TransportTask · MOVE_RACK' },
  RACK_ARRIVAL: { direction: 'RCS → WES', operation: 'Transport result / rack arrival' },
  BIN_INBOUND_BATCH: { direction: 'WES → WMS', operation: 'outbound.bin.inbound_batch@v1' },
  BIN_TRANSPORT: { direction: 'WES → RCS', operation: 'TransportTask · MOVE_BINS' },
  POINT1_ARRIVAL: { direction: 'ECS → WES', operation: 'point1 arrival event' },
  POINT2_SCAN: { direction: 'ECS → WES', operation: 'point2 scan event' },
  WORK_ADMISSION: {
    direction: 'WES → WMS',
    operation: 'outbound.manual_bin.work_admission_decide@v1'
  },
  WORK_COMPLETION: {
    direction: 'WMS → WES',
    operation: 'outbound.manual_bin.work_completed@v1'
  },
  COMPLETION_REPORT: {
    direction: 'WES → WMS',
    operation: 'outbound.manual_bin.completion_apply_report@v1'
  },
  POINT2_RELEASE: { direction: 'WES → ECS', operation: 'point2 release command' },
  POINT3_ROUTE: { direction: 'ECS ↔ WES', operation: 'point3 route event / command' },
  RETURN_BUFFER: { direction: 'ECS → WES', operation: 'return buffer event' },
  BIN_RETURN_BATCH: { direction: 'WES → WMS', operation: 'outbound.bin.return_batch@v1' },
  BIN_RETURN_TRANSPORT: { direction: 'WES → RCS', operation: 'TransportTask · MOVE_BINS' },
  RACK_DEPARTURE: {
    direction: 'WES → WMS / RCS',
    operation: 'outbound.rack.departure_decide@v1 / MOVE_RACK'
  },
  TASK_COMPLETION: {
    direction: 'WES → WMS',
    operation: 'outbound.picking_task.completion_confirm@v1'
  },
  CLEANUP: { direction: '管理员', operation: '记录 WMS/现场清理状态' }
}

const run = computed(() => state.currentRun.value)
const selectedIsWmsOutbound = computed(() => isWmsOutboundPhase(selectedPhase.value))
watch(
  () => run.value?.run_id,
  (runId, previousRunId) => {
    closeVisible.value = false
    cleanup.wms = false
    cleanup.site = false
    if (runId !== previousRunId) {
      scanTimestamp.value = undefined
    }
  }
)
watch([() => run.value?.run_id, selectedPhase], () => resetWmsData(), {
  immediate: true,
  flush: 'sync'
})
watch(
  () => run.value,
  current => {
    if (!current) return
    const completedIds = new Set(
      current.steps
        .filter(
          step =>
            !!step.client_request_id &&
            (!!step.wms_confirmation_id ||
              !!step.transport_task_id ||
              !!step.device_command_code ||
              ['SUCCEEDED', 'NEEDS_ATTENTION'].includes(step.status))
        )
        .map(step => step.client_request_id as string)
    )
    for (const [key, body] of pendingActionBodies) {
      if (
        'client_request_id' in body &&
        typeof body.client_request_id === 'string' &&
        completedIds.has(body.client_request_id)
      ) {
        pendingActionBodies.delete(key)
      }
    }
    const incompleteDeviceStep = [...current.steps]
      .reverse()
      .find(
        step =>
          ['POINT2_RELEASE', 'POINT3_ROUTE'].includes(step.phase) &&
          step.status === 'WAITING' &&
          !!step.client_request_id &&
          !step.device_command_code
      )
    const request = incompleteDeviceStep?.request
    if (
      incompleteDeviceStep?.client_request_id &&
      request &&
      typeof request.device_code === 'string' &&
      typeof request.task_type === 'string' &&
      request.params &&
      typeof request.params === 'object' &&
      !Array.isArray(request.params) &&
      typeof request.timeout_ms === 'number' &&
      typeof request.reason === 'string'
    ) {
      const key = `${current.run_id}:${incompleteDeviceStep.phase}:device-command`
      const pending = pendingActionBodies.get(key)
      pendingActionBodies.set(
        key,
        pending
          ? { ...pending, expected_version: current.version }
          : {
              client_request_id: incompleteDeviceStep.client_request_id,
              expected_version: current.version,
              device_code: request.device_code,
              task_type: request.task_type,
              params: request.params,
              timeout_ms: request.timeout_ms,
              reason: request.reason
            }
      )
    }
  }
)
const isClosed = computed(() => run.value?.status === 'CLOSED_BY_OPERATOR')
const isBinReturnTransport = computed(() => selectedPhase.value === 'BIN_RETURN_TRANSPORT')
const isRackDepartureTransport = computed(() => selectedPhase.value === 'RACK_DEPARTURE')
const selectedInteraction = computed(() => phaseInteractions[selectedPhase.value])
const selectedSteps = computed(() =>
  (run.value?.steps ?? []).filter(step => step.phase === selectedPhase.value)
)
const isSelectedCurrent = computed(() => selectedPhase.value === run.value?.current_phase)
const canCreate = computed(() => permissionAccess.value.create)
const isRefreshableStep = (step: IntegrationRunStep) =>
  ['WAITING', 'NEEDS_ATTENTION'].includes(step.status)
const lastRefreshableWmsStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.wms_confirmation_id && isRefreshableStep(step))
)
const retryablePrepareStep = computed(() => {
  if (
    run.value?.status !== 'NEEDS_ATTENTION' ||
    run.value.current_phase !== 'TASK_PREPARE' ||
    run.value.attention_code !== 'WMS_CONFIRMATION_RECONCILING'
  )
    return undefined
  return [...run.value.steps]
    .reverse()
    .find(
      step =>
        step.phase === 'TASK_PREPARE' &&
        step.status === 'NEEDS_ATTENTION' &&
        step.reason_code === 'WMS_CONFIRMATION_RECONCILING' &&
        !!step.client_request_id
    )
})
const lastRefreshableTransportStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.transport_task_id && isRefreshableStep(step))
)
const lastRefreshableDeviceStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.device_command_code && isRefreshableStep(step))
)
const rackDepartureStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(
      step =>
        step.operation === 'outbound.rack.departure_decide@v1' &&
        step.status === 'SUCCEEDED' &&
        wmsResponseResult(step) === 'READY'
    )
)
const hasRefreshableStep = computed(
  () =>
    !!lastRefreshableWmsStep.value ||
    !!lastRefreshableTransportStep.value ||
    !!lastRefreshableDeviceStep.value
)
const isEmptyWaitingRun = computed(
  () =>
    run.value?.status === 'WAITING_TASK' &&
    run.value.current_phase === 'BIND_TASK' &&
    run.value.steps.every(
      step =>
        !step.client_request_id &&
        !step.operation &&
        !step.wms_confirmation_id &&
        !step.transport_task_id &&
        !step.device_command_code
    )
)
const canCloseRun = computed(
  () =>
    !!run.value &&
    (['COMPLETED', 'NEEDS_ATTENTION'].includes(run.value.status) || isEmptyWaitingRun.value)
)
const boundCompletion = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.operation === 'outbound.manual_bin.work_completed@v1')
)
const applyReportStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.operation === 'outbound.manual_bin.completion_apply_report@v1')
)
const canReportAttention = computed(
  () =>
    run.value?.status === 'NEEDS_ATTENTION' &&
    ['WORK_COMPLETION', 'POINT2_RELEASE'].includes(run.value.current_phase) &&
    !!boundCompletion.value?.operation_id &&
    !applyReportStep.value
)
const primaryLabel = computed(() => {
  if (!run.value) return '创建联调 Run'
  if (retryablePrepareStep.value) return '确认 WMS 已作废旧 prepare，使用新 ID 重发'
  if (lastRefreshableWmsStep.value) return '刷新 WMS 结果'
  if (lastRefreshableTransportStep.value) return '刷新 Transport 结果'
  if (lastRefreshableDeviceStep.value) return '刷新 ECS 指令结果'
  if (run.value.status === 'COMPLETED' || run.value.status === 'NEEDS_ATTENTION')
    return '确认清理并关闭'
  return {
    BIND_TASK: '选择已接收任务',
    TASK_PREPARE: '发送 prepare Operation',
    PLAN_RECEIPT: '刷新 plan_delta 资源',
    RACK_TRANSPORT: '确认货架搬运已完成',
    RACK_ARRIVAL: '确认五层货架到位',
    BIN_INBOUND_BATCH: '发送 inbound_batch',
    BIN_TRANSPORT: '确认料箱搬运已完成',
    POINT1_ARRIVAL: '确认到达 1 号口',
    POINT2_SCAN: '记录实际扫码',
    WORK_ADMISSION: '发送准入 Operation',
    WORK_COMPLETION: '绑定完成 Operation',
    POINT2_RELEASE: '确认 point2 已放行',
    POINT3_ROUTE: '确认 point3 路由',
    RETURN_BUFFER: '确认已进入回流缓存',
    BIN_RETURN_BATCH: '发送 return_batch',
    BIN_RETURN_TRANSPORT: '确认退箱搬运已完成',
    RACK_DEPARTURE: rackDepartureStep.value ? '确认货架离场搬运完成' : '发送 departure_decide',
    TASK_COMPLETION: '发送 completion_confirm',
    COMPLETION_REPORT: '发送应用报告',
    CLEANUP: '标记本轮完成'
  }[run.value.current_phase]
})
const hasPrimaryPermission = computed(() => {
  if (!run.value) return permissionAccess.value.create
  if (retryablePrepareStep.value) return permissionAccess.value.retryWms
  if (lastRefreshableWmsStep.value) return permissionAccess.value.refreshWms
  if (lastRefreshableTransportStep.value) return permissionAccess.value.refreshTransport
  if (lastRefreshableDeviceStep.value) return permissionAccess.value.refreshDevice
  if (run.value.status === 'COMPLETED' || run.value.status === 'NEEDS_ATTENTION')
    return permissionAccess.value.close
  return {
    BIND_TASK: permissionAccess.value.bindTask,
    TASK_PREPARE: permissionAccess.value.prepareTask,
    PLAN_RECEIPT: permissionAccess.value.refreshPlan,
    RACK_TRANSPORT: permissionAccess.value.confirmPhase,
    RACK_ARRIVAL: permissionAccess.value.confirmPhase,
    BIN_INBOUND_BATCH: permissionAccess.value.binInboundBatch,
    BIN_TRANSPORT: permissionAccess.value.confirmPhase,
    POINT1_ARRIVAL: permissionAccess.value.confirmPhase,
    POINT2_SCAN: permissionAccess.value.point2Scan,
    WORK_ADMISSION: permissionAccess.value.workAdmission,
    WORK_COMPLETION: permissionAccess.value.bindCompletion,
    POINT2_RELEASE: permissionAccess.value.confirmPhase,
    POINT3_ROUTE: permissionAccess.value.confirmPhase,
    RETURN_BUFFER: permissionAccess.value.confirmPhase,
    BIN_RETURN_BATCH: permissionAccess.value.binReturnBatch,
    BIN_RETURN_TRANSPORT: permissionAccess.value.confirmPhase,
    RACK_DEPARTURE: rackDepartureStep.value
      ? permissionAccess.value.confirmPhase
      : permissionAccess.value.rackDeparture,
    TASK_COMPLETION: permissionAccess.value.taskCompletion,
    COMPLETION_REPORT: permissionAccess.value.completionApplyReport,
    CLEANUP: permissionAccess.value.complete
  }[run.value.current_phase]
})

function phaseState(
  phase: IntegrationPhase
): 'pending' | 'current' | 'done' | 'skipped' | 'attention' {
  const current = run.value
  if (!current) return 'pending'
  const steps = current.steps.filter(step => step.phase === phase)
  if (steps.some(step => step.status === 'NEEDS_ATTENTION')) return 'attention'
  if (current.status === 'CLOSED_BY_OPERATOR') {
    if (steps.some(step => step.status === 'SUCCEEDED')) return 'done'
    return phases.indexOf(phase) < phases.indexOf(current.current_phase) ? 'skipped' : 'pending'
  }
  if (phase === current.current_phase) return 'current'
  if (steps.some(step => step.status === 'WAITING')) return 'pending'
  if (steps.some(step => step.status === 'SUCCEEDED')) return 'done'
  if (phases.indexOf(phase) < phases.indexOf(current.current_phase)) return 'skipped'
  return 'pending'
}

function selectPhase(phase: IntegrationPhase): void {
  selectedPhase.value = phase
}

function resetWmsData(): void {
  const current = run.value
  const phase = selectedPhase.value
  if (!current || !isWmsOutboundPhase(phase)) {
    wmsDataText.value = '{}'
    return
  }
  wmsDataText.value = JSON.stringify(buildDefaultWmsData(current, phase), null, 2)
}

function readWmsData(): Record<string, unknown> | null {
  try {
    return parseEditableJsonObject(wmsDataText.value, 'WMS data')
  } catch (error) {
    ElMessage.warning(error instanceof Error ? error.message : String(error))
    return null
  }
}

async function selectRun(runId: string): Promise<void> {
  await state.select(runId)
  if (run.value) selectedPhase.value = run.value.current_phase
}

async function createRun(): Promise<void> {
  if (!createForm.workline_code.trim() || !createForm.device_code.trim()) {
    ElMessage.warning('请填写 WorkLine code 和已登记 device_code')
    return
  }
  await invoke(() =>
    state.create({
      workline_code: createForm.workline_code.trim(),
      profile: createForm.profile,
      environment_label: createForm.environment_label.trim(),
      device_code: createForm.device_code.trim(),
      ...(createForm.rack_id.trim() ? { rack_id: createForm.rack_id.trim() } : {})
    })
  )
}

async function primaryAction(): Promise<void> {
  const current = run.value
  if (!current) return createRun()
  if (selectedPhase.value !== current.current_phase) {
    ElMessage.warning(`当前应操作 ${phaseLabels[current.current_phase]}`)
    return
  }
  if (retryablePrepareStep.value?.client_request_id) {
    const data = readWmsData()
    if (!data) return
    await ElMessageBox.confirm(
      `WMS 团队必须先按原 operation_id 作废或清理 prepare，并确认原请求不会再计算或发送 plan_delta。WES 将保留旧证据，按当前 data JSON 和新的 operation_id 重发。`,
      '确认 WMS 已作废旧 prepare',
      { type: 'warning', confirmButtonText: '确认并发送' }
    )
    return invoke(() =>
      api.retryWms(current.run_id, {
        expected_version: current.version,
        client_request_id: retryablePrepareStep.value!.client_request_id!,
        data,
        wms_original_prepare_voided_confirmed: true
      } as WmsRetryInput)
    )
  }
  if (lastRefreshableWmsStep.value?.client_request_id) {
    return invoke(() =>
      api.refreshWms(current.run_id, {
        expected_version: current.version,
        client_request_id: lastRefreshableWmsStep.value!.client_request_id!
      })
    )
  }
  if (lastRefreshableTransportStep.value?.client_request_id) {
    return invoke(() =>
      api.refreshTransport(current.run_id, {
        expected_version: current.version,
        client_request_id: lastRefreshableTransportStep.value!.client_request_id!
      })
    )
  }
  if (lastRefreshableDeviceStep.value?.client_request_id) {
    return invoke(() =>
      api.refreshDevice(current.run_id, {
        expected_version: current.version,
        client_request_id: lastRefreshableDeviceStep.value!.client_request_id!
      })
    )
  }
  if (current.status === 'COMPLETED' || current.status === 'NEEDS_ATTENTION') {
    openCloseRun()
    return
  }
  switch (current.current_phase) {
    case 'BIND_TASK':
      return invoke(() =>
        api.bindTask(current.run_id, versioned(current, { task_id: taskId.value.trim() }))
      )
    case 'TASK_PREPARE': {
      const data = readWmsData()
      if (!data) return
      return invokeStableAction(
        current,
        'prepare-task',
        () =>
          versioned(current, {
            client_request_id: createUuid7(),
            data
          }) as WmsPrepareInput,
        body => api.prepareTask(current.run_id, body)
      )
    }
    case 'PLAN_RECEIPT':
      return invoke(() => api.refreshPlan(current.run_id, versioned(current)))
    case 'BIN_INBOUND_BATCH': {
      const data = readWmsData()
      if (!data) return
      return invokeStableAction(
        current,
        'bin-inbound-batch',
        () =>
          versioned(current, {
            client_request_id: createUuid7(),
            data
          }) as WmsBinInboundBatchInput,
        body => api.binInboundBatch(current.run_id, body)
      )
    }
    case 'POINT2_SCAN': {
      const scannedAt = scanTimestamp.value ?? Date.now()
      scanTimestamp.value = scannedAt
      return invoke(() =>
        api.point2Scan(
          current.run_id,
          versioned(current, { bin_code: binCode.value.trim(), scanned_at: scannedAt })
        )
      )
    }
    case 'WORK_ADMISSION': {
      const data = readWmsData()
      if (!data) return
      return invokeStableAction(
        current,
        'work-admission',
        () =>
          versioned(current, { client_request_id: createUuid7(), data }) as WmsWorkAdmissionInput,
        body => api.workAdmission(current.run_id, body)
      )
    }
    case 'WORK_COMPLETION':
      return invoke(() =>
        api.bindCompletion(
          current.run_id,
          versioned(current, { operation_id: completionOperationId.value.trim() })
        )
      )
    case 'BIN_RETURN_BATCH': {
      const data = readWmsData()
      if (!data) return
      return invokeStableAction(
        current,
        'bin-return-batch',
        () =>
          versioned(current, {
            client_request_id: createUuid7(),
            data
          }) as WmsBinReturnBatchInput,
        body => api.binReturnBatch(current.run_id, body)
      )
    }
    case 'RACK_DEPARTURE':
      if (rackDepartureStep.value) return confirmPhase(current)
      {
        const data = readWmsData()
        if (!data) return
        return invokeStableAction(
          current,
          'rack-departure',
          () =>
            versioned(current, {
              client_request_id: createUuid7(),
              data
            }) as WmsRackDepartureInput,
          body => api.rackDeparture(current.run_id, body)
        )
      }
    case 'TASK_COMPLETION': {
      const data = readWmsData()
      if (!data) return
      return invokeStableAction(
        current,
        'task-completion',
        () =>
          versioned(current, { client_request_id: createUuid7(), data }) as WmsTaskCompletionInput,
        body => api.taskCompletion(current.run_id, body)
      )
    }
    case 'COMPLETION_REPORT':
      if (boundCompletion.value?.operation_id && !applyReportStep.value) {
        const data = readWmsData()
        if (!data) return
        return invokeStableAction(
          current,
          'completion-apply-report',
          () =>
            versioned(current, {
              client_request_id: createUuid7(),
              data
            }) as WmsCompletionApplyReportInput,
          body => api.completionApplyReport(current.run_id, body)
        )
      }
      ElMessage.warning('应用报告已创建，请刷新并等待 WMS RECORDED/DUPLICATE')
      return
    case 'CLEANUP':
      return invoke(() => api.complete(current.run_id, versioned(current)))
    default:
      return confirmPhase(current)
  }
}

function confirmPhase(current: IntegrationRun): Promise<void> {
  return invoke(() =>
    api.confirmPhase(current.run_id, versioned(current, { note: phaseNote.value.trim() }))
  )
}

function applyRackPreset(): void {
  const current = run.value
  const rackId = transportForm.rackId.trim()
  if (!current || !rackId || selectedPhase.value !== 'RACK_TRANSPORT') return
  transportForm.sourceLocation = rackId
  if (current.plan_resources?.target_rack.rack_id === rackId) {
    transportForm.targetLocation = manualOutboundSite.outboundTransferPosition
    transportForm.targetFace = current.plan_resources.target_rack.rack_face
    return
  }
  const rackIndex =
    current.plan_resources?.bin_source_racks.findIndex(item => item.rack_id === rackId) ?? -1
  transportForm.targetLocation =
    manualOutboundSite.binRackPositions[Math.max(0, Math.min(rackIndex, 1))] ??
    manualOutboundSite.binRackPositions[0]
  transportForm.targetFace =
    current.plan_resources?.bin_source_racks.find(item => item.rack_id === rackId)?.rack_face ?? ''
}

function openTransport(): void {
  const current = run.value
  if (!current) return
  if (selectedPhase.value === 'RACK_TRANSPORT') {
    transportForm.kind = 'MOVE_RACK'
    transportForm.rackId = current.plan_resources?.target_rack.rack_id ?? ''
    transportForm.rcsTemplateId = manualOutboundSite.outboundRcsTemplate
    applyRackPreset()
  } else if (selectedPhase.value === 'RACK_DEPARTURE') {
    transportForm.kind = 'MOVE_RACK'
    transportForm.rackId = current.plan_resources?.target_rack.rack_id || ''
    transportForm.sourceLocation = transportForm.rackId
    transportForm.targetLocation = manualOutboundSite.returnZoneCode
    transportForm.targetFace = ''
    transportForm.rcsTemplateId = manualOutboundSite.returnRcsTemplate
  } else {
    transportForm.kind = 'MOVE_BINS'
    transportForm.rackId = current.plan_resources?.bin_source_racks[0]?.rack_id || ''
    transportForm.sourceLocation = manualOutboundSite.outfeedPosition
    transportForm.targetLocation = manualOutboundSite.infeedPosition
    transportForm.rcsTemplateId = manualOutboundSite.outboundRcsTemplate
  }
  transportVisible.value = true
}

function openDevice(): void {
  const current = run.value
  if (!current || !isSelectedCurrent.value) {
    ElMessage.warning('ECS 指令仅允许在当前 point2 放行或 point3 路由节点创建')
    return
  }
  const phase = current.current_phase
  if (phase !== 'POINT2_RELEASE' && phase !== 'POINT3_ROUTE') {
    ElMessage.warning('ECS 指令仅允许在当前 point2 放行或 point3 路由节点创建')
    return
  }
  deviceDataText.value = JSON.stringify(buildDefaultDeviceData(current, phase), null, 2)
  deviceVisible.value = true
}

async function refreshPlanResources(): Promise<void> {
  const current = run.value
  if (!current) return
  await invoke(() => api.refreshPlan(current.run_id, versioned(current)))
}

async function reportAttention(): Promise<void> {
  const current = run.value
  const completionOperationId = boundCompletion.value?.operation_id
  if (!current || !completionOperationId) return
  const allowedReasons = [
    'RESULT_CONFLICT',
    'FIRST_COMPLETION_OUT_OF_WINDOW',
    'POINT2_BINDING_MISMATCH',
    'WORKLINE_NOT_ACTIVE',
    'COMPLETED_AT_INVALID',
    'DEVICE_COMMAND_IDENTITY_CONFLICT'
  ] as const
  const reasonCode = allowedReasons.includes(
    current.attention_code as (typeof allowedReasons)[number]
  )
    ? (current.attention_code as (typeof allowedReasons)[number])
    : 'POINT2_BINDING_MISMATCH'
  if (selectedPhase.value !== 'COMPLETION_REPORT') {
    selectedPhase.value = 'COMPLETION_REPORT'
    wmsDataText.value = JSON.stringify(
      {
        ...buildDefaultWmsData(current, 'COMPLETION_REPORT'),
        apply_result: 'RECONCILING',
        reason_code: reasonCode
      },
      null,
      2
    )
    ElMessage.info('请核对并编辑 completion_apply_report data，再次点击上报')
    return
  }
  const data = readWmsData()
  if (!data) return
  await invokeStableAction(
    current,
    'completion-attention-report',
    () =>
      versioned(current, {
        client_request_id: createUuid7(),
        data
      }) as WmsCompletionApplyReportInput,
    body => api.completionApplyReport(current.run_id, body)
  )
}

async function closeRun(): Promise<void> {
  const current = run.value
  if (!current || !cleanup.wms || !cleanup.site) return
  await invoke(() =>
    api.close(
      current.run_id,
      versioned(current, { wms_cleanup_confirmed: true, site_cleanup_confirmed: true })
    )
  )
  closeVisible.value = false
}

function openCloseRun(): void {
  cleanup.wms = false
  cleanup.site = false
  closeVisible.value = true
}

async function takeoverRun(): Promise<void> {
  const current = run.value
  if (!current) return
  await ElMessageBox.confirm(
    `当前操作员 user_id=${current.operator_user_id}。接管只变更联调操作权，不释放任何 WMS、Transport 或 ECS 义务。`,
    '确认接管联调 Run',
    { type: 'warning', confirmButtonText: '接管' }
  )
  await invoke(() => api.takeover(current.run_id, versioned(current)))
}

async function sendTransport(): Promise<void> {
  const current = run.value
  const rackId = transportForm.rackId.trim()
  if (!current || !rackId) {
    ElMessage.warning('请选择 plan_delta 中的 rack_id')
    return
  }
  if (!isSelectedCurrent.value || isClosed.value) {
    ElMessage.warning(`当前应操作 ${phaseLabels[current.current_phase]}`)
    return
  }
  if (current.profile === 'FULL_SITE_INTEGRATION') {
    await ElMessageBox.confirm(
      `将为真实货架 ${rackId} 创建一个 TransportTask，请确认 RCS 和现场通道已就绪。`,
      '确认真实 Transport',
      { type: 'warning', confirmButtonText: '创建任务' }
    )
  }
  await invokeStableAction(
    current,
    `transport-${transportForm.kind}`,
    (): TransportActionInput => {
      const common = {
        client_request_id: createUuid7(),
        rack_id: rackId,
        rcs_template_id: transportForm.rcsTemplateId,
        expected_version: current.version
      }
      if (transportForm.kind === 'ROTATE_RACK') {
        return {
          ...common,
          kind: 'ROTATE_RACK' as const,
          source: { kind: 'RACK_POSITION', location_code: transportForm.sourceLocation.trim() },
          target_face: transportForm.targetFace.trim()
        }
      }
      if (transportForm.kind === 'MOVE_BINS') {
        return {
          ...common,
          kind: 'MOVE_BINS' as const,
          bin_code: transportForm.binCode.trim(),
          source: isBinReturnTransport.value
            ? { kind: 'HANDOFF_POSITION', location_code: transportForm.sourceLocation.trim() }
            : {
                kind: 'RACK_BIN_SLOT',
                rack_id: rackId,
                rack_face: transportForm.rackFace.trim(),
                slot_id: transportForm.slotId.trim()
              },
          target: isBinReturnTransport.value
            ? {
                kind: 'RACK_BIN_SLOT',
                rack_id: rackId,
                rack_face: transportForm.rackFace.trim(),
                slot_id: transportForm.slotId.trim()
              }
            : { kind: 'HANDOFF_POSITION', location_code: transportForm.targetLocation.trim() }
        }
      }
      return isRackDepartureTransport.value
        ? {
            ...common,
            kind: 'MOVE_RACK' as const,
            source: { kind: 'RACK', location_code: rackId },
            target: { kind: 'ZONE', location_code: transportForm.targetLocation.trim() }
          }
        : {
            ...common,
            kind: 'MOVE_RACK' as const,
            source: { kind: 'RACK', location_code: rackId },
            target: { kind: 'RACK_POSITION', location_code: transportForm.targetLocation.trim() },
            target_face: transportForm.targetFace.trim()
          }
    },
    body => api.transport(current.run_id, body)
  )
  transportVisible.value = false
}

async function sendDeviceCommand(): Promise<void> {
  const current = run.value
  if (!current) return
  if (!isSelectedCurrent.value || isClosed.value) {
    ElMessage.warning(`当前应操作 ${phaseLabels[current.current_phase]}`)
    return
  }
  let data: Record<string, unknown>
  try {
    data = parseEditableJsonObject(deviceDataText.value, 'ECS 指令')
  } catch (error) {
    ElMessage.warning(error instanceof Error ? error.message : String(error))
    return
  }
  const deviceCode = typeof data.device_code === 'string' ? data.device_code : ''
  if (current.profile !== 'CONTRACT_SIMULATION') {
    await ElMessageBox.confirm(
      `将向已登记设备 ${deviceCode || '（未填写）'} 创建真实 DeviceCommand，请确认设备可执行。`,
      '确认真实 ECS 指令',
      { type: 'warning', confirmButtonText: '创建命令' }
    )
  }
  await invokeStableAction(
    current,
    'device-command',
    () =>
      versioned(current, {
        client_request_id: createUuid7(),
        device_code: data.device_code,
        task_type: data.task_type,
        params: data.params,
        timeout_ms: data.timeout_ms,
        reason: data.reason
      }) as DeviceActionInput,
    body => api.deviceCommand(current.run_id, body)
  )
  deviceVisible.value = false
}

async function exportEvidence(): Promise<void> {
  const current = run.value
  if (!current) return
  try {
    const blob = await api.exportEvidence(current.run_id)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `manual-outbound-${current.run_id}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : String(error))
  }
}

async function invoke(
  call: () => Promise<IntegrationRun>,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
): Promise<void> {
  if (busy.value) return
  busy.value = true
  try {
    const snapshot = await call()
    state.accept(snapshot)
    const accepted = state.currentRun.value
    if (accepted?.run_id === snapshot.run_id) selectedPhase.value = accepted.current_phase
    onSuccess?.()
  } catch (error) {
    onError?.(error)
    ElMessage.error(error instanceof Error ? error.message : String(error))
  } finally {
    busy.value = false
  }
}

function invokeStableAction<T extends { client_request_id: string }>(
  current: IntegrationRun,
  actionName: string,
  createBody: () => T,
  send: (body: T) => Promise<IntegrationRun>
): Promise<void> {
  const key = `${current.run_id}:${current.current_phase}:${actionName}`
  const body = (pendingActionBodies.get(key) as T | undefined) ?? createBody()
  pendingActionBodies.set(key, body)
  return invoke(
    () => send(body),
    () => pendingActionBodies.delete(key),
    error => {
      if (!isUncertainDelivery(error)) pendingActionBodies.delete(key)
    }
  )
}

function isUncertainDelivery(error: unknown): boolean {
  if (error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError'))
    return true
  return (
    error instanceof Error &&
    /timeout|network|failed to fetch|服务器响应格式错误/i.test(error.message)
  )
}

function versioned<T extends Record<string, unknown> = Record<never, never>>(
  current: IntegrationRun,
  extra?: T
): { expected_version: number } & T {
  return { expected_version: current.version, ...extra } as { expected_version: number } & T
}

function stepIdentity(step: IntegrationRunStep): string {
  return (
    step.operation_id ||
    step.transport_task_id ||
    step.device_command_code ||
    step.client_request_id ||
    '—'
  )
}

function wmsResponseResult(step: IntegrationRunStep): unknown {
  if (typeof step.result.response_result === 'string') return step.result.response_result
  const data = step.result.data
  return data && typeof data === 'object' ? (data as Record<string, unknown>).result : undefined
}

let unmounted = false
onMounted(async () => {
  await state.load()
  if (unmounted) return
  if (run.value) selectedPhase.value = run.value.current_phase
  state.connect()
})
onUnmounted(() => {
  unmounted = true
  state.disconnect()
})
</script>

<template>
  <main class="integration-console">
    <header class="run-bar">
      <div>
        <p class="eyebrow">MANUAL OUTBOUND / 临时联调能力</p>
        <h1>手工出库联调台</h1>
      </div>
      <div class="run-facts">
        <span>{{ run?.workline_code ?? '未创建' }}</span>
        <span>{{ run?.profile ?? createForm.profile }}</span>
        <span :class="['run-status', `is-${run?.status?.toLowerCase()}`]">
          {{ run?.status ?? 'READY' }}
        </span>
        <span>● {{ state.connectionState.value }}</span>
      </div>
      <div class="bar-actions">
        <el-select
          v-if="state.runs.value.length"
          :model-value="run?.run_id"
          aria-label="选择联调 Run"
          @change="selectRun"
        >
          <el-option
            v-for="item in state.runs.value"
            :key="item.run_id"
            :label="`${item.workline_code} · ${item.status} · ${item.run_id.slice(-8)}`"
            :value="item.run_id"
          />
        </el-select>
        <el-button @click="state.load">刷新</el-button>
        <el-button
          v-if="run && permissionAccess.export"
          @click="exportEvidence"
        >
          导出证据
        </el-button>
        <el-button
          v-if="run && !isClosed && permissionAccess.takeover"
          @click="takeoverRun"
        >
          接管操作权
        </el-button>
        <el-button
          v-if="canCloseRun && (hasRefreshableStep || isEmptyWaitingRun) && permissionAccess.close"
          @click="openCloseRun"
        >
          关闭 Run
        </el-button>
      </div>
    </header>

    <p
      v-if="state.hasGap.value"
      class="gap-notice"
    >
      △ SSE 断开期间可能存在记录间隙；页面已保留间隙标记，请点击刷新从数据库重载。
    </p>
    <el-alert
      v-if="state.lastError.value"
      :title="state.lastError.value.message"
      type="error"
      :closable="false"
    />

    <section class="site-configuration">
      <strong>KT16 现场参数</strong>
      <span>出库：CTU01 · 货架号 → OUT65 / KT16 / KT17</span>
      <span>回库：CTU03 · 货架号 → WH05（五层货架）</span>
      <span>料箱：CNV0301 → SCAN9/10/11/12 → CNV0302</span>
      <span>ECS：{{ manualOutboundSite.ecsEndpoint }}</span>
    </section>

    <section
      v-if="!run || isClosed"
      class="create-strip"
      aria-label="创建联调 Run"
    >
      <label>
        WorkLine code
        <el-input v-model="createForm.workline_code" />
      </label>
      <label>
        档位
        <el-select v-model="createForm.profile">
          <el-option
            label="合同模拟"
            value="CONTRACT_SIMULATION"
          />
          <el-option
            label="真实 ECS"
            value="DEVICE_INTEGRATION"
          />
          <el-option
            label="真实 RCS + ECS"
            value="FULL_SITE_INTEGRATION"
          />
        </el-select>
      </label>
      <label>
        环境
        <el-input v-model="createForm.environment_label" />
      </label>
      <label>
        已登记 device_code
        <el-select v-model="createForm.device_code">
          <el-option
            v-for="item in manualOutboundSite.scanDeviceCodes"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </label>
      <el-button
        type="primary"
        :disabled="!canCreate || busy"
        @click="createRun"
      >
        创建联调 Run
      </el-button>
    </section>

    <div
      v-if="run"
      class="workbench"
    >
      <aside class="phase-rail">
        <h2>固定流程</h2>
        <ol>
          <li
            v-for="(phase, index) in phases"
            :key="phase"
            :class="[phaseState(phase), { selected: selectedPhase === phase }]"
          >
            <button
              type="button"
              class="phase-node"
              @click="selectPhase(phase)"
            >
              <span>{{ index + 1 }}</span>
              <span class="phase-node-copy">
                <strong>{{ phaseLabels[phase] }}</strong>
                <small>{{ phaseInteractions[phase].direction }}</small>
              </span>
            </button>
          </li>
        </ol>
      </aside>

      <section class="action-pane">
        <div class="interaction-heading">
          <div>
            <p class="phase-code">{{ selectedPhase }}</p>
            <h2>{{ phaseLabels[selectedPhase] }}</h2>
          </div>
          <span class="interaction-direction">{{ selectedInteraction.direction }}</span>
        </div>
        <code class="interaction-operation">{{ selectedInteraction.operation }}</code>
        <p class="phase-help">
          页面只记录 WES 可证明的请求、Evidence 和人工确认；HTTP 成功不代表设备已完成物理动作。
        </p>

        <label v-if="selectedPhase === 'BIND_TASK'">
          WMS task_id
          <el-input
            v-model="taskId"
            placeholder="已由 outbound.picking_task_issued@v1 接收"
          />
        </label>
        <template v-if="selectedPhase === 'POINT2_SCAN'">
          <label>
            point2 实际 bin_code
            <el-input
              v-model="binCode"
              placeholder="以现场扫码为准"
            />
          </label>
          <label>
            scanned_at（Unix ms）
            <el-input-number
              v-model="scanTimestamp"
              :min="1"
              :controls="false"
            />
          </label>
        </template>
        <label v-if="selectedPhase === 'WORK_COMPLETION'">
          WMS work_completed operation_id
          <el-input
            v-model="completionOperationId"
            placeholder="从右侧 Evidence 时间线复制"
          />
        </label>
        <section
          v-if="selectedIsWmsOutbound"
          class="editable-payload"
        >
          <div class="editable-payload-heading">
            <div>
              <strong>WMS data JSON</strong>
              <small>
                发送前可编辑；task、bin、workline 等 Run
                绑定身份必须一致，operation、operation_id、timestamp 由 WES 生成并冻结。
              </small>
            </div>
            <el-button
              size="small"
              @click="resetWmsData"
            >
              恢复默认
            </el-button>
          </div>
          <el-input
            v-model="wmsDataText"
            type="textarea"
            :rows="12"
            spellcheck="false"
          />
        </section>
        <label
          v-if="
            [
              'RACK_TRANSPORT',
              'RACK_ARRIVAL',
              'BIN_TRANSPORT',
              'POINT1_ARRIVAL',
              'POINT2_RELEASE',
              'POINT3_ROUTE',
              'RETURN_BUFFER',
              'BIN_RETURN_TRANSPORT'
            ].includes(selectedPhase) ||
            (selectedPhase === 'RACK_DEPARTURE' && !!rackDepartureStep)
          "
        >
          现场确认记录
          <el-input v-model="phaseNote" />
        </label>

        <el-button
          v-if="isSelectedCurrent && !isClosed"
          type="primary"
          size="large"
          :loading="busy"
          :disabled="!hasPrimaryPermission"
          @click="primaryAction"
        >
          {{ primaryLabel }}
        </el-button>
        <p
          v-else
          class="node-readonly-note"
        >
          <template v-if="isClosed || phaseState(selectedPhase) === 'done'">
            该节点用于查看已记录的交互参数和结果。
          </template>
          <template v-else-if="phaseState(selectedPhase) === 'skipped'">
            当前业务分支未执行该节点。
          </template>
          <template v-else>
            当前流程位于「{{
              phaseLabels[run.current_phase]
            }}」。这里可先调整参数，流程到达后才能发送。
          </template>
        </p>

        <div class="manual-tools">
          <h3>节点联调工具</h3>
          <p>每次点击只创建一个任务；重复请求保留同一身份。真实动作会再次确认。</p>
          <el-button
            v-if="
              !!run.task_id &&
              !['BIND_TASK', 'TASK_PREPARE', 'CLEANUP'].includes(run.current_phase) &&
              !isClosed
            "
            :disabled="!permissionAccess.refreshPlan"
            @click="refreshPlanResources"
          >
            同步最新 plan_delta
          </el-button>
          <el-button
            v-if="
              [
                'RACK_TRANSPORT',
                'BIN_TRANSPORT',
                'BIN_RETURN_TRANSPORT',
                'RACK_DEPARTURE'
              ].includes(selectedPhase)
            "
            :disabled="!permissionAccess.transport"
            @click="openTransport"
          >
            Transport / RCS
          </el-button>
          <el-button
            v-if="['POINT2_RELEASE', 'POINT3_ROUTE'].includes(selectedPhase)"
            :disabled="!permissionAccess.deviceCommand"
            @click="openDevice"
          >
            ECS 指令
          </el-button>
          <el-button
            v-if="canReportAttention"
            type="warning"
            :disabled="!permissionAccess.completionApplyReport"
            @click="reportAttention"
          >
            上报 RECONCILING
          </el-button>
        </div>

        <section class="node-payloads">
          <h3>该节点已记录的交互参数</h3>
          <p v-if="!selectedSteps.length">尚无请求或结果记录。</p>
          <article
            v-for="step in selectedSteps"
            :key="`${step.ordinal}-${step.created_at}`"
            class="node-step"
          >
            <header>
              <strong>{{ step.operation ?? selectedInteraction.operation }}</strong>
              <span>{{ step.status }}</span>
            </header>
            <code>{{ stepIdentity(step) }}</code>
            <div class="payload-grid">
              <div>
                <b>request</b>
                <pre>{{ JSON.stringify(step.request ?? {}, null, 2) }}</pre>
              </div>
              <div>
                <b>result</b>
                <pre>{{ JSON.stringify(step.result ?? {}, null, 2) }}</pre>
              </div>
            </div>
          </article>
        </section>

        <dl class="bound-values">
          <div>
            <dt>task_id</dt>
            <dd>{{ run.task_id ?? '—' }}</dd>
          </div>
          <div>
            <dt>bin_code</dt>
            <dd>{{ run.bin_code ?? '—' }}</dd>
          </div>
          <div>
            <dt>plan revision</dt>
            <dd>{{ run.plan_resources?.plan_revision ?? '—' }}</dd>
          </div>
          <div>
            <dt>device_code</dt>
            <dd>{{ run.device_code ?? '—' }}</dd>
          </div>
        </dl>
        <section
          v-if="run.plan_resources"
          class="wms-guide"
        >
          <h3>plan_delta 任务资源</h3>
          <p>
            目标架：{{ run.plan_resources.target_rack.rack_id }} /
            {{ run.plan_resources.target_rack.rack_face }}
          </p>
          <p
            v-for="rack in run.plan_resources.bin_source_racks"
            :key="`${rack.rack_id}-${rack.rack_face}`"
          >
            五层料箱架：{{ rack.rack_id }} / {{ rack.rack_face }}
          </p>
        </section>
      </section>

      <aside class="evidence-pane">
        <h2>证据与身份</h2>
        <div class="diagnostic-links">
          <router-link to="/ops/wms-diagnostics">WMS 诊断</router-link>
          <router-link to="/ops/transport-diagnostics">Transport 诊断</router-link>
          <router-link to="/ops/device-diagnostics">ECS 诊断</router-link>
        </div>
        <ol class="timeline">
          <li
            v-for="step in run.steps"
            :key="`${step.ordinal}-${step.created_at}`"
          >
            <div>
              <strong>{{ phaseLabels[step.phase] }}</strong>
              <span>{{ step.status }}</span>
            </div>
            <code>{{ stepIdentity(step) }}</code>
            <small>{{ step.created_at }}</small>
            <span
              v-if="step.reason_code"
              class="attention"
            >
              {{ step.reason_code }}
            </span>
          </li>
        </ol>
        <section class="wms-guide">
          <h3>给 WMS C# 开发</h3>
          <p>
            <b>发送：</b>
            outbound.picking_task.issued@v1；收到 RECEIVED 后仍须等待页面选择。
          </p>
          <p>
            <b>接收：</b>
            outbound.picking_task.prepare@v1；立即返回 HTTP 202、PREPARE_ACCEPTED、相同
            operation_id、data={}。 WMS 内部计算完成后，再以新的 operation_id 发送 plan_delta。
          </p>
          <p>
            <b>prepare 异常恢复：</b>
            WMS 先按原 operation_id 作废或清理请求，并保证不再发送对应
            plan_delta；随后由本页面使用新 operation_id 重发。禁止修改旧 operation_id 的响应正文。
          </p>
          <p>
            <b>发送：</b>
            outbound.picking_task.plan_delta@v1；plan_revision 必须连续，初始 revision=1。
          </p>
          <p>
            <b>接收：</b>
            outbound.bin.inbound_batch@v1、outbound.bin.return_batch@v1。
          </p>
          <p>
            <b>接收：</b>
            POST /api/v1/wes/decisions · work_admission_decide@v1
          </p>
          <p>
            <b>发送：</b>
            POST /api/v1/wms/events · work_completed@v1
          </p>
          <p>
            <b>接收：</b>
            POST /api/v1/wes/facts · completion_apply_report@v1
          </p>
          <p>
            <b>WAIT：</b>
            当前请求已结束；按 retry_after_ms 等待后，使用新的 operation_id 重新求值。
          </p>
          <p>
            <b>HTTP 503 / UNAVAILABLE：</b>
            保留原 operation_id 和完全相同的 JSON body 重试。
          </p>
          <p>
            <b>HTTP 409 / CONFLICT：</b>
            核对同一 operation_id 的字段、空值、数字类型和大小写，禁止换 ID 掩盖内容漂移。
          </p>
          <p>
            <b>RECEIVED：</b>
            只证明 WES 已提交 Evidence；继续等应用结果，不能据此认定设备或业务完成。
          </p>
          <p>
            <b>接收：</b>
            outbound.rack.departure_decide@v1、outbound.picking_task.completion_confirm@v1。
          </p>
        </section>
      </aside>
    </div>

    <el-dialog
      v-model="transportVisible"
      title="创建 Transport 动作"
      width="min(620px, 92vw)"
    >
      <el-form label-position="top">
        <el-form-item label="plan_delta rack_id">
          <el-input
            v-model="transportForm.rackId"
            @input="applyRackPreset"
          />
        </el-form-item>
        <el-form-item label="动作">
          <el-select v-model="transportForm.kind">
            <el-option
              label="移动货架"
              value="MOVE_RACK"
            />
            <el-option
              label="旋转货架"
              value="ROTATE_RACK"
            />
            <el-option
              label="移动料箱"
              value="MOVE_BINS"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="
            transportForm.kind === 'MOVE_RACK'
              ? '来源货架号'
              : isBinReturnTransport
                ? '出料口编码'
                : 'source location'
          "
        >
          <el-input
            v-model="transportForm.sourceLocation"
            :disabled="transportForm.kind === 'MOVE_RACK'"
          />
        </el-form-item>
        <el-form-item
          v-if="transportForm.kind !== 'ROTATE_RACK' && !isBinReturnTransport"
          :label="isRackDepartureTransport ? '回库库区代码' : '目标工作位/投料口'"
        >
          <el-input v-model="transportForm.targetLocation" />
        </el-form-item>
        <template v-if="transportForm.kind === 'MOVE_BINS'">
          <el-form-item label="bin_code"><el-input v-model="transportForm.binCode" /></el-form-item>
          <el-form-item label="rack_face">
            <el-input v-model="transportForm.rackFace" />
          </el-form-item>
          <el-form-item label="slot_id"><el-input v-model="transportForm.slotId" /></el-form-item>
        </template>
        <el-form-item
          v-else
          label="target_face"
        >
          <el-input v-model="transportForm.targetFace" />
        </el-form-item>
        <el-form-item label="RCS template">
          <el-select v-model="transportForm.rcsTemplateId">
            <el-option
              v-for="item in ['CTU01', 'CTU02', 'CTU03', 'F01']"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transportVisible = false">取消</el-button>
        <el-button
          :disabled="!isSelectedCurrent || isClosed || !permissionAccess.transport"
          @click="sendTransport"
        >
          创建一个任务
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="deviceVisible"
      title="创建 ECS 指令"
      width="min(620px, 92vw)"
    >
      <p>
        endpoint 由所选 device_code 的 WES 设备登记信息解析；联调服务器应配置为
        <code>{{ manualOutboundSite.ecsEndpoint }}</code>
        。
      </p>
      <p>
        可编辑 device_code、task_type、params、timeout_ms 和
        reason；client_request_id、command_code、timestamp、is_debug 由 WES 生成。
      </p>
      <el-input
        v-model="deviceDataText"
        type="textarea"
        :rows="14"
        spellcheck="false"
      />
      <template #footer>
        <el-button @click="deviceVisible = false">取消</el-button>
        <el-button
          :disabled="!isSelectedCurrent || isClosed || !permissionAccess.deviceCommand"
          @click="sendDeviceCommand"
        >
          创建一个命令
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="closeVisible"
      title="人工清理确认"
      width="min(560px, 92vw)"
    >
      <p>本页面不清理 WMS 数据，也不替代现场物理清理。</p>
      <el-checkbox v-model="cleanup.wms">
        WMS 团队已自行清理测试单据/状态，或确认无需清理
      </el-checkbox>
      <el-checkbox v-model="cleanup.site">现场人员已清理物料、料箱、货架并确认设备安全</el-checkbox>
      <template #footer>
        <el-button @click="closeVisible = false">取消</el-button>
        <el-button
          :disabled="!cleanup.wms || !cleanup.site"
          @click="closeRun"
        >
          记录并关闭
        </el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped src="./manual-outbound-integration.css"></style>
