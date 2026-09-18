import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import WorkLineActivityMonitorPage from '@/views/admin/worklines/WorkLineActivityMonitorPage.vue'
import ActiveObjectLedger from '@/views/admin/worklines/components/activity-monitor/ActiveObjectLedger.vue'
import ResourceContextPanel from '@/views/admin/worklines/components/activity-monitor/ResourceContextPanel.vue'
import { StandardDrawer } from '@/components/ui/StandardDrawer'

let permissionAllowed = true

const monitor = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return {
    selectedResourceRef: ref(null),
    scene: ref(null),
    snapshot: ref(null),
    activeObjects: ref(null),
    currentTask: ref(null),
    currentTaskLoaded: ref(false),
    currentTaskLoading: ref(false),
    currentTaskError: ref(''),
    currentTaskGeneratedAtLabel: ref(null),
    sceneLoading: ref(false),
    sceneError: ref(''),
    dynamicLoading: ref(false),
    staleBannerText: ref(null),
    generatedAtLabel: ref(null),
    refresh: vi.fn(),
    selectResource: vi.fn(),
    loadCurrentTask: vi.fn()
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '348950323769920' } })
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => permissionAllowed })
}))

vi.mock('@/views/admin/worklines/composables/useActivityMonitor', () => ({
  useActivityMonitor: () => monitor
}))

describe('WorkLineActivityMonitorPage layout', () => {
  it('keeps the data ledger below the matrix and uses one right-side drawer for context', () => {
    const wrapper = shallowMount(WorkLineActivityMonitorPage)
    const layout = wrapper.get('.activity-monitor__layout')

    expect(layout.findComponent(ResourceContextPanel).exists()).toBe(false)
    expect(layout.findComponent(ActiveObjectLedger).exists()).toBe(false)
    expect(
      wrapper.get('.activity-monitor__ledger').findComponent(ActiveObjectLedger).exists()
    ).toBe(true)
    expect(wrapper.findComponent(StandardDrawer).exists()).toBe(true)
  })

  it('does not start a partial monitor when any required permission is absent', () => {
    permissionAllowed = false
    const wrapper = shallowMount(WorkLineActivityMonitorPage)

    expect(wrapper.find('el-alert-stub').exists()).toBe(true)
    expect(wrapper.findComponent(StandardDrawer).exists()).toBe(false)
    permissionAllowed = true
  })
})
