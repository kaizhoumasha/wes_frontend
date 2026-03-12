import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPermissionGuard } from './guards/permission'
import { setRouterInstance } from '@/api/services/auth-error-handler'

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
        path: 'examples/user-form',
        name: 'UserFormExample',
        component: () => import('@/views/examples/UserFormExample.vue'),
        meta: { requiresAuth: false }
      },
      // ==================== 管理模块 ====================
      {
        path: 'admin/users',
        name: 'UserList',
        component: () => import('@/views/admin/users/UserListPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'admin:user:list',
          title: '用户管理',
        },
      },
      // 开发模式专属路由：调试页面
      ...(import.meta.env.DEV ? [
        {
          path: 'debug/smart-search',
          name: 'SmartSearchDebug',
          component: () => import('@/views/debug/smart-search-debug.vue'),
          meta: { requiresAuth: false, title: '智能搜索调试' }
        }
      ] : [])
    ]
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
router.beforeEach((to, from) => {
  const token = localStorage.getItem('access_token')

  // 如果没有 token 且路由需要认证，重定向到登录页
  if (to.meta.requiresAuth !== false && !token) {
    // 保存目标路径用于登录后重定向
    if (to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    return '/login'
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
