import { defineCrudPageConfig } from './defineCrudPageConfig'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPageFeatures,
  CrudPageFormConfig,
  CrudPagePermissionConfig,
  CrudPageRowAction,
  CrudPageTitleConfig,
  CrudPageToolbarAction,
  TreeModeOptions
} from './types'
import type { CrudPageDetailConfig } from './detail/types'
import {
  createCrudRequestAdapterFromMethods,
  createSoftDeleteCrudRequestAdapterFromMethods,
  type CrudRequestAdapter,
  type CrudApiMethods,
  type SoftDeleteCrudApiMethods,
  type SortField,
  type QueryOptionsInput,
} from '@/api/base/crud-request-adapter'
import {
  createReadonlyCrudRequestAdapterFromMethods,
  type ReadonlyCrudRequestAdapterMethodsSource
} from '@/api/base/createReadonlyCrudRequestAdapter'
import type { CrudFieldConfigDefinition, ResourceFieldDefinition } from './resourceFieldBuilder'

// 日志等只读资源的 detail/query 类型来自具体生成模块，builder 只做宽松承接与桥接。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReadonlyCrudPageMethods<TItem extends CrudPageEntity> = ReadonlyCrudRequestAdapterMethodsSource<TItem, any, any>

interface CreateCrudPageConfigFromResourceOptions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
> {
  resource: {
    key: string
    title: CrudPageTitleConfig
    methods:
      | CrudApiMethods<TItem, TCreate, TUpdate, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown>
      | SoftDeleteCrudApiMethods<TItem, TCreate, TUpdate, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown>
      | ReadonlyCrudPageMethods<TItem>
    permissions?: CrudPagePermissionConfig
    pageSize?: number
    optimisticUpdate?: boolean
    autoRefresh?: boolean
    defaultSort?: SortField[]
    /** 树形模式配置 */
    treeMode?: TreeModeOptions
  }
  fieldConfig: CrudFieldConfigDefinition<ResourceFieldDefinition, TCreate, TUpdate>
  table?: Omit<CrudPageConfig<TItem, TCreate, TUpdate>['table'], 'columns' | 'defaultSort'>
  form?: Partial<CrudPageFormConfig<TCreate, TUpdate>>
  detail?: CrudPageDetailConfig<TItem>
  features?: CrudPageFeatures
  extensions?: {
    toolbarActions?: CrudPageToolbarAction[]
    rowActions?: CrudPageRowAction<TItem>[]
  }
}

function resolveCrudPageDetail<TItem extends CrudPageEntity>(
  detail: CrudPageDetailConfig<TItem> | undefined,
  fields: readonly ResourceFieldDefinition[]
): CrudPageDetailConfig<TItem> | undefined {
  if (!detail?.sections?.length) {
    return detail
  }

  const fieldLabelMap = new Map(fields.map(field => [field.key, field.label]))

  return {
    ...detail,
    sections: detail.sections.map(section => ({
      ...section,
      fields: section.fields?.map(field => ({
        ...field,
        label: field.label ?? fieldLabelMap.get(field.key) ?? field.key
      }))
    }))
  }
}

function resolveCrudPageForm<
  TCreate extends object,
  TUpdate extends object
>(
  fieldConfig: CrudFieldConfigDefinition<ResourceFieldDefinition, TCreate, TUpdate>,
  form: Partial<CrudPageFormConfig<TCreate, TUpdate>> | undefined
): CrudPageFormConfig<TCreate, TUpdate> | undefined {
  if (form) {
    const mergedForm = {
      ...fieldConfig.form,
      ...form
    }

    if (!mergedForm.createSchema) {
      throw new Error('Crud resource form config requires createSchema')
    }

    return {
      ...mergedForm,
      createSchema: mergedForm.createSchema
    }
  }

  if (!fieldConfig.form.createSchema) {
    return undefined
  }

  return {
    ...fieldConfig.form,
    createSchema: fieldConfig.form.createSchema
  }
}



