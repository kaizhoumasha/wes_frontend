/**
 * 自动生成的 API 客户端
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新客户端: pnpm type:generate
 */

import { contractClient } from '@/api/contract/client'
import type { ContractRequestConfig, ContractResponseData } from '@/api/contract/types'
import type { paths } from './openapi-types'

/**
 * auth 资源 - 自动生成的 API 客户端
 * @base /api/v1/auth
 */
export const authGeneratedApi = {
  /**
   * 用户登录
   * @description 用户登录

返回访问令牌和刷新令牌元数据。刷新令牌仅存储在 HttpOnly Cookie 中。

- **username**: 用户名（3-50字符）
- **password**: 密码（6-100字符）

**安全特性**：
- 使用 Argon2 密码哈希
- JWT 包含标准声明（iss, sub, jti, iat, nbf, exp）
- Refresh Token 存储在 HttpOnly Cookie 中
- 支持 JTI（JWT ID）用于精确撤销
   * @endpoint POST /api/v1/auth/login
   */
  async login(body: paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/login', 'post'>> {
    return await contractClient.post('/api/v1/auth/login', { body, config })
  },

  /**
   * 刷新访问令牌
   * @description 刷新访问令牌

使用刷新令牌（从 Cookie 中获取）获取新的访问令牌和刷新令牌元数据。
新的刷新令牌会自动更新到 HttpOnly Cookie 中。

**安全特性**：
- 验证 Refresh Token 类型和有效性
- 检查用户状态（是否被禁用）
- 生成新的 JTI（JWT ID）
- 自动撤销旧令牌
   * @endpoint POST /api/v1/auth/refresh
   */
  async refresh(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/refresh', 'post'>> {
    return await contractClient.post('/api/v1/auth/refresh', { config })
  },

  /**
   * 用户登出
   * @description 用户登出（撤销当前会话）

撤销当前会话的令牌并删除刷新令牌 Cookie。

**安全特性**：
- 优先撤销当前 Access Token（添加到黑名单）
- 当 Access Token 不可用时，回退使用 Refresh Token Cookie 撤销当前会话
- 始终删除 Refresh Token Cookie（幂等）
   * @endpoint POST /api/v1/auth/logout
   */
  async logout(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/logout', 'post'>> {
    return await contractClient.post('/api/v1/auth/logout', { config })
  },

  /**
   * 强制登出所有设备
   * @description 强制登出所有设备（撤销所有会话）

撤销用户所有活跃会话的令牌。用于：
- 用户主动清空所有会话
- 发现安全问题时强制登出
- 管理员重置用户会话

**安全特性**：
- 撤销所有 Access Token（添加到黑名单）
- 撤销所有 Refresh Token
- 删除所有会话信息
- 返回撤销的令牌数量
   * @endpoint POST /api/v1/auth/logout-all
   */
  async logoutAll(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/logout-all', 'post'>> {
    return await contractClient.post('/api/v1/auth/logout-all', { config })
  },

  /**
   * 获取当前用户的所有活跃会话
   * @description 获取当前用户的所有活跃会话

返回用户所有活跃的登录会话，包括：
- 会话 UUID
- JWT ID (JTI)
- 创建时间
- 设备信息
- 最后活跃时间

**使用场景**：
- 用户查看和管理自己的登录设备
- 安全审计
- 检测异常登录
   * @endpoint GET /api/v1/auth/sessions
   */
  async sessions(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/sessions', 'get'>> {
    return await contractClient.get('/api/v1/auth/sessions', { config })
  },

  /**
   * 撤销指定会话
   * @description 撤销指定会话

撤销用户指定会话的令牌（强制登出特定设备）。

**使用场景**：
- 用户发现异常登录时撤销该会话
- 管理员撤销用户特定会话
- 用户管理自己的多设备登录

**安全特性**：
- 验证会话属于当前用户
- 撤销 Access Token（添加到黑名单）
- 撤销关联的 Refresh Token
- 删除会话信息
   * @endpoint DELETE /api/v1/auth/sessions/{session_uuid}
   */
  async sessionsBySessionUuid(params: paths['/api/v1/auth/sessions/{session_uuid}']['delete']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/sessions/{session_uuid}', 'delete'>> {
    return await contractClient.delete('/api/v1/auth/sessions/{session_uuid}', { params, config })
  },

  /**
   * 获取当前用户初始化上下文
   * @description 一次性返回用户信息、API 权限列表和菜单树，用于前端登录后初始化
   * @endpoint GET /api/v1/auth/my
   */
  async my(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/my', 'get'>> {
    return await contractClient.get('/api/v1/auth/my', { config })
  },

  /**
   * 获取当前用户的 API 权限列表
   * @description 获取当前用户有权限访问的内部管理 API（用于前端动态路由和权限控制）
   * @endpoint GET /api/v1/auth/permissions
   */
  async permissions(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/auth/permissions', 'get'>> {
    return await contractClient.get('/api/v1/auth/permissions', { config })
  }
}

