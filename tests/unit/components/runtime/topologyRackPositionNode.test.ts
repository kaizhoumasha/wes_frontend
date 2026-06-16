import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TopologyRackPositionNode from '@/components/runtime/shared/TopologyRackPositionNode.vue'

describe('TopologyRackPositionNode', () => {
  it('renders the rack position label and code', () => {
    const wrapper = mount(TopologyRackPositionNode, {
      props: { code: 'P_INLET', label: '上料货位' }
    })

    expect(wrapper.text()).toContain('货位')
    expect(wrapper.text()).toContain('上料货位')
    expect(wrapper.text()).toContain('P_INLET')
  })

  it('falls back to showing the code when no label is provided', () => {
    const wrapper = mount(TopologyRackPositionNode, {
      props: { code: 'P_OUTLET' }
    })

    const root = wrapper.get('[data-test="topology-rack-position-node"]')
    expect(root.text()).toContain('P_OUTLET')
    // No duplicate code element when label is absent
    expect(root.findAll('.topology-rack-position-node__code')).toHaveLength(0)
  })

  it('emits a click event without payload when clicked', async () => {
    const wrapper = mount(TopologyRackPositionNode, {
      props: { code: 'P_INLET' }
    })

    await wrapper.get('[data-test="topology-rack-position-node"]').trigger('click')

    const emittedClick = wrapper.emitted('click')
    expect(emittedClick).toHaveLength(1)
    expect(emittedClick?.[0]).toEqual([])
  })

  it('applies compact class when compact prop is true', () => {
    const wrapper = mount(TopologyRackPositionNode, {
      props: { code: 'P_INLET', compact: true }
    })

    expect(wrapper.get('[data-test="topology-rack-position-node"]').classes()).toContain(
      'is-compact'
    )
  })
})
