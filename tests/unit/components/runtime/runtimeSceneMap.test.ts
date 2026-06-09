import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RuntimeSceneMap from '@/components/runtime/monitor/RuntimeSceneMap.vue'
import { getRuntimeSceneEvidenceKey, type RuntimeSceneModel } from '@/utils/runtime-scene'

function createSceneModel(): RuntimeSceneModel {
  const boundary: RuntimeSceneModel['boundaries'][number] = {
    key: 'SINGLE_LAYER_A',
    stationRole: 'TARGET',
    stationCode: 'TARGET_ARM',
    positionCode: 'SINGLE_LAYER_A',
    rackKind: 'SINGLE_LAYER',
    snapshotKind: 'ACTIVE_BIN_RACK',
    stationLease: 'ACTIVE_DISPATCH_LEASE',
    stationLeaseLabel: 'Station lease：调度租约占用',
    rackSnapshot: 'ACTIVE',
    rackSnapshotLabel: '执行快照：当前执行货架',
    rackOperationWait: 'WAITING_WMS',
    rackOperationWaitLabel: 'Rack operation：等待 WMS 搬运到位',
    resourceEvidenceKind: 'WMS_CALLBACK_EVIDENCE',
    resourceEvidenceKindLabel: 'WMS 回调证据',
    evidenceCount: 2
  }
  const unlocatedAuditItems: RuntimeSceneModel['unlocatedAuditItems'] = [
    {
      resourceKind: 'PKG',
      resourceKindLabel: 'PKG',
      resourceCode: 'PKG-UNLOCATED',
      displayLabel: 'PKG PKG-UNLOCATED',
      evidenceKind: 'GENERIC_EVIDENCE',
      evidenceKindLabel: '通用 evidence',
      sourceTraceId: 'trace-unlocated'
    }
  ]
  const locatedEvidence: RuntimeSceneModel['resourceEvidence'] = [
    {
      resourceKind: 'RACK',
      resourceKindLabel: 'Rack',
      resourceCode: 'RACK-001',
      displayLabel: 'RACK RACK-001',
      evidenceKind: 'WES_ACTIVE_SNAPSHOT',
      evidenceKindLabel: 'WES active snapshot evidence',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001'
    },
    {
      resourceKind: 'BIN',
      resourceKindLabel: 'Bin',
      resourceCode: 'BIN-001',
      displayLabel: 'BIN BIN-001',
      evidenceKind: 'WMS_CALLBACK_EVIDENCE',
      evidenceKindLabel: 'WMS 回调证据',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      binCode: 'BIN-001',
      sourceSessionId: 20,
      sourceTraceId: 'trace-20'
    }
  ]
  const resourceEvidence: RuntimeSceneModel['resourceEvidence'] = [
    ...locatedEvidence,
    ...unlocatedAuditItems
  ]
  const binEvidence = locatedEvidence[1]!

  return {
    worklineId: 45,
    worklineName: '粗分线',
    worklineCode: 'WL-45',
    readiness: 'READY',
    readinessLabel: '待机 / 可接收生产事件',
    runtimeStatusLabel: '现场 START 后待机 / 可接收',
    boundaries: [boundary],
    deviceNodes: [
      {
        id: 101,
        deviceCode: 'ARM01',
        deviceName: '机械臂 1',
        deviceRole: 'ARM',
        roleIndex: 1,
        status: 'IDLE',
        maintenanceMode: false,
        currentCommandId: null,
        openCommandCount: 0,
        blockedOutboxCount: 0,
        runtimeHoldCount: 0,
        errorCode: null
      }
    ],
    resourceEvidence,
    positionGroups: [
      {
        key: 'SINGLE_LAYER_A',
        stationCode: 'TARGET_ARM',
        stationRole: 'TARGET',
        positionCode: 'SINGLE_LAYER_A',
        boundary,
        attentionState: 'waiting',
        resourceStacks: [
          {
            key: 'rack:RACK-001',
            anchor: {
              kind: 'RACK',
              code: 'RACK-001',
              displayLabel: 'RACK RACK-001'
            },
            rackCode: 'RACK-001',
            children: [
              {
                key: getRuntimeSceneEvidenceKey(binEvidence),
                kind: 'BIN',
                code: 'BIN-001',
                displayLabel: 'BIN BIN-001',
                evidenceKind: 'WMS_CALLBACK_EVIDENCE'
              }
            ],
            evidenceCount: 2,
            evidenceKinds: ['WES_ACTIVE_SNAPSHOT', 'WMS_CALLBACK_EVIDENCE'],
            auditItems: locatedEvidence
          }
        ],
        auditItems: locatedEvidence
      }
    ],
    unlocatedAuditItems,
    resourceEvidenceTotalCount: 7,
    resourceEvidenceTruncated: true,
    semanticFallback: false,
    semanticFallbackMessage: null
  }
}

