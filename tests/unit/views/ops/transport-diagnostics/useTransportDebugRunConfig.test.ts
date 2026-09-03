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

  it('creates editable face and bin rows without loading resource master data', () => {
    const config = useTransportDebugRunConfig()

    config.addGroup()

    expect(config.groups.value).toEqual([{ face: '', bins: [{ bin_id: '', slot_id: '' }] }])
  })
})