/**
 * auth 资源 API 客户端类型
 */
export type AuthGeneratedApiType = typeof authGeneratedApi

/**
 * users 资源 - 自动生成的 API 客户端
 * @base /api/v1/users
 */
export const userGeneratedApi = {
  /**
   * [admin:user:stats] 获取缓存统计
   * @description 获取缓存统计信息

返回：
- total_users: 总用户数
- cache_status: 缓存服务状态
- cache_keys_count: 缓存键数量（如果 Redis 可用）
   * @endpoint GET /api/v1/users/stats/cache
   */
  async statsCache(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/users/stats/cache', 'get'>> {
    return await contractClient.get('/api/v1/users/stats/cache', { config })
  },

  /**
   * [admin:user:reset-password] 重置用户密码
   * @description 管理员重置用户密码

重置密码后，用户需要重新登录。

**权限要求**：`admin:user:reset-password`

**安全措施**：
- 重置后自动撤销所有活跃会话
- 清除权限缓存

Args:
    id: 用户 ID
    data: 重置密码请求数据
    db: 数据库会话
    cache: 缓存服务

Returns:
    更新后的用户信息
   * @endpoint PUT /api/v1/users/{id}/reset-password
   */
  async resetPassword(params: paths['/api/v1/users/{id}/reset-password']['put']['parameters']['path'], body: paths['/api/v1/users/{id}/reset-password']['put']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/users/{id}/reset-password', 'put'>> {
    return await contractClient.put('/api/v1/users/{id}/reset-password', { params, body, config })
  },

  /**
   * [admin:user:assign-roles] 为用户分配角色
   * @description 为用户分配角色

分配角色后：
- 用户的权限会立即更新
- 如果用户当前已登录，权限变更会在下次请求时生效

**权限要求**：`admin:user:assign-roles`

Args:
    id: 用户 ID
    data: 角色分配请求数据
    db: 数据库会话
    cache: 缓存服务

Returns:
    更新后的用户信息（包含角色列表）
   * @endpoint PUT /api/v1/users/{id}/assign-roles
   */
  async assignRoles(params: paths['/api/v1/users/{id}/assign-roles']['put']['parameters']['path'], body: paths['/api/v1/users/{id}/assign-roles']['put']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/users/{id}/assign-roles', 'put'>> {
    return await contractClient.put('/api/v1/users/{id}/assign-roles', { params, body, config })
  }
}

/**
 * users 资源 API 客户端类型
 */
export type UserGeneratedApiType = typeof userGeneratedApi

/**
 * permissions 资源 - 自动生成的 API 客户端
 * @base /api/v1/permissions
 */
export const permissionGeneratedApi = {
  /**
   * Get Tree
   * @description 获取树形结构
   * @endpoint GET /api/v1/permissions/tree
   */
  async tree(query?: paths['/api/v1/permissions/tree']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/permissions/tree', 'get'>> {
    return await contractClient.get('/api/v1/permissions/tree', { query, config })
  },

  /**
   * Get Siblings
   * @description 获取同级节点
   * @endpoint GET /api/v1/permissions/siblings/{node_id}
   */
  async siblingsByNode(params: paths['/api/v1/permissions/siblings/{node_id}']['get']['parameters']['path'], query?: paths['/api/v1/permissions/siblings/{node_id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/permissions/siblings/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/permissions/siblings/{node_id}', { params, query, config })
  },

  /**
   * Get Ancestors
   * @description 获取祖先节点
   * @endpoint GET /api/v1/permissions/ancestors/{node_id}
   */
  async ancestorsByNode(params: paths['/api/v1/permissions/ancestors/{node_id}']['get']['parameters']['path'], query?: paths['/api/v1/permissions/ancestors/{node_id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/permissions/ancestors/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/permissions/ancestors/{node_id}', { params, query, config })
  },

  /**
   * Move Node
   * @description 移动节点
   * @endpoint PUT /api/v1/permissions/move
   */
  async move(body: paths['/api/v1/permissions/move']['put']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/permissions/move', 'put'>> {
    return await contractClient.put('/api/v1/permissions/move', { body, config })
  }
}

/**
 * permissions 资源 API 客户端类型
 */
