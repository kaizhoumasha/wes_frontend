/**
 * 表格组件导出
 *
 * 提供 DataTable 组件和相关的类型、工具函数
 */

export { default as DataTable } from './DataTable.vue'
export { useTableColumns } from './useTableColumns'
export type {
  TableColumnConfig,
  TableConfig,
  DataTableProps,
  DataTableEmits,
  PaginationConfig,
  DataTableWithPaginationProps,
  DataTableInstance,
  TreePropsConfig,
  ColumnAlign,
  ColumnFixed,
  ColumnType,
  ColumnFormatter,
  ColumnSlotRender,
} from './table.types'
export {
  formatDateTime,
  formatDate,
  formatBoolean,
  formatTag,
  formatArrayTags,
  formatActions,
  createTextColumn,
  createTagColumn,
  createArrayTagsColumn,
  createDateTimeColumn,
  createActionsColumn,
  type ActionButton,
} from './useTableColumns'
