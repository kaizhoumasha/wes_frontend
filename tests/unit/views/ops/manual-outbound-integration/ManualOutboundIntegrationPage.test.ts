/* eslint-disable vue/one-component-per-file -- local Element Plus stubs expose dialog actions. */
import { defineComponent, nextTick } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IntegrationRun } from '@/api/manualOutboundIntegrationApi'
import ManualOutboundIntegrationPage from '@/views/ops/manual-outbound-integration/ManualOutboundIntegrationPage.vue'

const runState = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return {
    currentRun: ref<IntegrationRun | null>(null),
    runs: ref<IntegrationRun[]>([])
  }
})
const stateActions = vi.hoisted(() => ({
  load: vi.fn(),
  select: vi.fn(),
  create: vi.fn(),
  accept: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn()
}))
const api = vi.hoisted(() => ({
  transport: vi.fn(),
  rackDeparture: vi.fn(),
  confirmPhase: vi.fn()
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true })
}))
vi.mock('@/utils/uuid7', () => ({ createUuid7: () => 'request-1' }))
vi.mock('@/api/manualOutboundIntegrationApi', () => ({
  worklineIntegrationDebugApi: api
}))
vi.mock('@/views/ops/manual-outbound-integration/useManualOutboundIntegration', () => ({
  useManualOutboundIntegration: () => ({
    ...runState,
    loading: { value: false },
    lastError: { value: null },
    hasGap: { value: false },
    connectionState: { value: 'DISCONNECTED' },
    ...stateActions
  })
}))

