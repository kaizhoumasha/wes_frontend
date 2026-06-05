import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  route: {
    query: {} as Record<string, unknown>
  },
  router: {
    push: vi.fn(),
    replace: vi.fn()
  },
  latestSend: vi.fn(),
  lookupSend: vi.fn(),
  sseStore: {
    live: true,
    state: 'connected',
    connectionLabel: 'SSE Connected',
    connectionTone: 'success',
    lastEvent: null,
    lastRefreshedAt: null,
    markRefreshedAt: vi.fn()
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => mocks.sseStore
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    integrationDebugLatest: () => ({ send: mocks.latestSend }),
    integrationDebugLookup: () => ({ send: mocks.lookupSend })
  }
}))

async function mountPage() {
  const { default: IntegrationDebugPage } = await import(
    '@/views/runtime/integration-debug/IntegrationDebugPage.vue'
  )

  const wrapper = shallowMount(IntegrationDebugPage, {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        RuntimeEmptyState: true,
        RuntimeFrozenNotice: true,
        RuntimeLastUpdated: true,
        RuntimeStatusBadge: true,
        'el-button': true,
        'el-card': { template: '<section><slot /></section>' },
        'el-input': true,
        'el-option': {
          props: ['label', 'value'],
          template: '<option :value="value">{{ label }}</option>'
        },
        'el-select': {
          template: '<select><slot /></select>'
        },
        'el-table': true,
        'el-table-column': true
      }
    }
  })

  await flushPromises()
  await Promise.resolve()
  return wrapper
}

describe('IntegrationDebugPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = {}
    mocks.latestSend.mockResolvedValue({ items: [], total: 0 })
    mocks.lookupSend.mockResolvedValue(null)
  })

  it('keeps RETRY available in the latest-case status filter', async () => {
    const wrapper = await mountPage()

    const optionValues = wrapper.findAll('option').map(option => option.attributes('value'))

    expect(optionValues).toContain('RETRY')
  })
})
