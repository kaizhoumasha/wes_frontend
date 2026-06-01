import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildMenuManifestEntries,
  writeMenuManifestFile,
} from '../../../scripts/lib/menu-manifest'

describe('menu manifest helpers', () => {
  it('builds menu manifest entries from protected titled routes', () => {
    const routes = [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: '@/views/dashboard/Dashboard.vue',
        meta: {
          requiresAuth: true,
          title: '仪表盘',
        },
      },
      {
        path: 'admin',
        name: 'AdminRoot',
        meta: {
          requiresAuth: true,
          title: '系统管理',
          menu: {
            name: 'admin:system:menu',
            icon: 'ep:setting',
            sortOrder: 10,
          },
        },
        children: [
          {
            path: 'users',
            name: 'UserList',
            component: '@/views/admin/users/UserListPage.vue',
            meta: {
              requiresAuth: true,
              title: '用户管理',
              permission: 'admin:user:list',
              menu: {
                name: 'admin:user:menu',
                parentName: 'admin:system:menu',
                icon: 'ep:user',
                sortOrder: 11,
              },
            },
          },
        ],
      },
      {
        path: 'debug/example',
        name: 'DebugExample',
        component: '@/views/examples/UserFormExample.vue',
        meta: {
          requiresAuth: false,
          title: '调试页',
        },
      },
    ]

    expect(buildMenuManifestEntries(routes)).toEqual([
      {
        name: 'system:dashboard:menu',
        title: '仪表盘',
        path: '/dashboard',
        component: 'views/dashboard/Dashboard.vue',
        sortOrder: 1,
        parentName: null,
        icon: null,
        isHidden: false,
        permission: null,
      },
      {
        name: 'admin:system:menu',
        title: '系统管理',
        path: '/admin',
        component: null,
        sortOrder: 10,
        parentName: null,
        icon: 'ep:setting',
        isHidden: false,
        permission: null,
      },
      {
        name: 'admin:user:menu',
        title: '用户管理',
        path: '/admin/users',
        component: 'views/admin/users/UserListPage.vue',
        sortOrder: 11,
        parentName: 'admin:system:menu',
        icon: 'ep:user',
        isHidden: false,
        permission: 'admin:user:list',
      },
    ])
  })

  it('writes a stable menu manifest file', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'menu-manifest-'))
    const outputFile = join(tempDir, 'menu-manifest.json')

    try {
      writeMenuManifestFile(
        [
          {
            name: 'runtime:worklines:menu',
            title: '工作线监控',
            path: '/runtime/worklines',
            component: 'views/runtime/worklines/WorklineRuntimePage.vue',
            sortOrder: 3,
            parentName: 'runtime:system:menu',
            icon: 'ep:share',
            isHidden: false,
            permission: 'biz:workline:list',
          },
        ],
        outputFile,
      )

      expect(JSON.parse(readFileSync(outputFile, 'utf-8'))).toEqual([
        {
          name: 'runtime:worklines:menu',
          title: '工作线监控',
          path: '/runtime/worklines',
          component: 'views/runtime/worklines/WorklineRuntimePage.vue',
          sortOrder: 3,
          parentName: 'runtime:system:menu',
          icon: 'ep:share',
          isHidden: false,
          permission: 'biz:workline:list',
        },
      ])
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('generates the non-production integration debug menu entry from the CLI', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'menu-manifest-'))
    const outputFile = join(tempDir, 'menu-manifest.json')

    try {
      execFileSync('pnpm', ['exec', 'tsx', 'scripts/generate-menu-manifest.ts', '--out', outputFile], {
        cwd: process.cwd(),
        stdio: 'pipe',
      })

      const entries = JSON.parse(readFileSync(outputFile, 'utf-8')) as Array<{ name: string; path: string }>

      expect(entries).toContainEqual(
        expect.objectContaining({
          name: 'runtime:integration-debug:menu',
          path: '/runtime/integration-debug',
        }),
      )
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
