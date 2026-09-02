/* eslint-disable vue/one-component-per-file -- test-local component stubs */
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { DebugPreflightResult } from '@/api/modules/device'
import type { DevicesItem } from '@/api/modules/devices'
import type { PaginationData } from '@/api/base/crud-request-adapter'
import type { DeviceDiscoveryApiPort } from '@/views/admin/devices/useDeviceDiscovery'
import DeviceDiscoveryDrawer from '@/views/admin/devices/components/DeviceDiscoveryDrawer.vue'

const ENDPOINT = 'http://ecs:8080'

function ecsDevice(
  code: string,
  name: string | null,
  commands: string[] | null = ['MOVE'],
  events: string[] | null = ['DONE']
): DebugPreflightResult['devices'][number] {
  return {
    device: {
      device_code: code,
      device_name: name,
      device_type: 'CONVEYOR',
      role: 'TRANSPORT',
      supported_commands: commands,
      supported_events: events
    },
    state: {
      device_code: code,
      mode: 'AUTO',
      status: 'IDLE',
      is_online: true,
      current_command_code: null,
      scenario: null,
      updated_at: 1
    },
    admissible: false,
    rejection_code: 'DEVICE_MODE_NOT_AUTO'
  }
}

function wesDevice(id: number, code: string, name: string, endpoint = ENDPOINT): DevicesItem {
  return {
    id,
    version: 1,
    device_code: code,
    device_name: name,
    device_role: 'CONVEYOR',
    endpoint_base_url: endpoint,
    is_active: true,
    role_index: 1,
    sort_order: 0,
    work_line_id: null,
    upstream_device_id: null,
    description: null,
    diagnostic_profile: {}
  }
}

function createApi(): DeviceDiscoveryApiPort {
  const preflight: DebugPreflightResult = {
    endpoint_base_url: ENDPOINT,
    devices: [
      ecsDevice('MANAGED-01', 'Managed device', null, []),
      ecsDevice('NEW-01', 'New device', ['MOVE', 'STOP'], ['DONE']),
      ecsDevice('DIFF-01', 'ECS name'),
      ecsDevice('CONFLICT-01', 'Conflict device')
    ]
  }
  const devices = [
    wesDevice(1, 'MANAGED-01', 'Managed device'),
    wesDevice(2, 'DIFF-01', 'WES name'),
    wesDevice(3, 'CONFLICT-01', 'Conflict device', 'http://other-ecs:8080'),
    wesDevice(4, 'WES-ONLY-01', 'WES-only device')
  ]
  return {
    preflight: vi.fn().mockResolvedValue(preflight),
    queryDevices: vi.fn().mockResolvedValue({
      items: devices,
      total: devices.length,
      page: 1,
      size: 100,
      pages: 1
    } satisfies PaginationData<DevicesItem>)
  }
}

const StandardDrawerStub = defineComponent({
  props: { modelValue: Boolean },
  template: '<aside v-if="modelValue"><slot /></aside>'
})

const ElInputStub = defineComponent({
  inheritAttrs: false,
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template:
    '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
})

const AppButtonStub = defineComponent({
  inheritAttrs: false,
  props: { disabled: Boolean, loading: Boolean },
  emits: ['click'],
  template:
    '<button v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>'
})

function mountDrawer(openCreate = vi.fn(), api = createApi()) {
  return {
    openCreate,
    wrapper: mount(DeviceDiscoveryDrawer, {
      props: {
        modelValue: true,
        openCreate,
        api
      },
      global: {
        stubs: {
          StandardDrawer: StandardDrawerStub,
          AppButton: AppButtonStub,
          ElInput: ElInputStub,
          ElAlert: { props: ['title'], template: '<div class="alert-stub">{{ title }}</div>' },
          ElTag: { template: '<span class="tag-stub"><slot /></span>' }
        }
      }
    })
  }
}

