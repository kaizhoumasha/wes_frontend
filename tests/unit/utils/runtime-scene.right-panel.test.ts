import { describe, expect, it } from 'vitest'
import {
  buildRackOccupancyView,
  buildRackHierarchyView,
  buildSelectedDeviceCommandView,
  buildSelectedDeviceToteTwinView
} from '@/utils/runtime-scene'
import type {
  RuntimeMonitorCommandSnapshot,
  RuntimeMonitorDeviceNode,
  RuntimeMonitorSessionItem,
  RuntimeWorklineMonitorProjectionResponse
} from '@/types/runtime'

function makeDevice(
  overrides: Partial<RuntimeMonitorDeviceNode> = {}
): RuntimeMonitorDeviceNode {
  return {
    id: 101,
    device_code: 'ARM01',
    device_name: '机械臂 1',
    device_role: 'ARM',
    role_index: 1,
    device_status: 'IDLE',
    maintenance_mode: false,
    pending_command_count: 0,
    blocked_outbox_count: 0,
    open_command_count: 0,
    open_issue_count: 0,
    ...overrides
  } as RuntimeMonitorDeviceNode
}

function makeCommand(
  overrides: Partial<RuntimeMonitorCommandSnapshot> = {}
): RuntimeMonitorCommandSnapshot {
  return {
    id: 9001,
    command_code: 'PICK_AND_PUT',
    status: 'PENDING',
    sent_at: '2026-06-15T15:40:01Z',
    ack_received_at: null,
    ack_code: null,
    ack_message: null,
    ...overrides
  } as RuntimeMonitorCommandSnapshot
}

function makeSession(
  overrides: Partial<RuntimeMonitorSessionItem> = {}
): RuntimeMonitorSessionItem {
  return {
    session_id: 1,
    session_code: 'SESS-1',
    workline_id: 45,
    status: 'ACTIVE',
    is_timed_out: false,
    device_id: 101,
    ...overrides
  } as RuntimeMonitorSessionItem
}

