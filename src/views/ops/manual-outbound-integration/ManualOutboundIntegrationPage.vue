<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermission } from '@/composables/usePermission'
import { createUuid7 } from '@/utils/uuid7'
import {
  worklineIntegrationDebugApi as api,
  type IntegrationPhase,
  type IntegrationProfile,
  type IntegrationRun,
  type IntegrationRunStep,
  type TransportActionInput
} from '@/api/modules/worklineIntegrationDebug'
import { useManualOutboundIntegration } from './useManualOutboundIntegration'

const sorting3Site = {
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
const busy = ref(false)
const taskId = ref('')
const binCode = ref('')
const completionOperationId = ref('')
const batchRackId = ref('')
const batchRackFace = ref('')
const maxBinCount = ref(1)
const returnSourceLocation = ref(sorting3Site.outfeedPosition)
const rackCurrentLocation = ref(sorting3Site.outboundTransferPosition)
const rackCurrentFace = ref('0')
const scanTimestamp = ref(Date.now())
const applyRevision = ref(1)
const applyResult = ref<'APPLIED' | 'RECONCILING'>('APPLIED')
const applyReasonCode = ref<
  | ''
  | 'RESULT_CONFLICT'
  | 'FIRST_COMPLETION_OUT_OF_WINDOW'
  | 'POINT2_BINDING_MISMATCH'
  | 'WORKLINE_NOT_ACTIVE'
  | 'COMPLETED_AT_INVALID'
  | 'DEVICE_COMMAND_IDENTITY_CONFLICT'
>('')
const applyOccurredAt = ref(Date.now())
const phaseNote = ref('现场已核对并完成该步骤')
const closeVisible = ref(false)
const transportVisible = ref(false)
const deviceVisible = ref(false)
const cleanup = reactive({ wms: false, site: false })
const createForm = reactive({
  workline_code: 'sorting-3',
  profile: 'CONTRACT_SIMULATION' as IntegrationProfile,
  environment_label: 'integration',
  device_code: 'STATION_SCAN12',
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
const deviceForm = reactive({
  deviceCode: 'STATION_SCAN12',
  taskType: '',
  paramsText: '{}',
  timeoutMs: 30000,
  reason: '人工出库现场联调'
})

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
  'COMPLETION_REPORT',
  'POINT2_RELEASE',
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
const isClosed = computed(() => run.value?.status === 'CLOSED_BY_OPERATOR')
const isBinReturnTransport = computed(() => selectedPhase.value === 'BIN_RETURN_TRANSPORT')
const isRackDepartureTransport = computed(() => selectedPhase.value === 'RACK_DEPARTURE')
const selectedInteraction = computed(() => phaseInteractions[selectedPhase.value])
const selectedSteps = computed(() =>
  (run.value?.steps ?? []).filter(step => step.phase === selectedPhase.value)
)
const isSelectedCurrent = computed(() => selectedPhase.value === run.value?.current_phase)
const canCreate = computed(() => hasPermission('ops:workline-integration-debug:create'))
const lastWaitingWmsStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.wms_confirmation_id && step.status === 'WAITING')
)
const lastWaitingTransportStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(step => step.transport_task_id && step.status === 'WAITING')
)
const rackDepartureStep = computed(() =>
  [...(run.value?.steps ?? [])]
    .reverse()
    .find(
      step => step.operation === 'outbound.rack.departure_decide@v1' && step.status === 'SUCCEEDED'
    )
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
const primaryLabel = computed(() => {
  if (!run.value) return '创建联调 Run'
  if (run.value.status === 'COMPLETED' || run.value.status === 'NEEDS_ATTENTION')
    return '确认清理并关闭'
  if (lastWaitingWmsStep.value) return '刷新 WMS 结果'
  if (lastWaitingTransportStep.value) return '刷新 Transport 结果'
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
const primaryPermission = computed(() => {
  if (!run.value) return 'ops:workline-integration-debug:create'
  if (run.value.status === 'COMPLETED' || run.value.status === 'NEEDS_ATTENTION')
    return 'ops:workline-integration-debug:close'
  if (lastWaitingWmsStep.value) return 'ops:workline-integration-debug:refresh-wms'
  if (lastWaitingTransportStep.value) return 'ops:workline-integration-debug:refresh-transport'
  return {
    BIND_TASK: 'ops:workline-integration-debug:bind-task',
    TASK_PREPARE: 'ops:workline-integration-debug:prepare-task',
    PLAN_RECEIPT: 'ops:workline-integration-debug:refresh-plan',
    RACK_TRANSPORT: 'ops:workline-integration-debug:confirm-phase',
    RACK_ARRIVAL: 'ops:workline-integration-debug:confirm-phase',
    BIN_INBOUND_BATCH: 'ops:workline-integration-debug:bin-inbound-batch',
    BIN_TRANSPORT: 'ops:workline-integration-debug:confirm-phase',
    POINT1_ARRIVAL: 'ops:workline-integration-debug:confirm-phase',
    POINT2_SCAN: 'ops:workline-integration-debug:point2-scan',
    WORK_ADMISSION: 'ops:workline-integration-debug:work-admission',
    WORK_COMPLETION: 'ops:workline-integration-debug:bind-completion',
    POINT2_RELEASE: 'ops:workline-integration-debug:confirm-phase',
    POINT3_ROUTE: 'ops:workline-integration-debug:confirm-phase',
    RETURN_BUFFER: 'ops:workline-integration-debug:confirm-phase',
    BIN_RETURN_BATCH: 'ops:workline-integration-debug:bin-return-batch',
    BIN_RETURN_TRANSPORT: 'ops:workline-integration-debug:confirm-phase',
    RACK_DEPARTURE: rackDepartureStep.value
      ? 'ops:workline-integration-debug:confirm-phase'
      : 'ops:workline-integration-debug:rack-departure',
    TASK_COMPLETION: 'ops:workline-integration-debug:task-completion',
    COMPLETION_REPORT: 'ops:workline-integration-debug:completion-apply-report',
    CLEANUP: 'ops:workline-integration-debug:complete'
  }[run.value.current_phase]
})

function phaseState(phase: IntegrationPhase): 'pending' | 'current' | 'done' | 'attention' {
  const current = run.value
  if (!current) return 'pending'
  const steps = current.steps.filter(step => step.phase === phase)
  if (steps.some(step => step.status === 'NEEDS_ATTENTION')) return 'attention'
  if (current.status === 'CLOSED_BY_OPERATOR') return 'done'
  if (phase === current.current_phase) return 'current'
  if (
    steps.some(step => step.status === 'SUCCEEDED') ||
    phases.indexOf(phase) < phases.indexOf(current.current_phase)
  )
    return 'done'
  return 'pending'
}

function selectPhase(phase: IntegrationPhase): void {
  selectedPhase.value = phase
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
  if (current.status === 'COMPLETED' || current.status === 'NEEDS_ATTENTION') {
    closeVisible.value = true
    return
  }
  if (lastWaitingWmsStep.value?.client_request_id) {
    return invoke(() =>
      api.refreshWms(current.run_id, {
        expected_version: current.version,
        client_request_id: lastWaitingWmsStep.value!.client_request_id!
      })
    )
  }
  if (lastWaitingTransportStep.value?.client_request_id) {
    return invoke(() =>
      api.refreshTransport(current.run_id, {
        expected_version: current.version,
        client_request_id: lastWaitingTransportStep.value!.client_request_id!
      })
    )
  }
  switch (current.current_phase) {
    case 'BIND_TASK':
      return invoke(() =>
        api.bindTask(current.run_id, versioned(current, { task_id: taskId.value.trim() }))
      )
    case 'TASK_PREPARE':
      return invoke(() =>
        api.prepareTask(current.run_id, versioned(current, { client_request_id: createUuid7() }))
      )
    case 'PLAN_RECEIPT':
      return invoke(() => api.refreshPlan(current.run_id, versioned(current)))
    case 'BIN_INBOUND_BATCH':
      return invoke(() =>
        api.binInboundBatch(
          current.run_id,
          versioned(current, {
            client_request_id: createUuid7(),
            rack_id: batchRackId.value.trim(),
            rack_face: batchRackFace.value.trim(),
            max_bin_count: maxBinCount.value
          })
        )
      )
    case 'POINT2_SCAN':
      return invoke(() =>
        api.point2Scan(
          current.run_id,
          versioned(current, { bin_code: binCode.value.trim(), scanned_at: scanTimestamp.value })
        )
      )
    case 'WORK_ADMISSION':
      return invoke(() =>
        api.workAdmission(current.run_id, versioned(current, { client_request_id: createUuid7() }))
      )
    case 'WORK_COMPLETION':
      return invoke(() =>
        api.bindCompletion(
          current.run_id,
          versioned(current, { operation_id: completionOperationId.value.trim() })
        )
      )
    case 'BIN_RETURN_BATCH':
      return invoke(() =>
        api.binReturnBatch(
          current.run_id,
          versioned(current, {
            client_request_id: createUuid7(),
            rack_id: batchRackId.value.trim(),
            rack_face: batchRackFace.value.trim(),
            source_location_code: returnSourceLocation.value.trim()
          })
        )
      )
    case 'RACK_DEPARTURE':
      if (rackDepartureStep.value) return confirmPhase(current)
      return invoke(() =>
        api.rackDeparture(
          current.run_id,
          versioned(current, {
            client_request_id: createUuid7(),
            rack_id: batchRackId.value.trim(),
            current_location_code: rackCurrentLocation.value.trim(),
            current_face: rackCurrentFace.value.trim()
          })
        )
      )
    case 'TASK_COMPLETION':
      return invoke(() =>
        api.taskCompletion(current.run_id, versioned(current, { client_request_id: createUuid7() }))
      )
    case 'COMPLETION_REPORT':
      if (boundCompletion.value?.operation_id && !applyReportStep.value) {
        return invoke(() =>
          api.completionApplyReport(
            current.run_id,
            versioned(current, {
              client_request_id: createUuid7(),
              completion_operation_id: boundCompletion.value!.operation_id!,
              apply_revision: applyRevision.value,
              apply_result: applyResult.value,
              ...(applyReasonCode.value ? { reason_code: applyReasonCode.value } : {}),
              occurred_at: applyOccurredAt.value
            })
          )
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
    transportForm.targetLocation = sorting3Site.outboundTransferPosition
    transportForm.targetFace = current.plan_resources.target_rack.rack_face
    return
  }
  const rackIndex =
    current.plan_resources?.bin_source_racks.findIndex(item => item.rack_id === rackId) ?? -1
  transportForm.targetLocation =
    sorting3Site.binRackPositions[Math.max(0, Math.min(rackIndex, 1))] ??
    sorting3Site.binRackPositions[0]
  transportForm.targetFace =
    current.plan_resources?.bin_source_racks.find(item => item.rack_id === rackId)?.rack_face ?? ''
}

function openTransport(): void {
  const current = run.value
  if (!current) return
  if (selectedPhase.value === 'RACK_TRANSPORT') {
    transportForm.kind = 'MOVE_RACK'
    transportForm.rackId = current.plan_resources?.target_rack.rack_id ?? ''
    transportForm.rcsTemplateId = sorting3Site.outboundRcsTemplate
    applyRackPreset()
  } else if (selectedPhase.value === 'RACK_DEPARTURE') {
    transportForm.kind = 'MOVE_RACK'
    transportForm.rackId =
      batchRackId.value.trim() || current.plan_resources?.target_rack.rack_id || ''
    transportForm.sourceLocation = transportForm.rackId
    transportForm.targetLocation = sorting3Site.returnZoneCode
    transportForm.targetFace = ''
    transportForm.rcsTemplateId = sorting3Site.returnRcsTemplate
  } else {
    transportForm.kind = 'MOVE_BINS'
    transportForm.rackId =
      batchRackId.value.trim() || current.plan_resources?.bin_source_racks[0]?.rack_id || ''
    transportForm.sourceLocation = sorting3Site.outfeedPosition
    transportForm.targetLocation = sorting3Site.infeedPosition
    transportForm.rcsTemplateId = sorting3Site.outboundRcsTemplate
  }
  transportVisible.value = true
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
  const common = {
    client_request_id: createUuid7(),
    kind: transportForm.kind,
    rack_id: rackId,
    rcs_template_id: transportForm.rcsTemplateId,
    expected_version: current.version
  }
  let action: TransportActionInput
  if (transportForm.kind === 'ROTATE_RACK') {
    action = {
      ...common,
      kind: 'ROTATE_RACK',
      source: { kind: 'RACK_POSITION', location_code: transportForm.sourceLocation.trim() },
      target_face: transportForm.targetFace.trim()
    }
  } else if (transportForm.kind === 'MOVE_BINS') {
    action = {
      ...common,
      kind: 'MOVE_BINS',
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
  } else {
    action = isRackDepartureTransport.value
      ? {
          ...common,
          kind: 'MOVE_RACK',
          source: { kind: 'RACK', location_code: rackId },
          target: { kind: 'ZONE', location_code: transportForm.targetLocation.trim() }
        }
      : {
          ...common,
          kind: 'MOVE_RACK',
          source: { kind: 'RACK', location_code: rackId },
          target: { kind: 'RACK_POSITION', location_code: transportForm.targetLocation.trim() },
          target_face: transportForm.targetFace.trim()
        }
  }
  await invoke(() => api.transport(current.run_id, action))
  transportVisible.value = false
}

async function sendDeviceCommand(): Promise<void> {
  const current = run.value
  if (!current) return
  if (!isSelectedCurrent.value || isClosed.value) {
    ElMessage.warning(`当前应操作 ${phaseLabels[current.current_phase]}`)
    return
  }
  let params: Record<string, unknown>
  try {
    const parsed = JSON.parse(deviceForm.paramsText) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    params = parsed as Record<string, unknown>
  } catch {
    ElMessage.warning('ECS params 必须是 JSON object')
    return
  }
  if (current.profile !== 'CONTRACT_SIMULATION') {
    await ElMessageBox.confirm(
      `将向已登记设备 ${deviceForm.deviceCode} 创建真实 DeviceCommand，请确认设备可执行。`,
      '确认真实 ECS 指令',
      { type: 'warning', confirmButtonText: '创建命令' }
    )
  }
  await invoke(() =>
    api.deviceCommand(
      current.run_id,
      versioned(current, {
        client_request_id: createUuid7(),
        device_code: deviceForm.deviceCode,
        task_type: deviceForm.taskType.trim(),
        params,
        timeout_ms: deviceForm.timeoutMs,
        reason: deviceForm.reason.trim()
      })
    )
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

async function invoke(call: () => Promise<IntegrationRun>): Promise<void> {
  if (busy.value) return
  busy.value = true
  try {
    const snapshot = await call()
    state.accept(snapshot)
    selectedPhase.value = snapshot.current_phase
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : String(error))
  } finally {
    busy.value = false
  }
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

onMounted(async () => {
  await state.load()
  if (run.value) selectedPhase.value = run.value.current_phase
  state.connect()
})
onUnmounted(state.disconnect)
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
          v-if="run && hasPermission('ops:workline-integration-debug:export')"
          @click="exportEvidence"
        >
          导出证据
        </el-button>
        <el-button
          v-if="run && !isClosed && hasPermission('ops:workline-integration-debug:takeover')"
          @click="takeoverRun"
        >
          接管操作权
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
      <strong>sorting-3 现场参数</strong>
      <span>出库：CTU01 · 货架号 → OUT65 / KT16 / KT17</span>
      <span>回库：CTU03 · 货架号 → WH05（五层货架）</span>
      <span>料箱：CNV0301 → SCAN9/10/11/12 → CNV0302</span>
      <span>ECS：{{ sorting3Site.ecsEndpoint }}</span>
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
            v-for="item in sorting3Site.scanDeviceCodes"
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
        <template v-if="['BIN_INBOUND_BATCH', 'BIN_RETURN_BATCH'].includes(selectedPhase)">
          <label>
            五层货架 rack_id
            <el-input
              v-model="batchRackId"
              placeholder="必须来自 plan_delta.bin_source_racks"
            />
          </label>
          <label>
            rack_face
            <el-input
              v-model="batchRackFace"
              placeholder="必须与 plan_delta 一致"
            />
          </label>
        </template>
        <label v-if="selectedPhase === 'BIN_INBOUND_BATCH'">
          max_bin_count（WMS 本次最多分配数）
          <el-input-number
            v-model="maxBinCount"
            :min="1"
            :max="4"
          />
        </label>
        <label v-if="selectedPhase === 'BIN_RETURN_BATCH'">
          回流缓存 location_code
          <el-input v-model="returnSourceLocation" />
        </label>
        <template v-if="selectedPhase === 'COMPLETION_REPORT'">
          <label>
            apply_revision
            <el-input-number
              v-model="applyRevision"
              :min="1"
            />
          </label>
          <label>
            apply_result
            <el-select v-model="applyResult">
              <el-option
                label="APPLIED"
                value="APPLIED"
              />
              <el-option
                label="RECONCILING"
                value="RECONCILING"
              />
            </el-select>
          </label>
          <label>
            reason_code
            <el-select
              v-model="applyReasonCode"
              clearable
              placeholder="APPLIED 时可留空"
            >
              <el-option
                v-for="item in [
                  'RESULT_CONFLICT',
                  'FIRST_COMPLETION_OUT_OF_WINDOW',
                  'POINT2_BINDING_MISMATCH',
                  'WORKLINE_NOT_ACTIVE',
                  'COMPLETED_AT_INVALID',
                  'DEVICE_COMMAND_IDENTITY_CONFLICT'
                ]"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </label>
          <label>
            occurred_at（Unix ms）
            <el-input-number
              v-model="applyOccurredAt"
              :min="1"
              :controls="false"
            />
          </label>
        </template>
        <template v-if="selectedPhase === 'RACK_DEPARTURE' && !rackDepartureStep">
          <label>
            离场货架 rack_id
            <el-input v-model="batchRackId" />
          </label>
          <label>
            当前货架位置
            <el-input v-model="rackCurrentLocation" />
          </label>
          <label>
            当前朝向
            <el-input v-model="rackCurrentFace" />
          </label>
        </template>
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
          :disabled="!hasPermission(primaryPermission)"
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
              [
                'RACK_TRANSPORT',
                'BIN_TRANSPORT',
                'BIN_RETURN_TRANSPORT',
                'RACK_DEPARTURE'
              ].includes(selectedPhase)
            "
            :disabled="!hasPermission('ops:workline-integration-debug:transport')"
            @click="openTransport"
          >
            Transport / RCS
          </el-button>
          <el-button
            :disabled="!hasPermission('ops:workline-integration-debug:device-command')"
            @click="deviceVisible = true"
          >
            ECS 指令
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
            outbound.picking_task.prepare@v1；返回 PREPARE_ACCEPTED 后再发送 plan_delta。
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
          :disabled="
            !isSelectedCurrent ||
            isClosed ||
            !hasPermission('ops:workline-integration-debug:transport')
          "
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
        <code>{{ sorting3Site.ecsEndpoint }}</code>
        。
      </p>
      <el-form label-position="top">
        <el-form-item label="device_code">
          <el-select v-model="deviceForm.deviceCode">
            <el-option
              v-for="item in sorting3Site.scanDeviceCodes"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="task_type"><el-input v-model="deviceForm.taskType" /></el-form-item>
        <el-form-item label="params JSON object">
          <el-input
            v-model="deviceForm.paramsText"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
        <el-form-item label="timeout_ms">
          <el-input-number
            v-model="deviceForm.timeoutMs"
            :min="100"
            :max="600000"
          />
        </el-form-item>
        <el-form-item label="执行原因"><el-input v-model="deviceForm.reason" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deviceVisible = false">取消</el-button>
        <el-button
          :disabled="
            !isSelectedCurrent ||
            isClosed ||
            !hasPermission('ops:workline-integration-debug:device-command')
          "
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
