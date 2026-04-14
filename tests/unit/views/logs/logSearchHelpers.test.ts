import { describe, expect, it } from 'vitest'
import type { SearchCondition } from '@/types/search'
import { mergeQuickFilterConditions } from '@/components/common/crud-page/searchContext'
import {
  buildRecentHoursFilterGroup,
  createRecentHoursQuickPreset,
  createEqualsQuickPreset,
  createThresholdQuickPreset
} from '@/views/logs/shared/search'

describe('mergeQuickFilterConditions', () => {
  it('appends quick filter when field does not exist yet', () => {
    const existing: SearchCondition[] = [
      {
        id: 'cond-1',
        field: 'method',
        operator: 'equals',
        value: 'GET',
        label: '请求方法等于 GET'
      }
    ]

    const result = mergeQuickFilterConditions(existing, {
      field: 'username',
      operator: 'equals',
      value: 'alice'
    })

    expect(result).toEqual([
      {
        field: 'method',
        operator: 'equals',
        value: 'GET'
      },
      {
        field: 'username',
        operator: 'equals',
        value: 'alice'
      }
    ])
  })

  it('replaces existing quick filter for the same field', () => {
    const existing: SearchCondition[] = [
      {
        id: 'cond-1',
        field: 'username',
        operator: 'equals',
        value: 'alice',
        label: '用户名等于 alice'
      },
      {
        id: 'cond-2',
        field: 'method',
        operator: 'equals',
        value: 'POST',
        label: '请求方法等于 POST'
      },
      {
        id: 'cond-3',
        field: 'username',
        operator: 'contains',
        value: 'ali',
        label: '用户名包含 ali'
      }
    ]

    const result = mergeQuickFilterConditions(existing, {
      field: 'username',
      operator: 'equals',
      value: 'bob'
    })

    expect(result).toEqual([
      {
        field: 'method',
        operator: 'equals',
        value: 'POST'
      },
      {
        field: 'username',
        operator: 'equals',
        value: 'bob'
      }
    ])
  })
})

describe('buildRecentHoursFilterGroup', () => {
  it('builds a gte filter using the given field and timestamp', () => {
    const now = new Date('2026-04-13T12:00:00.000Z')

    expect(buildRecentHoursFilterGroup('opera_time', 24, now)).toEqual({
      couple: 'and',
      conditions: [
        {
          field: 'opera_time',
          op: 'ge',
          value: '2026-04-12T12:00:00.000Z'
        }
      ]
    })
  })
})

describe('log quick presets', () => {
  it('builds a recent-hours preset with minute label and dynamic resolver', () => {
    const preset = createRecentHoursQuickPreset(
      'created_at',
      '访问时间',
      0.25,
      new Date('2026-04-13T12:00:00.000Z')
    )

    expect(preset.id).toBe('recent-15-minutes')
    expect(preset.label).toBe('最近 15 分钟')
    expect(preset.description).toBe('按访问时间筛选最近 15 分钟日志')
    expect(preset.conditions).toEqual([
      {
        field: 'created_at',
        operator: 'gte',
        value: '2026-04-13T11:45:00.000Z',
        source: 'quick'
      }
    ])
    expect(preset.resolveConditions?.(new Date('2026-04-13T15:00:00.000Z'))).toEqual([
      {
        field: 'created_at',
        operator: 'gte',
        value: '2026-04-13T14:45:00.000Z',
        source: 'quick'
      }
    ])
  })

  it('builds an equals preset', () => {
    expect(createEqualsQuickPreset('audit-fail-only', 'status', '仅失败操作', 'FAIL')).toEqual({
      id: 'audit-fail-only',
      label: '仅失败操作',
      description: undefined,
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'FAIL',
          source: 'quick'
        }
      ]
    })
  })

  it('builds a threshold preset', () => {
    expect(createThresholdQuickPreset('api-slow-1s', 'response_time_ms', '慢请求 >= 1 s', 'gte', 1000)).toEqual({
      id: 'api-slow-1s',
      label: '慢请求 >= 1 s',
      description: undefined,
      conditions: [
        {
          field: 'response_time_ms',
          operator: 'gte',
          value: 1000,
          source: 'quick'
        }
      ]
    })
  })
})