describe('runtime-scene right-panel adapters', () => {
  describe('buildSelectedDeviceCommandView', () => {
    it('returns null when device is null or has no current_command', () => {
      expect(buildSelectedDeviceCommandView(null)).toBeNull()
      expect(buildSelectedDeviceCommandView(makeDevice({ current_command: null }))).toBeNull()
    })

    it('maps a pending command to the camelCase view', () => {
      const view = buildSelectedDeviceCommandView(
        makeDevice({ current_command: makeCommand() })
      )

      expect(view).toEqual({
        id: 9001,
        code: 'PICK_AND_PUT',
        status: 'PENDING',
        ackState: 'pending',
        sentAt: '2026-06-15T15:40:01Z',
        ackReceivedAt: null,
        ackCode: null,
        ackMessage: null
      })
    })

    it('derives ackState=acked when ack_received_at is present', () => {
      const view = buildSelectedDeviceCommandView(
        makeDevice({
          current_command: makeCommand({
            status: 'ACKED',
            ack_received_at: '2026-06-15T15:40:03Z',
            ack_code: 200,
            ack_message: 'OK'
          })
        })
      )

      expect(view?.ackState).toBe('acked')
      expect(view?.ackReceivedAt).toBe('2026-06-15T15:40:03Z')
      expect(view?.ackCode).toBe(200)
      expect(view?.ackMessage).toBe('OK')
    })

    it('derives ackState=rejected when status is REJECTED without ack', () => {
      const view = buildSelectedDeviceCommandView(
        makeDevice({ current_command: makeCommand({ status: 'REJECTED' }) })
      )
      expect(view?.ackState).toBe('rejected')
    })

    it('derives ackState=expired when status is EXPIRED', () => {
      const view = buildSelectedDeviceCommandView(
        makeDevice({ current_command: makeCommand({ status: 'EXPIRED' }) })
      )
      expect(view?.ackState).toBe('expired')
    })

    it('derives ackState=unknown for unrecognized statuses', () => {
      const view = buildSelectedDeviceCommandView(
        makeDevice({ current_command: makeCommand({ status: 'WHATEVER' }) })
      )
      expect(view?.ackState).toBe('unknown')
    })
  })

  describe('buildSelectedDeviceToteTwinView', () => {
    it('returns null when there is no device or matching session', () => {
      expect(buildSelectedDeviceToteTwinView(null, [])).toBeNull()
      expect(
        buildSelectedDeviceToteTwinView(makeDevice(), [makeSession({ device_id: 999 })])
      ).toBeNull()
    })

    it('builds an info-tone view from the matching session', () => {
      const view = buildSelectedDeviceToteTwinView(makeDevice(), [
        makeSession({
          status: 'ACTIVE',
          current_wait_type: 'WAIT_RACK',
          latest_timeline_action: 'DISPATCHED',
          latest_timeline_message: '指令已下发',
          started_at: '2026-06-15T15:40:00Z'
        })
      ])

      expect(view).not.toBeNull()
      expect(view?.tone).toBe('info')
      expect(view?.lpn).toBe('SESS-1')
      expect(view?.typeLabel).toBe('DISPATCHED')
      expect(view?.rows.map(row => row.label)).toEqual([
        '会话状态',
        '等待类型',
        '最近事件',
        '开始时间'
      ])
    })

    it('switches to warning tone when session has timeout or failure', () => {
      const view = buildSelectedDeviceToteTwinView(makeDevice(), [
        makeSession({
          is_timed_out: true,
          current_wait_type: 'WAIT_ECS',
          failure_code: 'ERR_X'
        })
      ])

      expect(view?.tone).toBe('warning')
      const failure = view?.rows.find(row => row.label === '失败编码')
      expect(failure?.emphasis).toBe('danger')
    })

    it('uses barcode as LPN when present', () => {
      const session = makeSession() as RuntimeMonitorSessionItem & Record<string, unknown>
      session.barcode = 'BARCODE-77'
      const view = buildSelectedDeviceToteTwinView(makeDevice(), [
        session as RuntimeMonitorSessionItem
      ])
      expect(view?.lpn).toBe('BARCODE-77')
    })
  })

  describe('buildRackOccupancyView', () => {
    function makeProjection(
      items: Array<Record<string, unknown>>
    ): RuntimeWorklineMonitorProjectionResponse {
      return {
        summary: { id: 1, line_code: 'WL', line_name: 'WL', device_count: 0 },
        boundary: {},
        device_nodes: [],
        active_sessions: { items: [], total_count: 0, truncated: false },
        recent_failed_traces: { items: [], total_count: 0, truncated: false },
        recent_completed_traces: { items: [], total_count: 0, truncated: false },
        action_candidates: { pending_reconciliation: null },
        resource_evidence: { items, total_count: items.length, truncated: false, kind: 'GENERIC_EVIDENCE' },
        generated_at: '2026-06-15T15:00:00Z'
      } as unknown as RuntimeWorklineMonitorProjectionResponse
    }

    it('returns null when there are no slot/bin/cell items', () => {
      const projection = makeProjection([
        { resource_kind: 'RACK', resource_code: 'RACK-1', display_label: 'RACK-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-1' }
      ])
      expect(buildRackOccupancyView(projection)).toBeNull()
    })

    it('maps slot/bin/cell evidence into the matrix view', () => {
      const projection = makeProjection([
        {
          resource_kind: 'CELL',
          resource_code: 'CELL-1',
          display_label: 'CELL-1',
          evidence_kind: 'WES_ACTIVE_SNAPSHOT',
          rack_code: 'RACK-1',
          cell_code: 'A1'
        },
        {
          resource_kind: 'BIN',
          resource_code: 'BIN-2',
          display_label: 'BIN-2',
          evidence_kind: 'WMS_CALLBACK_EVIDENCE',
          rack_code: 'RACK-1',
          bin_code: 'BIN-2',
          slot_code: 'A2'
        }
      ])

      const view = buildRackOccupancyView(projection, { columns: 5 })
      expect(view).not.toBeNull()
      expect(view?.columns).toBe(5)
      expect(view?.slots).toHaveLength(2)
      expect(view?.slots[0]?.code).toBe('A1')
      expect(view?.slots[0]?.state).toBe('empty')
      expect(view?.slots[1]?.state).toBe('reconciling')
      expect(view?.slots[1]?.tote).toBe('BIN-2')
    })

    it('defaults to 4 columns when not specified', () => {
      const projection = makeProjection([
        {
          resource_kind: 'CELL',
          resource_code: 'CELL-1',
          display_label: 'CELL-1',
          evidence_kind: 'WES_ACTIVE_SNAPSHOT',
          rack_code: 'RACK-1',
          cell_code: 'A1',
          bin_code: 'BIN-1',
          pkg_code: 'PKG-1'
        }
      ])

      const view = buildRackOccupancyView(projection)
      expect(view?.columns).toBe(4)
      expect(view?.slots[0]?.state).toBe('occupied')
    })
  })

  describe('buildRackHierarchyView', () => {
    function makeProjection(
      items: Array<Record<string, unknown>>
    ): RuntimeWorklineMonitorProjectionResponse {
      return {
        summary: { id: 1, line_code: 'WL', line_name: 'WL', device_count: 0 },
        boundary: {},
        device_nodes: [],
        active_sessions: { items: [], total_count: 0, truncated: false },
        recent_failed_traces: { items: [], total_count: 0, truncated: false },
        recent_completed_traces: { items: [], total_count: 0, truncated: false },
        action_candidates: { pending_reconciliation: null },
        resource_evidence: { items, total_count: items.length, truncated: false, kind: 'GENERIC_EVIDENCE' },
        generated_at: '2026-06-15T15:00:00Z'
      } as unknown as RuntimeWorklineMonitorProjectionResponse
    }

    it('returns null when there are no cell items', () => {
      const projection = makeProjection([
        { resource_kind: 'RACK', resource_code: 'RACK-1', display_label: 'RACK-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-1' },
        { resource_kind: 'SLOT', resource_code: 'A', display_label: 'A', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-1', slot_code: 'A' },
        { resource_kind: 'BIN', resource_code: 'BIN-001', display_label: 'BIN BIN-001', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-1', slot_code: 'A', bin_code: 'BIN-001' }
      ])
      expect(buildRackHierarchyView(projection)).toBeNull()
    })

    it('groups cells by (slot_code, bin_code) and drops SLOT/BIN/PKG summary items', () => {
      const projection = makeProjection([
        { resource_kind: 'RACK', resource_code: 'RACK-001', display_label: 'RACK RACK-001', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001' },
        { resource_kind: 'SLOT', resource_code: 'A', display_label: 'SLOT A', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'A', bin_code: 'BIN-001' },
        { resource_kind: 'BIN', resource_code: 'BIN-001', display_label: 'BIN BIN-001', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'A', bin_code: 'BIN-001' },
        { resource_kind: 'CELL', resource_code: 'BIN-001-1', display_label: 'CELL BIN-001-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'A', bin_code: 'BIN-001', cell_code: 'BIN-001-1', pkg_code: 'PKG-RT2-001' },
        { resource_kind: 'CELL', resource_code: 'BIN-001-2', display_label: 'CELL BIN-001-2', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'A', bin_code: 'BIN-001', cell_code: 'BIN-001-2' },
        { resource_kind: 'SLOT', resource_code: 'B', display_label: 'SLOT B', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'B', bin_code: 'BIN-002' },
        { resource_kind: 'CELL', resource_code: 'BIN-002-1', display_label: 'CELL BIN-002-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'B', bin_code: 'BIN-002', cell_code: 'BIN-002-1' },
        { resource_kind: 'PKG', resource_code: 'PKG-RT2-001', display_label: 'PKG PKG-RT2-001', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK-001', slot_code: 'A', bin_code: 'BIN-001', cell_code: 'BIN-001-1', pkg_code: 'PKG-RT2-001' }
      ])

      const view = buildRackHierarchyView(projection)
      expect(view).not.toBeNull()
      expect(view?.rackCode).toBe('RACK-001')
      expect(view?.totalCellCount).toBe(3)
      // 2 slot groups (A, B)
      expect(view?.slotGroups).toHaveLength(2)
      expect(view?.slotGroups[0]?.code).toBe('A')
      expect(view?.slotGroups[0]?.binCode).toBe('BIN-001')
      expect(view?.slotGroups[0]?.binDisplayLabel).toBe('BIN BIN-001')
      expect(view?.slotGroups[0]?.cells).toHaveLength(2)
      // PKG 被丢弃,只有 CELL 计入
      expect(view?.slotGroups[0]?.cells[0]?.code).toBe('BIN-001-1')
      expect(view?.slotGroups[0]?.cells[0]?.state).toBe('occupied')
      expect(view?.slotGroups[0]?.cells[0]?.tote).toBe('PKG-RT2-001')
      expect(view?.slotGroups[0]?.cells[1]?.state).toBe('empty')
      expect(view?.slotGroups[1]?.code).toBe('B')
      expect(view?.slotGroups[1]?.binCode).toBe('BIN-002')
    })

    it('uses resource_code as the cell identifier before falling back to bin_code', () => {
      const projection = makeProjection([
        { resource_kind: 'BIN', resource_code: 'BIN-1', display_label: 'BIN BIN-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK', slot_code: 'A', bin_code: 'BIN-1' },
        { resource_kind: 'CELL', resource_code: 'CELL-1', display_label: 'CELL CELL-1', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK', slot_code: 'A', bin_code: 'BIN-1' },
        { resource_kind: 'CELL', resource_code: 'CELL-2', display_label: 'CELL CELL-2', evidence_kind: 'WES_ACTIVE_SNAPSHOT', rack_code: 'RACK', slot_code: 'A', bin_code: 'BIN-1' }
      ])

      const view = buildRackHierarchyView(projection)

      expect(view?.totalCellCount).toBe(2)
      expect(view?.slotGroups[0]?.cells).toEqual([
        expect.objectContaining({ key: 'RACK:CELL-1', code: 'CELL-1' }),
        expect.objectContaining({ key: 'RACK:CELL-2', code: 'CELL-2' })
      ])
    })
  })
})
