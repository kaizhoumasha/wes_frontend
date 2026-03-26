/**
 * StandardDialog 常量定义
 * @version 1.1
 * @date 2026-03-19
 */

import type { DialogSize, SizeConfig, TitleIconType } from './types'

/**
 * 尺寸映射配置
 *
 * 根据信息密度定义 6 级标准尺寸
 */
export const SIZE_CONFIG: Record<DialogSize, SizeConfig> = {
  xs: {
    width: 400,
    maxWidth: 90 // vw
  },
  sm: {
    width: 520,
    maxWidth: 90
  },
  md: {
    width: 640,
    maxWidth: 90
  },
  lg: {
    width: 800,
    maxWidth: 90
  },
  xl: {
    width: 900,
    maxWidth: 85
  },
  full: {
    width: 0, // 不使用固定宽度
    maxWidth: 95
  }
} as const

/**
 * 尺寸选择指南
 *
 * 内容项数 ≤ 2 个 → xs (400px)
 * 表单字段数 1-2 个 → sm (520px)
 * 表单字段数 3-5 个 → md (640px)
 * 表单字段数 6-10 个 → lg (800px)
 * 表单字段数 >10 个或需嵌套结构 → xl (900px)
 * 需要展示表格/列表 → lg 或 xl
 * 全屏沉浸式操作 → full
 */
export const SIZE_GUIDE: Record<DialogSize, { fields: string; usage: string }> = {
  xs: {
    fields: '≤2 项内容',
    usage: '删除确认、提示信息、警告'
  },
  sm: {
    fields: '1-2 个字段',
    usage: '轻量表单、简单设置、密码修改'
  },
  md: {
    fields: '3-5 个字段',
    usage: '标准表单、详情查看、用户信息'
  },
  lg: {
    fields: '6-10 个字段',
    usage: '复杂表单、批量操作、配置面板'
  },
  xl: {
    fields: '>10 个字段',
    usage: '高级搜索、复杂配置、数据导入'
  },
  full: {
    fields: '大数据展示',
    usage: '大数据表格、复杂向导、报表预览'
  }
} as const

/** 默认 Props 值 */
export const DEFAULT_PROPS = {
  size: 'md' as DialogSize,
  closable: true,
  closeOnClickModal: false,
  destroyOnClose: true,
  scrollable: true,
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmType: 'primary' as const,
  confirmLoading: false,
  confirmDisabled: false,
  hideCancel: false,
  customClass: '',
  center: false,
  direction: 'rtl' as const
} as const

/** 响应式断点 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1280
} as const

/** 对话框各区域高度 */
export const DIALOG_DIMENSIONS = {
  HEADER_HEIGHT: 56,
  FOOTER_HEIGHT: 64,
  MAX_HEIGHT_VH: 85
} as const

/** 标题图标配置 */
export const TITLE_ICON_CONFIG: Record<TitleIconType, { icon: string; class: string }> = {
  warning: {
    icon: 'lucide:triangle-alert',
    class: 'text-amber-500'
  },
  danger: {
    icon: 'lucide:circle-alert',
    class: 'text-red-500'
  },
  info: {
    icon: 'lucide:info',
    class: 'text-blue-500'
  },
  success: {
    icon: 'lucide:circle-check',
    class: 'text-green-500'
  }
} as const
