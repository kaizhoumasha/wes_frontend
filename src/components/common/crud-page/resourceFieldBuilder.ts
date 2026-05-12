import type {
  CrudPageColumnManager,
  CrudPageFormConfig,
  CrudPageFormSubmitConfig
} from '@/components/common/crud-page/types'
import type {
  OpenApiEnumValue,
  OpenApiFieldMetadata,
  OpenApiSchemaMetadata
} from '@/api/generated/openapi-metadata'
import { createDateFormatter, createDateTimeFormatter } from '@/components/common/table/formatters'
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
import { getOperatorsForDataType, type SearchDataType, type SearchOperator } from '@/types/search'
import type { SearchFavorite, QuickSearchPreset, SearchFieldDef } from '@/types/search'
import type { TableColumnConfig } from '@/types/table'

export interface ResourceFieldDefinition<TKey extends string = string> extends UnifiedFieldConfig {
  key: TKey
}

export interface ResourceFieldFactsSource {
  readSchema?: OpenApiSchemaMetadata
  createSchema?: OpenApiSchemaMetadata
  updateSchema?: OpenApiSchemaMetadata
  labelOverrides?: Partial<Record<string, string>>
}

const DEFAULT_BOOLEAN_SEARCH_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false }
] satisfies NonNullable<SearchFieldDef['options']>

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

export interface CrudResourceFieldBundle<
  TField extends ResourceFieldDefinition = ResourceFieldDefinition,
  TCreate extends object = Record<string, unknown>,
  TUpdate extends object = Record<string, unknown>
