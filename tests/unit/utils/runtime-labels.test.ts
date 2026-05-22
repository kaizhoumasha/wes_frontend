import { describe, expect, it } from 'vitest'
import {
  translateAction,
  translateFailureDomain,
  translateSessionStatus,
  translateStage
} from '@/utils/runtime-labels'

describe('translateStage', () => {
  it('translates known stage values', () => {
    expect(translateStage('INGEST')).toBe('接入')
    expect(translateStage('ROUTE')).toBe('路由')
    expect(translateStage('DECISION')).toBe('决策')
    expect(translateStage('DISPATCH_PREPARE')).toBe('派发准备')
    expect(translateStage('WAITING')).toBe('等待')
    expect(translateStage('CALLBACK')).toBe('回调')
    expect(translateStage('MANUAL')).toBe('人工操作')
    expect(translateStage('TIMEOUT')).toBe('超时')
    expect(translateStage('COMPENSATION')).toBe('补偿')
    expect(translateStage('COMPLETE')).toBe('完成')
    expect(translateStage('FAIL')).toBe('失败')
  })

  it('returns empty string for null', () => {
    expect(translateStage(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(translateStage(undefined)).toBe('')
  })

  it('falls back to compactEnumLabel for unknown values', () => {
    expect(translateStage('UNKNOWN_STAGE')).toBe('UNKNOWN_STAGE')
  })

  it('falls back to compactEnumLabel for dotted values', () => {
    expect(translateStage('some.namespace.INGEST')).toBe('INGEST')
  })
})

describe('translateAction', () => {
  it('translates known action values', () => {
    expect(translateAction('SESSION_CREATED')).toBe('会话创建')
    expect(translateAction('COMMAND_SENT')).toBe('指令已发送')
    expect(translateAction('COMMAND_ACKED')).toBe('设备已确认')
    expect(translateAction('COMMAND_COMPLETED')).toBe('指令完成')
    expect(translateAction('COMMAND_FAILED')).toBe('指令失败')
    expect(translateAction('WAIT_STARTED')).toBe('开始等待')
    expect(translateAction('WAIT_TIMEOUT')).toBe('等待超时')
    expect(translateAction('EVENT_RECEIVED')).toBe('事件接收')
    expect(translateAction('EXTERNAL_CALL_STARTED')).toBe('外部调用开始')
    expect(translateAction('DECISION_MADE')).toBe('决策记录')
    expect(translateAction('ERROR_OCCURRED')).toBe('发生错误')
    expect(translateAction('COMPENSATION_STARTED')).toBe('补偿开始')
    expect(translateAction('MANUAL_HOLD')).toBe('人工挂起')
    expect(translateAction('MANUAL_RESUME')).toBe('人工恢复')
  })

  it('returns empty string for null', () => {
    expect(translateAction(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(translateAction(undefined)).toBe('')
  })

  it('falls back to compactEnumLabel for unknown values', () => {
    expect(translateAction('UNKNOWN_ACTION')).toBe('UNKNOWN_ACTION')
  })

  it('falls back to compactEnumLabel for dotted values', () => {
    expect(translateAction('module.SUB_ACTION')).toBe('SUB_ACTION')
  })
})

describe('translateSessionStatus', () => {
  it('translates known session status values', () => {
    expect(translateSessionStatus('NEW')).toBe('新建')
    expect(translateSessionStatus('RUNNING')).toBe('运行中')
    expect(translateSessionStatus('WAITING_DEVICE_RESULT')).toBe('等待设备响应')
    expect(translateSessionStatus('WAITING_EXTERNAL')).toBe('等待外部系统')
    expect(translateSessionStatus('MANUAL_HOLD')).toBe('人工挂起')
    expect(translateSessionStatus('FAILED')).toBe('失败')
    expect(translateSessionStatus('CANCELLED')).toBe('已取消')
    expect(translateSessionStatus('COMPLETED')).toBe('已完成')
  })

  it('returns empty string for null', () => {
    expect(translateSessionStatus(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(translateSessionStatus(undefined)).toBe('')
  })

  it('falls back to compactEnumLabel for unknown values', () => {
    expect(translateSessionStatus('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS')
  })

  it('falls back to compactEnumLabel for dotted values', () => {
    expect(translateSessionStatus('prefix.SUFFIX')).toBe('SUFFIX')
  })
})

describe('translateFailureDomain', () => {
  it('translates known failure domain values', () => {
    expect(translateFailureDomain('HARDWARE')).toBe('硬件故障')
    expect(translateFailureDomain('NETWORK')).toBe('网络故障')
    expect(translateFailureDomain('SOFTWARE')).toBe('软件错误')
    expect(translateFailureDomain('ORCHESTRATION')).toBe('编排错误')
    expect(translateFailureDomain('ALGORITHM')).toBe('算法问题')
    expect(translateFailureDomain('UPSTREAM')).toBe('上游系统')
    expect(translateFailureDomain('DOWNSTREAM')).toBe('下游系统')
    expect(translateFailureDomain('CONFIG')).toBe('配置错误')
    expect(translateFailureDomain('DATA')).toBe('数据异常')
    expect(translateFailureDomain('TIMEOUT')).toBe('超时')
    expect(translateFailureDomain('MANUAL_INTERVENTION')).toBe('人工介入')
  })

  it('returns empty string for null', () => {
    expect(translateFailureDomain(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(translateFailureDomain(undefined)).toBe('')
  })

  it('falls back to compactEnumLabel for unknown values', () => {
    expect(translateFailureDomain('UNKNOWN_DOMAIN')).toBe('UNKNOWN_DOMAIN')
  })

  it('falls back to compactEnumLabel for dotted values', () => {
    expect(translateFailureDomain('a.b.c')).toBe('c')
  })
})
