import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import TransportTaskTable from '@/views/ops/transport-diagnostics/TransportTaskTable.vue'
import { useTimezoneStore } from '@/stores/timezone'
import type { TasksResult } from '@/api/modules/transport'

const task: TasksResult['items'][number] = {
  transport_task_id: 'transport-1',
  client_request_id: 'client-1',
  kind: 'RACK_MOVE',
  status: 'PENDING',
  reason_code: null,
  created_at: '2026-09-22T04:10:00Z',
  updated_at: '2026-09-22T04:11:01.270601Z',
  latest_evidence: null
}

describe('TransportTaskTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('formats the updated time with the configured display timezone', () => {
    useTimezoneStore().setUserTimezone('America/Chicago')
    const wrapper = mount(TransportTaskTable, {
      props: {
        tasks: [task],
        selectedTaskId: null,
        loading: false,
        hasMore: false
      },
      global: {
        directives: { loading: () => undefined },
        stubs: {
          ElTable: {
            props: ['data'],
            template: '<div><slot /></div>'
          },
          ElTableColumn: {
            name: 'ElTableColumn',
            props: ['label', 'formatter'],
            template: '<div />'
          }
        }
      }
    })

    const updatedAtColumn = wrapper
      .findAllComponents({ name: 'ElTableColumn' })
      .find(column => column.props('label') === '更新时间')

    expect(updatedAtColumn).toBeDefined()
    expect(updatedAtColumn?.props('formatter')({}, {}, task.updated_at, 0)).toBe(
      '2026-09-21 23:11:01'
    )
  })
})