describe('DeviceDiscoveryDrawer', () => {
  it('orders actionable rows first, de-emphasizes managed rows and shows capabilities in details', async () => {
    const { wrapper } = mountDrawer()
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.device-card').map(card => card.attributes('data-status'))).toEqual([
      'ENDPOINT_CONFLICT',
      'INFORMATION_DIFFERS',
      'MANAGED_NOT_DISCOVERED',
      'DISCOVERED_UNMANAGED',
      'MANAGED'
    ])
    expect(wrapper.find('[data-status="MANAGED"]').classes()).toContain(
      'device-card--managed'
    )
    expect(wrapper.find('[data-code="NEW-01"]').text()).toContain('MOVE')
    expect(wrapper.find('[data-code="NEW-01"]').text()).toContain('STOP')
    expect(wrapper.find('[data-code="NEW-01"]').text()).toContain('DONE')
    expect(wrapper.find('[data-code="MANAGED-01"]').text()).toContain('未声明')
    expect(wrapper.find('[data-code="MANAGED-01"]').text()).toContain('无')
    expect(wrapper.find('[data-code="CONFLICT-01"]').text()).toContain('http://other-ecs:8080')
    expect(wrapper.find('[data-code="WES-ONLY-01"]').text()).toContain('无能力快照')
    expect(wrapper.find('[data-code="MANAGED-01"] .onboard-action').exists()).toBe(false)
  })

  it('opens the existing create form with only approved ECS initial values', async () => {
    const { wrapper, openCreate } = mountDrawer()
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()

    await wrapper.find('[data-code="NEW-01"] .onboard-action').trigger('click')

    expect(openCreate).toHaveBeenCalledWith({
      initialValues: {
        device_code: 'NEW-01',
        device_name: 'New device',
        endpoint_base_url: ENDPOINT
      }
    })
  })

  it('filters by group and searches code or names without changing the stable source order', async () => {
    const { wrapper } = mountDrawer()
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()

    await wrapper.find('[data-filter="managed"]').trigger('click')
    expect(wrapper.findAll('.device-card').map(card => card.attributes('data-code'))).toEqual([
      'MANAGED-01'
    ])

    await wrapper.find('[data-filter="all"]').trigger('click')
    await wrapper.find('.device-search').setValue('wes name')
    expect(wrapper.findAll('.device-card').map(card => card.attributes('data-code'))).toEqual([
      'DIFF-01'
    ])
  })

  it('keeps the previous result stale and disables onboarding when post-create refresh fails', async () => {
    const api = createApi()
    const { wrapper } = mountDrawer(vi.fn(), api)
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()
    vi.mocked(api.queryDevices).mockRejectedValueOnce(new Error('WES query unavailable'))

    const refreshed = await (
      wrapper.vm as unknown as { refreshAfterCreate: () => Promise<boolean> }
    ).refreshAfterCreate()
    await flushPromises()

    expect(refreshed).toBe(false)
    expect(wrapper.find('.stale-alert').text()).toContain('上一次成功结果')
    expect(wrapper.find('[data-code="NEW-01"] .onboard-action').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-code="NEW-01"]').exists()).toBe(true)
  })

  it('shows the initial error and replaces it with a fresh snapshot after retry', async () => {
    const api = createApi()
    vi.mocked(api.preflight).mockRejectedValueOnce(new Error('ECS unavailable'))
    const { wrapper } = mountDrawer(vi.fn(), api)

    expect(wrapper.find('.result-placeholder').text()).toContain('输入 ECS Endpoint')
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()
    expect(wrapper.find('.discovery-error').text()).toContain('ECS unavailable')
    expect(wrapper.find('.result-placeholder').text()).toContain('输入 ECS Endpoint')

    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()

    expect(wrapper.find('.discovery-error').exists()).toBe(false)
    expect(wrapper.find('[data-code="NEW-01"]').exists()).toBe(true)
  })

  it('does not prefill a missing ECS name when onboarding', async () => {
    const api = createApi()
    vi.mocked(api.preflight).mockResolvedValueOnce({
      endpoint_base_url: ENDPOINT,
      devices: [ecsDevice('UNNAMED-01', null)]
    })
    vi.mocked(api.queryDevices).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      size: 100,
      pages: 0
    })
    const { wrapper, openCreate } = mountDrawer(vi.fn(), api)
    await wrapper.find('.endpoint-input').setValue(ENDPOINT)
    await wrapper.find('.refresh-action').trigger('click')
    await flushPromises()

    await wrapper.find('[data-code="UNNAMED-01"] .onboard-action').trigger('click')

    expect(openCreate).toHaveBeenCalledWith({
      initialValues: {
        device_code: 'UNNAMED-01',
        endpoint_base_url: ENDPOINT
      }
    })
  })
})
