/**
 * 自动生成的 OpenAPI schema 字段元数据: ApiPermissionInfo
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ApiPermissionInfoMetadata = {
  "title": "ApiPermissionInfo",
  "description": "API 权限信息 Schema\n\n描述单个 API 权限的详细信息",
  "required": [
    "id",
    "name",
    "type"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "description": "权限 ID",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "name": {
      "title": "Name",
      "description": "权限标识，如 admin:user:create",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "description": {
      "title": "Description",
      "description": "权限描述",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "type": {
      "title": "Type",
      "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "category": {
      "title": "Category",
      "description": "权限分类：admin、system、business 等",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "resource": {
      "title": "Resource",
      "description": "资源类型：user、role、permission、warehouse 等",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "action": {
      "title": "Action",
      "description": "操作：create、read、update、delete、list 等",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "method": {
      "title": "Method",
      "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "path": {
      "title": "Path",
      "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