const ElButtonStub = defineComponent({
  props: { disabled: Boolean },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>'
})
const ElDialogStub = defineComponent({
  props: { modelValue: Boolean, title: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template:
    '<section v-if="modelValue" :data-title="title"><slot /><slot name="footer" /></section>'
})

function snapshot(
  phase: 'RACK_TRANSPORT' | 'RACK_DEPARTURE',
  operationContext: Record<string, unknown>
): IntegrationRun {
  return {
    run_id: 'run-1',
    workline_id: 16,
    workline_code: 'KT16',
    scenario_key: 'manual_outbound_picking@v1',
    expected_plugin_key: 'manual_bin_processing',
    profile: 'CONTRACT_SIMULATION',
    environment_label: 'integration',
    operator_user_id: 1,
    status: 'ACTIVE',
    current_phase: phase,
    version: 7,
    task_id: 'TASK-001',
    issued_operation_id: 'issued-1',
    bin_code: 'BIN-001',
    device_code: 'STATION_SCAN10',
    rack_id: null,
    plan_resources: {
      plan_revision: 2,
      target_rack: { rack_id: '610007', rack_face: '90' },
      direct_picks: [],
      bin_source_racks: [{ rack_id: '510012', rack_face: '270', plan_revision: 2 }]
    },
    site_configuration: {
      outbound_rcs_template: 'CTU01',
      return_rcs_template: 'CTU03',
      bin_rack_positions: ['KT16'],
      outbound_transfer_position: 'OUT65',
      return_zone_code: 'WH05',
      infeed_position: 'CNV0301',
      outfeed_position: 'CNV0302',
      ecs_endpoint_base_url: 'http://10.24.209.26:8080/',
      scan_device_codes: ['SCAN9', 'SCAN10', 'SCAN11', 'SCAN12']
    },
    operation_context: operationContext,
    attention_code: null,
    attention_detail: null,
    wms_cleanup_confirmed: false,
    site_cleanup_confirmed: false,
    created_at: '2026-09-12T00:00:00Z',
    updated_at: '2026-09-12T00:00:00Z',
    steps: []
  }
}

async function mountCurrentRun(current: IntegrationRun) {
  runState.currentRun.value = current
  runState.runs.value = [current]
  api.transport.mockResolvedValue(current)
  api.rackDeparture.mockResolvedValue(current)
  api.confirmPhase.mockResolvedValue(current)
  const wrapper = shallowMount(ManualOutboundIntegrationPage, {
    global: {
      renderStubDefaultSlot: true,
      stubs: {
        ElAlert: true,
        ElButton: ElButtonStub,
        ElCheckbox: true,
        ElDialog: ElDialogStub,
        ElForm: true,
        ElFormItem: true,
        ElInput: true,
        ElInputNumber: true,
        ElOption: true,
        ElSelect: true,
        ElTable: true,
        ElTableColumn: true,
        RouterLink: true
      }
    }
  })
  await flushPromises()
  await nextTick()
  return wrapper
}

async function sendDefaultTransport(wrapper: ReturnType<typeof shallowMount>) {
  const open = wrapper.findAll('button').find(button => button.text() === 'Transport / RCS')
  expect(open).toBeDefined()
  await open!.trigger('click')
  await nextTick()
  const send = wrapper.findAll('button').find(button => button.text() === '创建一个任务')
  expect(send).toBeDefined()
  await send!.trigger('click')
  await flushPromises()
}

describe('ManualOutboundIntegrationPage transport defaults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateActions.load.mockResolvedValue(undefined)
  })

  it('rotates the current source rack at the single KT16 position with CTU02', async () => {
    const current = snapshot('RACK_TRANSPORT', {
      rack_transport_mode: 'ROTATE_SOURCE_RACK',
      current_source_rack: { rack_id: '510012', rack_face: '270' }
    })
    const wrapper = await mountCurrentRun(current)

    await sendDefaultTransport(wrapper)

    expect(api.transport).toHaveBeenCalledWith('run-1', {
      client_request_id: 'request-1',
      expected_version: 7,
      kind: 'ROTATE_RACK',
      rack_id: '510012',
      source: { kind: 'RACK_POSITION', location_code: 'KT16' },
      rcs_template_id: 'CTU02',
      target_face: '270'
    })
    wrapper.unmount()
  })

  it('moves the current source rack to KT16 instead of selecting the first planned rack', async () => {
    const current = snapshot('RACK_TRANSPORT', {
      rack_transport_mode: 'MOVE_SOURCE_RACK',
      current_source_rack: { rack_id: '510012', rack_face: '270' }
    })
    current.plan_resources!.bin_source_racks.unshift({
      rack_id: '510002',
      rack_face: '90',
      plan_revision: 1
    })
    const wrapper = await mountCurrentRun(current)

    await sendDefaultTransport(wrapper)

    expect(api.transport).toHaveBeenCalledWith('run-1', {
      client_request_id: 'request-1',
      expected_version: 7,
      kind: 'MOVE_RACK',
      rack_id: '510012',
      source: { kind: 'RACK', location_code: '510012' },
      target: { kind: 'RACK_POSITION', location_code: 'KT16' },
      rcs_template_id: 'CTU01',
      target_face: '270'
    })
    wrapper.unmount()
  })

  it.each([
    ['SOURCE_RACK', '510012', 'CTU03'],
    ['TARGET_RACK', '610007', 'F01']
  ] as const)(
    'uses the %s departure candidate and matching RCS template',
    async (role, rackId, template) => {
      const current = snapshot('RACK_DEPARTURE', {
        departure_candidate: {
          rack_id: rackId,
          rack_face: role === 'SOURCE_RACK' ? '270' : '90',
          current_location: role === 'SOURCE_RACK' ? 'KT16' : 'OUT65',
          role
        }
      })
      const wrapper = await mountCurrentRun(current)

      await sendDefaultTransport(wrapper)

      expect(api.transport).toHaveBeenCalledWith(
        'run-1',
        expect.objectContaining({
          expected_version: 7,
          kind: 'MOVE_RACK',
          rack_id: rackId,
          source: { kind: 'RACK', location_code: rackId },
          target: { kind: 'ZONE', location_code: 'WH05' },
          rcs_template_id: template
        })
      )
      wrapper.unmount()
    }
  )

  it('does not reuse a previous rack READY decision for the next departure candidate', async () => {
    const current = snapshot('RACK_DEPARTURE', {
      source_cycle_no: 2,
      departure_candidate: {
        rack_id: '510013',
        rack_face: '180',
        current_location: 'KT16',
        role: 'SOURCE_RACK'
      }
    })
    current.steps.push({
      ordinal: 4,
      phase: 'RACK_DEPARTURE',
      status: 'SUCCEEDED',
      operation: 'outbound.rack.departure_decide@v1',
      request: {
        rack_id: '510012',
        current_face: '270',
        current_location: { type: 'RACK_POSITION', location_code: 'KT16' }
      },
      result: { response_result: 'READY' },
      created_at: '2026-09-12T00:00:00Z'
    } as IntegrationRun['steps'][number])
    const wrapper = await mountCurrentRun(current)

    const primary = wrapper
      .findAll('button')
      .find(button => button.text() === '发送 departure_decide')
    expect(primary).toBeDefined()
    await primary!.trigger('click')
    await flushPromises()

    expect(api.rackDeparture).toHaveBeenCalledWith(
      'run-1',
      expect.objectContaining({
        expected_version: 7,
        data: {
          task_id: 'TASK-001',
          rack_id: '510013',
          current_location: { type: 'RACK_POSITION', location_code: 'KT16' },
          current_face: '180'
        }
      })
    )
    expect(api.confirmPhase).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('refreshes departure defaults when the candidate changes in the same phase', async () => {
    const current = snapshot('RACK_DEPARTURE', {
      source_cycle_no: 1,
      departure_candidate: {
        rack_id: '510012',
        rack_face: '270',
        current_location: 'KT16',
        role: 'SOURCE_RACK'
      }
    })
    const wrapper = await mountCurrentRun(current)
    runState.currentRun.value = {
      ...current,
      version: 8,
      operation_context: {
        source_cycle_no: 2,
        departure_candidate: {
          rack_id: '610007',
          rack_face: '90',
          current_location: 'OUT65',
          role: 'TARGET_RACK'
        }
      }
    }
    await nextTick()

    const primary = wrapper
      .findAll('button')
      .find(button => button.text() === '发送 departure_decide')
    await primary!.trigger('click')
    await flushPromises()

    expect(api.rackDeparture).toHaveBeenCalledWith(
      'run-1',
      expect.objectContaining({
        expected_version: 8,
        data: {
          task_id: 'TASK-001',
          rack_id: '610007',
          current_location: { type: 'RACK_POSITION', location_code: 'OUT65' },
          current_face: '90'
        }
      })
    )
    wrapper.unmount()
  })

  it('fails closed when the departure candidate is missing', async () => {
    const wrapper = await mountCurrentRun(snapshot('RACK_DEPARTURE', {}))

    const primary = wrapper
      .findAll('button')
      .find(button => button.text() === '发送 departure_decide')
    const transport = wrapper.findAll('button').find(button => button.text() === 'Transport / RCS')
    expect(primary?.attributes('disabled')).toBeDefined()
    expect(transport?.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('本页不会按计划货架猜测')

    wrapper.unmount()
  })
})
