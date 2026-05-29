// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/resource/bin-cell-occupancies, /api/v1/resource/bin-content-snapshot-items, /api/v1/resource/bin-content-snapshots, /api/v1/resource/bin-material-mounts, /api/v1/resource/bin-slot-templates, /api/v1/resource/bin-types, /api/v1/resource/bins, /api/v1/resource/rack-bin-mounts, /api/v1/resource/rack-placements, /api/v1/resource/rack-slot-templates, /api/v1/resource/rack-types, /api/v1/resource/racks, /api/v1/resource/state-events
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

export type GetByIdResult = ContractResponseData<'/api/v1/resource/bin-cell-occupancies/{id}', 'get'>
export type GetByIdPathParams = ContractPathParams<'/api/v1/resource/bin-cell-occupancies/{id}', 'get'>
export type GetByIdQuery = ContractQueryParams<'/api/v1/resource/bin-cell-occupancies/{id}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/resource/bin-cell-occupancies/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/resource/bin-cell-occupancies/query', 'post'>

export type GetGetByIdResult = ContractResponseData<'/api/v1/resource/bin-content-snapshot-items/{id}', 'get'>
export type GetGetByIdPathParams = ContractPathParams<'/api/v1/resource/bin-content-snapshot-items/{id}', 'get'>
export type GetGetByIdQuery = ContractQueryParams<'/api/v1/resource/bin-content-snapshot-items/{id}', 'get'>

export type CreateQueryResult = ContractResponseData<'/api/v1/resource/bin-content-snapshot-items/query', 'post'>
export type CreateQueryInput = ContractRequestBody<'/api/v1/resource/bin-content-snapshot-items/query', 'post'>

export type GetGetById2Result = ContractResponseData<'/api/v1/resource/bin-content-snapshots/{id}', 'get'>
export type GetGetById2PathParams = ContractPathParams<'/api/v1/resource/bin-content-snapshots/{id}', 'get'>
export type GetGetById2Query = ContractQueryParams<'/api/v1/resource/bin-content-snapshots/{id}', 'get'>

export type CreateQuery2Result = ContractResponseData<'/api/v1/resource/bin-content-snapshots/query', 'post'>
export type CreateQuery2Input = ContractRequestBody<'/api/v1/resource/bin-content-snapshots/query', 'post'>

export type GetGetById3Result = ContractResponseData<'/api/v1/resource/bin-material-mounts/{id}', 'get'>
export type GetGetById3PathParams = ContractPathParams<'/api/v1/resource/bin-material-mounts/{id}', 'get'>
export type GetGetById3Query = ContractQueryParams<'/api/v1/resource/bin-material-mounts/{id}', 'get'>

export type CreateQuery3Result = ContractResponseData<'/api/v1/resource/bin-material-mounts/query', 'post'>
export type CreateQuery3Input = ContractRequestBody<'/api/v1/resource/bin-material-mounts/query', 'post'>

export type GetGetById4Result = ContractResponseData<'/api/v1/resource/bin-slot-templates/{id}', 'get'>
export type GetGetById4PathParams = ContractPathParams<'/api/v1/resource/bin-slot-templates/{id}', 'get'>
export type GetGetById4Query = ContractQueryParams<'/api/v1/resource/bin-slot-templates/{id}', 'get'>

export type CreateQuery4Result = ContractResponseData<'/api/v1/resource/bin-slot-templates/query', 'post'>
export type CreateQuery4Input = ContractRequestBody<'/api/v1/resource/bin-slot-templates/query', 'post'>

export type GetGetById5Result = ContractResponseData<'/api/v1/resource/bin-types/{id}', 'get'>
export type GetGetById5PathParams = ContractPathParams<'/api/v1/resource/bin-types/{id}', 'get'>
export type GetGetById5Query = ContractQueryParams<'/api/v1/resource/bin-types/{id}', 'get'>

export type CreateQuery5Result = ContractResponseData<'/api/v1/resource/bin-types/query', 'post'>
export type CreateQuery5Input = ContractRequestBody<'/api/v1/resource/bin-types/query', 'post'>

