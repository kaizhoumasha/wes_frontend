import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPermissionGuard } from './guards/permission'

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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ==================== 路由守卫 ====================

// 认证守卫
router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth !== false && !token) {
    // 保存目标路径用于登录后重定向
    if (to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    return '/login'
  }

  if (to.path === '/login' && token) {
    return '/dashboard'
  }
})

// 权限守卫（在认证守卫之后执行）
router.beforeEach(createPermissionGuard(router))

export default router
