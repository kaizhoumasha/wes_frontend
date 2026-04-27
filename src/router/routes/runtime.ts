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
      path: 'dashboard',
      name: 'RuntimeDashboard',
      component: () => import('@/views/runtime/overview/RuntimeOverviewPage.vue'),
      meta: {
        requiresAuth: true,
        title: '运行中控台',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:dashboard:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:data-board',
          sortOrder: 1,
        },
      },
    },
    {
      path: 'traces',
      name: 'RuntimeTraceExplorer',
      component: () => import('@/views/runtime/traces/TraceExplorerPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Trace 处置台',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:traces:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:connection',
          sortOrder: 2,
        },
      },
    },
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
          sortOrder: 3,
        },
      },
    },
    {
      path: 'sandbox',
      name: 'RuntimeSandbox',
      component: () => import('@/views/runtime/sandbox/RuntimeSandboxPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Sandbox 调试台',
        permission: BIZ_PERMISSIONS.workline.update,
        menu: {
          name: 'runtime:sandbox:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:tools',
          sortOrder: 4,
        },
      },
    },
  ],
}
