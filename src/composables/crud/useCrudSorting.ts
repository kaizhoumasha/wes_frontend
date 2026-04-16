import { ref, type Ref } from 'vue'
import type { SortField } from '@/api/base/crud-request-adapter'
import type { TableSortOrder } from '@/components/ui/table/table.types'

export interface CrudSortChange {
  field: string
  sortKey?: string
  order: TableSortOrder
}

export interface CrudSortingState {
  sortState: Ref<SortField[] | null>
  resolveSortFields: (sort: CrudSortChange) => SortField[] | null
  handleSortChange: (sort: CrudSortChange, options: { isTrashMode: boolean; onSorted: () => Promise<void> }) => Promise<void>
}

export function useCrudSorting(defaultSort: SortField[] = []): CrudSortingState {
  const sortState = ref<SortField[] | null>(defaultSort.length > 0 ? [...defaultSort] : null)

  function resolveSortFields(sort: CrudSortChange): SortField[] | null {
    if (!sort.order) {
      return defaultSort.length > 0 ? [...defaultSort] : null
    }

    return [
      {
        field: sort.sortKey || sort.field,
        order: sort.order === 'descending' ? 'desc' : 'asc'
      }
    ]
  }

  async function handleSortChange(
    sort: CrudSortChange,
    options: { isTrashMode: boolean; onSorted: () => Promise<void> }
  ): Promise<void> {
    if (options.isTrashMode) {
      return
    }

    sortState.value = resolveSortFields(sort)
    await options.onSorted()
  }

  return {
    sortState,
    resolveSortFields,
    handleSortChange
  }
}