export type GetGetById6Result = ContractResponseData<'/api/v1/resource/bins/{id}', 'get'>
export type GetGetById6PathParams = ContractPathParams<'/api/v1/resource/bins/{id}', 'get'>
export type GetGetById6Query = ContractQueryParams<'/api/v1/resource/bins/{id}', 'get'>

export type CreateQuery6Result = ContractResponseData<'/api/v1/resource/bins/query', 'post'>
export type CreateQuery6Input = ContractRequestBody<'/api/v1/resource/bins/query', 'post'>

export type GetGetById7Result = ContractResponseData<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>
export type GetGetById7PathParams = ContractPathParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>
export type GetGetById7Query = ContractQueryParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>

export type CreateQuery7Result = ContractResponseData<'/api/v1/resource/rack-bin-mounts/query', 'post'>
export type CreateQuery7Input = ContractRequestBody<'/api/v1/resource/rack-bin-mounts/query', 'post'>

export type GetGetById8Result = ContractResponseData<'/api/v1/resource/rack-placements/{id}', 'get'>
export type GetGetById8PathParams = ContractPathParams<'/api/v1/resource/rack-placements/{id}', 'get'>
export type GetGetById8Query = ContractQueryParams<'/api/v1/resource/rack-placements/{id}', 'get'>

export type CreateQuery8Result = ContractResponseData<'/api/v1/resource/rack-placements/query', 'post'>
export type CreateQuery8Input = ContractRequestBody<'/api/v1/resource/rack-placements/query', 'post'>

export type GetGetById9Result = ContractResponseData<'/api/v1/resource/rack-slot-templates/{id}', 'get'>
export type GetGetById9PathParams = ContractPathParams<'/api/v1/resource/rack-slot-templates/{id}', 'get'>
export type GetGetById9Query = ContractQueryParams<'/api/v1/resource/rack-slot-templates/{id}', 'get'>

export type CreateQuery9Result = ContractResponseData<'/api/v1/resource/rack-slot-templates/query', 'post'>
export type CreateQuery9Input = ContractRequestBody<'/api/v1/resource/rack-slot-templates/query', 'post'>

export type GetGetById10Result = ContractResponseData<'/api/v1/resource/rack-types/{id}', 'get'>
export type GetGetById10PathParams = ContractPathParams<'/api/v1/resource/rack-types/{id}', 'get'>
export type GetGetById10Query = ContractQueryParams<'/api/v1/resource/rack-types/{id}', 'get'>

export type CreateQuery10Result = ContractResponseData<'/api/v1/resource/rack-types/query', 'post'>
export type CreateQuery10Input = ContractRequestBody<'/api/v1/resource/rack-types/query', 'post'>

export type GetGetById11Result = ContractResponseData<'/api/v1/resource/racks/{id}', 'get'>
export type GetGetById11PathParams = ContractPathParams<'/api/v1/resource/racks/{id}', 'get'>
export type GetGetById11Query = ContractQueryParams<'/api/v1/resource/racks/{id}', 'get'>

export type CreateQuery11Result = ContractResponseData<'/api/v1/resource/racks/query', 'post'>
export type CreateQuery11Input = ContractRequestBody<'/api/v1/resource/racks/query', 'post'>

export type GetGetById12Result = ContractResponseData<'/api/v1/resource/state-events/{id}', 'get'>
export type GetGetById12PathParams = ContractPathParams<'/api/v1/resource/state-events/{id}', 'get'>
export type GetGetById12Query = ContractQueryParams<'/api/v1/resource/state-events/{id}', 'get'>

export type CreateQuery12Result = ContractResponseData<'/api/v1/resource/state-events/query', 'post'>
export type CreateQuery12Input = ContractRequestBody<'/api/v1/resource/state-events/query', 'post'>

