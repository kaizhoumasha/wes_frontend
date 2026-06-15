import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { runtimeRoutes } from '@/router/routes/runtime'

function findRuntimeChild(name: string): RouteRecordRaw {
  const route = runtimeRoutes.children?.find(child => child.name === name)
  expect(route).toBeDefined()
  return route as RouteRecordRaw
}

describe('runtime routes', () => {
  it('defines the canonical runtime pages and sandbox workbench deep link', () => {
    expect(findRuntimeChild('RuntimeOverview').path).toBe('overview')
    expect(findRuntimeChild('RuntimeMonitor').path).toBe('monitor')
    expect(findRuntimeChild('RuntimeHolds').path).toBe('holds')
    expect(findRuntimeChild('RuntimeHoldDetail').path).toBe('holds/:holdId')
    expect(findRuntimeChild('RuntimeSandbox').path).toBe('sandbox')
    expect(findRuntimeChild('RuntimeSandboxWorkbench').path).toBe('sandbox/:worklineId')
  })

  it('does not keep legacy runtime redirect routes after cleanup', () => {
    const children = runtimeRoutes.children ?? []
    const routeNames = new Set(children.map(route => route.name))
    const routePaths = new Set(children.map(route => route.path))

    expect(routeNames.has('RuntimeWorklines')).toBe(false)
    expect(routeNames.has('RuntimeStatus')).toBe(false)
    expect(routeNames.has('RuntimeDashboard')).toBe(false)
    expect(routeNames.has('RuntimeExceptionDetail')).toBe(false)
    expect(routePaths.has('worklines')).toBe(false)
    expect(routePaths.has('status')).toBe(false)
    expect(routePaths.has('dashboard')).toBe(false)
    expect(routePaths.has('exceptions/:holdId')).toBe(false)
  })

  it('marks the workline monitor as an immersive runtime console', () => {
    expect(findRuntimeChild('RuntimeMonitor').meta?.runtimeImmersive).toBe(true)
    expect(findRuntimeChild('RuntimeOverview').meta?.runtimeImmersive).toBeUndefined()
    expect(findRuntimeChild('RuntimeCases').meta?.runtimeImmersive).toBeUndefined()
  })
})
