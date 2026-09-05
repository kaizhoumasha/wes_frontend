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

export type ActiveObjectsResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/active-objects', 'get'>
export type ActiveObjectsPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/active-objects', 'get'>

export type AvailablePluginsResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/available-plugins', 'get'>
export type AvailablePluginsPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/available-plugins', 'get'>

export type ConfigurationResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/configuration', 'put'>
export type ConfigurationPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/configuration', 'put'>
export type ConfigurationInput = ContractRequestBody<'/api/v1/workline/work_lines/{id}/configuration', 'put'>

export type ConfigurationStatusResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/configuration-status', 'get'>
export type ConfigurationStatusPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/configuration-status', 'get'>

export type DeactivateResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/deactivate', 'post'>
export type DeactivatePathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/deactivate', 'post'>
export type DeactivateInput = ContractRequestBody<'/api/v1/workline/work_lines/{id}/deactivate', 'post'>

export type PermanentResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/permanent', 'delete'>
export type PermanentPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/permanent', 'delete'>

export type PlaneSceneResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/scene', 'get'>
export type PlaneScenePathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/scene', 'get'>

export type PlaneSnapshotResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>
export type PlaneSnapshotPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>

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

  /**
   * [biz:workline:active-objects] 查询作业线当前 active objects
   * @description 读取 WorklineActiveObjects；API 层不直接访问 repository。
   * @endpoint GET /api/v1/workline/work_lines/{id}/active-objects
   * @returns alova method instance
   */
  activeObjects(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/active-objects', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/active-objects', { params, config })
  },

  /**
   * [biz:workline:available-plugins] 查询可装配业务插件
   * @endpoint GET /api/v1/workline/work_lines/{id}/available-plugins
   * @returns alova method instance
   */
  availablePlugins(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/available-plugins', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/available-plugins', { params, config })
  },

  /**
   * [biz:workline:configure] 保存业务插件配置与设备全集
   * @description 在一个事务中替换插件配置和 Device 归属。
   * @endpoint PUT /api/v1/workline/work_lines/{id}/configuration
   * @returns alova method instance
   */
  configuration(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/configuration', 'put'>, body: ContractRequestBody<'/api/v1/workline/work_lines/{id}/configuration', 'put'>, config?: ContractRequestConfig) {
    return contractMethods.put('/api/v1/workline/work_lines/{id}/configuration', { params, body, config })
  },

  /**
   * [biz:workline:configuration-status] 查询作业线配置状态
   * @description 查询 WorkLine 启用前配置状态。
   * @endpoint GET /api/v1/workline/work_lines/{id}/configuration-status
   * @returns alova method instance
   */
  configurationStatus(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/configuration-status', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/configuration-status', { params, config })
  },

  /**
   * [biz:workline:deactivate] 停用作业线
   * @description 确认无未完成运行负载后停用 WorkLine。
   * @endpoint POST /api/v1/workline/work_lines/{id}/deactivate
   * @returns alova method instance
   */
  deactivate(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/deactivate', 'post'>, body: ContractRequestBody<'/api/v1/workline/work_lines/{id}/deactivate', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/work_lines/{id}/deactivate', { params, body, config })
  },

  /**
   * [biz:workline:permanent_delete] 永久删除WorkLine
   * @endpoint DELETE /api/v1/workline/work_lines/{id}/permanent
   * @returns alova method instance
   */
  permanent(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/permanent', 'delete'>, config?: ContractRequestConfig) {
    return contractMethods.delete('/api/v1/workline/work_lines/{id}/permanent', { params, config })
  },

  /**
   * [biz:workline:view-plane-scene] 获取作业线平面静态场景
   * @description 读取 WorkLine 平面态势静态 scene。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/scene
   * @returns alova method instance
   */
  planeScene(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/scene', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/scene', { params, config })
  },

  /**
   * [biz:workline:view-plane-snapshot] 获取作业线平面动态快照
   * @description 读取 WorkLine 平面态势动态 snapshot。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/snapshot
   * @returns alova method instance
   */
  planeSnapshot(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/snapshot', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
