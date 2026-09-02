import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('StandardDialog overlay stacking', () => {
  it('claims a fresh Element Plus z-index each time it opens', async () => {
    const wrapper = mount(StandardDialog, {
      attachTo: document.body,
      props: { modelValue: false },
      global: {
        stubs: {
          AppButton: { template: '<button><slot /></button>' },
          AppIcon: true
        }
      }
    })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    const firstZIndex = Number(
      document.body.querySelector<HTMLElement>('.standard-dialog-overlay')?.style.zIndex
    )

    await wrapper.setProps({ modelValue: false })
    await nextTick()
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    const secondZIndex = Number(
      document.body.querySelector<HTMLElement>('.standard-dialog-overlay')?.style.zIndex
    )

    expect(firstZIndex).toBeGreaterThan(2000)
    expect(secondZIndex).toBeGreaterThan(firstZIndex)
    wrapper.unmount()
  })
})
