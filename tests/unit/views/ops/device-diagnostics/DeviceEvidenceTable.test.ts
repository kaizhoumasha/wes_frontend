/* eslint-disable vue/one-component-per-file -- test-local component stubs */
import { defineComponent, nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DeviceEvidenceTable from '@/views/ops/device-diagnostics/DeviceEvidenceTable.vue'
import type { DeviceEvidenceRow } from '@/views/ops/device-diagnostics/useDeviceEvidenceStream'

const attemptRow: DeviceEvidenceRow = {
  rowKey: 'attempt-1',
  requestId: 'request-1',
  evidenceId: 1,
  gap: false,
  payloadBytes: 128,
  attempt: {
    request_id: 'request-1',
    kind: 'DEVICE_RESULT',
    path: '/api/v1/callback/result',
    received_at: '2026-08-23T08:00:00Z',
    disposition: 'ACCEPTED',
    status_code: 200,
    evidence_id: 1,
    source_event_id: 'RESULT:CMD-001',
    device_code: 'ARM-01',
    command_code: 'CMD-001',
    event_type: null,
    apply_status: 'PENDING',
    error_code: null,
    observed_body_bytes: 128,
    raw_payload: { text: '<script>alert(1)</script>' }
  },
  latestUpdate: null
}

const DataTableStub = defineComponent({
  name: 'DataTable',
  props: {
    data: { type: Array, required: true },
    columns: { type: Array, required: true }
  },
  template: '<div class="data-table-stub" />'
})

const StandardDrawerStub = defineComponent({
  name: 'StandardDrawer',
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' }
  },
  template: '<section v-if="modelValue"><h2>{{ title }}</h2><slot /></section>'
})

describe('DeviceEvidenceTable', () => {
  it('maps RESULT/EVENT diagnostic columns and spans gap rows across the table', () => {
    const gap: DeviceEvidenceRow = {
      rowKey: 'gap-1',
      requestId: null,
      evidenceId: null,
      gap: true,
      payloadBytes: 0,
      attempt: null,
      latestUpdate: null
    }
    const wrapper = shallowMount(DeviceEvidenceTable, {
      props: { rows: [gap, attemptRow] },
      global: { stubs: { DataTable: DataTableStub, StandardDrawer: StandardDrawerStub } }
    })
    const table = wrapper.findComponent(DataTableStub)
    const columns = table.props('columns') as Array<{
      field?: string
      title?: string
      formatter?: (value: unknown, row: Record<string, unknown>) => unknown
    }>
    const titles = columns.map(column => column.title)
    expect(titles).toEqual([
      '时间',
      '类型',
      '设备',
      '指令 / 事件',
      'HTTP 处置',
      'Evidence 应用',
      'HTTP',
      '操作'
    ])
    const exposed = wrapper.vm as unknown as {
      spanMethod: (scope: { row: DeviceEvidenceRow; columnIndex: number }) => [number, number]
    }
    expect(exposed.spanMethod({ row: gap, columnIndex: 0 })).toEqual([1, 8])
    expect(exposed.spanMethod({ row: gap, columnIndex: 1 })).toEqual([0, 0])

    expect(
      columns
        .find(column => column.field === 'time')
        ?.formatter?.('2026-08-23T08:00:00Z', { time: '2026-08-23T08:00:00Z' })
    ).toBe('2026-08-23T08:00:00Z')
    const dispositionBadge = columns
      .find(column => column.field === 'disposition')
      ?.formatter?.('ACCEPTED', { disposition: 'ACCEPTED' }) as {
      props?: { class?: string }
      children?: unknown
    }
    const applyBadge = columns
      .find(column => column.field === 'applyStatus')
      ?.formatter?.('RECONCILING', { applyStatus: 'RECONCILING' }) as {
      props?: { class?: string }
    }
    expect(dispositionBadge.props?.class).toContain('evidence-badge--success')
    expect(dispositionBadge.children).toEqual([
      expect.objectContaining({ props: { class: 'evidence-badge__dot', 'aria-hidden': 'true' } }),
      'ACCEPTED'
    ])
    expect(applyBadge.props?.class).toContain('evidence-badge--warning')
  })

  it('shows parsed JSON in an escaped pre and emits row-scoped real command launch', async () => {
    const wrapper = shallowMount(DeviceEvidenceTable, {
      props: { rows: [attemptRow] },
      global: { stubs: { DataTable: DataTableStub, StandardDrawer: StandardDrawerStub } }
    })
    const exposed = wrapper.vm as unknown as {
      showDetails: (row: DeviceEvidenceRow) => void
      launchDebug: (row: DeviceEvidenceRow) => void
    }
    exposed.showDetails(attemptRow)
    await nextTick()
    expect(wrapper.text()).toContain('诊断详情（payload 为解析 JSON）')
    expect(wrapper.find('pre').text()).toContain('<script>alert(1)</script>')
    expect(wrapper.find('pre').text()).toContain('"request_id": "request-1"')
    expect(wrapper.find('script').exists()).toBe(false)

    exposed.launchDebug(attemptRow)
    expect(wrapper.emitted('debug')).toEqual([['ARM-01', null]])
  })

  it('shows rejection metadata even when no raw payload is available', async () => {
    const rejected: DeviceEvidenceRow = {
      ...attemptRow,
      rowKey: 'rejected-1',
      attempt: {
        ...attemptRow.attempt!,
        disposition: 'REJECTED',
        status_code: 400,
        error_code: 'INVALID_ENVELOPE',
        raw_payload: null
      }
    }
    const wrapper = shallowMount(DeviceEvidenceTable, {
      props: { rows: [rejected] },
      global: { stubs: { DataTable: DataTableStub, StandardDrawer: StandardDrawerStub } }
    })

    ;(wrapper.vm as unknown as { showDetails: (row: DeviceEvidenceRow) => void }).showDetails(
      rejected
    )
    await nextTick()

    expect(wrapper.find('pre').text()).toContain('"error_code": "INVALID_ENVELOPE"')
    expect(wrapper.find('pre').text()).toContain('"status_code": 400')
    expect(wrapper.find('pre').text()).toContain('"raw_payload": null')
  })

  it('shows both the ingress attempt and its latest evidence update', async () => {
    const correlated: DeviceEvidenceRow = {
      ...attemptRow,
      latestUpdate: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        source_event_id: 'RESULT:CMD-001',
        processed_at: '2026-08-23T08:00:01Z',
        device_code: 'ARM-01',
        command_code: 'CMD-001',
        event_type: null,
        apply_status: 'APPLIED'
      }
    }
    const wrapper = shallowMount(DeviceEvidenceTable, {
      props: { rows: [correlated] },
      global: { stubs: { DataTable: DataTableStub, StandardDrawer: StandardDrawerStub } }
    })

    ;(wrapper.vm as unknown as { showDetails: (row: DeviceEvidenceRow) => void }).showDetails(
      correlated
    )
    await nextTick()

    const details = JSON.parse(wrapper.find('pre').text()) as Record<string, unknown>
    expect(Object.keys(details)).toEqual(['attempt', 'latestUpdate'])
    expect(details.attempt).toMatchObject({
      request_id: 'request-1',
      disposition: 'ACCEPTED',
      raw_payload: { text: '<script>alert(1)</script>' }
    })
    expect(details.latestUpdate).toEqual({
      evidence_id: 1,
      kind: 'DEVICE_RESULT',
      source_event_id: 'RESULT:CMD-001',
      processed_at: '2026-08-23T08:00:01Z',
      device_code: 'ARM-01',
      command_code: 'CMD-001',
      event_type: null,
      apply_status: 'APPLIED'
    })
  })
})
