import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StandardDrawer from '@/components/ui/StandardDrawer/StandardDrawer.vue'
import { resolveDrawerSize } from '@/components/ui/StandardDrawer'

describe('StandardDrawer', () => {
  it('resolves six-level preset sizes for Element Plus drawer', () => {
    const wrapper = mount(StandardDrawer, {
      props: {
        modelValue: true,
        size: 'xl'
      },
      global: {
        stubs: {
          ElDrawer: {
            props: ['size'],
            template: '<aside :data-size="size"><slot /></aside>'
          }
        }
      }
    })

    expect(wrapper.find('aside').attributes('data-size')).toBe('min(960px, 94vw)')
  })

  it('renders a consistent header body and footer frame', () => {
    const wrapper = mount(StandardDrawer, {
      props: {
        modelValue: true,
        title: '统一抽屉'
      },
      slots: {
        default: '<span class="drawer-content">内容</span>',
        footer: '<button>保存</button>'
      },
      global: {
        stubs: {
          ElDrawer: {
            props: ['size'],
            template:
              '<aside :data-size="size"><header><slot name="header" /></header><main><slot /></main><footer><slot name="footer" /></footer></aside>'
          }
        }
      }
    })

    expect(wrapper.find('.standard-drawer__header').text()).toContain('统一抽屉')
    expect(wrapper.find('.standard-drawer__body').text()).toContain('内容')
    expect(wrapper.find('.standard-drawer__footer').text()).toContain('保存')
  })

  it('keeps the same six preset names as StandardDialog', () => {
    expect(resolveDrawerSize('xs')).toBe('min(400px, 92vw)')
    expect(resolveDrawerSize('sm')).toBe('min(520px, 92vw)')
    expect(resolveDrawerSize('md')).toBe('min(640px, 92vw)')
    expect(resolveDrawerSize('lg')).toBe('min(800px, 92vw)')
    expect(resolveDrawerSize('xl')).toBe('min(960px, 94vw)')
    expect(resolveDrawerSize('full')).toBe('96vw')
  })
})
