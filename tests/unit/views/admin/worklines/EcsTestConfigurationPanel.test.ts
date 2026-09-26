import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import WorkLineConfigurationWorkspace from '@/views/admin/worklines/components/WorkLineConfigurationWorkspace.vue'

const mocks = vi.hoisted(() => ({
  getWorkline: vi.fn(),
  updateWorkline: vi.fn(),
  getDefault: vi.fn(),
  putDefault: vi.fn(),
  fetchDevices: vi.fn(),
  confirm: vi.fn(),
  hasPermission: vi.fn(),
  refresh: vi.fn(),
  warning: vi.fn()
}))

vi.mock('@/api/modules/workLines', () => ({
  workLinesApiMethods: {
    getById: mocks.getWorkline,
    update: mocks.updateWorkline
  }
}))

vi.mock('@/api/modules/devices', () => ({
  devicesApiMethods: {
    ecsTestDefault: mocks.getDefault,
    updateEcsTestDefault: mocks.putDefault
  }
}))

vi.mock('@/views/admin/worklines/components/fetchWorkLineDevices', () => ({
  fetchWorkLineDevices: mocks.fetchDevices
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: mocks.hasPermission })
}))

vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: mocks.warning },
  ElMessageBox: { confirm: mocks.confirm }
}))

const devices = [
  { id: 1, device_code: 'SOURCE_A', device_name: '来源 A', work_line_id: 9 },
  { id: 2, device_code: 'TARGET_A', device_name: '目标 A', work_line_id: 9 },
  { id: 3, device_code: 'SOURCE_B', device_name: '来源 B', work_line_id: 9 }
]

const defaultRule = {
  target_device_code: 'TARGET_A',
  task_type: 'MOVE_FORWARD',
  params: { source: { location_id: 'SOURCE_A' } }
}

function workline(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    version: 12,
    line_name: '调试线',
    run_mode: 'AUTO',
    is_active: false,
    runtime_config_json: {
      retry_limit: 2,
      ecs_test_rules: [
        {
          source_device_code: 'SOURCE_B',
          target_device_code: 'TARGET_A',
          task_type: 'MOVE_FORWARD',
          params: { retained: true }
        }
      ]
    },
    ...overrides
  }
}

const inputStub = {
  props: ['modelValue', 'type', 'disabled'],
  emits: ['update:modelValue'],
  template:
    '<textarea v-if="type === \'textarea\'" v-bind="$attrs" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" /><input v-else v-bind="$attrs" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />'
}

const global = {
  stubs: {
    WorkLineBaseConfigurationPanel: true,
    WorkLineBusinessConfigurationPanel: true,
    WorkLineConfigurationActions: {
      props: ['confirmText', 'confirmDisabled'],
      emits: ['confirm', 'continue', 'close'],
      template:
        '<footer><button :disabled="confirmDisabled" @click="$emit(\'confirm\')">{{ confirmText }}</button></footer>'
    },
    ElButton: {
      props: ['disabled', 'loading'],
      emits: ['click'],
      template:
        '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>'
    },
    ElInput: inputStub,
    ElSelect: {
      props: ['modelValue', 'disabled'],
      emits: ['update:modelValue', 'change'],
      template:
        '<select v-bind="$attrs" :value="modelValue" :disabled="disabled" @change="$emit(\'change\', $event.target.value); $emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
    },
    ElOption: {
      props: ['value', 'label'],
      template: '<option :value="value">{{ label }}</option>'
    },
    ElAlert: {
      props: ['title'],
      template: '<div role="alert">{{ title }}<slot /></div>'
    }
  },
  directives: { loading: {} }
}

