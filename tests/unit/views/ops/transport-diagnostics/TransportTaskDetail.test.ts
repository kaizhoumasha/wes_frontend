import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TransportTaskDetail from '@/views/ops/transport-diagnostics/TransportTaskDetail.vue'
import type { CallbackReceiptsResult, GetByTransportTaskIdResult } from '@/api/modules/transport'

const detail: GetByTransportTaskIdResult = {
  transport_task_id: 'transport-1',
  client_request_id: 'client-1',
  submit_operation_id: 'submit-1',
  kind: 'RACK_MOVE',
  status: 'RECONCILING',
  reason_code: 'TRANSPORT_RESULT_TIMEOUT',
  created_at: '2026-09-09T10:00:00Z',
  updated_at: '2026-09-09T10:01:00Z',
  latest_evidence: null,
  send_started_at: '2026-09-09T10:00:01Z',
  next_submit_at: null,
  result_deadline_at: '2026-09-09T10:05:01Z',
  submit_attempt_count: 2,
  outcome_version: 3,
  published_outcome_version: 2,
  pending_evidence_count: 1,
  request: {},
  result: null
}

const receipt: CallbackReceiptsResult = {
  operation: 'transport.task.resulted@v1',
  operation_id: 'receipt-1',
  response_http_status: 409,
  response_code: 'INVALID_EVIDENCE',
  response_data: {},
  received_at: '2026-09-09T10:04:00Z',
  conflict_code: null
}

const detailWithEvidence: GetByTransportTaskIdResult = {
  ...detail,
  latest_evidence: {
    operation: receipt.operation,
    operation_id: receipt.operation_id,
    outcome_revision: 1,
    status: 'PENDING',
    conflict_code: null,
    received_at: '2026-09-09T10:04:00Z',
    processed_at: null
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('TransportTaskDetail', () => {
  const global = {
    directives: { loading: () => undefined },
    stubs: {
      AppButton: {
        emits: ['click'],
        template: '<button @click="$emit(\'click\')"><slot /></button>'
      },
      ElAlert: {
        props: { title: { type: String, default: '' } },
        template: '<p>{{ title }}</p>'
      }
    }
  }

  it('shows the frozen wait, publication and actual delivery facts without claiming business progress', () => {
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: null,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(wrapper.text()).toContain('2026-09-09T10:05:01Z')
    expect(wrapper.text()).toContain('等待权威结果')
    expect(wrapper.text()).toContain('待发布')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).not.toContain('业务已推进')
  })

  it.each([
    [0, 0, '尚无待发布结果'],
    [2, 1, '待发布'],
    [2, 2, '已发布（仅表示发布完成）']
  ])(
    'shows the publication state for outcome version %s and published version %s',
    (outcomeVersion, publishedVersion, expected) => {
      const wrapper = mount(TransportTaskDetail, {
        props: {
          detail: {
            ...detail,
            outcome_version: outcomeVersion,
            published_outcome_version: publishedVersion
          },
          loading: false,
          canRead: true,
          canReadCallbackReceipt: true,
          callbackReceipt: null,
          callbackReceiptUnknown: false,
          callbackReceiptError: '',
          loadingCallbackReceipt: false
        },
        global
      })

      expect(wrapper.text()).toContain(expected)
    }
  )

  it('shows an exact linked chain and only the recorded receipt rejection code', () => {
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail: detailWithEvidence,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: receipt,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(wrapper.text()).toContain('任务请求')
    expect(wrapper.text()).toContain('WMS 决策')
    expect(wrapper.text()).toContain('未观察到')
    expect(wrapper.text()).toContain('WES 下发')
    expect(wrapper.text()).toContain('对端接纳')
    expect(wrapper.text()).toContain('执行结果')
    expect(wrapper.text()).toContain('精确关联回调收据')
    expect(wrapper.text()).toContain('INVALID_EVIDENCE')
    expect(wrapper.text()).not.toContain('缺失字段')
    expect(wrapper.text()).not.toContain('属于 transport-1')
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('shows simultaneous wait stages, elapsed time and no invented retry schedule', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-09T10:10:00Z'))
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail: detailWithEvidence,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: receipt,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(wrapper.text()).toContain('权威结果待确认')
    expect(wrapper.text()).toContain('WES 本地待处理 Evidence')
    expect(wrapper.text()).toContain('WES 本地待发布结果')
    expect(wrapper.text()).toContain('9 分 0 秒')
    expect(wrapper.text()).toContain('未安排')
  })

  it('shows the persisted submit backoff instead of reporting no retry schedule', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-09T10:10:00Z'))
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail: {
          ...detail,
          status: 'PENDING',
          updated_at: '2026-09-09T10:08:00Z',
          send_started_at: null,
          next_submit_at: '2026-09-09T10:12:00Z',
          pending_evidence_count: 0,
          outcome_version: 0,
          published_outcome_version: 0
        },
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: null,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(wrapper.text()).toContain('提交退避')
    expect(wrapper.text()).toContain('2026-09-09T10:08:00Z')
    expect(wrapper.text()).toContain('2026-09-09T10:12:00Z')
  })

  it('reports an unobserved receipt separately from query failure', () => {
    const missing = mount(TransportTaskDetail, {
      props: {
        detail: detailWithEvidence,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: null,
        callbackReceiptUnknown: true,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })
    const failed = mount(TransportTaskDetail, {
      props: {
        detail: detailWithEvidence,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: null,
        callbackReceiptUnknown: false,
        callbackReceiptError: 'receipt service unavailable',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(missing.text()).toContain('未观察到与 Evidence 身份匹配的回调收据')
    expect(failed.text()).toContain('查询失败，当前链路可能不完整')
    expect(failed.text()).toContain('receipt service unavailable')
  })

  it('requests a browser export for the currently displayed facts', async () => {
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail: detailWithEvidence,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: true,
        callbackReceipt: receipt,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('exportDiagnostic')).toEqual([[]])
  })

  it('does not expose the receipt query without its separate permission', () => {
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail,
        loading: false,
        canRead: true,
        canReadCallbackReceipt: false,
        callbackReceipt: null,
        callbackReceiptUnknown: false,
        callbackReceiptError: '',
        loadingCallbackReceipt: false
      },
      global
    })

    expect(wrapper.text()).toContain('缺少 Transport 回调收据查询权限')
    expect(wrapper.find('input').exists()).toBe(false)
  })
})
