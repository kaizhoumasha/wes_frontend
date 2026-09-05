/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick, type PropType } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DevicesItem } from '@/api/modules/devices'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { workLinesApiMethods } from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import WorkLineConfigurationDialog from '@/views/admin/worklines/components/WorkLineConfigurationDialog.vue'
import { createEmptyRoughSorterConfig } from '@/views/admin/worklines/config/roughSorterConfig'

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

const InputStub = defineComponent({
  name: 'ElInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        value: props.modelValue,
        disabled: props.disabled,
        onInput: (event: Event) =>
          emit('update:modelValue', (event.target as HTMLInputElement).value)
      })
  }
})

const InputNumberStub = defineComponent({
  name: 'ElInputNumber',
  inheritAttrs: false,
  props: { modelValue: { type: Number, default: 0 }, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        type: 'number',
        value: props.modelValue,
        disabled: props.disabled,
        onInput: (event: Event) =>
          emit('update:modelValue', Number((event.target as HTMLInputElement).value))
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

function validRoughSorter() {
  const config = createEmptyRoughSorterConfig()
  for (const contract of Object.values(config.device_contracts)) {
    Object.assign(contract, {
      ecs_version: '1.0',
      gateway_version: '1.0',
      device_model: 'MODEL-A',
      firmware_version: 'FW-1',
      status_max_age_ms: 1000,
      command_timeout_ms: 5000,
      time_source: 'PLC',
      allowed_clock_skew_ms: 500,
      callback_retry_window_ms: 30000,
      evidence_retention_days: 30
    })
  }
  Object.assign(config.position_bindings, {
    MEASUREMENT_POSITION: 'MEASURE-01',
    PIPELINE_INLET: 'INLET-01',
    PIPELINE_OUTLET: 'OUTLET-01',
    NG_POSITION: 'NG-01'
  })
  return config
}

function workline(overrides: Partial<Workline> = {}): Workline {
  return {
    id: 11,
    line_code: 'LINE-11',
    line_name: '一号粗分线',
    line_type: 'AUTO',
    run_mode: 'AUTO',
    is_active: false,
    version: 7,
    plugin_key: 'rough_sorter',
    config: { owner: 'WES', rough_sorter: validRoughSorter() },
    ...overrides
  }
}

function device(id: number, code: string, workLineId: number | null): DevicesItem {
  return {
    id,
    version: 1,
    device_code: code,
    device_name: code,
    device_role: 'TRANSFER_DEVICE',
    role_index: id,
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
            plugin_key: 'rough_sorter',
            plugin_version: '1.0.0',
            display_name: '粗分业务',
            supported_line_types: ['AUTO', 'MANUAL', 'HYBRID'],
            compatible: true,
            incompatibility_reasons: []
          },
          latest.plugin_key === 'future_plugin'
            ? {
                plugin_key: 'future_plugin',
                plugin_version: '1.0.0',
                display_name: '未来业务',
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

function mountDialog(latest: Workline, refresh = vi.fn().mockResolvedValue(undefined)) {
  configureLoad(latest)
  return {
    refresh,
    wrapper: mount(WorkLineConfigurationDialog, {
      props: { workline: latest, modelValue: true },
      global: {
        provide: { [CRUD_PAGE_REFRESH_KEY as symbol]: refresh },
        stubs: {
          StandardDialog: StandardDialogStub,
          ElButton: ButtonStub,
          ElCheckbox: CheckboxStub,
          ElInput: InputStub,
          ElInputNumber: InputNumberStub,
          ElForm: PassthroughStub,
          ElFormItem: PassthroughStub,
          ElAlert: AlertStub,
          ElTag: PassthroughStub,
          ElSelect: PassthroughStub,
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

describe('WorkLineConfigurationDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.hasPermission.mockReturnValue(true)
  })

  it('loads the three configuration sections and saves plugin config with the selected device set', async () => {
    mocks.configuration.mockReturnValueOnce(method(Promise.resolve({})))
    const { wrapper, refresh } = mountDialog(workline())
    await settle()

    expect(wrapper.text()).toContain('工作线状态')
    expect(wrapper.text()).toContain('设备全集')
    expect(wrapper.text()).toContain('业务插件')
    expect(
      wrapper.find('[aria-label="选择设备 DEVICE-OTHER"]').attributes('disabled')
    ).toBeDefined()

    await wrapper.find('[aria-label="选择设备 DEVICE-FREE"]').setValue(true)
    standardDialog(wrapper).vm.$emit('confirm')
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce())

    expect(workLinesApiMethods.configuration).toHaveBeenCalledWith(
      { id: 11 },
      {
        version: 7,
        plugin_key: 'rough_sorter',
        config: expect.objectContaining({ owner: 'WES', rough_sorter: expect.any(Object) }),
        device_codes: ['DEVICE-CURRENT', 'DEVICE-FREE']
      }
    )
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('keeps active lines read-only and shows the unfinished-task reason when deactivation is blocked', async () => {
    mocks.confirm.mockResolvedValueOnce('confirm')
    mocks.deactivate.mockReturnValueOnce({
      send: vi.fn().mockRejectedValue(new Error('存在未完成运行负载: Transport#9'))
    })
    const { wrapper } = mountDialog(workline({ is_active: true }))
    await settle()

    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
    expect(
      wrapper.findAll('input').every(input => input.attributes('disabled') !== undefined)
    ).toBe(true)

    const deactivateButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('停用工作线'))
    expect(deactivateButton).toBeDefined()
    await deactivateButton!.trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Transport#9'))

    expect(workLinesApiMethods.deactivate).toHaveBeenCalledWith({ id: 11 }, { version: 7 })
    expect(workLinesApiMethods.configuration).not.toHaveBeenCalled()
  })

  it('fails closed when a deployed plugin has no frontend configuration form', async () => {
    const { wrapper } = mountDialog(workline({ plugin_key: 'future_plugin', config: {} }))
    await settle()

    expect(wrapper.text()).toContain('尚无对应的前端配置表单')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
  })

  it('fails closed when the saved plugin is absent from the deployment catalog', async () => {
    const row = workline({ plugin_key: 'removed_plugin', config: {} })
    const { wrapper } = mountDialog(row)
    await settle()

    expect(wrapper.text()).toContain('未包含在部署清单中')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
  })
})
