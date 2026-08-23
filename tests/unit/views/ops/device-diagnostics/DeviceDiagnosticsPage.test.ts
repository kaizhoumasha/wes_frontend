/* eslint-disable vue/one-component-per-file -- test-local component stubs */
import { defineComponent, nextTick, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DeviceDiagnosticsPage from '@/views/ops/device-diagnostics/DeviceDiagnosticsPage.vue'

const streamMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  reconnect: vi.fn(),
  disconnect: vi.fn(),
  clear: vi.fn(),
  setFilters: vi.fn()
}))

vi.mock('@/views/ops/device-diagnostics/useDeviceEvidenceStream', () => ({
  useDeviceEvidenceStream: () => ({
    rows: ref([]),
    connectionState: ref('CONNECTED'),
    lastError: ref(null),
    totalPayloadBytes: ref(128),
    ...streamMocks
  })
}))

const dialogOpen = vi.fn()
const ManualDialogStub = defineComponent({
  name: 'ManualDebugCommandDialog',
  setup(_, { expose }) {
    expose({ open: dialogOpen })
    return () => null
  }
})
const EvidenceTableStub = defineComponent({
  name: 'DeviceEvidenceTable',
  emits: ['debug'],
  template:
    '<button class="row-debug" @click="$emit(\'debug\', \'ARM-01\', $event.currentTarget)">row</button>'
})
const AppButtonStub = defineComponent({
  name: 'AppButton',
  emits: ['click'],
  template: '<button @click="$emit(\'click\', $event)"><slot /></button>'
})

describe('DeviceDiagnosticsPage', () => {
  it('connects live-only stream, maps filters and exposes clear/reconnect controls', async () => {
    const wrapper = shallowMount(DeviceDiagnosticsPage, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          ManualDebugCommandDialog: ManualDialogStub,
          DeviceEvidenceTable: EvidenceTableStub,
          AppButton: AppButtonStub,
          ElInput: true,
          ElSelect: true,
          ElOption: true
        }
      }
    })
    expect(streamMocks.connect).toHaveBeenCalledOnce()
    const exposed = wrapper.vm as unknown as {
      filterForm: { deviceCode: string; kind: string; commandCode: string; applyStatus: string }
      applyFilters: () => void
    }
    Object.assign(exposed.filterForm, {
      deviceCode: 'ARM-01',
      kind: 'DEVICE_EVENT',
      commandCode: '',
      applyStatus: 'RECONCILING'
    })
    exposed.applyFilters()
    expect(streamMocks.setFilters).toHaveBeenCalledWith({
      device_code: 'ARM-01',
      kind: 'DEVICE_EVENT',
      apply_status: 'RECONCILING'
    })

    const buttons = wrapper.findAll('button')
    await buttons.find(button => button.text().includes('清空'))?.trigger('click')
    await buttons.find(button => button.text().includes('重连'))?.trigger('click')
    expect(streamMocks.clear).toHaveBeenCalledOnce()
    expect(streamMocks.reconnect).toHaveBeenCalledOnce()
  })

  it('opens row and global real-command launchers with focus restoration targets', async () => {
    const wrapper = shallowMount(DeviceDiagnosticsPage, {
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          ManualDebugCommandDialog: ManualDialogStub,
          DeviceEvidenceTable: EvidenceTableStub,
          AppButton: AppButtonStub,
          ElInput: true,
          ElSelect: true,
          ElOption: true
        }
      }
    })
    await wrapper.find('.row-debug').trigger('click')
    expect(dialogOpen).toHaveBeenLastCalledWith('ARM-01', expect.any(HTMLElement))

    const globalButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('现场联调下发'))
    await globalButton?.trigger('click')
    await nextTick()
    expect(dialogOpen).toHaveBeenLastCalledWith(undefined, expect.any(HTMLElement))
  })
})
