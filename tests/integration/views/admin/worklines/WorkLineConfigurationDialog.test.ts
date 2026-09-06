/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DevicesItem } from '@/api/modules/devices'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import WorkLineConfigurationDialog from '@/views/admin/worklines/components/WorkLineConfigurationDialog.vue'
const mocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  getById: vi.fn(),
  availablePlugins: vi.fn(),
  configurationStatus: vi.fn(),
  configuration: vi.fn(),
  deactivate: vi.fn(),
  queryDevices: vi.fn(),
  confirm: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn()
}))

vi.mock('@/api/modules/workLines', async importOriginal => {
  const actual = await importOriginal<typeof import('@/api/modules/workLines')>()
  return {
    ...actual,
    workLinesApiMethods: {
      ...actual.workLinesApiMethods,
      getById: mocks.getById,
      availablePlugins: mocks.availablePlugins,
      configurationStatus: mocks.configurationStatus,
      configuration: mocks.configuration,
      deactivate: mocks.deactivate
    }
  }
})

vi.mock('@/api/modules/devices', async importOriginal => {
  const actual = await importOriginal<typeof import('@/api/modules/devices')>()
  return {
    ...actual,
    devicesApiMethods: { ...actual.devicesApiMethods, query: mocks.queryDevices }
  }
})

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: mocks.hasPermission })
}))

vi.mock('element-plus', () => ({
  ElMessage: { success: mocks.success, warning: mocks.warning, error: mocks.error },
  ElMessageBox: { confirm: mocks.confirm }
}))

const StandardDialogStub = defineComponent({
  name: 'StandardDialog',
  props: {
    modelValue: Boolean,
    confirmDisabled: Boolean,
    confirmLoading: Boolean,
    closable: Boolean,
    hideCancel: Boolean
  },
  emits: ['confirm', 'update:modelValue'],
  setup(_, { emit, slots }) {
    return () =>
      h('div', { class: 'standard-dialog' }, [
        slots.default?.(),
        h('button', { disabled: false, onClick: () => emit('confirm') }, '保存装配')
      ])
  }
})

const ButtonStub = defineComponent({
  name: 'ElButton',
  props: { disabled: Boolean, loading: Boolean },
  emits: ['click'],
  setup(props, { emit, slots }) {
    return () =>
      h(
        'button',
        {
          disabled: props.disabled || props.loading,
          onClick: () => emit('click')
        },
        slots.default?.()
      )
  }
})

const CheckboxStub = defineComponent({
  name: 'ElCheckbox',
  inheritAttrs: false,
  props: { modelValue: Boolean, disabled: Boolean },
  emits: ['change'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        type: 'checkbox',
        checked: props.modelValue,
        disabled: props.disabled,
        onChange: () => {
          if (!props.disabled) emit('change', !props.modelValue)
        }
      })
  }
})

const PassthroughStub = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.default?.())
})

const AlertStub = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: props => () => h('div', props.title)
})

function workline(overrides: Partial<Workline> = {}): Workline {
  return {
    id: 11,
    line_code: 'LINE-11',
    line_name: '测试工作线',
    line_type: 'AUTO',
    run_mode: 'AUTO',
    is_active: false,
    version: 7,
    plugin_key: 'fake',
    config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' } },
    ...overrides
  }
}

function device(id: number, code: string, workLineId: number | null): DevicesItem {
  return {
    id,
    version: 1,
    device_code: code,
    device_name: code,
    is_active: true,
    sort_order: id,
    work_line_id: workLineId
  } as DevicesItem
}

function method<T>(value: T | Promise<T>) {
  return { send: vi.fn().mockReturnValue(value) }
}

