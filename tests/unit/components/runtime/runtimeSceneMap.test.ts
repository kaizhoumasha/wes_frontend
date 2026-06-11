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
      resourceKind: 'SLOT',
      resourceKindLabel: 'Slot',
      resourceCode: 'A',
      displayLabel: 'Slot A',
      evidenceKind: 'WES_ACTIVE_SNAPSHOT',
      evidenceKindLabel: 'WES active snapshot evidence',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      slotCode: 'A'
    },
    {
      resourceKind: 'SLOT',
      resourceKindLabel: 'Slot',
      resourceCode: 'B',
      displayLabel: 'Slot B',
      evidenceKind: 'WES_ACTIVE_SNAPSHOT',
      evidenceKindLabel: 'WES active snapshot evidence',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      slotCode: 'B'
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
      slotCode: 'A',
      binCode: 'BIN-001',
      sourceSessionId: 20,
      sourceTraceId: 'trace-20'
    },
    {
      resourceKind: 'CELL',
      resourceKindLabel: 'Cell',
      resourceCode: 'CELL-A1',
      displayLabel: 'Cell CELL-A1',
      evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
      evidenceKindLabel: 'Trace 资源证据',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      slotCode: 'A',
      binCode: 'BIN-001'
    },
    {
      resourceKind: 'PKG',
      resourceKindLabel: 'PKG',
      resourceCode: 'PKG-001',
      displayLabel: 'PKG PKG-001',
      evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
      evidenceKindLabel: 'Trace 资源证据',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      slotCode: 'A',
      binCode: 'BIN-001',
      pkgCode: 'PKG-001',
      materialCode: '620100L00-011-G',
      dateCode: '2401',
      lotCode: 'LOT-A',
      reelCode: 'REEL-BOTTOM',
      positionIndex: 1
    },
    {
      resourceKind: 'PKG',
      resourceKindLabel: 'PKG',
      resourceCode: 'PKG-002',
      displayLabel: 'PKG PKG-002',
      evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
      evidenceKindLabel: 'Trace 资源证据',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_A',
      rackCode: 'RACK-001',
      slotCode: 'A',
      binCode: 'BIN-001',
      pkgCode: 'PKG-002',
      materialCode: '620100L00-011-G',
      dateCode: '2401',
      lotCode: 'LOT-A',
      reelCode: 'REEL-TOP',
      positionIndex: 2
    }
  ]
  const resourceEvidence: RuntimeSceneModel['resourceEvidence'] = [
    ...locatedEvidence,
    ...unlocatedAuditItems
  ]
  const binEvidence = locatedEvidence[3]!
  const cellEvidence = locatedEvidence[4]!
  const bottomPkgEvidence = locatedEvidence[5]!
  const topPkgEvidence = locatedEvidence[6]!

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
            evidenceCount: locatedEvidence.length,
            evidenceKinds: [
              'WES_ACTIVE_SNAPSHOT',
              'WMS_CALLBACK_EVIDENCE',
              'TRACE_RESOURCE_EVIDENCE'
            ],
            auditItems: locatedEvidence
          }
        ],
        rackLayouts: [
          {
            key: 'rack-layout:RACK-001',
            rackCode: 'RACK-001',
            displayLabel: 'RACK RACK-001',
            stationCode: 'TARGET_ARM',
            positionCode: 'SINGLE_LAYER_A',
            attentionState: 'waiting',
            slots: [
              {
                key: 'rack-layout:RACK-001:slot:A',
                code: 'A',
                displayLabel: 'Slot A',
                bin: {
                  key: 'rack-layout:RACK-001:bin:BIN-001',
                  code: 'BIN-001',
                  displayLabel: 'BIN BIN-001',
                  slotCode: 'A',
                  cells: [
                    {
                      key: 'rack-layout:RACK-001:bin:BIN-001:cell:CELL-A1',
                      code: 'CELL-A1',
                      displayLabel: 'Cell CELL-A1',
                      materials: [
                        {
                          key: 'material:PKG:PKG-001',
                          kind: 'PKG',
                          code: 'PKG-001',
                          displayLabel: 'PKG PKG-001',
                          evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
                          materialCode: '620100L00-011-G',
                          dateCode: '2401',
                          lotCode: 'LOT-A',
                          reelCode: 'REEL-BOTTOM',
                          positionIndex: 1,
                          auditItems: [bottomPkgEvidence]
                        },
                        {
                          key: 'material:PKG:PKG-002',
                          kind: 'PKG',
                          code: 'PKG-002',
                          displayLabel: 'PKG PKG-002',
                          evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
                          materialCode: '620100L00-011-G',
                          dateCode: '2401',
                          lotCode: 'LOT-A',
                          reelCode: 'REEL-TOP',
                          positionIndex: 2,
                          auditItems: [topPkgEvidence]
                        }
                      ],
                      materialSummary: {
                        materialCode: '620100L00-011-G',
                        dateCode: '2401',
                        lotCode: 'LOT-A',
                        reelCount: 2,
                        batchStatus: 'single',
                        hasBatchFields: true
                      },
                      materialReels: [
                        {
                          key: 'material:PKG:PKG-001:reel:REEL-BOTTOM:0',
                          reelCode: 'REEL-BOTTOM',
                          materialCode: '620100L00-011-G',
                          dateCode: '2401',
                          lotCode: 'LOT-A',
                          positionIndex: 1,
                          displayLabel: 'PKG PKG-001',
                          evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
                          auditItems: [bottomPkgEvidence]
                        },
                        {
                          key: 'material:PKG:PKG-002:reel:REEL-TOP:1',
                          reelCode: 'REEL-TOP',
                          materialCode: '620100L00-011-G',
                          dateCode: '2401',
                          lotCode: 'LOT-A',
                          positionIndex: 2,
                          displayLabel: 'PKG PKG-002',
                          evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
                          auditItems: [topPkgEvidence]
                        }
                      ],
                      evidenceCount: 3,
                      evidenceKinds: ['TRACE_RESOURCE_EVIDENCE'],
                      auditItems: [cellEvidence, bottomPkgEvidence, topPkgEvidence]
                    }
                  ],
                  looseMaterials: [],
                  evidenceCount: 4,
                  evidenceKinds: ['WMS_CALLBACK_EVIDENCE', 'TRACE_RESOURCE_EVIDENCE'],
                  auditItems: [binEvidence, cellEvidence, bottomPkgEvidence, topPkgEvidence]
                },
                looseMaterials: [],
                state: 'material',
                evidenceCount: 5,
                evidenceKinds: [
                  'WES_ACTIVE_SNAPSHOT',
                  'WMS_CALLBACK_EVIDENCE',
                  'TRACE_RESOURCE_EVIDENCE'
                ],
                auditItems: [
                  locatedEvidence[1]!,
                  binEvidence,
                  cellEvidence,
                  bottomPkgEvidence,
                  topPkgEvidence
                ]
              },
              {
                key: 'rack-layout:RACK-001:slot:B',
                code: 'B',
                displayLabel: 'Slot B',
                bin: null,
                looseMaterials: [],
                state: 'empty',
                evidenceCount: 1,
                evidenceKinds: ['WES_ACTIVE_SNAPSHOT'],
                auditItems: [locatedEvidence[2]!]
              }
            ],
            unlocatedBins: [],
            looseMaterials: [],
            evidenceCount: locatedEvidence.length,
            evidenceKinds: [
              'WES_ACTIVE_SNAPSHOT',
              'WMS_CALLBACK_EVIDENCE',
              'TRACE_RESOURCE_EVIDENCE'
            ],
            auditItems: locatedEvidence
          }
        ],
        auditItems: locatedEvidence
      }
    ],
    unlocatedAuditItems,
    resourceEvidenceTotalCount: 8,
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
        rackLayouts: [],
        auditItems: resourceEvidence
      }
    ],
    unlocatedAuditItems: [],
    resourceEvidenceTotalCount: resourceEvidence.length,
    resourceEvidenceTruncated: false
  }
}

