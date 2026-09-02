import { h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'

describe('CrudPageContainer extra-dialogs bridge', () => {
  it('lets a page-local dialog open the existing create form with initial values', async () => {
    const config = createDevicePageConfig()
    config.resource.requestAdapter.query = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 10,
      pages: 0
    })
    let openCreate:
      | ((options?: { initialValues?: Record<string, unknown> }) => void)
      | undefined

    const wrapper = mount(CrudPageContainer, {
      props: { config },
      slots: {
        'extra-dialogs': slotProps => {
          openCreate = slotProps.openCreate
          return h('div', { class: 'extra-dialog-probe' })
        }
      },
      global: {
        stubs: {
          CrudToolbar: true,
          CrudTable: true,
          CrudFormDialog: {
            props: ['open', 'createInitialValues'],
            template:
              '<div class="form-probe" :data-open="open" :data-code="createInitialValues?.device_code" />'
          },
          AdvancedSearchDialog: true,
          TableColumnConfigDialog: true,
          CrudDetailPanel: true,
          MoveDialog: true,
          SortDialog: true,
          AppIconButton: true,
          ElDropdown: true,
          ElDropdownMenu: true,
          ElDropdownItem: true
        }
      }
    })

    expect(openCreate).toBeTypeOf('function')
    openCreate?.({ initialValues: { device_code: 'DEVICE-01' } })
    await nextTick()

    expect(wrapper.find('.form-probe').attributes('data-open')).toBe('true')
    expect(wrapper.find('.form-probe').attributes('data-code')).toBe('DEVICE-01')
  })

  it('exposes the existing list refresh without changing the slot contract', async () => {
    const config = createDevicePageConfig()
    const query = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 10,
      pages: 0
    })
    config.resource.requestAdapter.query = query
    let refresh: (() => Promise<void>) | undefined

    mount(CrudPageContainer, {
      props: { config },
      slots: {
        'extra-dialogs': slotProps => {
          refresh = slotProps.refresh
          return h('div')
        }
      },
      global: {
        stubs: {
          CrudToolbar: true,
          CrudTable: true,
          CrudFormDialog: true,
          AdvancedSearchDialog: true,
          TableColumnConfigDialog: true,
          CrudDetailPanel: true,
          MoveDialog: true,
          SortDialog: true,
          AppIconButton: true,
          ElDropdown: true,
          ElDropdownMenu: true,
          ElDropdownItem: true
        }
      }
    })
    await flushPromises()
    const callsAfterMount = query.mock.calls.length

    await refresh?.()

    expect(refresh).toBeTypeOf('function')
    expect(query).toHaveBeenCalledTimes(callsAfterMount + 1)
  })
})
