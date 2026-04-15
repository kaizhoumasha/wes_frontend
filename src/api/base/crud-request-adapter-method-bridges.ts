import { assertContractListResponse, toPaginationData } from '@/api/base/crud-request-adapter-helpers'
import {
  executeBatchDeleteMethods,
  executeMethod,
  type MethodLike,
} from '@/api/base/crud-request-adapter-method-helpers'
import type {
  BatchOperationResult,
  CrudApiMethods,
  CrudRequestAdapter,
  QueryOptionsInput,
  SoftDeleteCrudApiMethods,
  SoftDeleteCrudRequestAdapter,
} from '@/api/base/crud-request-adapter'

export function createCrudRequestAdapterFromMethods<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery = never,
  TQueryInput = QueryOptionsInput,
  TCreateResult = TItem,
  TUpdateResult = TItem,
  TDeleteQuery = never,
  TDeleteResult = unknown,
>(
  methods: CrudApiMethods<
    TItem,
    TCreate,
    TUpdate,
    TDetailQuery,
    TQueryInput,
    TCreateResult,
    TUpdateResult,
    TDeleteQuery,
    TDeleteResult
  >
): CrudRequestAdapter<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery,
  TQueryInput,
  TCreateResult,
  TUpdateResult,
  TDeleteQuery,
  TDeleteResult
> {
  return {
    async getById(id, options) {
      return await executeMethod<TItem>(methods.getById(id, options) as MethodLike<TItem>)
    },

    async query(options, config) {
      const response = await executeMethod(methods.query(options, config) as MethodLike<unknown>)
      assertContractListResponse<TItem>(response)
      return toPaginationData(response)
    },

    async create(data, config) {
      return await executeMethod<TCreateResult>(methods.create(data, config) as MethodLike<TCreateResult>)
    },

    async update(id, data, config) {
      return await executeMethod<TUpdateResult>(methods.update(id, data, config) as MethodLike<TUpdateResult>)
    },

    async delete(id, options) {
      return await executeMethod<TDeleteResult>(methods.delete(id, options) as MethodLike<TDeleteResult>)
    }
  }
}

export function createSoftDeleteCrudRequestAdapterFromMethods<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery = never,
  TQueryInput = QueryOptionsInput,
  TCreateResult = TItem,
  TUpdateResult = TItem,
  TDeleteQuery = never,
  TDeleteResult = unknown,
  TTrashQuery = { offset?: number; limit?: number },
  TRestoreResult = TItem,
  TBatchRestoreResult = BatchOperationResult,
  TBatchPermanentDeleteResult = BatchOperationResult,
  TBatchDeleteResult = BatchOperationResult,
>(
  methods: SoftDeleteCrudApiMethods<
    TItem,
    TCreate,
    TUpdate,
    TDetailQuery,
    TQueryInput,
    TCreateResult,
    TUpdateResult,
    TDeleteQuery,
    TDeleteResult,
    TTrashQuery,
    TRestoreResult,
    TBatchRestoreResult,
    TBatchPermanentDeleteResult,
    TBatchDeleteResult
  >
): SoftDeleteCrudRequestAdapter<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery,
  TQueryInput,
  TCreateResult,
  TUpdateResult,
  TDeleteQuery,
  TDeleteResult,
  TTrashQuery,
  TRestoreResult,
  TBatchRestoreResult,
  TBatchPermanentDeleteResult,
  TBatchDeleteResult
> {
  const baseRequestAdapter: CrudRequestAdapter<
    TItem,
    TCreate,
    TUpdate,
    TDetailQuery,
    TQueryInput,
    TCreateResult,
    TUpdateResult,
    TDeleteQuery,
    TDeleteResult
  > = createCrudRequestAdapterFromMethods<
    TItem,
    TCreate,
    TUpdate,
    TDetailQuery,
    TQueryInput,
    TCreateResult,
    TUpdateResult,
    TDeleteQuery,
    TDeleteResult
  >(methods)

  return {
    ...baseRequestAdapter,

    async getTrash(options, config) {
      const response = await executeMethod(methods.getTrash(options, config) as MethodLike<unknown>)
      assertContractListResponse<TItem>(response)
      return toPaginationData(response)
    },

    async restore(id, config) {
      return await executeMethod<TRestoreResult>(methods.restore(id, config) as MethodLike<TRestoreResult>)
    },

    async permanentDelete(id, config) {
      return await executeMethod<TDeleteResult>(methods.permanentDelete(id, config) as MethodLike<TDeleteResult>)
    },

    async batchDelete(ids, config) {
      const result = methods.batchDelete(ids, config)
      if (Array.isArray(result)) {
        return await executeBatchDeleteMethods(result, ids.length) as TBatchDeleteResult
      }

      return await executeMethod<TBatchDeleteResult>(result as MethodLike<TBatchDeleteResult>)
    },

    async batchRestore(ids, config) {
      return await executeMethod<TBatchRestoreResult>(methods.batchRestore(ids, config) as MethodLike<TBatchRestoreResult>)
    },

    async batchPermanentDelete(ids, config) {
      return await executeMethod<TBatchPermanentDeleteResult>(
        methods.batchPermanentDelete(ids, config) as MethodLike<TBatchPermanentDeleteResult>
      )
    }
  }
}
