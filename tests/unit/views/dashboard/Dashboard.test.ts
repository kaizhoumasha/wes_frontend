import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Dashboard from '@/views/dashboard/Dashboard.vue'

vi.mock('@/composables/useEnv', () => ({
  useEnv: () => ({ appTitle: 'LOCAL DEV' })
}))

describe('Dashboard truthfulness', () => {
  it('does not present fabricated runtime, connectivity or version facts', () => {
    const text = mount(Dashboard).text()

    expect(text).toContain('LOCAL DEV')
    expect(text).toContain('请从左侧菜单进入对应功能')
    expect(text).not.toContain('已连接')
    expect(text).not.toContain('在线设备')
    expect(text).not.toContain('今日任务')
    expect(text).not.toContain('运行效率')
    expect(text).not.toContain('v0.1.0')
    expect(text).not.toMatch(/48|156|94\.5%/)
  })
})
