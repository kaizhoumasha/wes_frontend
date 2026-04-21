import type { RouteRecordRaw } from 'vue-router'
import { adminRoutes } from './admin'
import { apiAuthRoutes } from './api-auth'
import { publicRoutes, shellBaseChildren, shellRoute, fallbackRoute } from './base'
import { bizRoutes } from './biz'
import { createDebugRoutes } from './debug'
import { logRoutes } from './logs'
import { runtimeRoutes } from './runtime'

export function createRoutes(): RouteRecordRaw[] {
  return [
    ...publicRoutes,
    {
      ...shellRoute,
      children: [
        ...shellBaseChildren,
        adminRoutes,
        bizRoutes,
        apiAuthRoutes,
        runtimeRoutes,
        logRoutes,
        ...createDebugRoutes()
      ]
    },
    fallbackRoute
  ]
}