export type PermissionGeneratedApiType = typeof permissionGeneratedApi

/**
 * menus 资源 - 自动生成的 API 客户端
 * @base /api/v1/menus
 */
export const menuGeneratedApi = {
  /**
   * Get Tree
   * @description 获取树形结构
   * @endpoint GET /api/v1/menus/tree
   */
  async tree(query?: paths['/api/v1/menus/tree']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/menus/tree', 'get'>> {
    return await contractClient.get('/api/v1/menus/tree', { query, config })
  },

  /**
   * Get Siblings
   * @description 获取同级节点
   * @endpoint GET /api/v1/menus/siblings/{node_id}
   */
  async siblingsByNode(params: paths['/api/v1/menus/siblings/{node_id}']['get']['parameters']['path'], query?: paths['/api/v1/menus/siblings/{node_id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/menus/siblings/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/menus/siblings/{node_id}', { params, query, config })
  },

  /**
   * Get Ancestors
   * @description 获取祖先节点
   * @endpoint GET /api/v1/menus/ancestors/{node_id}
   */
  async ancestorsByNode(params: paths['/api/v1/menus/ancestors/{node_id}']['get']['parameters']['path'], query?: paths['/api/v1/menus/ancestors/{node_id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/menus/ancestors/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/menus/ancestors/{node_id}', { params, query, config })
  },

  /**
   * Move Node
   * @description 移动节点
   * @endpoint PUT /api/v1/menus/move
   */
  async move(body: paths['/api/v1/menus/move']['put']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/menus/move', 'put'>> {
    return await contractClient.put('/api/v1/menus/move', { body, config })
  },

  /**
   * 获取当前用户的菜单树
   * @description 返回当前用户可访问的菜单树（基于角色权限过滤）
   * @endpoint GET /api/v1/menus/my_menu
   */
  async myMenu(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/menus/my_menu', 'get'>> {
    return await contractClient.get('/api/v1/menus/my_menu', { config })
  }
}

/**
 * menus 资源 API 客户端类型
 */
export type MenuGeneratedApiType = typeof menuGeneratedApi

/**
 * performance 资源 - 自动生成的 API 客户端
 * @base /api/v1/performance
 */
export const performanceGeneratedApi = {
  /**
   * 获取系统性能指标
   * @description 获取系统性能指标

返回：
- system: CPU、内存、磁盘使用情况
- database: 数据库连接池状态
- redis: Redis 连接状态
- cache: 缓存统计信息
   * @endpoint GET /api/v1/performance/metrics
   */
  async performanceMetrics(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/performance/metrics', 'get'>> {
    return await contractClient.get('/api/v1/performance/metrics', { config })
  },

  /**
   * 健康检查
   * @description 简单健康检查

返回各组件的健康状态
   * @endpoint GET /api/v1/performance/health
   */
  async performanceHealth(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/performance/health', 'get'>> {
    return await contractClient.get('/api/v1/performance/health', { config })
  },

  /**
   * 重置性能测试数据
   * @description 重置性能测试数据

清空所有缓存，准备开始新的性能测试
   * @endpoint POST /api/v1/performance/load-test/reset
   */
  async performanceLoadTestReset(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/performance/load-test/reset', 'post'>> {
    return await contractClient.post('/api/v1/performance/load-test/reset', { config })
  },

  /**
   * 获取性能测试配置
   * @description 获取系统配置信息

用于性能测试时了解系统配置
   * @endpoint GET /api/v1/performance/config
   */
  async performanceConfig(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/performance/config', 'get'>> {
    return await contractClient.get('/api/v1/performance/config', { config })
  }
}

/**
 * performance 资源 API 客户端类型
 */
export type PerformanceGeneratedApiType = typeof performanceGeneratedApi

/**
 * events 资源 - 自动生成的 API 客户端
 * @base /api/v1/events
 */
export const eventGeneratedApi = {
  /**
   * SSE 实时事件流
   * @description 订阅 SSE 事件流，接收系统通知和业务状态更新
   * @endpoint GET /api/v1/events/stream
   */
  async stream(query?: paths['/api/v1/events/stream']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/events/stream', 'get'>> {
    return await contractClient.get('/api/v1/events/stream', { query, config })
  }
}

/**
 * events 资源 API 客户端类型
 */
export type EventGeneratedApiType = typeof eventGeneratedApi

/**
 * api-auth 资源 - 自动生成的 API 客户端
 * @base /api/v1/api-auth
 */
