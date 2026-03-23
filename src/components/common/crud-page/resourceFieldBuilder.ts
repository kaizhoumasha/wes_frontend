import type {
  CrudPageColumnManager,
  CrudPageFormConfig,
  CrudPageFormSubmitConfig
} from '@/components/common/crud-page/types'
import type { ZodType } from 'zod'
import {
  buildTableColumnsByBreakpoint,
  extractColumnConfigs,
  extractFormFieldConfigs,
  extractSearchFieldConfigs,
  hasTableConfig,
  useTableColumns,
  type FormFieldType,
  type FormMode,
  type UnifiedFieldConfig,
  type UnifiedFormConfig,
  type UnifiedSearchConfig,
  type UnifiedTableConfig
} from '@/composables/useTableColumns'
import type { SearchDataType } from '@/types/search'
import type { SearchFavorite, QuickSearchPreset } from '@/types/search'
import type { TableColumnConfig } from '@/types/table'

export interface ResourceFieldDefinition<TKey extends string = string> extends UnifiedFieldConfig {
  key: TKey
}

export interface CrudFieldConfigDefinition<
  TField extends ResourceFieldDefinition = ResourceFieldDefinition,
  TCreate extends object = Record<string, unknown>,
  TUpdate extends object = Record<string, unknown>
> {
  fields: readonly TField[]
  table: {
    defaultColumns: ReturnType<typeof extractColumnConfigs>
    createManager: () => CrudPageColumnManager
  }
  form: {
    fieldConfig: ReturnType<typeof extractFormFieldConfigs>
    createSchema?: ZodType
    updateSchema?: ZodType
    title?: {
      create?: string
      edit?: string
    }
    width?: string
    submit?: CrudPageFormSubmitConfig<TCreate, TUpdate>
  }
  search: {
    fields: ReturnType<typeof extractSearchFieldConfigs>
    placeholder?: string
    quickPresets?: QuickSearchPreset[]
    favorites?: SearchFavorite[]
  }
}

type ContractKey<T> = Extract<keyof T, string>
type WritableKey<TCreate extends object, TUpdate extends object> =
  | ContractKey<TCreate>
  | ContractKey<TUpdate>
type ResourceFieldKey<TRead extends object, TCreate extends object, TUpdate extends object> =
  | ContractKey<TRead>
  | ContractKey<TCreate>
  | ContractKey<TUpdate>

type ResourceFieldFormOptions = Omit<UnifiedFormConfig, 'type' | 'modes'> & {
  type?: FormFieldType
  modes?: FormMode[]
}

type ResourceFieldSearchOptions = Omit<UnifiedSearchConfig, 'dataType' | 'searchable'> & {
  dataType?: SearchDataType
  searchable?: boolean
}

type ResourceFieldOptions<
  TKey extends string,
  TReadKey extends string,
  TWritableKey extends string
> = {
  key: TKey
  label: string
} & (TKey extends TReadKey ? {
  table?: UnifiedTableConfig
  search?: ResourceFieldSearchOptions
} : {
  table?: never
  search?: never
}) & (TKey extends TWritableKey ? {
  form?: ResourceFieldFormOptions
} : {
  form?: never
})

type ResourceFieldConfigForKey<
  TRead extends object,
  TCreate extends object,
  TUpdate extends object,
  TKey extends ResourceFieldKey<TRead, TCreate, TUpdate>
> = ResourceFieldOptions<TKey, ContractKey<TRead>, WritableKey<TCreate, TUpdate>>

function inferSearchDataType(form?: UnifiedFormConfig): SearchDataType {
  if (!form) {
    return 'text'
  }

  if (form.type === 'number') {
    return 'number'
  }

  if (form.type === 'switch' || form.type === 'checkbox') {
    return 'boolean'
  }

  if (form.type === 'date' || form.type === 'datetime') {
    return 'date'
  }

  if (form.type === 'select' || form.type === 'remote-select') {
    return 'enum'
  }

  return 'text'
}

function normalizeTableConfig(table?: UnifiedTableConfig): UnifiedTableConfig | undefined {
  if (!table) {
    return undefined
  }

  return {
    visibleFrom: 'desktop',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    ...table
  }
}

function normalizeFormConfig(form?: ResourceFieldFormOptions): UnifiedFormConfig | undefined {
  if (!form) {
    return undefined
  }

  return {
    type: 'input',
    modes: ['create', 'edit'],
    ...form
  }
}

