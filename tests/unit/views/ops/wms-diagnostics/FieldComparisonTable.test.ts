import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldComparisonTable from '@/views/ops/wms-diagnostics/FieldComparisonTable.vue'

describe('WMS 字段对比', () => {
  it('区分字段缺失、显式 null 和未校验，并转义实际正文', () => {
    const wrapper = mount(FieldComparisonTable, {
      props: {
        rows: [
          {
            path: '$.missing',
            rule: 'required',
            actual: 'null',
            present: false,
            verdict: 'ERROR',
            source: 'DTO'
          },
          {
            path: '$.null',
            rule: 'nullable',
            actual: 'null',
            present: true,
            verdict: 'PASS',
            source: 'DTO'
          },
          {
            path: '$.raw',
            rule: 'string',
            actual: '<script>alert(1)</script>',
            present: true,
            verdict: 'NOT_VALIDATED',
            source: 'DTO'
          }
        ]
      }
    })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('字段缺失')
    expect(rows[1]?.text()).toContain('null')
    expect(rows[1]?.text()).not.toContain('字段缺失')
    expect(rows[2]?.text()).toContain('未取得校验日志')
    expect(wrapper.find('script').exists()).toBe(false)
    expect(rows[0]?.attributes('data-verdict')).toBe('ERROR')
  })

  it('空比较项不能显示通过', () => {
    const wrapper = mount(FieldComparisonTable, { props: { rows: [] } })
    expect(wrapper.text()).toContain('未取得字段对比')
    expect(wrapper.text()).not.toContain('通过')
  })

  it('只看差异时隐藏通过项，保留异常和未校验项', async () => {
    const rows = (['PASS', 'ERROR', 'NOT_VALIDATED'] as const).map(verdict => ({
      path: `$.${verdict}`,
      rule: 'string',
      actual: '1',
      present: true,
      verdict,
      source: 'DTO'
    }))
    const wrapper = mount(FieldComparisonTable, { props: { rows, onlyDifferences: true } })
    expect(wrapper.findAll('tbody tr').map(row => row.attributes('data-verdict'))).toEqual([
      'ERROR',
      'NOT_VALIDATED'
    ])
    await wrapper.setProps({ rows: [rows[0]!] })
    expect(wrapper.text()).toContain('没有差异或未校验项')
    expect(wrapper.text()).not.toContain('未取得字段对比')
    await wrapper.setProps({ onlyDifferences: false })
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })
})