function configureLoad(latest: Workline): void {
  mocks.getById.mockReturnValueOnce(method(Promise.resolve(latest)))
  mocks.availablePlugins.mockReturnValueOnce(
    method(
      Promise.resolve(
        [
          {
            plugin_key: 'fake',
            plugin_version: '1.0.0',
            display_name: '测试业务',
            device_roles: [
              { role_key: 'ROLE_A', display_name: '角色甲' },
              { role_key: 'ROLE_B', display_name: '角色乙' }
            ],
            supported_line_types: ['AUTO', 'MANUAL', 'HYBRID'],
            compatible: true,
            incompatibility_reasons: []
          },
          latest.plugin_key === 'future_plugin'
            ? {
                plugin_key: 'future_plugin',
                plugin_version: '1.0.0',
                display_name: '未来业务',
                device_roles: [{ role_key: 'FUTURE_ROLE', display_name: '未来角色' }],
                supported_line_types: ['AUTO'],
                compatible: true,
                incompatibility_reasons: []
              }
            : null
        ].filter(plugin => plugin !== null)
      )
    )
  )
  mocks.configurationStatus.mockReturnValueOnce(
    method(
      Promise.resolve({
        workline_id: latest.id,
        is_active: latest.is_active,
        can_activate: true,
        checks: [
          {
            code: 'PLUGIN_CONFIGURATION_COMPATIBLE',
            status: 'PASS',
            severity: 'INFO',
            context: {}
          }
        ]
      })
    )
  )
  mocks.queryDevices.mockReturnValueOnce(
    method(
      Promise.resolve({
        items: [
          device(1, 'DEVICE-CURRENT', 11),
          device(2, 'DEVICE-FREE', null),
          device(3, 'DEVICE-OTHER', 22)
        ],
        limit: 100,
        offset: 0,
        total: 3
      })
    )
  )
}

const SelectStub = defineComponent({
  name: 'ElSelect',
  props: { modelValue: { type: String, default: '' }, disabled: Boolean },
  emits: ['change'],
  setup:
    (props, { attrs, slots }) =>
    () =>
      h(
        'div',
        { ...attrs, 'data-value': props.modelValue, 'data-disabled': props.disabled },
        slots.default?.()
      )
})

function mountDialog(latest: Workline, refresh = vi.fn().mockResolvedValue(undefined)) {
  configureLoad(latest)
  return {
    refresh,
    wrapper: mount(WorkLineConfigurationDialog, {
      props: { workline: latest, modelValue: true },
      global: {
        provide: {
          [CRUD_PAGE_REFRESH_KEY as symbol]: refresh
        },
        stubs: {
          StandardDialog: StandardDialogStub,
          ElButton: ButtonStub,
          ElCheckbox: CheckboxStub,
          ElForm: PassthroughStub,
          ElFormItem: defineComponent({
            props: { label: { type: String, default: '' } },
            setup:
              (props, { slots }) =>
              () =>
                h('div', [h('label', props.label), slots.default?.()])
          }),
          ElAlert: AlertStub,
          ElTag: PassthroughStub,
          ElSelect: SelectStub,
          ElOption: true
        }
      }
    })
  }
}

async function settle(): Promise<void> {
  await vi.waitFor(() => expect(mocks.queryDevices).toHaveBeenCalled())
  await flushPromises()
  await nextTick()
}

function standardDialog(wrapper: VueWrapper) {
  return wrapper.findComponent(StandardDialogStub)
}

