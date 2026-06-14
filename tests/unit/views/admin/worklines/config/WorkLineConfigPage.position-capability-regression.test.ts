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
    manifest: vi.fn(
      (
        params: { plugin_key: string },
        query?: { contract_version?: string | null } | undefined
      ) => ({
        send: () => manifestSend({ ...params, ...query })
      })
    )
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
  line_name: 'SMT 入库分拣线',
  line_type: 'AUTO',
  zone_name: 'A区',
  run_mode: 'SIMULATION',
  runtime_status: 'READY',
  plugin_key: 'SMT_SORTING_INBOUND',
  contract_version: '1.0.0',
  description: '配置预检测试',
  is_active: false,
  version: 3
}

const manifest: WorkLinePluginManifestSummary = {
  plugin_key: 'SMT_SORTING_INBOUND',
  contract_version: '1.0.0',
  devices: [],
  events: [],
  commands: [],
  positions: [
    {
      code: 'TARGET_STATION',
      role: 'TARGET',
      station_code: 'TARGET_STATION',
      carrier_capability: {
        min_capacity: 1,
        max_capacity: 1,
        allowed_rack_kinds: ['FIVE_LAYER'],
        allowed_slot_kinds: ['BIN_SLOT']
      }
    },
    {
      code: 'NG_STATION',
      role: 'NG',
      station_code: 'NG_STATION',
      carrier_capability: {
        min_capacity: 0,
        max_capacity: 1,
        allowed_rack_kinds: ['SINGLE_LAYER'],
        allowed_slot_kinds: ['BIN_SLOT']
      }
    }
  ],
  resource_boundaries: [],
  topology: {
    flow_edges: []
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

describe('WorkLineConfigPage position capability diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getByIdSend.mockResolvedValue({ ...workline })
    configurationStatusSend.mockResolvedValue({
      can_activate: false,
      checks: [
        {
          code: 'COMMAND_TARGET_COMMUNICATION',
          status: 'PASS',
          severity: 'INFO',
          context: {
            device_code: 'SORT-TARGET-ARM-01',
            command_types: ['SORTING_TARGET_PLACE'],
            scheme: 'http',
            host: 'localhost',
            port: 8010,
            status_path: '/api/v1/device/status',
            missing_fields: []
          }
        },
        {
          code: 'POSITION_CARRIER_CAPABILITY',
          status: 'FAIL',
          severity: 'BLOCKER',
          context: {
            position_code: 'TARGET_STATION',
            position_role: 'TARGET',
            allowed_rack_kind: 'SINGLE_LAYER',
            allowed_rack_kinds: ['FIVE_LAYER'],
            capacity: 1,
            min_capacity: 1,
            max_capacity: 1
          }
        },
        {
          code: 'POSITION_CARRIER_CAPABILITY',
          status: 'FAIL',
          severity: 'BLOCKER',
          context: {
            position_code: 'NG_STATION',
            position_role: 'NG',
            missing_position_config: true,
            allowed_rack_kind: null,
            allowed_rack_kinds: ['SINGLE_LAYER'],
            capacity: null,
            min_capacity: 0,
            max_capacity: 1
          }
        }
      ]
    })
    devicesQuerySend.mockResolvedValue({ items: [] })
    optionsSend.mockResolvedValue([
      {
        plugin_key: 'SMT_SORTING_INBOUND',
        label: 'SMT 入库分拣',
        default_contract_version: '1.0.0',
        contract_versions: ['1.0.0']
      }
    ])
    manifestSend.mockResolvedValue({ ...manifest })
  })

  it('renders concrete blocker details for repeated position capability checks', async () => {
    const wrapper = await mountLoadedPage()
    const text = wrapper.text()

    expect(text).toContain('命令通讯: SORT-TARGET-ARM-01')
    expect(text).toContain('目标设备通讯配置完整')
    expect(text).toContain('逻辑位置: TARGET_STATION')
    expect(text).toContain('货架类型不匹配')
    expect(text).toContain('当前: SINGLE_LAYER')
    expect(text).toContain('期望: FIVE_LAYER')
    expect(text).toContain('逻辑位置: NG_STATION')
    expect(text).toContain('缺少位置配置')
    expect(text).toContain('角色 NG')
    expect(text).toContain('期望货架 SINGLE_LAYER')
  })

  it('renders disabled position as an actionable position capability blocker', async () => {
    configurationStatusSend.mockResolvedValueOnce({
      can_activate: false,
      checks: [
        {
          code: 'POSITION_CARRIER_CAPABILITY',
          status: 'FAIL',
          severity: 'BLOCKER',
          context: {
            position_code: 'TARGET_STATION',
            position_role: 'TARGET',
            allowed_rack_kind: 'FIVE_LAYER',
            allowed_rack_kinds: ['FIVE_LAYER'],
            capacity: 1,
            min_capacity: 1,
            max_capacity: 1,
            enabled: false
          }
        }
      ]
    })

    const wrapper = await mountLoadedPage()
    const text = wrapper.text()

    expect(text).toContain('逻辑位置: TARGET_STATION')
    expect(text).toContain('位置未启用')
    expect(text).not.toContain('位置能力不满足插件要求')
  })
})
