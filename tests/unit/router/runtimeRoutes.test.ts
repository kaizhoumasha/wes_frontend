import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { runtimeRoutes } from '@/router/routes/runtime'

interface RedirectInput {
  params: Record<string, string>
  query: Record<string, string>
  hash: string
}

type RedirectFunction = (to: RedirectInput) => unknown

function findRuntimeChild(name: string): RouteRecordRaw {
  const route = runtimeRoutes.children?.find(child => child.name === name)
  expect(route).toBeDefined()
  return route as RouteRecordRaw
}

function executeRedirect(route: RouteRecordRaw, input: RedirectInput): unknown {
  expect(typeof route.redirect).toBe('function')
  return (route.redirect as RedirectFunction)(input)
}

describe('runtime routes', () => {
  it('keeps runtime status canonical while preserving legacy dashboard query state', () => {
    const statusRoute = findRuntimeChild('RuntimeStatus')
    const dashboardRoute = findRuntimeChild('RuntimeDashboard')

    expect(statusRoute.path).toBe('status')
    expect(typeof statusRoute.component).toBe('function')
    expect(executeRedirect(dashboardRoute, {
      params: {},
      query: { worklineId: '101', deviceId: '201' },
      hash: '#weak-signals'
    })).toEqual({
      name: 'RuntimeStatus',
      query: { worklineId: '101', deviceId: '201' },
      hash: '#weak-signals'
    })
  })

  it('keeps runtime exceptions canonical while preserving legacy hold links', () => {
    const exceptionRoute = findRuntimeChild('RuntimeExceptionDetail')
    const legacyHoldRoute = findRuntimeChild('RuntimeHoldDetail')

    expect(exceptionRoute.path).toBe('exceptions/:holdId')
    expect(typeof exceptionRoute.component).toBe('function')
    expect(executeRedirect(legacyHoldRoute, {
      params: { holdId: '42' },
      query: { tab: 'evidence' },
      hash: '#audit'
    })).toEqual({
      name: 'RuntimeExceptionDetail',
      params: { holdId: '42' },
      query: { tab: 'evidence' },
      hash: '#audit'
    })
  })
})
