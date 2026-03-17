import { defineCrudPageConfig } from './defineCrudPageConfig'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPageFeatures,
  CrudPageFormConfig,
  CrudPagePermissionConfig,
  CrudPageRowAction,
  CrudPageTitleConfig,
  CrudPageToolbarAction
} from './types'
import type { CrudApi, SortField } from '@/api/base/crud-api'
import type { ResourceFieldDefinition, ResourceSchemaDefinition } from './resourceFieldBuilder'

interface CreateCrudPageConfigFromResourceOptions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
> {
  resource: {
    key: string
    title: CrudPageTitleConfig
    api: CrudApi<TItem, TCreate, TUpdate>
    permissions?: CrudPagePermissionConfig
    pageSize?: number
    optimisticUpdate?: boolean
    autoRefresh?: boolean
    defaultSort?: SortField[]
  }
  resourceSchema: ResourceSchemaDefinition<ResourceFieldDefinition, TCreate, TUpdate>
  table?: Omit<CrudPageConfig<TItem, TCreate, TUpdate>['table'], 'columns' | 'defaultSort'>
  form?: Partial<CrudPageFormConfig<TCreate, TUpdate>>
  features?: CrudPageFeatures
  extensions?: {
    toolbarActions?: CrudPageToolbarAction[]
    rowActions?: CrudPageRowAction<TItem>[]
  }
}

function resolveCrudPageForm<
  TCreate extends object,
  TUpdate extends object
>(
  resourceSchema: ResourceSchemaDefinition<ResourceFieldDefinition, TCreate, TUpdate>,
  form: Partial<CrudPageFormConfig<TCreate, TUpdate>> | undefined
): CrudPageFormConfig<TCreate, TUpdate> | undefined {
  if (form) {
    const mergedForm = {
      ...resourceSchema.form,
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

  if (!resourceSchema.form.createSchema) {
    return undefined
  }

  return {
    ...resourceSchema.form,
    createSchema: resourceSchema.form.createSchema
  }
}

export function createCrudPageConfigFromResource<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(
  options: CreateCrudPageConfigFromResourceOptions<TItem, TCreate, TUpdate>
): CrudPageConfig<TItem, TCreate, TUpdate> {
  const { resource, resourceSchema, table, form, features, extensions } = options
  const resolvedForm = resolveCrudPageForm<TCreate, TUpdate>(resourceSchema, form)
  const resolvedTable: CrudPageConfig<TItem, TCreate, TUpdate>['table'] = {
    selectable: true,
    columnResizable: true,
    ...table,
    columns: resourceSchema.table
  }

  return defineCrudPageConfig<TItem, TCreate, TUpdate>({
    resource,
    search: resourceSchema.search,
    table: resolvedTable,
    form: resolvedForm,
    features,
    extensions
  })
}