function createBinOnlySceneModel(
  resourceEvidence: RuntimeSceneModel['resourceEvidence']
): RuntimeSceneModel {
  const model = createSceneModel()
  const boundary = model.boundaries[0]
  if (!boundary) return model

  return {
    ...model,
    resourceEvidence,
    positionGroups: [
      {
        key: boundary.key,
        stationCode: boundary.stationCode,
        stationRole: boundary.stationRole,
        positionCode: boundary.positionCode,
        boundary,
        attentionState: 'waiting',
        resourceStacks: [
          {
            key: 'bin:BIN-001',
            anchor: {
              kind: 'BIN',
              code: 'BIN-001',
              displayLabel: 'BIN BIN-001'
            },
            binCode: 'BIN-001',
            children: [],
            evidenceCount: resourceEvidence.length,
            evidenceKinds: ['WMS_CALLBACK_EVIDENCE'],
            auditItems: resourceEvidence
          }
        ],
        auditItems: resourceEvidence
      }
    ],
    unlocatedAuditItems: [],
    resourceEvidenceTotalCount: resourceEvidence.length,
    resourceEvidenceTruncated: false
  }
}

describe('RuntimeSceneMap', () => {
  it('renders grouped position resources, focus evidence, and unlocated audit items', async () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model: createSceneModel()
      }
    })

    expect(wrapper.findAll('[data-test="runtime-scene-evidence-item"]')).toHaveLength(0)
    expect(wrapper.get('[data-test="runtime-scene-position-group"]').text()).toContain(
      'SINGLE_LAYER_A'
    )
    expect(wrapper.get('[data-test="runtime-scene-resource-stack"]').text()).toContain(
      'RACK-001'
    )
    expect(wrapper.get('[data-test="runtime-scene-station-lease"]').text()).toContain(
      'Station lease：调度租约占用'
    )
    expect(wrapper.get('[data-test="runtime-scene-rack-operation"]').text()).toContain(
      '等待 WMS 搬运到位'
    )
    expect(wrapper.get('[data-test="runtime-scene-rack-snapshot"]').text()).toContain(
      '执行快照：当前执行货架'
    )
    expect(wrapper.get('[data-test="runtime-scene-focus-panel"]').text()).toContain('trace-20')
    expect(wrapper.get('[data-test="runtime-scene-focus-panel"]').text()).not.toContain(
      'PKG-UNLOCATED'
    )
    expect(wrapper.get('[data-test="runtime-scene-truncated"]').text()).toBe(
      '仅展示前 3 条证据 / 共 7 条'
    )
    const unlocatedAudit = wrapper.get('[data-test="runtime-scene-unlocated-audit"]')
    expect(unlocatedAudit.text()).toContain('PKG-UNLOCATED')
    expect(unlocatedAudit.get('[data-test="runtime-scene-evidence-truncated"]').text()).toBe(
      '仅展示前 3 条证据 / 共 7 条'
    )

    await wrapper.get('[data-test="runtime-scene-resource-stack"]').trigger('click')

    expect(wrapper.get('[data-test="runtime-scene-focus-panel"]').text()).toContain('BIN-001')
  })

  it('renders semantic fallback when plugin manifest or contract fields are unavailable', () => {
    const model = {
      ...createSceneModel(),
      boundaries: [],
      resourceEvidence: [],
      positionGroups: [],
      unlocatedAuditItems: [],
      resourceEvidenceTotalCount: 0,
      resourceEvidenceTruncated: false,
      semanticFallback: true,
      semanticFallbackMessage: '插件边界 manifest 加载失败，当前仅展示通用 evidence。'
    }

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model
      }
    })

    expect(wrapper.get('[data-test="runtime-scene-fallback"]').text()).toContain(
      'manifest 加载失败'
    )
    expect(wrapper.get('[data-test="runtime-scene-empty-evidence"]').text()).toContain(
      '通用 evidence'
    )
  })

  it('uses neutral empty evidence copy when semantics are loaded', () => {
    const model = {
      ...createSceneModel(),
      resourceEvidence: [],
      positionGroups: [],
      unlocatedAuditItems: [],
      resourceEvidenceTotalCount: 0,
      resourceEvidenceTruncated: false
    }

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model
      }
    })

    const empty = wrapper.get('[data-test="runtime-scene-empty-evidence"]')
    expect(empty.text()).toBe('暂无结构化资源证据')
    expect(empty.text()).not.toContain('通用 evidence')
  })

  it('marks the selected device and shows active session counts', () => {
    const model = createSceneModel()
    model.deviceNodes = [
      {
        ...model.deviceNodes[0]!,
        blockedOutboxCount: 1
      }
    ]
    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model,
        selectedDeviceId: 101,
        sessionCountsByDevice: new Map([[101, 3]])
      }
    })

    const device = wrapper.get('[data-test="runtime-scene-device"]')
    expect(device.classes()).toContain('is-selected')
    expect(device.text()).toContain('3条等待')
    expect(device.text()).toContain('1 已停靠')
    expect(device.text()).not.toContain('未完成命令')
  })

  it('renders device risk signals from runtime counters', () => {
    const model = createSceneModel()
    model.deviceNodes = [
      {
        id: 101,
        deviceCode: 'ARM01',
        deviceName: '机械臂 1',
        deviceRole: 'ARM',
        roleIndex: 1,
        status: 'ERROR',
        maintenanceMode: true,
        currentCommandId: 3001,
        openCommandCount: 2,
        blockedOutboxCount: 1,
        runtimeHoldCount: 1,
        errorCode: 'DEVICE_FAULT'
      }
    ]

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model
      }
    })

    const device = wrapper.get('[data-test="runtime-scene-device"]')
    expect(device.classes()).toContain('has-runtime-hold')
    expect(device.classes()).toContain('has-parked-outbox')
    expect(wrapper.text()).toContain('维护')
    expect(device.text()).toContain('ERROR: DEVICE_FAULT')
    expect(wrapper.get('[data-test="runtime-scene-device-open-command"]').text()).toContain(
      '2 未完成命令'
    )
    expect(wrapper.get('[data-test="runtime-scene-device-runtime-hold"]').text()).toContain(
      'Runtime Hold 1'
    )
    expect(wrapper.get('[data-test="runtime-scene-device-parked-outbox"]').text()).toContain(
      '1 已停靠'
    )
  })

  it('keeps repeated evidence rows unique when source traces differ', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const repeatedEvidence: RuntimeSceneModel['resourceEvidence'] = [
      {
        resourceKind: 'BIN',
        resourceKindLabel: 'Bin',
        resourceCode: 'BIN-001',
        displayLabel: 'BIN BIN-001',
        evidenceKind: 'WMS_CALLBACK_EVIDENCE',
        evidenceKindLabel: 'WMS 回调证据',
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        binCode: 'BIN-001',
        sourceSessionId: 20,
        sourceTraceId: 'trace-20'
      },
      {
        resourceKind: 'BIN',
        resourceKindLabel: 'Bin',
        resourceCode: 'BIN-001',
        displayLabel: 'BIN BIN-001',
        evidenceKind: 'WMS_CALLBACK_EVIDENCE',
        evidenceKindLabel: 'WMS 回调证据',
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        binCode: 'BIN-001',
        sourceSessionId: 21,
        sourceTraceId: 'trace-21'
      }
    ]
    const model = createBinOnlySceneModel(repeatedEvidence.slice(0, 1))
    const nextModel = createBinOnlySceneModel(repeatedEvidence)

    try {
      const wrapper = mount(RuntimeSceneMap, {
        props: {
          model
        }
      })
      await wrapper.setProps({ model: nextModel })
      const warnings = warnSpy.mock.calls.flat().join('\n')
      expect(warnings).not.toContain('Duplicate keys')
    } finally {
      warnSpy.mockRestore()
    }
  })
})
