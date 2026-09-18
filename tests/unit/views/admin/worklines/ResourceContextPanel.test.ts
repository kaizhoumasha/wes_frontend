import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResourceContextPanel from '@/views/admin/worklines/components/activity-monitor/ResourceContextPanel.vue'

const baseProps = {
  lineName: 'KT16',
  lineCode: 'WL-KT16',
  snapshot: null,
  activeObjects: null,
  selected: null,
  selectedResource: null,
  staleBannerText: null,
  generatedAtLabel: null,
  currentTask: null,
  currentTaskLoaded: false,
  currentTaskLoading: false,
  currentTaskError: '',
  currentTaskGeneratedAtLabel: null
}

function mountPanel(overrides: Record<string, unknown> = {}) {
  return mount(ResourceContextPanel, {
    props: { ...baseProps, ...overrides },
    global: {
      stubs: {
        AppButton: {
          props: ['icon', 'ariaDisabled', 'ariaBusy'],
          template:
            '<button :data-icon="icon" :aria-disabled="ariaDisabled" :aria-busy="ariaBusy"><slot /></button>'
        },
        ElTag: { template: '<span class="el-tag"><slot /></span>' }
      }
    }
  })
}

describe('ResourceContextPanel current task section', () => {
  it('starts idle without issuing a request', () => {
    const wrapper = mountPanel()

    expect(wrapper.get('#current-task-title').text()).toBe('当前任务')
    expect(wrapper.get('.context-panel__task-header button').text()).toBe('查看当前任务')
    expect(wrapper.find('.context-panel__task-status').exists()).toBe(false)
  })

  it('renders the loading state and emits the read action', async () => {
    const wrapper = mountPanel({ currentTaskLoading: true })

    expect(wrapper.get('.context-panel__task-status').text()).toContain('正在读取当前任务')
    expect(wrapper.get('.context-panel__task-header button').text()).toBe('正在读取')
    expect(wrapper.get('.context-panel__task-header button').attributes('data-icon')).toBe(
      'ep:loading'
    )
    await wrapper.get('.context-panel__task-header button').trigger('click')
    expect(wrapper.emitted('loadCurrentTask')).toHaveLength(1)
  })

  it('renders an empty successful result with its independent sample time', () => {
    const wrapper = mountPanel({
      currentTaskLoaded: true,
      currentTaskGeneratedAtLabel: '12:34:56'
    })

    expect(wrapper.get('.context-panel__task-status').text()).toContain(
      '当前无准备中或执行中的任务'
    )
    expect(wrapper.text()).toContain('任务读取 · 12:34:56')
    expect(wrapper.get('.context-panel__task-header button').text()).toBe('重新读取')
  })

  it('renders task fields and uses 尚未生成 for revision zero targets', () => {
    const wrapper = mountPanel({
      currentTaskLoaded: true,
      currentTaskGeneratedAtLabel: '12:34:56',
      currentTask: {
        task_id: 'PT-001',
        status: 'PREPARING',
        target_rack_id: null,
        target_rack_face: null,
        last_applied_plan_revision: 0
      }
    })

    expect(wrapper.text()).toContain('PT-001')
    expect(wrapper.text()).toContain('准备中')
    expect(wrapper.text()).toContain('计划版本')
    expect(wrapper.text()).toContain('尚未生成')
    expect(wrapper.text()).toContain('任务读取 · 12:34:56')
  })

  it('clears stale task presentation when the read fails', () => {
    const wrapper = mountPanel({
      currentTaskLoaded: true,
      currentTaskError: '服务暂不可用',
      currentTask: null,
      currentTaskGeneratedAtLabel: null
    })

    expect(wrapper.get('.context-panel__task-status--error').text()).toContain('当前任务加载失败')
    expect(wrapper.get('.context-panel__task-header button').text()).toBe('重试')
    expect(wrapper.text()).not.toContain('任务读取 ·')
  })
})
