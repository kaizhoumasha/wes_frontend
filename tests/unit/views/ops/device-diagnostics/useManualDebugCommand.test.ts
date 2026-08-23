import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createUuid7,
  useManualDebugCommand,
  type ManualDebugApiPort
} from '@/views/ops/device-diagnostics/useManualDebugCommand'

function method<T>(result: T) {
  return { send: vi.fn().mockResolvedValue(result) }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function createApi(): ManualDebugApiPort & {
  debugPreflight: ReturnType<typeof vi.fn>
  debug: ReturnType<typeof vi.fn>
  getByCommandCode: ReturnType<typeof vi.fn>
} {
  return {
    debugPreflight: vi.fn().mockImplementation(() =>
      method({
        endpoint_base_url: 'http://10.24.209.26:8080',
        devices: [
          {
            device: {
              device_code: 'ARM-01',
              device_name: 'Robot Arm',
              device_type: 'ROBOT_ARM',
              role: null,
              supported_commands: ['MOVE', 'STOP'],
              supported_events: ['ARRIVED']
            },
            state: {
              device_code: 'ARM-01',
              mode: 'AUTO',
              status: 'IDLE',
              is_online: true,
              current_command_code: null,
              scenario: null,
              updated_at: 1
            },
            admissible: true,
            rejection_code: null
          },
          {
            device: {
              device_code: 'ARM-02',
              device_name: null,
              device_type: null,
              role: null,
              supported_commands: ['RESET'],
              supported_events: null
            },
            state: {
              device_code: 'ARM-02',
              mode: 'MANUAL',
              status: 'IDLE',
              is_online: true,
              current_command_code: null,
              scenario: null,
              updated_at: 1
            },
            admissible: false,
            rejection_code: 'DEVICE_MODE_NOT_AUTO'
          }
        ]
      })
    ),
    debug: vi.fn().mockImplementation(() =>
      method({
        command_code: 'CMD-001',
        client_request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
        status: 'PENDING'
      })
    ),
    getByCommandCode: vi.fn().mockImplementation(() =>
      method({
        command_code: 'CMD-001',
        client_request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
        device_code: 'ARM-01',
        endpoint_base_url: 'http://10.24.209.26:8080',
        contract_key: 'third_party_integration',
        contract_version: '1.1',
        command_timeout_ms: 30000,
        task_type: 'MOVE',
        params: {},
        trace_id: null,
        status: 'PENDING',
        attempt_count: 0,
        ack_received_at: null,
        completed_at: null,
        failure_code: null,
        reconciliation_reason: null,
        execution_reason: '现场联调',
        created_by: 42,
        callback: null
      })
    )
  }
}

async function prepare(command: ReturnType<typeof useManualDebugCommand>): Promise<void> {
  command.form.endpointBaseUrl = 'http://10.24.209.26:8080'
  await command.preflight()
  command.form.deviceCode = 'ARM-01'
  command.form.taskType = 'MOVE'
  command.form.paramsText = '{"speed": 1}'
  command.form.reason = '现场联调'
}

afterEach(() => {
  vi.useRealTimers()
})

describe('createUuid7', () => {
  it('creates a lowercase RFC 9562 version 7 UUID', () => {
    const uuid = createUuid7(
      () => 1_777_777_777_777,
      bytes => bytes.fill(0xab)
    )
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})

describe('useManualDebugCommand', () => {
  it('preflights through generated API and selects only the row candidate returned by ECS', async () => {
    const api = createApi()
    const command = useManualDebugCommand({ api })
    command.open('ARM-01')
    command.form.endpointBaseUrl = 'http://10.24.209.26:8080'

    await command.preflight()

    expect(api.debugPreflight).toHaveBeenCalledWith({
      endpoint_base_url: 'http://10.24.209.26:8080'
    })
    expect(command.form.deviceCode).toBe('ARM-01')
    expect(command.availableTaskTypes.value).toEqual(['MOVE', 'STOP'])
    expect(command.preflightDevices.value[1]).toMatchObject({
      admissible: false,
      rejection_code: 'DEVICE_MODE_NOT_AUTO'
    })
  })

  it('does not preselect a device when opened from the global launcher', async () => {
    const command = useManualDebugCommand({ api: createApi() })
    command.open()
    command.form.endpointBaseUrl = 'http://10.24.209.26:8080'
    await command.preflight()
    expect(command.form.deviceCode).toBe('')
    expect(command.availableTaskTypes.value).toEqual([])
  })

  it('rejects params that are invalid JSON, arrays or scalar values', async () => {
    const command = useManualDebugCommand({ api: createApi() })
    await prepare(command)

    for (const paramsText of ['{', '[]', '42', 'null']) {
      command.form.paramsText = paramsText
      expect(() => command.preview()).toThrow('params 必须是 JSON object')
    }
  })

  it('freezes an immutable preview and returns to EDITING after any edit', async () => {
    const command = useManualDebugCommand({ api: createApi() })
    await prepare(command)

    command.preview()
    const snapshot = command.previewSnapshot.value
    expect(command.state.value).toBe('PREVIEW')
    expect(snapshot).toMatchObject({
      endpoint_base_url: 'http://10.24.209.26:8080',
      device_code: 'ARM-01',
      timeout: 30000,
      task_type: 'MOVE',
      params: { speed: 1 }
    })
    expect(snapshot?.client_request_id).toMatch(/-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-/)

    command.form.reason = '修改原因'
    await nextTick()
    expect(command.state.value).toBe('EDITING')
    expect(command.previewSnapshot.value).toBeNull()
  })

  it('invalidates preflight results when the ECS endpoint changes', async () => {
    const command = useManualDebugCommand({ api: createApi() })
    await prepare(command)

    command.form.endpointBaseUrl = 'http://other-ecs:8080'

    expect(command.preflightDevices.value).toEqual([])
    expect(command.form.deviceCode).toBe('')
    expect(command.form.taskType).toBe('')
    expect(() => command.preview()).toThrow('当前 ECS URL 尚未完成 preflight')
  })

  it('ignores a delayed preflight response after the ECS endpoint changes', async () => {
    const api = createApi()
    const response = await createApi().debugPreflight({ endpoint_base_url: 'unused' }).send()
    const delayedResponse = deferred<typeof response>()
    api.debugPreflight.mockImplementationOnce(() => ({ send: () => delayedResponse.promise }))
    const command = useManualDebugCommand({ api })
    command.open('ARM-01')
    command.form.endpointBaseUrl = 'http://old-ecs:8080'
    const staleRequest = command.preflight()

    command.form.endpointBaseUrl = 'http://new-ecs:8080'
    delayedResponse.resolve({ ...response, endpoint_base_url: 'http://old-ecs:8080' })
    await staleRequest

    expect(command.form.endpointBaseUrl).toBe('http://new-ecs:8080')
    expect(command.isPreflighting.value).toBe(false)
    expect(command.preflightDevices.value).toEqual([])
    expect(command.form.deviceCode).toBe('')
  })

  it('requires trimmed reason and explicit confirmation and prevents duplicate submit', async () => {
    const api = createApi()
    const command = useManualDebugCommand({ api })
    await prepare(command)
    command.form.reason = ' 现场联调 '
    command.preview()

    await expect(command.submit()).rejects.toThrow('必须确认真实设备动作')
    command.confirmRealAction.value = true
    const first = command.submit()
    const second = command.submit()
    await expect(second).rejects.toThrow('命令正在提交')
    await first

    expect(api.debug).toHaveBeenCalledTimes(1)
    expect(api.debug.mock.calls[0]?.[0]).toMatchObject({ reason: '现场联调' })
    expect(command.state.value).toBe('TRACKING')
    expect(command.createdCommand.value).toMatchObject({ status: 'PENDING' })
  })

  it('polls every two seconds, keeps RECONCILING non-terminal and stops on terminal or close', async () => {
    vi.useFakeTimers()
    const api = createApi()
    const details = [
      { status: 'RECONCILING', reconciliation_reason: 'DELIVERY_UNKNOWN' },
      { status: 'SUCCEEDED', completed_at: '2026-08-23T08:00:03Z' }
    ]
    api.getByCommandCode.mockImplementation(() => {
      const next = details.shift() ?? { status: 'SUCCEEDED', completed_at: '2026-08-23T08:00:03Z' }
      return method({
        command_code: 'CMD-001',
        client_request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
        device_code: 'ARM-01',
        endpoint_base_url: 'http://10.24.209.26:8080',
        contract_key: 'third_party_integration',
        contract_version: '1.1',
        command_timeout_ms: 30000,
        task_type: 'MOVE',
        params: {},
        trace_id: null,
        attempt_count: 1,
        ack_received_at: null,
        failure_code: null,
        execution_reason: '现场联调',
        created_by: 42,
        callback: null,
        completed_at: next.status === 'SUCCEEDED' ? '2026-08-23T08:00:03Z' : null,
        ...next
      })
    })
    const command = useManualDebugCommand({ api, pollIntervalMs: 2000 })
    await prepare(command)
    command.preview()
    command.confirmRealAction.value = true
    await command.submit()

    await vi.advanceTimersByTimeAsync(2000)
    expect(command.commandDetail.value?.status).toBe('RECONCILING')
    expect(vi.getTimerCount()).toBe(1)
    await vi.advanceTimersByTimeAsync(2000)
    expect(command.commandDetail.value?.status).toBe('SUCCEEDED')
    expect(vi.getTimerCount()).toBe(0)

    command.close()
    expect(command.isOpen.value).toBe(false)
    expect(command.commandDetail.value).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores a delayed preflight response after close and reopen', async () => {
    const api = createApi()
    const freshResponse = await createApi().debugPreflight({ endpoint_base_url: 'unused' }).send()
    const oldResponse = deferred<typeof freshResponse>()
    api.debugPreflight
      .mockImplementationOnce(() => ({ send: () => oldResponse.promise }))
      .mockImplementationOnce(() => method(freshResponse))
    const command = useManualDebugCommand({ api })
    command.open('ARM-01')
    command.form.endpointBaseUrl = 'http://old-ecs:8080'
    const staleRequest = command.preflight()

    command.close()
    command.open()
    command.form.endpointBaseUrl = 'http://10.24.209.26:8080'
    await command.preflight()
    oldResponse.resolve({ ...freshResponse, endpoint_base_url: 'http://old-ecs:8080' })
    await staleRequest

    expect(command.form.endpointBaseUrl).toBe('http://10.24.209.26:8080')
    expect(command.form.deviceCode).toBe('')
  })

  it('ignores a delayed command poll after the dialog session closes', async () => {
    vi.useFakeTimers()
    const api = createApi()
    const sampleDetail = await createApi().getByCommandCode({ command_code: 'CMD-001' }).send()
    const delayedDetail = deferred<typeof sampleDetail>()
    api.getByCommandCode.mockImplementationOnce(() => ({ send: () => delayedDetail.promise }))
    const command = useManualDebugCommand({ api, pollIntervalMs: 2000 })
    await prepare(command)
    command.preview()
    command.confirmRealAction.value = true
    await command.submit()
    const polling = vi.advanceTimersByTimeAsync(2000)
    await vi.waitFor(() => expect(api.getByCommandCode).toHaveBeenCalledOnce())

    command.close()
    delayedDetail.resolve({
      ...sampleDetail,
      status: 'SUCCEEDED',
      attempt_count: 1,
      completed_at: '2026-08-23T08:00:03Z'
    })
    await polling

    expect(command.commandDetail.value).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores a delayed command submission after the dialog session closes', async () => {
    const api = createApi()
    const sampleResult = await createApi()
      .debug({} as never)
      .send()
    const delayedResult = deferred<typeof sampleResult>()
    api.debug.mockImplementationOnce(() => ({ send: () => delayedResult.promise }))
    const command = useManualDebugCommand({ api })
    await prepare(command)
    command.preview()
    command.confirmRealAction.value = true
    const submission = command.submit()

    command.close()
    delayedResult.resolve(sampleResult)
    await submission

    expect(command.createdCommand.value).toBeNull()
    expect(command.state.value).toBe('EDITING')
  })
})
