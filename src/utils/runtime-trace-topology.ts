import type {
  DiagnosisEvidenceHealthItem,
  RuntimeTracePathResponse,
  TraceBlockingPointResponse,
  TraceCommandItem,
  TraceDetailResponse,
  TraceTimelineItem
} from '@/types/runtime'
import { compactEnumLabel, isFailureStatus } from '@/utils/runtime-display'
import {
  buildRuntimeDiagnosisVerdict,
  type RuntimeDiagnosisVerdictViewModel
} from '@/utils/runtime-diagnosis-verdict'

export type RuntimeTraceTopologyVerdict = 'success' | 'danger' | 'warning' | 'primary' | 'info'
export type RuntimeTraceTopologyNodeState =
  | 'completed'
  | 'final'
  | 'current'
  | 'exception'
  | 'pending'
  | 'unknown'

export interface RuntimeTraceTopologyNode {
  key: string
  deviceCode: string
  deviceName: string
  stepLabel: string
  actionLabel: string
  statusLabel: string
  state: RuntimeTraceTopologyNodeState
  timeline?: TraceTimelineItem | null
  command?: TraceCommandItem | null
}

export interface RuntimeTraceTopologyModel {
  verdict: RuntimeTraceTopologyVerdict
  verdictTitle: string
  verdictDescription: string
  optimisticPathLabel: string
  currentLabel: string
  materialPositionLabel: string
  materialPositionValue: string
  exceptionText: string
  operatorAction: string
  pathNodes: RuntimeTraceTopologyNode[]
  currentNode: RuntimeTraceTopologyNode | null
  exceptionNode: RuntimeTraceTopologyNode | null
  evidenceCounts: Array<{ label: string; value: number }>
  evidenceHealth: DiagnosisEvidenceHealthItem[]
  diagnosis: RuntimeDiagnosisVerdictViewModel
}

export interface BuildRuntimeTraceTopologyOptions {
  detail: TraceDetailResponse
  blockingPoint?: TraceBlockingPointResponse | null
  path?: RuntimeTracePathResponse | null
}

interface DeviceSeed {
  key: string
  deviceCode: string
  deviceName?: string | null
  timeline?: TraceTimelineItem | null
  command?: TraceCommandItem | null
  isCurrent?: boolean
}

function sortTimeline(left: TraceTimelineItem, right: TraceTimelineItem): number {
  return left.seq_no - right.seq_no || left.id - right.id
}

function isCommandTimeline(item: TraceTimelineItem): boolean {
  return item.action_type === 'COMMAND_SENT' && Boolean(item.actor_code)
}

function inferActionFromDeviceCode(deviceCode?: string | null): string | null {
  const normalized = deviceCode?.toUpperCase() ?? ''
  if (normalized.includes('OUTPUT') || normalized.includes('OUT')) {
    return 'PUT_TO_BIN'
  }
  if (normalized.includes('CONVEYOR')) {
    return 'MOVE_FORWARD'
  }
  if (normalized.includes('INPUT') || normalized.includes('IN')) {
    return 'PICK_AND_PUT'
  }
  return null
}

function commandLabel(command?: TraceCommandItem | null, timeline?: TraceTimelineItem | null): string {
  const payloadCommand = timeline?.payload_json?.command_type
  const rawCommand =
    command?.task_type ||
    command?.command_code ||
    (typeof payloadCommand === 'string' ? payloadCommand : null)
  const raw =
    rawCommand ||
    (timeline?.action_type === 'COMMAND_SENT'
      ? inferActionFromDeviceCode(timeline.actor_code)
      : timeline?.action_type)
  return actionLabel(raw)
}

function actionLabel(action?: string | null): string {
  if (!action) {
    return '暂无动作证据'
  }

  const map: Record<string, string> = {
    PICK_AND_PUT: '入料抓取',
    MOVE_FORWARD: '输送前进',
    PUT_TO_BIN: '投放到料箱',
    COMMAND_SENT: '下发动作',
    COMMAND_ACKED: '设备确认',
    COMMAND_COMPLETED: '动作完成',
    COMMAND_FAILED: '动作失败',
    WAIT_STARTED: '等待回报',
    SESSION_COMPLETED: '流程完成'
  }

  return map[action] || compactEnumLabel(action)
}

