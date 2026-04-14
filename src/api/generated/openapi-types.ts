/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm type:generate
 */

/* tslint:disable */

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
        /** [admin:menu:get] 获取Menu */
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
        /** [admin:menu:batch_permanent_delete] 批量永久删除Menu */
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
        /** [admin:menu:batch_restore] 批量恢复Menu */
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
        /** [admin:permission:get] 获取Permission */
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
        /** [admin:permission:batch_permanent_delete] 批量永久删除Permission */
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
        /** [admin:permission:batch_restore] 批量恢复Permission */
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
        /** [admin:role:get] 获取Role */
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
        /** [admin:user:get] 获取User */
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
        /** [api-auth:apiaccesslog:get] 获取APIAccessLog */
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
        /** [api-auth:apiapplication:get] 获取APIApplication */
        get: operations["applications_get"];
        /** [api-auth:apiapplication:update] 更新APIApplication */
        put: operations["applications_update"];
        post?: never;
        /** [api-auth:apiapplication:delete] 删除APIApplication */
        delete: operations["applications_delete"];
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
        /** [api-auth:apiapplication:restore] 恢复APIApplication */
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
        /** [api-auth:apiapplication:list] 获取APIApplication列表 */
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
        /** [api-auth:apiapplication:trash] 获取已删除APIApplication */
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
        /** [api-auth:apiapplication:batch_permanent_delete] 批量永久删除APIApplication */
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
        /** [api-auth:apiapplication:batch_restore] 批量恢复APIApplication */
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
    "/api/v1/callback/logs/correlation/{correlation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 根据关联 ID 查询回调日志
         * @description 根据 correlation_id 查询所有相关的回调日志（用于串联整个流程）
         */
        get: operations["callback_logs_correlation_by_correlation_id_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/callback/logs/device/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 根据设备 ID 查询回调日志
         * @description 查询指定设备最近的回调记录
         */
        get: operations["callback_logs_device_by_device_id_get"];
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
        /**
         * 回调日志列表查询
         * @description 通用列表查询接口，支持分页、过滤和排序
         */
        post: operations["callback_logs_query_post"];
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
         * 根据请求 ID 查询回调日志
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
        /** [demo:demoproduct:get] 获取DemoProduct */
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
        /** [demo:demoproduct:batch_permanent_delete] 批量永久删除DemoProduct */
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
        /** [demo:demoproduct:batch_restore] 批量恢复DemoProduct */
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
        /** [biz:device:get] 获取Device */
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
    "/api/v1/sys/audit-logs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** [sys:auditlog:get] 获取AuditLog */
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
        /** [biz:workline:get] 获取WorkLine */
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
        /** Body_callback_logs_query_post */
        Body_callback_logs_query_post: {
            filters?: components["schemas"]["FilterGroup"] | null;
            /** Sort */
            sort?: components["schemas"]["SortField"][] | null;
        };
        /**
         * CallbackLogResponse
         * @description 回调日志响应 Schema
         */
        CallbackLogResponse: {
            /** Callback Type */
            callback_type: string;
            /** Client Ip */
            client_ip: string | null;
            /** Correlation Id */
            correlation_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Device Id */
            device_id: string;
            /** Error Message */
            error_message: string | null;
            /** Id */
            id: number;
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
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** User Agent */
            user_agent: string | null;
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
             * @description 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE）
             * @default IDLE
             */
            device_status: components["schemas"]["DeviceStatus"];
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
             * Max Concurrent Tasks
             * @description 最大并发任务数
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
             * @description 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE）
             * @default IDLE
             */
            device_status: components["schemas"]["DeviceStatus"];
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
             * Max Concurrent Tasks
             * @description 最大并发任务数
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
         * DeviceStatus
         * @description 设备状态枚举（白皮书 5.2 节）
         * @enum {string}
         */
        DeviceStatus: "IDLE" | "RUNNING" | "ERROR" | "OFFLINE";
        /**
         * DeviceUpdate
         * @description 设备更新 Schema - 所有字段可选
         */
        DeviceUpdate: {
            /**
             * Auth Token
             * @description 认证 Token（Bearer Token）
             */
            auth_token?: string | null;
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
            /** @description 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE） */
            device_status?: components["schemas"]["DeviceStatus"] | null;
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
             */
            idempotency_ttl?: number | null;
            /**
             * Is Active
             * @description 是否启用
             */
            is_active?: boolean | null;
            /**
             * Last Heartbeat At
             * @description 最后心跳时间
             */
            last_heartbeat_at?: string | null;
            /**
             * Max Concurrent Tasks
             * @description 最大并发任务数
             */
            max_concurrent_tasks?: number | null;
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
        ListResponseData_APIAccessLogResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["APIAccessLogResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[APIApplicationResponse] */
        ListResponseData_APIApplicationResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["APIApplicationResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[AuditLogResponse] */
        ListResponseData_AuditLogResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["AuditLogResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[DemoProductResponse] */
        ListResponseData_DemoProductResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["DemoProductResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[DeviceResponse] */
        ListResponseData_DeviceResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["DeviceResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[MenuResponse] */
        ListResponseData_MenuResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["MenuResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[PermissionResponse] */
        ListResponseData_PermissionResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["PermissionResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[RoleResponse] */
        ListResponseData_RoleResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["RoleResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[UserResponse] */
        ListResponseData_UserResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["UserResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseData[WorkLineResponse] */
        ListResponseData_WorkLineResponse_: {
            /**
             * Items
             * @description 列表数据
             */
            items?: components["schemas"]["WorkLineResponse"][];
            /**
             * Limit
             * @description 分页大小
             * @default 0
             */
            limit: number;
            /**
             * Offset
             * @description 偏移量
             * @default 0
             */
            offset: number;
            /**
             * Total
             * @description 总数量
             * @default 0
             */
            total: number;
        };
        /** ListResponseSchemaModel[APIAccessLogResponse] */
        ListResponseSchemaModel_APIAccessLogResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_APIAccessLogResponse_"] | null;
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
        /** ListResponseSchemaModel[APIApplicationResponse] */
        ListResponseSchemaModel_APIApplicationResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_APIApplicationResponse_"] | null;
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
        /** ListResponseSchemaModel[AuditLogResponse] */
        ListResponseSchemaModel_AuditLogResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_AuditLogResponse_"] | null;
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
        /** ListResponseSchemaModel[DemoProductResponse] */
        ListResponseSchemaModel_DemoProductResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_DemoProductResponse_"] | null;
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
        /** ListResponseSchemaModel[DeviceResponse] */
        ListResponseSchemaModel_DeviceResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_DeviceResponse_"] | null;
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
        /** ListResponseSchemaModel[MenuResponse] */
        ListResponseSchemaModel_MenuResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_MenuResponse_"] | null;
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
        /** ListResponseSchemaModel[PermissionResponse] */
        ListResponseSchemaModel_PermissionResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_PermissionResponse_"] | null;
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
        /** ListResponseSchemaModel[RoleResponse] */
        ListResponseSchemaModel_RoleResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_RoleResponse_"] | null;
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
        /** ListResponseSchemaModel[UserResponse] */
        ListResponseSchemaModel_UserResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_UserResponse_"] | null;
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
        /** ListResponseSchemaModel[WorkLineResponse] */
        ListResponseSchemaModel_WorkLineResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ListResponseData_WorkLineResponse_"] | null;
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
            children?: components["schemas"]["MenuResponse"][];
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
        /** ResponseSchemaModel[ActiveSessionsResponse] */
        ResponseSchemaModel_ActiveSessionsResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["ActiveSessionsResponse"] | null;
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
        /** ResponseSchemaModel[APIAccessLogResponse] */
        ResponseSchemaModel_APIAccessLogResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["APIAccessLogResponse"] | null;
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
        /** ResponseSchemaModel[APIApplicationResponse] */
        ResponseSchemaModel_APIApplicationResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["APIApplicationResponse"] | null;
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
        /** ResponseSchemaModel[AuditLogResponse] */
        ResponseSchemaModel_AuditLogResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["AuditLogResponse"] | null;
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
        /** ResponseSchemaModel[AuthMyResponse] */
        ResponseSchemaModel_AuthMyResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["AuthMyResponse"] | null;
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
        /** ResponseSchemaModel[DemoProductResponse] */
        ResponseSchemaModel_DemoProductResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["DemoProductResponse"] | null;
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
        /** ResponseSchemaModel[DeviceResponse] */
        ResponseSchemaModel_DeviceResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["DeviceResponse"] | null;
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
        /** ResponseSchemaModel[dict[str, Any]] */
        ResponseSchemaModel_dict_str__Any__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: {
                [key: string]: unknown;
            } | null;
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
        /** ResponseSchemaModel[dict[str, str]] */
        ResponseSchemaModel_dict_str__str__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: {
                [key: string]: string;
            } | null;
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
        /** ResponseSchemaModel[list[Any]] */
        ResponseSchemaModel_list_Any__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: unknown[] | null;
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
        /** ResponseSchemaModel[list[MenuResponse]] */
        ResponseSchemaModel_list_MenuResponse__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: components["schemas"]["MenuResponse"][] | null;
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
        /** ResponseSchemaModel[list[MenuTreeResponse]] */
        ResponseSchemaModel_list_MenuTreeResponse__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: components["schemas"]["MenuTreeResponse"][] | null;
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
        /** ResponseSchemaModel[list[MenuTreeResponseSimple]] */
        ResponseSchemaModel_list_MenuTreeResponseSimple__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: components["schemas"]["MenuTreeResponseSimple"][] | null;
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
        /** ResponseSchemaModel[list[PermissionResponse]] */
        ResponseSchemaModel_list_PermissionResponse__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: components["schemas"]["PermissionResponse"][] | null;
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
        /** ResponseSchemaModel[list[PermissionTree]] */
        ResponseSchemaModel_list_PermissionTree__: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: components["schemas"]["PermissionTree"][] | null;
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
        /** ResponseSchemaModel[LoginResponse] */
        ResponseSchemaModel_LoginResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["LoginResponse"] | null;
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
        /** ResponseSchemaModel[LogoutResponse] */
        ResponseSchemaModel_LogoutResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["LogoutResponse"] | null;
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
        /** ResponseSchemaModel[MenuResponse] */
        ResponseSchemaModel_MenuResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["MenuResponse"] | null;
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
        /** ResponseSchemaModel[NoneType] */
        ResponseSchemaModel_NoneType_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /**
             * Data
             * @description 响应数据
             */
            data?: null;
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
        /** ResponseSchemaModel[PermissionResponse] */
        ResponseSchemaModel_PermissionResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["PermissionResponse"] | null;
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
        /** ResponseSchemaModel[RefreshTokenResponse] */
        ResponseSchemaModel_RefreshTokenResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["RefreshTokenResponse"] | null;
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
        /** ResponseSchemaModel[RevokeSessionResponse] */
        ResponseSchemaModel_RevokeSessionResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["RevokeSessionResponse"] | null;
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
        /** ResponseSchemaModel[RoleResponse] */
        ResponseSchemaModel_RoleResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["RoleResponse"] | null;
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
        /** ResponseSchemaModel[UserPermissionsResponse] */
        ResponseSchemaModel_UserPermissionsResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["UserPermissionsResponse"] | null;
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
        /** ResponseSchemaModel[UserResponse] */
        ResponseSchemaModel_UserResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["UserResponse"] | null;
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
        /** ResponseSchemaModel[UserSimpleResponse] */
        ResponseSchemaModel_UserSimpleResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["UserSimpleResponse"] | null;
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
        /** ResponseSchemaModel[WorkLineResponse] */
        ResponseSchemaModel_WorkLineResponse_: {
            /**
             * Code
             * @description 响应码
             * @default 1000
             * @example 1000
             * @example 2000
             */
            code: string;
            /** @description 响应数据 */
            data?: components["schemas"]["WorkLineResponse"] | null;
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
             * Capacity
             * @description 产能（件/小时）
             */
            capacity?: number | null;
            /**
             * Config
             * @description 工作线插件配置
             */
            config: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @description 作业线描述
             */
            description?: string | null;
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
             * Sort Order
             * @description 排序顺序
             * @default 0
             */
            sort_order: number;
            /**
             * Zone Name
             * @description 区域名称
             */
            zone_name?: string | null;
        };
        /**
         * WorkLineResponse
         * @description 作业线响应 Schema - 返回给客户端
         */
        WorkLineResponse: {
            /**
             * Capacity
             * @description 产能（件/小时）
             */
            capacity?: number | null;
            /**
             * Config
             * @description 工作线插件配置
             */
            config?: {
                [key: string]: unknown;
            };
            /**
             * Description
             * @description 作业线描述
             */
            description?: string | null;
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
             * Sort Order
             * @description 排序顺序
             * @default 0
             */
            sort_order: number;
            /** Version */
            version: number;
            /**
             * Zone Name
             * @description 区域名称
             */
            zone_name?: string | null;
        };
        /**
         * WorkLineUpdate
         * @description 作业线更新 Schema - 所有字段可选
         */
        WorkLineUpdate: {
            /**
             * Capacity
             * @description 产能（件/小时）
             */
            capacity?: number | null;
            /**
             * Config
             * @description 工作线插件配置
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
            /**
             * Sort Order
             * @description 排序顺序
             */
            sort_order?: number | null;
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
            query?: {
                /** @description 是否永久删除 */
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
            query?: {
                /** @description 是否永久删除 */
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
            query?: {
                /** @description 是否永久删除 */
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
                /** @description 是否永久删除 */
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
                    "application/json": {
                        [key: string]: unknown;
                    };
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
                /** @description 是否永久删除 */
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
            query?: {
                /** @description 是否强制从代码重新扫描并同步到数据库 */
                sync?: boolean;
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
                    "application/json": components["schemas"]["ResponseSchemaModel_list_Any__"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
                    "application/json": unknown;
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
                    "application/json": unknown;
                };
            };
        };
    };
    callback_logs_correlation_by_correlation_id_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                correlation_id: string;
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
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_logs_device_by_device_id_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                device_id: string;
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
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    callback_logs_query_post: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Body_callback_logs_query_post"];
            };
        };
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
            /** @description Validation Error */
            422: {
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
                    "application/json": components["schemas"]["CallbackLogResponse"];
                };
            };
            /** @description Validation Error */
            422: {
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
                    "application/json": unknown;
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
            query?: {
                /** @description 是否永久删除 */
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
            query?: {
                /** @description 是否永久删除 */
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
                /** @description 是否永久删除 */
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

