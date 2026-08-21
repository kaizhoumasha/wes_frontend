/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick, type PropType } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { workLinesApiMethods } from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import RoughSorterConfigDialog from '@/views/admin/worklines/components/RoughSorterConfigDialog.vue'
import { createEmptyRoughSorterConfig } from '@/views/admin/worklines/config/roughSorterConfig'

const mocks = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
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
      update: mocks.update
    }
  }
})

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: mocks.hasPermission })
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: mocks.success,
    warning: mocks.warning,
    error: mocks.error
  }
}))

const ButtonStub = defineComponent({
  name: 'ElButton',
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    loading: Boolean,
    type: { type: String, default: undefined },
    nativeType: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' }
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: props.nativeType,
          disabled: props.disabled || props.loading,
          onClick: () => emit('click')
        },
        slots.default?.()
      )
  }
})

const TooltipStub = defineComponent({
  name: 'ElTooltip',
  setup:
    (_, { slots }) =>
    () =>
      slots.default?.()
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
        onInput: (event: Event) => {
          if (!props.disabled) emit('update:modelValue', (event.target as HTMLInputElement).value)
        }
      })
  }
})

const InputNumberStub = defineComponent({
  name: 'ElInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: 0 },
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        type: 'number',
        value: props.modelValue,
        disabled: props.disabled,
        onInput: (event: Event) => {
          if (!props.disabled) {
            emit('update:modelValue', Number((event.target as HTMLInputElement).value))
          }
        }
      })
  }
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

function workline(id: number, overrides: Partial<Workline> = {}): Workline {
  return {
    id,
    line_code: `LINE-${id}`,
    line_name: `作业线 ${id}`,
    line_type: 'AUTO',
    run_mode: 'AUTO',
    is_active: false,
    version: 7,
    config: { owner: 'WES', rough_sorter: validRoughSorter() },
    ...overrides
  }
}

function response(value: Workline | Promise<Workline>) {
  mocks.getById.mockReturnValueOnce({ send: vi.fn().mockReturnValue(value) })
}