export const resourceApiMethods = {
  /**
   * [resource:bincelloccupancy:detail] 获取BinCellOccupancy
   * @endpoint GET /api/v1/resource/bin-cell-occupancies/{id}
   * @returns alova method instance
   */
  getById(params: ContractPathParams<'/api/v1/resource/bin-cell-occupancies/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-cell-occupancies/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-cell-occupancies/{id}', { params, query, config })
  },

  /**
   * [resource:bincelloccupancy:list] 获取BinCellOccupancy列表
   * @endpoint POST /api/v1/resource/bin-cell-occupancies/query
   * @returns alova method instance
   */
  query(body: ContractRequestBody<'/api/v1/resource/bin-cell-occupancies/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-cell-occupancies/query', { body, config })
  },

  /**
   * [resource:bincontentsnapshotitem:detail] 获取BinContentSnapshotItem
   * @endpoint GET /api/v1/resource/bin-content-snapshot-items/{id}
   * @returns alova method instance
   */
  getGetById(params: ContractPathParams<'/api/v1/resource/bin-content-snapshot-items/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-content-snapshot-items/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-content-snapshot-items/{id}', { params, query, config })
  },

  /**
   * [resource:bincontentsnapshotitem:list] 获取BinContentSnapshotItem列表
   * @endpoint POST /api/v1/resource/bin-content-snapshot-items/query
   * @returns alova method instance
   */
  createQuery(body: ContractRequestBody<'/api/v1/resource/bin-content-snapshot-items/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-content-snapshot-items/query', { body, config })
  },

  /**
   * [resource:bincontentsnapshot:detail] 获取BinContentSnapshot
   * @endpoint GET /api/v1/resource/bin-content-snapshots/{id}
   * @returns alova method instance
   */
  getGetById2(params: ContractPathParams<'/api/v1/resource/bin-content-snapshots/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-content-snapshots/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-content-snapshots/{id}', { params, query, config })
  },

  /**
   * [resource:bincontentsnapshot:list] 获取BinContentSnapshot列表
   * @endpoint POST /api/v1/resource/bin-content-snapshots/query
   * @returns alova method instance
   */
  createQuery2(body: ContractRequestBody<'/api/v1/resource/bin-content-snapshots/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-content-snapshots/query', { body, config })
  },

  /**
   * [resource:binmaterialmount:detail] 获取BinMaterialMount
   * @endpoint GET /api/v1/resource/bin-material-mounts/{id}
   * @returns alova method instance
   */
  getGetById3(params: ContractPathParams<'/api/v1/resource/bin-material-mounts/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-material-mounts/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-material-mounts/{id}', { params, query, config })
  },

  /**
   * [resource:binmaterialmount:list] 获取BinMaterialMount列表
   * @endpoint POST /api/v1/resource/bin-material-mounts/query
   * @returns alova method instance
   */
  createQuery3(body: ContractRequestBody<'/api/v1/resource/bin-material-mounts/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-material-mounts/query', { body, config })
  },

  /**
   * [resource:binslottemplate:detail] 获取BinSlotTemplate
   * @endpoint GET /api/v1/resource/bin-slot-templates/{id}
   * @returns alova method instance
   */
  getGetById4(params: ContractPathParams<'/api/v1/resource/bin-slot-templates/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-slot-templates/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-slot-templates/{id}', { params, query, config })
  },

  /**
   * [resource:binslottemplate:list] 获取BinSlotTemplate列表
   * @endpoint POST /api/v1/resource/bin-slot-templates/query
   * @returns alova method instance
   */
  createQuery4(body: ContractRequestBody<'/api/v1/resource/bin-slot-templates/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-slot-templates/query', { body, config })
  },

  /**
   * [resource:bintype:detail] 获取BinType
   * @endpoint GET /api/v1/resource/bin-types/{id}
   * @returns alova method instance
   */
  getGetById5(params: ContractPathParams<'/api/v1/resource/bin-types/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bin-types/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bin-types/{id}', { params, query, config })
  },

  /**
   * [resource:bintype:list] 获取BinType列表
   * @endpoint POST /api/v1/resource/bin-types/query
   * @returns alova method instance
   */
  createQuery5(body: ContractRequestBody<'/api/v1/resource/bin-types/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bin-types/query', { body, config })
  },

  /**
   * [resource:bin:detail] 获取Bin
   * @endpoint GET /api/v1/resource/bins/{id}
   * @returns alova method instance
   */
  getGetById6(params: ContractPathParams<'/api/v1/resource/bins/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bins/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bins/{id}', { params, query, config })
  },

  /**
   * [resource:bin:list] 获取Bin列表
   * @endpoint POST /api/v1/resource/bins/query
   * @returns alova method instance
   */
  createQuery6(body: ContractRequestBody<'/api/v1/resource/bins/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bins/query', { body, config })
  },

  /**
   * [resource:rackbinmount:detail] 获取RackBinMount
   * @endpoint GET /api/v1/resource/rack-bin-mounts/{id}
   * @returns alova method instance
   */
  getGetById7(params: ContractPathParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/rack-bin-mounts/{id}', { params, query, config })
  },

  /**
   * [resource:rackbinmount:list] 获取RackBinMount列表
   * @endpoint POST /api/v1/resource/rack-bin-mounts/query
   * @returns alova method instance
   */
  createQuery7(body: ContractRequestBody<'/api/v1/resource/rack-bin-mounts/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/rack-bin-mounts/query', { body, config })
  },

  /**
   * [resource:rackplacement:detail] 获取RackPlacement
   * @endpoint GET /api/v1/resource/rack-placements/{id}
   * @returns alova method instance
   */
  getGetById8(params: ContractPathParams<'/api/v1/resource/rack-placements/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/rack-placements/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/rack-placements/{id}', { params, query, config })
  },

  /**
   * [resource:rackplacement:list] 获取RackPlacement列表
   * @endpoint POST /api/v1/resource/rack-placements/query
   * @returns alova method instance
   */
  createQuery8(body: ContractRequestBody<'/api/v1/resource/rack-placements/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/rack-placements/query', { body, config })
  },

  /**
   * [resource:rackslottemplate:detail] 获取RackSlotTemplate
   * @endpoint GET /api/v1/resource/rack-slot-templates/{id}
   * @returns alova method instance
   */
  getGetById9(params: ContractPathParams<'/api/v1/resource/rack-slot-templates/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/rack-slot-templates/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/rack-slot-templates/{id}', { params, query, config })
  },

  /**
   * [resource:rackslottemplate:list] 获取RackSlotTemplate列表
   * @endpoint POST /api/v1/resource/rack-slot-templates/query
   * @returns alova method instance
   */
  createQuery9(body: ContractRequestBody<'/api/v1/resource/rack-slot-templates/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/rack-slot-templates/query', { body, config })
  },

  /**
   * [resource:racktype:detail] 获取RackType
   * @endpoint GET /api/v1/resource/rack-types/{id}
   * @returns alova method instance
   */
  getGetById10(params: ContractPathParams<'/api/v1/resource/rack-types/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/rack-types/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/rack-types/{id}', { params, query, config })
  },

  /**
   * [resource:racktype:list] 获取RackType列表
   * @endpoint POST /api/v1/resource/rack-types/query
   * @returns alova method instance
   */
  createQuery10(body: ContractRequestBody<'/api/v1/resource/rack-types/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/rack-types/query', { body, config })
  },

  /**
   * [resource:rack:detail] 获取Rack
   * @endpoint GET /api/v1/resource/racks/{id}
   * @returns alova method instance
   */
  getGetById11(params: ContractPathParams<'/api/v1/resource/racks/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/racks/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/racks/{id}', { params, query, config })
  },

  /**
   * [resource:rack:list] 获取Rack列表
   * @endpoint POST /api/v1/resource/racks/query
   * @returns alova method instance
   */
  createQuery11(body: ContractRequestBody<'/api/v1/resource/racks/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/racks/query', { body, config })
  },

  /**
   * [resource:resourcestateevent:detail] 获取ResourceStateEvent
   * @endpoint GET /api/v1/resource/state-events/{id}
   * @returns alova method instance
   */
  getGetById12(params: ContractPathParams<'/api/v1/resource/state-events/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/state-events/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/state-events/{id}', { params, query, config })
  },

  /**
   * [resource:resourcestateevent:list] 获取ResourceStateEvent列表
   * @endpoint POST /api/v1/resource/state-events/query
   * @returns alova method instance
   */
  createQuery12(body: ContractRequestBody<'/api/v1/resource/state-events/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/state-events/query', { body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
