import { describe, expect, it } from 'vitest'
import { buildTransportDebugTask } from '@/views/ops/transport-diagnostics/useTransportDebugTask'

const CLIENT_REQUEST_ID = '019f12d0-58d7-7000-8000-000000000001'

describe('buildTransportDebugTask', () => {
  it.each([
    [
      'RACK_MOVE',
      {
        rack_id: 'RACK-01',
        source: { kind: 'RACK_POSITION', location_code: 'SRC-01' },
        target: { kind: 'RACK_POSITION', location_code: 'DST-01' },
        target_face: 'A'
      }
    ],
    [
      'RACK_ROTATE',
      {
        rack_id: 'RACK-01',
        position: { kind: 'RACK_POSITION', location_code: 'POS-01' },
        target_face: 'B'
      }
    ],
    [
      'BIN_MOVE',
      {
        moves: [
          {
            bin_id: 'BIN-01',
            source: { kind: 'HANDOFF_POSITION', location_code: 'SRC-01' },
            target: {
              kind: 'RACK_BIN_SLOT',
              rack_id: 'RACK-01',
              rack_face: 'A',
              slot_id: 'SLOT-01'
            }
          }
        ]
      }
    ],
    [
      'BIN_EXCHANGE',
      {
        exchange_pairs: [
          {
            left_bin_id: 'BIN-01',
            left_location: {
              kind: 'RACK_BIN_SLOT',
              rack_id: 'RACK-01',
              rack_face: 'A',
              slot_id: 'SLOT-01'
            },
            right_bin_id: 'BIN-02',
            right_location: {
              kind: 'RACK_BIN_SLOT',
              rack_id: 'RACK-02',
              rack_face: 'B',
              slot_id: 'SLOT-02'
            }
          }
        ]
      }
    ]
  ] as const)('builds a generated-contract-valid %s payload', (kind, data) => {
    expect(buildTransportDebugTask(kind, JSON.stringify(data), CLIENT_REQUEST_ID, 'STATION-DEBUG')).toEqual({
      kind,
      client_request_id: CLIENT_REQUEST_ID,
      station_id: 'STATION-DEBUG',
      data
    })
  })

  it('rejects malformed JSON and data that does not satisfy the selected kind', () => {
    expect(() => buildTransportDebugTask('RACK_MOVE', '{', CLIENT_REQUEST_ID)).toThrow(
      'data 必须是 JSON object'
    )
    expect(() =>
      buildTransportDebugTask('RACK_MOVE', JSON.stringify({ rack_id: 'RACK-01' }), CLIENT_REQUEST_ID)
    ).toThrow('Transport 参数不符合合同')
  })
})
