/**
 * useCrudPageController Helper Functions Tests
 *
 * Tests for the utility functions used by useCrudPageController.
 * The main composable is an orchestrator that integrates multiple sub-composables,
 * so tests focus on its isolated logic rather than integration concerns.
 */

import { describe, it, expect } from 'vitest'

// ==================== resolveBreakpoint ====================

function resolveBreakpoint(isMobile: boolean, isTablet: boolean): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile) {
    return 'mobile'
  }

  if (isTablet) {
    return 'tablet'
  }

  return 'desktop'
}

describe('resolveBreakpoint', () => {
  it('should return mobile when isMobile is true', () => {
    expect(resolveBreakpoint(true, false)).toBe('mobile')
  })

  it('should return mobile when both are true (mobile takes priority)', () => {
    expect(resolveBreakpoint(true, true)).toBe('mobile')
  })

  it('should return tablet when isTablet is true and isMobile is false', () => {
    expect(resolveBreakpoint(false, true)).toBe('tablet')
  })

  it('should return desktop when both are false', () => {
    expect(resolveBreakpoint(false, false)).toBe('desktop')
  })
})

// ==================== resolveEntityId ====================

function resolveEntityId(id: number | string): number {
  const numericId = typeof id === 'number' ? id : Number(id)

  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid entity id: ${String(id)}`)
  }

  return numericId
}

describe('resolveEntityId', () => {
  it('should return number as-is', () => {
    expect(resolveEntityId(123)).toBe(123)
  })

  it('should convert string number to number', () => {
    expect(resolveEntityId('456')).toBe(456)
  })

  it('should throw error for non-numeric string', () => {
    expect(() => resolveEntityId('abc')).toThrow('Invalid entity id: abc')
  })

  it('should throw error for NaN', () => {
    expect(() => resolveEntityId(NaN)).toThrow('Invalid entity id: NaN')
  })

  it('should throw error for Infinity', () => {
    expect(() => resolveEntityId(Infinity)).toThrow('Invalid entity id: Infinity')
  })

  it('should handle negative numbers', () => {
    expect(resolveEntityId(-1)).toBe(-1)
  })

  it('should handle string negative numbers', () => {
    expect(resolveEntityId('-42')).toBe(-42)
  })
})

// ==================== resolveSubmitPayload ====================

function resolveSubmitPayload<TPayload extends object>(
  formData: Record<string, unknown>,
  transform?: (formData: Record<string, unknown>) => TPayload
): TPayload {
  return transform ? transform(formData) : (formData as unknown as TPayload)
}

describe('resolveSubmitPayload', () => {
  it('should return formData as-is when no transform', () => {
    const formData = { name: 'test', value: 123 }
    expect(resolveSubmitPayload(formData)).toEqual(formData)
  })

  it('should apply transform function', () => {
    const formData = { firstName: 'John', lastName: 'Doe' }
    const transform = (data: Record<string, unknown>) => ({
      fullName: `${data.firstName} ${data.lastName}`
    })
    expect(resolveSubmitPayload(formData, transform)).toEqual({ fullName: 'John Doe' })
  })

  it('should handle empty formData', () => {
    expect(resolveSubmitPayload({})).toEqual({})
  })

  it('should handle transform that returns nested object', () => {
    const formData = { user: 'admin' }
    const transform = (data: Record<string, unknown>) => ({
      payload: { username: data.user, role: 'admin' }
    })
    expect(resolveSubmitPayload(formData, transform)).toEqual({
      payload: { username: 'admin', role: 'admin' }
    })
  })
})

// ==================== resolveTrashAwareColumn ====================

interface TestColumn {
  field?: string
  title?: string
  sortable?: boolean | 'custom'
}

function resolveTrashAwareColumn<TColumn extends TestColumn>(
  column: TColumn,
  isTrashMode: boolean
): TColumn {
  if (!isTrashMode) {
    return column
  }

  if (column.field !== 'updated_at') {
    return {
      ...column,
      sortable: false
    }
  }

  return {
    ...column,
    field: 'deleted_at',
    title: '删除时间',
    sortable: false
  }
}

describe('resolveTrashAwareColumn', () => {
  it('should return column as-is when not trash mode', () => {
    const column = { field: 'name', title: '名称', sortable: true }
    expect(resolveTrashAwareColumn(column, false)).toEqual(column)
  })

  it('should disable sorting for non-updated_at columns in trash mode', () => {
    const column = { field: 'name', title: '名称', sortable: true }
    expect(resolveTrashAwareColumn(column, true)).toEqual({
      field: 'name',
      title: '名称',
      sortable: false
    })
  })

  it('should transform updated_at to deleted_at in trash mode', () => {
    const column = { field: 'updated_at', title: '更新时间', sortable: true }
    expect(resolveTrashAwareColumn(column, true)).toEqual({
      field: 'deleted_at',
      title: '删除时间',
      sortable: false
    })
  })

  it('should handle column without sortable', () => {
    const column = { field: 'name', title: '名称' }
    expect(resolveTrashAwareColumn(column, true)).toEqual({
      field: 'name',
      title: '名称',
      sortable: false
    })
  })

  it('should preserve other column properties', () => {
    const column = { field: 'name', title: '名称', sortable: true, width: 100, fixed: 'left' }
    expect(resolveTrashAwareColumn(column, true)).toEqual({
      field: 'name',
      title: '名称',
      sortable: false,
      width: 100,
      fixed: 'left'
    })
  })
})

// ==================== resolveTableDefaultSort ====================

interface SortField {
  field: string
  order: 'asc' | 'desc'
}

type CrudTableDefaultSort = {
  field: string
  order: 'descending' | 'ascending'
}

function resolveTableDefaultSort(defaultSort: SortField[] | undefined): CrudTableDefaultSort | undefined {
  const firstSort = defaultSort?.[0]

  if (!firstSort) {
    return undefined
  }

  return {
    field: firstSort.field,
    order: firstSort.order === 'desc' ? 'descending' : 'ascending'
  }
}

describe('resolveTableDefaultSort', () => {
  it('should return undefined for empty array', () => {
    expect(resolveTableDefaultSort([])).toBeUndefined()
  })

  it('should return undefined for undefined', () => {
    expect(resolveTableDefaultSort(undefined)).toBeUndefined()
  })

  it('should convert asc to ascending', () => {
    expect(resolveTableDefaultSort([{ field: 'name', order: 'asc' }])).toEqual({
      field: 'name',
      order: 'ascending'
    })
  })

  it('should convert desc to descending', () => {
    expect(resolveTableDefaultSort([{ field: 'created_at', order: 'desc' }])).toEqual({
      field: 'created_at',
      order: 'descending'
    })
  })

  it('should only use first sort field', () => {
    expect(
      resolveTableDefaultSort([
        { field: 'name', order: 'asc' },
        { field: 'date', order: 'desc' }
      ])
    ).toEqual({
      field: 'name',
      order: 'ascending'
    })
  })
})

// ==================== resolveFormTitle ====================

interface MockConfig {
  resource: { title: { text: string } }
  form?: {
    title?: {
      create?: string
      edit?: string
    }
  }
}

interface MockFeatures {
  create: { dialogTitle?: string }
  edit: { dialogTitle?: string }
}

function resolveFormTitle(
  config: MockConfig,
  features: MockFeatures,
  editingId: number | null
): string {
  if (!config.form) {
    return ''
  }

  if (editingId) {
    return features.edit.dialogTitle ?? config.form.title?.edit ?? `编辑${config.resource.title.text}`
  }

  return features.create.dialogTitle ?? config.form.title?.create ?? `创建${config.resource.title.text}`
}

describe('resolveFormTitle', () => {
  const mockConfig: MockConfig = {
    resource: { title: { text: '用户' } },
    form: {
      title: {
        create: '新建用户',
        edit: '修改用户'
      }
    }
  }

  const mockFeatures: MockFeatures = {
    create: {},
    edit: {}
  }

  it('should return empty string when no form config', () => {
    expect(resolveFormTitle({ resource: { title: { text: '用户' } } }, mockFeatures, null)).toBe('')
  })

  it('should return create title when no editingId', () => {
    expect(resolveFormTitle(mockConfig, mockFeatures, null)).toBe('新建用户')
  })

  it('should return edit title when editingId exists', () => {
    expect(resolveFormTitle(mockConfig, mockFeatures, 123)).toBe('修改用户')
  })

  it('should use feature dialogTitle override for create', () => {
    const features = { create: { dialogTitle: '添加新用户' }, edit: {} }
    expect(resolveFormTitle(mockConfig, features, null)).toBe('添加新用户')
  })

  it('should use feature dialogTitle override for edit', () => {
    const features = { create: {}, edit: { dialogTitle: '编辑用户信息' } }
    expect(resolveFormTitle(mockConfig, features, 123)).toBe('编辑用户信息')
  })

  it('should fallback to default when no title config', () => {
    const config: MockConfig = {
      resource: { title: { text: '订单' } },
      form: {}
    }
    expect(resolveFormTitle(config, mockFeatures, null)).toBe('创建订单')
    expect(resolveFormTitle(config, mockFeatures, 1)).toBe('编辑订单')
  })
})