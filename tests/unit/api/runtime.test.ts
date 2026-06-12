import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const legacyManifestField = (...segments: string[]) => segments.join('_')

const mocks = vi.hoisted(() => {
  const send = vi.fn()
  const method = vi.fn(() => ({ send }))
  const apiClientGet = vi.fn(() => ({ send }))
  const apiClientPost = vi.fn(() => ({ send }))
  return {
    send,
    apiClientGet,
    apiClientPost,
    methods: {
      overview: method,
      worklines: method,
      manifest: method,
      getWorklines: method,
      devices: method,
      getDevices: method,
      query: method,
      request: method,
      trace: method,
      blockingPoint: method,
      session: method,
      command: method,
      dispatch: method,
      sandboxPending: method,
      sandboxCompleted: method,
      sandboxEvents: method,
      results: method,
      sandboxAck: method,
      sandboxExternalCallbacks: method,
      sandboxWorklinesStart: method,
      sandboxTemplates: method,
      replayInboxes: method,
      manualSessions: method
    },
    runtimeHoldMethods: {
      runtimeHoldDetail: method,
      resolveRuntimeHold: method,
      runtimeHoldNgReasons: method,
      ngReturnItems: method
    }
  }
})

vi.mock('@/api/modules/workline', () => ({
  worklineApiMethods: mocks.methods,
  runtimeHoldApiMethods: mocks.runtimeHoldMethods
}))

vi.mock('@/api/client', () => ({
  apiClient: {
    Get: mocks.apiClientGet,
    Post: mocks.apiClientPost
  }
}))

