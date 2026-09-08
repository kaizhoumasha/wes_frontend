import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ExchangeDetail from '@/views/ops/wms-diagnostics/ExchangeDetail.vue'

afterEach(() => vi.unstubAllGlobals())

const props = {
  attemptId: 'attempt-1',
  observedAt: '2026-09-07T12:00:00Z',
  result: 'REJECTED',
  incomplete: true,
  saved: false,
  redactedContent: '<script>request</script>'
}

describe('WMS 当次交互详情', () => {
  it('切换请求和响应，明确历史快照与未保存边界', async () => {
    const wrapper = mount(ExchangeDetail, {
      props,
      slots: { request: '请求 WIRE', response: '响应 WIRE' }
    })
    expect(wrapper.text()).toContain('当次接口结果：REJECTED')
    expect(wrapper.text()).toContain('采集时状态')
    expect(wrapper.text()).toContain(props.observedAt)
    expect(wrapper.text()).toContain('采集不完整')
    expect(wrapper.text()).toContain('未保存')
    expect(wrapper.text()).toContain('请求 WIRE')
    await wrapper.get('[data-side="response"]').trigger('click')
    expect(wrapper.text()).toContain('响应 WIRE')
    expect(wrapper.text()).not.toContain('请求 WIRE')
    expect(wrapper.get('[data-side="response"]').attributes('aria-pressed')).toBe('true')
  })

  it('复制已脱敏内容和完整性标记，并显示复制失败', async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('denied'))
      .mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(ExchangeDetail, { props })
    await wrapper.get('[data-action="copy"]').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('复制失败')
    await wrapper.get('[data-action="copy"]').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('已复制')
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('采集不完整；未保存'))
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining(props.observedAt))
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining(props.redactedContent))
    expect(wrapper.find('script').exists()).toBe(false)
  })

  it('将只看差异选择传给比较展示，切换交互后重置详情状态', async () => {
    const wrapper = mount(ExchangeDetail, {
      props,
      slots: { comparisons: ({ onlyDifferences }) => String(onlyDifferences) }
    })
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.get('[data-section="comparisons"]').text()).toBe('true')
    await wrapper.get('[data-side="response"]').trigger('click')
    await wrapper.setProps({ attemptId: 'attempt-2' })
    expect(wrapper.get('[data-side="request"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-section="comparisons"]').text()).toBe('false')
  })
})
