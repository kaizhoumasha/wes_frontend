import { describe, expect, it } from 'vitest'
import {
  buildTransportDebugRunInput,
  buildTransportDebugRunPreview,
  useTransportDebugRunConfig,
  validateTransportDebugRunConfig
} from '@/views/ops/transport-diagnostics/useTransportDebugRunConfig'

const bins = [
  { bin_id: ' B1 ', slot_id: ' S1 ' },
  { bin_id: 'B2', slot_id: 'S2' }
]

describe('useTransportDebugRunConfig', () => {
  it('builds a run from direct operator input while preserving the opaque face', () => {
    const groups = [{ face: ' 90 ', bins: [bins[0]!] }]

    expect(validateTransportDebugRunConfig(' FIELD-RACK-07 ', groups)).toBeNull()
    expect(buildTransportDebugRunInput(' FIELD-RACK-07 ', groups)).toEqual({
      rack_id: 'FIELD-RACK-07',
      face_groups: [
        {
          face: ' 90 ',
          bins: [{ bin_id: 'B1', slot_id: 'S1' }]
        }
      ]
    })
    expect(buildTransportDebugRunPreview(' FIELD-RACK-07 ', groups)).toContain(
      '"target_face": " 90 "'
    )
    expect(buildTransportDebugRunPreview(' FIELD-RACK-07 ', groups)).toContain(
      '"rcs_template_id": "CTU03"'
    )
  })

  it('rejects incomplete operator input, duplicate faces and duplicate bin codes', () => {
    expect(validateTransportDebugRunConfig(' ', [{ face: '90', bins: [bins[0]!] }])).toContain(
      '货架编码'
    )
    expect(validateTransportDebugRunConfig('R1', [{ face: ' ', bins: [bins[0]!] }])).toContain(
      '面值'
    )
    expect(
      validateTransportDebugRunConfig('R1', [
        { face: '90', bins: [{ bin_id: ' ', slot_id: 'S1' }] }
      ])
    ).toContain('料箱编码')
    expect(
      validateTransportDebugRunConfig('R1', [
        { face: '90', bins: [{ bin_id: 'B1', slot_id: ' ' }] }
      ])
    ).toContain('原货架槽位')
    expect(
      validateTransportDebugRunConfig('R1', [
        { face: '90', bins: [bins[0]!] },
        { face: '90', bins: [bins[1]!] }
      ])
    ).toContain('重复')
    expect(
      validateTransportDebugRunConfig('R1', [
        { face: '90', bins: [bins[0]!] },
        { face: '270', bins: [{ bin_id: 'B1', slot_id: 'S3' }] }
      ])
    ).toContain('料箱')
    expect(
      validateTransportDebugRunConfig('R1', [{ face: '90', bins: Array(5).fill(bins[0]) }])
    ).toContain('1～4')
  })

  it('rejects empty groups, empty bin groups and NUL faces before building or previewing', () => {
    expect(validateTransportDebugRunConfig('R1', [])).toContain('至少配置一个货架面')
    expect(validateTransportDebugRunConfig('R1', [{ face: '90', bins: [] }])).toContain('1～4')
    expect(validateTransportDebugRunConfig('R1', [{ face: '90\0', bins: [bins[0]!] }])).toContain(
      '面值'
    )
    expect(() => buildTransportDebugRunInput('R1', [])).toThrow('至少配置一个货架面')
    expect(buildTransportDebugRunPreview('R1', [])).toBe('')
  })

  it('previews the exact multi-face sequence and returns every bin to its original slot', () => {
    const preview = buildTransportDebugRunPreview(' R1 ', [
      {
        face: ' 90 ',
        bins: [
          { bin_id: ' B1 ', slot_id: ' S1 ' },
          { bin_id: 'B2', slot_id: 'S2' }
        ]
      },
      { face: '270', bins: [{ bin_id: 'B3', slot_id: 'S3' }] }
    ])

    expect(JSON.parse(preview)).toEqual([
      {
        kind: 'RACK_MOVE',
        rack_id: 'R1',
        source: { kind: 'RACK', location_code: 'R1' },
        target: { kind: 'RACK_POSITION', location_code: 'KT16' },
        target_face: ' 90 ',
        rcs_template_id: 'CTU01'
      },
      {
        kind: 'BIN_MOVE',
        moves: [
          {
            bin_id: 'B1',
            source: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: ' 90 ', slot_id: 'S1' },
            target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
          },
          {
            bin_id: 'B2',
            source: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: ' 90 ', slot_id: 'S2' },
            target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
          }
        ]
      },
      { kind: 'SCAN12', bin_ids: ['B1', 'B2'] },
      {
        kind: 'BIN_MOVE',
        moves: [
          {
            bin_id: 'B1',
            source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
            target: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: ' 90 ', slot_id: 'S1' }
          },
          {
            bin_id: 'B2',
            source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
            target: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: ' 90 ', slot_id: 'S2' }
          }
        ]
      },
      {
        kind: 'RACK_ROTATE',
        rack_id: 'R1',
        position: { kind: 'RACK', location_code: 'R1' },
        target_face: '270',
        rcs_template_id: 'CTU02'
      },
      {
        kind: 'BIN_MOVE',
        moves: [
          {
            bin_id: 'B3',
            source: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: '270', slot_id: 'S3' },
            target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
          }
        ]
      },
      { kind: 'SCAN12', bin_ids: ['B3'] },
      {
        kind: 'BIN_MOVE',
        moves: [
          {
            bin_id: 'B3',
            source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
            target: { kind: 'RACK_BIN_SLOT', rack_id: 'R1', rack_face: '270', slot_id: 'S3' }
          }
        ]
      },
      {
        kind: 'RACK_MOVE',
        rack_id: 'R1',
        source: { kind: 'RACK', location_code: 'R1' },
        target: { kind: 'ZONE', location_code: 'WH01' },
        target_face: '90',
        rcs_template_id: 'CTU03'
      }
    ])
  })

  it('creates editable face and bin rows without loading resource master data', () => {
    const config = useTransportDebugRunConfig()

    config.addGroup()

    expect(config.groups.value).toEqual([{ face: '', bins: [{ bin_id: '', slot_id: '' }] }])
  })

  it('enforces one-to-four bin mutation boundaries and removes face groups explicitly', () => {
    const config = useTransportDebugRunConfig()
    config.addGroup()

    config.removeBin(0, 0)
    expect(config.groups.value[0]?.bins).toHaveLength(1)

    config.addBin(0)
    config.addBin(0)
    config.addBin(0)
    config.addBin(0)
    config.addBin(99)
    expect(config.groups.value[0]?.bins).toHaveLength(4)

    config.removeBin(0, 1)
    config.removeBin(99, 0)
    expect(config.groups.value[0]?.bins).toHaveLength(3)

    config.removeGroup(0)
    expect(config.groups.value).toEqual([])
  })
})