async function openEcsTestPanel(line = workline(), configure?: () => void) {
  mocks.hasPermission.mockReturnValue(true)
  mocks.getWorkline.mockReturnValue({ send: vi.fn().mockResolvedValue(line) })
  mocks.updateWorkline.mockReturnValue({
    send: vi.fn().mockImplementation(async (_params: unknown, body: Record<string, unknown>) => ({
      ...line,
      ...body,
      version: 13
    }))
  })
  mocks.fetchDevices.mockResolvedValue(devices)
  mocks.getDefault.mockReturnValue({
    send: vi.fn().mockResolvedValue({
      device_id: 1,
      device_code: 'SOURCE_A',
      device_version: 5,
      default: defaultRule
    })
  })
  mocks.putDefault.mockReturnValue({ send: vi.fn().mockResolvedValue({}) })
  mocks.confirm.mockResolvedValue('confirm')
  mocks.refresh.mockResolvedValue(undefined)
  configure?.()

  const wrapper = mount(WorkLineConfigurationWorkspace, {
    props: { workline: { id: 9 }, modelValue: true, initialSection: 'ecs-test' },
    global: {
      ...global,
      provide: { [CRUD_PAGE_REFRESH_KEY]: mocks.refresh }
    }
  })
  await flushPromises()
  return wrapper
}

