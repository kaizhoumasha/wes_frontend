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

export type ActiveObjectsV2Result = ContractResponseData<'/api/v1/workline/work_lines/{id}/active-objects/v2', 'get'>
export type ActiveObjectsV2PathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/active-objects/v2', 'get'>

export type ArchiveOpenWorkResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/archive-open-work', 'post'>
export type ArchiveOpenWorkPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/archive-open-work', 'post'>
export type ArchiveOpenWorkInput = ContractRequestBody<'/api/v1/workline/work_lines/{id}/archive-open-work', 'post'>

export type AvailablePluginsResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/available-plugins', 'get'>
export type AvailablePluginsPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/available-plugins', 'get'>

export type BaseConfigurationResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/base-configuration', 'get'>
export type BaseConfigurationPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/base-configuration', 'get'>

export type UpdateBaseConfigurationResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/base-configuration', 'put'>
export type UpdateBaseConfigurationPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/base-configuration', 'put'>
export type UpdateBaseConfigurationInput = ContractRequestBody<'/api/v1/workline/work_lines/{id}/base-configuration', 'put'>

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

export type PlaneCurrentTaskV2Result = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/current-task/v2', 'get'>
export type PlaneCurrentTaskV2PathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/current-task/v2', 'get'>

export type PlaneSceneResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/scene', 'get'>
export type PlaneScenePathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/scene', 'get'>

export type PlaneSceneV2Result = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/scene/v2', 'get'>
export type PlaneSceneV2PathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/scene/v2', 'get'>

export type PlaneSnapshotResult = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>
export type PlaneSnapshotPathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>

export type PlaneSnapshotV2Result = ContractResponseData<'/api/v1/workline/work_lines/{id}/plane/snapshot/v2', 'get'>
export type PlaneSnapshotV2PathParams = ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot/v2', 'get'>

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
   * [biz:workline:active-objects] 查询作业线当前 active objects v2（含 scene_revision 与 resource_ref）
   * @description 读取 Active Objects v2；与 v1 并存，互不改变语义。
   * @endpoint GET /api/v1/workline/work_lines/{id}/active-objects/v2
   * @returns alova method instance
   */
  activeObjectsV2(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/active-objects/v2', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/active-objects/v2', { params, config })
  },

  /**
   * [biz:workline:archive-open-work] 一键归档当前及未闭合任务
   * @description 原子归档本线业务任务；设备命令、搬运与 Evidence 保持原身份。
   * @endpoint POST /api/v1/workline/work_lines/{id}/archive-open-work
   * @returns alova method instance
   */
  archiveOpenWork(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/archive-open-work', 'post'>, body: ContractRequestBody<'/api/v1/workline/work_lines/{id}/archive-open-work', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/work_lines/{id}/archive-open-work', { params, body, config })
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
   * [biz:workline:base-configuration] 查询工作线基础配置
   * @endpoint GET /api/v1/workline/work_lines/{id}/base-configuration
   * @returns alova method instance
   */
  baseConfiguration(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/base-configuration', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/base-configuration', { params, config })
  },

  /**
   * [biz:workline:configure-base] 保存工作位与物理设备基础配置
   * @endpoint PUT /api/v1/workline/work_lines/{id}/base-configuration
   * @returns alova method instance
   */
  updateBaseConfiguration(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/base-configuration', 'put'>, body: ContractRequestBody<'/api/v1/workline/work_lines/{id}/base-configuration', 'put'>, config?: ContractRequestConfig) {
    return contractMethods.put('/api/v1/workline/work_lines/{id}/base-configuration', { params, body, config })
  },

  /**
   * [biz:workline:configure] 保存业务插件关联与角色配置
   * @description 仅替换插件关联，保持工作位和物理设备归属。
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
   * [biz:workline:view-plane-snapshot] 获取作业线当前 PickingTask v2
   * @description 按需读取 WorkLine 当前任务；失败沿用标准 API 错误语义。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/current-task/v2
   * @returns alova method instance
   */
  planeCurrentTaskV2(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/current-task/v2', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/current-task/v2', { params, config })
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
   * [biz:workline:view-plane-scene] 获取作业线平面场景 v2（资源分组 + 绑定状态）
   * @description 读取 WorkLine 平面态势 scene v2；与 plane.scene.v1 并存，互不改变语义。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/scene/v2
   * @returns alova method instance
   */
  planeSceneV2(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/scene/v2', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/scene/v2', { params, config })
  },

  /**
   * [biz:workline:view-plane-snapshot] 获取作业线平面动态快照
   * @description 读取 WorkLine 平面态势动态 snapshot。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/snapshot
   * @returns alova method instance
   */
  planeSnapshot(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/snapshot', { params, config })
  },

  /**
   * [biz:workline:view-plane-snapshot] 获取作业线平面快照 v2（按资源聚合活动状态）
   * @description 读取 WorkLine 平面态势 snapshot v2；与 plane.snapshot.v1 并存，互不改变语义。
   * @endpoint GET /api/v1/workline/work_lines/{id}/plane/snapshot/v2
   * @returns alova method instance
   */
  planeSnapshotV2(params: ContractPathParams<'/api/v1/workline/work_lines/{id}/plane/snapshot/v2', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/work_lines/{id}/plane/snapshot/v2', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
