import type { RouteRecordRaw } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'

export const runtimeRoutes: RouteRecordRaw = {
  path: 'runtime',
  name: 'RuntimeRoot',
  meta: {
    requiresAuth: true,
    title: '运行监控中心',
    menu: {
      name: 'runtime:system:menu',
      icon: 'ep:monitor',
      sortOrder: 30
    }
  },
  children: [
    {
      path: 'worklines',
      name: 'RuntimeWorklines',
      component: () => import('@/views/runtime/worklines/WorklineRuntimePage.vue'),
      meta: {
        requiresAuth: true,
        title: '工作线运行态',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:worklines:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:share',
          sortOrder: 1
        }
      }
    },
    {
      path: 'dashboard',
      name: 'RuntimeDashboard',
      component: () => import('@/views/runtime/overview/RuntimeOverviewPage.vue'),
      meta: {
        requiresAuth: true,
        title: '运行中控台（旧）',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:dashboard:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:data-board',
          sortOrder: 10,
          hidden: true // 弱化：隐藏菜单，保留路由供深链跳转
        }
      }
    },
    {
      path: 'traces',
      name: 'RuntimeTraceExplorer',
      redirect: to => ({
        name: 'RuntimeWorklines',
        query: to.query
      }),
      meta: {
        requiresAuth: true,
        title: 'Trace 深链（已合并至工作线运行态）',
        permission: BIZ_PERMISSIONS.workline.page
      }
    },
    {
      path: 'sandbox',
      name: 'RuntimeSandbox',
      component: () => import('@/views/runtime/sandbox/RuntimeSandboxPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Sandbox 深链',
        permission: BIZ_PERMISSIONS.workline.update,
        menu: {
          name: 'runtime:sandbox:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:tools',
          sortOrder: 30,
          hidden: true // 弱化：隐藏菜单，保留路由供深链跳转
        }
      }
    },
    {
      path: 'holds/:holdId',
      name: 'RuntimeHoldDetail',
      component: () => import('@/views/runtime/holds/RuntimeHoldPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Runtime Hold',
        permission: BIZ_PERMISSIONS.workline.viewRuntimeHold
      }
    }
  ]
}
