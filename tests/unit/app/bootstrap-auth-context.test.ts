import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BIZ_WORKLINE_PERMISSION } from '@/api/generated/permissions/user_api/biz/workline'
import type { ApiPermissionInfo, MyResult, UserInfo } from '@/api/modules/auth'

const mocks = vi.hoisted(() => ({
  mySend: vi.fn(),
  permissionsSend: vi.fn(),
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn()
}))

vi.mock('@/api/modules/auth', () => ({
  authApiMethods: {
    my: () => ({ send: mocks.mySend }),
    permissions: () => ({ send: mocks.permissionsSend })
  }
}))

vi.mock('@/api/services/token-refresh', () => ({
  getAccessToken: mocks.getAccessToken,
  setAccessToken: mocks.setAccessToken
}))

function createUser(isSuperuser: boolean): UserInfo {
  return {
    id: 1,
    username: isSuperuser ? 'admin' : 'operator',
    email: isSuperuser ? 'admin@example.com' : 'operator@example.com',
    full_name: isSuperuser ? '系统管理员' : '操作员',
    is_superuser: isSuperuser,
    is_multi_login: true,
    created_at: '2026-05-08T00:00:00Z',
    version: 0,
    roles: []
  }
}

function createPermission(name: string): ApiPermissionInfo {
  return {
    id: 100,
    name,
    type: 'user_api',
    description: null,
    category: 'business',
    resource: 'workline',
    action: 'list',
    method: 'GET',
    path: '/api/v1/worklines'
  }
}

function createMyContext(isSuperuser: boolean): MyResult {
  return {
    user: createUser(isSuperuser),
    permissions: [createPermission(BIZ_WORKLINE_PERMISSION.list)]
  }
}

function clearStorage(storage: Storage): void {
  if (typeof storage.clear === 'function') {
    storage.clear()
  }
}

describe('bootstrapAuthContext', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    clearStorage(localStorage)
    clearStorage(sessionStorage)
    mocks.getAccessToken.mockReturnValue(null)
    mocks.permissionsSend.mockResolvedValue({ permissions: [] })
  })

  it('hydrates wildcard permission for superuser context from /auth/my', async () => {
    // Regression: ISSUE-002 — superuser could not clear ESTOP when /auth/my omitted the new clear-estop API permission.
    // Found by /qa on 2026-05-08.
    // Report: .gstack/qa-reports/qa-report-localhost-5173-2026-05-08.md
    mocks.mySend.mockResolvedValue(createMyContext(true))

    const { bootstrapAuthContext } = await import('@/app/bootstrap-auth-context')
    await bootstrapAuthContext()

    const { usePermission } = await import('@/composables/usePermission')
    const { hasPermission, isSuperuser, permissions } = usePermission()

    expect(isSuperuser.value).toBe(true)
    expect(hasPermission(BIZ_WORKLINE_PERMISSION.clearEstop)).toBe(true)
    expect(permissions.value.map(permission => permission.name)).toContain('*')
  })

  it('does not grant wildcard permission to normal users', async () => {
    mocks.mySend.mockResolvedValue(createMyContext(false))

    const { bootstrapAuthContext } = await import('@/app/bootstrap-auth-context')
    await bootstrapAuthContext()

    const { usePermission } = await import('@/composables/usePermission')
    const { hasPermission, isSuperuser } = usePermission()

    expect(isSuperuser.value).toBe(false)
    expect(hasPermission(BIZ_WORKLINE_PERMISSION.list)).toBe(true)
    expect(hasPermission(BIZ_WORKLINE_PERMISSION.clearEstop)).toBe(false)
  })

  it('hydrates an empty /auth/my permission list without requesting the legacy permissions endpoint', async () => {
    mocks.mySend.mockResolvedValue({
      ...createMyContext(false),
      permissions: []
    })

    const { bootstrapAuthContext } = await import('@/app/bootstrap-auth-context')
    await bootstrapAuthContext()

    const { usePermission } = await import('@/composables/usePermission')
    expect(usePermission().isInitialized.value).toBe(true)
    expect(usePermission().permissions.value).toEqual([])
    expect(mocks.permissionsSend).not.toHaveBeenCalled()
  })

  it('bypasses cached permissions when a forced context restore falls back from /auth/my', async () => {
    mocks.mySend.mockRejectedValueOnce(new Error('auth context unavailable'))
    mocks.permissionsSend.mockResolvedValueOnce({
      permissions: [createPermission('biz:device:page')]
    })

    const { setPermissionsToCache } = await import('@/composables/permission-state')
    const { bootstrapAuthContext } = await import('@/app/bootstrap-auth-context')
    const { usePermission } = await import('@/composables/usePermission')
    setPermissionsToCache([createPermission('cached:permission:page')])

    await bootstrapAuthContext({ forceRefresh: true })

    expect(mocks.permissionsSend).toHaveBeenCalledOnce()
    expect(usePermission().permissions.value.map(permission => permission.name)).toEqual([
      'biz:device:page'
    ])
  })
})
