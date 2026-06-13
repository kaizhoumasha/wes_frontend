/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vue/one-component-per-file */
import { computed, defineComponent, h, inject, nextTick, provide, type ComputedRef } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WorkLineConfigPage from '@/views/admin/worklines/config/WorkLineConfigPage.vue'
import type { components } from '@/api/generated/openapi-types'

type WorkLinePluginManifestSummary = components['schemas']['WorkLinePluginManifestSummary']

const routeMock = {
  params: {
    id: '45'
  }
}

const routerMock = {
  push: vi.fn()
}

const getByIdSend = vi.fn()
const configurationStatusSend = vi.fn()
const devicesQuerySend = vi.fn()
const optionsSend = vi.fn()
const manifestSend = vi.fn()
const elementPlusMocks = vi.hoisted(() => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  messageBox: {
    confirm: vi.fn()
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => routerMock
}))

vi.mock('@/api/modules/workLines', () => ({
  workLinesApiMethods: {
    getById: vi.fn(() => ({ send: getByIdSend })),
    configurationStatus: vi.fn(() => ({ send: configurationStatusSend })),
    update: vi.fn(() => ({ send: vi.fn() })),
    activate: vi.fn(() => ({ send: vi.fn() })),
    deactivate: vi.fn(() => ({ send: vi.fn() }))
  }
}))

vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: {
    options: vi.fn(() => ({ send: optionsSend })),
    manifest: vi.fn((params: { plugin_key: string }) => ({
      send: () => manifestSend(params)
    }))
  }
}))

vi.mock('@/api/modules/devices', () => ({
  devicesApiMethods: {
    query: vi.fn(() => ({ send: devicesQuerySend })),
    update: vi.fn(() => ({ send: vi.fn() }))
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: elementPlusMocks.message,
  ElMessageBox: elementPlusMocks.messageBox
}))

const TableDataKey = Symbol('table-data')

const ElTableStub = defineComponent({
  name: 'ElTableStub',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { slots }) {
    provide(
      TableDataKey,
      computed(() => props.data as any[])
    )
    return () => h('div', { class: 'el-table-stub' }, slots.default?.())
  }
})

const ElTableColumnStub = defineComponent({
  name: 'ElTableColumnStub',
  setup(_, { slots }) {
    const data = inject<ComputedRef<any[]>>(TableDataKey)
    return () =>
      h(
        'div',
        { class: 'el-table-column-stub' },
        (data?.value ?? []).flatMap(row => slots.default?.({ row }) ?? [])
      )
  }
})

const SlotStub = defineComponent({
  name: 'SlotStub',
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  }
})

const OptionStub = defineComponent({
  name: 'OptionStub',
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return () => h('div', { class: 'el-option-stub' }, [props.label, props.value])
  }
})

const ButtonStub = defineComponent({
  name: 'ButtonStub',
  emits: ['click'],
  setup(_, { slots, emit }) {
    return () => h('button', { onClick: () => emit('click') }, slots.default?.())
  }
})

const workline = {
  id: 45,
  line_code: 'WL-45',
  line_name: '粗分线',
  line_type: 'AUTO',
  zone_name: 'A区',
  run_mode: 'SIMULATION',
  runtime_status: 'READY',
  plugin_key: 'rough_sorter',
  contract_version: 'v2',
  description: '配置页测试',
  is_active: false,
  version: 3
}

const manifest: WorkLinePluginManifestSummary = {
  plugin_key: 'rough_sorter',
  contract_version: 'v2',
  devices: [
    {
      role: 'SOURCE_SCANNER',
      min_count: 1,
      max_count: 1,
      hardware_capabilities: ['barcode.read']
    },
    {
      role: 'TARGET_ARM',
      min_count: 1,
      max_count: null,
      hardware_capabilities: ['rack.move']
    }
  ],
  events: [
    {
      event: 'RACK_SCAN_COMPLETED',
      category: 'SOURCE',
      source_device_roles: ['SOURCE_SCANNER'],
      payload_schema_ref: 'schemas/events/rack-scan-completed.json'
    }
  ],
  commands: [
    {
      command: 'MOVE_RACK_TO_TARGET',
      target_device_role: 'TARGET_ARM',
      payload_schema_ref: 'schemas/commands/move-rack-to-target.json',
      position_args: [],
      result_bindings: []
    }
  ],
  positions: [
    {
      code: 'SOURCE_PORT',
      role: 'SOURCE',
      station_code: 'SOURCE_STATION',
      carrier_capability: {
        min_capacity: 0,
        max_capacity: 1,
        allowed_rack_kinds: ['SINGLE_LAYER'],
        allowed_slot_kinds: ['BIN_SLOT']
      }
    }
  ],
  resource_boundaries: [
    {
      position_code: 'SOURCE_PORT',
      rack_kind: 'SINGLE_LAYER',
      business_demand_type: 'SORTING_SOURCE',
      wms_operation_type: 'RACK_MOVE',
      snapshot_kind: 'ACTIVE_BIN_RACK',
      lease_scope: 'POSITION'
    }
  ],
  topology: {
    flow_edges: [
      {
        type: 'material_flow',
        from_node: { kind: 'device_role', ref: 'SOURCE_SCANNER' },
        to_node: { kind: 'position', ref: 'SOURCE_PORT' }
      }
    ]
  }
}