type TreeMethodBridge = Partial<{
  tree: (query?: unknown, config?: unknown) => { send: () => Promise<unknown> }
  children: (params: unknown, config?: unknown) => { send: () => Promise<unknown> }
  siblings: (params: unknown, query?: unknown, config?: unknown) => { send: () => Promise<unknown> }
  ancestors: (params: unknown, query?: unknown, config?: unknown) => { send: () => Promise<unknown> }
  move: (body: unknown, config?: unknown) => { send: () => Promise<unknown> }
  batchSort: (body: unknown, config?: unknown) => { send: () => Promise<unknown> }
}>

function attachTreeMethodBridges<TAdapter extends CrudRequestAdapter<unknown, unknown, unknown>>(
  requestAdapter: TAdapter,
  methods: TreeMethodBridge
): TAdapter {
  const bridge: Record<string, unknown> = {}

  if (methods.tree) {
    bridge.tree = (query?: unknown, config?: unknown) => methods.tree!(query, config).send()
  }

  if (methods.children) {
    bridge.children = (params: unknown, config?: unknown) => methods.children!(params, config).send()
  }

  if (methods.siblings) {
    bridge.siblings = (params: unknown, query?: unknown, config?: unknown) => methods.siblings!(params, query, config).send()
  }

  if (methods.ancestors) {
    bridge.ancestors = (params: unknown, query?: unknown, config?: unknown) => methods.ancestors!(params, query, config).send()
  }

  if (methods.move) {
    bridge.move = (body: unknown, config?: unknown) => methods.move!(body, config).send()
  }

  if (methods.batchSort) {
    bridge.batchSort = (body: unknown, config?: unknown) => methods.batchSort!(body, config).send()
  }

  return {
    ...requestAdapter,
    ...bridge
  }
}

function resolveCrudPageRequestAdapter<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(methods:
  | CrudApiMethods<TItem, TCreate, TUpdate, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown>
  | SoftDeleteCrudApiMethods<TItem, TCreate, TUpdate, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown, QueryOptionsInput, unknown, unknown, unknown, unknown>
  | ReadonlyCrudPageMethods<TItem>
): CrudRequestAdapter<TItem, TCreate, TUpdate> {
  if ('getTrash' in methods) {
    return attachTreeMethodBridges(
      createSoftDeleteCrudRequestAdapterFromMethods(
        methods as SoftDeleteCrudApiMethods<TItem, TCreate, TUpdate>
      ),
      methods as TreeMethodBridge
    )
  }

  if ('create' in methods && 'update' in methods && 'delete' in methods) {
    return attachTreeMethodBridges(
      createCrudRequestAdapterFromMethods(methods as CrudApiMethods<TItem, TCreate, TUpdate>),
      methods as TreeMethodBridge
    )
  }

  return attachTreeMethodBridges(
    createReadonlyCrudRequestAdapterFromMethods(methods as ReadonlyCrudPageMethods<TItem>) as CrudRequestAdapter<
      TItem,
      TCreate,
      TUpdate
    >,
    methods as TreeMethodBridge
  )
}

export function createCrudPageConfigFromResource<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(
  options: CreateCrudPageConfigFromResourceOptions<TItem, TCreate, TUpdate>
): CrudPageConfig<TItem, TCreate, TUpdate> {
  const { resource, fieldConfig, table, form, detail, features, extensions } = options
  const resolvedForm = resolveCrudPageForm<TCreate, TUpdate>(fieldConfig, form)
  const resolvedDetail = resolveCrudPageDetail(detail, fieldConfig.fields)
  const resolvedTable: CrudPageConfig<TItem, TCreate, TUpdate>['table'] = {
    selectable: true,
    columnResizable: true,
    ...table,
    columns: fieldConfig.table
  }

  const resolvedResource: CrudPageConfig<TItem, TCreate, TUpdate>['resource'] = {
    ...resource,
    requestAdapter: resolveCrudPageRequestAdapter<TItem, TCreate, TUpdate>(resource.methods)
  }

  return defineCrudPageConfig<TItem, TCreate, TUpdate>({
    resource: resolvedResource,
    search: fieldConfig.search,
    table: resolvedTable,
    form: resolvedForm,
    detail: resolvedDetail,
    features,
    extensions
  })
}
