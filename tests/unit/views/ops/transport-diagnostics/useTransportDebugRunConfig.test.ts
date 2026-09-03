import { describe, expect, it, vi } from 'vitest'
import {
  buildTransportDebugRunInput,
  buildTransportDebugRunPreview,
  loadMountedBins,
  validateTransportDebugRunConfig
} from '@/views/ops/transport-diagnostics/useTransportDebugRunConfig'

const bins = [
  { rack_code: '510056', rack_slot_code: 'S1', bin_code: 'B1', mount_status: 'MOUNTED' },
  { rack_code: '510056', rack_slot_code: 'S2', bin_code: 'B2', mount_status: 'MOUNTED' }
]

describe('useTransportDebugRunConfig', () => {
  it('preserves an opaque face in the request and exact payload preview', () => {
    const groups = [{ face: ' 90 ', bins: [bins[0]!] }]
    expect(validateTransportDebugRunConfig('510056', groups)).toBeNull()
    expect(buildTransportDebugRunInput('510056', groups).face_groups[0]?.face).toBe(' 90 ')
    expect(buildTransportDebugRunPreview('510056', groups)).toContain('"target_face": " 90 "')
    expect(buildTransportDebugRunPreview('510056', groups)).toContain('"rcs_template_id": "CTU03"')
  })

  it('rejects blank or duplicate faces, duplicate bins and more than four bins', () => {
    expect(validateTransportDebugRunConfig('510056', [{ face: ' ', bins: [bins[0]!] }])).toContain('面值')
    expect(validateTransportDebugRunConfig('510056', [
      { face: '90', bins: [bins[0]!] }, { face: '90', bins: [bins[1]!] }
    ])).toContain('重复')
    expect(validateTransportDebugRunConfig('510056', [
      { face: '90', bins: [bins[0]!] }, { face: '270', bins: [bins[0]!] }
    ])).toContain('料箱')
    expect(validateTransportDebugRunConfig('510056', [{ face: '90', bins: Array(5).fill(bins[0]) }])).toContain('1～4')
  })

  it('loads every mounted-bin page with the canonical query', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ items: bins, total: 3 })
      .mockResolvedValueOnce({ items: [{ ...bins[0], rack_code: 'OTHER', bin_code: 'B3' }], total: 3 })
    const result = await loadMountedBins({ query }, 2)
    expect(result).toHaveLength(3)
    expect(query).toHaveBeenNthCalledWith(1, expect.objectContaining({ offset: 0, limit: 2 }))
    expect(query).toHaveBeenNthCalledWith(2, expect.objectContaining({ offset: 2, limit: 2 }))
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      filters: { couple: 'and', conditions: [{ field: 'mount_status', op: 'eq', value: 'MOUNTED' }] },
      sort: [{ field: 'rack_code', order: 'asc' }, { field: 'rack_slot_code', order: 'asc' }]
    })
  })
})