describe('WorkLine ECS_TEST default editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefills the selected source form from its saved Device default', async () => {
    const wrapper = await openEcsTestPanel()
    const source = wrapper.find('select[aria-label="来源设备"]')
    expect(source.exists()).toBe(true)
    await source.setValue('SOURCE_A')
    await flushPromises()

    expect(mocks.getDefault).toHaveBeenCalledWith({ device_code: 'SOURCE_A' })
    expect(
      (wrapper.get('input[aria-label="目标设备编码"]').element as HTMLInputElement).value
    ).toBe('TARGET_A')
    expect((wrapper.get('input[aria-label="task_type"]').element as HTMLInputElement).value).toBe(
      'MOVE_FORWARD'
    )
    expect(
      (wrapper.get('textarea[aria-label="params JSON"]').element as HTMLTextAreaElement).value
    ).toContain('SOURCE_A')
  })

  it('saves params explicitly as a Device default without applying or starting the WorkLine', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('{}')
    const saveDefault = wrapper
      .findAll('button')
      .find(button => button.text() === '保存为该设备默认值')
    expect(saveDefault).toBeDefined()
    await saveDefault!.trigger('click')
    await flushPromises()

    expect(mocks.putDefault).toHaveBeenCalledWith(
      { device_code: 'SOURCE_A' },
      {
        default: { target_device_code: 'TARGET_A', task_type: 'MOVE_FORWARD', params: {} }
      }
    )
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('applies a source rule while preserving other WorkLine rules and runtime settings', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    const apply = wrapper.findAll('button').find(button => button.text() === '应用 ECS_TEST 配置')
    expect(apply).toBeDefined()
    await apply!.trigger('click')
    await flushPromises()

    expect(mocks.updateWorkline).toHaveBeenCalledWith(9, {
      version: 12,
      run_mode: 'ECS_TEST',
      runtime_config_json: {
        retry_limit: 2,
        ecs_test_rules: [
          {
            source_device_code: 'SOURCE_B',
            target_device_code: 'TARGET_A',
            task_type: 'MOVE_FORWARD',
            params: { retained: true }
          },
          {
            source_device_code: 'SOURCE_A',
            target_device_code: 'TARGET_A',
            task_type: 'MOVE_FORWARD',
            params: { source: { location_id: 'SOURCE_A' } }
          }
        ]
      }
    })
    expect(mocks.putDefault).not.toHaveBeenCalled()
  })

  it('clears only the selected Device default with an explicit null request', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    const clear = wrapper.findAll('button').find(button => button.text() === '清除该设备默认值')
    expect(clear).toBeDefined()
    await clear!.trigger('click')
    await flushPromises()

    expect(mocks.putDefault).toHaveBeenCalledWith({ device_code: 'SOURCE_A' }, { default: null })
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('allows saving a Device default while the WorkLine is active but disables WorkLine apply', async () => {
    const wrapper = await openEcsTestPanel(workline({ is_active: true }))
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    const saveDefault = wrapper
      .findAll('button')
      .find(button => button.text() === '保存为该设备默认值')
    const apply = wrapper.findAll('button').find(button => button.text() === '应用 ECS_TEST 配置')
    expect(saveDefault?.attributes('disabled')).toBeUndefined()
    expect(apply?.attributes('disabled')).toBeDefined()
  })

  it('blocks editing when the current WorkLine rules are malformed', async () => {
    const wrapper = await openEcsTestPanel(
      workline({ runtime_config_json: { ecs_test_rules: [{ source_device_code: 'BROKEN' }] } })
    )
    expect(wrapper.get('[role="alert"]').text()).toContain('不符合规则结构')
    expect(wrapper.get('select[aria-label="来源设备"]').attributes('disabled')).toBeDefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('keeps an applied WorkLine rule ahead of a different Device default', async () => {
    const line = workline({
      run_mode: 'ECS_TEST',
      runtime_config_json: {
        ecs_test_rules: [
          {
            source_device_code: 'SOURCE_A',
            target_device_code: 'TARGET_A',
            task_type: 'ALREADY_APPLIED',
            params: { applied: true }
          }
        ]
      }
    })
    const wrapper = await openEcsTestPanel(line)
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect((wrapper.get('input[aria-label="task_type"]').element as HTMLInputElement).value).toBe(
      'ALREADY_APPLIED'
    )
    expect(
      (wrapper.get('textarea[aria-label="params JSON"]').element as HTMLTextAreaElement).value
    ).toContain('applied')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('rejects malformed runtime configuration and duplicate source rules', async () => {
    const malformed = await openEcsTestPanel(workline({ runtime_config_json: 'invalid' }))
    expect(malformed.get('[role="alert"]').text()).toContain('运行配置不是对象')

    const duplicate = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_A',
              target_device_code: 'TARGET_A',
              task_type: 'A',
              params: {}
            },
            {
              source_device_code: 'SOURCE_A',
              target_device_code: 'TARGET_A',
              task_type: 'B',
              params: {}
            }
          ]
        }
      })
    )
    expect(duplicate.get('[role="alert"]').text()).toContain('存在重复来源 SOURCE_A')
    expect(mocks.updateWorkline).not.toHaveBeenCalled()

    const nonArray = await openEcsTestPanel(
      workline({ runtime_config_json: { ecs_test_rules: {} } })
    )
    expect(nonArray.get('[role="alert"]').text()).toContain('不是规则数组')
  })

  it('requires params to remain an explicit JSON object', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('[]')

    expect(wrapper.get('[role="alert"]').text()).toContain('params 必须是合法的 JSON 对象')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(mocks.putDefault).not.toHaveBeenCalled()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('rejects backend-forbidden command params before saving or applying an ECS_TEST rule', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('{"nested":{" SpEeD ":1}}')

    expect(wrapper.get('[role="alert"]').text()).toContain('禁止包含硬件控制字段')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(mocks.putDefault).not.toHaveBeenCalled()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('rejects blank nested params keys', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('{"nested":{"  ":1}}')

    expect(wrapper.get('[role="alert"]').text()).toContain('params 参数 key 不能为空')
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('rejects padded params keys whose names would change after backend normalization', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('{"foo":1," foo ":2}')

    expect(wrapper.get('[role="alert"]').text()).toContain('参数 key 不可包含首尾空白')
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('blocks applying when another retained WorkLine rule has invalid command params', async () => {
    const wrapper = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_B',
              target_device_code: 'TARGET_A',
              task_type: 'MOVE_FORWARD',
              params: { nested: { speed: 1 } }
            }
          ]
        }
      })
    )
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('SOURCE_B')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('blocks applying when a retained task_type is blank after trimming', async () => {
    const wrapper = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_B',
              target_device_code: 'TARGET_A',
              task_type: '   ',
              params: {}
            }
          ]
        }
      })
    )
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('SOURCE_B 的 task_type 不能为空')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('blocks applying when a retained target_device_code is blank after trimming', async () => {
    const wrapper = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_B',
              target_device_code: '  ',
              task_type: 'MOVE_FORWARD',
              params: {}
            }
          ]
        }
      })
    )
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'SOURCE_B 的 target_device_code 不能为空'
    )
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('blocks applying when a retained rule references a device outside this WorkLine but still allows removal', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.fetchDevices.mockResolvedValue(
        devices.filter(device => device.device_code !== 'SOURCE_B')
      )
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'SOURCE_B 引用的设备 SOURCE_B 不属于本线'
    )
    const remove = wrapper.findAll('button').find(button => button.text() === '移除 SOURCE_B')
    expect(remove?.attributes('disabled')).toBeUndefined()
    await remove!.trigger('click')
    await flushPromises()

    expect(mocks.updateWorkline).toHaveBeenCalledWith(9, {
      version: 12,
      run_mode: 'AUTO',
      runtime_config_json: { retry_limit: 2, ecs_test_rules: [] }
    })
  })

  it('removes a WorkLine rule only after confirmation and keeps the current run mode', async () => {
    const wrapper = await openEcsTestPanel()
    const remove = wrapper.findAll('button').find(button => button.text() === '移除 SOURCE_B')
    expect(remove).toBeDefined()

    await remove!.trigger('click')
    await flushPromises()

    expect(mocks.confirm).toHaveBeenCalledOnce()
    expect(mocks.updateWorkline).toHaveBeenCalledWith(9, {
      version: 12,
      run_mode: 'AUTO',
      runtime_config_json: { retry_limit: 2, ecs_test_rules: [] }
    })
  })

  it('does not allow removing a WorkLine rule while the WorkLine is active', async () => {
    const wrapper = await openEcsTestPanel(workline({ is_active: true }))
    const remove = wrapper.findAll('button').find(button => button.text() === '移除 SOURCE_B')

    expect(remove?.attributes('disabled')).toBeDefined()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('does not allow removing the last rule while WorkLine remains in ECS_TEST mode', async () => {
    const wrapper = await openEcsTestPanel(workline({ run_mode: 'ECS_TEST' }))
    const remove = wrapper.findAll('button').find(button => button.text() === '移除 SOURCE_B')

    expect(remove?.attributes('disabled')).toBeDefined()
    await remove!.trigger('click')
    await flushPromises()
    expect(mocks.confirm).not.toHaveBeenCalled()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('rejects task_type values longer than the device command limit', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('input[aria-label="task_type"]').setValue('T'.repeat(101))

    expect(wrapper.get('[role="alert"]').text()).toContain('task_type 不能超过 100 个字符')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(mocks.putDefault).not.toHaveBeenCalled()
  })

  it('rejects target_device_code values longer than the device command limit', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('input[aria-label="目标设备编码"]').setValue('T'.repeat(101))

    expect(wrapper.get('[role="alert"]').text()).toContain('target_device_code 不能超过 100 个字符')
    expect(mocks.putDefault).not.toHaveBeenCalled()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('blocks applying when a retained target_device_code exceeds the device command limit', async () => {
    const wrapper = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_B',
              target_device_code: 'T'.repeat(101),
              task_type: 'MOVE_FORWARD',
              params: {}
            }
          ]
        }
      })
    )
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('SOURCE_B')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('shows a load error and prevents either save path when WorkLine details fail', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.getWorkline.mockReturnValue({ send: vi.fn().mockRejectedValue(new Error('offline')) })
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('ECS_TEST 配置加载失败')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('allows manual entry when the account cannot read Device defaults', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.hasPermission.mockImplementation(
        permission => permission !== BIZ_PERMISSIONS.device.detail
      )
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('缺少设备详情权限')
    expect(mocks.getDefault).not.toHaveBeenCalled()
    expect(wrapper.get('input[aria-label="目标设备编码"]').element).toBeDefined()
  })

  it('denies the ECS_TEST section without WorkLine detail permission', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.hasPermission.mockImplementation(
        permission => permission !== BIZ_PERMISSIONS.workline.detail
      )
    })

    expect(wrapper.get('[data-section="ecs-test"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section="base"]').attributes('aria-selected')).toBe('true')
    expect(mocks.fetchDevices).not.toHaveBeenCalled()
    expect(mocks.getDefault).not.toHaveBeenCalled()
  })

  it('shows a Device default read error without replacing the applied rule', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.getDefault.mockReturnValue({ send: vi.fn().mockRejectedValue(new Error('offline')) })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('设备默认值读取失败')
    expect(wrapper.get('input[aria-label="目标设备编码"]').element).toBeDefined()
  })

  it('reports a failed Device default save and leaves WorkLine rules untouched', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.putDefault.mockReturnValue({
        send: vi.fn().mockRejectedValue(new Error('save failed'))
      })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '保存为该设备默认值')!
      .trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('设备默认值保存失败')
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('keeps the draft when switching source is cancelled', async () => {
    const wrapper = await openEcsTestPanel()
    const source = wrapper.get('select[aria-label="来源设备"]')
    await source.setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('input[aria-label="目标设备编码"]').setValue('UNSAVED_TARGET')
    mocks.confirm.mockRejectedValueOnce(new Error('cancel'))

    await source.setValue('SOURCE_B')
    await flushPromises()

    expect(
      (wrapper.get('input[aria-label="目标设备编码"]').element as HTMLInputElement).value
    ).toBe('UNSAVED_TARGET')
    expect(mocks.getDefault).toHaveBeenCalledTimes(1)
  })

  it('keeps the ECS_TEST draft when leaving the section is cancelled', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('input[aria-label="task_type"]').setValue('UNSAVED_RULE')
    mocks.confirm.mockRejectedValueOnce(new Error('cancel'))

    await wrapper.get('[data-section="base"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-section="ecs-test"]').attributes('aria-selected')).toBe('true')
    expect((wrapper.get('input[aria-label="task_type"]').element as HTMLInputElement).value).toBe(
      'UNSAVED_RULE'
    )
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('does not clear the Device default when the confirmation is cancelled', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    mocks.confirm.mockRejectedValueOnce(new Error('cancel'))
    await wrapper
      .findAll('button')
      .find(button => button.text() === '清除该设备默认值')!
      .trigger('click')
    await flushPromises()

    expect(mocks.putDefault).not.toHaveBeenCalled()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('reports a failed Device default clear without changing WorkLine rules', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.putDefault.mockReturnValue({
        send: vi.fn().mockRejectedValue(new Error('clear failed'))
      })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '清除该设备默认值')!
      .trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('设备默认值清除失败')
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })

  it('allows a Device default target outside this WorkLine but blocks applying it', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.getDefault.mockReturnValue({
        send: vi
          .fn()
          .mockResolvedValue({ default: { ...defaultRule, target_device_code: 'OUTSIDE' } })
      })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('不属于本线')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeUndefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
  })

  it('does not apply WorkLine rules when the confirmation is cancelled', async () => {
    const wrapper = await openEcsTestPanel()
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    mocks.confirm.mockRejectedValueOnce(new Error('cancel'))
    await wrapper
      .findAll('button')
      .find(button => button.text() === '应用 ECS_TEST 配置')!
      .trigger('click')
    await flushPromises()

    expect(mocks.updateWorkline).not.toHaveBeenCalled()
    expect(mocks.putDefault).not.toHaveBeenCalled()
  })

  it('reports a failed WorkLine update and leaves the panel available for retry', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.updateWorkline.mockReturnValue({
        send: vi.fn().mockRejectedValue(new Error('update failed'))
      })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '应用 ECS_TEST 配置')!
      .trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('ECS_TEST 配置应用失败')
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeUndefined()
  })

  it('keeps a successful apply when refreshing the WorkLine list fails', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.refresh.mockRejectedValue(new Error('refresh failed'))
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '应用 ECS_TEST 配置')!
      .trigger('click')
    await flushPromises()

    expect(mocks.updateWorkline).toHaveBeenCalledOnce()
    expect(mocks.warning).toHaveBeenCalledWith('规则已应用，列表刷新失败，请手动刷新')
  })

  it('creates the first WorkLine rule from an empty runtime configuration', async () => {
    const wrapper = await openEcsTestPanel(workline({ runtime_config_json: null }))
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '应用 ECS_TEST 配置')!
      .trigger('click')
    await flushPromises()

    expect(mocks.updateWorkline).toHaveBeenCalledWith(9, {
      version: 12,
      run_mode: 'ECS_TEST',
      runtime_config_json: {
        ecs_test_rules: [
          {
            source_device_code: 'SOURCE_A',
            target_device_code: 'TARGET_A',
            task_type: 'MOVE_FORWARD',
            params: { source: { location_id: 'SOURCE_A' } }
          }
        ]
      }
    })
  })

  it('supports manual entry when the selected source has no saved default', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.getDefault.mockReturnValue({ send: vi.fn().mockResolvedValue({ default: null }) })
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(wrapper.findAll('button').some(button => button.text() === '清除该设备默认值')).toBe(
      false
    )
    await wrapper.get('input[aria-label="目标设备编码"]').setValue('TARGET_A')
    await wrapper.get('input[aria-label="task_type"]').setValue('MANUAL_TASK')
    await wrapper.get('textarea[aria-label="params JSON"]').setValue('{}')
    await wrapper
      .findAll('button')
      .find(button => button.text() === '保存为该设备默认值')!
      .trigger('click')
    await flushPromises()

    expect(mocks.putDefault).toHaveBeenCalledWith(
      { device_code: 'SOURCE_A' },
      {
        default: { target_device_code: 'TARGET_A', task_type: 'MANUAL_TASK', params: {} }
      }
    )
  })

  it('confirms a dirty source switch and loads the next source applied rule', async () => {
    const wrapper = await openEcsTestPanel(
      workline({
        runtime_config_json: {
          ecs_test_rules: [
            {
              source_device_code: 'SOURCE_B',
              target_device_code: 'TARGET_A',
              task_type: 'B_RULE',
              params: {}
            }
          ]
        }
      })
    )
    const source = wrapper.get('select[aria-label="来源设备"]')
    await source.setValue('SOURCE_A')
    await flushPromises()
    await wrapper.get('input[aria-label="task_type"]').setValue('UNSAVED_RULE')
    await source.setValue('SOURCE_B')
    await flushPromises()

    expect(mocks.confirm).toHaveBeenCalledWith(
      '切换来源设备会放弃当前尚未应用的规则草稿。',
      '切换来源设备',
      expect.any(Object)
    )
    expect(mocks.getDefault).toHaveBeenNthCalledWith(2, { device_code: 'SOURCE_B' })
    expect((wrapper.get('input[aria-label="task_type"]').element as HTMLInputElement).value).toBe(
      'B_RULE'
    )
  })

  it('allows applying a WorkLine rule without Device update permission', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.hasPermission.mockImplementation(
        permission => permission !== BIZ_PERMISSIONS.device.update
      )
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeDefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeUndefined()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '应用 ECS_TEST 配置')!
      .trigger('click')
    await flushPromises()
    expect(mocks.updateWorkline).toHaveBeenCalledOnce()
  })

  it('allows saving a Device default without WorkLine update permission', async () => {
    const wrapper = await openEcsTestPanel(workline(), () => {
      mocks.hasPermission.mockImplementation(
        permission => permission !== BIZ_PERMISSIONS.workline.update
      )
    })
    await wrapper.get('select[aria-label="来源设备"]').setValue('SOURCE_A')
    await flushPromises()

    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '保存为该设备默认值')
        ?.attributes('disabled')
    ).toBeUndefined()
    expect(
      wrapper
        .findAll('button')
        .find(button => button.text() === '应用 ECS_TEST 配置')
        ?.attributes('disabled')
    ).toBeDefined()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '保存为该设备默认值')!
      .trigger('click')
    await flushPromises()
    expect(mocks.putDefault).toHaveBeenCalledOnce()
    expect(mocks.updateWorkline).not.toHaveBeenCalled()
  })
})
