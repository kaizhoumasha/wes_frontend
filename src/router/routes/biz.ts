import type { RouteRecordRaw } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'

export const bizRoutes: RouteRecordRaw = {
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
    },
    {
      path: 'worklines/:id/config',
      name: 'WorkLineConfig',
      component: () => import('@/views/admin/worklines/config/WorkLineConfigPage.vue'),
      meta: {
        requiresAuth: true,
        title: '作业线配置工作台',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'biz:workline:config',
          hidden: true
        }
      }
    }
  ]
}