function isSameDeviceCode(left?: string | null, right?: string | null): boolean {
  return Boolean(left && right && left === right)
}

function statusLabel(timeline?: TraceTimelineItem | null, command?: TraceCommandItem | null): string {
  return compactEnumLabel(command?.status ?? timeline?.status ?? null)
}

function deviceNameFromSeed(seed: DeviceSeed): string {
  return seed.deviceName || seed.deviceCode
}

function addSeed(seeds: DeviceSeed[], seed: DeviceSeed): void {
  const existing = seeds.find(item => item.key === seed.key)
  if (existing) {
    existing.timeline = seed.timeline ?? existing.timeline
    existing.command = seed.command ?? existing.command
    existing.deviceName = seed.deviceName ?? existing.deviceName
    existing.isCurrent = seed.isCurrent ?? existing.isCurrent
    return
  }

  seeds.push(seed)
}

function mergeSeedEvidence(seed: DeviceSeed, evidenceSeeds: DeviceSeed[]): DeviceSeed {
  const evidence = evidenceSeeds.find(item => item.deviceCode === seed.deviceCode)
  if (!evidence) {
    return seed
  }

  return {
    ...seed,
    timeline: seed.timeline ?? evidence.timeline,
    command: seed.command ?? evidence.command
  }
}

function buildSeedsFromPath(
  path: RuntimeTracePathResponse | null | undefined,
  evidenceSeeds: DeviceSeed[]
): DeviceSeed[] {
  const devices = path?.devices ?? []
  if (!devices.length) {
    return []
  }

  return devices.map(node =>
    mergeSeedEvidence(
      {
        key: node.device_code || `device:${node.device_id}`,
        deviceCode: node.device_code || `设备 #${node.device_id}`,
        deviceName: node.device_name,
        command: null,
        timeline: null,
        isCurrent: node.is_current
      },
      evidenceSeeds
    )
  )
}

function buildSeedsFromDetail(detail: TraceDetailResponse): DeviceSeed[] {
  const commandById = new Map(detail.commands.map(command => [command.id, command]))
  const seeds: DeviceSeed[] = []

  for (const item of [...detail.timelines].sort(sortTimeline)) {
    if (!item.actor_code) {
      continue
    }

    addSeed(seeds, {
      key: item.actor_code,
      deviceCode: item.actor_code,
      timeline: item,
      command: item.related_command_id ? commandById.get(item.related_command_id) : null
    })
  }

  for (const outbox of detail.outboxes) {
    if (!outbox.target_code) {
      continue
    }
    addSeed(seeds, {
      key: outbox.target_code,
      deviceCode: outbox.target_code
    })
  }

  return seeds
}

function findFirstFailure(detail: TraceDetailResponse): TraceTimelineItem | null {
  return (
    [...detail.timelines]
      .sort(sortTimeline)
      .find(item => isFailureStatus(item.status) || Boolean(item.failure_domain)) ?? null
  )
}

function findLatestCommandTimeline(detail: TraceDetailResponse): TraceTimelineItem | null {
  return [...detail.timelines].sort(sortTimeline).reverse().find(isCommandTimeline) ?? null
}

function resolveCurrentDeviceCode(
  detail: TraceDetailResponse,
  path?: RuntimeTracePathResponse | null,
  firstFailure?: TraceTimelineItem | null
): string | null {
  if (path?.current_blocking_device_id) {
    const device = (path.devices ?? []).find(
      node => node.device_id === path.current_blocking_device_id
    )
    if (device?.device_code) {
      return device.device_code
    }
  }

  const currentPathNode = (path?.devices ?? []).find(node => node.is_current)
  if (currentPathNode?.device_code) {
    return currentPathNode.device_code
  }

  if (firstFailure?.actor_code) {
    return firstFailure.actor_code
  }

  const latestCommand = findLatestCommandTimeline(detail)
  if (latestCommand?.actor_code) {
    return latestCommand.actor_code
  }

  return null
}

function buildEvidenceCounts(detail: TraceDetailResponse): Array<{ label: string; value: number }> {
  return [
    { label: 'Timeline', value: detail.timelines.length },
    { label: 'Callback', value: detail.callback_logs.length },
    { label: 'Inbox', value: detail.inboxes.length },
    { label: 'Command', value: detail.commands.length },
    { label: 'Outbox', value: detail.outboxes.length },
    { label: '诊断', value: detail.diagnostics.length }
  ]
}