describe('runtimeApiMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.send.mockResolvedValue({ ok: true })
  })

  it('normalizes trace query defaults before delegating to workline API', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    const result = await runtimeApiMethods
      .queryTraces({
        keyword: 'PKG-001',
        workline_id: 101,
        device_id: 201
      })
      .send()

    expect(mocks.methods.query).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      only_active: false,
      only_failed: false,
      device_id: 201,
      keyword: 'PKG-001',
      status: undefined,
      plugin_state: undefined,
      workline_id: 101
    })
    expect(result).toEqual({ ok: true })
  })

  it('loads a workline plugin manifest by plugin key', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods.worklinePluginManifest('rough_sorter').send()

    expect(mocks.methods.manifest).toHaveBeenCalledWith({ plugin_key: 'rough_sorter' })
  })

  it('keeps generated workline plugin option contract limited to selector fields', async () => {
    const { WorkLinePluginOptionMetadata } = await import(
      '@/api/generated/openapi-metadata/WorkLinePluginOption'
    )
    const { WorkLinePluginOptionSchema } = await import('@/types/generated/zod-schemas')
    const expectedFields = [
      'plugin_key',
      'label',
      'contract_versions',
      'default_contract_version'
    ]

    expect(Object.keys(WorkLinePluginOptionMetadata.fields)).toEqual(expectedFields)
    expect(Object.keys(WorkLinePluginOptionSchema.shape)).toEqual(expectedFields)
  })

  it('uses generated workline plugin manifest contract fields without legacy aliases', async () => {
    const { WorkLinePluginManifestSummaryMetadata } = await import(
      '@/api/generated/openapi-metadata/WorkLinePluginManifestSummary'
    )
    const { WorkLinePluginManifestSummarySchema } = await import('@/types/generated/zod-schemas')
    const expectedFields = [
      'plugin_key',
      'contract_version',
      'devices',
      'positions',
      'topology',
      'events',
      'commands',
      'resource_boundaries'
    ]
    const legacyFields = [
      legacyManifestField('required', 'device', 'roles'),
      legacyManifestField('event', 'source', 'roles'),
      legacyManifestField('command', 'target', 'roles'),
      legacyManifestField('supported', 'events'),
      legacyManifestField('supported', 'commands'),
      legacyManifestField('single', 'layer', 'boundaries')
    ]

    expect(Object.keys(WorkLinePluginManifestSummaryMetadata.fields)).toEqual(expectedFields)
    expect(Object.keys(WorkLinePluginManifestSummarySchema.shape)).toEqual(expectedFields)
    for (const field of legacyFields) {
      expect(WorkLinePluginManifestSummaryMetadata.fields).not.toHaveProperty(field)
      expect(WorkLinePluginManifestSummarySchema.shape).not.toHaveProperty(field)
    }
  })

  it('does not keep legacy plugin manifest aliases in runtime types', () => {
    const runtimeTypes = readFileSync(resolve(process.cwd(), 'src/types/runtime.ts'), 'utf8')
    const legacyTokens = [
      legacyManifestField('required', 'device', 'roles'),
      legacyManifestField('event', 'source', 'roles'),
      legacyManifestField('command', 'target', 'roles'),
      legacyManifestField('supported', 'events'),
      legacyManifestField('supported', 'commands'),
      legacyManifestField('single', 'layer', 'boundaries'),
      ['WorkLine', 'SingleLayerRack', 'BoundarySummary'].join('')
    ]

    for (const token of legacyTokens) {
      expect(runtimeTypes).not.toContain(token)
    }
  })

  it('routes sandbox operation helpers with path params and payloads intact', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')
    const replayPayload = { reason: 'retry after callback repair' }
    const manualPayload = {
      operation: 'MARK_FAILED',
      reason: 'operator cancelled stale session'
    }

    await runtimeApiMethods.sandboxPending(25).send()
    await runtimeApiMethods.replayInbox(501, replayPayload).send()
    await runtimeApiMethods.manualSessionOperation(601, manualPayload).send()

    expect(mocks.methods.sandboxPending).toHaveBeenCalledWith({ limit: 25 })
    expect(mocks.methods.replayInboxes).toHaveBeenCalledWith({ inbox_id: 501 }, replayPayload)
    expect(mocks.methods.manualSessions).toHaveBeenCalledWith({ session_id: 601 }, manualPayload)
  })

  it('queries runtime holds directly with filters', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .runtimeHolds({
        workline_id: 45,
        session_id: 93,
        status: 'OPEN',
        active_only: true,
        limit: 50
      })
      .send()

    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/api/v1/workline/runtime-holds?workline_id=45&session_id=93&status=OPEN&active_only=true&limit=50'
    )
  })

  it('queries runtime holds base endpoint when no filters are provided', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods.runtimeHolds().send()

    expect(mocks.apiClientGet).toHaveBeenCalledWith('/api/v1/workline/runtime-holds')
  })

  it('passes plugin manifest keys with path characters to the generated contract method', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods.worklinePluginManifest('rough sorter/1').send()

    expect(mocks.methods.manifest).toHaveBeenCalledWith({ plugin_key: 'rough sorter/1' })
  })

  it('submits sandbox cleanup through direct workline operations endpoint', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .sandboxCleanup(45, { dry_run: false, confirmation: 'WL-SMT-SIM' })
      .send()

    expect(mocks.apiClientPost).toHaveBeenCalledWith(
      '/api/v1/workline/operations/sandbox/worklines/45/cleanup',
      { dry_run: false, confirmation: 'WL-SMT-SIM' }
    )
  })

  it('submits workline START request through user-auth sandbox operation endpoint', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03',
        traceId: 'sandbox:start:trace-1'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: 'sandbox:start:trace-1'
      }
    )
  })

  it('generates a sandbox START trace id when omitted', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: expect.stringMatching(/^sandbox:start:45:/)
      }
    )
    expect(mocks.apiClientPost).not.toHaveBeenCalledWith('/api/v1/callback/event', expect.anything())
  })

  it('does not call API-app protected callback event ingress for sandbox START', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .worklineStartRequested(45, {
        deviceCode: 'ARM03',
        traceId: 'sandbox:start:trace-1'
      })
      .send()

    expect(mocks.methods.sandboxWorklinesStart).toHaveBeenCalledWith(
      { workline_id: 45 },
      {
        device_code: 'ARM03',
        trace_id: 'sandbox:start:trace-1'
      }
    )
    expect(mocks.apiClientPost).not.toHaveBeenCalledWith('/api/v1/callback/event', {
      device_code: 'ARM03',
      event_type: 'WORKLINE_START_REQUESTED',
      timestamp: expect.any(Number),
      trace_id: 'sandbox:start:trace-1',
      event_id: 'sandbox:start:trace-1',
      data: {
        source: 'sandbox',
        workline_id: 45
      }
    })
  })

  it('submits debug data cleanup through non-production operations endpoints', async () => {
    const { runtimeApiMethods } = await import('@/api/modules/runtime')

    await runtimeApiMethods
      .debugDataCleanupWorkline(45, { dry_run: false, confirmation: 'WL-SMT-AUTO' })
      .send()
    await runtimeApiMethods
      .debugDataCleanupAll({ dry_run: false, confirmation: 'CLEAR-ALL-DEBUG-DATA' })
      .send()

    expect(mocks.apiClientPost).toHaveBeenNthCalledWith(
      1,
      '/api/v1/workline/operations/debug-data/worklines/45/cleanup',
      { dry_run: false, confirmation: 'WL-SMT-AUTO' }
    )
    expect(mocks.apiClientPost).toHaveBeenNthCalledWith(
      2,
      '/api/v1/workline/operations/debug-data/cleanup-all',
      { dry_run: false, confirmation: 'CLEAR-ALL-DEBUG-DATA' }
    )
  })
})
