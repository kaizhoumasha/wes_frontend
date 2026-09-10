import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import DiagnosticsDetailPanel from '@/views/ops/wms-diagnostics/DiagnosticsDetailPanel.vue'

vi.mock('@vueuse/core', () => ({ useMediaQuery: () => ref(true) }))

const baseProps = {
  detail: null,
  loadingDetail: false,
  detailError: null,
  loadingReliable: false,
  canReadConfirmation: true,
  canReadEvidence: true
}

function mountPanel(props: Record<string, unknown>) {
  return mount(DiagnosticsDetailPanel, {
    props: {
      ...baseProps,
      confirmation: null,
      evidence: null,
      confirmationError: null,
      evidenceError: null,
      ...props
    },
    global: {
      stubs: {
        ElDrawer: {
          props: { modelValue: Boolean },
          emits: ['close'],
          template:
            '<section v-if="modelValue" aria-label="窄屏详情"><button data-close @click="$emit(\'close\')">关闭</button><slot /></section>'
        }
      }
    }
  })
}

describe('WMS 窄屏可靠事实详情', () => {
  it('没有 exchange 时仍展示可靠事实完整 identity 与时间，并可关闭', async () => {
    const wrapper = mountPanel({
      confirmation: {
        operation: 'prepare@v1',
        operation_id: 'op-1',
        status: 'COMPLETED',
        updated_at: '2026-09-09T11:00:01Z',
        last_dispatch_at: '2026-09-09T11:00:00Z',
        next_attempt_at: null,
        deadline_at: '2026-09-09T12:00:00Z',
        response_result: 'RECEIVED'
      },
      evidence: {
        operation: 'prepare@v1',
        operation_id: 'op-1',
        apply_status: 'PENDING',
        received_at: '2026-09-09T11:00:02Z',
        processed_at: null,
        published_at: null
      }
    })
    expect(wrapper.get('[aria-label="窄屏详情"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('prepare@v1 / op-1')
    expect(wrapper.text()).toContain('2026-09-09T11:00:01Z')
    expect(wrapper.text()).toContain('2026-09-09T11:00:02Z')
    await wrapper.get('[data-close]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it.each([
    ['3000', '未找到对应可靠记录'],
    ['5030', '当前无法确认可靠记录状态']
  ])('无 exchange 时保留错误 code %s 的不确定性', (code, text) => {
    const wrapper = mountPanel({ confirmationError: Object.assign(new Error(code), { code }) })
    expect(wrapper.get('[aria-label="窄屏详情"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(text)
  })

  it('有 Evidence 查询结果时仍展示独立 Confirmation 权限缺失', () => {
    const wrapper = mountPanel({
      canReadConfirmation: false,
      evidence: {
        operation: 'prepare@v1',
        operation_id: 'op-1',
        apply_status: 'PENDING',
        received_at: '2026-09-09T11:00:02Z',
        processed_at: null,
        published_at: null
      }
    })
    expect(wrapper.get('[aria-label="窄屏详情"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无可靠发送义务读取权限')
  })
})
