/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DevicesItem } from '@/api/modules/devices'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import WorkLineConfigurationDialog from '@/views/admin/worklines/components/WorkLineConfigurationDialog.vue'
import WorkLineBaseConfigurationDialog from '@/views/admin/worklines/components/WorkLineBaseConfigurationDialog.vue'
const mocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  getById: vi.fn(),
  availablePlugins: vi.fn(),
  configurationStatus: vi.fn(),
  configuration: vi.fn(),
  baseConfiguration: vi.fn(),
  updateBaseConfiguration: vi.fn(),
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
      baseConfiguration: mocks.baseConfiguration,
      updateBaseConfiguration: mocks.updateBaseConfiguration,
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
    config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' }, position_bindings: {} },
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
  mocks.baseConfiguration.mockReturnValueOnce(
    method(
      Promise.resolve({ ...baseConfiguration(), workline_id: latest.id, version: latest.version })
    )
  )
  mocks.getById.mockReturnValueOnce(method(Promise.resolve(latest)))
  mocks.availablePlugins.mockReturnValueOnce(
    method(
      Promise.resolve(
        [
          {
            plugin_key: 'fake',
            plugin_version: '1.0.0',
            display_name: '测试业务',
            position_slots: [
              {
                slot_key: 'INPUT',
                display_name: '入口工作位',
                position_type: 'RACK_POSITION',
                location_type: 'RACK_POSITION',
                allowed_rack_kind: 'FIVE_LAYER'
              }
            ],
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
  it('retains changed plugin roles when discard is cancelled', async () => {
    mocks.confirm.mockRejectedValue('cancel')
    const { wrapper } = mountDialog(workline())
    await settle()
    await bind(wrapper, 'ROLE_A', '')
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await flushPromises()
    expect(mocks.confirm).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(roleSelect(wrapper, 'ROLE_A').props('modelValue')).toBe('')
  })
  it('renders saved base devices read-only and saves only plugin bindings', async () => {
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
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('DEVICE-OTHER')
    expect(wrapper.text()).not.toContain('DEVICE-FREE')
    const positionSelect = wrapper
      .findAllComponents(SelectStub)
      .find(select => select.attributes('data-slot') === 'INPUT')!
    expect(wrapper.text()).toContain('入口工作位')
    positionSelect.vm.$emit('change', 'OTHER-LINE-POSITION')
    await nextTick()
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('不符合插槽 INPUT 要求')
    positionSelect.vm.$emit('change', 'WORK-1')
    await nextTick()
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: {
          device_bindings: { ROLE_A: 'DEVICE-CURRENT' },
          position_bindings: { INPUT: 'WORK-1' }
        }
      }
    )
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
    expect(refresh).toHaveBeenCalledOnce()
  })
  describe.each([
    ['device_bindings', '设备角色'],
    ['position_bindings', '工作位']
  ])('%s draft validation', (field, label) => {
    it.each([null, [], 'invalid', 42, false])(
      'blocks a non-object bindings draft: %j',
      async bindings => {
        const { wrapper } = mountDialog(workline({ config: { [field]: bindings } }))
        await settle()
        expect(wrapper.text()).toContain(`${label}绑定必须为对象`)
        expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
        await save(wrapper)
        expect(mocks.configuration).not.toHaveBeenCalled()
      }
    )
  })
  it.each([{ device_roles: [] }, {}])(
    'saves an installed plugin with no declared roles: %j',
    async roles => {
      mocks.availablePlugins.mockReturnValueOnce(
        method(
          Promise.resolve([
            {
              plugin_key: 'fake',
              plugin_version: '1.0.0',
              display_name: '无设备业务',
              supported_line_types: ['AUTO'],
              compatible: true,
              incompatibility_reasons: [],
              ...roles
            }
          ])
        )
      )
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
          config: { device_bindings: {}, position_bindings: {} }
        }
      )
    }
  )
  it('only exposes saved base devices and rejects a role referencing an unassigned device', async () => {
    const { wrapper } = mountDialog(workline())
    await settle()
    const choices = roleSelect(wrapper, 'ROLE_B')
      .findAll('el-option-stub')
      .map(option => option.attributes('value'))
    expect(choices).toEqual(['DEVICE-CURRENT'])
    await bind(wrapper, 'ROLE_B', 'DEVICE-FREE')
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('设备 DEVICE-FREE 不在本线已保存的物理设备集合中')
    expect(roleSelect(wrapper, 'ROLE_B').props('modelValue')).toBe('DEVICE-FREE')
    await bind(wrapper, 'ROLE_B', '')
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    await save(wrapper)
    expect(mocks.configuration.mock.calls[0]?.[1]).toEqual({
      version: 7,
      plugin_key: 'fake',
      config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' }, position_bindings: {} }
    })
  })
  it('saves only generic bindings when the loaded config contains retired plugin settings', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(
      workline({
        config: {
          device_bindings: { ROLE_A: 'DEVICE-CURRENT' },
          rough_sorter: { position_bindings: { NG_POSITION: 'OLD-POSITION' } }
        }
      })
    )
    await settle()
    await save(wrapper)
    expect(mocks.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'fake',
        config: { device_bindings: { ROLE_A: 'DEVICE-CURRENT' }, position_bindings: {} }
      }
    )
  })
  it.each(['', 'future_plugin'])(
    'clears bindings through %s and back, preserving physical devices',
    async middle => {
      mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
      const { wrapper } = mountDialog(workline())
      await settle()
      wrapper
        .findAllComponents(SelectStub)
        .find(select => select.attributes('data-slot') === 'INPUT')!
        .vm.$emit('change', 'WORK-1')
      await nextTick()
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
          config: { device_bindings: {}, position_bindings: {} }
        }
      )
    }
  )
  it.each([
    { position_type: 'STATION' },
    { allowed_rack_kind: 'RETURN' },
    { enabled: false },
    { logic_location_code: null }
  ])('rejects an incompatible saved position: %j', async change => {
    const base = baseConfiguration()
    mocks.baseConfiguration.mockReturnValueOnce(
      method(
        Promise.resolve({
          ...base,
          version: 7,
          positions: [{ ...base.positions[0], ...change }]
        })
      )
    )
    const { wrapper } = mountDialog(
      workline({
        config: {
          device_bindings: {},
          position_bindings: { INPUT: 'WORK-1' }
        }
      })
    )
    await settle()
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('不符合插槽 INPUT 要求')
    expect(wrapper.find('[data-slot="INPUT"]').attributes('data-value')).toBe('WORK-1')
  })

  it('rejects one position assigned to two plugin slots', async () => {
    mocks.availablePlugins.mockReturnValueOnce(
      method(
        Promise.resolve([
          {
            plugin_key: 'fake',
            plugin_version: '1.0.0',
            display_name: '双工作位业务',
            compatible: true,
            incompatibility_reasons: [],
            device_roles: [],
            position_slots: ['INPUT', 'OUTPUT'].map(slot_key => ({
              slot_key,
              display_name: slot_key,
              position_type: 'RACK_POSITION',
              location_type: 'RACK_POSITION',
              allowed_rack_kind: 'FIVE_LAYER'
            }))
          }
        ])
      )
    )
    const { wrapper } = mountDialog(
      workline({
        config: {
          device_bindings: {},
          position_bindings: { INPUT: 'WORK-1', OUTPUT: 'WORK-1' }
        }
      })
    )
    await settle()
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('工作位绑定不能重复')
  })

  it('blocks editing when separately loaded resource and plugin versions differ', async () => {
    mocks.baseConfiguration.mockReturnValueOnce(method(Promise.resolve(baseConfiguration())))
    const { wrapper } = mountDialog(workline())
    await settle()
    expect(wrapper.text()).toContain('配置已变化，请重新打开后编辑')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
    await save(wrapper)
    expect(mocks.configuration).not.toHaveBeenCalled()
  })

  it.each([true, false])(
    'loads devices beyond the first page or blocks incomplete results: %s',
    async complete => {
      mocks.queryDevices.mockReturnValueOnce(
        method(
          Promise.resolve({
            items: [device(1, 'DEVICE-CURRENT', 11)],
            total: 2,
            limit: 100,
            offset: 0
          })
        )
      )
      mocks.queryDevices.mockReturnValueOnce(
        method(
          Promise.resolve({
            items: complete ? [device(4, 'DEVICE-LATER', 11)] : [],
            total: 2,
            limit: 100,
            offset: 1
          })
        )
      )
      mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
      const { wrapper } = mountDialog(workline())
      await settle()
      expect(mocks.queryDevices).toHaveBeenCalledTimes(2)
      expect(mocks.queryDevices.mock.calls[1]![0]).toMatchObject({ offset: 1, limit: 100 })
      if (complete) {
        await bind(wrapper, 'ROLE_B', 'DEVICE-LATER')
        await save(wrapper)
        expect(mocks.configuration.mock.calls[0]![1].config.device_bindings).toEqual({
          ROLE_A: 'DEVICE-CURRENT',
          ROLE_B: 'DEVICE-LATER'
        })
      } else {
        expect(wrapper.text()).toContain('设备列表分页未返回剩余数据')
        expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
        await save(wrapper)
        expect(mocks.configuration).not.toHaveBeenCalled()
      }
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
      { version: 7, plugin_key: null, config: {} }
    )
  })
  it('omits cleared roles instead of sending empty strings', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper } = mountDialog(workline())
    await settle()
    await bind(wrapper, 'ROLE_A', '')
    await save(wrapper)
    expect(mocks.configuration.mock.calls[0]?.[1].config).toEqual({
      device_bindings: {},
      position_bindings: {}
    })
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
      expect(wrapper.text()).toContain('不在本线已保存')
      expect(roleSelect(wrapper, 'ROLE_A').props('modelValue')).toBe(code)
    }
  )
  it.each(['DEVICE-CURRENT', null])('rejects a saved unknown role with value %j', async code => {
    const { wrapper } = mountDialog(workline({ config: { device_bindings: { UNKNOWN: code } } }))
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
  it('reopens an explicit null draft and allows rebinding an existing base device', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const first = mountDialog(workline())
    await settle()
    await save(first.wrapper)
    const config = mocks.configuration.mock.calls[0]![1].config
    first.wrapper.unmount()
    const second = mountDialog(
      workline({
        config: { ...config, device_bindings: { ...config.device_bindings, ROLE_B: null } }
      })
    )
    await settle()
    expect(roleSelect(second.wrapper, 'ROLE_A').props('modelValue')).toBe('DEVICE-CURRENT')
    expect(roleSelect(second.wrapper, 'ROLE_B').props('modelValue')).toBe('')
    await bind(second.wrapper, 'ROLE_A', '')
    await bind(second.wrapper, 'ROLE_B', 'DEVICE-CURRENT')
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    await save(second.wrapper)
    expect(mocks.configuration.mock.calls[1]![1].config).toEqual({
      device_bindings: { ROLE_B: 'DEVICE-CURRENT' },
      position_bindings: {}
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

const InputStub = defineComponent({
  name: 'ElInput',
  props: { modelValue: { type: [String, Number], default: '' } },
  emits: ['update:modelValue'],
  setup: props => () => h('input', { value: props.modelValue })
})
const BaseCheckboxStub = defineComponent({
  name: 'ElCheckbox',
  props: { modelValue: Boolean, disabled: Boolean },
  emits: ['change'],
  setup:
    (props, { slots }) =>
    () =>
      h('label', [
        h('input', { type: 'checkbox', checked: props.modelValue, disabled: props.disabled }),
        slots.default?.()
      ])
})

function baseConfiguration() {
  return {
    workline_id: 11,
    version: 12,
    is_active: false,
    device_codes: ['DEVICE-CURRENT'],
    positions: [
      {
        position_code: 'WORK-1',
        position_type: 'RACK_POSITION',
        position_name: '五层货架位',
        position_role: 'SMT_SORTER_STATION',
        allowed_rack_kind: 'FIVE_LAYER',
        capacity: 1,
        device_id: 1,
        logic_location_code: 'LOGIC-1',
        external_location_code: null,
        priority: 100,
        enabled: true
      }
    ]
  }
}
function mountBase(base = baseConfiguration()) {
  mocks.baseConfiguration.mockReturnValueOnce(method(Promise.resolve(base)))
  mocks.queryDevices.mockReturnValueOnce(
    method(
      Promise.resolve({
        items: [
          device(1, 'DEVICE-CURRENT', 11),
          device(2, 'DEVICE-FREE', null),
          device(3, 'DEVICE-OTHER', 22)
        ],
        total: 3,
        limit: 100,
        offset: 0
      })
    )
  )
  return mount(WorkLineBaseConfigurationDialog, {
    props: { workline: workline(), modelValue: true },
    global: {
      stubs: {
        StandardDialog: StandardDialogStub,
        ElButton: ButtonStub,
        ElForm: PassthroughStub,
        ElFormItem: PassthroughStub,
        ElAlert: AlertStub,
        ElTag: PassthroughStub,
        ElSelect: SelectStub,
        ElOption: true,
        ElInput: InputStub,
        ElInputNumber: InputStub,
        ElSwitch: true,
        ElCheckbox: BaseCheckboxStub
      }
    }
  })
}

describe('WorkLine independent base configuration', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.hasPermission.mockReturnValue(true)
    mocks.updateBaseConfiguration.mockReturnValue(method(Promise.resolve({})))
  })

  it('saves only physical configuration with the latest base version and preserves position fields', async () => {
    const base = baseConfiguration()
    const wrapper = mountBase(base)
    await settle()
    await save(wrapper)
    expect(mocks.updateBaseConfiguration).toHaveBeenCalledWith(
      { id: 11 },
      { version: 12, device_codes: base.device_codes, positions: base.positions }
    )
    expect(mocks.configuration).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('adds a generic station and requires its code before saving', async () => {
    const wrapper = mountBase({ ...baseConfiguration(), positions: [] })
    await settle()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '添加工作位')!
      .trigger('click')
    expect(wrapper.findAll('.workline-base__card')).toHaveLength(1)
    await save(wrapper)
    expect(wrapper.text()).toContain('请填写每个工作位的编码和名称')
    expect(mocks.updateBaseConfiguration).not.toHaveBeenCalled()
    const positionType = wrapper.findAllComponents(SelectStub)[0]!
    positionType.vm.$emit('change', 'RACK_POSITION')
    await nextTick()
    expect(wrapper.find('.workline-base__rack').exists()).toBe(true)
    positionType.vm.$emit('change', 'STATION')
    await nextTick()
    expect(wrapper.find('.workline-base__rack').exists()).toBe(false)
    wrapper.findAllComponents(InputStub)[0]!.vm.$emit('update:modelValue', 'CNV0301')
    await nextTick()
    await save(wrapper)
    expect(mocks.updateBaseConfiguration.mock.calls[0]![1].positions[0]).toMatchObject({
      position_code: 'CNV0301',
      position_type: 'STATION',
      position_role: null,
      allowed_rack_kind: null
    })
  })

  it('prevents removing a position device and selecting equipment owned by another line', async () => {
    const wrapper = mountBase()
    await settle()
    const choices = wrapper.findAllComponents(BaseCheckboxStub)
    expect(choices[2]!.props('disabled')).toBe(true)
    choices[0]!.vm.$emit('change', false)
    choices[2]!.vm.$emit('change', true)
    choices[1]!.vm.$emit('change', true)
    await nextTick()
    expect(mocks.warning).toHaveBeenCalledWith('请先解除工作位与该设备的关联')
    await save(wrapper)
    expect(mocks.updateBaseConfiguration.mock.calls[0]![1].device_codes).toEqual([
      'DEVICE-CURRENT',
      'DEVICE-FREE'
    ])
  })

  it.each(['position_code', 'logic_location_code'] as const)(
    'rejects duplicate %s without partial writes',
    async key => {
      const base = baseConfiguration()
      base.positions.push({
        ...base.positions[0]!,
        position_code: 'WORK-2',
        logic_location_code: 'LOGIC-2',
        [key]: base.positions[0]![key]
      })
      const wrapper = mountBase(base)
      await settle()
      await save(wrapper)
      expect(wrapper.text()).toContain('编码不能重复')
      expect(mocks.updateBaseConfiguration).not.toHaveBeenCalled()
    }
  )

  it.each(['active', 'permission'])(
    'keeps %s configurations read-only even on forced confirm',
    async reason => {
      if (reason === 'permission') mocks.hasPermission.mockReturnValue(false)
      const wrapper = mountBase({ ...baseConfiguration(), is_active: reason === 'active' })
      await settle()
      expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
      await save(wrapper)
      expect(mocks.updateBaseConfiguration).not.toHaveBeenCalled()
    }
  )

  it('preserves the draft when the server rejects plugin-referenced equipment removal', async () => {
    mocks.updateBaseConfiguration.mockReturnValue({
      send: vi.fn().mockRejectedValue(new Error('请先解除相关角色绑定'))
    })
    const wrapper = mountBase()
    await settle()
    await save(wrapper)
    expect(wrapper.text()).toContain('请先解除相关角色绑定')
    expect(wrapper.findAll('.workline-base__card')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps unsaved edits when the discard confirmation is cancelled', async () => {
    mocks.confirm.mockRejectedValue('cancel')
    const wrapper = mountBase({ ...baseConfiguration(), positions: [] })
    await settle()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '添加工作位')!
      .trigger('click')
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await flushPromises()
    expect(mocks.confirm).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findAll('.workline-base__card')).toHaveLength(1)
  })
})
