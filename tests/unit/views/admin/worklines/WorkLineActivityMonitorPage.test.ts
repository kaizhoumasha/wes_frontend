import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import WorkLineActivityMonitorPage from '@/views/admin/worklines/WorkLineActivityMonitorPage.vue'
import ActiveObjectLedger from '@/views/admin/worklines/components/activity-monitor/ActiveObjectLedger.vue'
import ResourceContextPanel from '@/views/admin/worklines/components/activity-monitor/ResourceContextPanel.vue'

const monitor = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return {
    selectedResourceRef: ref(null),
    scene: ref(null),
    snapshot: ref(null),
    activeObjects: ref(null),
    sceneLoading: ref(false),
    sceneError: ref(''),
    dynamicLoading: ref(false),
    staleBannerText: ref(null),
    generatedAtLabel: ref(null),
    refresh: vi.fn(),
    selectResource: vi.fn()
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '348950323769920' } })
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true })
}))

vi.mock('@/views/admin/worklines/composables/useActivityMonitor', () => ({
  useActivityMonitor: () => monitor
}))

describe('WorkLineActivityMonitorPage layout', () => {
  it('keeps the data ledger full-width below the matrix and context columns', () => {
    const wrapper = shallowMount(WorkLineActivityMonitorPage)
    const layout = wrapper.get('.activity-monitor__layout')

    expect(layout.findComponent(ResourceContextPanel).exists()).toBe(true)
    expect(layout.findComponent(ActiveObjectLedger).exists()).toBe(false)
    expect(
      wrapper.get('.activity-monitor__ledger').findComponent(ActiveObjectLedger).exists()
    ).toBe(true)
  })
})
