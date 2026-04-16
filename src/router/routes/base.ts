import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  }
]

export const shellBaseChildren: RouteRecordRaw[] = [
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
  }
]

export const shellRoute: RouteRecordRaw = {
  path: '/',
  component: () => import('@/layouts/DefaultLayout.vue'),
  meta: { requiresAuth: true },
  children: []
}

export const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundRedirect',
  redirect: to => ({
    path: '/404',
    query: {
      path: to.path
    }
  })
}