function updateResponse(value: unknown = undefined) {
  mocks.update.mockReturnValueOnce({ send: vi.fn().mockResolvedValue(value) })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function mountDialog(row: Workline, refresh = vi.fn().mockResolvedValue(undefined)) {
  return {
    refresh,
    wrapper: mount(RoughSorterConfigDialog, {
      props: { workline: row, modelValue: true },
      global: {
        provide: { [CRUD_PAGE_REFRESH_KEY as symbol]: refresh },
        stubs: {
          Teleport: true,
          AppIcon: true,
          ElButton: ButtonStub,
          ElTooltip: TooltipStub,
          ElInput: InputStub,
          ElInputNumber: InputNumberStub,
          ElForm: defineComponent({
            setup:
              (_, { slots }) =>
              () =>
                h('form', slots.default?.())
          }),
          ElFormItem: defineComponent({
            setup:
              (_, { slots }) =>
              () =>
                h('label', slots.default?.())
          }),
          ElAlert: defineComponent({
            props: { title: { type: String, default: '' } },
            setup: props => () => h('div', props.title)
          }),
          ElDivider: defineComponent({
            setup:
              (_, { slots }) =>
              () =>
                h('div', slots.default?.())
          })
        }
      }
    })
  }
}

async function settle() {
  await vi.waitFor(() => expect(mocks.getById).toHaveBeenCalled())
  await nextTick()
}

async function submit(wrapper: VueWrapper) {
  standardDialog(wrapper).vm.$emit('confirm')
  await nextTick()
}

function standardDialog(wrapper: VueWrapper) {
  return wrapper.findComponent(StandardDialog)
}

async function setField(wrapper: VueWrapper, field: string, value: string) {
  const input = wrapper.find(`[data-field="${field}"]`)
  expect(input.exists()).toBe(true)
  await input.setValue(value)
}

describe('RoughSorterConfigDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.hasPermission.mockReturnValue(true)
  })

  it('loads the selected WorkLine and saves the latest version while preserving sibling config', async () => {
    const latest = workline(11)
    response(Promise.resolve(latest))
    updateResponse()
    const { wrapper, refresh } = mountDialog(workline(11, { version: 2 }))
    await settle()

    await submit(wrapper)
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce())

    expect(workLinesApiMethods.getById).toHaveBeenCalledWith(11)
    expect(workLinesApiMethods.update).toHaveBeenCalledWith(11, {
      version: 7,
      config: expect.objectContaining({
        owner: 'WES',
        rough_sorter: expect.objectContaining({
          device_contracts: expect.any(Object),
          position_bindings: expect.any(Object)
        })
      })
    })
  })

  it('clears a valid WorkLine on close and blocks an invalid WorkLine after reopen', async () => {
    response(Promise.resolve(workline(11)))
    const { wrapper } = mountDialog(workline(11))
    await settle()
    expect(wrapper.find('[data-field="NG_POSITION"]').exists()).toBe(true)

    await wrapper.setProps({ modelValue: false })
    let resolveInvalid!: (value: Workline) => void
    response(
      new Promise(resolve => {
        resolveInvalid = resolve
      })
    )
    await wrapper.setProps({ workline: workline(12), modelValue: true })
    expect(wrapper.find('[data-field="NG_POSITION"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('NG-01')

    resolveInvalid(
      workline(12, { config: { owner: 'WES', rough_sorter: { device_contracts: {} } } })
    )
    await vi.waitFor(() => expect(wrapper.text()).toContain('已阻止覆盖'))
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
    await submit(wrapper)
    expect(workLinesApiMethods.update).not.toHaveBeenCalled()
  })

  it('binds one WorkLine until an actual close and reopen', async () => {
    response(Promise.resolve(workline(11)))
    const { wrapper } = mountDialog(workline(11))
    await settle()

    await wrapper.setProps({ workline: workline(12) })

    expect(workLinesApiMethods.getById).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('作业线 11')
    expect(wrapper.text()).not.toContain('作业线 12')

    await wrapper.setProps({ modelValue: false })
    response(Promise.resolve(workline(12)))
    await wrapper.setProps({ modelValue: true })
    await vi.waitFor(() => expect(workLinesApiMethods.getById).toHaveBeenCalledWith(12))

    expect(wrapper.text()).toContain('作业线 12')
    expect(wrapper.text()).not.toContain('作业线 11')
  })

  it('ignores stale success after the next WorkLine loads and updates only the next WorkLine', async () => {
    const pendingA = deferred<Workline>()
    response(pendingA.promise)
    const { wrapper } = mountDialog(workline(11))
    await vi.waitFor(() => expect(mocks.getById).toHaveBeenCalledWith(11))

    const roughSorterB = validRoughSorter()
    roughSorterB.position_bindings.NG_POSITION = 'B-NG-01'
    const latestB = workline(12, {
      version: 9,
      config: { owner: 'B', rough_sorter: roughSorterB }
    })
    await wrapper.setProps({ modelValue: false })
    response(Promise.resolve(latestB))
    await wrapper.setProps({ workline: workline(12), modelValue: true })
    await flushPromises()
    await nextTick()
    const latestInput = wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]')
    expect(latestInput.exists()).toBe(true)
    expect(latestInput.element.value).toBe('B-NG-01')

    pendingA.resolve(workline(11))
    await pendingA.promise
    await nextTick()

    expect(wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]').element.value).toBe(
      'B-NG-01'
    )
    expect(wrapper.text()).not.toContain('已阻止覆盖')

    updateResponse()
    await submit(wrapper)
    await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledOnce())
    expect(workLinesApiMethods.update).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        version: 9,
        config: expect.objectContaining({ owner: 'B' })
      })
    )
  })

  it('ignores stale rejection after the next WorkLine loads', async () => {
    const pendingA = deferred<Workline>()
    response(pendingA.promise)
    const { wrapper } = mountDialog(workline(11))
    await vi.waitFor(() => expect(mocks.getById).toHaveBeenCalledWith(11))

    const roughSorterB = validRoughSorter()
    roughSorterB.position_bindings.NG_POSITION = 'B-NG-01'
    await wrapper.setProps({ modelValue: false })
    response(
      Promise.resolve(
        workline(12, {
          config: { owner: 'B', rough_sorter: roughSorterB }
        })
      )
    )
    await wrapper.setProps({ workline: workline(12), modelValue: true })
    await flushPromises()
    await nextTick()
    const latestInput = wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]')
    expect(latestInput.exists()).toBe(true)
    expect(latestInput.element.value).toBe('B-NG-01')

    pendingA.reject(new Error('stale A failed'))
    await pendingA.promise.catch(() => undefined)
    await nextTick()

    expect(wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]').element.value).toBe(
      'B-NG-01'
    )
    expect(wrapper.text()).not.toContain('已阻止覆盖')
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(false)
  })

  it.each([
    ['missing device field', 'MEASUREMENT_DEVICE.ecs_version', ''],
    ['missing position', 'NG_POSITION', ''],
    ['duplicate position', 'NG_POSITION', 'OUTLET-01']
  ])('shows validation errors and refuses update for %s', async (_name, field, value) => {
    response(Promise.resolve(workline(11)))
    const { wrapper } = mountDialog(workline(11))
    await settle()

    await setField(wrapper, field, value)
    await submit(wrapper)

    expect(wrapper.find('[data-testid="validation-errors"]').exists()).toBe(true)
    expect(workLinesApiMethods.update).not.toHaveBeenCalled()
  })

  it('renders an active WorkLine read-only', async () => {
    response(Promise.resolve(workline(11, { is_active: true })))
    const { wrapper } = mountDialog(workline(11, { is_active: true }))
    await settle()

    expect(wrapper.findAll('input').length).toBeGreaterThan(0)
    expect(
      wrapper.findAll('input').every(input => input.attributes('disabled') !== undefined)
    ).toBe(true)
    expect(standardDialog(wrapper).props('confirmDisabled')).toBe(true)
  })

  it('allows detail-only access to read but only update permission to save', async () => {
    mocks.hasPermission.mockReturnValue(false)
    response(Promise.resolve(workline(11)))
    const detailOnly = mountDialog(workline(11)).wrapper
    await settle()

    expect(detailOnly.find('[data-field="NG_POSITION"]').exists()).toBe(true)
    expect(standardDialog(detailOnly).props('confirmDisabled')).toBe(true)
    await submit(detailOnly)
    expect(workLinesApiMethods.update).not.toHaveBeenCalled()
    detailOnly.unmount()

    mocks.hasPermission.mockReturnValue(true)
    response(Promise.resolve(workline(12)))
    updateResponse()
    const updater = mountDialog(workline(12)).wrapper
    await settle()
    await submit(updater)
    await vi.waitFor(() => expect(mocks.update).toHaveBeenCalledOnce())
  })

  it('closes after update and warns without retrying update when refresh fails', async () => {
    response(Promise.resolve(workline(11)))
    updateResponse()
    const refresh = vi.fn().mockRejectedValue(new Error('refresh failed'))
    const { wrapper } = mountDialog(workline(11), refresh)
    await settle()

    await submit(wrapper)
    await vi.waitFor(() =>
      expect(mocks.warning).toHaveBeenCalledWith('保存成功，列表刷新失败，请手动刷新')
    )

    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
    expect(mocks.update).toHaveBeenCalledOnce()
  })

  it('clears prior state and fails closed when the next request fails', async () => {
    response(Promise.resolve(workline(11)))
    const { wrapper } = mountDialog(workline(11))
    await settle()

    await wrapper.setProps({ modelValue: false })
    response(Promise.reject(new Error('network failed')))
    await wrapper.setProps({ workline: workline(12), modelValue: true })
    await vi.waitFor(() => expect(wrapper.text()).toContain('已阻止覆盖'))

    expect(wrapper.find('[data-field="NG_POSITION"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('NG-01')
    expect(workLinesApiMethods.update).not.toHaveBeenCalled()
  })

  it('keeps the dialog open and reports a safe error when update fails', async () => {
    response(Promise.resolve(workline(11)))
    mocks.update.mockReturnValueOnce({
      send: vi.fn().mockRejectedValue(new Error('version conflict'))
    })
    const { wrapper, refresh } = mountDialog(workline(11))
    await settle()

    await submit(wrapper)
    await vi.waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith('保存粗分机配置失败：version conflict')
    )

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('blocks every close and edit path while pending and keeps late failure in its session', async () => {
    response(Promise.resolve(workline(11)))
    const update = deferred<void>()
    mocks.update.mockReturnValueOnce({ send: vi.fn().mockReturnValue(update.promise) })
    const { wrapper } = mountDialog(workline(11))
    await settle()
    const originalNgPosition = wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]').element
      .value

    await submit(wrapper)
    await submit(wrapper)

    expect(workLinesApiMethods.update).toHaveBeenCalledOnce()
    expect(standardDialog(wrapper).props()).toMatchObject({
      modelValue: true,
      closable: false,
      hideCancel: true,
      confirmLoading: true,
      confirmDisabled: true
    })
    expect(wrapper.find('[aria-label="关闭对话框"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('取消')
    expect(wrapper.findAll('input')).not.toHaveLength(0)
    expect(
      wrapper.findAll('input').every(input => input.attributes('disabled') !== undefined)
    ).toBe(true)

    await setField(wrapper, 'NG_POSITION', 'PENDING-EDIT')
    await wrapper.find('.standard-dialog').trigger('keydown', { key: 'Escape' })
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await wrapper.setProps({ workline: workline(12), modelValue: false })

    expect(standardDialog(wrapper).props('modelValue')).toBe(true)
    expect(wrapper.text()).toContain('作业线 11')
    expect(wrapper.text()).not.toContain('作业线 12')

    update.reject(new Error('version conflict'))
    await vi.waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith('保存粗分机配置失败：version conflict')
    )

    expect(standardDialog(wrapper).props('modelValue')).toBe(true)
    expect(wrapper.find<HTMLInputElement>('[data-field="NG_POSITION"]').element.value).toBe(
      originalNgPosition
    )
    expect(workLinesApiMethods.update).toHaveBeenCalledOnce()
  })

  it('lets late success close only the bound session and loads a new row only after reopen', async () => {
    response(Promise.resolve(workline(11)))
    const update = deferred<void>()
    mocks.update.mockReturnValueOnce({ send: vi.fn().mockReturnValue(update.promise) })
    const { wrapper } = mountDialog(workline(11))
    await settle()

    await submit(wrapper)
    await wrapper.setProps({ workline: workline(12) })

    expect(workLinesApiMethods.getById).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('作业线 11')

    update.resolve()
    await vi.waitFor(() => expect(wrapper.emitted('update:modelValue')).toContainEqual([false]))

    expect(workLinesApiMethods.update).toHaveBeenCalledOnce()
    expect(workLinesApiMethods.update).toHaveBeenCalledWith(11, expect.any(Object))

    await wrapper.setProps({ modelValue: false })
    response(Promise.resolve(workline(12)))
    await wrapper.setProps({ modelValue: true })
    await vi.waitFor(() => expect(workLinesApiMethods.getById).toHaveBeenCalledWith(12))

    expect(wrapper.text()).toContain('作业线 12')
    expect(wrapper.text()).not.toContain('作业线 11')
    expect(workLinesApiMethods.update).toHaveBeenCalledOnce()
  })
})
