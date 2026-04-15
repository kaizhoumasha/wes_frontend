// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/work_lines
 */
import { contractMethods } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'
import {
  type SoftDeleteCrudApiMethods,
  createSoftDeleteCrudRequestAdapterMethods,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
  type SoftDeleteCrudResourceCollectionPath,
} from '@/api/base/crud-request-adapter'

const WORK_LINES_COLLECTION_PATH = '/api/v1/workline/work_lines' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type WorkLinesItem = EnsureEntityId<CrudItem<typeof WORK_LINES_COLLECTION_PATH>>
export type CreateWorkLinesInput = CrudCreateInput<typeof WORK_LINES_COLLECTION_PATH>
export type UpdateWorkLinesInput = CrudUpdateInput<typeof WORK_LINES_COLLECTION_PATH>

const baseWorkLinesApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: WORK_LINES_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${WORK_LINES_COLLECTION_PATH}/{id}` as const,
  query: `${WORK_LINES_COLLECTION_PATH}/query` as const,
  restore: `${WORK_LINES_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${WORK_LINES_COLLECTION_PATH}/trash` as const,
  trashRestore: `${WORK_LINES_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${WORK_LINES_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApiMethods<WorkLinesItem, CreateWorkLinesInput, UpdateWorkLinesInput>

export const workLinesApiMethods = {
  ...baseWorkLinesApiMethods,
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
