/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
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
    "/api/v1/admin/menus": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:menu:create] 创建Menu */
        post: operations["menus_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:menu:detail] 获取Menu */
        get: operations["menus_get"];
        /** [admin:menu:update] 更新Menu */
        put: operations["menus_update"];
        post?: never;
        /** [admin:menu:delete] 删除Menu */
        delete: operations["menus_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:menu:permanent_delete] 永久删除Menu */
        delete: operations["menus_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:menu:restore] 恢复Menu */
        post: operations["menus_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/ancestors/{node_id}": {
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
        get: operations["admin_menus_ancestors_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/batch-sort": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Batch Sort
         * @description 批量排序节点
         *
         *     适用于拖拽排序场景，一次请求更新多个节点的 parent_id 和 sort_order
         */
        put: operations["admin_menus_batch_sort_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/children/{node_id}": {
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
        get: operations["admin_menus_children_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/move": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Move Node
         * @description 移动节点
         */
        put: operations["admin_menus_move_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/my_menu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取当前用户的菜单树
         * @description 返回当前用户可访问的菜单树（基于角色权限过滤）
         */
        get: operations["admin_menus_my_menu_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:menu:list] 获取Menu列表 */
        post: operations["menus_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/siblings/{node_id}": {
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
        get: operations["admin_menus_siblings_by_node_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:menu:trash] 获取已删除Menu */
        get: operations["menus_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:menu:permanent_delete] 批量永久删除Menu */
        delete: operations["menus_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:menu:restore] 批量恢复Menu */
        post: operations["menus_batch_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/menus/tree": {
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
        get: operations["admin_menus_tree_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/admin/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:permission:create] 创建Permission */
        post: operations["permissions_create"];
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
        /** [admin:permission:update] 更新Permission */
        put: operations["permissions_update"];
        post?: never;
        /** [admin:permission:delete] 删除Permission */
        delete: operations["permissions_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:permission:permanent_delete] 永久删除Permission */
        delete: operations["permissions_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:permission:restore] 恢复Permission */
        post: operations["permissions_restore"];
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
    "/api/v1/admin/permissions/batch-sort": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Batch Sort
         * @description 批量排序节点
         *
         *     适用于拖拽排序场景，一次请求更新多个节点的 parent_id 和 sort_order
         */
        put: operations["admin_permissions_batch_sort_put"];
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
    "/api/v1/admin/permissions/move": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Move Node
         * @description 移动节点
         */
        put: operations["admin_permissions_move_put"];
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
    "/api/v1/admin/permissions/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [admin:permission:trash] 获取已删除Permission */
        get: operations["permissions_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [admin:permission:permanent_delete] 批量永久删除Permission */
        delete: operations["permissions_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [admin:permission:restore] 批量恢复Permission */
        post: operations["permissions_batch_restore"];
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
        /** [admin:role:permanent_delete] 批量永久删除Role */
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
        /** [admin:role:restore] 批量恢复Role */
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
        /** [admin:user:permanent_delete] 批量永久删除User */
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
        /** [admin:user:restore] 批量恢复User */
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
    "/api/v1/api_auth/applications/available-permissions/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [api-auth:api_application:sync_permissions] 重新扫描并同步 API 权限
         * @description 重新扫描代码中的权限并同步到数据库。
         */
        post: operations["api_auth_applications_available_permissions_sync_post"];
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
        /** [api-auth:api_application:permanent_delete] 批量永久删除APIApplication */
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
        /** [api-auth:api_application:restore] 批量恢复APIApplication */
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
         * @description 一次性返回用户信息、API 权限列表和菜单树，用于前端登录后初始化
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
        /**
         * 设备事件上报
         * @description 设备发生状态变更或传感器触发业务信号时，调用此接口上报事件（白皮书 3.2.2）
         */
        post: operations["callback_event_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/external": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 外部系统回调
         * @description 库位分配、AGV 等外部系统异步回调入口
         */
        post: operations["callback_external_post"];
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
         * [callback:callback_log:detail] 根据请求 ID 查询回调日志
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
         * [callback:callback_log:list] 根据回调主体编码查询回调日志
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
         * [callback:callback_log:list] 根据 Trace ID 查询回调日志
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
        /**
         * 任务结果回传
         * @description 设备完成指令后，调用此接口回传执行结果
         */
        post: operations["callback_result_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [demo:demoproduct:create] 创建DemoProduct */
        post: operations["demo_products_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [demo:demoproduct:detail] 获取DemoProduct */
        get: operations["demo_products_get"];
        /** [demo:demoproduct:update] 更新DemoProduct */
        put: operations["demo_products_update"];
        post?: never;
        /** [demo:demoproduct:delete] 删除DemoProduct */
        delete: operations["demo_products_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [demo:demoproduct:permanent_delete] 永久删除DemoProduct */
        delete: operations["demo_products_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [demo:demoproduct:restore] 恢复DemoProduct */
        post: operations["demo_products_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [demo:demoproduct:list] 获取DemoProduct列表 */
        post: operations["demo_products_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [demo:demoproduct:trash] 获取已删除DemoProduct */
        get: operations["demo_products_trash"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/trash/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** [demo:demoproduct:permanent_delete] 批量永久删除DemoProduct */
        delete: operations["demo_products_batch_permanent_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/demo/demo-products/trash/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [demo:demoproduct:restore] 批量恢复DemoProduct */
        post: operations["demo_products_batch_restore"];
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
    "/api/v1/device/devices/{id}/runtime/clear-fault": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:update] 清除设备故障 */
        post: operations["device_devices_by_id_runtime_clear_fault_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/{id}/runtime/enter-maintenance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:update] 设备进入维护 */
        post: operations["device_devices_by_id_runtime_enter_maintenance_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/device/devices/{id}/runtime/exit-maintenance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:device:update] 设备退出维护 */
        post: operations["device_devices_by_id_runtime_exit_maintenance_post"];
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
        /** [biz:device:permanent_delete] 批量永久删除Device */
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
        /** [biz:device:restore] 批量恢复Device */
        post: operations["devices_batch_restore"];
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
    "/api/v1/workline/ng-return-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list-ng-return-item] 查询 NG Return Items */
        get: operations["workline_ng_return_items_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/manual/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:update] 创建人工操作 */
        post: operations["workline_operations_manual_sessions_by_session_id_post"];
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
        /** [biz:workline:resolve-reconciliation] 解除 runtime reconciliation 隔离，不重发设备命令、不调用 timeout 插件处理、释放安全停靠队列 */
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
        /** [biz:workline:update] Replay 历史 Inbox */
        post: operations["workline_operations_replay_inboxes_by_inbox_id_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:update] 沙箱模拟 Command Result */
        post: operations["workline_operations_results_post"];
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
        /** [biz:workline:update] 沙箱模拟 Command ACK */
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
        /** [biz:workline:list] 查询沙箱已完成 Outbox */
        get: operations["workline_operations_sandbox_completed_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:update] 沙箱发送 Event */
        post: operations["workline_operations_sandbox_events_post"];
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
        /** [biz:workline:list] 查询沙箱待处理 Outbox */
        get: operations["workline_operations_sandbox_pending_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/operations/sandbox/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 获取沙箱模板 */
        get: operations["workline_operations_sandbox_templates_get"];
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
         * [biz:workline:update] 沙箱模拟 WorkLine 软件急停冻结
         * @description 沙箱专用安全模拟入口；不通过普通 sandbox event 流。
         */
        post: operations["workline_operations_sandbox_worklines_by_workline_id_simulate_estop_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/plugins/options": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * [biz:workline:list] 获取作业线插件选项
         * @description 从插件注册表导出作业线插件与契约版本下拉选项。
         */
        get: operations["workline_plugins_options_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime-holds/{hold_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:view-runtime-hold] 查看 Runtime Hold 明细 */
        get: operations["workline_runtime_holds_by_hold_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime-holds/{hold_id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:resolve-runtime-hold] 解除 Runtime Hold */
        post: operations["workline_runtime_holds_by_hold_id_resolve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime-holds/ng-reasons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:view-runtime-hold] 查询 Runtime Hold NG 原因选项 */
        get: operations["workline_runtime_holds_ng_reasons_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:device:list] 设备运行态列表 */
        get: operations["workline_runtime_devices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/devices/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:device:list] 设备运行态详情 */
        get: operations["workline_runtime_devices_by_device_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 运行监控总览 */
        get: operations["workline_runtime_overview_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/sessions/{session_id}/path": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] Session 设备路径视图 */
        get: operations["workline_runtime_sessions_by_session_id_path_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/traces/{trace_id}/path": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] Trace 设备路径视图 */
        get: operations["workline_runtime_traces_by_trace_id_path_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/worklines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 工作线运行态列表 */
        get: operations["workline_runtime_worklines_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/runtime/worklines/{workline_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 工作线运行态详情 */
        get: operations["workline_runtime_worklines_by_workline_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/{trace_id}/blocking-point": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 查询 Trace 阻塞点诊断卡 */
        get: operations["workline_trace_by_trace_id_blocking_point_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/command/{command_code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 根据 command_code 查询 Trace */
        get: operations["workline_trace_command_by_command_code_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/dispatch/{dispatch_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 根据 dispatch_key 查询 Trace */
        get: operations["workline_trace_dispatch_by_dispatch_key_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** [biz:workline:list] Trace 列表查询 */
        post: operations["workline_trace_query_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/request/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 根据 request_id 查询 Trace */
        get: operations["workline_trace_request_by_request_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/session/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 根据 session_id 查询 Trace */
        get: operations["workline_trace_session_by_session_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/workline/trace/trace/{trace_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [biz:workline:list] 根据 trace_id 查询 Trace */
        get: operations["workline_trace_trace_by_trace_id_get"];
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
        /** [biz:workline:permanent_delete] 批量永久删除WorkLine */
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
        /** [biz:workline:restore] 批量恢复WorkLine */
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
         *     - 菜单树
         */
        AuthMyResponse: {
            /**
             * Menus
             * @description 当前用户可访问菜单树
             */
            menus: components["schemas"]["MenuTreeResponseSimple"][];
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
         * BatchSortRequest
         * @description 批量排序请求
         */
        BatchSortRequest: {
            /**
             * Items
             * @description 排序项列表
             */
            items: components["schemas"]["SortItem"][];
        };
        /** Body_admin_menus_move_put */
        Body_admin_menus_move_put: {
            /**
             * New Parent Id
             * @description 新的父节点ID
             */
            new_parent_id: number | null;
            /**
             * Node Id
             * @description 要移动的节点ID
             */
            node_id: number;
        };
        /** Body_admin_permissions_move_put */
        Body_admin_permissions_move_put: {
            /**
             * New Parent Id
             * @description 新的父节点ID
             */
            new_parent_id: number | null;
            /**
             * Node Id
             * @description 要移动的节点ID
             */
            node_id: number;
        };
        /** Body_api_auth_applications_by_id_permissions_post */
        Body_api_auth_applications_by_id_permissions_post: {
            /** Permission Ids */
            permission_ids: number[];
        };
        /**
         * CallbackEventAcceptedResponse
         * @description 设备事件回调接收响应数据。
         */
        CallbackEventAcceptedResponse: {
            /**
             * Causation Id
             * @description 因果事件 ID
             */
            causation_id?: string | null;
            /**
             * Device Code
             * @description 设备编码
             */
            device_code: string;
            /**
             * Event Id
             * @description 供应商事件 ID
             */
            event_id?: string | null;
            /**
             * Request Id
             * @description 入口请求 ID
             */
            request_id?: string | null;
            /**
             * Status
             * @description 入口处理状态
             * @enum {string}
             */
            status: "submitted" | "duplicate";
            /**
             * Trace Id
             * @description Trace ID
             */
            trace_id?: string | null;
        };
        /** ResponseSchemaModel[Union[CallbackEventAcceptedResponse, CallbackRejectedResponse]] */
        CallbackEventIngressResponse: ApiResponse<unknown>;
        /**
         * CallbackExternalAcceptedResponse
         * @description 外部系统回调接收响应数据。
         */
        CallbackExternalAcceptedResponse: {
            /**
             * Callback Type
             * @description 外部回调类型
             */
            callback_type: string;
            /**
             * Causation Id
             * @description 因果事件 ID
             */
            causation_id?: string | null;
            /**
             * Event Id
             * @description 供应商事件 ID
             */
            event_id?: string | null;
            /**
             * Request Id
             * @description 入口请求 ID
             */
            request_id?: string | null;
            /**
             * Status
             * @description 入口处理状态
             * @enum {string}
             */
            status: "submitted" | "duplicate";
            /**
             * Trace Id
             * @description Trace ID
             */
            trace_id?: string | null;
        };
        /** ResponseSchemaModel[Union[CallbackExternalAcceptedResponse, CallbackRejectedResponse]] */
        CallbackExternalIngressResponse: ApiResponse<unknown>;
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
         * CallbackRejectedResponse
         * @description Callback 入口拒收响应数据。
         */
        CallbackRejectedResponse: {
            /**
             * Ack
             * @description 入口是否接收
             * @default false
             * @constant
             */
            ack: false;
        };
        /**
         * CallbackResultAcceptedResponse
         * @description 设备结果回调接收响应数据。
         */
        CallbackResultAcceptedResponse: {
            /**
             * Ack
             * @description 入口是否接收
             * @default true
             * @constant
             */
            ack: true;
            /**
             * Causation Id
             * @description 因果事件 ID
             */
            causation_id?: string | null;
            /**
             * Event Id
             * @description 供应商事件 ID
             */
            event_id?: string | null;
            /**
             * Request Id
             * @description 入口请求 ID
             */
            request_id?: string | null;
            /**
             * Trace Id
             * @description Trace ID
             */
            trace_id?: string | null;
        };
        /** ResponseSchemaModel[Union[CallbackResultAcceptedResponse, CallbackRejectedResponse]] */
        CallbackResultIngressResponse: ApiResponse<unknown>;
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
        /**
         * DemoProductCreate
         * @description DemoProduct 创建模型
         */
        DemoProductCreate: {
            /** Name */
            name: string;
            /** Price */
            price: number;
            /** Product Lists */
            product_lists?: components["schemas"]["DemoProductListCreate"][];
            /** Stock */
            stock: number;
        };
        /**
         * DemoProductListCreate
         * @description DemoProductList 创建模型
         *
         *     注意：product_id 在创建时是可选的，因为会自动从主表 ID 设置
         */
        DemoProductListCreate: {
            /** Product Id */
            product_id?: number | null;
            /** Quantity */
            quantity: number;
        };
        /**
         * DemoProductListResponse
         * @description DemoProductList 响应模型
         */
        DemoProductListResponse: {
            /** Id */
            id: number;
            /** Product Id */
            product_id: number;
            /** Quantity */
            quantity: number;
        };
        /**
         * DemoProductListUpdate
         * @description DemoProductList 更新模型
         *
         *     注意：在更新主表时，使用 Diff 算法处理从表：
         *     - 有 id：更新现有记录
         *     - 无 id：创建新记录
         *     - 缺失：删除记录
         *
         *     因此 id 和 product_id 都是可选的
         */
        DemoProductListUpdate: {
            /** Id */
            id?: number | null;
            /** Product Id */
            product_id?: number | null;
            /** Quantity */
            quantity?: number | null;
        };
        /**
         * DemoProductResponse
         * @description DemoProduct 响应模型
         *
         *     包含 version 字段，前端在更新时必须传回该字段
         */
        DemoProductResponse: {
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
            /** Id */
            id: number;
            /**
             * Is Deleted
             * @default false
             */
            is_deleted: boolean;
            /** Name */
            name: string;
            /** Price */
            price: number;
            /** Product Lists */
            product_lists: components["schemas"]["DemoProductListResponse"][];
            /** Stock */
            stock: number;
            /** Updated At */
            updated_at?: string | null;
            /** Updated By */
            updated_by?: number | null;
            /**
             * Version
             * @default 0
             */
            version: number;
        };
        /**
         * DemoProductUpdate
         * @description DemoProduct 更新模型
         *
         *     注意：更新时必须包含 version 字段（乐观锁）
         */
        DemoProductUpdate: {
            /** Name */
            name?: string | null;
            /** Price */
            price?: number | null;
            /** Product Lists */
            product_lists?: components["schemas"]["DemoProductListUpdate"][];
            /** Stock */
            stock?: number | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /**
         * DeviceCreate
         * @description 设备创建 Schema - 接收客户端输入
         */
        DeviceCreate: {
            /**
             * Auth Token
             * @description 认证 Token（Bearer Token）
             */
            auth_token?: string | null;
            /**
             * Callback Path
             * @description 设备侧回调/命令接收路径覆盖
             */
            callback_path?: string | null;
            /**
             * Capabilities Json
             * @description 设备能力声明（支持事件、命令、回调等）
             */
            capabilities_json?: {
                [key: string]: unknown;
            };
            /**
             * Current Command Id
             * @description 当前执行的指令 ID（关联 DeviceCommand.id）
             */
            current_command_id?: number | null;
            /**
             * Description
             * @description 设备用途说明
             */
            description?: string | null;
            /**
             * Device Code
             * @description 设备编码（业务主键）
             */
            device_code: string;
            /**
             * Device Name
             * @description 设备名称
             */
            device_name: string;
            /**
             * Device Role
             * @description 设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）
             */
            device_role: string;
            /**
             * @description 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE/MAINTENANCE）
             * @default IDLE
             */
            device_status: components["schemas"]["DeviceStatus"];
            /**
             * Diagnostic Profile
             * @description 设备诊断配置（责任角色、显示偏好、扩展属性）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /**
             * Error Code
             * @description 错误代码（status=ERROR 时）
             */
            error_code?: string | null;
            /**
             * Host
             * @description 设备 IP 地址
             */
            host?: string | null;
            /**
             * Idempotency Ttl
             * @description 指令去重缓存时间（秒，默认 1 小时）
             * @default 3600
             */
            idempotency_ttl: number;
            /**
             * Is Active
             * @description 是否启用
             * @default true
             */
            is_active: boolean;
            /**
             * Last Heartbeat At
             * @description 最后心跳时间
             */
            last_heartbeat_at?: string | null;
            /**
             * Maintenance Mode
             * @description 是否处于维护模式（维护中不参与正常编排）
             * @default false
             */
            maintenance_mode: boolean;
            /**
             * Max Concurrent Tasks
             * @description 固定为 1：单设备同一时间只允许一个硬件任务
             * @default 1
             */
            max_concurrent_tasks: number;
            /**
             * Port
             * @description 服务端口
             */
            port?: number | null;
            /**
             * @description 通信协议
             * @default HTTP
             */
            protocol: components["schemas"]["DeviceProtocol"];
            /**
             * Role Index
             * @description 同角色序号（1, 2, 3...）
             * @default 1
             */
            role_index: number;
            /**
             * Sort Order
             * @description 排序顺序
             * @default 0
             */
            sort_order: number;
            /**
             * Timeout
             * @description 请求超时时间（毫秒，默认 10s）
             * @default 10000
             */
            timeout: number;
            /**
             * Upstream Device Id
             * @description 上游设备ID（线性拓扑）
             */
            upstream_device_id?: number | null;
            /**
             * Vendor Type
             * @description 厂商类型（ECS, KEYENCE, FANUC...）
             */
            vendor_type?: string | null;
            /**
             * Work Line Id
             * @description 所属作业线 ID
             */
            work_line_id?: number | null;
        };
        /**
         * DeviceMaintenanceRequest
         * @description 设备维护操作请求。
         */
        DeviceMaintenanceRequest: {
            /**
             * Reason
             * @description 维护原因码
             */
            reason?: string | null;
        };
        /**
         * DeviceProtocol
         * @description 设备通信协议枚举（白皮书 2.1 节）
         * @enum {string}
         */
        DeviceProtocol: "HTTP" | "HTTPS" | "TCP" | "MODBUS" | "MQTT";
        /**
         * DeviceResponse
         * @description 设备响应 Schema - 返回给客户端
         */
        DeviceResponse: {
            /**
             * Auth Token
             * @description 认证 Token（Bearer Token）
             */
            auth_token?: string | null;
            /**
             * Callback Path
             * @description 设备侧回调/命令接收路径覆盖
             */
            callback_path?: string | null;
            /**
             * Capabilities Json
             * @description 设备能力声明（支持事件、命令、回调等）
             */
            capabilities_json?: {
                [key: string]: unknown;
            };
            /**
             * Current Command Id
             * @description 当前执行的指令 ID（关联 DeviceCommand.id）
             */
            current_command_id?: number | null;
            /**
             * Description
             * @description 设备用途说明
             */
            description?: string | null;
            /**
             * Device Code
             * @description 设备编码（业务主键）
             */
            device_code: string;
            /**
             * Device Name
             * @description 设备名称
             */
            device_name: string;
            /**
             * Device Role
             * @description 设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）
             */
            device_role: string;
            /**
             * @description 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE/MAINTENANCE）
             * @default IDLE
             */
            device_status: components["schemas"]["DeviceStatus"];
            /**
             * Diagnostic Profile
             * @description 设备诊断配置（责任角色、显示偏好、扩展属性）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            };
            /**
             * Error Code
             * @description 错误代码（status=ERROR 时）
             */
            error_code?: string | null;
            /**
             * Host
             * @description 设备 IP 地址
             */
            host?: string | null;
            /** Id */
            id: number;
            /**
             * Idempotency Ttl
             * @description 指令去重缓存时间（秒，默认 1 小时）
             * @default 3600
             */
            idempotency_ttl: number;
            /**
             * Is Active
             * @description 是否启用
             * @default true
             */
            is_active: boolean;
            /**
             * Last Heartbeat At
             * @description 最后心跳时间
             */
            last_heartbeat_at?: string | null;
            /**
             * Maintenance Mode
             * @description 是否处于维护模式（维护中不参与正常编排）
             * @default false
             */
            maintenance_mode: boolean;
            /**
             * Max Concurrent Tasks
             * @description 固定为 1：单设备同一时间只允许一个硬件任务
             * @default 1
             */
            max_concurrent_tasks: number;
            /**
             * Port
             * @description 服务端口
             */
            port?: number | null;
            /**
             * @description 通信协议
             * @default HTTP
             */
            protocol: components["schemas"]["DeviceProtocol"];
            /**
             * Role Index
             * @description 同角色序号（1, 2, 3...）
             * @default 1
             */
            role_index: number;
            /**
             * Sort Order
             * @description 排序顺序
             * @default 0
             */
            sort_order: number;
            /**
             * Timeout
             * @description 请求超时时间（毫秒，默认 10s）
             * @default 10000
             */
            timeout: number;
            /**
             * Upstream Device Id
             * @description 上游设备ID（线性拓扑）
             */
            upstream_device_id?: number | null;
            /**
             * Vendor Type
             * @description 厂商类型（ECS, KEYENCE, FANUC...）
             */
            vendor_type?: string | null;
            /** Version */
            version: number;
            /**
             * Work Line Id
             * @description 所属作业线 ID
             */
            work_line_id?: number | null;
        };
        /**
         * DeviceRuntimeActionRequest
         * @description 设备运行态空操作请求，保留扩展位。
         */
        DeviceRuntimeActionRequest: {
            /**
             * Reason
             * @description 操作原因
             */
            reason?: string | null;
        };
        /**
         * DeviceStatus
         * @description 设备状态枚举（白皮书 5.2 节）
         * @enum {string}
         */
        DeviceStatus: "IDLE" | "RUNNING" | "ERROR" | "OFFLINE" | "MAINTENANCE";
        /**
         * DeviceUpdate
         * @description 设备更新 Schema - 只允许主数据与通信配置，运行态走专用操作
         */
        DeviceUpdate: {
            /**
             * Auth Token
             * @description 认证 Token（Bearer Token）
             */
            auth_token?: string | null;
            /**
             * Callback Path
             * @description 设备侧回调/命令接收路径覆盖
             */
            callback_path?: string | null;
            /**
             * Capabilities Json
             * @description 设备能力声明（支持事件、命令、回调等）
             */
            capabilities_json?: {
                [key: string]: unknown;
            } | null;
            /**
             * Description
             * @description 设备用途说明
             */
            description?: string | null;
            /**
             * Device Code
             * @description 设备编码（业务主键）
             */
            device_code?: string | null;
            /**
             * Device Name
             * @description 设备名称
             */
            device_name?: string | null;
            /**
             * Device Role
             * @description 设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）
             */
            device_role?: string | null;
            /**
             * Diagnostic Profile
             * @description 设备诊断配置（责任角色、显示偏好、扩展属性）
             */
            diagnostic_profile?: {
                [key: string]: unknown;
            } | null;
            /**
             * Host
             * @description 设备 IP 地址
             */
            host?: string | null;
            /**
             * Idempotency Ttl
             * @description 指令去重缓存时间（秒，默认 1 小时）
             */
            idempotency_ttl?: number | null;
            /**
             * Is Active
             * @description 是否启用
             */
            is_active?: boolean | null;
            /**
             * Port
             * @description 服务端口
             */
            port?: number | null;
            /** @description 通信协议 */
            protocol?: components["schemas"]["DeviceProtocol"] | null;
            /**
             * Role Index
             * @description 同角色序号（1, 2, 3...）
             */
            role_index?: number | null;
            /**
             * Sort Order
             * @description 排序顺序
             */
            sort_order?: number | null;
            /**
             * Timeout
             * @description 请求超时时间（毫秒，默认 10s）
             */
            timeout?: number | null;
            /**
             * Upstream Device Id
             * @description 上游设备ID（线性拓扑）
             */
            upstream_device_id?: number | null;
            /**
             * Vendor Type
             * @description 厂商类型（ECS, KEYENCE, FANUC...）
             */
            vendor_type?: string | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
            /**
             * Work Line Id
             * @description 所属作业线 ID
             */
            work_line_id?: number | null;
        };
        /** DiagnosticCardResponse */
        DiagnosticCardResponse: {
            context: components["schemas"]["TraceDiagnosticContextItem"];
            /** Error Code */
            error_code: string;
            /** Error Domain */
            error_domain: string;
            /** Next Steps */
            next_steps?: string[];
            /** Operator Action */
            operator_action?: string | null;
            /** Problem Class */
            problem_class: string;
            /** Recoverability */
            recoverability: string;
            /** Severity */
            severity: string;
            /** Summary */
            summary: string;
            /** Technical Summary */
            technical_summary?: string | null;
            /** Title */
            title: string;
            /** User Message */
            user_message: string;
        };
        /**
         * FailedCommandEvidence
         * @description Failed command evidence for operator review.
         */
        FailedCommandEvidence: {
            /** Command Code */
            command_code?: string | null;
            /** Command Id */
            command_id?: number | null;
            /** Error Detail */
            error_detail?: {
                [key: string]: unknown;
            } | null;
            /** Result */
            result?: string | null;
            /** Result Data */
            result_data?: {
                [key: string]: unknown;
            } | null;
            /** Status */
            status?: string | null;
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
         * LineType
         * @description 作业线类型枚举
         * @enum {string}
         */
        LineType: "AUTO" | "MANUAL" | "HYBRID";
        /** ListResponseData[APIAccessLogResponse] */
        ListResponseData_APIAccessLogResponse_: ApiListData<components["schemas"]["APIAccessLogResponse"]>;
        /** ListResponseData[APIApplicationResponse] */
        ListResponseData_APIApplicationResponse_: ApiListData<components["schemas"]["APIApplicationResponse"]>;
        /** ListResponseData[AuditLogResponse] */
        ListResponseData_AuditLogResponse_: ApiListData<components["schemas"]["AuditLogResponse"]>;
        /** ListResponseData[CallbackLogResponse] */
        ListResponseData_CallbackLogResponse_: ApiListData<components["schemas"]["CallbackLogResponse"]>;
        /** ListResponseData[DemoProductResponse] */
        ListResponseData_DemoProductResponse_: ApiListData<components["schemas"]["DemoProductResponse"]>;
        /** ListResponseData[DeviceResponse] */
        ListResponseData_DeviceResponse_: ApiListData<components["schemas"]["DeviceResponse"]>;
        /** ListResponseData[MenuResponse] */
        ListResponseData_MenuResponse_: ApiListData<components["schemas"]["MenuResponse"]>;
        /** ListResponseData[PermissionResponse] */
        ListResponseData_PermissionResponse_: ApiListData<components["schemas"]["PermissionResponse"]>;
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
        /** ListResponseSchemaModel[CallbackLogResponse] */
        ListResponseSchemaModel_CallbackLogResponse_: ApiListResponse<components["schemas"]["CallbackLogResponse"]>;
        /** ListResponseSchemaModel[DemoProductResponse] */
        ListResponseSchemaModel_DemoProductResponse_: ApiListResponse<components["schemas"]["DemoProductResponse"]>;
        /** ListResponseSchemaModel[DeviceResponse] */
        ListResponseSchemaModel_DeviceResponse_: ApiListResponse<components["schemas"]["DeviceResponse"]>;
        /** ListResponseSchemaModel[MenuResponse] */
        ListResponseSchemaModel_MenuResponse_: ApiListResponse<components["schemas"]["MenuResponse"]>;
        /** ListResponseSchemaModel[PermissionResponse] */
        ListResponseSchemaModel_PermissionResponse_: ApiListResponse<components["schemas"]["PermissionResponse"]>;
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
        /**
         * ManualOperationRequest
         * @description 人工操作请求。
         */
        ManualOperationRequest: {
            /** Operation */
            operation: string;
            /** Operator Id */
            operator_id: string;
            /** Reason */
            reason: string;
        };
        /**
         * MenuCreate
         * @description 菜单创建 Schema
         */
        MenuCreate: {
            /**
             * Component
             * @description 组件路径，如 views/system/users.vue
             */
            component?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /**
             * Icon
             * @description 图标
             */
            icon?: string | null;
            /**
             * Is Hidden
             * @description 是否隐藏
             * @default false
             */
            is_hidden: boolean;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Name
             * @description 菜单标识，如 system:users
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description 路由路径，如 /system/users
             */
            path: string;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Title
             * @description 显示标题
             */
            title: string;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
        };
        /**
         * MenuResponse
         * @description 菜单响应 Schema
         */
        MenuResponse: {
            /**
             * Component
             * @description 组件路径，如 views/system/users.vue
             */
            component?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /**
             * Icon
             * @description 图标
             */
            icon?: string | null;
            /** Id */
            id: number;
            /**
             * Is Hidden
             * @description 是否隐藏
             * @default false
             */
            is_hidden: boolean;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Name
             * @description 菜单标识，如 system:users
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description 路由路径，如 /system/users
             */
            path: string;
            /** Roles */
            roles?: components["schemas"]["RoleResponse"][];
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Title
             * @description 显示标题
             */
            title: string;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
            /** Version */
            version: number;
        };
        /**
         * MenuTreeResponse
         * @description 菜单树响应 Schema
         */
        MenuTreeResponse: {
            /** Children */
            children?: components["schemas"]["MenuTreeResponse"][];
            /**
             * Component
             * @description 组件路径，如 views/system/users.vue
             */
            component?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /**
             * Icon
             * @description 图标
             */
            icon?: string | null;
            /** Id */
            id: number;
            /**
             * Is Hidden
             * @description 是否隐藏
             * @default false
             */
            is_hidden: boolean;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Name
             * @description 菜单标识，如 system:users
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description 路由路径，如 /system/users
             */
            path: string;
            /** Roles */
            roles?: components["schemas"]["RoleResponse"][];
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Title
             * @description 显示标题
             */
            title: string;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
            /** Version */
            version: number;
        };
        /**
         * MenuTreeResponseSimple
         * @description 菜单树响应 Schema
         */
        MenuTreeResponseSimple: {
            /** Children */
            children?: components["schemas"]["MenuTreeResponseSimple"][];
            /**
             * Component
             * @description 组件路径，如 views/system/users.vue
             */
            component?: string | null;
            /**
             * Has Children
             * @default false
             */
            has_children: boolean;
            /**
             * Icon
             * @description 图标
             */
            icon?: string | null;
            /** Id */
            id: number;
            /**
             * Is Hidden
             * @description 是否隐藏
             * @default false
             */
            is_hidden: boolean;
            /**
             * Level
             * @default 1
             */
            level: number;
            /**
             * Name
             * @description 菜单标识，如 system:users
             */
            name: string;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description 路由路径，如 /system/users
             */
            path: string;
            /**
             * Sort Order
             * @default 0
             */
            sort_order: number;
            /**
             * Title
             * @description 显示标题
             */
            title: string;
            /**
             * Tree Path
             * @default /
             */
            tree_path: string;
            /** Version */
            version: number;
        };
        /**
         * MenuUpdate
         * @description 菜单更新 Schema
         */
        MenuUpdate: {
            /**
             * Component
             * @description 组件路径，如 views/system/users.vue
             */
            component?: string | null;
            /** Has Children */
            has_children?: boolean | null;
            /**
             * Icon
             * @description 图标
             */
            icon?: string | null;
            /**
             * Is Hidden
             * @description 是否隐藏
             */
            is_hidden?: boolean | null;
            /** Level */
            level?: number | null;
            /**
             * Name
             * @description 菜单标识，如 system:users
             */
            name?: string | null;
            /** Parent Id */
            parent_id?: number | null;
            /**
             * Path
             * @description 路由路径，如 /system/users
             */
            path?: string | null;
            /** Sort Order */
            sort_order?: number | null;
            /**
             * Title
             * @description 显示标题
             */
            title?: string | null;
            /** Tree Path */
            tree_path?: string | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /**
         * NgReasonInput
         * @description Operator-selected NG reason.
         */
        NgReasonInput: {
            /**
             * Code
             * @description Canonical NG reason code
             */
            code: string;
            /**
             * Label
             * @description Human-readable NG reason label
             */
            label: string;
            /**
             * Source
             * @description NG reason source
             */
            source: string;
        };
        /**
         * NgReasonOption
         * @description NG reason option.
         */
        NgReasonOption: {
            /** Code */
            code: string;
            /** Contract Version */
            contract_version?: string | null;
            /** Label */
            label: string;
            /** Maps From */
            maps_from?: string[];
            /** Plugin Key */
            plugin_key?: string | null;
            /** Source */
            source: string;
        };
        /**
         * NgReturnItemResponse
         * @description NG return item response.
         */
        NgReturnItemResponse: {
            /** Confirmed At */
            confirmed_at?: string | null;
            /** Confirmed By */
            confirmed_by?: number | null;
            /** Created At */
            created_at?: string | null;
            /** Created From Runtime Hold Id */
            created_from_runtime_hold_id?: number | null;
            /** Disposition */
            disposition: string;
            /** Id */
            id: number;
            /** Material Identity Json */
            material_identity_json: {
                [key: string]: unknown;
            };
            /** Material Identity Key */
            material_identity_key: string;
            /** Ng Reason Code */
            ng_reason_code: string;
            /** Ng Reason Label */
            ng_reason_label: string;
            /** Ng Reason Source */
            ng_reason_source: string;
            /** Operator Note */
            operator_note?: string | null;
            /** Physical Handoff Evidence Json */
            physical_handoff_evidence_json: {
                [key: string]: unknown;
            };
            /** Source Command Id */
            source_command_id?: number | null;
            /** Source Event Id */
            source_event_id?: string | null;
            /** Source Session Id */
            source_session_id: number;
            /** Source Workline Id */
            source_workline_id: number;
            /** Status */
            status: string;
        };
        /**
         * OperaStatus
         * @description 操作日志状态
         * @enum {string}
         */
        OperaStatus: "FAIL" | "SUCCESS";
        /**
         * PermissionCreate
         * @description API 权限创建 Schema
         */
        PermissionCreate: {
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
         * PermissionUpdate
         * @description API 权限更新 Schema
         */
        PermissionUpdate: {
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
            /** Has Children */
            has_children?: boolean | null;
            /** Level */
            level?: number | null;
            /**
             * Method
             * @description HTTP 方法：GET、POST、PUT、DELETE、PATCH 等
             */
            method?: string | null;
            /**
             * Name
             * @description 权限标识，如 admin:role:create
             */
            name?: string | null;
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
            /** Sort Order */
            sort_order?: number | null;
            /** Tree Path */
            tree_path?: string | null;
            /**
             * Type
             * @description 权限类型：user_api（内部管理API）、app_api（外部应用API）
             */
            type?: string | null;
            /**
             * Version
             * @description 乐观锁版本号，更新时必传
             */
            version: number;
        };
        /**
         * PhysicalHandoffEvidenceInput
         * @description Client-submitted physical handoff evidence.
         *
         *     Server-owned facts such as confirmed_by, confirmed_at and material_identity
         *     are intentionally not part of this schema.
         */
        PhysicalHandoffEvidenceInput: {
            /**
             * Handoff Witness Id
             * @description 可选见证人
             */
            handoff_witness_id?: string | null;
            /**
             * Late Callback Reviewed
             * @description 已复核迟到 callback evidence
             */
            late_callback_reviewed: boolean;
            /**
             * Line Clear Checked
             * @description 已确认工位/设备无残留同一物料
             */
            line_clear_checked: boolean;
            /**
             * Material Scan Payload
             * @description 现场重新扫描到的物料原文
             */
            material_scan_payload: {
                [key: string]: unknown;
            } | string;
            /**
             * Ng Location Code
             * @description NG 暂存位置编码
             */
            ng_location_code: string;
            /**
             * Ng Location Scan
             * @description NG 位置扫码原文
             */
            ng_location_scan: string;
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
            /** Operator Id */
            operator_id?: string | null;
            /** Reason */
            reason: string;
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
         * ResolveRuntimeHoldRequest
         * @description Resolve Runtime Hold request.
         */
        ResolveRuntimeHoldRequest: {
            /**
             * Checks
             * @description 服务端要求的 release checklist
             */
            checks: {
                [key: string]: boolean;
            };
            /**
             * Hold Version
             * @description RuntimeHold 乐观锁版本
             */
            hold_version: number;
            /**
             * Latest Evidence Hash
             * @description 页面看到的最新证据 hash
             */
            latest_evidence_hash: string;
            /**
             * Material Disposition
             * @description 物料处置
             * @enum {string}
             */
            material_disposition: "CONTINUE" | "RETURN_TO_NG";
            /** @description RETURN_TO_NG 时必填 */
            ng_reason?: components["schemas"]["NgReasonInput"] | null;
            /**
             * Operator Note
             * @description 现场确认说明
             */
            operator_note: string;
            /** @description RETURN_TO_NG 时必填；只包含客户端可提交证据 */
            physical_handoff_evidence?: components["schemas"]["PhysicalHandoffEvidenceInput"] | null;
            /**
             * Resolution
             * @description Session 结论
             * @enum {string}
             */
            resolution: "COMPLETED" | "FAILED" | "CANCELLED";
            /**
             * Result Payload
             * @description CONTINUE/COMPLETED 可补充业务结果
             */
            result_payload?: {
                [key: string]: unknown;
            } | null;
        };
        /**
         * ResolveRuntimeHoldResponse
         * @description Resolve Runtime Hold response.
         */
        ResolveRuntimeHoldResponse: {
            /** Created Inbox Id */
            created_inbox_id?: number | null;
            /** Hold Id */
            hold_id: number;
            /** Ng Return Item Id */
            ng_return_item_id?: number | null;
            /** Released Outbox Count */
            released_outbox_count: number;
            /** Remaining Active Blocking Holds */
            remaining_active_blocking_holds: number;
            /** Status */
            status: string;
            /** Workline Id */
            workline_id: number;
            /** Workline Runtime Status */
            workline_runtime_status: string;
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
        /** ResponseSchemaModel[CallbackLogResponse] */
        ResponseSchemaModel_CallbackLogResponse_: ApiResponse<components["schemas"]["CallbackLogResponse"]>;
        /** ResponseSchemaModel[CallbackLogSubjectResponse] */
        ResponseSchemaModel_CallbackLogSubjectResponse_: ApiResponse<components["schemas"]["CallbackLogSubjectResponse"]>;
        /** ResponseSchemaModel[CallbackLogTraceResponse] */
        ResponseSchemaModel_CallbackLogTraceResponse_: ApiResponse<components["schemas"]["CallbackLogTraceResponse"]>;
        /** ResponseSchemaModel[DemoProductResponse] */
        ResponseSchemaModel_DemoProductResponse_: ApiResponse<components["schemas"]["DemoProductResponse"]>;
        /** ResponseSchemaModel[DeviceResponse] */
        ResponseSchemaModel_DeviceResponse_: ApiResponse<components["schemas"]["DeviceResponse"]>;
        /** ResponseSchemaModel[dict[str, Any]] */
        ResponseSchemaModel_dict_str__Any__: ApiResponse<Record<string, unknown>>;
        /** ResponseSchemaModel[dict[str, str]] */
        ResponseSchemaModel_dict_str__str__: ApiResponse<Record<string, string>>;
        /** ResponseSchemaModel[list[Any]] */
        ResponseSchemaModel_list_Any__: ApiResponse<unknown[]>;
        /** ResponseSchemaModel[list[dict[str, Any]]] */
        ResponseSchemaModel_list_dict_str__Any___: ApiResponse<Record<string, unknown>[]>;
        /** ResponseSchemaModel[list[MenuResponse]] */
        ResponseSchemaModel_list_MenuResponse__: ApiResponse<components["schemas"]["MenuResponse"][]>;
        /** ResponseSchemaModel[list[MenuTreeResponse]] */
        ResponseSchemaModel_list_MenuTreeResponse__: ApiResponse<components["schemas"]["MenuTreeResponse"][]>;
        /** ResponseSchemaModel[list[MenuTreeResponseSimple]] */
        ResponseSchemaModel_list_MenuTreeResponseSimple__: ApiResponse<components["schemas"]["MenuTreeResponseSimple"][]>;
        /** ResponseSchemaModel[list[NgReasonOption]] */
        ResponseSchemaModel_list_NgReasonOption__: ApiResponse<components["schemas"]["NgReasonOption"][]>;
        /** ResponseSchemaModel[list[NgReturnItemResponse]] */
        ResponseSchemaModel_list_NgReturnItemResponse__: ApiResponse<components["schemas"]["NgReturnItemResponse"][]>;
        /** ResponseSchemaModel[list[PermissionResponse]] */
        ResponseSchemaModel_list_PermissionResponse__: ApiResponse<components["schemas"]["PermissionResponse"][]>;
        /** ResponseSchemaModel[list[PermissionTree]] */
        ResponseSchemaModel_list_PermissionTree__: ApiResponse<components["schemas"]["PermissionTree"][]>;
        /** ResponseSchemaModel[list[RuntimeDeviceSummary]] */
        ResponseSchemaModel_list_RuntimeDeviceSummary__: ApiResponse<components["schemas"]["RuntimeDeviceSummary"][]>;
        /** ResponseSchemaModel[list[RuntimeWorklineSummary]] */
        ResponseSchemaModel_list_RuntimeWorklineSummary__: ApiResponse<components["schemas"]["RuntimeWorklineSummary"][]>;
        /** ResponseSchemaModel[list[WorkLinePluginOption]] */
        ResponseSchemaModel_list_WorkLinePluginOption__: ApiResponse<components["schemas"]["WorkLinePluginOption"][]>;
        /** ResponseSchemaModel[LoginResponse] */
        ResponseSchemaModel_LoginResponse_: ApiResponse<components["schemas"]["LoginResponse"]>;
        /** ResponseSchemaModel[LogoutResponse] */
        ResponseSchemaModel_LogoutResponse_: ApiResponse<components["schemas"]["LogoutResponse"]>;
        /** ResponseSchemaModel[MenuResponse] */
        ResponseSchemaModel_MenuResponse_: ApiResponse<components["schemas"]["MenuResponse"]>;
        /** ResponseSchemaModel[NoneType] */
        ResponseSchemaModel_NoneType_: ApiResponse<null>;
        /** ResponseSchemaModel[PermissionResponse] */
        ResponseSchemaModel_PermissionResponse_: ApiResponse<components["schemas"]["PermissionResponse"]>;
        /** ResponseSchemaModel[RefreshTokenResponse] */
        ResponseSchemaModel_RefreshTokenResponse_: ApiResponse<components["schemas"]["RefreshTokenResponse"]>;
        /** ResponseSchemaModel[ResolveRuntimeHoldResponse] */
        ResponseSchemaModel_ResolveRuntimeHoldResponse_: ApiResponse<components["schemas"]["ResolveRuntimeHoldResponse"]>;
        /** ResponseSchemaModel[RevokeSessionResponse] */
        ResponseSchemaModel_RevokeSessionResponse_: ApiResponse<components["schemas"]["RevokeSessionResponse"]>;
        /** ResponseSchemaModel[RoleResponse] */
        ResponseSchemaModel_RoleResponse_: ApiResponse<components["schemas"]["RoleResponse"]>;
        /** ResponseSchemaModel[RuntimeDeviceDetailResponse] */
        ResponseSchemaModel_RuntimeDeviceDetailResponse_: ApiResponse<components["schemas"]["RuntimeDeviceDetailResponse"]>;
        /** ResponseSchemaModel[RuntimeHoldDetailResponse] */
        ResponseSchemaModel_RuntimeHoldDetailResponse_: ApiResponse<components["schemas"]["RuntimeHoldDetailResponse"]>;
        /** ResponseSchemaModel[RuntimeOverviewResponse] */
        ResponseSchemaModel_RuntimeOverviewResponse_: ApiResponse<components["schemas"]["RuntimeOverviewResponse"]>;
        /** ResponseSchemaModel[RuntimeTraceListResponse] */
        ResponseSchemaModel_RuntimeTraceListResponse_: ApiResponse<components["schemas"]["RuntimeTraceListResponse"]>;
        /** ResponseSchemaModel[RuntimeTracePathResponse] */
        ResponseSchemaModel_RuntimeTracePathResponse_: ApiResponse<components["schemas"]["RuntimeTracePathResponse"]>;
        /** ResponseSchemaModel[RuntimeWorklineDetailResponse] */
        ResponseSchemaModel_RuntimeWorklineDetailResponse_: ApiResponse<components["schemas"]["RuntimeWorklineDetailResponse"]>;
        /** ResponseSchemaModel[SandboxTemplatesResponse] */
        ResponseSchemaModel_SandboxTemplatesResponse_: ApiResponse<components["schemas"]["SandboxTemplatesResponse"]>;
        /** ResponseSchemaModel[TraceBlockingPointResponse] */
        ResponseSchemaModel_TraceBlockingPointResponse_: ApiResponse<components["schemas"]["TraceBlockingPointResponse"]>;
        /** ResponseSchemaModel[TraceDetailResponse] */
        ResponseSchemaModel_TraceDetailResponse_: ApiResponse<components["schemas"]["TraceDetailResponse"]>;
        /** ResponseSchemaModel[UserPermissionsResponse] */
        ResponseSchemaModel_UserPermissionsResponse_: ApiResponse<components["schemas"]["UserPermissionsResponse"]>;
        /** ResponseSchemaModel[UserResponse] */
        ResponseSchemaModel_UserResponse_: ApiResponse<components["schemas"]["UserResponse"]>;
        /** ResponseSchemaModel[UserSimpleResponse] */
        ResponseSchemaModel_UserSimpleResponse_: ApiResponse<components["schemas"]["UserSimpleResponse"]>;
        /** ResponseSchemaModel[WorkLineResponse] */
        ResponseSchemaModel_WorkLineResponse_: ApiResponse<components["schemas"]["WorkLineResponse"]>;
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
        /** RuntimeBlockingReason */
        RuntimeBlockingReason: {
            /** Detail */
            detail?: string | null;
            /** Device Id */
            device_id?: number | null;
            /** Reason */
            reason: string;
        };
        /** RuntimeDeviceDetailResponse */
        RuntimeDeviceDetailResponse: {
            /** Active Sessions */
            active_sessions?: components["schemas"]["RuntimeTraceListItem"][];
            /** Recent Callbacks */
            recent_callbacks?: components["schemas"]["TraceCallbackLogItem"][];
            /** Recent Commands */
            recent_commands?: components["schemas"]["TraceCommandItem"][];
            summary: components["schemas"]["RuntimeDeviceSummary"];
        };
        /** RuntimeDeviceHealthSummary */
        RuntimeDeviceHealthSummary: {
            /**
             * Abnormal
             * @default 0
             */
            abnormal: number;
            /**
             * Healthy
             * @default 0
             */
            healthy: number;
            /**
             * Loaded
             * @default 0
             */
            loaded: number;
            /**
             * Maintenance
             * @default 0
             */
            maintenance: number;
            /**
             * Total
             * @default 0
             */
            total: number;
        };
        /** RuntimeDeviceSummary */
        RuntimeDeviceSummary: {
            /** Active Runtime Hold Ids */
            active_runtime_hold_ids?: number[];
            /**
             * Blocked Outbox Count
             * @default 0
             */
            blocked_outbox_count: number;
            /** Current Command Id */
            current_command_id?: number | null;
            /** Device Code */
            device_code: string;
            /** Device Name */
            device_name: string;
            /** Device Role */
            device_role: string;
            /** Device Status */
            device_status: string;
            /** Error Code */
            error_code?: string | null;
            /** Id */
            id: number;
            /** Last Heartbeat At */
            last_heartbeat_at?: string | null;
            /**
             * Maintenance Mode
             * @default false
             */
            maintenance_mode: boolean;
            /**
             * Open Command Count
             * @default 0
             */
            open_command_count: number;
            /**
             * Open Issue Count
             * @default 0
             */
            open_issue_count: number;
            /**
             * Pending Command Count
             * @default 0
             */
            pending_command_count: number;
            /** Recent Callback At */
            recent_callback_at?: string | null;
            /** Role Index */
            role_index: number;
            /** Workline Code */
            workline_code?: string | null;
            /** Workline Id */
            workline_id?: number | null;
            /** Workline Name */
            workline_name?: string | null;
        };
        /**
         * RuntimeHoldBlocker
         * @description Another active hold blocking the same WorkLine.
         */
        RuntimeHoldBlocker: {
            /** Hold Type */
            hold_type: string;
            /** Id */
            id: number;
            /** Session Id */
            session_id?: number | null;
            /** Source Device Id */
            source_device_id?: number | null;
            /** Source Reason */
            source_reason: string;
            /** Status */
            status: string;
        };
        /**
         * RuntimeHoldDetailResponse
         * @description Runtime Hold detail response.
         */
        RuntimeHoldDetailResponse: {
            /** Blockers */
            blockers?: components["schemas"]["RuntimeHoldBlocker"][];
            /** Evidence Snapshot Json */
            evidence_snapshot_json: {
                [key: string]: unknown;
            };
            failed_command_evidence?: components["schemas"]["FailedCommandEvidence"] | null;
            release_eligibility: components["schemas"]["RuntimeHoldReleaseEligibility"];
            /** Release Evidence Json */
            release_evidence_json: {
                [key: string]: unknown;
            };
            source: components["schemas"]["RuntimeHoldSource"];
            summary: components["schemas"]["RuntimeHoldSummary"];
        };
        /**
         * RuntimeHoldReleaseEligibility
         * @description Current release decision model.
         */
        RuntimeHoldReleaseEligibility: {
            /** Allowed Material Dispositions */
            allowed_material_dispositions?: string[];
            /** Allowed Resolutions */
            allowed_resolutions?: string[];
            /** Can Resolve */
            can_resolve: boolean;
            /** Latest Evidence Hash */
            latest_evidence_hash: string;
            /** Reason */
            reason?: string | null;
            /** Required Checks */
            required_checks?: string[];
        };
        /**
         * RuntimeHoldSource
         * @description Runtime Hold source refs.
         */
        RuntimeHoldSource: {
            /** Source Command Id */
            source_command_id?: number | null;
            /** Source Device Id */
            source_device_id?: number | null;
            /** Source Idempotency Key */
            source_idempotency_key: string;
            /** Source Inbox Id */
            source_inbox_id?: number | null;
            /** Source Kind */
            source_kind: string;
            /** Source Outbox Id */
            source_outbox_id?: number | null;
            /** Source Reason */
            source_reason: string;
        };
        /**
         * RuntimeHoldSummary
         * @description Runtime Hold summary.
         */
        RuntimeHoldSummary: {
            /** Blocking */
            blocking: boolean;
            /** Contract Version */
            contract_version?: string | null;
            /** Created At */
            created_at?: string | null;
            /** Hold Type */
            hold_type: string;
            /** Id */
            id: number;
            /** Material Disposition */
            material_disposition?: string | null;
            /** Ng Reason Code */
            ng_reason_code?: string | null;
            /** Ng Reason Label */
            ng_reason_label?: string | null;
            /** Plugin Key */
            plugin_key?: string | null;
            /** Resolved At */
            resolved_at?: string | null;
            /** Resolved By */
            resolved_by?: number | null;
            /** Session Id */
            session_id?: number | null;
            /** Source Reason */
            source_reason: string;
            /** Status */
            status: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Version */
            version: number;
            /** Workline Id */
            workline_id: number;
        };
        /** RuntimeOverviewResponse */
        RuntimeOverviewResponse: {
            /** Abnormal Devices */
            abnormal_devices?: components["schemas"]["RuntimeDeviceSummary"][];
            device_health?: components["schemas"]["RuntimeDeviceHealthSummary"];
            /** Hot Worklines */
            hot_worklines?: components["schemas"]["RuntimeWorklineSummary"][];
            /** Recent Failed Traces */
            recent_failed_traces?: components["schemas"]["RuntimeTraceListItem"][];
            /** Stats */
            stats: components["schemas"]["RuntimeStatCard"][];
        };
        /** RuntimeStatCard */
        RuntimeStatCard: {
            /** Key */
            key: string;
            /** Label */
            label: string;
            /**
             * Status
             * @default info
             */
            status: string;
            /** Value */
            value: number;
        };
        /** RuntimeTraceDeviceAction */
        RuntimeTraceDeviceAction: {
            /** Kind */
            kind: string;
            /** Label */
            label: string;
            /** Message */
            message?: string | null;
            /** Status */
            status?: string | null;
            /** Timestamp */
            timestamp?: string | null;
        };
        /** RuntimeTraceDevicePathNode */
        RuntimeTraceDevicePathNode: {
            /** Actions */
            actions?: components["schemas"]["RuntimeTraceDeviceAction"][];
            /** Device Code */
            device_code?: string | null;
            /** Device Id */
            device_id: number;
            /** Device Name */
            device_name?: string | null;
            /** Device Role */
            device_role?: string | null;
            /**
             * Is Current
             * @default false
             */
            is_current: boolean;
        };
        /**
         * RuntimeTraceListItem
         * @description Trace 列表项。
         */
        RuntimeTraceListItem: {
            /** Barcode */
            barcode?: string | null;
            /** Business Key */
            business_key?: string | null;
            /** Command Code */
            command_code?: string | null;
            /** Current Action */
            current_action?: string | null;
            /** Current Action Source */
            current_action_source?: string | null;
            /** Current Device Code */
            current_device_code?: string | null;
            /** Current Device Id */
            current_device_id?: number | null;
            /** Current Device Name */
            current_device_name?: string | null;
            /** Current Wait Type */
            current_wait_type?: string | null;
            /** Deadline At */
            deadline_at?: string | null;
            /** Device Code */
            device_code?: string | null;
            /** Device Id */
            device_id?: number | null;
            /** Device Name */
            device_name?: string | null;
            /** Failure Code */
            failure_code?: string | null;
            /** Failure Domain */
            failure_domain?: string | null;
            /**
             * Is Timed Out
             * @default false
             */
            is_timed_out: boolean;
            /** Last Device Code */
            last_device_code?: string | null;
            /** Last Device Id */
            last_device_id?: number | null;
            /** Last Device Name */
            last_device_name?: string | null;
            /** Last Ingress At */
            last_ingress_at?: string | null;
            /** Latest Timeline Action */
            latest_timeline_action?: string | null;
            /** Latest Timeline Message */
            latest_timeline_message?: string | null;
            /** Latest Timeline Status */
            latest_timeline_status?: string | null;
            /** Request Id */
            request_id?: string | null;
            /** Session Code */
            session_code: string;
            /** Session Id */
            session_id: number;
            /** Started At */
            started_at?: string | null;
            /** Status */
            status: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Workline Code */
            workline_code?: string | null;
            /** Workline Id */
            workline_id: number;
            /** Workline Name */
            workline_name?: string | null;
        };
        /**
         * RuntimeTraceListResponse
         * @description Trace 列表响应。
         */
        RuntimeTraceListResponse: {
            /** Items */
            items: components["schemas"]["RuntimeTraceListItem"][];
            /** Total */
            total: number;
        };
        /** RuntimeTracePathResponse */
        RuntimeTracePathResponse: {
            blocking_reason?: components["schemas"]["RuntimeBlockingReason"] | null;
            /** Current Blocking Device Id */
            current_blocking_device_id?: number | null;
            /** Devices */
            devices?: components["schemas"]["RuntimeTraceDevicePathNode"][];
            evidence?: components["schemas"]["TraceDetailResponse"] | null;
            /** Session Id */
            session_id?: number | null;
            /** Timeline Groups */
            timeline_groups?: components["schemas"]["RuntimeTraceTimelineGroup"][];
            /** Trace Id */
            trace_id?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** RuntimeTraceTimelineGroup */
        RuntimeTraceTimelineGroup: {
            /** Device Code */
            device_code?: string | null;
            /** Device Id */
            device_id?: number | null;
            /** Display Name */
            display_name: string;
            /** Events */
            events?: components["schemas"]["TraceTimelineItem"][];
            /** Group Key */
            group_key: string;
            /** Group Type */
            group_type: string;
            /**
             * Is Blocked
             * @default false
             */
            is_blocked: boolean;
            /**
             * Is Current
             * @default false
             */
            is_current: boolean;
        };
        /** RuntimeWorklineDetailResponse */
        RuntimeWorklineDetailResponse: {
            /** Active Sessions */
            active_sessions?: components["schemas"]["RuntimeTraceListItem"][];
            /** Devices */
            devices?: components["schemas"]["RuntimeWorklineDeviceItem"][];
            /** Recent Completed Traces */
            recent_completed_traces?: components["schemas"]["RuntimeTraceListItem"][];
            /** Recent Failed Traces */
            recent_failed_traces?: components["schemas"]["RuntimeTraceListItem"][];
            summary: components["schemas"]["RuntimeWorklineSummary"];
        };
        /** RuntimeWorklineDeviceItem */
        RuntimeWorklineDeviceItem: {
            /** Active Runtime Hold Ids */
            active_runtime_hold_ids?: number[];
            /**
             * Blocked Outbox Count
             * @default 0
             */
            blocked_outbox_count: number;
            /** Current Command Id */
            current_command_id?: number | null;
            /** Device Code */
            device_code: string;
            /** Device Name */
            device_name: string;
            /** Device Role */
            device_role: string;
            /** Device Status */
            device_status: string;
            /** Error Code */
            error_code?: string | null;
            /** Id */
            id: number;
            /** Last Heartbeat At */
            last_heartbeat_at?: string | null;
            /**
             * Maintenance Mode
             * @default false
             */
            maintenance_mode: boolean;
            /**
             * Open Command Count
             * @default 0
             */
            open_command_count: number;
            /**
             * Open Issue Count
             * @default 0
             */
            open_issue_count: number;
            /**
             * Pending Command Count
             * @default 0
             */
            pending_command_count: number;
            /** Role Index */
            role_index: number;
            /** Upstream Device Id */
            upstream_device_id?: number | null;
        };
        /** RuntimeWorklineSummary */
        RuntimeWorklineSummary: {
            /** Active Safety Incident Id */
            active_safety_incident_id?: number | null;
            /**
             * Active Session Count
             * @default 0
             */
            active_session_count: number;
            /** Contract Version */
            contract_version?: string | null;
            /**
             * Device Count
             * @default 0
             */
            device_count: number;
            /**
             * Error Device Count
             * @default 0
             */
            error_device_count: number;
            /**
             * Failed Session Count
             * @default 0
             */
            failed_session_count: number;
            /** Id */
            id: number;
            /** Is Active */
            is_active: boolean;
            /** Last Activity At */
            last_activity_at?: string | null;
            /** Line Code */
            line_code: string;
            /** Line Name */
            line_name: string;
            /** Line Type */
            line_type: string;
            /**
             * Maintenance Device Count
             * @default 0
             */
            maintenance_device_count: number;
            /**
             * Offline Device Count
             * @default 0
             */
            offline_device_count: number;
            /** Plugin Key */
            plugin_key?: string | null;
            /** Resumed At */
            resumed_at?: string | null;
            /**
             * Run Mode
             * @default AUTO
             */
            run_mode: string;
            /**
             * Runtime Status
             * @default READY
             */
            runtime_status: string;
            /** Stopped At */
            stopped_at?: string | null;
            /** Stopped Reason */
            stopped_reason?: string | null;
            /**
             * Waiting Session Count
             * @default 0
             */
            waiting_session_count: number;
            /** Zone Name */
            zone_name?: string | null;
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
         * SandboxEventRequest
         * @description 沙箱 Event 发送请求。
         */
        SandboxEventRequest: {
            /**
             * Device Id
             * @description 目标设备 ID
             */
            device_id: number;
            /**
             * Event Type
             * @description 事件类型
             */
            event_type: string;
            /**
             * Payload
             * @description 事件 Payload
             */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Session Id
             * @description Session ID（可选）
             */
            session_id?: number | null;
            /**
             * Timestamp
             * @description 事件时间戳（默认当前时间）
             */
            timestamp?: string | null;
            /**
             * Trace Id
             * @description Trace ID（可选，自动生成）
             */
            trace_id?: string | null;
            /**
             * Workline Id
             * @description 工作线 ID
             */
            workline_id: number;
        };
        /**
         * SandboxEventTemplate
         * @description 沙箱 Event 模板。
         */
        SandboxEventTemplate: {
            /**
             * Event Type
             * @description 事件类型标识
             */
            event_type: string;
            /**
             * Label
             * @description 事件类型显示名称
             */
            label: string;
            /**
             * Payload Template
             * @description Payload 模板
             */
            payload_template?: {
                [key: string]: unknown;
            };
        };
        /**
         * SandboxResultRequest
         * @description 沙箱 Command Result 模拟请求。
         */
        SandboxResultRequest: {
            /**
             * Command Code
             * @description Command Code
             */
            command_code: string;
            /**
             * Device Code
             * @description 设备 Code
             */
            device_code: string;
            /**
             * Error Detail
             * @description 错误详情（FAILED 时）
             */
            error_detail?: string | null;
            /**
             * Payload
             * @description Result Payload
             */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Result
             * @description 结果状态
             */
            result: string;
            /**
             * Timestamp
             * @description 结果时间戳（默认当前时间）
             */
            timestamp?: string | null;
        };
        /**
         * SandboxResultTemplate
         * @description 沙箱 Result 模板。
         */
        SandboxResultTemplate: {
            /**
             * Command Type
             * @description Command 类型标识
             */
            command_type: string;
            /**
             * Error Template
             * @description 错误信息模板
             */
            error_template?: string | null;
            /**
             * Failed Payload Template
             * @description 失败 Payload 模板
             */
            failed_payload_template?: {
                [key: string]: unknown;
            };
            /**
             * Label
             * @description Command 类型显示名称
             */
            label: string;
            /**
             * Success Payload Template
             * @description 成功 Payload 模板
             */
            success_payload_template?: {
                [key: string]: unknown;
            };
        };
        /**
         * SandboxTemplatesResponse
         * @description 沙箱模板响应。
         */
        SandboxTemplatesResponse: {
            /**
             * Event Templates
             * @description Event 模板列表
             */
            event_templates?: components["schemas"]["SandboxEventTemplate"][];
            /**
             * Result Templates
             * @description Result 模板列表
             */
            result_templates?: components["schemas"]["SandboxResultTemplate"][];
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
        /**
         * SortItem
         * @description 批量排序项
         */
        SortItem: {
            /**
             * Id
             * @description 节点ID
             */
            id: number;
            /**
             * Parent Id
             * @description 父节点ID
             */
            parent_id?: number | null;
            /**
             * Sort Order
             * @description 排序值
             * @default 0
             */
            sort_order: number;
        };
        /** TraceBlockingPointResponse */
        TraceBlockingPointResponse: {
            /** Blocking Point */
            blocking_point: string;
            diagnostic_card: components["schemas"]["DiagnosticCardResponse"];
            /** Evidence */
            evidence?: {
                [key: string]: unknown;
            };
            /** Next Steps */
            next_steps?: string[];
            /** Operator Action */
            operator_action: string;
            /** Owner */
            owner: string;
            /** Recoverability */
            recoverability: string;
            /** Request Id */
            request_id?: string | null;
            /** Trace Id */
            trace_id: string;
        };
        /** TraceCallbackLogItem */
        TraceCallbackLogItem: {
            /** Callback Type */
            callback_type: string;
            /** Causation Id */
            causation_id?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Error Message */
            error_message?: string | null;
            /** Event Id */
            event_id?: string | null;
            /** Failure Stage */
            failure_stage?: string | null;
            /** Id */
            id: number;
            /** Ingress Outcome */
            ingress_outcome?: string | null;
            /** Request Body */
            request_body: {
                [key: string]: unknown;
            };
            /** Request Id */
            request_id?: string | null;
            /** Response Status */
            response_status: number;
            /** Response Time Ms */
            response_time_ms: number;
            /** Subject Code */
            subject_code: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Updated At */
            updated_at?: string | null;
        };
        /** TraceCommandItem */
        TraceCommandItem: {
            /** Ack Code */
            ack_code?: number | null;
            /** Ack Message */
            ack_message?: string | null;
            /** Ack Received At */
            ack_received_at?: string | null;
            /** Ack Trace Id */
            ack_trace_id?: string | null;
            /** Command Code */
            command_code: string;
            /** Completed At */
            completed_at?: string | null;
            /** Device Id */
            device_id: number;
            /** Duration Ms */
            duration_ms?: number | null;
            /** Error Detail */
            error_detail?: {
                [key: string]: unknown;
            } | null;
            /** Id */
            id: number;
            /** Params */
            params: {
                [key: string]: unknown;
            };
            /** Result */
            result?: string | null;
            /** Result Data */
            result_data?: {
                [key: string]: unknown;
            } | null;
            /**
             * Retry Count
             * @default 0
             */
            retry_count: number;
            /** Sent At */
            sent_at?: string | null;
            /** Session Id */
            session_id?: string | null;
            /** Status */
            status: string;
            /** Task Type */
            task_type: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceContextResponse */
        TraceContextResponse: {
            /** Canonical Event Type */
            canonical_event_type?: string | null;
            /** Causation Id */
            causation_id?: string | null;
            /** Command Code */
            command_code?: string | null;
            /** Command Id */
            command_id?: number | null;
            /** Contract Version */
            contract_version?: string | null;
            /** Device Code */
            device_code?: string | null;
            /** Device Id */
            device_id?: number | null;
            /** Dispatch Key */
            dispatch_key?: string | null;
            /** Event Id */
            event_id?: string | null;
            /** Inbox Id */
            inbox_id?: number | null;
            /** Outbox Id */
            outbox_id?: number | null;
            /** Plugin Key */
            plugin_key?: string | null;
            /** Request Id */
            request_id?: string | null;
            /** Session Id */
            session_id?: number | null;
            /** Trace Id */
            trace_id?: string | null;
            /** Transition */
            transition?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceDetailResponse */
        TraceDetailResponse: {
            /** Callback Logs */
            callback_logs?: components["schemas"]["TraceCallbackLogItem"][];
            /** Commands */
            commands?: components["schemas"]["TraceCommandItem"][];
            /** Diagnostics */
            diagnostics?: components["schemas"]["TraceDiagnosticItem"][];
            /** Dispatch Attempts */
            dispatch_attempts?: components["schemas"]["TraceDispatchAttemptItem"][];
            /** Inboxes */
            inboxes?: components["schemas"]["TraceInboxItem"][];
            /** Outboxes */
            outboxes?: components["schemas"]["TraceOutboxItem"][];
            session?: components["schemas"]["TraceSessionItem"] | null;
            /** Sessions */
            sessions?: components["schemas"]["TraceSessionItem"][];
            summary: components["schemas"]["TraceOverviewSummary"];
            /** Timelines */
            timelines?: components["schemas"]["TraceTimelineItem"][];
            trace: components["schemas"]["TraceContextResponse"];
        };
        /** TraceDiagnosticContextItem */
        TraceDiagnosticContextItem: {
            /** Canonical Event Type */
            canonical_event_type?: string | null;
            /** Command Code */
            command_code?: string | null;
            /** Device Code */
            device_code?: string | null;
            /** Extra */
            extra?: {
                [key: string]: unknown;
            };
            /** Inbox Id */
            inbox_id?: number | null;
            /** Outbox Id */
            outbox_id?: number | null;
            /** Plugin Key */
            plugin_key?: string | null;
            /** Request Id */
            request_id?: string | null;
            /** Session Id */
            session_id?: number | null;
            /** Trace Id */
            trace_id?: string | null;
            /** Transition */
            transition?: string | null;
            /** Workline Code */
            workline_code?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceDiagnosticItem */
        TraceDiagnosticItem: {
            /** Canonical Event Type */
            canonical_event_type?: string | null;
            /** Command Code */
            command_code?: string | null;
            /** Device Code */
            device_code?: string | null;
            /** Extra */
            extra?: {
                [key: string]: unknown;
            };
            /** Inbox Id */
            inbox_id?: number | null;
            /** Outbox Id */
            outbox_id?: number | null;
            /** Plugin Key */
            plugin_key?: string | null;
            /** Request Id */
            request_id?: string | null;
            /** Session Id */
            session_id?: number | null;
            /** Trace Id */
            trace_id?: string | null;
            /** Transition */
            transition?: string | null;
            /** Workline Code */
            workline_code?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceDispatchAttemptItem */
        TraceDispatchAttemptItem: {
            /** Attempt No */
            attempt_no: number;
            /** Dispatch Key */
            dispatch_key: string;
            /** Error Message */
            error_message?: string | null;
            /** Finalized At */
            finalized_at?: string | null;
            /** Id */
            id: number;
            /** Lease Token */
            lease_token: string;
            /** Outbox Id */
            outbox_id: number;
            /** Response Json */
            response_json?: {
                [key: string]: unknown;
            };
            /**
             * Started At
             * Format: date-time
             */
            started_at: string;
            /** Status */
            status: string;
            /** Target Code */
            target_code?: string | null;
            /** Target Type */
            target_type?: string | null;
            /** Trace Json */
            trace_json?: {
                [key: string]: unknown;
            };
        };
        /** TraceInboxItem */
        TraceInboxItem: {
            /**
             * Attempt Count
             * @default 0
             */
            attempt_count: number;
            /** Causation Id */
            causation_id?: string | null;
            /** Command Id */
            command_id?: number | null;
            /** Device Id */
            device_id?: number | null;
            /** Error Message */
            error_message?: string | null;
            /** Event Id */
            event_id?: string | null;
            /** Id */
            id: number;
            /** Kind */
            kind: string;
            /**
             * Max Attempts
             * @default 0
             */
            max_attempts: number;
            /** Next Retry At */
            next_retry_at?: string | null;
            /** Payload Json */
            payload_json: {
                [key: string]: unknown;
            };
            /** Processed At */
            processed_at?: string | null;
            /**
             * Received At
             * Format: date-time
             */
            received_at: string;
            /** Session Id */
            session_id?: number | null;
            /** Source Message Id */
            source_message_id?: string | null;
            /** Source System */
            source_system: string;
            /** Status */
            status: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceOutboxItem */
        TraceOutboxItem: {
            /**
             * Attempt Count
             * @default 0
             */
            attempt_count: number;
            /** Blocked By Reconciliation Session Id */
            blocked_by_reconciliation_session_id?: number | null;
            /** Blocked By Runtime Hold Id */
            blocked_by_runtime_hold_id?: number | null;
            /** Blocked Device Id */
            blocked_device_id?: number | null;
            /** Blocked Reason */
            blocked_reason?: string | null;
            /** Blocked Workline Id */
            blocked_workline_id?: number | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Dispatch Key */
            dispatch_key: string;
            /** Dispatch Type */
            dispatch_type: string;
            /** Finished At */
            finished_at?: string | null;
            /** Id */
            id: number;
            /** Last Error */
            last_error?: string | null;
            /** Next Retry At */
            next_retry_at?: string | null;
            /** Payload Json */
            payload_json: {
                [key: string]: unknown;
            };
            /** Sent At */
            sent_at?: string | null;
            /** Session Id */
            session_id?: number | null;
            /** Status */
            status: string;
            /** Target Code */
            target_code: string;
            /** Target Type */
            target_type: string;
            /** Workline Id */
            workline_id: number;
        };
        /**
         * TraceOverviewSummary
         * @description Trace 详情页顶部摘要。
         */
        TraceOverviewSummary: {
            /**
             * Callback Logs
             * @default 0
             */
            callback_logs: number;
            /**
             * Commands
             * @default 0
             */
            commands: number;
            /** Current Wait Type */
            current_wait_type?: string | null;
            /**
             * Diagnostics
             * @default 0
             */
            diagnostics: number;
            /**
             * Inboxes
             * @default 0
             */
            inboxes: number;
            /** Latest Timeline Action */
            latest_timeline_action?: string | null;
            /** Latest Timeline Message */
            latest_timeline_message?: string | null;
            /** Latest Timeline Status */
            latest_timeline_status?: string | null;
            /**
             * Outboxes
             * @default 0
             */
            outboxes: number;
            /** Session Status */
            session_status?: string | null;
            /**
             * Timelines
             * @default 0
             */
            timelines: number;
        };
        /**
         * TraceQueryRequest
         * @description Trace 列表查询请求。
         */
        TraceQueryRequest: {
            /** Device Id */
            device_id?: number | null;
            /** Keyword */
            keyword?: string | null;
            /**
             * Limit
             * @default 20
             */
            limit: number;
            /**
             * Offset
             * @default 0
             */
            offset: number;
            /**
             * Only Active
             * @default false
             */
            only_active: boolean;
            /**
             * Only Failed
             * @default false
             */
            only_failed: boolean;
            /** Status */
            status?: string | null;
            /** Workline Id */
            workline_id?: number | null;
        };
        /** TraceSessionItem */
        TraceSessionItem: {
            /** Awaiting Command Id */
            awaiting_command_id?: number | null;
            /** Barcode */
            barcode?: string | null;
            /** Business Key */
            business_key?: string | null;
            /** Context Json */
            context_json: {
                [key: string]: unknown;
            };
            /** Current Wait Timeout Seconds */
            current_wait_timeout_seconds?: number | null;
            /** Current Wait Type */
            current_wait_type?: string | null;
            /** Deadline At */
            deadline_at?: string | null;
            /** Ended At */
            ended_at?: string | null;
            /** Failure Code */
            failure_code?: string | null;
            /** Failure Domain */
            failure_domain?: string | null;
            /** Failure Message */
            failure_message?: string | null;
            /** Id */
            id: number;
            /**
             * Ingress Count
             * @default 0
             */
            ingress_count: number;
            /** Last Inbox Id */
            last_inbox_id?: number | null;
            /** Last Ingress At */
            last_ingress_at?: string | null;
            /** Last Request Id */
            last_request_id?: string | null;
            /** Plugin Key */
            plugin_key: string;
            /** Reconciliation Ack Received At */
            reconciliation_ack_received_at?: string | null;
            /** Reconciliation Command Id */
            reconciliation_command_id?: number | null;
            /** Reconciliation Deadline At */
            reconciliation_deadline_at?: string | null;
            /** Reconciliation Device Id */
            reconciliation_device_id?: number | null;
            /**
             * Reconciliation Late Evidence Received
             * @default false
             */
            reconciliation_late_evidence_received: boolean;
            /** Reconciliation Occurred At */
            reconciliation_occurred_at?: string | null;
            /** Reconciliation Reason */
            reconciliation_reason?: string | null;
            /** Reconciliation Resolution */
            reconciliation_resolution?: string | null;
            /** Reconciliation Resolved At */
            reconciliation_resolved_at?: string | null;
            /** Reconciliation Source Inbox Id */
            reconciliation_source_inbox_id?: number | null;
            /** Reconciliation Source Kind */
            reconciliation_source_kind?: string | null;
            /** Reconciliation Source Outbox Id */
            reconciliation_source_outbox_id?: number | null;
            /** Reconciliation State */
            reconciliation_state?: string | null;
            /** Reconciliation Wait Token */
            reconciliation_wait_token?: string | null;
            /** Required Operator Action */
            required_operator_action?: string | null;
            /** Run Mode */
            run_mode: string;
            /** Session Code */
            session_code: string;
            /** Started At */
            started_at?: string | null;
            /** Status */
            status: string;
            /** Trace Id */
            trace_id?: string | null;
            /** Waiting Since */
            waiting_since?: string | null;
            /** Workline Id */
            workline_id: number;
        };
        /** TraceTimelineItem */
        TraceTimelineItem: {
            /** Action Type */
            action_type: string;
            /** Actor Code */
            actor_code?: string | null;
            /** Actor Type */
            actor_type: string;
            /** Failure Domain */
            failure_domain?: string | null;
            /** From Status */
            from_status?: string | null;
            /** Id */
            id: number;
            /** Message */
            message?: string | null;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /** Payload Json */
            payload_json?: {
                [key: string]: unknown;
            } | null;
            /** Related Command Id */
            related_command_id?: number | null;
            /** Related Inbox Id */
            related_inbox_id?: number | null;
            /** Seq No */
            seq_no: number;
            /** Session Id */
            session_id: number;
            /** Stage */
            stage: string;
            /** Status */
            status: string;
            /** To Status */
            to_status?: string | null;
            /** Trace Id */
            trace_id?: string | null;
            /** Workline Id */
            workline_id: number;
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
         * WorkLineCreate
         * @description 作业线创建 Schema - 接收客户端输入
         */
        WorkLineCreate: {
            /**
             * Config
             * @description 工作线插件配置
             */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Contract Version
             * @description 工作线默认插件契约版本
             */
            contract_version?: string | null;
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
             * Is Active
             * @description 是否启用
             * @default true
             */
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
             * Plugin Key
             * @description 工作线执行插件标识
             */
            plugin_key?: string | null;
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
         * WorkLinePluginOption
         * @description 作业线插件下拉选项。
         */
        WorkLinePluginOption: {
            /**
             * Contract Versions
             * @description 可选契约版本
             */
            contract_versions?: string[];
            /**
             * Default Contract Version
             * @description 默认契约版本
             */
            default_contract_version: string;
            /**
             * Label
             * @description 插件显示文本
             */
            label: string;
            /**
             * Plugin Key
             * @description 工作线执行插件标识
             */
            plugin_key: string;
        };
        /**
         * WorkLineResponse
         * @description 作业线响应 Schema - 返回给客户端
         */
        WorkLineResponse: {
            /**
             * Config
             * @description 工作线插件配置
             */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Contract Version
             * @description 工作线默认插件契约版本
             */
            contract_version?: string | null;
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
            /**
             * Is Active
             * @description 是否启用
             * @default true
             */
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
             * Plugin Key
             * @description 工作线执行插件标识
             */
            plugin_key?: string | null;
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
         * WorkLineUpdate
         * @description 作业线更新 Schema - 所有字段可选
         */
        WorkLineUpdate: {
            /**
             * Config
             * @description 工作线插件配置
             */
            config?: {
                [key: string]: unknown;
            } | null;
            /**
             * Contract Version
             * @description 工作线默认插件契约版本
             */
            contract_version?: string | null;
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
             * Is Active
             * @description 是否启用
             */
            is_active?: boolean | null;
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
            /**
             * Plugin Key
             * @description 工作线执行插件标识
             */
            plugin_key?: string | null;
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
    menus_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MenuCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_MenuResponse_"];
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
    menus_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_MenuResponse_"];
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
    menus_update: {
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
                "application/json": components["schemas"]["MenuUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_MenuResponse_"];
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
    menus_delete: {
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
    menus_permanent_delete: {
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
    menus_restore: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_MenuResponse_"];
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
    admin_menus_ancestors_by_node_id_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_MenuResponse__"];
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
    admin_menus_batch_sort_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BatchSortRequest"];
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
    admin_menus_children_by_node_id_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_MenuResponse__"];
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
    admin_menus_move_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_admin_menus_move_put"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_MenuResponse_"];
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
    admin_menus_my_menu_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_MenuTreeResponseSimple__"];
                };
            };
        };
    };
    menus_query: {
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
                    "application/json": components["schemas"]["ListResponseSchemaModel_MenuResponse_"];
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
    admin_menus_siblings_by_node_id_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_MenuResponse__"];
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
    menus_trash: {
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
                    "application/json": components["schemas"]["ListResponseSchemaModel_MenuResponse_"];
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
    menus_batch_permanent_delete: {
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
    menus_batch_restore: {
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
    admin_menus_tree_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_MenuTreeResponse__"];
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
    permissions_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PermissionCreate"];
            };
        };
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
    permissions_update: {
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
                "application/json": components["schemas"]["PermissionUpdate"];
            };
        };
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
    permissions_delete: {
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
    permissions_permanent_delete: {
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
    permissions_restore: {
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
    admin_permissions_batch_sort_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BatchSortRequest"];
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
    admin_permissions_move_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_admin_permissions_move_put"];
            };
        };
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
    permissions_trash: {
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
    permissions_batch_permanent_delete: {
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
    permissions_batch_restore: {
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
    api_auth_applications_available_permissions_sync_post: {
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
                    "application/json": components["schemas"]["CallbackEventIngressResponse"];
                };
            };
        };
    };
    callback_external_post: {
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
                    "application/json": components["schemas"]["CallbackExternalIngressResponse"];
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
                    "application/json": components["schemas"]["CallbackResultIngressResponse"];
                };
            };
        };
    };
    demo_products_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DemoProductCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_update: {
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
                "application/json": components["schemas"]["DemoProductUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_delete: {
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
    demo_products_permanent_delete: {
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
    demo_products_restore: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_query: {
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
                    "application/json": components["schemas"]["ListResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_trash: {
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
                    "application/json": components["schemas"]["ListResponseSchemaModel_DemoProductResponse_"];
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
    demo_products_batch_permanent_delete: {
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
    demo_products_batch_restore: {
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
    device_devices_by_id_runtime_clear_fault_post: {
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
                "application/json": components["schemas"]["DeviceRuntimeActionRequest"];
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
    device_devices_by_id_runtime_enter_maintenance_post: {
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
                "application/json": components["schemas"]["DeviceMaintenanceRequest"];
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
    device_devices_by_id_runtime_exit_maintenance_post: {
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
                "application/json": components["schemas"]["DeviceRuntimeActionRequest"];
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
    workline_ng_return_items_get: {
        parameters: {
            query?: {
                limit?: number;
                material_identity_key?: string | null;
                runtime_hold_id?: number | null;
                status?: string | null;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_NgReturnItemResponse__"];
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
    workline_operations_manual_sessions_by_session_id_post: {
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
                "application/json": components["schemas"]["ManualOperationRequest"];
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
    workline_operations_results_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SandboxResultRequest"];
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
                device_id?: number | null;
                limit?: number;
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
    workline_operations_sandbox_events_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SandboxEventRequest"];
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
                device_id?: number | null;
                limit?: number;
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
    workline_operations_sandbox_templates_get: {
        parameters: {
            query: {
                device_id?: number | null;
                workline_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_SandboxTemplatesResponse_"];
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
    workline_plugins_options_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_WorkLinePluginOption__"];
                };
            };
        };
    };
    workline_runtime_holds_by_hold_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                hold_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeHoldDetailResponse_"];
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
    workline_runtime_holds_by_hold_id_resolve_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                hold_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveRuntimeHoldRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_ResolveRuntimeHoldResponse_"];
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
    workline_runtime_holds_ng_reasons_get: {
        parameters: {
            query?: {
                plugin_key?: string | null;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_NgReasonOption__"];
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
    workline_runtime_devices_get: {
        parameters: {
            query: {
                worklineId: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_RuntimeDeviceSummary__"];
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
    workline_runtime_devices_by_device_id_get: {
        parameters: {
            query: {
                worklineId: number;
            };
            header?: never;
            path: {
                device_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeDeviceDetailResponse_"];
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
    workline_runtime_overview_get: {
        parameters: {
            query?: {
                includeSim?: boolean;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeOverviewResponse_"];
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
    workline_runtime_sessions_by_session_id_path_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeTracePathResponse_"];
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
    workline_runtime_traces_by_trace_id_path_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeTracePathResponse_"];
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
    workline_runtime_worklines_get: {
        parameters: {
            query?: {
                excludeSimulation?: boolean;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_RuntimeWorklineSummary__"];
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
    workline_runtime_worklines_by_workline_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workline_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeWorklineDetailResponse_"];
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
    workline_trace_by_trace_id_blocking_point_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceBlockingPointResponse_"];
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
    workline_trace_command_by_command_code_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceDetailResponse_"];
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
    workline_trace_dispatch_by_dispatch_key_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                dispatch_key: string;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceDetailResponse_"];
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
    workline_trace_query_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TraceQueryRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseSchemaModel_RuntimeTraceListResponse_"];
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
    workline_trace_request_by_request_id_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceDetailResponse_"];
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
    workline_trace_session_by_session_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: number;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceDetailResponse_"];
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
    workline_trace_trace_by_trace_id_get: {
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
                    "application/json": components["schemas"]["ResponseSchemaModel_TraceDetailResponse_"];
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

