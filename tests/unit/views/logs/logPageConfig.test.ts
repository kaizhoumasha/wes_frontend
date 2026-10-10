import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CrudDetailField from '@/components/common/crud-page/detail/CrudDetailField.vue'
import type { APIAccessLogViewItem } from '@/views/logs/shared/types'
import { logRoutes } from '@/router/routes/logs'
import { apiAccessLogsApiMethods } from '@/api/modules/apiAccessLogs'
import CrudQuickFilterLink from '@/components/common/crud-page/CrudQuickFilterLink.vue'
import { useTimezoneStore } from '@/stores/timezone'
import { createAuditLogPageConfig } from '@/views/logs/audit/config/pageConfig'
import { createAPIAccessLogPageConfig } from '@/views/logs/api-access/config/pageConfig'

describe('log page configs', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  it('audit log page sorts by opera_time desc and exposes task-oriented toolbar actions', () => {
    const config = createAuditLogPageConfig()

    expect(config.resource.defaultSort).toEqual([{ field: 'opera_time', order: 'desc' }])
    expect(config.search.defaultFilterGroup).toBeUndefined()
    expect(config.extensions?.toolbarActions?.map(action => action.key)).toEqual([
      'audit-fail-only',
      'audit-clear-filters'
    ])
    expect(config.search.quickPresets).toEqual(
      expect.arrayContaining([
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
      ])
    )
    expect(config.search.quickPresets?.some(preset => preset.id === 'audit-fail-only')).toBe(true)
  })

  it('api access log page sorts by created_at desc and exposes troubleshooting toolbar actions', () => {
    const config = createAPIAccessLogPageConfig()

    expect(config.resource.defaultSort).toEqual([
      { field: 'created_at', order: 'desc' },
      { field: 'id', order: 'desc' }
    ])
    expect(config.search.defaultFilterGroup).toBeUndefined()
    expect(config.extensions?.toolbarActions?.map(action => action.key)).toEqual([
      'api-5xx-only',
      'api-slow-1s',
      'api-clear-filters'
    ])
    expect(config.search.quickPresets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'recent-15-minutes',
          label: '最近 15 分钟',
          description: '按记录时间筛选最近 15 分钟日志',
          conditions: [
            {
              field: 'created_at',
              operator: 'gte',
              value: expect.any(String),
              source: 'quick'
            }
          ]
        })
      ])
    )
    expect(config.search.quickPresets?.some(preset => preset.id === 'api-5xx-only')).toBe(true)
    expect(config.search.quickPresets?.find(preset => preset.id === 'api-failed-only')).toEqual(
      expect.objectContaining({
        label: 'HTTP 4xx/5xx',
        conditions: [{ field: 'status_code', operator: 'gte', value: 400, source: 'quick' }]
      })
    )
    expect(config.search.fields.find(field => field.key === 'created_at')?.label).toBe('记录时间')
  })

  it('keeps the navigation and uses the sys readonly resource with a factual empty state', () => {
    const config = createAPIAccessLogPageConfig()
    expect(config.resource.title?.subtitle).toBe('WMS、ECS 等外部系统交互')
    expect(config.resource.permissions).toEqual({
      create: 'sys:apiaccesslog:list',
      update: 'sys:apiaccesslog:detail',
      delete: 'sys:apiaccesslog:detail'
    })
    expect(logRoutes.children?.find(route => route.path === 'api-access')?.meta?.permission).toBe(
      'sys:apiaccesslog:list'
    )
    expect(config.table.emptyText).toBe(
      '当前查询范围内暂无外部交互记录。可调整筛选或刷新；日志可能延迟或漏记，无记录不代表请求未到达。'
    )
    expect(apiAccessLogsApiMethods.getById({ id: 101 }).url).toBe('/api/v1/sys/api-access-logs/101')
  })

  it('keeps seven desktop and five mobile default columns with hidden candidates selectable', () => {
    const config = createAPIAccessLogPageConfig()
    expect(typeof config.table.columns).toBe('object')
    if (typeof config.table.columns !== 'object') throw new Error('Expected column manager config')
    const columns = config.table.columns
    const manager = columns.createManager()
    expect(manager.buildTableColumns('desktop').map(column => column.field)).toEqual([
      'created_at',
      'system_id',
      'direction',
      'status_code',
      'response_time_ms',
      'path'
    ])
    expect(manager.buildTableColumns('mobile').map(column => column.field)).toEqual([
      'created_at',
      'system_id',
      'direction',
      'status_code'
    ])
    expect(config.table.actionsColumn?.hideable).toBe(false)
    for (const key of [
      'peer_address',
      'delivery_state',
      'error_code',
      'request_id',
      'trace_id',
      'event_id',
      'causation_id',
      'method',
      'id'
    ]) {
      expect(columns.defaultColumns.find(column => column.key === key)).toEqual(
        expect.objectContaining({ visibleFrom: null, hideable: true })
      )
    }
    const selected = manager.columnConfig.value.map(column => ({
      ...column,
      visibleFrom: column.key === 'peer_address' ? ('mobile' as const) : column.visibleFrom
    }))
    manager.updateConfig(selected)
    expect(manager.buildTableColumns('mobile').map(column => column.field)).toContain(
      'peer_address'
    )
    manager.updateConfig(columns.defaultColumns)
    expect(manager.buildTableColumns('desktop').map(column => column.field)).toHaveLength(6)
  })

  it('renders three detail groups and null explanations through the shared field renderer', () => {
    useTimezoneStore().setUserTimezone('America/New_York')
    const config = createAPIAccessLogPageConfig()
    expect(config.detail?.mode).toBe('drawer')
    expect(config.detail?.size).toBe('lg')
    expect(config.detail?.sections?.map(section => section.title)).toEqual([
      '交互摘要',
      '追踪与地址',
      '已保存快照'
    ])
    const item = {
      id: 101,
      system_id: 'ecs',
      direction: 'OUTBOUND',
      method: 'POST',
      path: '/command',
      peer_address: null,
      request_id: null,
      trace_id: null,
      event_id: null,
      causation_id: null,
      status_code: null,
      response_time_ms: 0,
      delivery_state: 'DELIVERY_UNKNOWN',
      error_code: 'READ_TIMEOUT',
      created_at: '2026-10-08T12:00:00Z',
      details: null
    } as unknown as APIAccessLogViewItem
    const fields = config.detail!.sections!.flatMap(section => section.fields ?? [])
    const render = (record: APIAccessLogViewItem) =>
      fields
        .map(field => {
          const wrapper = mount(CrudDetailField, {
            props: { field, item: record },
            global: { stubs: { ElTag: false } }
          })
          const text = wrapper.text()
          wrapper.unmount()
          return text
        })
        .join(' ')
    const empty = render(item)
    expect(empty).toContain('2026-10-08 08:00:00')
    if (typeof config.table.columns !== 'object') throw new Error('Expected column manager config')
    const timeColumn = config.table.columns
      .createManager()
      .buildTableColumns('desktop')
      .find(column => column.field === 'created_at')!
    expect(timeColumn.formatter!(item.created_at, item, {})).toBe('2026-10-08 08:00:00')
    expect(empty).toContain('无 HTTP 响应')
    expect(empty).toContain('送达未知')
    expect(empty).toContain('0 ms')
    expect(empty).toContain('此记录未保存详情快照。')
    expect(empty).toContain('本次出站日志仅保存交互元数据。')
    const inbound = render({ ...item, direction: 'INBOUND' } as APIAccessLogViewItem)
    expect(inbound).toContain('此记录未保存详情快照。')
    expect(inbound).not.toContain('本次出站日志仅保存交互元数据。')
    const saved = render({
      ...item,
      status_code: 422,
      details: { raw_payload: null, truncated: true }
    } as APIAccessLogViewItem)
    expect(saved).toContain('422')
    expect(saved).toContain('raw_payload: null')
    expect(saved).toContain('truncated: true')
    expect(saved).not.toContain('未保存详情快照')
    expect(saved).not.toContain('无 HTTP 响应')
  })

  it('shows method with path while keeping the quick filter bound to the original path', () => {
    const config = createAPIAccessLogPageConfig()
    if (typeof config.table.columns !== 'object') throw new Error('Expected column manager config')
    const columns = config.table.columns.createManager().buildTableColumns('desktop')
    const path = columns.find(column => column.field === 'path')!
    const node = path.formatter!('/command', { method: 'POST' }, {})
    expect(typeof node).toBe('object')
    if (typeof node !== 'object') throw new Error('Expected quick filter node')
    const wrapper = mount(CrudQuickFilterLink, {
      props: node.props as { field: string; value: unknown; text: string }
    })
    expect(wrapper.text()).toBe('POST /command')
    expect(wrapper.props('value')).toBe('/command')
    wrapper.unmount()
    expect(columns.find(column => column.field === 'status_code')!.formatter!(null, {}, {})).toBe(
      '无 HTTP 响应'
    )
  })
})
