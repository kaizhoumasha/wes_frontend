import { describe, expect, it } from 'vitest'
import { createAuditLogPageConfig } from '@/views/logs/audit/config/pageConfig'
import { createAPIAccessLogPageConfig } from '@/views/logs/api-access/config/pageConfig'

describe('log page configs', () => {
  it('audit log page sorts by opera_time desc and exposes task-oriented toolbar actions', () => {
    const config = createAuditLogPageConfig()

    expect(config.resource.defaultSort).toEqual([{ field: 'opera_time', order: 'desc' }])
    expect(config.search.defaultFilterGroup).toBeUndefined()
    expect(config.extensions?.toolbarActions?.map(action => action.key)).toEqual([
      'audit-fail-only',
      'audit-clear-filters'
    ])
    expect(config.search.quickPresets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'recent-15-minutes',
        label: '最近 15 分钟',
        description: '按操作时间筛选最近 15 分钟日志',
        conditions: [
          {
            field: 'opera_time',
            operator: 'gte',
            value: expect.any(String),
            source: 'quick'
          }
        ]
      })
    ]))
    expect(config.search.quickPresets?.some(preset => preset.id === 'audit-fail-only')).toBe(true)
  })

  it('api access log page sorts by created_at desc and exposes troubleshooting toolbar actions', () => {
    const config = createAPIAccessLogPageConfig()

    expect(config.resource.defaultSort).toEqual([{ field: 'created_at', order: 'desc' }])
    expect(config.search.defaultFilterGroup).toBeUndefined()
    expect(config.extensions?.toolbarActions?.map(action => action.key)).toEqual([
      'api-5xx-only',
      'api-slow-1s',
      'api-clear-filters'
    ])
    expect(config.search.quickPresets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'recent-15-minutes',
        label: '最近 15 分钟',
        description: '按访问时间筛选最近 15 分钟日志',
        conditions: [
          {
            field: 'created_at',
            operator: 'gte',
            value: expect.any(String),
            source: 'quick'
          }
        ]
      })
    ]))
    expect(config.search.quickPresets?.some(preset => preset.id === 'api-5xx-only')).toBe(true)
  })
})
