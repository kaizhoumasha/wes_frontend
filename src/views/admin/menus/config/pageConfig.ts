import type {
  CreateMenusInput as CreateMenuInput,
  UpdateMenusInput as UpdateMenuInput,
  MenusItem as Menu
} from '@/api/modules/menus'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { menusApiMethods } from '@/api/modules/menus'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type {
  CrudPageConfig,
  CrudPageFeatures,
  CrudPagePermissionConfig
} from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { menuPageFieldConfig } from './fieldConfig'
import { h } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

type MenuPageConfig = CrudPageConfig<Menu, CreateMenuInput, UpdateMenuInput>

const MENU_PAGE_PERMISSIONS = {
  page: ADMIN_PERMISSIONS.menu.page,
  list: ADMIN_PERMISSIONS.menu.list,
  detail: ADMIN_PERMISSIONS.menu.detail,
  create: ADMIN_PERMISSIONS.menu.create,
  update: ADMIN_PERMISSIONS.menu.update,
  delete: ADMIN_PERMISSIONS.menu.delete,
  restore: ADMIN_PERMISSIONS.menu.restore,
  trash: ADMIN_PERMISSIONS.menu.trash,
  batchRestore: ADMIN_PERMISSIONS.menu.batchRestore,
  permanentDelete: ADMIN_PERMISSIONS.menu.permanentDelete,
  batchPermanentDelete: ADMIN_PERMISSIONS.menu.batchPermanentDelete,
  tree: ADMIN_PERMISSIONS.menu.tree,
  move: ADMIN_PERMISSIONS.menu.move,
  batchSort: ADMIN_PERMISSIONS.menu.batchSort
} satisfies CrudPagePermissionConfig

const MENU_PAGE_RESOURCE = {
  key: 'menus',
  title: {
    text: '菜单管理',
    subtitle: '管理系统菜单和导航结构',
    icon: 'ep:menu'
  },
  trashTitle: {
    text: '菜单回收站',
    subtitle: '查看并恢复已删除菜单',
    icon: 'ep:delete'
  },
  methods: menusApiMethods,
  permissions: MENU_PAGE_PERMISSIONS,
  optimisticUpdate: true,
  defaultSort: [{ field: 'sort_order', order: 'asc' as const }],
  // 启用树形模式（非懒加载，后端一次返回完整树）
  treeMode: {
    enabled: true,
    childrenKey: 'children',
    hasChildrenKey: 'has_children',
    lazyLoad: false,
    initialExpandLevel: 1,
    displayField: 'title'
  }
}

const MENU_PAGE_TABLE: Partial<MenuPageConfig['table']> = {
  actionsColumn: {
    width: 200
  }
}

const MENU_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增菜单',
    dialogTitle: '创建菜单'
  },
  edit: {
    dialogTitle: '编辑菜单'
  },
  restore: {
    label: '恢复菜单'
  },
  batchRestore: {
    label: '批量恢复'
  },
  permanentDelete: {
    label: '彻底删除'
  },
  batchPermanentDelete: {
    label: '批量彻底删除'
  },
  sort: {
    enabled: true,
    label: '排序',
    icon: 'lucide:arrow-down-up'
  },
  createChild: {
    enabled: true,
    label: '添加下级'
  }
}

const MENU_PAGE_DETAIL: CrudPageDetailConfig<Menu> = {
  mode: 'drawer',
  title: menu => menu.title,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'name', layout: 'half' },
        { key: 'title', layout: 'half' },
        { key: 'path', layout: 'full' },
        {
          key: 'icon',
          layout: 'half',
          formatter: v => (v ? h(AppIcon, { icon: v as string, size: 18 }) : '')
        },
        { key: 'is_hidden', layout: 'half' }
      ]
    },
    {
      title: '组件配置',
      weight: 'secondary',
      fields: [
        { key: 'component', layout: 'full' },
        {
          key: 'icon',
          layout: 'half',
          formatter: v => (v ? h(AppIcon, { icon: v as string, size: 18 }) : '')
        },
        { key: 'is_hidden', layout: 'half' }
      ]
    }
  ]
}

export function createMenuPageConfig(): MenuPageConfig {
  return createCrudPageConfigFromResource<Menu, CreateMenuInput, UpdateMenuInput>({
    resource: MENU_PAGE_RESOURCE,
    fieldConfig: menuPageFieldConfig,
    table: MENU_PAGE_TABLE,
    detail: MENU_PAGE_DETAIL,
    features: MENU_PAGE_FEATURES
  })
}