function roleSelect(wrapper: VueWrapper, key: string) {
  return wrapper
    .findAllComponents(SelectStub)
    .find(select => select.attributes('data-role') === key)!
}
async function bind(wrapper: VueWrapper, key: string, code: string) {
  roleSelect(wrapper, key).vm.$emit('change', code)
  await nextTick()
}
async function save(wrapper: VueWrapper) {
  standardDialog(wrapper).vm.$emit('confirm')
  await flushPromises()
}
describe('WorkLineConfigurationDialog generic bindings', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.hasPermission.mockReturnValue(true)
  })
  it('renders server roles and saves incomplete bindings plus unused selected physical devices', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper, refresh } = mountDialog(workline())
    await settle()
    expect(wrapper.text()).toContain('角色甲')
    expect(wrapper.text()).toContain('角色乙')
    expect(roleSelect(wrapper, 'ROLE_A').props('modelValue')).toBe('DEVICE-CURRENT')
    expect(mocks.queryDevices).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: [
          { field: 'sort_order', order: 'asc' },
          { field: 'id', order: 'asc' }
        ]
      }),
      undefined
    )
    expect(
      wrapper.find('[aria-label="选择设备 DEVICE-OTHER"]').attributes('disabled')
    ).toBeDefined()
    await wrapper.find('[aria-label="选择设备 DEVICE-FREE"]').setValue(true)
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' } },
        device_codes: ['DEVICE-CURRENT', 'DEVICE-FREE']
      }
    )
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
    expect(refresh).toHaveBeenCalledOnce()
  })
  it.each([null, [], 'invalid', 42, false])('blocks a non-object bindings draft: %j', async bindings => {
    const { wrapper } = mountDialog(workline({ config: { device_bindings: bindings } }))
    await settle()
    expect(wrapper.text()).toContain('设备角色绑定必须为对象')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
  })
  it.each([{ device_roles: [] }, {}])('saves an installed plugin with no declared roles: %j', async roles => {
    mocks.availablePlugins.mockReturnValueOnce(method(Promise.resolve([{
      plugin_key: 'fake',
      plugin_version: '1.0.0',
      display_name: '无设备业务',
      supported_line_types: ['AUTO'],
      compatible: true,
      incompatibility_reasons: [],
      ...roles
    }])))
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(workline({ config: {} }))
    await settle()
    expect(wrapper.findAll('[data-role]')).toHaveLength(0)
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(false)
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: { device_bindings: {} },
        device_codes: ['DEVICE-CURRENT']
      }
    )
  })
  it('updates role choices with physical selection and requires clearing a removed device binding', async () => {
    const { wrapper } = mountDialog(workline())
    await settle()
    const choices = () => roleSelect(wrapper, 'ROLE_B')
      .findAll('el-option-stub').map(option => option.attributes('value'))
    expect(choices()).toEqual(['DEVICE-CURRENT'])
    const freeDevice = wrapper.get('[aria-label="选择设备 DEVICE-FREE"]')
    await freeDevice.setValue(true)
    expect(choices()).toEqual(['DEVICE-CURRENT', 'DEVICE-FREE'])
    await bind(wrapper, 'ROLE_B', 'DEVICE-FREE')
    await freeDevice.setValue(false)
    expect(choices()).toEqual(['DEVICE-CURRENT'])
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('设备 DEVICE-FREE 不在本次选中的物理设备集合中')
    expect(roleSelect(wrapper, 'ROLE_B').props('modelValue')).toBe('DEVICE-FREE')
    await bind(wrapper, 'ROLE_B', '')
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' } },
        device_codes: ['DEVICE-CURRENT']
      }
    )
  })
  it('saves only generic bindings when the loaded config contains retired plugin settings', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(workline({ config: {
      device_bindings: { ROLE_A: 'DEVICE-CURRENT' },
      rough_sorter: { position_bindings: { NG_POSITION: 'OLD-POSITION' } }
    } }))
    await settle()
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' } },
        device_codes: ['DEVICE-CURRENT']
      }
    )
  })
  it.each(['', 'future_plugin'])(
    'clears bindings through %s and back, preserving physical devices',
    async middle => {
      mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
      const { wrapper } = mountDialog(workline())
      await settle()
      await wrapper.find('[aria-label="选择设备 DEVICE-FREE"]').setValue(true)
      const plugin = wrapper.findAllComponents(SelectStub)[0]!
      plugin.vm.$emit('change', middle)
      await nextTick()
      plugin.vm.$emit('change', 'fake')
      await nextTick()
      await save(wrapper)
      expect(mocks.configuration).toHaveBeenCalledWith(
        { id: 11 },
        {
          version: 7,
          plugin_key: 'fake',
          config: { device_bindings: {} },
          device_codes: ['DEVICE-CURRENT', 'DEVICE-FREE']
        }
      )
    }
  )
  it('allows a new server plugin without frontend registration', async () => {
    const { wrapper } = mountDialog(workline({ plugin_key: 'future_plugin', config: {} }))
    await settle()
    expect(wrapper.text()).toContain('未来角色')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(false)
  })
  it('writes an empty config when no plugin is selected', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(workline())
    await settle()
    wrapper.findAllComponents(SelectStub)[0]!.vm.$emit('change', '')
    await nextTick()
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      { version: 7, plugin_key: null, config: {}, device_codes: ['DEVICE-CURRENT'] }
    )
  })
  it('omits cleared roles instead of sending empty strings', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(workline())
    await settle()
    await bind(wrapper, 'ROLE_A', '')
    await save(wrapper)
    expect(mocks.configuration.mock.calls[0]?.[1].config).toEqual({ device_bindings: {} })
  })
  it('rejects duplicate devices and preserves the entered bindings', async () => {
    const { wrapper } = mountDialog(workline())
    await settle()
    await bind(wrapper, 'ROLE_B', 'DEVICE-CURRENT')
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('不能重复')
    expect(roleSelect(wrapper, 'ROLE_B').props('modelValue')).toBe('DEVICE-CURRENT')
  })
  it.each(['DEVICE-OTHER', 'NOT-EXISTING', 'DEVICE-FREE'])(
    'rejects a code outside the selected physical set: %s',
    async code => {
      const { wrapper } = mountDialog(workline())
      await settle()
      await bind(wrapper, 'ROLE_A', code)
      await save(wrapper)
      expect(mocks.configuration).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('不在本次选中')
      expect(roleSelect(wrapper, 'ROLE_A').props('modelValue')).toBe(code)
    }
  )
  it.each(['DEVICE-CURRENT', null])('rejects a saved unknown role with value %j', async code => {
    const { wrapper } = mountDialog(
      workline({ config: { device_bindings: { UNKNOWN: code } } })
    )
    await settle()
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('未知设备角色')
  })
  it('preserves bindings on authoritative backend rejection', async () => {
    mocks.configuration.mockReturnValueOnce({
      send: vi.fn().mockRejectedValue(new Error('后端拒绝保存'))
    })
    const { wrapper } = mountDialog(workline())
    await settle()
    await save(wrapper)
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('后端拒绝保存'))
    expect(roleSelect(wrapper, 'ROLE_A').props('modelValue')).toBe('DEVICE-CURRENT')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
  it.each([42, false, {}, [], ''])('rejects a non-null invalid binding: %j', async code => {
    const { wrapper } = mountDialog(workline({ config: { device_bindings: { ROLE_A: code } } }))
    await settle()
    expect(wrapper.text()).toContain('设备角色绑定必须包含有效设备编码')
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
  })
  it('reopens an explicit null draft and allows completing the remaining role', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const first = mountDialog(workline())
    await settle()
    await save(first.wrapper)
    const config = mocks.configuration.mock.calls[0]![1].config
    first.wrapper.unmount()
    const second = mountDialog(
      workline({ config: { ...config, device_bindings: { ...config.device_bindings, ROLE_B: null } } })
    )
    await settle()
    expect(roleSelect(second.wrapper, 'ROLE_A').props('modelValue')).toBe('DEVICE-CURRENT')
    expect(roleSelect(second.wrapper, 'ROLE_B').props('modelValue')).toBe('')
    await second.wrapper.find('[aria-label="选择设备 DEVICE-FREE"]').setValue(true)
    await bind(second.wrapper, 'ROLE_B', 'DEVICE-FREE')
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    await save(second.wrapper)
    expect(mocks.configuration.mock.calls[1]![1].config).toEqual({
      device_bindings: { ROLE_A: 'DEVICE-CURRENT', ROLE_B: 'DEVICE-FREE' }
    })
  })
  it('keeps active bindings and save readonly, retaining deactivation blocker evidence', async () => {
    mocks.confirm.mockResolvedValueOnce('confirm')
    mocks.deactivate.mockReturnValueOnce({
      send: vi.fn().mockRejectedValue(new Error('Transport#9'))
    })
    const { wrapper } = mountDialog(workline({ is_active: true }))
    await settle()
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
    expect(wrapper.findAllComponents(SelectStub).every(select => select.props('disabled'))).toBe(
      true
    )
    const button = wrapper.findAll('button').find(button => button.text().includes('停用工作线'))!
    await button.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Transport#9')
    expect(mocks.configuration).not.toHaveBeenCalled()
  })
  it('blocks a saved plugin absent from the server list', async () => {
    const { wrapper } = mountDialog(workline({ plugin_key: 'removed_plugin', config: {} }))
    await settle()
    expect(wrapper.text()).toContain('未包含在部署清单中')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
  })
})
