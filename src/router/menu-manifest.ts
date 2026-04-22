import type { RouteRecordRaw } from 'vue-router'
import { adminRoutes } from './routes/admin'
import { apiAuthRoutes } from './routes/api-auth'
import { shellBaseChildren } from './routes/base'
import { bizRoutes } from './routes/biz'
import { logRoutes } from './routes/logs'
import { runtimeRoutes } from './routes/runtime'

export interface MenuManifestEntry {
  name: string
  title: string
  path: string
  component: string | null
  sortOrder: number
  parentName: string | null
  icon: string | null
  isHidden: boolean
  permission: string | null
}

interface MenuMetaConfig {
  name?: string
  title?: string
  parentName?: string
  icon?: string
  sortOrder?: number
  hidden?: boolean
}

interface MenuRouteMeta {
  requiresAuth?: boolean
  title?: string
  permission?: string
  permissions?: string[]
  hidden?: boolean
  menu?: MenuMetaConfig
}

interface ManifestRoute extends Omit<RouteRecordRaw, 'children' | 'meta' | 'component'> {
  children?: ManifestRoute[]
  meta?: MenuRouteMeta
  component?: unknown
}

const MENU_NAME_SUFFIXES = new Set(['list', 'page', 'view', 'detail', 'form', 'screen', 'route', 'index'])

export function createMenuSourceRoutes(): ManifestRoute[] {
  return [
    ...shellBaseChildren,
    adminRoutes,
    bizRoutes,
    apiAuthRoutes,
    runtimeRoutes,
    logRoutes,
  ] as ManifestRoute[]
}

export function buildCurrentMenuManifest(): MenuManifestEntry[] {
  return buildMenuManifestEntries(createMenuSourceRoutes())
}

export function buildMenuManifestEntries(routes: readonly ManifestRoute[]): MenuManifestEntry[] {
  const entries: MenuManifestEntry[] = []
  let sortCounter = 0

  function walk(
    routeNodes: readonly ManifestRoute[],
    parentPath: string,
    inheritedAuth: boolean,
    parentMenuName: string | null,
  ): void {
    for (const route of routeNodes) {
      const meta = route.meta
      const fullPath = joinPaths(parentPath, route.path)
      const effectiveAuth = meta?.requiresAuth ?? inheritedAuth
      const title = meta?.menu?.title ?? meta?.title
      const includeAsMenu = effectiveAuth && Boolean(title)

      let currentMenuName = parentMenuName

      if (includeAsMenu && title) {
        sortCounter += 1

        const permission = resolvePermission(meta)
        const menuName = meta?.menu?.name ?? deriveMenuName(route.name, fullPath, permission)
        const entry: MenuManifestEntry = {
          name: menuName,
          title,
          path: fullPath,
          component: parseComponentPath(route.component),
          sortOrder: meta?.menu?.sortOrder ?? sortCounter,
          parentName: meta?.menu?.parentName ?? parentMenuName,
          icon: meta?.menu?.icon ?? null,
          isHidden: meta?.menu?.hidden ?? meta?.hidden ?? false,
          permission,
        }

        entries.push(entry)
        currentMenuName = entry.name
      }

      if (route.children?.length) {
        walk(route.children, fullPath, effectiveAuth, currentMenuName)
      }
    }
  }

  walk(routes, '', false, null)
  return entries
}

function resolvePermission(meta?: MenuRouteMeta): string | null {
  if (meta?.permission) {
    return meta.permission
  }

  return meta?.permissions?.find(permission => Boolean(permission)) ?? null
}

function parseComponentPath(component: ManifestRoute['component']): string | null {
  if (typeof component === 'string') {
    return component.startsWith('@/') ? component.slice(2) : component
  }

  if (typeof component !== 'function') {
    return null
  }

  const match = component.toString().match(/import\((['"])(.+?)\1\)/)
  if (!match) {
    return null
  }

  const [, , rawPath] = match
  return rawPath.startsWith('@/') ? rawPath.slice(2) : rawPath
}

function deriveMenuName(routeName: ManifestRoute['name'], routePath: string, permission: string | null): string {
  if (permission) {
    const parts = permission.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:menu`
    }
  }

  const pathSegments = routePath.split('/').filter(Boolean)
  const category = pathSegments.length >= 2 ? normalizeCategory(pathSegments[0] || 'system') : 'system'
  const resource =
    deriveResourceFromRouteName(typeof routeName === 'string' ? routeName : null) ??
    normalizeResource(pathSegments[pathSegments.length - 1] || 'index')

  return `${category}:${resource}:menu`
}

function deriveResourceFromRouteName(routeName: string | null): string | null {
  if (!routeName) {
    return null
  }

  const normalizedWords = splitIdentifierWords(routeName)
    .map(normalizeResource)
    .filter(word => word && !MENU_NAME_SUFFIXES.has(word))

  if (normalizedWords.length === 0) {
    return null
  }

  return singularize(normalizedWords[normalizedWords.length - 1] || 'index')
}

function splitIdentifierWords(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+|\s+/)
    .filter(Boolean)
}

function normalizeCategory(value: string): string {
  return value.toLowerCase().replace(/_/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
}

function normalizeResource(value: string): string {
  const snakeCase = value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()

  return singularize(snakeCase)
}

function singularize(value: string): string {
  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`
  }

  if (value.endsWith('ses') && value.length > 3) {
    return value.slice(0, -2)
  }

  if (value.endsWith('s') && value.length > 3 && !value.endsWith('ss') && !value.endsWith('us')) {
    return value.slice(0, -1)
  }

  return value
}

function joinPaths(parentPath: string, routePath?: string): string {
  if (!routePath) {
    return parentPath || '/'
  }

  if (routePath.startsWith('/')) {
    return routePath
  }

  if (!parentPath || parentPath === '/') {
    return `/${routePath.replace(/^\/+/, '')}`
  }

  return `${parentPath.replace(/\/+$/, '')}/${routePath.replace(/^\/+/, '')}`
}
