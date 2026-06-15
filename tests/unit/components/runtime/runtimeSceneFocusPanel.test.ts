import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RuntimeSceneFocusPanel from '@/components/runtime/monitor/RuntimeSceneFocusPanel.vue'
import type {
  RuntimeSceneBoundary,
  RuntimeScenePositionGroup,
  RuntimeSceneResourceEvidence,
  RuntimeSceneResourceStack
} from '@/utils/runtime-scene'

function createBoundary(): RuntimeSceneBoundary {
  return {
    key: 'TARGET_ARM:SINGLE_LAYER_A',
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
    evidenceCount: 1
  }
}

function createAuditItem(): RuntimeSceneResourceEvidence {
  return {
    resourceKind: 'BIN',
    resourceKindLabel: 'Bin',
    resourceCode: 'BIN-001',
    displayLabel: 'Bin BIN-001',
    evidenceKind: 'WMS_CALLBACK_EVIDENCE',
    evidenceKindLabel: 'WMS 回调证据',
    stationCode: 'TARGET_ARM',
    positionCode: 'SINGLE_LAYER_A',
    rackCode: 'RACK-001',
    binCode: 'BIN-001',
    sourceSessionId: 7001,
    sourceTraceId: 'trace-runtime-focus-001',
    occurredAt: '2026-06-09T01:00:00Z'
  }
}

function createStack(auditItems: RuntimeSceneResourceEvidence[]): RuntimeSceneResourceStack {
  return {
    key: 'rack:RACK-001',
    anchor: {
      kind: 'RACK',
      code: 'RACK-001',
      displayLabel: 'Rack RACK-001'
    },
    rackCode: 'RACK-001',
    children: [
      {
        key: 'child:BIN:BIN-001',
        kind: 'BIN',
        code: 'BIN-001',
        displayLabel: 'Bin BIN-001',
        evidenceKind: 'WMS_CALLBACK_EVIDENCE'
      }
    ],
    evidenceCount: auditItems.length,
    evidenceKinds: ['WMS_CALLBACK_EVIDENCE'],
    auditItems
  }
}

function createPositionGroup(): RuntimeScenePositionGroup {
  const boundary = createBoundary()
  const auditItems = [createAuditItem()]
  const stack = createStack(auditItems)

  return {
    key: boundary.key,
    stationCode: boundary.stationCode,
    stationRole: boundary.stationRole,
    positionCode: boundary.positionCode,
    boundary,
    attentionState: 'waiting',
    resourceStacks: [stack],
    auditItems
  }
}

describe('RuntimeSceneFocusPanel', () => {
  it('renders selected position, stack, and evidence context', () => {
    const group = createPositionGroup()
    const stack = group.resourceStacks[0]!

    const wrapper = mount(RuntimeSceneFocusPanel, {
      props: {
        group,
        stack,
        resourceEvidenceTruncated: true,
        resourceEvidenceVisibleCount: 1,
        resourceEvidenceTotalCount: 7
      }
    })

    expect(wrapper.text()).toContain('TARGET_ARM / SINGLE_LAYER_A')
    expect(wrapper.text()).not.toContain('Station lease')
    expect(wrapper.text()).not.toContain('Rack operation')
    expect(wrapper.text()).not.toContain('执行快照')
    expect(wrapper.text()).toContain('RACK-001')
    expect(wrapper.text()).toContain('BIN-001')
    expect(wrapper.text()).toContain('trace-runtime-focus-001')
    expect(wrapper.text()).toContain('7001')
    expect(wrapper.get('[data-test="runtime-scene-evidence-truncated"]').text()).toBe(
      '仅展示前 1 条证据 / 共 7 条'
    )
  })

  it('renders empty focus state without a selected group', () => {
    const wrapper = mount(RuntimeSceneFocusPanel, {
      props: {
        group: null,
        stack: null,
        resourceEvidenceTruncated: false,
        resourceEvidenceVisibleCount: 0,
        resourceEvidenceTotalCount: 0
      }
    })

    expect(wrapper.get('[data-test="runtime-scene-focus-empty"]').text()).toContain(
      '请选择现场位置'
    )
  })
})
