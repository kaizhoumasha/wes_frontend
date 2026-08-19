import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CrudFormDialog from '@/components/common/CrudFormDialog.vue'
import CrudFormFieldRenderer from '@/components/common/crud-form/CrudFormFieldRenderer.vue'
import { flushPromises } from '../../../../utils/mount'
import {
  DeviceCreateFormSchema,
  DeviceUpdateFormSchema,
  devicePageFieldConfig
} from '@/views/admin/devices/config/fieldConfig'

const StandardDialogStub = defineComponent({
  name: 'StandardDialog',
  emits: ['update:modelValue', 'confirm'],
  setup(_, { emit, slots }) {
    return () => h('div', [
      slots.default?.(),
      h('button', { onClick: () => emit('confirm') }, 'confirm')
    ])
  }
})

const SlotStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  }
})

function mountDeviceForm(options: {
  editId: number | null
  cachedData?: Record<string, unknown>
}) {
  return mount(CrudFormDialog, {
    props: {
      open: true,
      editId: options.editId,
      cachedData: options.cachedData ?? null,
      schema: DeviceCreateFormSchema,
      updateSchema: DeviceUpdateFormSchema,
      fieldConfig: devicePageFieldConfig.form.fieldConfig
    },
    global: {
      stubs: {
        StandardDialog: StandardDialogStub,
        ElForm: SlotStub,
        ElFormItem: SlotStub,
        ElInput: SlotStub,
        ElSelect: SlotStub,
        ElOption: SlotStub,
        ElSwitch: SlotStub,
        ElCheckboxGroup: SlotStub,
        ElCheckbox: SlotStub,
        ElInputNumber: SlotStub,
        ElTreeSelect: SlotStub,
        ElDatePicker: SlotStub
      }
    }
  })
}

async function setFieldValue(
  wrapper: ReturnType<typeof mountDeviceForm>,
  key: string,
  value: unknown
) {
  const field = wrapper.findAllComponents(CrudFormFieldRenderer)
    .find(component => component.props('field').key === key)

  expect(field).toBeDefined()
  field!.vm.$emit('update:modelValue', value)
  await nextTick()
}

describe('Device Endpoint form', () => {
  it('submits null and retains version when an existing Endpoint is cleared in edit mode', async () => {
    const wrapper = mountDeviceForm({
      editId: 7,
      cachedData: {
        device_code: 'MEASURE-01',
        device_name: '测量设备 01',
        device_role: 'MEASUREMENT_DEVICE',
        endpoint_base_url: 'http://192.168.10.20:8000',
        version: 3
      }
    })
    await nextTick()

    await setFieldValue(wrapper, 'endpoint_base_url', '')
    wrapper.findComponent(StandardDialogStub).vm.$emit('confirm')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(wrapper.emitted('submit')?.at(0)?.[0]).toMatchObject({
      endpoint_base_url: null,
      version: 3
    })
  })

  it('submits null when a blank Endpoint is created', async () => {
    const wrapper = mountDeviceForm({ editId: null })
    await nextTick()

    await setFieldValue(wrapper, 'device_code', 'MEASURE-01')
    await setFieldValue(wrapper, 'device_name', '测量设备 01')
    await setFieldValue(wrapper, 'device_role', 'MEASUREMENT_DEVICE')
    await setFieldValue(wrapper, 'endpoint_base_url', '')
    wrapper.findComponent(StandardDialogStub).vm.$emit('confirm')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(wrapper.emitted('submit')?.at(0)?.[0]).toMatchObject({
      endpoint_base_url: null
    })
  })
})
