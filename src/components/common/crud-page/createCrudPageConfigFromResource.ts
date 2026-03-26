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
import type { CrudPageDetailConfig } from './detail/types'
import type { CrudApi, SortField } from '@/api/base/crud-api'
import type { CrudFieldConfigDefinition, ResourceFieldDefinition } from './resourceFieldBuilder'

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

  return defineCrudPageConfig<TItem, TCreate, TUpdate>({
    resource,
    search: fieldConfig.search,
    table: resolvedTable,
    form: resolvedForm,
    detail: resolvedDetail,
    features,
    extensions
  })
}
