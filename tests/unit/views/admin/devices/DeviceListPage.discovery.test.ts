/* eslint-disable vue/one-component-per-file -- test-local component stubs */
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { CrudPageConfig } from '@/components/common/crud-page/types'
import type {
  CreateDevicesInput,
  DevicesItem,
  UpdateDevicesInput
} from '@/api/modules/devices'
import DeviceListPage from '@/views/admin/devices/DeviceListPage.vue'

type DeviceConfig = CrudPageConfig<DevicesItem, CreateDevicesInput, UpdateDevicesInput>

describe('DeviceListPage ECS discovery integration', () => {
  it('opens the discovery drawer and refreshes its snapshot after Device create succeeds', async () => {
    let pageConfig: DeviceConfig | undefined
    const openCreate = vi.fn()
    const refreshList = vi.fn().mockResolvedValue(undefined)
    const refreshAfterCreate = vi.fn().mockResolvedValue(true)

    const CrudPageContainerStub = defineComponent({
      props: { config: { type: Object, required: true } },
      setup(props, { slots }) {
        pageConfig = props.config as DeviceConfig
        return () =>
          h('div', { class: 'crud-page-stub' }, [
            slots['extra-dialogs']?.({ openCreate, refresh: refreshList })
          ])
      }
    })
    const DeviceDiscoveryDrawerStub = defineComponent({
      props: {
        modelValue: Boolean,
        openCreate: { type: Function, required: true }
      },
      setup(props, { expose }) {
        expose({ refreshAfterCreate })
        return () =>
          h('div', {
            class: 'discovery-drawer-stub',
            'data-open': String(props.modelValue)
          })
      }
    })

    const wrapper = mount(DeviceListPage, {
      global: {
        stubs: {
          CrudPageContainer: CrudPageContainerStub,
          DeviceDiscoveryDrawer: DeviceDiscoveryDrawerStub
        }
      }
    })
    const action = pageConfig?.extensions?.toolbarActions?.find(
      candidate => candidate.key === 'devices-ecs-discovery'
    )

    await action?.handler({
      applyQuickPreset: vi.fn(),
      clearFilters: vi.fn(),
      refresh: refreshList
    })
    await nextTick()
    expect(wrapper.find('.discovery-drawer-stub').attributes('data-open')).toBe('true')

    await pageConfig?.resource.onCreateResult?.({ id: 1, device_code: 'DEVICE-01' })
    await flushPromises()
    expect(refreshAfterCreate).toHaveBeenCalledOnce()
  })
})
