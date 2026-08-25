import type { RouteRecordRaw } from 'vue-router'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'

export const adminRoutes: RouteRecordRaw = {
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
          icon: 'ep:collection-tag',
          sortOrder: 98
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
          icon: 'ep:lock',
          sortOrder: 96
        }
      }
    }
  ]
}
