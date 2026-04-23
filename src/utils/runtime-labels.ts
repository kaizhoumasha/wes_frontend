import { compactEnumLabel } from '@/utils/runtime-display'

const STAGE_LABELS: Record<string, string> = {
  INGEST: '接入',
  ROUTE: '路由',
  DECISION: '决策',
  DISPATCH_PREPARE: '派发准备',
  WAITING: '等待',
  CALLBACK: '回调',
  MANUAL: '人工操作',
  TIMEOUT: '超时',
  COMPENSATION: '补偿',
  COMPLETE: '完成',
  FAIL: '失败'
}

const ACTION_LABELS: Record<string, string> = {
  SESSION_CREATED: '会话创建',
  SESSION_STARTED: '会话启动',
  SESSION_RESUMED: '会话恢复',
  SESSION_COMPLETED: '会话完成',
  SESSION_FAILED: '会话失败',
  SESSION_CANCELLED: '会话取消',
  STATUS_CHANGED: '状态变更',
  COMMAND_SENT: '指令已发送',
  COMMAND_ACKED: '设备已确认',
  COMMAND_COMPLETED: '指令完成',
  COMMAND_FAILED: '指令失败',
  WAIT_STARTED: '开始等待',
  WAIT_RESUMED: '等待恢复',
  WAIT_TIMEOUT: '等待超时',
  EVENT_RECEIVED: '事件接收',
  EVENT_PROCESSED: '事件处理',
  EVENT_FAILED: '事件失败',
  EXTERNAL_CALL_STARTED: '外部调用开始',
  EXTERNAL_CALL_COMPLETED: '外部调用完成',
  EXTERNAL_CALL_FAILED: '外部调用失败',
  DECISION_MADE: '决策记录',
  ERROR_OCCURRED: '发生错误',
  COMPENSATION_STARTED: '补偿开始',
  COMPENSATION_COMPLETED: '补偿完成',
  MANUAL_HOLD: '人工挂起',
  MANUAL_RESUME: '人工恢复'
}

const SESSION_STATUS_LABELS: Record<string, string> = {
  NEW: '新建',
  RUNNING: '运行中',
  WAITING_DEVICE_RESULT: '等待设备响应',
  WAITING_EXTERNAL: '等待外部系统',
  MANUAL_HOLD: '人工挂起',
  FAILED: '失败',
  CANCELLED: '已取消',
  COMPLETED: '已完成'
}

const FAILURE_DOMAIN_LABELS: Record<string, string> = {
  HARDWARE: '硬件故障',
  NETWORK: '网络故障',
  SOFTWARE: '软件错误',
  ORCHESTRATION: '编排错误',
  ALGORITHM: '算法问题',
  UPSTREAM: '上游系统',
  DOWNSTREAM: '下游系统',
  CONFIG: '配置错误',
  DATA: '数据异常',
  TIMEOUT: '超时',
  MANUAL_INTERVENTION: '人工介入'
}

function translate(labels: Record<string, string>, value: string | null | undefined): string {
  if (value == null) {
    return ''
  }
  return labels[value] ?? compactEnumLabel(value)
}

export function translateStage(stage: string | null | undefined): string {
  return translate(STAGE_LABELS, stage)
}

export function translateAction(action: string | null | undefined): string {
  return translate(ACTION_LABELS, action)
}

export function translateSessionStatus(status: string | null | undefined): string {
  return translate(SESSION_STATUS_LABELS, status)
}

export function translateFailureDomain(domain: string | null | undefined): string {
  return translate(FAILURE_DOMAIN_LABELS, domain)
}
