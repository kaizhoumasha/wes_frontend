import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
  result_deadline_at: '2026-09-09T10:05:01Z',
  submit_attempt_count: 2,
  outcome_version: 3,
  published_outcome_version: 2,
  pending_evidence_count: 1,
  active_binding_count: 1,
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

describe('TransportTaskDetail', () => {
  const global = {
    directives: { loading: () => undefined },
    stubs: {
      ElInput: {
        props: { modelValue: { type: String, default: '' } },
        emits: ['update:modelValue'],
        template: '<input :value="modelValue" />'
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

  it('keeps an exact rejected receipt separate and displays only its recorded rejection code', async () => {
    const wrapper = mount(TransportTaskDetail, {
      props: {
        detail,
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

    expect(wrapper.text()).toContain('独立回调收据查询')
    expect(wrapper.text()).toContain('INVALID_EVIDENCE')
    expect(wrapper.text()).not.toContain('缺失字段')
    expect(wrapper.text()).not.toContain('属于 transport-1')
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