describe('RuntimeSceneMap', () => {
  it('keeps business and rack projection details out of the topology canvas', () => {
    const model = createSceneModel()
    model.deviceNodes = [
      {
        id: 901,
        deviceCode: 'CLS-01',
        deviceName: '1号分类工位',
        deviceRole: 'CLASSIFIER_WORK',
        roleIndex: 1,
        status: 'ONLINE',
        maintenanceMode: false,
        openCommandCount: 0,
        blockedOutboxCount: 0,
        runtimeHoldCount: 0
      }
    ]

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model
      }
    })

    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('CLASSIFIER_WORK')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('Station lease')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('执行快照')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('单层货架')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('RACK-001')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('BIN-001')
    expect(wrapper.get('[data-test="runtime-scene-map"]').text()).not.toContain('CELL-A1')
  })

  it('renders grouped position resources, focus evidence, and unlocated audit items', async () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model: createSceneModel(),
        showRackDetails: true
      }
    })

    expect(wrapper.findAll('[data-test="runtime-scene-evidence-item"]')).toHaveLength(0)
    expect(wrapper.get('[data-test="runtime-scene-position-group"]').text()).toContain(
      'SINGLE_LAYER_A'
    )
    expect(wrapper.get('[data-test="runtime-rack-layout-panel"]').text()).toContain('RACK-001')
    expect(wrapper.get('[data-test="runtime-scene-position-group"]').text()).toContain(
      '7 条投影证据'
    )
    expect(wrapper.get('[data-test="runtime-rack-inspector"]').text()).toContain('BIN-001')
    expect(wrapper.get('[data-test="runtime-rack-inspector"]').text()).not.toContain(
      'PKG-UNLOCATED'
    )
    expect(wrapper.get('[data-test="runtime-scene-truncated"]').text()).toBe(
      '仅展示前 8 条证据 / 共 8 条'
    )
    const unlocatedAudit = wrapper.get('[data-test="runtime-scene-unlocated-audit"]')
    expect(unlocatedAudit.text()).toContain('PKG-UNLOCATED')
    expect(unlocatedAudit.get('[data-test="runtime-scene-evidence-truncated"]').text()).toBe(
      '仅展示前 8 条证据 / 共 8 条'
    )
  })

  it('renders a rack grid and drills from slot to bin, cell, and material evidence', async () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model: createSceneModel(),
        showRackDetails: true
      }
    })

    expect(wrapper.get('[data-test="runtime-rack-layout-panel"]').text()).toContain('RACK-001')
    const slots = wrapper.findAll('[data-test="runtime-rack-slot"]')
    expect(slots).toHaveLength(2)
    expect(slots[0]?.text()).toContain('BIN-001')
    expect(slots[1]?.text()).toContain('空位')

    await slots[0]?.trigger('click')

    const inspector = wrapper.get('[data-test="runtime-rack-inspector"]')
    expect(inspector.text()).toContain('BIN-001')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('A')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('B')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('C')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('D')
    expect(inspector.text()).toContain('CELL-A1')
    expect(inspector.text()).toContain('PKG-001')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain(
      '620100L00-011-G'
    )
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('DC 2401')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('LC LOT-A')
    expect(inspector.get('[data-test="runtime-bin-cell-grid"]').text()).toContain('2 盘')
    expect(inspector.get('[data-test="runtime-rack-cell-summary"]').text()).toContain(
      '620100L00-011-G'
    )
    expect(inspector.get('[data-test="runtime-rack-material-stack"]').text()).toContain('底部')
    expect(inspector.get('[data-test="runtime-rack-material-stack"]').text()).toContain('顶部')
    expect(
      inspector.findAll('[data-test="runtime-rack-material-reel"]').map(reel => reel.text())
    ).toEqual([
      expect.stringContaining('底层REEL-BOTTOM'),
      expect.stringContaining('顶层REEL-TOP')
    ])
  })

  it('defaults to the waiting position that has rack evidence', () => {
    const model = createSceneModel()
    const rackGroup = model.positionGroups[0]!
    const emptyBoundary = {
      ...rackGroup.boundary,
      key: 'SOURCE_STATION_A',
      stationRole: 'SOURCE',
      stationCode: 'SOURCE_STATION_A',
      positionCode: 'SOURCE_STATION_A'
    }
    model.positionGroups = [
      {
        ...rackGroup,
        key: 'SOURCE_STATION_A',
        stationRole: 'SOURCE',
        stationCode: 'SOURCE_STATION_A',
        positionCode: 'SOURCE_STATION_A',
        boundary: emptyBoundary,
        resourceStacks: [],
        rackLayouts: [],
        auditItems: []
      },
      rackGroup
    ]

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model,
        showRackDetails: true
      }
    })

    expect(wrapper.get('[data-test="runtime-rack-layout-panel"]').text()).toContain('RACK-001')
  })

  it('uses cell reel counts for rack and slot summaries instead of material entity count', () => {
    const model = createSceneModel()
    const cell = model.positionGroups[0]?.rackLayouts[0]?.slots[0]?.bin?.cells[0]
    if (!cell?.materialSummary) throw new Error('expected test fixture cell summary')
    cell.materialSummary.reelCount = 19
    cell.materials = cell.materials.slice(0, 1)
    cell.materialReels = []

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model,
        showRackDetails: true
      }
    })

    const panelText = wrapper.get('[data-test="runtime-rack-layout-panel"]').text()
    expect(panelText).toContain('2 格 · 1 箱 · 19 盘')
    expect(panelText).toContain('1 格 · 19 盘')
    expect(panelText).not.toContain('1 料')
  })

  it('does not double count bin-scoped material evidence when cells already report reel counts', () => {
    const model = createSceneModel()
    const slot = model.positionGroups[0]?.rackLayouts[0]?.slots[0]
    const bin = slot?.bin
    const cell = bin?.cells[0]
    if (!bin || !cell?.materialSummary) throw new Error('expected test fixture bin and cell')

    cell.materialSummary.reelCount = 5
    cell.materialReels = []
    bin.looseMaterials = Array.from({ length: 5 }, (_, index) => ({
      key: `material:PKG:LOOSE-${index + 1}`,
      kind: 'PKG',
      code: `LOOSE-${index + 1}`,
      displayLabel: `PKG LOOSE-${index + 1}`,
      evidenceKind: 'TRACE_RESOURCE_EVIDENCE',
      auditItems: []
    }))

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model,
        showRackDetails: true
      }
    })

    const panelText = wrapper.get('[data-test="runtime-rack-layout-panel"]').text()
    expect(panelText).toContain('2 格 · 1 箱 · 5 盘')
    expect(panelText).toContain('1 格 · 5 盘')
    expect(panelText).toContain('5 条未定位')
    expect(panelText).not.toContain('10 盘')

    const inspector = wrapper.get('[data-test="runtime-rack-inspector"]')
    expect(inspector.text()).toContain('未定位证据')
    expect(inspector.text()).toContain('未绑定料格，不计入物理盘数')
  })

  it('explains when a cell has aggregate reel count but no reel-level details', async () => {
    const model = createSceneModel()
    const cell = model.positionGroups[0]?.rackLayouts[0]?.slots[0]?.bin?.cells[0]
    if (!cell?.materialSummary) throw new Error('expected test fixture cell summary')
    cell.materialSummary.reelCount = 19
    cell.materials = cell.materials.slice(0, 1)
    cell.materialReels = []

    const wrapper = mount(RuntimeSceneMap, {
      props: {
        model,
        showRackDetails: true
      }
    })

    await wrapper.findAll('[data-test="runtime-rack-slot"]')[0]?.trigger('click')

    const inspector = wrapper.get('[data-test="runtime-rack-inspector"]')
    expect(inspector.get('[data-test="runtime-rack-cell-summary"]').text()).toContain('19 盘')
    expect(inspector.text()).toContain('当前接口只提供汇总盘数，未提供逐盘明细')
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