export function buildRuntimeTraceTopology({
  detail,
  blockingPoint = null,
  path = null
}: BuildRuntimeTraceTopologyOptions): RuntimeTraceTopologyModel {
  const firstFailure = findFirstFailure(detail)
  const diagnosis = buildRuntimeDiagnosisVerdict({
    detail,
    verdict: path?.diagnosis_verdict ?? detail.diagnosis_verdict,
    blockingPoint
  })
  const verdict = diagnosis.topology.verdict
  const currentDeviceCode = resolveCurrentDeviceCode(detail, path, firstFailure)
  const detailSeeds = buildSeedsFromDetail(detail)
  const pathSeeds = buildSeedsFromPath(path, detailSeeds)
  const seeds = pathSeeds.length ? pathSeeds : detailSeeds

  if (!seeds.length && detail.trace.device_code) {
    seeds.push({
      key: detail.trace.device_code,
      deviceCode: detail.trace.device_code
    })
  }

  const firstFailureIndex = firstFailure?.actor_code
    ? seeds.findIndex(seed => seed.deviceCode === firstFailure.actor_code)
    : -1
  const currentIndex = currentDeviceCode
    ? seeds.findIndex(seed => seed.deviceCode === currentDeviceCode)
    : seeds.length - 1

  const pathNodes = seeds.map((seed, index): RuntimeTraceTopologyNode => {
    const isException =
      firstFailureIndex >= 0 &&
      index === firstFailureIndex &&
      verdict !== 'success' &&
      Boolean(firstFailure)
    const isCurrent =
      (currentIndex >= 0 && index === currentIndex) ||
      seed.isCurrent ||
      (verdict === 'success' && index === seeds.length - 1) ||
      isSameDeviceCode(seed.deviceCode, firstFailure?.actor_code)
    const state: RuntimeTraceTopologyNodeState = isException
      ? 'exception'
      : isCurrent && verdict !== 'success'
        ? 'current'
        : verdict === 'success' && index === seeds.length - 1
          ? 'final'
          : verdict === 'success' || (currentIndex >= 0 && index < currentIndex)
          ? 'completed'
          : 'pending'

    return {
      key: seed.key,
      deviceCode: seed.deviceCode,
      deviceName: deviceNameFromSeed(seed),
      stepLabel: `第 ${index + 1} 站`,
      actionLabel: commandLabel(seed.command, seed.timeline),
      statusLabel: statusLabel(seed.timeline, seed.command),
      state,
      timeline: seed.timeline ?? null,
      command: seed.command ?? null
    }
  })

  const currentNode =
    pathNodes.find(node => node.state === 'exception') ??
    pathNodes.find(node => node.state === 'current') ??
    pathNodes.find((node, index) => currentIndex >= 0 && index === currentIndex) ??
    pathNodes[pathNodes.length - 1] ??
    null
  const exceptionNode = pathNodes.find(node => node.state === 'exception') ?? null
  const finalNode = pathNodes.find(node => node.state === 'final') ?? null
  const materialPositionLabel = finalNode ? '最终落点' : '当前停留'
  const materialPositionValue = finalNode
    ? `${finalNode.deviceName} / ${finalNode.actionLabel || '流程完成'}`
    : currentNode
      ? `${currentNode.deviceName} / ${currentNode.actionLabel || '暂无动作证据'}`
      : '暂无设备回报证据'

  return {
    verdict,
    verdictTitle: diagnosis.topology.verdictTitle,
    verdictDescription: diagnosis.topology.verdictDescription,
    optimisticPathLabel: pathNodes.map(node => node.deviceName).join(' → ') || '暂无设备路径',
    currentLabel: currentNode ? `${currentNode.stepLabel} · ${currentNode.deviceName}` : '未知位置',
    materialPositionLabel,
    materialPositionValue,
    exceptionText: diagnosis.topology.exceptionText,
    operatorAction: diagnosis.topology.operatorAction,
    pathNodes,
    currentNode,
    exceptionNode,
    evidenceCounts: buildEvidenceCounts(detail),
    evidenceHealth: diagnosis.evidenceHealth.items,
    diagnosis
  }
}