> {
  fields: readonly TField[]
  fieldConfig: CrudFieldConfigDefinition<TField, TCreate, TUpdate>
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

export type ResourceFieldProjection<
  TKey extends string,
  TReadKey extends string,
  TWritableKey extends string
> = {
  key: TKey
  label?: string
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
> = ResourceFieldProjection<TKey, ContractKey<TRead>, WritableKey<TCreate, TUpdate>>

export function defineResourceFieldFactsSource(
  source: ResourceFieldFactsSource
): ResourceFieldFactsSource {
  return source
}

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

function getEnumValuesFromMetadata(
  metadata?: OpenApiFieldMetadata
): OpenApiEnumValue[] | undefined {
  if (metadata?.enum?.length) {
    return metadata.enum
  }

  if (metadata?.items?.enum?.length) {
    return metadata.items.enum
  }

  return undefined
}

function inferSearchDataTypeFromMetadata(metadata?: OpenApiFieldMetadata): SearchDataType {
  if (!metadata) {
    return 'text'
  }

  if (getEnumValuesFromMetadata(metadata)?.length) {
    return 'enum'
  }

  if (metadata.type === 'boolean') {
    return 'boolean'
  }

  if (metadata.type === 'integer' || metadata.type === 'number') {
    return 'number'
  }

  if (metadata.format === 'date' || metadata.format === 'date-time') {
    return 'date'
  }

  return 'text'
}

function inferFormConfigFromMetadata(
  form: ResourceFieldFormOptions | undefined,
  metadata: OpenApiFieldMetadata | undefined,
  label: string
): UnifiedFormConfig | undefined {
  if (!form) {
    return undefined
  }

  const enumValues = getEnumValuesFromMetadata(metadata)

  if (!metadata) {
    const normalizedForm = normalizeFormConfig(form)
    if (!normalizedForm) {
      return undefined
    }

    return withDefaultFormPlaceholder(normalizedForm, label, normalizedForm.type)
  }

  const resolvedType = form.type
    ?? (enumValues?.length
      ? 'select'
      : metadata.type === 'boolean'
        ? 'switch'
        : metadata.type === 'integer' || metadata.type === 'number'
          ? 'number'
          : metadata.format === 'date-time'
            ? 'datetime'
            : metadata.format === 'date'
              ? 'date'
              : 'input')

  const resolvedInputType = form.inputType
    ?? (resolvedType === 'input' && metadata.format === 'email' ? 'email' : undefined)

  const normalizedForm = normalizeFormConfig({
    ...form,
    type: resolvedType,
    inputType: resolvedInputType
  })
  if (!normalizedForm) {
    return undefined
  }

  // 如果是 select 类型且有枚举值，自动生成 options
  if (resolvedType === 'select' && enumValues?.length && !form.options) {
    // 过滤 null 值，只保留有效的枚举值
    const validEnumValues = enumValues.filter((v): v is Exclude<typeof v, null> => v !== null)
    const options = validEnumValues.map(value => ({
      label: String(value),
      value
    }))
    return withDefaultFormPlaceholder({ ...normalizedForm, options }, label, resolvedType)
  }

  return withDefaultFormPlaceholder(normalizedForm, label, resolvedType)
}

function withDefaultFormPlaceholder(
  form: UnifiedFormConfig,
  label: string,
  fieldType: FormFieldType
): UnifiedFormConfig {
  if (form.placeholder) {
    return form
  }

  const actionText = fieldType === 'select'
    || fieldType === 'remote-select'
    || fieldType === 'date'
    || fieldType === 'datetime'
    || fieldType === 'switch'
    || fieldType === 'checkbox'
    ? '请选择'
    : '请输入'

  return {
    ...form,
    placeholder: `${actionText}${label}`
  }
}

function resolveFieldLabelWithOverride(
  key: string,
  label: string | undefined,
  labelOverride: string | undefined,
  metadata: OpenApiFieldMetadata | undefined
): string {
  if (label) {
    return label
  }

  if (labelOverride) {
    return labelOverride
  }

  const conciseDescription = metadata?.description?.trim()
  if (conciseDescription && conciseDescription.length <= 20 && !/[，。,:：\n]/.test(conciseDescription)) {
    return conciseDescription
  }

  return metadata?.title?.trim() || key
}

function getFieldMetadata(
  schema: OpenApiSchemaMetadata | undefined,
  key: string
): OpenApiFieldMetadata | undefined {
  return schema?.fields[key]
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

function normalizeTableConfigWithMetadata(
  table: UnifiedTableConfig | undefined,
  metadata: OpenApiFieldMetadata | undefined
): UnifiedTableConfig | undefined {
  const normalizedTable = normalizeTableConfig(table)
  if (!normalizedTable || normalizedTable.formatter || normalizedTable.slots) {
    return normalizedTable
  }

  if (metadata?.format === 'date-time') {
    return {
      ...normalizedTable,
      formatter: createDateTimeFormatter()
    }
  }

  if (metadata?.format === 'date') {
    return {
      ...normalizedTable,
      formatter: createDateFormatter()
    }
  }

  return normalizedTable
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
  form: UnifiedFormConfig | undefined,
  metadata: OpenApiFieldMetadata | undefined,
  label: string
): UnifiedSearchConfig | undefined {
  if (!search) {
    return undefined
  }

  const enumValues = getEnumValuesFromMetadata(metadata)

  const inferredDataType = form
    ? inferSearchDataType(form)
    : inferSearchDataTypeFromMetadata(metadata)
  const defaultOperator = search.defaultOperator ?? getDefaultSearchOperator(inferredDataType)
  const quickOps = search.quickOps ?? getDefaultQuickSearchOperators(inferredDataType)
  const placeholder = search.placeholder ?? getDefaultSearchPlaceholder(inferredDataType, label)

  // 为枚举类型自动生成 options
  let searchOptions: SearchFieldDef['options']
  if (inferredDataType === 'boolean') {
    searchOptions = DEFAULT_BOOLEAN_SEARCH_OPTIONS
  } else if (inferredDataType === 'enum' && enumValues?.length) {
    searchOptions = enumValues.map(value => ({ label: String(value), value }))
  }

  return {
    dataType: inferredDataType,
    searchable: true,
    defaultOperator,
    quickOps,
    options: searchOptions,
    placeholder,
    ...search
  }
}

function getDefaultSearchOperator(dataType: SearchDataType): SearchOperator {
  if (dataType === 'text') {
    return 'contains'
  }

  return 'equals'
}

function getDefaultQuickSearchOperators(dataType: SearchDataType): SearchOperator[] {
  if (dataType === 'text') {
    return ['contains', 'equals', 'startsWith']
  }

  if (dataType === 'boolean') {
    return ['equals']
  }

  if (dataType === 'enum') {
    return ['equals', 'in']
  }

  if (dataType === 'number' || dataType === 'date') {
    return ['equals', 'gte', 'lte', 'between']
  }

  return getOperatorsForDataType(dataType)
}

function getDefaultSearchPlaceholder(dataType: SearchDataType, label: string): string {
  if (dataType === 'boolean' || dataType === 'enum' || dataType === 'date') {
    return `请选择${label}`
  }

  return `请输入${label}`
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
  field: ResourceFieldConfigForKey<TRead, TCreate, TUpdate, TKey>,
  metadata: ResourceFieldFactsSource | undefined,
  labelOverrides: Partial<Record<string, string>> | undefined
): ResourceFieldDefinition<TKey> {
  const readMetadata = getFieldMetadata(metadata?.readSchema, field.key)
  const createMetadata = getFieldMetadata(metadata?.createSchema, field.key)
  const updateMetadata = getFieldMetadata(metadata?.updateSchema, field.key)
  const mergedMetadata = readMetadata ?? createMetadata ?? updateMetadata
  const resolvedLabel = resolveFieldLabelWithOverride(
    field.key,
    field.label,
    labelOverrides?.[field.key],
    mergedMetadata
  )
  const formMetadata = createMetadata ?? updateMetadata ?? mergedMetadata
  const form = inferFormConfigFromMetadata(field.form, formMetadata, resolvedLabel)
  const search = normalizeSearchConfig(field.search, form, readMetadata ?? mergedMetadata, resolvedLabel)

  return {
    key: field.key,
    label: resolvedLabel,
    table: normalizeTableConfigWithMetadata(field.table, readMetadata ?? mergedMetadata),
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
  >[],
  metadataOptions?: ResourceFieldFactsSource
): readonly ResourceFieldDefinition<ResourceFieldKey<TRead, TCreate, TUpdate>>[] {
  const labelOverrides = metadataOptions?.labelOverrides

  return fields.map(field =>
    createResourceFieldDefinition<
      TRead,
      TCreate,
      TUpdate,
      ResourceFieldKey<TRead, TCreate, TUpdate>
    >(field, metadataOptions, labelOverrides)
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

export function defineCrudResourceFieldBundle<
  TRead extends object,
  TCreate extends object,
  TUpdate extends object
>(options: {
  backend?: ResourceFieldFactsSource
  fields: readonly ResourceFieldConfigForKey<
    TRead,
    TCreate,
    TUpdate,
    ResourceFieldKey<TRead, TCreate, TUpdate>
  >[]
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
}): CrudResourceFieldBundle<
  ResourceFieldDefinition<ResourceFieldKey<TRead, TCreate, TUpdate>>,
  TCreate,
  TUpdate
> {
  const fields = defineResourceFields<TRead, TCreate, TUpdate>(options.fields, options.backend)
  const fieldConfig = defineCrudFieldConfig<
    ResourceFieldDefinition<ResourceFieldKey<TRead, TCreate, TUpdate>>,
    TCreate,
    TUpdate
  >({
    fields,
    storageKey: options.storageKey,
    reorderLockedKeys: options.reorderLockedKeys,
    search: options.search,
    form: options.form
  })

  return {
    fields,
    fieldConfig
  }
}
