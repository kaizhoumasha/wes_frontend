/** @openapi-sha256 1516c8abc10d01f774f1e627e6abae88d69059cd67b475534d18e3ef7ea9aba5 */
/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

/* tslint:disable */

export type ApiResponse<TData> = {
    code: string;
    message: string;
    data?: TData | null;
    timestamp?: string;
};
export type ApiListData<TItem> = {
    total: number;
    items?: TItem[];
    limit: number;
    offset: number;
};
export type ApiListResponse<TItem> = ApiResponse<ApiListData<TItem>>;
export interface paths {
    "/api/v1/admin/performance/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取性能测试配置
         * @description 获取系统配置信息
         *
         *     用于性能测试时了解系统配置
         */
        get: operations["admin_performance_config_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/performance/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 健康检查
         * @description 简单健康检查
         *
         *     返回各组件的健康状态
         */
        get: operations["admin_performance_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/performance/load-test/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 重置性能测试数据
         * @description 重置性能测试数据
         *
         *     清空所有缓存，准备开始新的性能测试
         */
        post: operations["admin_performance_load_test_reset_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/performance/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取系统性能指标
         * @description 获取系统性能指标
         *
         *     返回：
         *     - system: CPU、内存、磁盘使用情况
         *     - database: 数据库连接池状态
         *     - redis: Redis 连接状态
         *     - cache: 缓存统计信息
         */
        get: operations["admin_performance_metrics_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:permission:detail] 获取Permission */
        get: operations["permissions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/ancestors/{node_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Ancestors
         * @description 获取祖先节点
         */
        get: operations["admin_permissions_ancestors_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/children/{node_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Children
         * @description 获取子级节点
         */
        get: operations["admin_permissions_children_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:permission:list] 获取Permission列表 */
        post: operations["permissions_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/siblings/{node_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Siblings
         * @description 获取同级节点
         */
        get: operations["admin_permissions_siblings_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/tree": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Tree
         * @description 获取树形结构（默认懒加载模式）
         */
        get: operations["admin_permissions_tree_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:role:create] 创建Role */
        post: operations["roles_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:role:detail] 获取Role */
        get: operations["roles_get"];
        /** [admin:role:update] 更新Role */
        put: operations["roles_update"];
        post?: never;
        /** [admin:role:delete] 删除Role */
        delete: operations["roles_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:role:permanent_delete] 永久删除Role */
        delete: operations["roles_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:role:restore] 恢复Role */
        post: operations["roles_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:role:list] 获取Role列表 */
        post: operations["roles_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:role:trash] 获取已删除Role */
        get: operations["roles_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:role:batch_permanent_delete] 批量永久删除Role */
        delete: operations["roles_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:role:batch_restore] 批量恢复Role */
        post: operations["roles_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:user:create] 创建User */
        post: operations["users_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:user:detail] 获取User */
        get: operations["users_get"];
        /** [admin:user:update] 更新User */
        put: operations["users_update"];
        post?: never;
        /** [admin:user:delete] 删除User */
        delete: operations["users_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/assign-roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * [admin:user:assign-roles] 为用户分配角色
         * @description 为用户分配角色
         *
         *     分配角色后：
         *     - 用户的权限会立即更新
         *     - 如果用户当前已登录，权限变更会在下次请求时生效
         *
         *     **权限要求**：`admin:user:assign-roles`
         *
         *     Args:
         *         id: 用户 ID
         *         data: 角色分配请求数据
         *         db: 数据库会话
         *         cache: 缓存服务
         *
         *     Returns:
         *         更新后的用户信息（包含角色列表）
         */
        put: operations["admin_users_by_id_assign_roles_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:user:permanent_delete] 永久删除User */
        delete: operations["users_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * [admin:user:reset-password] 重置用户密码
         * @description 管理员重置用户密码
         *
         *     重置密码后，用户需要重新登录。
         *
         *     **权限要求**：`admin:user:reset-password`
         *
         *     **安全措施**：
         *     - 重置后自动撤销所有活跃会话
         *     - 清除权限缓存
         *
         *     Args:
         *         id: 用户 ID
         *         data: 重置密码请求数据
         *         db: 数据库会话
         *         cache: 缓存服务
         *
         *     Returns:
         *         更新后的用户信息
         */
        put: operations["admin_users_by_id_reset_password_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:user:restore] 恢复User */
        post: operations["users_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:user:bulk_delete] 批量删除User */
        delete: operations["users_bulk_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:user:list] 获取User列表 */
        post: operations["users_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/stats/cache": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [admin:user:stats] 获取缓存统计
         * @description 获取缓存统计信息
         *
         *     返回：
         *     - total_users: 总用户数
         *     - cache_status: 缓存服务状态
         *     - cache_keys_count: 缓存键数量（如果 Redis 可用）
         */
        get: operations["admin_users_stats_cache_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:user:trash] 获取已删除User */
        get: operations["users_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:user:batch_permanent_delete] 批量永久删除User */
        delete: operations["users_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:user:batch_restore] 批量恢复User */
        post: operations["users_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/access-log/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [api-auth:apiaccesslog:detail] 获取APIAccessLog */
        get: operations["access_log_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/access-log/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:apiaccesslog:list] 获取APIAccessLog列表 */
        post: operations["access_log_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:api_application:create] 创建 API 应用 */
        post: operations["api_auth_applications_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [api-auth:api_application:detail] 获取APIApplication */
        get: operations["applications_get"];
        /** [api-auth:api_application:update] 更新APIApplication */
        put: operations["applications_update"];
        post?: never;
        /** [api-auth:api_application:delete] 删除APIApplication */
        delete: operations["applications_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [api-auth:api_application:permanent_delete] 永久删除APIApplication */
        delete: operations["applications_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [api-auth:api_application:assign_permission] 分配权限
         * @description 为应用分配权限
         */
        post: operations["api_auth_applications_by_id_permissions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/reset-secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [api-auth:api_application:reset_secret] 重置应用密钥
         * @description 重置应用密钥
         *
         *     ⚠️ 注意: 旧密钥将立即失效，新密钥仅返回一次。
         */
        post: operations["api_auth_applications_by_id_reset_secret_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/reset-validity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 重置应用有效期
         * @description 重置应用有效期
         *
         *     基于 created_at 重新计算 expires_at，而不是从当前时间计算。
         *     这样可以保证"延期"是基于原始创建时间，而不是当前时间。
         *
         *     例如：
         *     - 应用创建于 2024-01-01，设置有效期 1年，过期时间为 2025-01-01
         *     - 2024-06-01 重置有效期为 2年，新的过期时间为 2026-01-01（而不是 2026-06-01）
         *
         *     Args:
         *         id: 应用 ID
         *         data: 包含新的有效期时长和修改原因
         *         db: 数据库会话
         */
        post: operations["api_auth_applications_by_id_reset_validity_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:api_application:restore] 恢复APIApplication */
        post: operations["applications_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/{id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:api_application:revoke] 撤销 API 应用 */
        post: operations["api_auth_applications_by_id_revoke_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/available-permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [api-auth:api_application:list_permissions] 获取系统支持的 API 权限列表
         * @description 返回可供分配给 API 应用的权限列表。
         */
        get: operations["api_auth_applications_available_permissions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:api_application:list] 获取APIApplication列表 */
        post: operations["applications_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [api-auth:api_application:trash] 获取已删除APIApplication */
        get: operations["applications_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [api-auth:api_application:batch_permanent_delete] 批量永久删除APIApplication */
        delete: operations["applications_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [api-auth:api_application:batch_restore] 批量恢复APIApplication */
        post: operations["applications_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_auth/applications/try/invoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [api:try:invoke] 测试 API 调用
         * @description 测试 API 调用
         *
         *     请求格式：{"data": {...}}
         */
        post: operations["api_auth_applications_try_invoke_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 用户登录
         * @description 用户登录
         *
         *     返回访问令牌和刷新令牌元数据。刷新令牌仅存储在 HttpOnly Cookie 中。
         *
         *     - **username**: 用户名（3-50字符）
         *     - **password**: 密码（6-100字符）
         *
         *     **安全特性**：
         *     - 使用 Argon2 密码哈希
         *     - JWT 包含标准声明（iss, sub, jti, iat, nbf, exp）
         *     - Refresh Token 存储在 HttpOnly Cookie 中
         *     - 支持 JTI（JWT ID）用于精确撤销
         */
        post: operations["auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 用户登出
         * @description 用户登出（撤销当前会话）
         *
         *     撤销当前会话的令牌并删除刷新令牌 Cookie。
         *
         *     **安全特性**：
         *     - 优先撤销当前 Access Token（添加到黑名单）
         *     - 当 Access Token 不可用时，回退使用 Refresh Token Cookie 撤销当前会话
         *     - 始终删除 Refresh Token Cookie（幂等）
         */
        post: operations["auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 强制登出所有设备
         * @description 强制登出所有设备（撤销所有会话）
         *
         *     撤销用户所有活跃会话的令牌。用于：
         *     - 用户主动清空所有会话
         *     - 发现安全问题时强制登出
         *     - 管理员重置用户会话
         *
         *     **安全特性**：
         *     - 撤销所有 Access Token（添加到黑名单）
         *     - 撤销所有 Refresh Token
         *     - 删除所有会话信息
         *     - 返回撤销的令牌数量
         */
        post: operations["auth_logout_all_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/my": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取当前用户初始化上下文
         * @description 一次性返回用户信息和 API 权限列表，用于前端登录后初始化
         */
        get: operations["auth_my_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取当前用户的 API 权限列表
         * @description 获取当前用户有权限访问的内部管理 API（用于前端动态路由和权限控制）
         */
        get: operations["auth_permissions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 刷新访问令牌
         * @description 刷新访问令牌
         *
         *     使用刷新令牌（从 Cookie 中获取）获取新的访问令牌和刷新令牌元数据。
         *     新的刷新令牌会自动更新到 HttpOnly Cookie 中。
         *
         *     **安全特性**：
         *     - 验证 Refresh Token 类型和有效性
         *     - 检查用户状态（是否被禁用）
         *     - 生成新的 JTI（JWT ID）
         *     - 自动撤销旧令牌
         */
        post: operations["auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取当前用户的所有活跃会话
         * @description 获取当前用户的所有活跃会话
         *
         *     返回用户所有活跃的登录会话，包括：
         *     - 会话 UUID
         *     - JWT ID (JTI)
         *     - 创建时间
         *     - 设备信息
         *     - 最后活跃时间
         *
         *     **使用场景**：
         *     - 用户查看和管理自己的登录设备
         *     - 安全审计
         *     - 检测异常登录
         */
        get: operations["auth_sessions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/sessions/{session_uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 撤销指定会话
         * @description 撤销指定会话
         *
         *     撤销用户指定会话的令牌（强制登出特定设备）。
         *
         *     **使用场景**：
         *     - 用户发现异常登录时撤销该会话
         *     - 管理员撤销用户特定会话
         *     - 用户管理自己的多设备登录
         *
         *     **安全特性**：
         *     - 验证会话属于当前用户
         *     - 撤销 Access Token（添加到黑名单）
         *     - 撤销关联的 Refresh Token
         *     - 删除会话信息
         */
        delete: operations["auth_sessions_by_session_uuid_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/event": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept Device Event */
        post: operations["callback_event_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [callback:callback_log:detail] 获取CallbackLog */
        get: operations["logs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [callback:callback_log:list] 获取CallbackLog列表 */
        post: operations["logs_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/request/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [callback:callback_log:detail-by-request-id] 根据请求 ID 查询回调日志
         * @description 根据 request_id 查询单条回调日志记录
         */
        get: operations["callback_logs_request_by_request_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/subject/{subject_code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [callback:callback_log:list-by-subject-code] 根据回调主体编码查询回调日志
         * @description 查询指定回调主体最近的回调记录。设备回调主体通常是 device_code。
         */
        get: operations["callback_logs_subject_by_subject_code_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/trace/{trace_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [callback:callback_log:list-by-trace-id] 根据 Trace ID 查询回调日志
         * @description 根据 trace_id 查询所有相关的回调日志（用于串联整个流程）
         */
        get: operations["callback_logs_trace_by_trace_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept Device Result */
        post: operations["callback_result_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/commands/{command_code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 查询 DeviceCommand 联调结果 */
        get: operations["device_commands_by_command_code_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/commands/debug": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 创建 DeviceCommand 联调命令 */
        post: operations["device_commands_debug_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/commands/debug/preflight": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 枚举 ECS 设备并检查 MANUAL_DEBUG 运行态 */
        post: operations["device_commands_debug_preflight_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:create] 创建Device */
        post: operations["devices_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:device:detail] 获取Device */
        get: operations["devices_get"];
        /** [biz:device:update] 更新Device */
        put: operations["devices_update"];
        post?: never;
        /** [biz:device:delete] 删除Device */
        delete: operations["devices_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [biz:device:permanent_delete] 永久删除Device */
        delete: operations["devices_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:restore] 恢复Device */
        post: operations["devices_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:list] 获取Device列表 */
        post: operations["devices_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:device:trash] 获取已删除Device */
        get: operations["devices_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [biz:device:batch_permanent_delete] 批量永久删除Device */
        delete: operations["devices_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:batch_restore] 批量恢复Device */
        post: operations["devices_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/evidences/{source_event_id}/blocker": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 查询 Device EVENT 最新命令阻塞因果 */
        get: operations["device_evidences_by_source_event_id_blocker_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/evidences/{source_event_id}/blockers/{block_id}/reconcile-device-idle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 以设备实时空闲证明闭合 DELIVERY_UNKNOWN 命令 */
        post: operations["device_evidences_by_source_event_id_blockers_by_block_id_reconcile_device_idle_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/evidences/{source_event_id}/blockers/{block_id}/reprocess": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 显式重新处理已闭合 blocker 的 Device EVENT */
        post: operations["device_evidences_by_source_event_id_blockers_by_block_id_reprocess_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/evidences/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 实时订阅 ECS callback 与 evidence 应用状态 */
        get: operations["device_evidences_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/material/material-units/location-query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:material:location-query] 查询物料作业期位置
         * @description 统一 MaterialLocationQuery 入口，API 层只委托查询 service。
         */
        get: operations["material_material_units_location_query_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-cell-occupancies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:bincelloccupancy:detail] 获取BinCellOccupancy */
        get: operations["bin_cell_occupancies_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-cell-occupancies/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:bincelloccupancy:list] 获取BinCellOccupancy列表 */
        post: operations["bin_cell_occupancies_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-content-snapshot-items/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:bincontentsnapshotitem:detail] 获取BinContentSnapshotItem */
        get: operations["bin_content_snapshot_items_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-content-snapshot-items/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:bincontentsnapshotitem:list] 获取BinContentSnapshotItem列表 */
        post: operations["bin_content_snapshot_items_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-content-snapshots/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:bincontentsnapshot:detail] 获取BinContentSnapshot */
        get: operations["bin_content_snapshots_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-content-snapshots/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:bincontentsnapshot:list] 获取BinContentSnapshot列表 */
        post: operations["bin_content_snapshots_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-material-mounts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:binmaterialmount:detail] 获取BinMaterialMount */
        get: operations["bin_material_mounts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-material-mounts/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:binmaterialmount:list] 获取BinMaterialMount列表 */
        post: operations["bin_material_mounts_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-slot-templates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:binslottemplate:detail] 获取BinSlotTemplate */
        get: operations["bin_slot_templates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-slot-templates/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:binslottemplate:list] 获取BinSlotTemplate列表 */
        post: operations["bin_slot_templates_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-types/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:bintype:detail] 获取BinType */
        get: operations["bin_types_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bin-types/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:bintype:list] 获取BinType列表 */
        post: operations["bin_types_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bins/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:bin:detail] 获取Bin */
        get: operations["bins_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/bins/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:bin:list] 获取Bin列表 */
        post: operations["bins_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-bin-mounts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:rackbinmount:detail] 获取RackBinMount */
        get: operations["rack_bin_mounts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-bin-mounts/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:rackbinmount:list] 获取RackBinMount列表 */
        post: operations["rack_bin_mounts_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-placements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:rackplacement:detail] 获取RackPlacement */
        get: operations["rack_placements_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-placements/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:rackplacement:list] 获取RackPlacement列表 */
        post: operations["rack_placements_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-slot-templates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:rackslottemplate:detail] 获取RackSlotTemplate */
        get: operations["rack_slot_templates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-slot-templates/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:rackslottemplate:list] 获取RackSlotTemplate列表 */
        post: operations["rack_slot_templates_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-types/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:racktype:detail] 获取RackType */
        get: operations["rack_types_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/rack-types/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:racktype:list] 获取RackType列表 */
        post: operations["rack_types_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/racks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:rack:detail] 获取Rack */
        get: operations["racks_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/racks/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:rack:list] 获取Rack列表 */
        post: operations["racks_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/state-events/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [resource:resourcestateevent:detail] 获取ResourceStateEvent */
        get: operations["state_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/resource/state-events/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [resource:resourcestateevent:list] 获取ResourceStateEvent列表 */
        post: operations["state_events_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sys/audit-logs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [sys:auditlog:detail] 获取AuditLog */
        get: operations["audit_logs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sys/audit-logs/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [sys:auditlog:list] 获取AuditLog列表 */
        post: operations["audit_logs_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sys/events/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * SSE 实时事件流
         * @description 订阅 SSE 事件流，接收系统通知和业务状态更新
         */
        get: operations["sys_events_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/transport/debug-tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [ops:transport:debug-create] 创建 Transport 调试任务 */
        post: operations["transport_debug_tasks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/transport/evidences/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [ops:transport-evidence:stream] 实时订阅 WMS Transport callback 与 evidence 应用状态 */
        get: operations["transport_evidences_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/transport/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [ops:transport-task:list] 查询本地 Transport 任务列表 */
        get: operations["transport_tasks_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/transport/tasks/{transport_task_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [ops:transport-task:read] 查询本地 Transport 任务 */
        get: operations["transport_tasks_by_transport_task_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/wms/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Receive Transport Event */
        post: operations["wms_events_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:resolve-effect-reconciliation] 提交 EFFECT reconciliation 人工决议 */
        post: operations["workline_operations_reconciliations_effects_by_dispatch_key_resolve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:resolve-reconciliation] 解除 runtime reconciliation 隔离，不重发设备命令、不重复执行超时处理、释放安全停靠队列 */
        post: operations["workline_operations_reconciliations_sessions_by_session_id_resolve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/replay/inboxes/{inbox_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:replay-inbox] Replay 历史 Inbox */
        post: operations["workline_operations_replay_inboxes_by_inbox_id_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:clear-estop] 人工确认 checklist 后清除工作线急停 */
        post: operations["workline_operations_safety_worklines_by_workline_id_clear_estop_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/ack": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:submit-sandbox-ack] 沙箱模拟 Command ACK */
        post: operations["workline_operations_sandbox_ack_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:sandbox-completed] 查询沙箱已完成 Outbox */
        get: operations["workline_operations_sandbox_completed_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/external-callbacks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:submit-sandbox-external-callback] 沙箱模拟 External HTTP 回调 */
        post: operations["workline_operations_sandbox_external_callbacks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:sandbox-pending] 查询沙箱待处理 Outbox */
        get: operations["workline_operations_sandbox_pending_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [biz:workline:simulate-estop] 沙箱模拟 WorkLine 软件急停冻结
         * @description 沙箱专用安全模拟入口；不通过普通 sandbox event 流。
         */
        post: operations["workline_operations_sandbox_worklines_by_workline_id_simulate_estop_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/worklines/{workline_id}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [biz:workline:start] 启动 WorkLine 并激活运行代际
         * @description In one transaction replay or create the complete Epoch, then wake SYSTEM outbox.
         */
        post: operations["workline_operations_worklines_by_workline_id_start_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime-operations/northbound": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [sys:runtime-operations:view] 获取北向 operation 运维快照
         * @description 只允许 Service 读取 owner-scoped 聚合 SLI；不得返回 payload/trace/secret。
         */
        get: operations["workline_runtime_operations_northbound_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:create] 创建WorkLine */
        post: operations["work_lines_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:detail] 获取WorkLine */
        get: operations["work_lines_get"];
        /** [biz:workline:update] 更新WorkLine */
        put: operations["work_lines_update"];
        post?: never;
        /** [biz:workline:delete] 删除WorkLine */
        delete: operations["work_lines_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [biz:workline:activate] 启用作业线
         * @description 通过配置预检后启用 WorkLine。
         */
        post: operations["workline_work_lines_by_id_activate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/active-objects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:workline:active-objects] 查询作业线当前 active objects
         * @description 读取 WorklineActiveObjects；API 层不直接访问 repository。
         */
        get: operations["workline_work_lines_by_id_active_objects_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/configuration-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:workline:configuration-status] 查询作业线配置状态
         * @description 查询 WorkLine 启用前配置状态。
         */
        get: operations["workline_work_lines_by_id_configuration_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [biz:workline:deactivate] 停用作业线
         * @description 确认无未完成运行负载后停用 WorkLine。
         */
        post: operations["workline_work_lines_by_id_deactivate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [biz:workline:permanent_delete] 永久删除WorkLine */
        delete: operations["work_lines_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/plane/scene": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:workline:view-plane-scene] 获取作业线平面静态场景
         * @description 读取 WorkLine 平面态势静态 scene。
         */
        get: operations["workline_work_lines_by_id_plane_scene_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/plane/snapshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:workline:view-plane-snapshot] 获取作业线平面动态快照
         * @description 读取 WorkLine 平面态势动态 snapshot。
         */
        get: operations["workline_work_lines_by_id_plane_snapshot_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:restore] 恢复WorkLine */
        post: operations["work_lines_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:list] 获取WorkLine列表 */
        post: operations["work_lines_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:trash] 获取已删除WorkLine */
        get: operations["work_lines_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [biz:workline:batch_permanent_delete] 批量永久删除WorkLine */
        delete: operations["work_lines_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/work_lines/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:batch_restore] 批量恢复WorkLine */
        post: operations["work_lines_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** _BinExchangeData */
        _BinExchangeData: {
            /** Exchange Pairs */
            exchange_pairs: components["schemas"]["_BinExchangePair"][];
        };
        /** _BinExchangeDebugTask */
        _BinExchangeDebugTask: {
            /** Client Request Id */
            client_request_id: string;
            data: components["schemas"]["_BinExchangeData"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "BIN_EXCHANGE";
            /** Station Id */
            station_id?: string | null;
        };
        /** _BinExchangePair */
        _BinExchangePair: {
            /** Left Bin Id */
            left_bin_id: string;
            left_location: components["schemas"]["_RackBinSlot"];
            /** Right Bin Id */
            right_bin_id: string;
            right_location: components["schemas"]["_RackBinSlot"];
        };
        /** _BinMoveData */
        _BinMoveData: {
            /** Moves */
            moves: components["schemas"]["_BinMoveMember"][];
        };
        /** _BinMoveDebugTask */
        _BinMoveDebugTask: {
            /** Client Request Id */
            client_request_id: string;
            data: components["schemas"]["_BinMoveData"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "BIN_MOVE";
            /** Station Id */
            station_id?: string | null;
        };
        /** _BinMoveMember */
        _BinMoveMember: {
            /** Bin Id */
            bin_id: string;
            source: components["schemas"]["_BinPosition"];
            target: components["schemas"]["_BinPosition"];
        };
        _BinPosition: components["schemas"]["_RackBinSlot"] | components["schemas"]["_HandoffPosition"];
        _DebugTransportTaskRequest: components["schemas"]["_RackMoveDebugTask"] | components["schemas"]["_RackRotateDebugTask"] | components["schemas"]["_BinMoveDebugTask"] | components["schemas"]["_BinExchangeDebugTask"];
        /** _HandoffPosition */
        _HandoffPosition: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "HANDOFF_POSITION";
            /** Location Code */
            location_code: string;
        };
        /** _RackBinSlot */
        _RackBinSlot: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "RACK_BIN_SLOT";
            rack_face: components["schemas"]["RackFace"];
            /** Rack Id */
            rack_id: string;
            /** Slot Id */
            slot_id: string;
        };
        /** _RackMoveData */
        _RackMoveData: {
            /** Rack Id */
            rack_id: string;
            source: components["schemas"]["_RackPosition"];
            target: components["schemas"]["_RackPosition"];
            target_face: components["schemas"]["RackFace"];
        };
        /** _RackMoveDebugTask */
        _RackMoveDebugTask: {
            /** Client Request Id */
            client_request_id: string;
            data: components["schemas"]["_RackMoveData"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "RACK_MOVE";
            /** Station Id */
            station_id?: string | null;
        };
        /** _RackPosition */
        _RackPosition: {
            /**
             * Kind
             * @constant
             */
            kind: "RACK_POSITION";
            /** Location Code */
            location_code: string;
        };
        /** _RackRotateData */
        _RackRotateData: {
            position: components["schemas"]["_RackPosition"];
            /** Rack Id */
            rack_id: string;
            target_face: components["schemas"]["RackFace"];
        };
        /** _RackRotateDebugTask */
        _RackRotateDebugTask: {
            /** Client Request Id */
            client_request_id: string;
            data: components["schemas"]["_RackRotateData"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "RACK_ROTATE";
            /** Station Id */
            station_id?: string | null;
        };
        /**
         * ActiveSessionsResponse
         * @description 活跃会话列表响应 Schema
         *
         *     包含用户所有活跃会话
         */
        ActiveSessionsResponse: {
            /**
             * Sessions
             * @description 会话列表
             */
            sessions: components["schemas"]["SessionInfo"][];
            /**
             * Total
             * @description 活跃会话总数
             */
            total: number;
        };
        /** APIAccessLogResponse */
        APIAccessLogResponse: {
            /**
             * App Id
             * @description 应用ID
             */
            app_id: string;
            /**
             * App Name
             * @description 应用名称
             */
            app_name: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Error Message
             * @description 错误信息
             */
            error_message?: string | null;
            /** Id */
            id: number;
            /**
             * Ip Address
             * @description 客户端IP
             */
            ip_address: string;
            /**
             * Method
             * @description HTTP方法
             */
            method: string;
            /**
             * Path
             * @description 请求路径
             */
            path: string;
            /**
             * Request Id
             * @description 请求ID
             */
            request_id: string;
            /**
             * Response Time Ms
             * @description 响应时间(毫秒)
             */
            response_time_ms: number;
            /**
             * Status Code
             * @description 响应状态码
             */
            status_code: number;
            /**
             * User Agent
             * @description User-Agent
             */
            user_agent?: string | null;
        };
        /** APIApplicationCreate */
        APIApplicationCreate: {
            /**
             * App Name
             * @description 应用名称
             */
            app_name: string;
            /**
             * @description 应用类型
             * @default ECS
             */
            app_type: components["schemas"]["AppType"];
            /**
             * Description
             * @description 应用描述
             */
            description?: string | null;
            /**
             * Ip Whitelist
             * @description IP白名单
             */
            ip_whitelist?: string[] | null;
            /**
             * Rate Limit Per Hour
             * @description 每小时请求限制
             * @default 5000
             */
            rate_limit_per_hour: number;
            /**
             * Rate Limit Per Minute
             * @description 每分钟请求限制
             * @default 100
             */
            rate_limit_per_minute: number;
            /**
             * @description 有效期时长
             * @default 1y
             */
            validity_period: components["schemas"]["ValidityPeriod"];
        };
        /** APIApplicationResponse */
        APIApplicationResponse: {
            /** App Id */
            app_id: string;
            /**
             * App Name
             * @description 应用名称
             */
            app_name: string;
            /**
             * @description 应用类型
             * @default ECS
             */
            app_type: components["schemas"]["AppType"];
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Created By */
            created_by?: number | null;
            /** Deleted At */
            deleted_at?: string | null;
            /** Deleted By */
            deleted_by?: number | null;
            /**
             * Description
             * @description 应用描述
             */
            description?: string | null;
            /** Expires At */
            expires_at?: string | null;
            /** Id */
            id?: number | null;
            /**
             * Ip Whitelist
             * @description IP白名单
             */
            ip_whitelist?: string[] | null;
            /**
             * Is Deleted
             * @default false
             */
            is_deleted: boolean;
            /** Permissions */
            permissions?: components["schemas"]["PermissionResponse"][];
            /**
             * Rate Limit Per Hour
             * @description 每小时请求限制
             * @default 5000
             */
            rate_limit_per_hour: number;
            /**
             * Rate Limit Per Minute
             * @description 每分钟请求限制
             * @default 100
             */
            rate_limit_per_minute: number;
            /**
             * Remaining Days
             * @description 剩余天数
             */
            readonly remaining_days: number | null;
            /** @default active */
            status: components["schemas"]["AppStatus"];
            /** Updated At */
            updated_at?: string | null;
            /** Updated By */
            updated_by?: number | null;
            /**
             * @description 有效期时长
             * @default 1y
             */
            validity_period: components["schemas"]["ValidityPeriod"];
            /**
             * Version
             * @default 0
             */
            version: number;
        };
        /** APIApplicationUpdate */
        APIApplicationUpdate: {
            /**
             * App Name
             * @description 应用名称
             */
            app_name?: string | null;
            /** @description 应用类型 */
            app_type?: components["schemas"]["AppType"] | null;
            /**
             * Description
             * @description 应用描述
             */
            description?: string | null;
            /**
             * Ip Whitelist
             * @description IP白名单
             */
            ip_whitelist?: string[] | null;
            /**
             * Rate Limit Per Hour
             * @description 每小时请求限制
             */
            rate_limit_per_hour?: number | null;
            /**
             * Rate Limit Per Minute
             * @description 每分钟请求限制
             */
            rate_limit_per_minute?: number | null;
            /** @description 有效期时长 */
            validity_period?: components["schemas"]["ValidityPeriod"] | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /**
         * ApiPermissionInfo
         * @description API 权限信息 Schema
         *
         *     描述单个 API 权限的详细信息
         */
        ApiPermissionInfo: {
            /**
             * Action
             * @description 操作：create、read、update、delete、list 等
             */
            action?: string | null;
            /**
             * Category
             * @description 权限分类：admin、system、business 等
             */
            category?: string | null;
            /**
             * Description
             * @description 权限描述
             */
            description?: string | null;
            /**
             * Id
             * @description 权限 ID
             */
            id: number;
            /**
             * Method
             * @description HTTP 方法：GET、POST、PUT、DELETE、PATCH 等
             */
            method?: string | null;
            /**
             * Name
             * @description 权限标识，如 admin:user:create
             */
            name: string;
            /**
             * Path
             * @description API 路径：/admin/users/{id}、/api/v1/warehouses 等
             */
            path?: string | null;
            /**
             * Resource
             * @description 资源类型：user、role、permission、warehouse 等
             */
            resource?: string | null;
            /**
             * Type
             * @description 权限类型：user_api（内部管理API）、app_api（外部应用API）
             */
            type: string;
        };
        /**
         * AppStatus
         * @enum {string}
         */
        AppStatus: "active" | "revoked" | "expired";
        /**
         * AppType
         * @enum {string}
         */
        AppType: "ECS" | "RCS" | "WMS" | "Third-Party";
        /**
         * AssignRolesRequest
         * @description 为用户分配角色请求
         */
        AssignRolesRequest: {
            /**
             * Role Ids
             * @description 角色 ID 列表
             */
            role_ids: number[];
        };
        /**
         * AuditLogResponse
         * @description AuditLog 响应 Schema
         */
        AuditLogResponse: {
            /**
             * Action
             * @description 审计动作
             */
            action?: string | null;
            /** Args */
            args?: {
                [key: string]: unknown;
            } | null;
            /** Browser */
            browser?: string | null;
            /**
             * Change Summary
             * @description 变更摘要
             */
            change_summary?: string | null;
            /** City */
            city?: string | null;
            /** Code */
            code: string;
            /** Cost Time */
            cost_time: number;
            /** Country */
            country?: string | null;
            /** Device */
            device?: string | null;
            /** Id */
            id: number;
            /** Ip */
            ip: string;
            /** Method */
            method: string;
            /** Msg */
            msg?: string | null;
            /**
             * Object Id
             * @description 审计对象标识
             */
            object_id?: string | null;
            /**
             * Object Type
             * @description 审计对象类型
             */
            object_type?: string | null;
            /**
             * Opera Time
             * Format: date-time
             */
            opera_time?: string;
            /** Os */
            os?: string | null;
            /** Path */
            path: string;
            /** Region */
            region?: string | null;
            /**
             * @description 操作状态
             * @default SUCCESS
             */
            status: components["schemas"]["OperaStatus"];
            /** Title */
            title: string;
            /** Trace Id */
            trace_id: string;
            /** User Agent */
            user_agent: string;
            /** Username */
            username?: string | null;
        };
        /**
         * AuthMyResponse
         * @description 当前登录用户上下文响应 Schema
         *
         *     一次性返回前端初始化所需核心数据：
         *     - 当前用户信息
         *     - API 权限列表
         */
        AuthMyResponse: {
            /**
             * Permissions
             * @description 当前用户 API 权限列表
             */
            permissions: components["schemas"]["ApiPermissionInfo"][];
            /** @description 当前用户信息 */
            user: components["schemas"]["UserResponse"];
        };
        /**
         * BatchOperationResponseModel
         * @description 批量操作响应模型
         *
         *     专门用于批量操作的响应模型。
         *
         *     Example:
         *         ```python
         *         @router.post('/users/batch', response_model=BatchOperationResponseModel)
         *         def batch_create_users(users: List[UserCreate]) -> BatchOperationResponseModel:
         *             result = process_batch_create(users)
         *             return BatchOperationResponseModel(
         *                 code=SuccessCode.CREATED,
         *                 data=result
         *             )
         *         ```
         */
        BatchOperationResponseModel: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["BatchOperationResult"] | null;
            /**
             * Message
             * @description 响应消息
             * @default 操作成功
             * @example 操作成功
             * @example 参数错误
             */
            message: string;
            /**
             * Timestamp
             * @description 响应时间戳(ISO 8601格式)
             * @example 2024-01-01T00:00:00Z
             */
            timestamp?: string;
        };
        /**
         * BatchOperationResult
         * @description 批量操作结果模型
         *
         *     用于批量操作（如批量创建、批量更新、批量删除）的响应数据。
         *
         *     Attributes:
         *         success: 成功数量
         *         failed: 失败数量
         *         total: 总数量
         *         results: 详细结果列表（可选）
         *         errors: 错误信息列表（可选）
         *
         *     Example:
         *         ```python
         *         result = BatchOperationResult(
         *             success=8,
         *             failed=2,
         *             total=10,
         *             errors=[
         *                 {"index": 3, "message": "参数错误"},
         *                 {"index": 7, "message": "权限不足"}
         *             ]
         *         )
         *         ```
         */
        BatchOperationResult: {
            /**
             * Errors
             * @description 错误信息列表
             */
            errors?: {
                [key: string]: unknown;
            }[] | null;
            /**
             * Failed
             * @description 失败数量
             * @default 0
             */
            failed: number;
            /**
             * Results
             * @description 详细结果列表
             */
            results?: unknown[] | null;
            /**
             * Success
             * @description 成功数量
             * @default 0
             */
            success: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /**
         * BinCellOccupancyResponse
         * @description 料箱格位聚合占用响应 Schema。
         */
        BinCellOccupancyResponse: {
            /**
             * Bin Cell Code
             * @description 料箱内部格位编码
             */
            bin_cell_code?: string | null;
            /**
             * Bin Cell Index
             * @description 料箱内部格位序号
             */
            bin_cell_index: string;
            /**
             * Bin Code
             * @description 料箱编码
             */
            bin_code: string;
            /**
             * Capacity Depth Mm
             * @description 当前格位可用总深度
             */
            capacity_depth_mm?: string | null;
            /**
             * Date Code
             * @description 格位聚合键快照；料盘属性权威以 material_units 为准
             */
            date_code?: string | null;
            /**
             * Ended At
             * @description 格位占用结束时间
             */
            ended_at?: string | null;
            /** Id */
            id: number;
            /**
             * Lot Code
             * @description 格位聚合键快照；料盘属性权威以 material_units 为准
             */
            lot_code?: string | null;
            /**
             * Material Code
             * @description 格位聚合键引用；料盘属性权威以 material_units 为准
             */
            material_code?: string | null;
            /**
             * Material Identity Key
             * @description 格位聚合键；料盘属性权威以 material_units 为准
             */
            material_identity_key: string;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
            /**
             * @description 格位聚合占用状态
             * @default UNKNOWN
             */
            occupancy_status: components["schemas"]["BinCellOccupancyStatus"];
            /**
             * Reel Count
             * @description 当前格位内 active 料盘数量
             * @default 0
             */
            reel_count: number;
            /**
             * Remaining Depth Mm
             * @description 当前格位剩余深度
             */
            remaining_depth_mm?: string | null;
            /**
             * Source Event Id
             * @description 最近来源事件 ID
             */
            source_event_id: string;
            /** @description 来源系统 */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * Started At
             * Format: date-time
             * @description 首次占用确认时间
             */
            started_at: string;
            /**
             * Trace Id
             * @description WorkLine trace
             */
            trace_id?: string | null;
            /**
             * Used Depth Mm
             * @description 当前格位已使用深度
             * @default 0
             */
            used_depth_mm: string;
            /**
             * Workline Session Id
             * @description 最近关联 workline_sessions.id
             */
            workline_session_id?: number | null;
        };
        /**
         * BinCellOccupancyStatus
         * @description 料箱格位聚合占用状态。
         * @enum {string}
         */
        BinCellOccupancyStatus: "OCCUPIED" | "FULL" | "REMOVED" | "UNKNOWN";
        /**
         * BinContentSnapshotItemResponse
         * @description 料箱内容快照明细响应 Schema。
         */
        BinContentSnapshotItemResponse: {
            /**
             * Bin Cell Code
             * @description 料箱内部格位编码
             */
            bin_cell_code?: string | null;
            /**
             * Bin Cell Index
             * @description 料箱内部格位序号
             */
            bin_cell_index?: string | null;
            /**
             * Date Code
             * @description Date Code
             */
            date_code?: string | null;
            /**
             * Dims Json
             * @description 尺寸
             */
            dims_json?: {
                [key: string]: unknown;
            };
            /** Id */
            id: number;
            /**
             * Lot Code
             * @description 批次展示字段
             */
            lot_code?: string | null;
            /**
             * Material Code
             * @description 物料编码引用
             */
            material_code?: string | null;
            /**
             * Pkg Code
             * @description PKG 展示字段
             */
            pkg_code?: string | null;
            /**
             * Qty Snapshot
             * @description 当时执行过程看到的数量
             */
            qty_snapshot?: number | null;
            /**
             * Snapshot Id
             * @description 所属快照业务 ID
             */
            snapshot_id: string;
            /**
             * Thickness Mm
             * @description 厚度
             */
            thickness_mm?: number | null;
            /**
             * Vendor Code
             * @description 供应商引用
             */
            vendor_code?: string | null;
            /**
             * Wms Inventory Id
             * @description WMS 库存记录引用
             */
            wms_inventory_id?: string | null;
        };
        /**
         * BinContentSnapshotResponse
         * @description 料箱内容快照头响应 Schema。
         */
        BinContentSnapshotResponse: {
            /**
             * Bin Code
             * @description 料箱编码
             */
            bin_code: string;
            /**
             * Captured At
             * Format: date-time
             * @description 快照时间
             */
            captured_at: string;
            /** Id */
            id: number;
            /**
             * Snapshot Group Key
             * @description 快照分组键
             */
            snapshot_group_key?: string | null;
            /**
             * Snapshot Hash
             * @description 快照头和明细稳定摘要
             */
            snapshot_hash: string;
            /**
             * Snapshot Id
             * @description 快照业务 ID
             */
            snapshot_id: string;
            /**
             * Snapshot Reason
             * @description 快照原因
             */
            snapshot_reason?: string | null;
            /**
             * @description 快照完整性
             * @default UNKNOWN
             */
            snapshot_status: components["schemas"]["BinContentSnapshotStatus"];
            /**
             * Source Event Id
             * @description 来源事件或命令结果
             */
            source_event_id?: string | null;
            /**
             * Source Session Id
             * @description 产生快照的 WorklineSession
             */
            source_session_id?: number | null;
            /**
             * Wms Snapshot Version
             * @description WMS 查询版本或时间
             */
            wms_snapshot_version?: string | null;
        };
        /**
         * BinContentSnapshotStatus
         * @description 料箱内容快照完整性。
         * @enum {string}
         */
        BinContentSnapshotStatus: "COMPLETE" | "PARTIAL" | "UNKNOWN";
        /**
         * BinMaterialMountResponse
         * @description 物料料箱格位投影响应 Schema。
         */
        BinMaterialMountResponse: {
            /**
             * Bin Cell Code
             * @description 料箱内部格位编码
             */
            bin_cell_code?: string | null;
            /**
             * Bin Cell Index
             * @description 料箱内部格位序号
             */
            bin_cell_index: string;
            /**
             * Bin Cell Occupancy Id
             * @description 关联料箱格位聚合占用 ID
             */
            bin_cell_occupancy_id?: number | null;
            /**
             * Bin Code
             * @description 料箱编码
             */
            bin_code: string;
            /**
             * Cell Stack Position
             * @description 同一料格内入格顺序，1 为最早入格
             * @default 1
             */
            cell_stack_position: number;
            /**
             * Date Code
             * @description 事件证据快照；料盘属性主源以 material_units 为准
             */
            date_code?: string | null;
            /**
             * Ended At
             * @description 离开料箱格位时间
             */
            ended_at?: string | null;
            /** Id */
            id: number;
            /**
             * Lot Code
             * @description 事件证据快照；料盘属性主源以 material_units 为准
             */
            lot_code?: string | null;
            /**
             * Material Code
             * @description 事件证据快照；料盘属性主源以 material_units 为准
             */
            material_code?: string | null;
            /**
             * Material Identity Key
             * @description 事件证据快照；料盘属性主源以 material_units 为准
             */
            material_identity_key: string;
            /**
             * @description 物料占用状态
             * @default UNKNOWN
             */
            mount_status: components["schemas"]["BinMaterialMountStatus"];
            /**
             * Pkg Code
             * @description PKG 展示字段
             */
            pkg_code?: string | null;
            /**
             * Qty Snapshot
             * @description 当时执行过程看到的数量
             */
            qty_snapshot?: number | null;
            /**
             * Reel Diameter
             * @description 料盘直径
             */
            reel_diameter?: string | null;
            /**
             * Reel Thickness
             * @description 料盘厚度
             */
            reel_thickness?: string | null;
            /**
             * Source Event Id
             * @description 来源事件 ID
             */
            source_event_id: string;
            /** @description 来源系统 */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * Started At
             * Format: date-time
             * @description 占用确认时间
             */
            started_at: string;
            /**
             * Trace Id
             * @description WorkLine trace
             */
            trace_id?: string | null;
            /**
             * Wms Inventory Id
             * @description WMS 库存记录引用
             */
            wms_inventory_id?: string | null;
            /**
             * Wms Inventory Version
             * @description WMS 库存或分拆版本引用
             */
            wms_inventory_version?: string | null;
            /**
             * Workline Session Id
             * @description 关联 workline_sessions.id
             */
            workline_session_id?: number | null;
            /**
             * Writeback Evidence Id
             * @description 关联 WMS 回写证据
             */
            writeback_evidence_id?: number | null;
        };
        /**
         * BinMaterialMountStatus
         * @description 物料料箱格位投影状态。
         * @enum {string}
         */
        BinMaterialMountStatus: "OCCUPIED" | "REMOVED" | "LOCKED" | "UNKNOWN";
        /**
         * BinResponse
         * @description 料箱实例响应 Schema。
         */
        BinResponse: {
            /**
             * Bin Code
             * @description WES 料箱编码
             */
            bin_code: string;
            /**
             * Bin Type Code
             * @description 料箱类型编码
             */
            bin_type_code: string;
            /** Id */
            id: number;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
            /**
             * @description 来源系统
             * @default MANUAL_IMPORT
             */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * @description 料箱主数据状态
             * @default ACTIVE
             */
            status: components["schemas"]["ResourceMasterStatus"];
            /**
             * Wms Bin Id
             * @description WMS 料箱 ID
             */
            wms_bin_id?: string | null;
        };
        /**
         * BinSlotSize
         * @description 料箱内部槽位尺寸。
         * @enum {string}
         */
        BinSlotSize: "7INCH" | "13INCH" | "15INCH" | "LARGE";
        /**
         * BinSlotTemplateResponse
         * @description 料箱槽位模板响应 Schema。
         */
        BinSlotTemplateResponse: {
            /**
             * Active
             * @description 是否启用
             * @default true
             */
            active: boolean;
            /**
             * Bin Slot Code
             * @description 料箱内槽位编码
             */
            bin_slot_code: string;
            /**
             * Bin Slot Index
             * @description 料箱内槽位权威序号
             */
            bin_slot_index: number;
            /**
             * Bin Type Code
             * @description 所属料箱类型编码
             */
            bin_type_code: string;
            /** Id */
            id: number;
            /**
             * Max Depth Mm
             * @description 最大深度
             */
            max_depth_mm?: number | null;
            /**
             * Max Weight G
             * @description 最大重量
             */
            max_weight_g?: number | null;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
            /** @description 槽位尺寸 */
            slot_size: components["schemas"]["BinSlotSize"];
        };
        /**
         * BinTypeResponse
         * @description 料箱类型响应 Schema。
         */
        BinTypeResponse: {
            /**
             * Active
             * @description 是否启用
             * @default true
             */
            active: boolean;
            /**
             * Bin Type Code
             * @description 料箱类型编码
             */
            bin_type_code: string;
            /**
             * Bin Type Name
             * @description 料箱类型名称
             */
            bin_type_name: string;
            /**
             * Description
             * @description 说明
             */
            description?: string | null;
            /** Id */
            id: number;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
        };
        /** Body_api_auth_applications_by_id_permissions_post */
        Body_api_auth_applications_by_id_permissions_post: {
            /** Permission Ids */
            permission_ids: number[];
        };
        /**
         * CallbackLogResponse
         * @description 回调日志响应 Schema
         */
        CallbackLogResponse: {
            /** Callback Type */
            callback_type: string;
            /** Causation Id */
            causation_id: string | null;
            /** Client Ip */
            client_ip: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Error Message */
            error_message: string | null;
            /** Event Id */
            event_id: string | null;
            /** Failure Stage */
            failure_stage: string | null;
            /** Id */
            id: number;
            /** Ingress Outcome */
            ingress_outcome: string | null;
            /** Request Body */
            request_body: {
                [key: string]: unknown;
            };
            /** Request Id */
            request_id: string | null;
            /** Response Status */
            response_status: number;
            /** Response Time Ms */
            response_time_ms: number;
            /** Subject Code */
            subject_code: string;
            /** Trace Id */
            trace_id: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** User Agent */
            user_agent: string | null;
        };
        /**
         * CallbackLogSubjectResponse
         * @description 回调主体维度回调日志列表响应。
         */
        CallbackLogSubjectResponse: {
            /**
             * Count
             * @description 回调日志数量
             */
            count: number;
            /**
             * Items
             * @description 回调日志列表
             */
            items: components["schemas"]["CallbackLogResponse"][];
            /**
             * Subject Code
             * @description 回调主体编码
             */
            subject_code: string;
        };
        /**
         * CallbackLogTraceResponse
         * @description Trace 维度回调日志列表响应。
         */
        CallbackLogTraceResponse: {
            /**
             * Count
             * @description 回调日志数量
             */
            count: number;
            /**
             * Items
             * @description 回调日志列表
             */
            items: components["schemas"]["CallbackLogResponse"][];
            /**
             * Trace Id
             * @description Trace ID
             */
            trace_id: string;
        };
        /**
         * ClearWorkLineEstopRequest
         * @description 人工清除 WorkLine 急停请求。
         */
        ClearWorkLineEstopRequest: {
            /**
             * Checks
             * @description 恢复 checklist；所有项必须为 true
             */
            checks?: {
                [key: string]: boolean;
            };
            /**
             * Reason
             * @description 恢复说明
             */
            reason?: string | null;
        };
        /** DebugTransportTaskCreated */
        DebugTransportTaskCreated: {
            /** Client Request Id */
            client_request_id: string;
            /** Transport Task Id */
            transport_task_id: string;
        };
        /** DeviceCommandCallbackResponse */
        DeviceCommandCallbackResponse: {
            /** Apply Status */
            apply_status: string;
            /** Data */
            data: {
                [key: string]: unknown;
            };
            /** Error Detail */
            error_detail: {
                [key: string]: unknown;
            } | null;
            /** Received At */
            received_at: string;
            /** Result */
            result: string;
            /** Source Event Id */
            source_event_id: string;
        };
        /**
         * DeviceCreate
         * @description 设备创建合同。
         */
        DeviceCreate: {
            /** Description */
            description?: string | null;
            /**
             * Device Code
             * @description 独立命令资源编码
             */
            device_code: string;
            /**
             * Device Name
             * @description 设备名称
             */
            device_name: string;
            /**
             * Device Role
             * @description 物理拓扑角色
             */
            device_role: string;
            /** Diagnostic Profile */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /** Endpoint Base Url */
            endpoint_base_url?: string | null;
            /**
             * Is Active
             * @description 是否允许进入新运行代际
             * @default true
             */
            is_active: boolean;
            /**
             * Role Index
             * @default 1
             */
            role_index: number;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /** Upstream Device Id */
            upstream_device_id?: number | null;
            /** Work Line Id */
            work_line_id?: number | null;
        };
        /**
         * DeviceIngressKind
         * @enum {string}
         */
        DeviceIngressKind: "DEVICE_RESULT" | "DEVICE_EVENT";
        /**
         * DeviceResponse
         * @description 设备静态主数据响应。
         */
        DeviceResponse: {
            /** Description */
            description?: string | null;
            /**
             * Device Code
             * @description 独立命令资源编码
             */
            device_code: string;
            /**
             * Device Name
             * @description 设备名称
             */
            device_name: string;
            /**
             * Device Role
             * @description 物理拓扑角色
             */
            device_role: string;
            /** Diagnostic Profile */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /** Endpoint Base Url */
            endpoint_base_url?: string | null;
            /** Id */
            id: number;
            /**
             * Is Active
             * @description 是否允许进入新运行代际
             * @default true
             */
            is_active: boolean;
            /**
             * Role Index
             * @default 1
             */
            role_index: number;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /** Upstream Device Id */
            upstream_device_id?: number | null;
            /** Version */
            version: number;
            /** Work Line Id */
            work_line_id?: number | null;
        };
        /**
         * DeviceUpdate
         * @description 设备静态主数据更新合同。
         */
        DeviceUpdate: {
            /** Description */
            description?: string | null;
            /** Device Code */
            device_code?: string | null;
            /** Device Name */
            device_name?: string | null;
            /** Device Role */
            device_role?: string | null;
            /** Diagnostic Profile */
            diagnostic_profile?: {
                [key: string]: unknown;
            } | null;
            /** Endpoint Base Url */
            endpoint_base_url?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Role Index */
            role_index?: number | null;
            /** Sort Order */
            sort_order?: number | null;
            /** Upstream Device Id */
            upstream_device_id?: number | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
            /** Work Line Id */
            work_line_id?: number | null;
        };
        /** EcsCallbackAck */
        EcsCallbackAck: {
            /** Code */
            code: number;
            error_detail?: components["schemas"]["EcsCallbackRejectionDetail"] | null;
            /** Message */
            message: string;
        };
        /** EcsCallbackRejectionDetail */
        EcsCallbackRejectionDetail: {
            /** Issues */
            issues: components["schemas"]["EcsCallbackValidationIssue"][];
        };
        /** EcsCallbackValidationIssue */
        EcsCallbackValidationIssue: {
            /** Code */
            code: string;
            /** Expected */
            expected?: string | null;
            /** Field */
            field: string;
        };
        /**
         * EcsDeviceInfo
         * @description ECS 返回的设备静态描述。
         */
        EcsDeviceInfo: {
            /** Device Code */
            device_code: string;
            /** Device Name */
            device_name: string | null;
            /** Device Type */
            device_type: string | null;
            /** Role */
            role: string | null;
            /** Supported Commands */
            supported_commands: string[] | null;
            /** Supported Events */
            supported_events: string[] | null;
        };
        /**
         * EcsDeviceMode
         * @enum {string}
         */
        EcsDeviceMode: "AUTO" | "MANUAL" | "MAINTENANCE" | "UNKNOWN";
        /**
         * EcsDeviceRuntimeState
         * @description ECS 返回的设备运行状态。
         */
        EcsDeviceRuntimeState: {
            /** Current Command Code */
            current_command_code: string | null;
            /** Device Code */
            device_code: string;
            /** Is Online */
            is_online: boolean;
            mode: components["schemas"]["EcsDeviceMode"];
            /** Scenario */
            scenario: string | null;
            status: components["schemas"]["EcsDeviceState"];
            /** Updated At */
            updated_at: number;
        };
        /**
         * EcsDeviceState
         * @enum {string}
         */
        EcsDeviceState: "IDLE" | "RUNNING" | "ERROR" | "PAUSED" | "STOPPED" | "OFFLINE" | "UNKNOWN";
        /** EventCommandBlockResponse */
        EventCommandBlockResponse: {
            /** Block Id */
            block_id: number;
            /** Blocked At */
            blocked_at: string | null;
            /** Blocking Command Code */
            blocking_command_code: string;
            /** Blocking Command Current Status */
            blocking_command_current_status: string | null;
            /** Blocking Command Detected Reconciliation Reason */
            blocking_command_detected_reconciliation_reason: string | null;
            /** Blocking Command Detected Status */
            blocking_command_detected_status: string;
            /** Blocking Command Terminal */
            blocking_command_terminal: boolean;
            /** Device Code */
            device_code: string;
            /** Reason Code */
            reason_code: string;
            /** Reconcile Device Idle Path */
            reconcile_device_idle_path: string;
            /** Reprocess Path */
            reprocess_path: string;
            /** Requeued At */
            requeued_at: string | null;
            /** Source Event Id */
            source_event_id: string;
            /** Status */
            status: string;
        };
        /**
         * FilterCondition
         * @description 单个过滤条件
         */
        FilterCondition: {
            /** Field */
            field: string;
            op: components["schemas"]["FilterOperator"];
            /** Value */
            value?: unknown | null;
        };
        /**
         * FilterGroup
         * @description 过滤条件组
         * @example {
         *       "conditions": [
         *         {
         *           "field": "id",
         *           "op": "gt",
         *           "value": 1
         *         }
         *       ],
         *       "couple": "and"
         *     }
         */
        FilterGroup: {
            /** Conditions */
            conditions?: (components["schemas"]["FilterCondition"] | components["schemas"]["FilterGroup"])[];
            /**
             * Couple
             * @default and
             * @enum {string}
             */
            couple: "and" | "or" | "not";
        };
        /**
         * FilterOperator
         * @description 过滤操作符
         * @enum {string}
         */
        FilterOperator: "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "in" | "nin" | "ilike" | "between" | "is_null" | "not_null";
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * InboundEvidenceApplyStatus
         * @enum {string}
         */
        InboundEvidenceApplyStatus: "PENDING" | "APPLIED" | "IGNORED" | "RECONCILING";
        /**
         * LineType
         * @description 作业线类型枚举。
         * @enum {string}
         */
        LineType: "AUTO" | "MANUAL" | "HYBRID";
        /** ListResponseData[APIAccessLogResponse] */
        ListResponseData_APIAccessLogResponse_: ApiListData<components["schemas"]["APIAccessLogResponse"]>;
        /** ListResponseData[APIApplicationResponse] */
        ListResponseData_APIApplicationResponse_: ApiListData<components["schemas"]["APIApplicationResponse"]>;
        /** ListResponseData[AuditLogResponse] */
        ListResponseData_AuditLogResponse_: ApiListData<components["schemas"]["AuditLogResponse"]>;
        /** ListResponseData[BinCellOccupancyResponse] */
        ListResponseData_BinCellOccupancyResponse_: ApiListData<components["schemas"]["BinCellOccupancyResponse"]>;
        /** ListResponseData[BinContentSnapshotItemResponse] */
        ListResponseData_BinContentSnapshotItemResponse_: ApiListData<components["schemas"]["BinContentSnapshotItemResponse"]>;
        /** ListResponseData[BinContentSnapshotResponse] */
        ListResponseData_BinContentSnapshotResponse_: ApiListData<components["schemas"]["BinContentSnapshotResponse"]>;
        /** ListResponseData[BinMaterialMountResponse] */
        ListResponseData_BinMaterialMountResponse_: ApiListData<components["schemas"]["BinMaterialMountResponse"]>;
        /** ListResponseData[BinResponse] */
        ListResponseData_BinResponse_: ApiListData<components["schemas"]["BinResponse"]>;
        /** ListResponseData[BinSlotTemplateResponse] */
        ListResponseData_BinSlotTemplateResponse_: ApiListData<components["schemas"]["BinSlotTemplateResponse"]>;
        /** ListResponseData[BinTypeResponse] */
        ListResponseData_BinTypeResponse_: ApiListData<components["schemas"]["BinTypeResponse"]>;
        /** ListResponseData[CallbackLogResponse] */
        ListResponseData_CallbackLogResponse_: ApiListData<components["schemas"]["CallbackLogResponse"]>;
        /** ListResponseData[DeviceResponse] */
        ListResponseData_DeviceResponse_: ApiListData<components["schemas"]["DeviceResponse"]>;
        /** ListResponseData[PermissionResponse] */
        ListResponseData_PermissionResponse_: ApiListData<components["schemas"]["PermissionResponse"]>;
        /** ListResponseData[RackBinMountResponse] */
        ListResponseData_RackBinMountResponse_: ApiListData<components["schemas"]["RackBinMountResponse"]>;
        /** ListResponseData[RackPlacementResponse] */
        ListResponseData_RackPlacementResponse_: ApiListData<components["schemas"]["RackPlacementResponse"]>;
        /** ListResponseData[RackResponse] */
        ListResponseData_RackResponse_: ApiListData<components["schemas"]["RackResponse"]>;
        /** ListResponseData[RackSlotTemplateResponse] */
        ListResponseData_RackSlotTemplateResponse_: ApiListData<components["schemas"]["RackSlotTemplateResponse"]>;
        /** ListResponseData[RackTypeResponse] */
        ListResponseData_RackTypeResponse_: ApiListData<components["schemas"]["RackTypeResponse"]>;
        /** ListResponseData[ResourceStateEventResponse] */
        ListResponseData_ResourceStateEventResponse_: ApiListData<components["schemas"]["ResourceStateEventResponse"]>;
        /** ListResponseData[RoleResponse] */
        ListResponseData_RoleResponse_: ApiListData<components["schemas"]["RoleResponse"]>;
        /** ListResponseData[UserResponse] */
        ListResponseData_UserResponse_: ApiListData<components["schemas"]["UserResponse"]>;
        /** ListResponseData[WorkLineResponse] */
        ListResponseData_WorkLineResponse_: ApiListData<components["schemas"]["WorkLineResponse"]>;
        /** ListResponseSchemaModel[APIAccessLogResponse] */
        ListResponseSchemaModel_APIAccessLogResponse_: ApiListResponse<components["schemas"]["APIAccessLogResponse"]>;
        /** ListResponseSchemaModel[APIApplicationResponse] */
        ListResponseSchemaModel_APIApplicationResponse_: ApiListResponse<components["schemas"]["APIApplicationResponse"]>;
        /** ListResponseSchemaModel[AuditLogResponse] */
        ListResponseSchemaModel_AuditLogResponse_: ApiListResponse<components["schemas"]["AuditLogResponse"]>;
        /** ListResponseSchemaModel[BinCellOccupancyResponse] */
        ListResponseSchemaModel_BinCellOccupancyResponse_: ApiListResponse<components["schemas"]["BinCellOccupancyResponse"]>;
        /** ListResponseSchemaModel[BinContentSnapshotItemResponse] */
        ListResponseSchemaModel_BinContentSnapshotItemResponse_: ApiListResponse<components["schemas"]["BinContentSnapshotItemResponse"]>;
        /** ListResponseSchemaModel[BinContentSnapshotResponse] */
        ListResponseSchemaModel_BinContentSnapshotResponse_: ApiListResponse<components["schemas"]["BinContentSnapshotResponse"]>;
        /** ListResponseSchemaModel[BinMaterialMountResponse] */
        ListResponseSchemaModel_BinMaterialMountResponse_: ApiListResponse<components["schemas"]["BinMaterialMountResponse"]>;
        /** ListResponseSchemaModel[BinResponse] */
        ListResponseSchemaModel_BinResponse_: ApiListResponse<components["schemas"]["BinResponse"]>;
        /** ListResponseSchemaModel[BinSlotTemplateResponse] */
        ListResponseSchemaModel_BinSlotTemplateResponse_: ApiListResponse<components["schemas"]["BinSlotTemplateResponse"]>;
        /** ListResponseSchemaModel[BinTypeResponse] */
        ListResponseSchemaModel_BinTypeResponse_: ApiListResponse<components["schemas"]["BinTypeResponse"]>;
        /** ListResponseSchemaModel[CallbackLogResponse] */
        ListResponseSchemaModel_CallbackLogResponse_: ApiListResponse<components["schemas"]["CallbackLogResponse"]>;
        /** ListResponseSchemaModel[DeviceResponse] */
        ListResponseSchemaModel_DeviceResponse_: ApiListResponse<components["schemas"]["DeviceResponse"]>;
        /** ListResponseSchemaModel[PermissionResponse] */
        ListResponseSchemaModel_PermissionResponse_: ApiListResponse<components["schemas"]["PermissionResponse"]>;
        /** ListResponseSchemaModel[RackBinMountResponse] */
        ListResponseSchemaModel_RackBinMountResponse_: ApiListResponse<components["schemas"]["RackBinMountResponse"]>;
        /** ListResponseSchemaModel[RackPlacementResponse] */
        ListResponseSchemaModel_RackPlacementResponse_: ApiListResponse<components["schemas"]["RackPlacementResponse"]>;
        /** ListResponseSchemaModel[RackResponse] */
        ListResponseSchemaModel_RackResponse_: ApiListResponse<components["schemas"]["RackResponse"]>;
        /** ListResponseSchemaModel[RackSlotTemplateResponse] */
        ListResponseSchemaModel_RackSlotTemplateResponse_: ApiListResponse<components["schemas"]["RackSlotTemplateResponse"]>;
        /** ListResponseSchemaModel[RackTypeResponse] */
        ListResponseSchemaModel_RackTypeResponse_: ApiListResponse<components["schemas"]["RackTypeResponse"]>;
        /** ListResponseSchemaModel[ResourceStateEventResponse] */
        ListResponseSchemaModel_ResourceStateEventResponse_: ApiListResponse<components["schemas"]["ResourceStateEventResponse"]>;
        /** ListResponseSchemaModel[RoleResponse] */
        ListResponseSchemaModel_RoleResponse_: ApiListResponse<components["schemas"]["RoleResponse"]>;
        /** ListResponseSchemaModel[UserResponse] */
        ListResponseSchemaModel_UserResponse_: ApiListResponse<components["schemas"]["UserResponse"]>;
        /** ListResponseSchemaModel[WorkLineResponse] */
        ListResponseSchemaModel_WorkLineResponse_: ApiListResponse<components["schemas"]["WorkLineResponse"]>;
        /**
         * LoginRequest
         * @description 登录请求 Schema
         * @example {
         *       "password": "admin123",
         *       "username": "admin"
         *     }
         */
        LoginRequest: {
            /**
             * Password
             * @description 密码
             */
            password: string;
            /**
             * Username
             * @description 用户名
             */
            username: string;
        };
        /**
         * LoginResponse
         * @description 登录响应 Schema
         *
         *     包含访问令牌、刷新令牌元数据和用户信息
         */
        LoginResponse: {
            /**
             * Access Token
             * @description 访问令牌
             */
            access_token: string;
            /**
             * Access Token Expire Time
             * Format: date-time
             * @description 访问令牌过期时间
             */
            access_token_expire_time: string;
            /**
             * Access Token Jti
             * @description 访问令牌唯一标识符（用于撤销）
             */
            access_token_jti: string;
            /**
             * Expires In
             * @description 访问令牌过期时间（秒）- OAuth 2.0 标准字段
             */
            readonly expires_in: number;
            /**
             * Refresh Expires In
             * @description 刷新令牌过期时间（秒）
             */
            readonly refresh_expires_in: number;
            /**
             * Refresh Token Expire Time
             * Format: date-time
             * @description 刷新令牌过期时间（令牌仅存储于 HttpOnly Cookie）
             */
            refresh_token_expire_time: string;
            /**
             * Refresh Token Jti
             * @description 刷新令牌唯一标识符（用于撤销）
             */
            refresh_token_jti: string;
            /**
             * Session Uuid
             * @description 会话 UUID
             */
            session_uuid: string;
            /** @description 用户信息 */
            user: components["schemas"]["UserResponse"];
        };
        /**
         * LogoutResponse
         * @description 登出响应 Schema
         */
        LogoutResponse: {
            /**
             * Message
             * @description 响应消息
             */
            message: string;
            /**
             * Revoked Count
             * @description 撤销的令牌数量
             * @default 0
             */
            revoked_count: number;
        };
        /** ManualDebugDeviceCommandCreate */
        ManualDebugDeviceCommandCreate: {
            /** Client Request Id */
            client_request_id: string;
            /** Device Code */
            device_code: string;
            /** Endpoint Base Url */
            endpoint_base_url: string;
            /** Params */
            params?: {
                [key: string]: unknown;
            };
            /** Reason */
            reason: string;
            /** Task Type */
            task_type: string;
            /** Timeout */
            timeout: number;
        };
        /** ManualDebugDeviceCommandCreated */
        ManualDebugDeviceCommandCreated: {
            /** Client Request Id */
            client_request_id: string;
            /** Command Code */
            command_code: string;
            /** Status */
            status: string;
        };
        /** ManualDebugDeviceCommandResponse */
        ManualDebugDeviceCommandResponse: {
            /** Ack Received At */
            ack_received_at: string | null;
            /** Attempt Count */
            attempt_count: number;
            callback: components["schemas"]["DeviceCommandCallbackResponse"] | null;
            /** Client Request Id */
            client_request_id: string;
            /** Command Code */
            command_code: string;
            /** Command Timeout Ms */
            command_timeout_ms: number;
            /** Completed At */
            completed_at: string | null;
            /** Contract Key */
            contract_key: string;
            /** Contract Version */
            contract_version: string;
            /** Created By */
            created_by: number;
            /** Device Code */
            device_code: string;
            /** Endpoint Base Url */
            endpoint_base_url: string;
            /** Execution Reason */
            execution_reason: string;
            /** Failure Code */
            failure_code: string | null;
            /** Params */
            params: {
                [key: string]: unknown;
            };
            /** Reconciliation Reason */
            reconciliation_reason: string | null;
            /** Status */
            status: string;
            /** Task Type */
            task_type: string;
            /** Trace Id */
            trace_id: string | null;
        };
        /** ManualDebugPreflightDevice */
        ManualDebugPreflightDevice: {
            /** Admissible */
            admissible: boolean;
            device: components["schemas"]["EcsDeviceInfo"];
            /** Rejection Code */
            rejection_code: string | null;
            state: components["schemas"]["EcsDeviceRuntimeState"];
        };
        /** ManualDebugPreflightRequest */
        ManualDebugPreflightRequest: {
            /** Endpoint Base Url */
            endpoint_base_url: string;
        };
        /** ManualDebugPreflightResponse */
        ManualDebugPreflightResponse: {
            /** Devices */
            devices: components["schemas"]["ManualDebugPreflightDevice"][];
            /** Endpoint Base Url */
            endpoint_base_url: string;
        };
        /** ManualReconcileDeviceIdleRequest */
        ManualReconcileDeviceIdleRequest: {
            /** Reason */
            reason: string;
        };
        /** ManualReconcileDeviceIdleResponse */
        ManualReconcileDeviceIdleResponse: {
            /** Command Code */
            command_code: string;
            /** Failure Code */
            failure_code: string;
            /** Status */
            status: string;
        };
        /**
         * MaterialLocationConflictState
         * @description MaterialLocationQuery 冲突状态。
         * @enum {string}
         */
        MaterialLocationConflictState: "OK" | "NOT_FOUND" | "RECONCILING" | "WMS_UNAVAILABLE";
        /**
         * MaterialLocationEvidence
         * @description 单个位置来源 evidence。
         */
        MaterialLocationEvidence: {
            /** Correlation Id */
            correlation_id?: string | null;
            /** Evidence Json */
            evidence_json?: {
                [key: string]: unknown;
            };
            /** Evidence Ref */
            evidence_ref?: string | null;
            /** External Reference */
            external_reference?: string | null;
            /** Location Code */
            location_code?: string | null;
            /** Location Scope */
            location_scope?: string | null;
            /** Object Key */
            object_key: string;
            /** Object Type */
            object_type: string;
            /** Observed At */
            observed_at?: string | null;
            /** Priority */
            priority: number;
            /** Provider Code */
            provider_code?: string | null;
            /** Semantic Status */
            semantic_status?: string | null;
            /** Source */
            source: string;
            /** Source Event Id */
            source_event_id?: string | null;
            /** Source Version */
            source_version?: string | null;
        };
        /**
         * MaterialLocationResult
         * @description 统一位置查询结果。
         */
        MaterialLocationResult: {
            conflict_state: components["schemas"]["MaterialLocationConflictState"];
            /** Correlation Id */
            correlation_id?: string | null;
            /** Evidence */
            evidence?: components["schemas"]["MaterialLocationEvidence"][];
            /** Location Code */
            location_code?: string | null;
            /** Location Scope */
            location_scope?: string | null;
            /** Object Key */
            object_key?: string | null;
            /** Object Type */
            object_type?: string | null;
            /** Query Entry */
            query_entry: string;
            /** Source */
            source?: string | null;
        };
        /**
         * NorthboundOperationalSnapshot
         * @description 租户作用域的北向运维快照。
         */
        NorthboundOperationalSnapshot: {
            /**
             * Catalog Version
             * @default northbound-operation-slo.v1
             * @constant
             */
            catalog_version: "northbound-operation-slo.v1";
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Operations */
            operations: components["schemas"]["NorthboundOperationHealth"][];
            /**
             * Schema Version
             * @default northbound-operational-snapshot.v1
             * @constant
             */
            schema_version: "northbound-operational-snapshot.v1";
            /** Tenant Id */
            tenant_id: number | null;
            /**
             * Tenant Scope
             * @enum {string}
             */
            tenant_scope: "WORKLINE_OWNER" | "PLATFORM";
            /** Workline Id */
            workline_id: number | null;
        };
        /**
         * NorthboundOperationHealth
         * @description 只暴露低基数 identity、operation mode 和聚合 SLI，不暴露行级证据或 payload。
         */
        NorthboundOperationHealth: {
            /** Active Lease Count */
            active_lease_count: number;
            /** Backlog Count */
            backlog_count: number;
            /** Lease Loss Count */
            lease_loss_count: number;
            /**
             * Mode
             * @enum {string}
             */
            mode: "QUERY" | "EFFECT";
            /** Oldest Queue Age Seconds */
            oldest_queue_age_seconds: number;
            /** Operation Identity */
            operation_identity: string;
            /** Provider Profile Identity */
            provider_profile_identity: string;
            /** Rate Limited Count */
            rate_limited_count: number;
            /** Reconciliation Open Count */
            reconciliation_open_count: number;
            /** Unknown Count */
            unknown_count: number;
        };
        /**
         * OperaStatus
         * @description 操作日志状态
         * @enum {string}
         */
        OperaStatus: "FAIL" | "SUCCESS";
        /**
         * PermissionResponse
         * @description API 权限响应 Schema（完整版）
         */
        PermissionResponse: {
            /**
             * Action
             * @description 操作：create、read、update、delete、list 等
             */
            action?: string | null;
            /**
             * Category
             * @description 权限分类：admin、system、business 等
             */
            category?: string | null;
            /**
             * Description
             * @description 权限描述
             */
            description?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /** Id */
            id: number;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Method
             * @description HTTP 方法：GET、POST、PUT、DELETE、PATCH 等
             */
            method?: string | null;
            /**
             * Name
             * @description 权限标识，如 admin:role:create
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description API 路径：/admin/users/{id}、/api/v1/warehouses 等
             */
            path?: string | null;
            /**
             * Resource
             * @description 资源类型：user、role、permission、warehouse 等
             */
            resource?: string | null;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
            /**
             * Type
             * @description 权限类型：user_api（内部管理API）、app_api（外部应用API）
             * @default user_api
             */
            type: string;
            /** Version */
            version: number;
        };
        /**
         * PermissionTree
         * @description API 权限树形结构 Schema
         *
         *     用于权限分组展示和管理（如按模块分组）
         */
        PermissionTree: {
            /**
             * Action
             * @description 操作：create、read、update、delete、list 等
             */
            action?: string | null;
            /**
             * Category
             * @description 权限分类：admin、system、business 等
             */
            category?: string | null;
            /**
             * Children
             * @description 子权限列表
             */
            children?: components["schemas"]["PermissionTree"][];
            /**
             * Description
             * @description 权限描述
             */
            description?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /** Id */
            id: number;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Method
             * @description HTTP 方法：GET、POST、PUT、DELETE、PATCH 等
             */
            method?: string | null;
            /**
             * Name
             * @description 权限标识，如 admin:role:create
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description API 路径：/admin/users/{id}、/api/v1/warehouses 等
             */
            path?: string | null;
            /**
             * Resource
             * @description 资源类型：user、role、permission、warehouse 等
             */
            resource?: string | null;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
            /**
             * Type
             * @description 权限类型：user_api（内部管理API）、app_api（外部应用API）
             * @default user_api
             */
            type: string;
        };
        /**
         * PlaneEdge
         * @description Plane scene edge.
         */
        PlaneEdge: {
            /** Code */
            code: string;
            /** From Code */
            from_code: string;
            /** Label */
            label?: string | null;
            /** To Code */
            to_code: string;
        };
        /**
         * PlaneExtremeState
         * @description Plane snapshot extreme state marker.
         */
        PlaneExtremeState: {
            /** Code */
            code: string;
            /** Label */
            label: string;
            /** Severity */
            severity: string;
        };
        /**
         * PlaneNode
         * @description Plane scene node with stable code and display label.
         */
        PlaneNode: {
            /** Code */
            code: string;
            /** Kind */
            kind: string;
            /** Label */
            label: string;
        };
        /**
         * PlaneObjectSnapshot
         * @description Plane snapshot object state.
         */
        PlaneObjectSnapshot: {
            /** Object Code */
            object_code: string;
            /** Object Label */
            object_label: string;
            /** State */
            state: string;
        };
        /**
         * PlaneSceneView
         * @description WorkLine plane static scene view.
         */
        PlaneSceneView: {
            /** Edges */
            edges: components["schemas"]["PlaneEdge"][];
            /** Nodes */
            nodes: components["schemas"]["PlaneNode"][];
            /**
             * Schema Version
             * @constant
             */
            schema_version: "plane.scene.v1";
            /** Workline Code */
            workline_code: string;
        };
        /**
         * PlaneSnapshot
         * @description WorkLine plane dynamic snapshot.
         */
        PlaneSnapshot: {
            /** Extremes */
            extremes: components["schemas"]["PlaneExtremeState"][];
            /** Objects */
            objects: components["schemas"]["PlaneObjectSnapshot"][];
            /**
             * Scene Schema Version
             * @constant
             */
            scene_schema_version: "plane.scene.v1";
            /**
             * Schema Version
             * @constant
             */
            schema_version: "plane.snapshot.v1";
            /** Workline Code */
            workline_code: string;
        };
        /**
         * QueryOptions
         * @description 查询选项
         */
        QueryOptions: {
            filters?: components["schemas"]["FilterGroup"] | null;
            /**
             * Include Deleted
             * @description 是否包含已删除记录
             * @default false
             */
            include_deleted: boolean;
            /**
             * Limit
             * @default 10
             */
            limit: number;
            /**
             * Max Depth
             * @default 1
             */
            max_depth: number;
            /**
             * Offset
             * @default 0
             */
            offset: number;
            /** Sort */
            sort?: components["schemas"]["SortField"][] | null;
        };
        /**
         * RackBinMountResponse
         * @description 料箱挂载投影响应 Schema。
         */
        RackBinMountResponse: {
            /**
             * Bin Code
             * @description 料箱编码
             */
            bin_code: string;
            /**
             * Ended At
             * @description 解除挂载时间
             */
            ended_at?: string | null;
            /** Id */
            id: number;
            /**
             * @description 料箱挂载状态
             * @default UNKNOWN
             */
            mount_status: components["schemas"]["RackBinMountStatus"];
            /**
             * Rack Code
             * @description 货架编码
             */
            rack_code: string;
            /**
             * Rack Slot Code
             * @description 货架槽位编码
             */
            rack_slot_code: string;
            /**
             * Source Event Id
             * @description 来源事件 ID
             */
            source_event_id: string;
            /** @description 来源系统 */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * Started At
             * Format: date-time
             * @description 挂载确认时间
             */
            started_at: string;
            /**
             * Trace Id
             * @description WorkLine trace
             */
            trace_id?: string | null;
            /**
             * Workline Session Id
             * @description 关联 workline_sessions.id
             */
            workline_session_id?: number | null;
        };
        /**
         * RackBinMountStatus
         * @description 料箱挂载投影状态。
         * @enum {string}
         */
        RackBinMountStatus: "MOUNTED" | "UNMOUNTED" | "EXCHANGING" | "UNKNOWN";
        /**
         * RackFace
         * @enum {string}
         */
        RackFace: "A" | "B";
        /**
         * RackKind
         * @description 货架物理结构类型。
         * @enum {string}
         */
        RackKind: "SINGLE_LAYER" | "FIVE_LAYER" | "RETURN" | "TRANSFER" | "PRODUCTION";
        /**
         * RackPlacementResponse
         * @description 货架位置投影响应 Schema。
         */
        RackPlacementResponse: {
            /**
             * Ended At
             * @description 离开该关系的时间
             */
            ended_at?: string | null;
            /**
             * External Location Code
             * @description 外部地码证据
             */
            external_location_code?: string | null;
            /** Id */
            id: number;
            /**
             * Location Code
             * @description 兼容地码或逻辑位置
             */
            location_code?: string | null;
            /**
             * Logic Location Code
             * @description WES 逻辑位置
             */
            logic_location_code?: string | null;
            /**
             * @description 位置投影状态
             * @default UNKNOWN
             */
            placement_status: components["schemas"]["RackPlacementStatus"];
            /**
             * Position Code
             * @description 工作线停靠位编码
             */
            position_code?: string | null;
            /**
             * Position Role
             * @description 工作线停靠位角色
             */
            position_role?: string | null;
            /**
             * Rack Code
             * @description 货架编码
             */
            rack_code: string;
            /** @description 货架类型 */
            rack_kind?: components["schemas"]["RackKind"] | null;
            /**
             * Source Event Id
             * @description 来源事件 ID
             */
            source_event_id: string;
            /** @description 来源系统 */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Task Id
             * @description WMS/RCS 搬运任务 ID
             */
            source_task_id?: string | null;
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * Started At
             * Format: date-time
             * @description 进入该关系的时间
             */
            started_at: string;
            /**
             * Trace Id
             * @description WorkLine trace
             */
            trace_id?: string | null;
            /**
             * Workline Code
             * @description 工作线编码
             */
            workline_code?: string | null;
            /**
             * Workline Id
             * @description 关联 WorkLine.id
             */
            workline_id?: number | null;
            /**
             * Workline Session Id
             * @description 关联 workline_sessions.id
             */
            workline_session_id?: number | null;
        };
        /**
         * RackPlacementStatus
         * @description 货架位置投影状态。
         * @enum {string}
         */
        RackPlacementStatus: "ARRIVED" | "IN_TRANSIT" | "DEPARTED" | "UNKNOWN";
        /**
         * RackResponse
         * @description 货架实例响应 Schema。
         */
        RackResponse: {
            /** Id */
            id: number;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
            /**
             * Rack Code
             * @description WES 货架编码
             */
            rack_code: string;
            /**
             * Rack Type Code
             * @description 货架类型编码
             */
            rack_type_code: string;
            /**
             * @description 来源系统
             * @default MANUAL_IMPORT
             */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * @description 货架主数据状态
             * @default ACTIVE
             */
            status: components["schemas"]["ResourceMasterStatus"];
            /**
             * Wms Rack Id
             * @description WMS 货架 ID
             */
            wms_rack_id?: string | null;
        };
        /**
         * RackSlotKind
         * @description 货架槽位承载对象类型。
         * @enum {string}
         */
        RackSlotKind: "BIN_SLOT" | "MATERIAL_SLOT";
        /**
         * RackSlotSide
         * @description 货架槽位面。
         * @enum {string}
         */
        RackSlotSide: "A" | "B" | "NONE";
        /**
         * RackSlotTemplateResponse
         * @description 货架槽位模板响应 Schema。
         */
        RackSlotTemplateResponse: {
            /**
             * Active
             * @description 是否启用
             * @default true
             */
            active: boolean;
            /**
             * Allowed Bin Types
             * @description 允许的料箱类型
             */
            allowed_bin_types?: string[];
            /**
             * Allowed Material Carrier Types
             * @description 允许的物料承载形态
             */
            allowed_material_carrier_types?: string[];
            /** Id */
            id: number;
            /**
             * Layer No
             * @description 层号
             * @default 1
             */
            layer_no: number;
            /**
             * Position No
             * @description 同层序号
             * @default 1
             */
            position_no: number;
            /**
             * Rack Type Code
             * @description 所属货架类型编码
             */
            rack_type_code: string;
            /**
             * @description 槽位面
             * @default NONE
             */
            side: components["schemas"]["RackSlotSide"];
            /**
             * Slot Code
             * @description 货架槽位编码
             */
            slot_code: string;
            /** @description 槽位承载对象类型 */
            slot_kind: components["schemas"]["RackSlotKind"];
        };
        /**
         * RackTypeResponse
         * @description 货架类型响应 Schema。
         */
        RackTypeResponse: {
            /**
             * Active
             * @description 是否启用
             * @default true
             */
            active: boolean;
            /**
             * Description
             * @description 说明
             */
            description?: string | null;
            /**
             * Has Side
             * @description 是否区分 A/B 面
             * @default false
             */
            has_side: boolean;
            /** Id */
            id: number;
            /**
             * Metadata Json
             * @description 扩展属性
             */
            metadata_json?: {
                [key: string]: unknown;
            };
            /** @description 货架物理结构类型 */
            rack_kind: components["schemas"]["RackKind"];
            /**
             * Rack Type Code
             * @description 货架类型编码
             */
            rack_type_code: string;
            /**
             * Rack Type Name
             * @description 货架类型名称
             */
            rack_type_name: string;
            /**
             * Slot Count
             * @description 标准槽位数量
             */
            slot_count: number;
        };
        /**
         * RefreshTokenResponse
         * @description 刷新令牌响应 Schema
         *
         *     包含新的访问令牌和刷新令牌元数据
         */
        RefreshTokenResponse: {
            /**
             * Access Token
             * @description 新的访问令牌
             */
            access_token: string;
            /**
             * Access Token Expire Time
             * Format: date-time
             * @description 访问令牌过期时间
             */
            access_token_expire_time: string;
            /**
             * Access Token Jti
             * @description 访问令牌唯一标识符
             */
            access_token_jti: string;
            /**
             * Expires In
             * @description 访问令牌过期时间（秒）- OAuth 2.0 标准字段
             */
            readonly expires_in: number;
            /**
             * Refresh Expires In
             * @description 刷新令牌过期时间（秒）
             */
            readonly refresh_expires_in: number;
            /**
             * Refresh Token Expire Time
             * Format: date-time
             * @description 刷新令牌过期时间（令牌仅存储于 HttpOnly Cookie）
             */
            refresh_token_expire_time: string;
            /**
             * Refresh Token Jti
             * @description 刷新令牌唯一标识符
             */
            refresh_token_jti: string;
            /**
             * Session Uuid
             * @description 会话 UUID
             */
            session_uuid: string;
        };
        /**
         * ReplayInboxRequest
         * @description Replay 请求。
         */
        ReplayInboxRequest: {
            /** Reason */
            reason: string;
            /** Request Id */
            request_id: string;
        };
        /** ReprocessBlockedEventRequest */
        ReprocessBlockedEventRequest: {
            /** Reason */
            reason: string;
        };
        /** ReprocessBlockedEventResponse */
        ReprocessBlockedEventResponse: {
            /** Apply Status */
            apply_status: string;
            /** Block Id */
            block_id: number;
            /** Source Event Id */
            source_event_id: string;
        };
        /**
         * ResetPasswordRequest
         * @description 管理员重置密码请求
         */
        ResetPasswordRequest: {
            /**
             * New Password
             * @description 新密码
             */
            new_password: string;
        };
        /**
         * ResetValidityPeriodSchema
         * @description 重置有效期 Schema
         */
        ResetValidityPeriodSchema: {
            /** @description 新的有效期时长 */
            validity_period: components["schemas"]["ValidityPeriod"];
            /**
             * Version
             * @description 数据版本
             * @default 0
             */
            version: number;
        };
        /**
         * ResolveEffectReconciliationRequest
         * @description 人工 EFFECT 对账决议请求。
         */
        ResolveEffectReconciliationRequest: {
            /** @description E03/E07 同步义务 typed 对账裁决 */
            obligation_resolution?: components["schemas"]["WmsSyncObligationResolution"] | null;
            /**
             * Operator Note
             * @description 人工核验说明
             */
            operator_note: string;
            /**
             * Request Id
             * @description 通用决议稳定幂等请求 ID
             */
            request_id?: string | null;
            /**
             * Resolution
             * @description 非 E03/E07 EFFECT 最终决议
             */
            resolution?: string | null;
        };
        /**
         * ResolveRuntimeReconciliationRequest
         * @description 人工运行时对账解除请求。
         */
        ResolveRuntimeReconciliationRequest: {
            /**
             * Checks
             * @description 按 reconciliation_reason 要求确认的 checklist
             */
            checks: {
                [key: string]: boolean;
            };
            /**
             * Confirmed At
             * Format: date-time
             * @description 现场确认时间
             */
            confirmed_at: string;
            /**
             * Operator Note
             * @description 现场确认说明
             */
            operator_note: string;
            /**
             * Resolution
             * @description 人工对账决议
             */
            resolution: string;
            /**
             * Result Payload
             * @description COMPLETED 时可补录业务结果摘要
             */
            result_payload?: {
                [key: string]: unknown;
            } | null;
        };
        /**
         * ResourceMasterStatus
         * @description 资源主数据启停状态。
         * @enum {string}
         */
        ResourceMasterStatus: "ACTIVE" | "DISABLED";
        /**
         * ResourceSourceSystem
         * @description 资源事实来源系统。
         * @enum {string}
         */
        ResourceSourceSystem: "WMS" | "RCS" | "ECS" | "WES_RUNTIME" | "MANUAL_IMPORT" | "MANUAL";
        /**
         * ResourceStateEventResponse
         * @description 资源事实响应 Schema。
         */
        ResourceStateEventResponse: {
            /**
             * Event Code
             * @description 资源事件唯一编码
             */
            event_code: string;
            /** @description 资源事件类型 */
            event_type: components["schemas"]["ResourceStateEventType"];
            /**
             * External Location Code
             * @description 外部地码证据
             */
            external_location_code?: string | null;
            /** Id */
            id: number;
            /**
             * Idempotency Key
             * @description 资源事实幂等键
             */
            idempotency_key?: string | null;
            /**
             * Logic Location Code
             * @description WES 逻辑位置
             */
            logic_location_code?: string | null;
            /**
             * Occurred At
             * Format: date-time
             * @description 事实发生时间
             */
            occurred_at: string;
            /**
             * Payload Json
             * @description 事件事实
             */
            payload_json?: {
                [key: string]: unknown;
            };
            /**
             * Position Code
             * @description 工作线停靠位编码
             */
            position_code?: string | null;
            /**
             * Received At
             * Format: date-time
             * @description WES 接收时间
             */
            received_at: string;
            /**
             * Resource Code
             * @description 资源编码
             */
            resource_code: string;
            /** @description 资源类型 */
            resource_type: components["schemas"]["ResourceType"];
            /**
             * Source Event Id
             * @description 来源事件 ID
             */
            source_event_id: string;
            /** @description 来源系统 */
            source_system: components["schemas"]["ResourceSourceSystem"];
            /**
             * Source Version
             * @description 来源版本
             */
            source_version?: string | null;
            /**
             * Trace Id
             * @description WorkLine trace
             */
            trace_id?: string | null;
            /**
             * Workline Code
             * @description 工作线编码
             */
            workline_code?: string | null;
            /**
             * Workline Id
             * @description 关联 WorkLine.id
             */
            workline_id?: number | null;
            /**
             * Workline Session Id
             * @description 关联 workline_sessions.id
             */
            workline_session_id?: number | null;
        };
        /**
         * ResourceStateEventType
         * @description 资源事实事件类型。
         * @enum {string}
         */
        ResourceStateEventType: "RACK_ARRIVED" | "RACK_DEPARTED" | "BIN_ARRIVED" | "BIN_DEPARTED" | "BIN_MOUNTED" | "BIN_UNMOUNTED" | "MATERIAL_MOUNTED" | "MATERIAL_UNMOUNTED" | "EXCHANGE_STATUS_UPDATED" | "RESOURCE_RECONCILED";
        /**
         * ResourceType
         * @description WES 运行时资源类型。
         * @enum {string}
         */
        ResourceType: "RACK" | "BIN" | "MATERIAL";
        /** ResponseSchemaModel[ActiveSessionsResponse] */
        ResponseSchemaModel_ActiveSessionsResponse_: ApiResponse<components["schemas"]["ActiveSessionsResponse"]>;
        /** ResponseSchemaModel[APIAccessLogResponse] */
        ResponseSchemaModel_APIAccessLogResponse_: ApiResponse<components["schemas"]["APIAccessLogResponse"]>;
        /** ResponseSchemaModel[APIApplicationResponse] */
        ResponseSchemaModel_APIApplicationResponse_: ApiResponse<components["schemas"]["APIApplicationResponse"]>;
        /** ResponseSchemaModel[AuditLogResponse] */
        ResponseSchemaModel_AuditLogResponse_: ApiResponse<components["schemas"]["AuditLogResponse"]>;
        /** ResponseSchemaModel[AuthMyResponse] */
        ResponseSchemaModel_AuthMyResponse_: ApiResponse<components["schemas"]["AuthMyResponse"]>;
        /** ResponseSchemaModel[BinCellOccupancyResponse] */
        ResponseSchemaModel_BinCellOccupancyResponse_: ApiResponse<components["schemas"]["BinCellOccupancyResponse"]>;
        /** ResponseSchemaModel[BinContentSnapshotItemResponse] */
        ResponseSchemaModel_BinContentSnapshotItemResponse_: ApiResponse<components["schemas"]["BinContentSnapshotItemResponse"]>;
        /** ResponseSchemaModel[BinContentSnapshotResponse] */
        ResponseSchemaModel_BinContentSnapshotResponse_: ApiResponse<components["schemas"]["BinContentSnapshotResponse"]>;
        /** ResponseSchemaModel[BinMaterialMountResponse] */
        ResponseSchemaModel_BinMaterialMountResponse_: ApiResponse<components["schemas"]["BinMaterialMountResponse"]>;
        /** ResponseSchemaModel[BinResponse] */
        ResponseSchemaModel_BinResponse_: ApiResponse<components["schemas"]["BinResponse"]>;
        /** ResponseSchemaModel[BinSlotTemplateResponse] */
        ResponseSchemaModel_BinSlotTemplateResponse_: ApiResponse<components["schemas"]["BinSlotTemplateResponse"]>;
        /** ResponseSchemaModel[BinTypeResponse] */
        ResponseSchemaModel_BinTypeResponse_: ApiResponse<components["schemas"]["BinTypeResponse"]>;
        /** ResponseSchemaModel[CallbackLogResponse] */
        ResponseSchemaModel_CallbackLogResponse_: ApiResponse<components["schemas"]["CallbackLogResponse"]>;
        /** ResponseSchemaModel[CallbackLogSubjectResponse] */
        ResponseSchemaModel_CallbackLogSubjectResponse_: ApiResponse<components["schemas"]["CallbackLogSubjectResponse"]>;
        /** ResponseSchemaModel[CallbackLogTraceResponse] */
        ResponseSchemaModel_CallbackLogTraceResponse_: ApiResponse<components["schemas"]["CallbackLogTraceResponse"]>;
        /** ResponseSchemaModel[DebugTransportTaskCreated] */
        ResponseSchemaModel_DebugTransportTaskCreated_: ApiResponse<components["schemas"]["DebugTransportTaskCreated"]>;
        /** ResponseSchemaModel[DeviceResponse] */
        ResponseSchemaModel_DeviceResponse_: ApiResponse<components["schemas"]["DeviceResponse"]>;
        /** ResponseSchemaModel[dict[str, Any]] */
        ResponseSchemaModel_dict_str__Any__: ApiResponse<Record<string, unknown>>;
        /** ResponseSchemaModel[dict[str, str]] */
        ResponseSchemaModel_dict_str__str__: ApiResponse<Record<string, string>>;
        /** ResponseSchemaModel[EventCommandBlockResponse] */
        ResponseSchemaModel_EventCommandBlockResponse_: ApiResponse<components["schemas"]["EventCommandBlockResponse"]>;
        /** ResponseSchemaModel[list[Any]] */
        ResponseSchemaModel_list_Any__: ApiResponse<unknown[]>;
        /** ResponseSchemaModel[list[dict[str, Any]]] */
        ResponseSchemaModel_list_dict_str__Any___: ApiResponse<Record<string, unknown>[]>;
        /** ResponseSchemaModel[list[PermissionResponse]] */
        ResponseSchemaModel_list_PermissionResponse__: ApiResponse<components["schemas"]["PermissionResponse"][]>;
        /** ResponseSchemaModel[list[PermissionTree]] */
        ResponseSchemaModel_list_PermissionTree__: ApiResponse<components["schemas"]["PermissionTree"][]>;
        /** ResponseSchemaModel[LoginResponse] */
        ResponseSchemaModel_LoginResponse_: ApiResponse<components["schemas"]["LoginResponse"]>;
        /** ResponseSchemaModel[LogoutResponse] */
        ResponseSchemaModel_LogoutResponse_: ApiResponse<components["schemas"]["LogoutResponse"]>;
        /** ResponseSchemaModel[ManualDebugDeviceCommandCreated] */
        ResponseSchemaModel_ManualDebugDeviceCommandCreated_: ApiResponse<components["schemas"]["ManualDebugDeviceCommandCreated"]>;
        /** ResponseSchemaModel[ManualDebugDeviceCommandResponse] */
        ResponseSchemaModel_ManualDebugDeviceCommandResponse_: ApiResponse<components["schemas"]["ManualDebugDeviceCommandResponse"]>;
        /** ResponseSchemaModel[ManualDebugPreflightResponse] */
        ResponseSchemaModel_ManualDebugPreflightResponse_: ApiResponse<components["schemas"]["ManualDebugPreflightResponse"]>;
        /** ResponseSchemaModel[ManualReconcileDeviceIdleResponse] */
        ResponseSchemaModel_ManualReconcileDeviceIdleResponse_: ApiResponse<components["schemas"]["ManualReconcileDeviceIdleResponse"]>;
        /** ResponseSchemaModel[MaterialLocationResult] */
        ResponseSchemaModel_MaterialLocationResult_: ApiResponse<components["schemas"]["MaterialLocationResult"]>;
        /** ResponseSchemaModel[NoneType] */
        ResponseSchemaModel_NoneType_: ApiResponse<null>;
        /** ResponseSchemaModel[NorthboundOperationalSnapshot] */
        ResponseSchemaModel_NorthboundOperationalSnapshot_: ApiResponse<components["schemas"]["NorthboundOperationalSnapshot"]>;
        /** ResponseSchemaModel[PermissionResponse] */
        ResponseSchemaModel_PermissionResponse_: ApiResponse<components["schemas"]["PermissionResponse"]>;
        /** ResponseSchemaModel[PlaneSceneView] */
        ResponseSchemaModel_PlaneSceneView_: ApiResponse<components["schemas"]["PlaneSceneView"]>;
        /** ResponseSchemaModel[PlaneSnapshot] */
        ResponseSchemaModel_PlaneSnapshot_: ApiResponse<components["schemas"]["PlaneSnapshot"]>;
        /** ResponseSchemaModel[RackBinMountResponse] */
        ResponseSchemaModel_RackBinMountResponse_: ApiResponse<components["schemas"]["RackBinMountResponse"]>;
        /** ResponseSchemaModel[RackPlacementResponse] */
        ResponseSchemaModel_RackPlacementResponse_: ApiResponse<components["schemas"]["RackPlacementResponse"]>;
        /** ResponseSchemaModel[RackResponse] */
        ResponseSchemaModel_RackResponse_: ApiResponse<components["schemas"]["RackResponse"]>;
        /** ResponseSchemaModel[RackSlotTemplateResponse] */
        ResponseSchemaModel_RackSlotTemplateResponse_: ApiResponse<components["schemas"]["RackSlotTemplateResponse"]>;
        /** ResponseSchemaModel[RackTypeResponse] */
        ResponseSchemaModel_RackTypeResponse_: ApiResponse<components["schemas"]["RackTypeResponse"]>;
        /** ResponseSchemaModel[RefreshTokenResponse] */
        ResponseSchemaModel_RefreshTokenResponse_: ApiResponse<components["schemas"]["RefreshTokenResponse"]>;
        /** ResponseSchemaModel[ReprocessBlockedEventResponse] */
        ResponseSchemaModel_ReprocessBlockedEventResponse_: ApiResponse<components["schemas"]["ReprocessBlockedEventResponse"]>;
        /** ResponseSchemaModel[ResourceStateEventResponse] */
        ResponseSchemaModel_ResourceStateEventResponse_: ApiResponse<components["schemas"]["ResourceStateEventResponse"]>;
        /** ResponseSchemaModel[RevokeSessionResponse] */
        ResponseSchemaModel_RevokeSessionResponse_: ApiResponse<components["schemas"]["RevokeSessionResponse"]>;
        /** ResponseSchemaModel[RoleResponse] */
        ResponseSchemaModel_RoleResponse_: ApiResponse<components["schemas"]["RoleResponse"]>;
        /** ResponseSchemaModel[TransportTaskPageResponse] */
        ResponseSchemaModel_TransportTaskPageResponse_: ApiResponse<components["schemas"]["TransportTaskPageResponse"]>;
        /** ResponseSchemaModel[TransportTaskResponse] */
        ResponseSchemaModel_TransportTaskResponse_: ApiResponse<components["schemas"]["TransportTaskResponse"]>;
        /** ResponseSchemaModel[Union[WorkLineStartResponse, WorkLineStartErrorResponse]] */
        ResponseSchemaModel_Union_WorkLineStartResponse__WorkLineStartErrorResponse__: ApiResponse<unknown>;
        /** ResponseSchemaModel[UserPermissionsResponse] */
        ResponseSchemaModel_UserPermissionsResponse_: ApiResponse<components["schemas"]["UserPermissionsResponse"]>;
        /** ResponseSchemaModel[UserResponse] */
        ResponseSchemaModel_UserResponse_: ApiResponse<components["schemas"]["UserResponse"]>;
        /** ResponseSchemaModel[UserSimpleResponse] */
        ResponseSchemaModel_UserSimpleResponse_: ApiResponse<components["schemas"]["UserSimpleResponse"]>;
        /** ResponseSchemaModel[WorklineActiveObjectsResponse] */
        ResponseSchemaModel_WorklineActiveObjectsResponse_: ApiResponse<components["schemas"]["WorklineActiveObjectsResponse"]>;
        /** ResponseSchemaModel[WorkLineConfigurationStatus] */
        ResponseSchemaModel_WorkLineConfigurationStatus_: ApiResponse<components["schemas"]["WorkLineConfigurationStatus"]>;
        /** ResponseSchemaModel[WorkLineResponse] */
        ResponseSchemaModel_WorkLineResponse_: ApiResponse<components["schemas"]["WorkLineResponse"]>;
        /** ResponseSchemaModel[WorkLineStartErrorResponse] */
        ResponseSchemaModel_WorkLineStartErrorResponse_: ApiResponse<components["schemas"]["WorkLineStartErrorResponse"]>;
        /** ResponseSchemaModel[WorkLineStartResponse] */
        ResponseSchemaModel_WorkLineStartResponse_: ApiResponse<components["schemas"]["WorkLineStartResponse"]>;
        /**
         * RevokeSessionResponse
         * @description 撤销会话响应 Schema
         */
        RevokeSessionResponse: {
            /**
             * Message
             * @description 响应消息
             */
            message: string;
            /**
             * Session Uuid
             * @description 被撤销的会话 UUID
             */
            session_uuid: string;
        };
        /**
         * RoleCreate
         * @description 角色创建 Schema
         */
        RoleCreate: {
            /** Description */
            description?: string | null;
            /** Name */
            name: string;
        };
        /**
         * RoleResponse
         * @description 角色响应 Schema
         */
        RoleResponse: {
            /** Description */
            description?: string | null;
            /** Id */
            id: number;
            /** Name */
            name: string;
            /** Permissions */
            permissions?: components["schemas"]["PermissionResponse"][];
            /** Version */
            version: number;
        };
        /**
         * RoleResponseSimple
         * @description 角色响应 Schema（简化版，不含权限）
         */
        RoleResponseSimple: {
            /** Description */
            description?: string | null;
            /** Id */
            id: number;
            /** Name */
            name: string;
        };
        /**
         * RoleUpdate
         * @description 角色更新 Schema
         */
        RoleUpdate: {
            /** Description */
            description?: string | null;
            /** Name */
            name?: string | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /**
         * RuntimeHoldView
         * @description Active object 关联 RuntimeHold 展示字段。
         */
        RuntimeHoldView: {
            /** Allowed Next Effect Scope */
            allowed_next_effect_scope?: string | null;
            /** Freeze Scope */
            freeze_scope?: string | null;
            /** Reason Code */
            reason_code?: string | null;
        };
        /**
         * SandboxAckRequest
         * @description 沙箱 Command ACK 模拟请求。
         */
        SandboxAckRequest: {
            /**
             * Dispatch Key
             * @description Dispatch Key
             */
            dispatch_key: string;
        };
        /**
         * SandboxExternalCallbackRequest
         * @description 沙箱 External HTTP 回调模拟请求。
         */
        SandboxExternalCallbackRequest: {
            /**
             * Callback Type
             * @description 外部回调类型；为空时优先使用 Outbox payload.resume_callback_type
             */
            callback_type?: string | null;
            /**
             * Dispatch Key
             * @description External HTTP Outbox Dispatch Key
             */
            dispatch_key: string;
            /**
             * Occurred At
             * @description 外部事件发生时间
             */
            occurred_at?: string | null;
            /**
             * Payload
             * @description 回调 Payload 增量字段
             */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Request Id
             * @description 外部请求 ID；为空时自动生成
             */
            request_id?: string | null;
            /**
             * Signature
             * @description 沙箱签名占位
             * @default sandbox
             */
            signature: string;
            /**
             * Source Event Id
             * @description 外部事件 ID；为空时自动生成
             */
            source_event_id?: string | null;
            /**
             * Source System
             * @description 外部来源系统
             * @default WMS
             */
            source_system: string;
            /**
             * Source Version
             * @description 外部来源版本
             * @default 1
             */
            source_version: string;
            /**
             * Timestamp
             * @description 外部回调时间
             */
            timestamp?: string | null;
        };
        /**
         * SessionInfo
         * @description 会话信息 Schema
         *
         *     描述一个活跃的用户会话
         */
        SessionInfo: {
            /**
             * Created At
             * Format: date-time
             * @description 会话创建时间
             */
            created_at: string;
            /**
             * Device Info
             * @description 设备信息（可选）
             */
            device_info?: {
                [key: string]: unknown;
            } | null;
            /**
             * Jti
             * @description JWT ID
             */
            jti: string;
            /**
             * Last Active
             * @description 最后活跃时间
             */
            last_active?: string | null;
            /**
             * Session Uuid
             * @description 会话 UUID
             */
            session_uuid: string;
        };
        /**
         * SimulateWorkLineEstopRequest
         * @description 沙箱模拟 WorkLine 软件急停请求。
         */
        SimulateWorkLineEstopRequest: {
            /**
             * Payload
             * @description 模拟触发 payload
             */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Reason
             * @description 模拟急停说明
             */
            reason?: string | null;
            /**
             * Source Device Id
             * @description 模拟来源设备 ID
             */
            source_device_id?: number | null;
        };
        /**
         * SortField
         * @description 排序字段
         * @example {
         *       "field": "id",
         *       "order": "desc"
         *     }
         */
        SortField: {
            /** Field */
            field: string;
            /**
             * Order
             * @default desc
             * @enum {string}
             */
            order: "asc" | "desc";
        };
        /** TransportEvidenceResponse */
        TransportEvidenceResponse: {
            /** Conflict Code */
            conflict_code: string | null;
            /** Operation */
            operation: string;
            /** Operation Id */
            operation_id: string;
            /** Outcome Revision */
            outcome_revision: number | null;
            /** Processed At */
            processed_at: string | null;
            /** Received At */
            received_at: string;
            /**
             * Status
             * @enum {string}
             */
            status: "PENDING" | "APPLIED" | "CONFLICT";
        };
        /** TransportResultMemberResponse */
        TransportResultMemberResponse: {
            /** Arrival Face */
            arrival_face: ("A" | "B") | null;
            /** Failure Code */
            failure_code: string | null;
            /** Final Position */
            final_position: {
                [key: string]: unknown;
            } | null;
            /** Object Id */
            object_id: string;
            /** Position Unknown */
            position_unknown: boolean;
            /**
             * Status
             * @enum {string}
             */
            status: "UNKNOWN" | "FAILED" | "SUCCEEDED";
        };
        /** TransportResultResponse */
        TransportResultResponse: {
            /** Members */
            members: components["schemas"]["TransportResultMemberResponse"][];
            /** Outcome Version */
            outcome_version: number;
            /** Reason Code */
            reason_code: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "SUCCEEDED" | "FAILED" | "REJECTED" | "UNKNOWN";
        };
        /**
         * TransportTaskKind
         * @enum {string}
         */
        TransportTaskKind: "RACK_MOVE" | "RACK_ROTATE" | "BIN_MOVE" | "BIN_EXCHANGE";
        /** TransportTaskPageResponse */
        TransportTaskPageResponse: {
            /** Items */
            items: components["schemas"]["TransportTaskSummaryResponse"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** TransportTaskResponse */
        TransportTaskResponse: {
            /** Client Request Id */
            client_request_id: string;
            /** Created At */
            created_at: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "RACK_MOVE" | "RACK_ROTATE" | "BIN_MOVE" | "BIN_EXCHANGE";
            latest_evidence: components["schemas"]["TransportEvidenceResponse"] | null;
            /** Reason Code */
            reason_code: string | null;
            /** Request */
            request: {
                [key: string]: unknown;
            };
            result: components["schemas"]["TransportResultResponse"] | null;
            /**
             * Status
             * @enum {string}
             */
            status: "PENDING" | "ACCEPTED" | "REJECTED" | "SUCCEEDED" | "FAILED" | "RECONCILING";
            /** Submit Operation Id */
            submit_operation_id: string;
            /** Transport Task Id */
            transport_task_id: string;
            /** Updated At */
            updated_at: string;
        };
        /**
         * TransportTaskStatus
         * @enum {string}
         */
        TransportTaskStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "SUCCEEDED" | "FAILED" | "RECONCILING";
        /** TransportTaskSummaryResponse */
        TransportTaskSummaryResponse: {
            /** Client Request Id */
            client_request_id: string;
            /** Created At */
            created_at: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "RACK_MOVE" | "RACK_ROTATE" | "BIN_MOVE" | "BIN_EXCHANGE";
            latest_evidence: components["schemas"]["TransportEvidenceResponse"] | null;
            /** Reason Code */
            reason_code: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "PENDING" | "ACCEPTED" | "REJECTED" | "SUCCEEDED" | "FAILED" | "RECONCILING";
            /** Submit Operation Id */
            submit_operation_id: string;
            /** Transport Task Id */
            transport_task_id: string;
            /** Updated At */
            updated_at: string;
        };
        /**
         * TryInvokeApplication
         * @description 测试 API 调用数据模型
         */
        TryInvokeApplication: {
            /** Command Description */
            command_description: string;
            /** Command Name */
            command_name: string;
            /** Command Parameters */
            command_parameters: string[];
            /** Command Response */
            command_response: string;
        };
        /**
         * TryInvokeApplicationRequest
         * @description 测试 API 调用请求模型（包裹格式）
         */
        TryInvokeApplicationRequest: {
            data: components["schemas"]["TryInvokeApplication"];
        };
        /**
         * UserCreate
         * @description 用户创建 Schema - 接收客户端输入
         */
        UserCreate: {
            /**
             * Email
             * Format: email
             * @description 邮箱
             */
            email: string;
            /**
             * Full Name
             * @description 姓名
             */
            full_name?: string | null;
            /** Password */
            password: string;
            /**
             * Username
             * @description 用户名
             */
            username: string;
        };
        /**
         * UserPermissionsResponse
         * @description 用户权限列表响应 Schema
         *
         *     包含用户有权限访问的所有 API 权限
         */
        UserPermissionsResponse: {
            /**
             * Permissions
             * @description 用户有权限访问的 API 列表
             */
            permissions: components["schemas"]["ApiPermissionInfo"][];
            /**
             * Total
             * @description 权限总数
             */
            total: number;
        };
        /**
         * UserResponse
         * @description 用户响应 Schema - 返回给客户端
         */
        UserResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by?: number | null;
            /** Deleted At */
            deleted_at?: string | null;
            /** Deleted By */
            deleted_by?: number | null;
            /**
             * Email
             * Format: email
             * @description 邮箱
             */
            email: string;
            /**
             * Full Name
             * @description 姓名
             */
            full_name?: string | null;
            /** Id */
            id: number;
            /** Is Multi Login */
            is_multi_login: boolean;
            /** Is Superuser */
            is_superuser: boolean;
            /** Roles */
            roles?: components["schemas"]["RoleResponseSimple"][];
            /** Updated At */
            updated_at?: string | null;
            /** Updated By */
            updated_by?: number | null;
            /**
             * Username
             * @description 用户名
             */
            username: string;
            /**
             * Version
             * @default 0
             */
            version: number;
        };
        /**
         * UserSimpleResponse
         * @description 用户响应 Schema 无关联关系 - 返回给客户端
         */
        UserSimpleResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by?: number | null;
            /** Deleted At */
            deleted_at?: string | null;
            /** Deleted By */
            deleted_by?: number | null;
            /**
             * Email
             * Format: email
             * @description 邮箱
             */
            email: string;
            /**
             * Full Name
             * @description 姓名
             */
            full_name?: string | null;
            /** Id */
            id: number;
            /** Is Multi Login */
            is_multi_login: boolean;
            /** Is Superuser */
            is_superuser: boolean;
            /** Updated At */
            updated_at?: string | null;
            /** Updated By */
            updated_by?: number | null;
            /**
             * Username
             * @description 用户名
             */
            username: string;
            /**
             * Version
             * @default 0
             */
            version: number;
        };
        /**
         * UserUpdate
         * @description 用户更新 Schema - 所有字段可选
         */
        UserUpdate: {
            /**
             * Email
             * @description 邮箱
             */
            email?: string | null;
            /**
             * Full Name
             * @description 姓名
             */
            full_name?: string | null;
            /**
             * Username
             * @description 用户名
             */
            username?: string | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /**
         * ValidityPeriod
         * @description 有效期枚举
         * @enum {string}
         */
        ValidityPeriod: "1d" | "1w" | "1m" | "6m" | "1y" | "never";
        /**
         * WmsSyncObligationResolution
         * @description 明确满足单项 E03/E07 同步义务的已关闭对账裁决。
         */
        WmsSyncObligationResolution: {
            /** Evidence Reference */
            evidence_reference: string;
            /**
             * Resolution
             * @constant
             */
            resolution: "OBLIGATION_SATISFIED";
            /** Resolved Fact Version */
            resolved_fact_version: string;
            /**
             * Resolved Operation Identity
             * @enum {string}
             */
            resolved_operation_identity: "wms.inventory.confirm_inbound@v1" | "wms.fulfillment.notify_pkg_binding@v1";
            /** Source Event Id */
            source_event_id: string;
        };
        /**
         * WorklineActiveObjectConflictState
         * @description WorklineActiveObjects 冲突展示状态。
         * @enum {string}
         */
        WorklineActiveObjectConflictState: "OK" | "TRANSIENT" | "RECONCILING";
        /**
         * WorklineActiveObjectsResponse
         * @description WorkLine active objects 聚合响应。
         */
        WorklineActiveObjectsResponse: {
            /** Objects */
            objects?: components["schemas"]["WorklineActiveObjectView"][];
            /**
             * Total Count
             * @default 0
             */
            total_count: number;
            /**
             * Truncated
             * @default false
             */
            truncated: boolean;
            /** Workline Id */
            workline_id: number;
        };
        /**
         * WorklineActiveObjectView
         * @description 单个 active object 只读视图。
         */
        WorklineActiveObjectView: {
            /** All Sources */
            all_sources?: string[];
            conflict_state: components["schemas"]["WorklineActiveObjectConflictState"];
            /** Evidence Refs */
            evidence_refs?: string[];
            location_summary?: components["schemas"]["MaterialLocationResult"] | null;
            /** Object Key */
            object_key: string;
            /** Object Type */
            object_type: string;
            /** Operator Hint */
            operator_hint?: string | null;
            /** Primary Source */
            primary_source?: string | null;
            runtime_hold?: components["schemas"]["RuntimeHoldView"] | null;
        };
        /**
         * WorkLineConfigurationCheck
         * @description 作业线启用前结构化检查项。
         */
        WorkLineConfigurationCheck: {
            /**
             * Code
             * @description 检查项编码
             */
            code: string;
            /**
             * Context
             * @description 检查上下文
             */
            context?: {
                [key: string]: unknown;
            };
            /**
             * Severity
             * @description 检查严重程度
             * @enum {string}
             */
            severity: "INFO" | "WARNING" | "BLOCKER";
            /**
             * Status
             * @description 检查结果
             * @enum {string}
             */
            status: "PASS" | "FAIL" | "WARN";
        };
        /**
         * WorkLineConfigurationStatus
         * @description 作业线配置状态响应。
         */
        WorkLineConfigurationStatus: {
            /**
             * Can Activate
             * @description 是否满足启用条件
             */
            can_activate: boolean;
            /**
             * Checks
             * @description 启用前检查项
             */
            checks?: components["schemas"]["WorkLineConfigurationCheck"][];
            /**
             * Is Active
             * @description 是否已启用
             */
            is_active: boolean;
            /**
             * Workline Id
             * @description 作业线 ID
             */
            workline_id: number;
        };
        /**
         * WorkLineCreate
         * @description 作业线创建 Schema。
         */
        WorkLineCreate: {
            /**
             * Config
             * @description 工作线通用配置
             */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @description 作业线描述
             */
            description?: string | null;
            /**
             * Diagnostic Profile
             * @description 工作线诊断配置（软件/硬件分类偏好、展示策略等）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /**
             * Line Code
             * @description 作业线编码（业务主键）
             */
            line_code: string;
            /**
             * Line Name
             * @description 作业线名称
             */
            line_name: string;
            /** @description 作业线类型 */
            line_type: components["schemas"]["LineType"];
            /**
             * @description 工作线运行模式
             * @default AUTO
             */
            run_mode: components["schemas"]["WorkLineRunMode"];
            /**
             * Runtime Config Json
             * @description 工作线运行时配置（重试、超时、会话归属等）
             */
            runtime_config_json?: {
                [key: string]: unknown;
            };
            /**
             * Zone Name
             * @description 区域名称
             */
            zone_name?: string | null;
        };
        /**
         * WorkLineResponse
         * @description 作业线响应 Schema。
         */
        WorkLineResponse: {
            /**
             * Config
             * @description 工作线通用配置
             */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @description 作业线描述
             */
            description?: string | null;
            /**
             * Diagnostic Profile
             * @description 工作线诊断配置（软件/硬件分类偏好、展示策略等）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /** Id */
            id: number;
            /** Is Active */
            is_active: boolean;
            /**
             * Line Code
             * @description 作业线编码（业务主键）
             */
            line_code: string;
            /**
             * Line Name
             * @description 作业线名称
             */
            line_name: string;
            /** @description 作业线类型 */
            line_type: components["schemas"]["LineType"];
            /**
             * @description 工作线运行模式
             * @default AUTO
             */
            run_mode: components["schemas"]["WorkLineRunMode"];
            /**
             * Runtime Config Json
             * @description 工作线运行时配置（重试、超时、会话归属等）
             */
            runtime_config_json?: {
                [key: string]: unknown;
            };
            /** Version */
            version: number;
            /**
             * Zone Name
             * @description 区域名称
             */
            zone_name?: string | null;
        };
        /**
         * WorkLineRunMode
         * @description 作业线运行模式枚举。
         * @enum {string}
         */
        WorkLineRunMode: "AUTO" | "MANUAL" | "SIMULATION";
        /**
         * WorkLineStartErrorResponse
         * @description Stable machine-readable START rejection.
         */
        WorkLineStartErrorResponse: {
            /**
             * Reason
             * @enum {string}
             */
            reason: "WORKLINE_NOT_FOUND" | "INVALID_STATE" | "CONFIGURATION_INVALID" | "IDEMPOTENCY_CONFLICT" | "SERVICE_UNAVAILABLE";
        };
        /**
         * WorkLineStartRequest
         * @description Stable identity for one WorkLine START attempt.
         */
        WorkLineStartRequest: {
            /** Request Id */
            request_id: string;
        };
        /**
         * WorkLineStartResponse
         * @description Frozen Epoch identity and the current WorkLine projection.
         */
        WorkLineStartResponse: {
            /** Created */
            created: boolean;
            /** Current Workline Runtime Status */
            current_workline_runtime_status: string | null;
            /** Epoch Closed At */
            epoch_closed_at: string | null;
            /** Epoch Code */
            epoch_code: string;
            /**
             * Epoch Started At
             * Format: date-time
             */
            epoch_started_at: string;
            /**
             * Epoch Status
             * @enum {string}
             */
            epoch_status: "ACTIVE" | "CLOSED";
            /** Flow Mode */
            flow_mode: string;
            /** Line Run Epoch Id */
            line_run_epoch_id: number;
            /** Plugin Key */
            plugin_key: string;
            /** Plugin Version */
            plugin_version: string;
            /** Workline Id */
            workline_id: number;
        };
        /**
         * WorkLineStateTransitionRequest
         * @description 作业线启停请求。
         */
        WorkLineStateTransitionRequest: {
            /**
             * Version
             * @description WorkLine 乐观锁版本号
             */
            version: number;
        };
        /**
         * WorkLineUpdate
         * @description 作业线更新 Schema。
         */
        WorkLineUpdate: {
            /**
             * Config
             * @description 工作线通用配置
             */
            config?: {
                [key: string]: unknown;
            } | null;
            /**
             * Description
             * @description 作业线描述
             */
            description?: string | null;
            /**
             * Diagnostic Profile
             * @description 工作线诊断配置（软件/硬件分类偏好、展示策略等）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            } | null;
            /**
             * Line Code
             * @description 作业线编码（业务主键）
             */
            line_code?: string | null;
            /**
             * Line Name
             * @description 作业线名称
             */
            line_name?: string | null;
            /** @description 作业线类型 */
            line_type?: components["schemas"]["LineType"] | null;
            /** @description 工作线运行模式 */
            run_mode?: components["schemas"]["WorkLineRunMode"] | null;
            /**
             * Runtime Config Json
             * @description 工作线运行时配置（重试、超时、会话归属等）
             */
            runtime_config_json?: {
                [key: string]: unknown;
            } | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
            /**
             * Zone Name
             * @description 区域名称
             */
            zone_name?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    admin_performance_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    admin_performance_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    admin_performance_load_test_reset_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    admin_performance_metrics_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    permissions_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_PermissionResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_permissions_ancestors_by_node_id_get: {
        parameters: {
            query?: {
                /** @description 是否包含自身 */
                include_self?: boolean;
            };
            header?: never;
            path: {
                /** @description 节点ID */
                node_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_PermissionResponse__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_permissions_children_by_node_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 节点ID */
                node_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_PermissionResponse__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    permissions_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_PermissionResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_permissions_siblings_by_node_id_get: {
        parameters: {
            query?: {
                /** @description 是否包含自身 */
                include_self?: boolean;
            };
            header?: never;
            path: {
                /** @description 节点ID */
                node_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_PermissionResponse__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_permissions_tree_get: {
        parameters: {
            query?: {
                /** @description 关联数据加载深度 */
                max_depth?: number;
                /** @description 根节点ID */
                root_id?: number | null;
                /** @description 树深度：-1=完整树(节点少时用), 0=仅顶层(懒加载，节点多时用) */
                tree_depth?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_PermissionTree__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_delete: {
        parameters: {
            query?: {
                /** @description 是否永久删除（仅软删除模型生效） */
                permanent?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_trash: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RoleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_batch_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    roles_batch_restore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_delete: {
        parameters: {
            query?: {
                /** @description 是否永久删除（仅软删除模型生效） */
                permanent?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_users_by_id_assign_roles_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignRolesRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_users_by_id_reset_password_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserSimpleResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_bulk_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_users_stats_cache_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    users_trash: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_UserResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_batch_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_batch_restore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    access_log_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_APIAccessLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    access_log_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_APIAccessLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["APIApplicationCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["APIApplicationUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_delete: {
        parameters: {
            query?: {
                /** @description 是否永久删除（仅软删除模型生效） */
                permanent?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_by_id_permissions_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_api_auth_applications_by_id_permissions_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_NoneType_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_by_id_reset_secret_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_by_id_reset_validity_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetValidityPeriodSchema"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_by_id_revoke_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_NoneType_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_available_permissions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_Any__"];
                };
            };
        };
    };
    applications_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_trash: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_APIApplicationResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_batch_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    applications_batch_restore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    api_auth_applications_try_invoke_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TryInvokeApplicationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_LoginResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_LogoutResponse_"];
                };
            };
        };
    };
    auth_logout_all_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_LogoutResponse_"];
                };
            };
        };
    };
    auth_my_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_AuthMyResponse_"];
                };
            };
        };
    };
    auth_permissions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_UserPermissionsResponse_"];
                };
            };
        };
    };
    auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RefreshTokenResponse_"];
                };
            };
        };
    };
    auth_sessions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ActiveSessionsResponse_"];
                };
            };
        };
    };
    auth_sessions_by_session_uuid_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RevokeSessionResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_event_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EcsCallbackAck"];
                };
            };
        };
    };
    logs_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_CallbackLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    logs_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_CallbackLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_logs_request_by_request_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_CallbackLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_logs_subject_by_subject_code_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                subject_code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_CallbackLogSubjectResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_logs_trace_by_trace_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                trace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_CallbackLogTraceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_result_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EcsCallbackAck"];
                };
            };
        };
    };
    device_commands_by_command_code_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                command_code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ManualDebugDeviceCommandResponse_"];
                };
            };
            /** @description MANUAL_DEBUG DeviceCommand 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description DeviceCommand runtime 不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    device_commands_debug_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualDebugDeviceCommandCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ManualDebugDeviceCommandCreated_"];
                };
            };
            /** @description 联调命令合同无效 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 幂等身份或设备占用冲突 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description DeviceCommand runtime 不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    device_commands_debug_preflight_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualDebugPreflightRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ManualDebugPreflightResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_delete: {
        parameters: {
            query?: {
                /** @description 是否永久删除（仅软删除模型生效） */
                permanent?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_trash: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_DeviceResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_batch_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    devices_batch_restore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    device_evidences_by_source_event_id_blocker_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                source_event_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_EventCommandBlockResponse_"];
                };
            };
            /** @description EVENT blocker 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 阻塞因果不可用 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    device_evidences_by_source_event_id_blockers_by_block_id_reconcile_device_idle_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                block_id: number;
                source_event_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualReconcileDeviceIdleRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ManualReconcileDeviceIdleResponse_"];
                };
            };
            /** @description EVENT blocker 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 因果或设备状态不允许人工闭合 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description ECS 状态查询不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    device_evidences_by_source_event_id_blockers_by_block_id_reprocess_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                block_id: number;
                source_event_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReprocessBlockedEventRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ReprocessBlockedEventResponse_"];
                };
            };
            /** @description EVENT blocker 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 阻塞因果不允许重处理 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    device_evidences_stream_get: {
        parameters: {
            query?: {
                apply_status?: components["schemas"]["InboundEvidenceApplyStatus"] | null;
                command_code?: string | null;
                device_code?: string | null;
                kind?: components["schemas"]["DeviceIngressKind"] | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    material_material_units_location_query_get: {
        parameters: {
            query?: {
                /** @description 料箱编码 */
                bin_code?: string | null;
                /** @description ExecutionCorrelation.correlation_id */
                correlation_id?: string | null;
                /** @description 外部引用类型 */
                external_reference_type?: string | null;
                /** @description 外部引用值 */
                external_reference_value?: string | null;
                /** @description 物料身份键 */
                material_identity_key?: string | null;
                /** @description 运行对象键 */
                object_key?: string | null;
                /** @description 运行对象类型 */
                object_type?: string | null;
                /** @description PkgID / package_id */
                package_id?: string | null;
                /** @description provider code */
                provider_code?: string | null;
                /** @description 货架编码 */
                rack_code?: string | null;
                /** @description 货架面 */
                rack_side?: string | null;
                /** @description WorkLine.id */
                workline_id?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_MaterialLocationResult_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_cell_occupancies_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinCellOccupancyResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_cell_occupancies_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinCellOccupancyResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_content_snapshot_items_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinContentSnapshotItemResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_content_snapshot_items_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinContentSnapshotItemResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_content_snapshots_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinContentSnapshotResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_content_snapshots_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinContentSnapshotResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_material_mounts_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinMaterialMountResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_material_mounts_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinMaterialMountResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_slot_templates_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinSlotTemplateResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_slot_templates_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinSlotTemplateResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_types_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinTypeResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bin_types_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinTypeResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bins_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_BinResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bins_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_BinResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_bin_mounts_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RackBinMountResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_bin_mounts_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RackBinMountResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_placements_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RackPlacementResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_placements_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RackPlacementResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_slot_templates_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RackSlotTemplateResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_slot_templates_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RackSlotTemplateResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_types_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RackTypeResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rack_types_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RackTypeResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    racks_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RackResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    racks_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_RackResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    state_events_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ResourceStateEventResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    state_events_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_ResourceStateEventResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    audit_logs_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_AuditLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    audit_logs_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_AuditLogResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    sys_events_stream_get: {
        parameters: {
            query?: {
                /** @description 访问令牌（EventSource 无法设置 Authorization 头时使用） */
                token?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    transport_debug_tasks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_DebugTransportTaskRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DebugTransportTaskCreated_"];
                };
            };
            /** @description Transport 请求不满足领域约束 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 幂等身份或 Transport 资源冲突 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Transport runtime 不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    transport_evidences_stream_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
        };
    };
    transport_tasks_get: {
        parameters: {
            query?: {
                cursor?: string | null;
                kind?: components["schemas"]["TransportTaskKind"] | null;
                limit?: number;
                status?: components["schemas"]["TransportTaskStatus"] | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_TransportTaskPageResponse_"];
                };
            };
            /** @description 游标或筛选条件无效 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Transport runtime 不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    transport_tasks_by_transport_task_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                transport_task_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_TransportTaskResponse_"];
                };
            };
            /** @description TransportTask 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Transport runtime 不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    wms_events_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    data: {
                        container_id: string;
                        /** @enum {string} */
                        milestone: "SOURCE_PICKED";
                        transport_task_id: string;
                    } | {
                        container_id: string;
                        /** @enum {string} */
                        milestone: "POSITION_UNKNOWN";
                        transport_task_id: string;
                    } | {
                        container_id: string;
                        final_position: {
                            /** @enum {string} */
                            kind: "RACK_BIN_SLOT";
                            /** @enum {string} */
                            rack_face: "A" | "B";
                            rack_id: string;
                            slot_id: string;
                        } | {
                            /** @enum {string} */
                            kind: "HANDOFF_POSITION";
                            location_code: string;
                        };
                        /** @enum {string} */
                        milestone: "TARGET_PLACED";
                        transport_task_id: string;
                    };
                    /** @enum {string} */
                    operation: "transport.task.member_position_changed@v1";
                    /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                    operation_id: string;
                    /**
                     * Format: int64
                     * @description Unix 毫秒时间戳
                     */
                    timestamp: number;
                } | {
                    data: {
                        /** @enum {string} */
                        arrival_face: "A" | "B";
                        final_position: {
                            /** @enum {string} */
                            kind: "RACK_POSITION";
                            location_code: string;
                        };
                        /** @enum {string} */
                        kind: "RACK_MOVE" | "RACK_ROTATE";
                        /** Format: int64 */
                        outcome_revision: number;
                        rack_id: string;
                        /** @enum {string} */
                        status: "SUCCEEDED";
                        transport_task_id: string;
                    } | {
                        /** @enum {string} */
                        arrival_face: "A" | "B";
                        /** @enum {string} */
                        failure_code: "MANUAL_ABORTED" | "RCS_EXECUTION_FAILED" | "RCS_TASK_REJECTED";
                        final_position: {
                            /** @enum {string} */
                            kind: "RACK_POSITION";
                            location_code: string;
                        };
                        /** @enum {string} */
                        kind: "RACK_MOVE" | "RACK_ROTATE";
                        /** Format: int64 */
                        outcome_revision: number;
                        rack_id: string;
                        /** @enum {string} */
                        status: "FAILED";
                        transport_task_id: string;
                    } | {
                        /** @enum {string} */
                        failure_code: "POSITION_UNKNOWN";
                        /** @enum {string} */
                        kind: "RACK_MOVE" | "RACK_ROTATE";
                        /** Format: int64 */
                        outcome_revision: number;
                        /** @enum {boolean} */
                        position_unknown: true;
                        rack_id: string;
                        /** @enum {string} */
                        status: "FAILED";
                        transport_task_id: string;
                    } | {
                        /** @enum {string} */
                        kind: "BIN_MOVE";
                        /** Format: int64 */
                        outcome_revision: number;
                        results: ({
                            container_id: string;
                            final_position: {
                                /** @enum {string} */
                                kind: "RACK_BIN_SLOT";
                                /** @enum {string} */
                                rack_face: "A" | "B";
                                rack_id: string;
                                slot_id: string;
                            } | {
                                /** @enum {string} */
                                kind: "HANDOFF_POSITION";
                                location_code: string;
                            };
                            /** @enum {string} */
                            status: "SUCCEEDED";
                        } | {
                            container_id: string;
                            /** @enum {string} */
                            failure_code: "MANUAL_ABORTED" | "RCS_EXECUTION_FAILED" | "RCS_TASK_REJECTED";
                            final_position: {
                                /** @enum {string} */
                                kind: "RACK_BIN_SLOT";
                                /** @enum {string} */
                                rack_face: "A" | "B";
                                rack_id: string;
                                slot_id: string;
                            } | {
                                /** @enum {string} */
                                kind: "HANDOFF_POSITION";
                                location_code: string;
                            };
                            /** @enum {string} */
                            status: "FAILED";
                        } | {
                            container_id: string;
                            /** @enum {string} */
                            failure_code: "POSITION_UNKNOWN";
                            /** @enum {boolean} */
                            position_unknown: true;
                            /** @enum {string} */
                            status: "FAILED";
                        })[];
                        transport_task_id: string;
                    } | {
                        /** @enum {string} */
                        kind: "BIN_EXCHANGE";
                        /** Format: int64 */
                        outcome_revision: number;
                        results: ({
                            container_id: string;
                            final_position: {
                                /** @enum {string} */
                                kind: "RACK_BIN_SLOT";
                                /** @enum {string} */
                                rack_face: "A" | "B";
                                rack_id: string;
                                slot_id: string;
                            } | {
                                /** @enum {string} */
                                kind: "HANDOFF_POSITION";
                                location_code: string;
                            };
                            /** @enum {string} */
                            status: "SUCCEEDED";
                        } | {
                            container_id: string;
                            /** @enum {string} */
                            failure_code: "MANUAL_ABORTED" | "RCS_EXECUTION_FAILED" | "RCS_TASK_REJECTED";
                            final_position: {
                                /** @enum {string} */
                                kind: "RACK_BIN_SLOT";
                                /** @enum {string} */
                                rack_face: "A" | "B";
                                rack_id: string;
                                slot_id: string;
                            } | {
                                /** @enum {string} */
                                kind: "HANDOFF_POSITION";
                                location_code: string;
                            };
                            /** @enum {string} */
                            status: "FAILED";
                        } | {
                            container_id: string;
                            /** @enum {string} */
                            failure_code: "POSITION_UNKNOWN";
                            /** @enum {boolean} */
                            position_unknown: true;
                            /** @enum {string} */
                            status: "FAILED";
                        })[];
                        transport_task_id: string;
                    };
                    /** @enum {string} */
                    operation: "transport.task.resulted@v1";
                    /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                    operation_id: string;
                    /**
                     * Format: int64
                     * @description Unix 毫秒时间戳
                     */
                    timestamp: number;
                } | {
                    data: {
                        authoritative_position: {
                            location_code: string & (unknown & unknown);
                            /** @enum {string} */
                            type: "HANDOFF_POSITION";
                        } | {
                            location_code: string & (unknown & unknown);
                            /** @enum {string} */
                            type: "NG_POSITION";
                        } | {
                            bin_cell_id: string & (unknown & unknown);
                            bin_id: string & (unknown & unknown);
                            rack_id: string & (unknown & unknown);
                            rack_slot_code: string & (unknown & unknown);
                            /** @enum {string} */
                            type: "ONE_LAYER_BIN_CELL";
                        } | null;
                        /** @enum {string} */
                        decision: "CONTINUE" | "ABORT";
                        material_execution_id: string & (unknown & unknown);
                        material_trace_id: string & (unknown & unknown);
                        reason_code: string & (unknown & unknown);
                        reconciling_evidence_id: string & (unknown & unknown);
                        recovery_id: string & (unknown & unknown);
                    } & unknown;
                    /** @enum {string} */
                    operation: "inbound.execution.recovery_decided@v1";
                    operation_id: string;
                    /**
                     * Format: int64
                     * @description Unix 毫秒时间戳
                     */
                    timestamp: number;
                };
            };
        };
        responses: {
            /** @description 相同 WMS event 已可靠持久化 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code: "DUPLICATE";
                        data: {
                            transport_task_id: string;
                        } | Record<string, never>;
                        /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                        operation_id: string;
                        /**
                         * Format: int64
                         * @description Unix 毫秒时间戳
                         */
                        timestamp: number;
                    };
                };
            };
            /** @description WMS event 已可靠持久化 */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code: "RECEIVED";
                        data: {
                            transport_task_id: string;
                        } | Record<string, never>;
                        /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                        operation_id: string;
                        /**
                         * Format: int64
                         * @description Unix 毫秒时间戳
                         */
                        timestamp: number;
                    };
                };
            };
            /** @description 请求媒体类型、编码或 evidence envelope 不满足封闭合同 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 部署 profile 不允许无签名 callback */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description WMS event 身份、内容或不可变事实冲突 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code: "CONFLICT";
                        data: Record<string, never> | {
                            transport_task_id: string;
                        };
                        /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                        operation_id: string;
                        /**
                         * Format: int64
                         * @description Unix 毫秒时间戳
                         */
                        timestamp: number;
                    };
                };
            };
            /** @description 请求体超过固定上限 */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description WMS event 信封或 operation 专属 data 不合法 */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code: "REJECTED";
                        data: {
                            /** @enum {string} */
                            reason_code: "INVALID_EVIDENCE" | "UNSUPPORTED_OPERATION";
                        } | {
                            /** @enum {string} */
                            reason_code: "INVALID_EVIDENCE" | "UNSUPPORTED_OPERATION";
                            transport_task_id: string;
                        } | {
                            /** @enum {string} */
                            reason_code: "INVALID_DATA" | "UNSUPPORTED_OPERATION";
                        };
                        /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                        operation_id: string;
                        /**
                         * Format: int64
                         * @description Unix 毫秒时间戳
                         */
                        timestamp: number;
                    };
                };
            };
            /** @description 对应 WMS event runtime 未就绪或无法可靠持久化 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code: "UNAVAILABLE";
                        data: Record<string, never>;
                        /** @description WMS 生成的小写 canonical UUIDv7 幂等号 */
                        operation_id: string;
                        /**
                         * Format: int64
                         * @description Unix 毫秒时间戳
                         */
                        timestamp: number;
                    };
                };
            };
        };
    };
    workline_operations_reconciliations_effects_by_dispatch_key_resolve_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                dispatch_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveEffectReconciliationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_reconciliations_sessions_by_session_id_resolve_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveRuntimeReconciliationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_replay_inboxes_by_inbox_id_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                inbox_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplayInboxRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 源 Inbox 当前状态不允许 Replay */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description 源 Inbox 或所属工作线不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Replay 幂等身份冲突 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Replay 审计证据暂时无法持久化 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
        };
    };
    workline_operations_safety_worklines_by_workline_id_clear_estop_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workline_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClearWorkLineEstopRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_sandbox_ack_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SandboxAckRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_sandbox_completed_get: {
        parameters: {
            query?: {
                /** @description 按设备过滤 */
                device_id?: number | null;
                /** @description 最多返回条数 */
                limit?: number;
                /** @description 按工作线过滤 */
                workline_id?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_dict_str__Any___"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_sandbox_external_callbacks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SandboxExternalCallbackRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_sandbox_pending_get: {
        parameters: {
            query?: {
                /** @description 按设备过滤 */
                device_id?: number | null;
                /** @description 最多返回条数 */
                limit?: number;
                /** @description 按工作线过滤 */
                workline_id?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_list_dict_str__Any___"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_sandbox_worklines_by_workline_id_simulate_estop_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workline_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SimulateWorkLineEstopRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_operations_worklines_by_workline_id_start_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workline_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkLineStartRequest"];
            };
        };
        responses: {
            /** @description START 成功或幂等 replay 成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineStartResponse_"];
                };
            };
            /** @description WorkLine 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineStartErrorResponse_"];
                };
            };
            /** @description START 状态或幂等身份冲突 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineStartErrorResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description START 服务不可用 */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineStartErrorResponse_"];
                };
            };
        };
    };
    workline_runtime_operations_northbound_get: {
        parameters: {
            query?: {
                workline_id?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_NorthboundOperationalSnapshot_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkLineCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_get: {
        parameters: {
            query?: {
                /** @description 是否包含已删除记录（仅软删除模型生效） */
                include_deleted?: boolean;
                /** @description 关系加载深度 */
                max_depth?: number;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkLineUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_delete: {
        parameters: {
            query?: {
                /** @description 是否永久删除（仅软删除模型生效） */
                permanent?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_activate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkLineStateTransitionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_active_objects_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description WorkLine.id */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorklineActiveObjectsResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_configuration_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineConfigurationStatus_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_deactivate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkLineStateTransitionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_dict_str__str__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_plane_scene_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_PlaneSceneView_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workline_work_lines_by_id_plane_snapshot_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_PlaneSnapshot_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_trash: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListResponseSchemaModel_WorkLineResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_batch_permanent_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    work_lines_batch_restore: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": number[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchOperationResponseModel"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