function normalizeSearchConfig(
  search: ResourceFieldSearchOptions | undefined,
  form: UnifiedFormConfig | undefined
): UnifiedSearchConfig | undefined {
  if (!search) {
    return undefined
  }

  return {
    dataType: inferSearchDataType(form),
    searchable: true,
    ...search
  }
}

function createTableColumn(def: ResourceFieldDefinition): TableColumnConfig {
  if (!def.table) {
    throw new Error(`Field "${def.key}" does not declare table config`)
  }

  return {
    field: def.key,
    title: def.label,
    width: def.table.width ?? def.table.minWidth,
    minWidth: def.table.minWidth,
    sortable: def.table.sortable,
    formatter: def.table.formatter,
    slots: def.table.slots,
    fixed: def.table.fixed ?? undefined,
    configurable: true,
    hideable: def.table.hideable,
    reorderLocked: def.table.reorderLocked
  }
}

function createResourceFieldDefinition<
  TRead extends object,
  TCreate extends object,
  TUpdate extends object,
  TKey extends ResourceFieldKey<TRead, TCreate, TUpdate>
>(
  field: ResourceFieldConfigForKey<TRead, TCreate, TUpdate, TKey>
): ResourceFieldDefinition<TKey> {
  const form = normalizeFormConfig(field.form)
  const search = normalizeSearchConfig(field.search, form)

  return {
    key: field.key,
    label: field.label,
    table: normalizeTableConfig(field.table),
    form,
    search
  }
}

export function defineResourceFields<
  TRead extends object,
  TCreate extends object,
  TUpdate extends object
>(
  fields: readonly ResourceFieldConfigForKey<
    TRead,
    TCreate,
    TUpdate,
    ResourceFieldKey<TRead, TCreate, TUpdate>
  >[]
): readonly ResourceFieldDefinition<ResourceFieldKey<TRead, TCreate, TUpdate>>[] {
  return fields.map(field =>
    createResourceFieldDefinition<
      TRead,
      TCreate,
      TUpdate,
      ResourceFieldKey<TRead, TCreate, TUpdate>
    >(field)
  )
}

export function defineCrudFieldConfig<
  TField extends ResourceFieldDefinition,
  TCreate extends object = Record<string, unknown>,
  TUpdate extends object = Record<string, unknown>
>(options: {
  fields: readonly TField[]
  storageKey: string
  reorderLockedKeys?: string[]
  search?: {
    placeholder?: string
    quickPresets?: QuickSearchPreset[]
    favorites?: SearchFavorite[]
  }
  form?: {
    createSchema?: ZodType
    updateSchema?: ZodType
    title?: {
      create?: string
      edit?: string
    }
    width?: string
    submit?: CrudPageFormConfig<TCreate, TUpdate>['submit']
  }
}): CrudFieldConfigDefinition<TField, TCreate, TUpdate> {
  const defaultColumns = extractColumnConfigs(options.fields)
  const fieldConfig = extractFormFieldConfigs(options.fields)
  const searchFields = extractSearchFieldConfigs(options.fields)
  const columnMap = new Map<string, TableColumnConfig>(
    options.fields.flatMap(field => {
      if (!hasTableConfig(field)) {
        return []
      }

      return [[field.key, createTableColumn(field)] as [string, TableColumnConfig]]
    })
  )

  function createManager(): CrudPageColumnManager {
    const {
      columnConfig,
      updateConfig,
      updateColumnWidth
    } = useTableColumns({
      storageKey: options.storageKey,
      defaultColumns,
      reorderLockedKeys: options.reorderLockedKeys
    })

    function buildTableColumns(breakpoint: Parameters<CrudPageColumnManager['buildTableColumns']>[0]) {
      return buildTableColumnsByBreakpoint(columnConfig.value, breakpoint, columnMap)
    }

    return {
      columnConfig,
      updateConfig,
      updateColumnWidth,
      buildTableColumns
    }
  }

  return {
    fields: options.fields,
    table: {
      defaultColumns,
      createManager
    },
    form: {
      fieldConfig,
      createSchema: options.form?.createSchema,
      updateSchema: options.form?.updateSchema,
      title: options.form?.title,
      width: options.form?.width,
      submit: options.form?.submit
    },
    search: {
      fields: searchFields,
      placeholder: options.search?.placeholder,
      quickPresets: options.search?.quickPresets,
      favorites: options.search?.favorites
    }
  }
}
