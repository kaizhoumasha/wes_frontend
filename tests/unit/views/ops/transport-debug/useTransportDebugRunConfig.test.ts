import { describe, expect, it } from 'vitest'
import {
  buildTransportDebugRunInput,
  buildTransportDebugRunPreview,
  useTransportDebugRunConfig,
  validateTransportDebugRunConfig
} from '@/views/ops/transport-debug/useTransportDebugRunConfig'

const bins = [
  { bin_code: ' B1 ', slot_id: ' S1 ' },
  { bin_code: 'B2', slot_id: 'S2' }
]

describe('useTransportDebugRunConfig', () => {
  it('prefills the field rack and both faces with editable, isolated data', () => {
    const config = useTransportDebugRunConfig()
    expect(buildTransportDebugRunInput(config.rackId.value, config.groups.value, 'LINE-1')).toEqual(
      {
        workline_code: 'LINE-1',
        rack_id: '510056',
        face_groups: [
          {
            face: '90',
            bins: [
              { bin_code: 'A000001922', slot_id: '510056A3F2C101' },
              { bin_code: 'A000002653', slot_id: '510056A2F2C101' }
            ]
          },
          {
            face: '270',
            bins: [
              { bin_code: 'A000002704', slot_id: '510056B5F1C101' },
              { bin_code: 'A000000770', slot_id: '510056B4F1C101' },
              { bin_code: 'A000000940', slot_id: '510056B3F1C101' }
            ]
          }
        ]
      }
    )
    config.rackId.value = 'R2'
    config.groups.value[0]!.bins[0]!.slot_id = 'S2'
    expect(
      buildTransportDebugRunInput(config.rackId.value, config.groups.value, 'LINE-1').rack_id
    ).toBe('R2')
    expect(useTransportDebugRunConfig().groups.value[0]!.bins[0]!.slot_id).toBe('510056A3F2C101')
  })

  it('builds a run from direct operator input while preserving the opaque face', () => {
    const groups = [{ face: ' 90 ', bins: [bins[0]!] }]

    expect(validateTransportDebugRunConfig(' FIELD-RACK-07 ', groups)).toBeNull()
    expect(buildTransportDebugRunInput(' FIELD-RACK-07 ', groups, 'LINE-1')).toEqual({
      workline_code: 'LINE-1',
      rack_id: 'FIELD-RACK-07',
      face_groups: [
        {
          face: ' 90 ',
          bins: [{ bin_code: 'B1', slot_id: 'S1' }]
        }
      ]
    })
    expect(buildTransportDebugRunPreview(' FIELD-RACK-07 ', groups, 'LINE-1')).toContain(
      '"target_face": " 90 "'
    )
    expect(buildTransportDebugRunPreview(' FIELD-RACK-07 ', groups, 'LINE-1')).toContain(
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
        { face: '90', bins: [{ bin_code: ' ', slot_id: 'S1' }] }
      ])
    ).toContain('料箱编码')
    expect(
      validateTransportDebugRunConfig('R1', [
        { face: '90', bins: [{ bin_code: 'B1', slot_id: ' ' }] }
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
        { face: '270', bins: [{ bin_code: 'B1', slot_id: 'S3' }] }
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
    expect(() => buildTransportDebugRunInput('R1', [], 'LINE-1')).toThrow('至少配置一个货架面')
    expect(buildTransportDebugRunPreview('R1', [], 'LINE-1')).toBe('')
  })

  it('previews outbound slots and delegates all return target allocation to WMS', () => {
    const steps = JSON.parse(
      buildTransportDebugRunPreview(
        'R1',
        [
          { face: '90', bins: [{ bin_code: 'B1', slot_id: 'S1' }] },
          { face: '270', bins: [{ bin_code: 'B2', slot_id: 'S2' }] }
        ],
        'LINE-1'
      )
    )
    expect(
      steps.map((step: { kind?: string; operation?: string }) => step.kind || step.operation)
    ).toEqual([
      'RACK_MOVE',
      'BIN_MOVE',
      'SCAN12',
      'outbound.bin.return_batch@v1',
      'RACK_ROTATE',
      'BIN_MOVE',
      'SCAN12',
      'outbound.bin.return_batch@v1',
      'RACK_MOVE'
    ])
    expect(steps[1].moves[0].source).toEqual({
      kind: 'RACK_BIN_SLOT',
      rack_id: 'R1',
      rack_face: '90',
      slot_id: 'S1'
    })
    expect(steps[3]).toMatchObject({
      workline_code: 'LINE-1',
      rack_id: 'R1',
      rack_face: '90',
      return_candidates: [
        {
          sequence_no: 1,
          bin_code: 'B1',
          source: { type: 'HANDOFF_POSITION', location_code: 'CNV0302' }
        }
      ]
    })
    expect(steps[7]).toMatchObject({ rack_face: '270', return_candidates: [{ bin_code: 'B2' }] })
    expect(steps[3].moves).toBeUndefined()
    expect(steps[8]).toMatchObject({
      rcs_template_id: 'CTU03',
      target: { kind: 'ZONE', location_code: 'WH01' }
    })
  })

  it('supplies the fixed WMS identity without operator input', () => {
    const config = useTransportDebugRunConfig()
    expect(config.validationError.value).toBeNull()
    expect(
      buildTransportDebugRunInput(
        config.rackId.value,
        config.groups.value,
        config.worklineCode.value
      ).workline_code
    ).toBe('KT16')
    expect(() => buildTransportDebugRunInput(config.rackId.value, config.groups.value, '')).toThrow(
      '工作线'
    )
    config.worklineCode.value = 'LINE-1'
    expect(config.validationError.value).toBeNull()
  })

  it('creates editable face and bin rows without loading resource master data', () => {
    const config = useTransportDebugRunConfig()

    config.groups.value = []
    config.addGroup()

    expect(config.groups.value).toEqual([{ face: '', bins: [{ bin_code: '', slot_id: '' }] }])
  })

  it('enforces one-to-four bin mutation boundaries and removes face groups explicitly', () => {
    const config = useTransportDebugRunConfig()
    config.groups.value = []
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
