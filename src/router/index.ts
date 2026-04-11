import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPermissionGuard } from './guards/permission'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { API_AUTH_PERMISSIONS } from '@/api/generated/permissions'
import { setRouterInstance } from '@/api/services/auth-error-handler'
import { useCurrentUser } from '@/composables/useCurrentUser'

const debugRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: 'debug/smart-search',
        name: 'SmartSearchDebug',
        component: () => import('@/views/debug/smart-search-debug.vue'),
        meta: { requiresAuth: false, title: '智能搜索调试' }
      },
      {
        path: 'debug/standard-dialog',
        name: 'StandardDialogDemo',
        component: () => import('@/views/components/StandardDialogDemo.vue'),
        meta: { requiresAuth: false, title: 'StandardDialog 组件演示' }
      }
    ]
  : []

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { requiresAuth: true, title: '仪表盘' }
      },
      {
        path: '403',
        name: 'Unauthorized',
        component: () => import('@/views/error/Unauthorized.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '404',
        name: 'NotFound',
        component: () => import('@/views/error/NotFound.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'examples/user-form',
        name: 'UserFormExample',
        component: () => import('@/views/examples/UserFormExample.vue'),
        meta: { requiresAuth: false }
      },
      // ==================== 管理模块 ====================
      {
        path: 'admin',
        name: 'AdminRoot',
        meta: {
          requiresAuth: true,
          title: '系统管理',
          menu: {
            name: 'admin:system:menu',
            icon: 'ep:setting',
            sortOrder: 10
          }
        },
        children: [
          {
            path: 'users',
            name: 'UserList',
            component: () => import('@/views/admin/users/UserListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '用户管理',
              permission: ADMIN_PERMISSIONS.user.page,
              menu: {
                name: 'admin:user:menu',
                parentName: 'admin:system:menu',
                icon: 'ep:user',
                sortOrder: 99
              }
            }
          },
          {
            path: 'roles',
            name: 'RoleList',
            component: () => import('@/views/admin/roles/RoleListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '角色管理',
              permission: ADMIN_PERMISSIONS.role.page,
              menu: {
                name: 'admin:role:menu',
                parentName: 'admin:system:menu',
                icon: 'ep:collection-tag',
                sortOrder: 98
              }
            }
          },
          {
            path: 'menus',
            name: 'MenuList',
            component: () => import('@/views/admin/menus/MenuListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '菜单管理',
              permission: ADMIN_PERMISSIONS.menu.page,
              menu: {
                name: 'admin:menu:menu',
                parentName: 'admin:system:menu',
                icon: 'ep:menu',
                sortOrder: 97
              }
            }
          },
          {
            path: 'permissions',
            name: 'PermissionList',
            component: () => import('@/views/admin/permissions/PermissionListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '权限管理',
              permission: ADMIN_PERMISSIONS.permission.page,
              menu: {
                name: 'admin:permission:menu',
                parentName: 'admin:system:menu',
                icon: 'ep:lock',
                sortOrder: 96
              }
            }
          }
        ]
      },
      // ==================== 业务模块 ====================
      {
        path: 'biz',
        name: 'BizRoot',
        meta: {
          requiresAuth: true,
          title: '业务管理',
          menu: {
            name: 'biz:system:menu',
            icon: 'ep:box',
            sortOrder: 20
          }
        },
        children: [
          {
            path: 'devices',
            name: 'DeviceList',
            component: () => import('@/views/admin/devices/DeviceListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '设备管理',
              permission: BIZ_PERMISSIONS.device.page,
              menu: {
                name: 'biz:device:menu',
                parentName: 'biz:system:menu',
                icon: 'ep:cpu',
                sortOrder: 1
              }
            }
          },
          {
            path: 'worklines',
            name: 'WorkLineList',
            component: () => import('@/views/admin/worklines/WorkLineListPage.vue'),
            meta: {
              requiresAuth: true,
              title: '作业线管理',
              permission: BIZ_PERMISSIONS.workline.page,
              menu: {
                name: 'biz:workline:menu',
                parentName: 'biz:system:menu',
                icon: 'ep:connection',
                sortOrder: 2
              }
            }
          }
        ]
      },
      // ==================== API 认证模块 ====================
      {
        path: 'api-auth',
        name: 'ApiAuthRoot',
        meta: {
          requiresAuth: true,
          title: 'API 认证',
          menu: {
            name: 'api-auth:system:menu',
            icon: 'ep:key',
            sortOrder: 30
          }
        },
        children: [
          {
            path: 'applications',
            name: 'APIApplicationList',
            component: () => import('@/views/admin/api-applications/APIApplicationListPage.vue'),
            meta: {
              requiresAuth: true,
              title: 'API 应用管理',
              permission: API_AUTH_PERMISSIONS.apiapplication.page,
              menu: {
                name: 'api-auth:application:menu',
                parentName: 'api-auth:system:menu',
                icon: 'ep:lock',
                sortOrder: 1
              }
            }
          }
        ]
      },
      // 开发模式专属路由：调试页面
      ...debugRoutes
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundRedirect',
    redirect: to => ({
      path: '/404',
      query: {
        path: to.path
      }
    })
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 设置路由实例引用（供认证错误处理服务使用）
setRouterInstance(router)

// ==================== 路由守卫 ====================

// 认证守卫
router.beforeEach(async (to, from) => {
  const token = localStorage.getItem('access_token')

  // 如果没有 token 且路由需要认证，重定向到登录页
  if (to.meta.requiresAuth !== false && !token) {
    // 保存目标路径用于登录后重定向
    if (to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    return '/login'
  }

  // 如果已登录，恢复用户上下文（页面刷新后）
  if (token) {
    const { currentUser, hydrateCurrentUser } = useCurrentUser()

    // 如果 sessionStorage 中没有用户信息，尝试从后端加载
    if (!currentUser.value) {
      try {
        const { authApi } = await import('@/api/modules/auth')
        const myContext = await authApi.my()
        hydrateCurrentUser(myContext.user)
      } catch (error) {
        console.warn('[认证守卫] 加载用户信息失败:', error)
        // 不阻塞导航，让权限守卫处理
      }
    }
  }

  // 如果已登录且在登录页，重定向到 dashboard
  // 但排除从登录页跳转到其他页面时的触发
  if (to.path === '/login' && token && from.path !== '/login') {
    return '/dashboard'
  }

  // 其他情况放行
  return
})

// 权限守卫（在认证守卫之后执行）
router.beforeEach(createPermissionGuard(router))

export default router
