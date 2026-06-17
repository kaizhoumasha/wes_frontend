import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
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

describe('RuntimeSceneMap', () => {
  beforeEach(() => {
    // jsdom 的 canvas API 默认返回 null；RuntimeSceneDeviceFlow 内部
    // 调 getContext('2d') 时给个 mock，避免 onMounted 抛错。
    if (typeof HTMLCanvasElement !== 'undefined') {
      const proto = HTMLCanvasElement.prototype
      if (!proto.getContext) {
        proto.getContext = function () {
          return {
            save: () => undefined,
            restore: () => undefined,
            setTransform: () => undefined,
            clearRect: () => undefined,
            beginPath: () => undefined,
            closePath: () => undefined,
            moveTo: () => undefined,
            lineTo: () => undefined,
            arc: () => undefined,
            arcTo: () => undefined,
            fill: () => undefined,
            stroke: () => undefined,
            fillText: () => undefined,
            setLineDash: () => undefined,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            lineDashOffset: 0,
            globalAlpha: 1,
            font: '',
            textBaseline: 'top',
            shadowColor: '',
            shadowBlur: 0
          } as unknown as CanvasRenderingContext2D
        }
      }
    }
  })

  it('keeps business and rack projection details out of the topology canvas', () => {
    const model = createSceneModel()
    model.worklineName = 'Smoke 单层货架线'
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

    const text = wrapper.get('[data-test="runtime-scene-map"]').text()
    // CLASSIFIER_WORK 设备被 HIDDEN_TOPOLOGY_ROLES 过滤掉, 不进 deviceNodes,
    // canvas 画布就不会出现这条设备对应的 text 提示。`CLASSIFIER_WORK` 也
    // 不会再作为 position role 显式渲染。
    expect(text).not.toContain('CLASSIFIER_WORK')
    expect(text).not.toContain('Station lease')
    expect(text).not.toContain('执行快照')
    expect(text).not.toContain('单层货架')
    expect(text).not.toContain('RACK-001')
    expect(text).not.toContain('BIN-001')
    expect(text).not.toContain('CELL-A1')
  })

  it('renders the readiness header line and truncated evidence counter', () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: { model: createSceneModel() }
    })

    expect(wrapper.get('[data-test="runtime-scene-readiness"]').text()).toContain('WL-45')
    expect(wrapper.get('[data-test="runtime-scene-readiness"]').text()).toContain('待机')
    expect(wrapper.get('[data-test="runtime-scene-truncated"]').text()).toBe(
      '仅展示前 8 条证据 / 共 8 条'
    )
  })

  it('renders a single canvas element for the topology flow', () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: { model: createSceneModel() }
    })
    expect(wrapper.find('[data-test="runtime-scene-device-flow-canvas"]').exists()).toBe(true)
  })

  it('renders the semantic fallback banner when manifest load fails', () => {
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
      props: { model }
    })

    expect(wrapper.get('[data-test="runtime-scene-fallback"]').text()).toContain(
      'manifest 加载失败'
    )
  })

  it('forwards select-device and select-rack-position events from the canvas', async () => {
    // jsdom 默认 getBoundingClientRect 返回 0/0，hit-test 永远失败。注入一个
    // 假矩形让 css 坐标可预测，再点击设备节点中心。
    const original = HTMLCanvasElement.prototype.getBoundingClientRect
    HTMLCanvasElement.prototype.getBoundingClientRect = function () {
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 2000,
        bottom: 2000,
        width: 2000,
        height: 2000,
        toJSON: () => ({})
      }
    }
    try {
      const wrapper = mount(RuntimeSceneMap, {
        props: { model: createSceneModel() }
      })
      const canvas = wrapper.find('[data-test="runtime-scene-device-flow-canvas"]')
      // 设备 1 在 fallback layout 第一格 (x=24, y=24)，中心 (134, 64)。
      await canvas.trigger('click', { clientX: 134, clientY: 64 })
      expect(wrapper.emitted('selectDevice')).toBeDefined()
      expect(wrapper.emitted('selectDevice')![0]).toEqual([101])
    } finally {
      HTMLCanvasElement.prototype.getBoundingClientRect = original
    }
  })

  it('omits the position-tab, rack-layout-panel, rack-inspector, and unlocated-audit sections', () => {
    const wrapper = mount(RuntimeSceneMap, {
      props: { model: createSceneModel() }
    })
    expect(wrapper.find('[data-test="runtime-scene-position-group"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="runtime-rack-layout-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="runtime-rack-inspector"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="runtime-scene-unlocated-audit"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="runtime-scene-focus-panel"]').exists()).toBe(false)
  })
})