function mountPage() {
  return shallowMount(WorkLineConfigPage, {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        ElButton: ButtonStub,
        ElCard: SlotStub,
        ElDescriptions: SlotStub,
        ElDescriptionsItem: SlotStub,
        ElDialog: SlotStub,
        ElForm: SlotStub,
        ElFormItem: SlotStub,
        ElInput: SlotStub,
        ElOption: OptionStub,
        ElSelect: SlotStub,
        ElTable: ElTableStub,
        ElTableColumn: ElTableColumnStub,
        ElTag: SlotStub,
        ElTooltip: SlotStub,
        ElAlert: SlotStub
      }
    }
  })
}

async function flushPageUpdates() {
  await flushPromises()
  await nextTick()
  await flushPromises()
  await nextTick()
}

async function mountLoadedPage() {
  const wrapper = mountPage()
  await flushPageUpdates()
  return wrapper
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

describe('WorkLineConfigPage manifest detail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getByIdSend.mockResolvedValue({ ...workline })
    configurationStatusSend.mockResolvedValue({
      can_activate: true,
      checks: []
    })
    devicesQuerySend.mockResolvedValue({
      items: [
        {
          id: 101,
          device_code: 'SCAN-01',
          device_name: '扫描器 1',
          device_role: 'SOURCE_SCANNER',
          is_active: true,
          version: 1,
          work_line_id: 45,
          capabilities_json: ['barcode.read']
        },
        {
          id: 102,
          device_code: 'ARM-01',
          device_name: '机械臂 1',
          device_role: 'TARGET_ARM',
          is_active: true,
          version: 1,
          work_line_id: 45,
          capabilities_json: ['rack.move']
        }
      ]
    })
    optionsSend.mockResolvedValue([
      {
        plugin_key: 'rough_sorter',
        label: '粗分线插件',
        default_contract_version: 'v2',
        contract_versions: ['v2']
      }
    ])
    manifestSend.mockResolvedValue({ ...manifest })
  })

  it('renders plugin option label and key when selector options contain no device roles', async () => {
    const wrapper = await mountLoadedPage()

    expect(optionsSend).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('粗分线插件')
    expect(wrapper.text()).toContain('rough_sorter')
  })

  it('loads selected plugin manifest detail by plugin_key', async () => {
    await mountLoadedPage()

    expect(manifestSend).toHaveBeenCalledWith({ plugin_key: 'rough_sorter' })
  })

  it('builds role coverage from manifest devices instead of plugin options', async () => {
    const wrapper = await mountLoadedPage()

    expect(wrapper.text()).toContain('SOURCE_SCANNER')
    expect(wrapper.text()).toContain('TARGET_ARM')
    expect(wrapper.text()).toContain('SCAN-01')
    expect(wrapper.text()).toContain('ARM-01')
  })

  it('renders event tags from manifest events', async () => {
    const wrapper = await mountLoadedPage()

    expect(wrapper.text()).toContain('RACK_SCAN_COMPLETED')
  })

  it('renders command tags from manifest commands', async () => {
    const wrapper = await mountLoadedPage()

    expect(wrapper.text()).toContain('MOVE_RACK_TO_TARGET')
  })

  it('keeps the page usable when options only contain selector fields', async () => {
    const wrapper = await mountLoadedPage()

    expect(wrapper.text()).toContain('粗分线')
    expect(wrapper.text()).toContain('WL-45')
    expect(wrapper.text()).toContain('粗分线插件')
    expect(wrapper.text()).toContain('SOURCE_SCANNER')
    expect(wrapper.text()).toContain('RACK_SCAN_COMPLETED')
    expect(wrapper.text()).toContain('MOVE_RACK_TO_TARGET')
  })

  it('keeps base status and device data available when manifest detail fails to load', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    manifestSend.mockRejectedValueOnce(new Error('manifest unavailable'))

    try {
      const wrapper = mountPage()

      await flushPageUpdates()

      expect(configurationStatusSend).toHaveBeenCalledTimes(1)
      expect(devicesQuerySend).toHaveBeenCalledTimes(1)
      expect(wrapper.text()).toContain('粗分线')
      expect(wrapper.text()).toContain('WL-45')
      expect(wrapper.text()).not.toContain('RACK_SCAN_COMPLETED')
      expect(consoleErrorSpy).toHaveBeenCalledWith('加载插件合同详情失败:', expect.any(Error))
      expect(elementPlusMocks.message.error).toHaveBeenCalledWith('manifest unavailable')
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('reloads manifest detail when refreshed workline contract version changes', async () => {
    const wrapper = mountPage()
    await flushPageUpdates()

    manifestSend.mockClear()
    getByIdSend.mockResolvedValueOnce({
      ...workline,
      contract_version: 'v3',
      version: 4
    })

    const refreshButton = wrapper.findAll('button').find(button => button.text().includes('刷新状态'))
    expect(refreshButton).toBeDefined()
    await refreshButton!.trigger('click')
    await flushPageUpdates()

    expect(manifestSend).toHaveBeenCalledTimes(1)
    expect(manifestSend).toHaveBeenCalledWith({ plugin_key: 'rough_sorter' })
    expect(wrapper.text()).toContain('v3')
  })

  it('does not reload manifest detail when manual refresh keeps the same plugin and contract', async () => {
    const wrapper = await mountLoadedPage()

    manifestSend.mockClear()
    getByIdSend.mockResolvedValueOnce({
      ...workline,
      version: 4
    })

    const refreshButton = wrapper.findAll('button').find(button => button.text().includes('刷新状态'))
    expect(refreshButton).toBeDefined()
    await refreshButton!.trigger('click')
    await flushPageUpdates()

    expect(manifestSend).not.toHaveBeenCalled()
  })

  it('does not duplicate same-key manifest request while the current request is pending', async () => {
    const pendingManifestRequest = createDeferred<WorkLinePluginManifestSummary>()
    manifestSend.mockReturnValueOnce(pendingManifestRequest.promise)

    const wrapper = mountPage()
    await flushPageUpdates()

    getByIdSend.mockResolvedValueOnce({
      ...workline,
      version: 4
    })

    const refreshButton = wrapper.findAll('button').find(button => button.text().includes('刷新状态'))
    expect(refreshButton).toBeDefined()
    await refreshButton!.trigger('click')
    await flushPageUpdates()

    expect(manifestSend).toHaveBeenCalledTimes(1)

    pendingManifestRequest.resolve({ ...manifest })
    await flushPageUpdates()

    expect(wrapper.text()).toContain('RACK_SCAN_COMPLETED')
    expect(elementPlusMocks.message.error).not.toHaveBeenCalled()
  })

  it('retries manifest detail on same-key manual refresh after a transient failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    manifestSend.mockRejectedValueOnce(new Error('transient manifest unavailable'))

    try {
      const wrapper = mountPage()
      await flushPageUpdates()

      expect(wrapper.text()).not.toContain('RACK_SCAN_COMPLETED')
      expect(elementPlusMocks.message.error).toHaveBeenCalledWith(
        'transient manifest unavailable'
      )

      manifestSend.mockClear()
      elementPlusMocks.message.error.mockClear()
      getByIdSend.mockResolvedValueOnce({
        ...workline,
        version: 4
      })
      manifestSend.mockResolvedValueOnce({ ...manifest })

      const refreshButton = wrapper.findAll('button').find(button => button.text().includes('刷新状态'))
      expect(refreshButton).toBeDefined()
      await refreshButton!.trigger('click')
      await flushPageUpdates()

      expect(manifestSend).toHaveBeenCalledTimes(1)
      expect(manifestSend).toHaveBeenCalledWith({ plugin_key: 'rough_sorter' })
      expect(wrapper.text()).toContain('RACK_SCAN_COMPLETED')
      expect(elementPlusMocks.message.error).not.toHaveBeenCalled()
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('does not show stale manifest errors after a newer manifest request succeeds', async () => {
    const firstManifestRequest = createDeferred<WorkLinePluginManifestSummary>()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    manifestSend
      .mockReturnValueOnce(firstManifestRequest.promise)
      .mockResolvedValueOnce({
        ...manifest,
        plugin_key: 'rough_sorter_v2',
        contract_version: 'v3'
      })

    try {
      const wrapper = mountPage()
      await flushPageUpdates()

      getByIdSend.mockResolvedValueOnce({
        ...workline,
        plugin_key: 'rough_sorter_v2',
        contract_version: 'v3',
        version: 4
      })

      const refreshButton = wrapper.findAll('button').find(button => button.text().includes('刷新状态'))
      expect(refreshButton).toBeDefined()
      await refreshButton!.trigger('click')
      await flushPageUpdates()

      firstManifestRequest.reject(new Error('stale manifest unavailable'))
      await flushPageUpdates()

      expect(manifestSend).toHaveBeenCalledTimes(2)
      expect(wrapper.text()).toContain('v3')
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        '加载插件合同详情失败:',
        expect.any(Error)
      )
      expect(elementPlusMocks.message.error).not.toHaveBeenCalledWith(
        'stale manifest unavailable'
      )
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })
})
