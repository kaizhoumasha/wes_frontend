/**
 * 作业线管理 API
 */

import {
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'

const WORKLINE_COLLECTION_PATH = '/api/v1/work_lines' satisfies SoftDeleteCrudResourceCollectionPath

export type WorkLine = CrudItem<typeof WORKLINE_COLLECTION_PATH>

export type CreateWorkLineInput = CrudCreateInput<typeof WORKLINE_COLLECTION_PATH>

export type UpdateWorkLineInput = CrudUpdateInput<typeof WORKLINE_COLLECTION_PATH>

export const workLineApi = createSoftDeleteCrudApi({
  collection: WORKLINE_COLLECTION_PATH,
  item: `${WORKLINE_COLLECTION_PATH}/{id}` as const,
  query: `${WORKLINE_COLLECTION_PATH}/query` as const,
  restore: `${WORKLINE_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${WORKLINE_COLLECTION_PATH}/trash` as const,
  trashRestore: `${WORKLINE_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${WORKLINE_COLLECTION_PATH}/trash/permanent` as const
})
