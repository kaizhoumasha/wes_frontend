import { computed, getCurrentScope, onScopeDispose, reactive, ref, watch } from 'vue'
import {
  deviceApiMethods,
  type DebugInput,
  type DebugPreflightInput,
  type DebugPreflightResult,
  type DebugResult,
  type GetByCommandCodePathParams,
  type GetByCommandCodeResult
} from '@/api/modules/device'

export type ManualDebugCommandState = 'EDITING' | 'PREVIEW' | 'SUBMITTING' | 'TRACKING'

interface Sendable<T> {
  send(): Promise<T>
}

export interface ManualDebugApiPort {
  debugPreflight(body: DebugPreflightInput): Sendable<DebugPreflightResult>
  debug(body: DebugInput): Sendable<DebugResult>
  getByCommandCode(params: GetByCommandCodePathParams): Sendable<GetByCommandCodeResult>
}

interface UseManualDebugCommandOptions {
  api?: ManualDebugApiPort
  pollIntervalMs?: number
}

interface ManualDebugForm {
  endpointBaseUrl: string
  deviceCode: string
  timeout: number
  taskType: string
  paramsText: string
  reason: string
}

const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'TIMED_OUT'])

export function useManualDebugCommand(options: UseManualDebugCommandOptions = {}) {
  const api = options.api ?? deviceApiMethods
  const pollIntervalMs = options.pollIntervalMs ?? 2000
  const isOpen = ref(false)
  const state = ref<ManualDebugCommandState>('EDITING')
  const isPreflighting = ref(false)
  const preflightDevices = ref<DebugPreflightResult['devices']>([])
  const previewSnapshot = ref<DebugInput | null>(null)
  const confirmRealAction = ref(false)
  const createdCommand = ref<DebugResult | null>(null)
  const commandDetail = ref<GetByCommandCodeResult | null>(null)
  const lastError = ref<Error | null>(null)
  const form = reactive<ManualDebugForm>(initialForm())
  const preflightEndpoint = ref<string | null>(null)
  let candidateDeviceCode: string | null = null
  let pollTimer: ReturnType<typeof window.setTimeout> | null = null
  let sessionGeneration = 0

  const selectedPreflightDevice = computed(() =>
    preflightDevices.value.find(item => item.device.device_code === form.deviceCode)
  )
  const availableTaskTypes = computed(
    () => selectedPreflightDevice.value?.device.supported_commands ?? []
  )

  watch(
    () => [
      form.endpointBaseUrl,
      form.deviceCode,
      form.timeout,
      form.taskType,
      form.paramsText,
      form.reason
    ],
    () => {
      if (state.value === 'PREVIEW') {
        previewSnapshot.value = null
        confirmRealAction.value = false
        state.value = 'EDITING'
      }
    },
    { flush: 'sync' }
  )

  watch(
    () => form.deviceCode,
    () => {
      if (!availableTaskTypes.value.includes(form.taskType)) {
        form.taskType = ''
      }
    },
    { flush: 'sync' }
  )

  watch(
    () => form.endpointBaseUrl,
    endpoint => {
      if (endpoint.trim() === preflightEndpoint.value) {
        return
      }
      preflightEndpoint.value = null
      preflightDevices.value = []
      form.deviceCode = ''
      form.taskType = ''
      previewSnapshot.value = null
      confirmRealAction.value = false
    },
    { flush: 'sync' }
  )

  function open(candidate?: string): void {
    resetSession()
    candidateDeviceCode = candidate ?? null
    isOpen.value = true
  }

  function close(): void {
    stopPolling()
    resetSession()
    isOpen.value = false
  }

  async function preflight(): Promise<void> {
    const endpoint = form.endpointBaseUrl.trim()
    if (!endpoint) {
      throw new Error('ECS URL 必填')
    }
    isPreflighting.value = true
    lastError.value = null
    const generation = sessionGeneration
    try {
      const response = await api.debugPreflight({ endpoint_base_url: endpoint }).send()
      if (generation !== sessionGeneration) return
      preflightEndpoint.value = response.endpoint_base_url.trim()
      preflightDevices.value = response.devices
      form.endpointBaseUrl = response.endpoint_base_url
      form.deviceCode =
        candidateDeviceCode &&
        response.devices.some(item => item.device.device_code === candidateDeviceCode)
          ? candidateDeviceCode
          : ''
      form.taskType = ''
    } catch (error) {
      if (generation !== sessionGeneration) return
      lastError.value = toError(error)
      throw error
    } finally {
      if (generation === sessionGeneration) {
        isPreflighting.value = false
      }
    }
  }

  function preview(): void {
    if (form.endpointBaseUrl.trim() !== preflightEndpoint.value) {
      throw new Error('当前 ECS URL 尚未完成 preflight')
    }
    const device = selectedPreflightDevice.value
    if (!device) {
      throw new Error('设备必须来自 preflight 响应')
    }
    if (!device.admissible) {
      throw new Error(device.rejection_code ?? '设备当前不可准入')
    }
    if (!Number.isInteger(form.timeout) || form.timeout <= 0) {
      throw new Error('timeout 必须是正整数')
    }
    if (!form.taskType || !availableTaskTypes.value.includes(form.taskType)) {
      throw new Error('task_type 必须来自设备 supported_commands')
    }
    const reason = validateReason(form.reason)
    const params = parseParams(form.paramsText)
    previewSnapshot.value = Object.freeze({
      client_request_id: createUuid7(),
      endpoint_base_url: form.endpointBaseUrl.trim(),
      device_code: form.deviceCode,
      timeout: form.timeout,
      task_type: form.taskType,
      params,
      reason
    })
    confirmRealAction.value = false
    state.value = 'PREVIEW'
  }

  async function submit(): Promise<void> {
    if (state.value === 'SUBMITTING') {
      throw new Error('命令正在提交')
    }
    if (state.value !== 'PREVIEW' || !previewSnapshot.value) {
      throw new Error('必须先生成不可变预览')
    }
    if (!confirmRealAction.value) {
      throw new Error('必须确认真实设备动作')
    }

    state.value = 'SUBMITTING'
    lastError.value = null
    const generation = sessionGeneration
    try {
      const created = await api.debug(previewSnapshot.value).send()
      if (generation !== sessionGeneration) return
      createdCommand.value = created
      state.value = 'TRACKING'
      schedulePoll()
    } catch (error) {
      if (generation !== sessionGeneration) return
      state.value = 'PREVIEW'
      lastError.value = toError(error)
      throw error
    }
  }

  function schedulePoll(): void {
    stopPolling()
    if (!createdCommand.value || state.value !== 'TRACKING') {
      return
    }
    pollTimer = window.setTimeout(() => void pollCommand(), pollIntervalMs)
  }

  async function pollCommand(): Promise<void> {
    pollTimer = null
    const commandCode = createdCommand.value?.command_code
    const generation = sessionGeneration
    if (!commandCode || state.value !== 'TRACKING') {
      return
    }
    try {
      const detail = await api.getByCommandCode({ command_code: commandCode }).send()
      if (
        generation !== sessionGeneration ||
        state.value !== 'TRACKING' ||
        createdCommand.value?.command_code !== commandCode
      ) {
        return
      }
      commandDetail.value = detail
      lastError.value = null
    } catch (error) {
      if (generation !== sessionGeneration) return
      lastError.value = toError(error)
    }
    if (!commandDetail.value || !TERMINAL_STATUSES.has(commandDetail.value.status)) {
      schedulePoll()
    }
  }

  function stopPolling(): void {
    if (pollTimer !== null) {
      window.clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function resetSession(): void {
    sessionGeneration += 1
    stopPolling()
    Object.assign(form, initialForm())
    state.value = 'EDITING'
    isPreflighting.value = false
    preflightEndpoint.value = null
    preflightDevices.value = []
    previewSnapshot.value = null
    confirmRealAction.value = false
    createdCommand.value = null
    commandDetail.value = null
    lastError.value = null
    candidateDeviceCode = null
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      sessionGeneration += 1
      stopPolling()
    })
  }

  return {
    isOpen,
    state,
    form,
    isPreflighting,
    preflightDevices,
    selectedPreflightDevice,
    availableTaskTypes,
    previewSnapshot,
    confirmRealAction,
    createdCommand,
    commandDetail,
    lastError,
    open,
    close,
    preflight,
    preview,
    submit
  }
}

function initialForm(): ManualDebugForm {
  return {
    endpointBaseUrl: '',
    deviceCode: '',
    timeout: 30000,
    taskType: '',
    paramsText: '{}',
    reason: ''
  }
}

function parseParams(value: string): Record<string, unknown> {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('params 必须是 JSON object')
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('params 必须是 JSON object')
  }
  return parsed as Record<string, unknown>
}

function validateReason(value: string): string {
  const reason = value.trim()
  if (!reason || reason.length > 500) {
    throw new Error('reason trim 后必须为 1–500 字符')
  }
  return reason
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function createUuid7(
  now: () => number = Date.now,
  fillRandom: (bytes: Uint8Array) => Uint8Array = bytes => crypto.getRandomValues(bytes)
): string {
  const bytes = fillRandom(new Uint8Array(16))
  let timestamp = Math.trunc(now())
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = timestamp % 256
    timestamp = Math.floor(timestamp / 256)
  }
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f)
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f)
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
