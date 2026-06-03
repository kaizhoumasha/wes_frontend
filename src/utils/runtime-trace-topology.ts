import type {
  RuntimeTracePathResponse,
  TraceBlockingPointResponse,
  TraceCommandItem,
  TraceDetailResponse,
  TraceTimelineItem
} from '@/types/runtime'
import { compactEnumLabel, isActiveStatus, isFailureStatus } from '@/utils/runtime-display'
import { translateAction } from '@/utils/runtime-labels'

export type RuntimeTraceTopologyVerdict = 'success' | 'danger' | 'warning' | 'primary' | 'info'
export type RuntimeTraceTopologyNodeState =
  | 'completed'
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
  exceptionText: string
  operatorAction: string
  pathNodes: RuntimeTraceTopologyNode[]
  currentNode: RuntimeTraceTopologyNode | null
  exceptionNode: RuntimeTraceTopologyNode | null
  evidenceCounts: Array<{ label: string; value: number }>
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

function commandLabel(command?: TraceCommandItem | null, timeline?: TraceTimelineItem | null): string {
  const payloadCommand = timeline?.payload_json?.command_type
  const raw =
    command?.task_type ||
    command?.command_code ||
    (typeof payloadCommand === 'string' ? payloadCommand : null) ||
    timeline?.action_type
  return compactEnumLabel(raw)
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

function findTerminalTimeline(detail: TraceDetailResponse): TraceTimelineItem | null {
  const sorted = [...detail.timelines].sort(sortTimeline)
  return sorted[sorted.length - 1] ?? null
}

function findLatestCommandTimeline(detail: TraceDetailResponse): TraceTimelineItem | null {
  return [...detail.timelines].sort(sortTimeline).reverse().find(isCommandTimeline) ?? null
}

function isFallbackUnknownBlockingPoint(blockingPoint?: TraceBlockingPointResponse | null): boolean {
  if (!blockingPoint) {
    return false
  }

  const diagnostic = blockingPoint.diagnostic_card
  const hasNoConcretePoint =
    blockingPoint.blocking_point === 'none' || blockingPoint.blocking_point === 'UNKNOWN'
  return (
    hasNoConcretePoint &&
    diagnostic?.error_domain === 'SYSTEM' &&
    diagnostic?.error_code === 'UNKNOWN'
  )
}

function payloadText(item: TraceTimelineItem | null | undefined, key: string): string | undefined {
  const value = item?.payload_json?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function blockingPointCode(blockingPoint?: TraceBlockingPointResponse | null): string | undefined {
  if (!blockingPoint || isFallbackUnknownBlockingPoint(blockingPoint)) {
    return undefined
  }

  if (blockingPoint.diagnostic_card?.error_code !== 'UNKNOWN') {
    return blockingPoint.diagnostic_card.error_code
  }

  return blockingPoint.blocking_point || undefined
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

function resolveVerdict(detail: TraceDetailResponse): RuntimeTraceTopologyVerdict {
  const status = detail.session?.status ?? detail.summary.session_status
  if (isFailureStatus(status) || detail.session?.failure_domain || detail.session?.failure_code) {
    return 'danger'
  }

  if (status === 'COMPLETED' || detail.summary.latest_timeline_action === 'SESSION_COMPLETED') {
    return 'success'
  }

  if (isActiveStatus(status) || isActiveStatus(detail.summary.latest_timeline_status)) {
    return 'warning'
  }

  return 'info'
}

function verdictTitle(verdict: RuntimeTraceTopologyVerdict): string {
  const map: Record<RuntimeTraceTopologyVerdict, string> = {
    success: '流程已完成',
    danger: '流程有异常',
    warning: '流程等待中',
    primary: '流程运行中',
    info: '流程状态待确认'
  }
  return map[verdict]
}

function buildExceptionText(
  detail: TraceDetailResponse,
  blockingPoint?: TraceBlockingPointResponse | null,
  verdict?: RuntimeTraceTopologyVerdict,
  firstFailure?: TraceTimelineItem | null
): string {
  if (verdict === 'success') {
    return '无异常'
  }

  const shouldUseBlockingPoint = !isFallbackUnknownBlockingPoint(blockingPoint)
  const domain =
    detail.session?.failure_domain ||
    firstFailure?.failure_domain ||
    (shouldUseBlockingPoint ? blockingPoint?.diagnostic_card?.error_domain : undefined) ||
    undefined
  const code =
    detail.session?.failure_code ||
    payloadText(firstFailure, 'reason_code') ||
    (shouldUseBlockingPoint ? blockingPointCode(blockingPoint) : undefined) ||
    firstFailure?.action_type ||
    undefined
  const message =
    detail.session?.failure_message ||
    firstFailure?.message ||
    detail.summary.latest_timeline_message ||
    (shouldUseBlockingPoint ? blockingPoint?.diagnostic_card?.summary : undefined) ||
    (shouldUseBlockingPoint ? blockingPoint?.diagnostic_card?.user_message : undefined) ||
    undefined

  const prefix = [domain, code].filter(Boolean).join(' / ')
  if (!prefix && !message) {
    return '无异常'
  }

  return [prefix, message].filter(Boolean).join('：')
}

function buildOperatorAction(
  detail: TraceDetailResponse,
  blockingPoint: TraceBlockingPointResponse | null | undefined,
  verdict: RuntimeTraceTopologyVerdict,
  firstFailure: TraceTimelineItem | null
): string {
  if (verdict === 'success') {
    return '无需处置'
  }

  return (
    payloadText(firstFailure, 'suggested_action') ||
    detail.session?.required_operator_action ||
    blockingPoint?.operator_action ||
    blockingPoint?.diagnostic_card?.operator_action ||
    '查看阻塞点证据后处理'
  )
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
  const terminal = findTerminalTimeline(detail)
  const verdict = resolveVerdict(detail)
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
  const latestAction = translateAction(terminal?.action_type) || compactEnumLabel(terminal?.action_type)

  return {
    verdict,
    verdictTitle: verdictTitle(verdict),
    verdictDescription:
      verdict === 'success'
        ? `乐观路径已走完，最后事件为 ${latestAction || '流程完成'}。`
        : `当前定位在 ${currentNode?.deviceName || '未知节点'}，请先看异常与下一步动作。`,
    optimisticPathLabel: pathNodes.map(node => node.deviceName).join(' → ') || '暂无设备路径',
    currentLabel: currentNode ? `${currentNode.stepLabel} · ${currentNode.deviceName}` : '未知位置',
    exceptionText: buildExceptionText(detail, blockingPoint, verdict, firstFailure),
    operatorAction: buildOperatorAction(detail, blockingPoint, verdict, firstFailure),
    pathNodes,
    currentNode,
    exceptionNode,
    evidenceCounts: buildEvidenceCounts(detail)
  }
}