export const apiAuthGeneratedApi = {
  /**
   * [api-auth:api_application:list_permissions] 获取系统支持的 API 权限列表
   * @description 返回可供分配给 API 应用的权限列表。
   * @endpoint GET /api/v1/api-auth/applications/available-permissions
   */
  async applicationsAvailablePermissions(query?: paths['/api/v1/api-auth/applications/available-permissions']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/available-permissions', 'get'>> {
    return await contractClient.get('/api/v1/api-auth/applications/available-permissions', { query, config })
  },

  /**
   * [api-auth:api_application:create] 创建 API 应用
   * @endpoint POST /api/v1/api-auth/applications
   */
  async applications(body: paths['/api/v1/api-auth/applications']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications', { body, config })
  },

  /**
   * [api-auth:api_application:revoke] 撤销 API 应用
   * @endpoint POST /api/v1/api-auth/applications/{id}/revoke
   */
  async revoke(params: paths['/api/v1/api-auth/applications/{id}/revoke']['post']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}/revoke', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/{id}/revoke', { params, config })
  },

  /**
   * 重置应用有效期
   * @description 重置应用有效期

基于 created_at 重新计算 expires_at，而不是从当前时间计算。
这样可以保证"延期"是基于原始创建时间，而不是当前时间。

例如：
- 应用创建于 2024-01-01，设置有效期 1年，过期时间为 2025-01-01
- 2024-06-01 重置有效期为 2年，新的过期时间为 2026-01-01（而不是 2026-06-01）

Args:
    id: 应用 ID
    data: 包含新的有效期时长和修改原因
    db: 数据库会话
   * @endpoint POST /api/v1/api-auth/applications/{id}/reset-validity
   */
  async resetValidity(params: paths['/api/v1/api-auth/applications/{id}/reset-validity']['post']['parameters']['path'], body: paths['/api/v1/api-auth/applications/{id}/reset-validity']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}/reset-validity', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/{id}/reset-validity', { params, body, config })
  },

  /**
   * [api:try:invoke] 测试 API 调用
   * @description 测试 API 调用

请求格式：{"data": {...}}
   * @endpoint POST /api/v1/api-auth/applications/try/invoke
   */
  async applicationsTryInvoke(body: paths['/api/v1/api-auth/applications/try/invoke']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/try/invoke', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/try/invoke', { body, config })
  },

  /**
   * [api-auth:api_application:assign_permission] 分配权限
   * @description 为应用分配权限
   * @endpoint POST /api/v1/api-auth/applications/{id}/permissions
   */
  async permissions(params: paths['/api/v1/api-auth/applications/{id}/permissions']['post']['parameters']['path'], body: paths['/api/v1/api-auth/applications/{id}/permissions']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}/permissions', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/{id}/permissions', { params, body, config })
  },

  /**
   * [api-auth:api_application:reset_secret] 重置应用密钥
   * @description 重置应用密钥

⚠️ 注意: 旧密钥将立即失效，新密钥仅返回一次。
   * @endpoint POST /api/v1/api-auth/applications/{id}/reset-secret
   */
  async resetSecret(params: paths['/api/v1/api-auth/applications/{id}/reset-secret']['post']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}/reset-secret', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/{id}/reset-secret', { params, config })
  },

  /**
   * [api-auth:apiapplication:batch_restore] 批量恢复APIApplication
   * @endpoint POST /api/v1/api-auth/applications/trash/restore
   */
  async applicationsBatchRestore(body: paths['/api/v1/api-auth/applications/trash/restore']['post']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/trash/restore', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/trash/restore', { body, config })
  },

  /**
   * [api-auth:apiapplication:batch_permanent_delete] 批量永久删除APIApplication
   * @endpoint DELETE /api/v1/api-auth/applications/trash/permanent
   */
  async applicationsBatchPermanent(body: paths['/api/v1/api-auth/applications/trash/permanent']['delete']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/trash/permanent', 'delete'>> {
    return await contractClient.delete('/api/v1/api-auth/applications/trash/permanent', { body, config })
  },

  /**
   * [api-auth:apiapplication:restore] 恢复APIApplication
   * @endpoint POST /api/v1/api-auth/applications/{id}/restore
   */
  async applicationsRestore(params: paths['/api/v1/api-auth/applications/{id}/restore']['post']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}/restore', 'post'>> {
    return await contractClient.post('/api/v1/api-auth/applications/{id}/restore', { params, config })
  },

  /**
   * [api-auth:apiapplication:trash] 获取已删除APIApplication
   * @endpoint GET /api/v1/api-auth/applications/trash
   */
  async applicationsTrash(query?: paths['/api/v1/api-auth/applications/trash']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/trash', 'get'>> {
    return await contractClient.get('/api/v1/api-auth/applications/trash', { query, config })
  },

  /**
   * [api-auth:apiapplication:get] 获取APIApplication
   * @endpoint GET /api/v1/api-auth/applications/{id}
   */
  async applications2(params: paths['/api/v1/api-auth/applications/{id}']['get']['parameters']['path'], query?: paths['/api/v1/api-auth/applications/{id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}', 'get'>> {
    return await contractClient.get('/api/v1/api-auth/applications/{id}', { params, query, config })
  },

  /**
   * [api-auth:apiapplication:update] 更新APIApplication
   * @endpoint PUT /api/v1/api-auth/applications/{id}
   */
  async applicationsUpdate(params: paths['/api/v1/api-auth/applications/{id}']['put']['parameters']['path'], body: paths['/api/v1/api-auth/applications/{id}']['put']['requestBody']['content']['application/json'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}', 'put'>> {
    return await contractClient.put('/api/v1/api-auth/applications/{id}', { params, body, config })
  },

  /**
   * [api-auth:apiapplication:delete] 删除APIApplication
   * @endpoint DELETE /api/v1/api-auth/applications/{id}
   */
  async applications3(params: paths['/api/v1/api-auth/applications/{id}']['delete']['parameters']['path'], query?: paths['/api/v1/api-auth/applications/{id}']['delete']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/applications/{id}', 'delete'>> {
    return await contractClient.delete('/api/v1/api-auth/applications/{id}', { params, query, config })
  },

  /**
   * [api-auth:apiaccesslog:get] 获取APIAccessLog
   * @endpoint GET /api/v1/api-auth/access-log/{id}
   */
  async accessLog(params: paths['/api/v1/api-auth/access-log/{id}']['get']['parameters']['path'], query?: paths['/api/v1/api-auth/access-log/{id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api-auth/access-log/{id}', 'get'>> {
    return await contractClient.get('/api/v1/api-auth/access-log/{id}', { params, query, config })
  }
}

/**
 * api-auth 资源 API 客户端类型
 */
export type ApiAuthGeneratedApiType = typeof apiAuthGeneratedApi

/**
 * callback 资源 - 自动生成的 API 客户端
 * @base /api/v1/callback
 */
export const callbackGeneratedApi = {
  /**
   * 任务结果回传
   * @description 设备完成指令后，调用此接口回传执行结果
   * @endpoint POST /api/v1/callback/result
   */
  async callbackResult(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/result', 'post'>> {
    return await contractClient.post('/api/v1/callback/result', { config })
  },

  /**
   * 设备事件上报
   * @description 设备发生状态变更或传感器触发业务信号时，调用此接口上报事件（白皮书 3.2.2）
   * @endpoint POST /api/v1/callback/event
   */
  async callbackEvent(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/event', 'post'>> {
    return await contractClient.post('/api/v1/callback/event', { config })
  },

  /**
   * 外部系统回调
   * @description 库位分配、AGV 等外部系统异步回调入口
   * @endpoint POST /api/v1/callback/external
   */
  async callbackExternal(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/external', 'post'>> {
    return await contractClient.post('/api/v1/callback/external', { config })
  },

  /**
   * 根据请求 ID 查询回调日志
   * @description 根据 request_id 查询单条回调日志记录
   * @endpoint GET /api/v1/callback/logs/request/{request_id}
   */
  async callbackLogsRequestByRequest(params: paths['/api/v1/callback/logs/request/{request_id}']['get']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/request/{request_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/request/{request_id}', { params, config })
  },

  /**
   * 根据关联 ID 查询回调日志
   * @description 根据 correlation_id 查询所有相关的回调日志（用于串联整个流程）
   * @endpoint GET /api/v1/callback/logs/correlation/{correlation_id}
   */
  async callbackLogsCorrelationByCorrelation(params: paths['/api/v1/callback/logs/correlation/{correlation_id}']['get']['parameters']['path'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/correlation/{correlation_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/correlation/{correlation_id}', { params, config })
  },

  /**
   * 根据设备 ID 查询回调日志
   * @description 查询指定设备最近的回调记录
   * @endpoint GET /api/v1/callback/logs/device/{device_id}
   */
  async callbackLogsDeviceByDevice(params: paths['/api/v1/callback/logs/device/{device_id}']['get']['parameters']['path'], query?: paths['/api/v1/callback/logs/device/{device_id}']['get']['parameters']['query'], config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/device/{device_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/device/{device_id}', { params, query, config })
  }
}

/**
 * callback 资源 API 客户端类型
 */
export type CallbackGeneratedApiType = typeof callbackGeneratedApi
