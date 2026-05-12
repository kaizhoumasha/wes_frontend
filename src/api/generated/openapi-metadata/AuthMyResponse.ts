/**
 * 自动生成的 OpenAPI schema 字段元数据: AuthMyResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const AuthMyResponseMetadata = {
  "title": "AuthMyResponse",
  "description": "当前登录用户上下文响应 Schema\n\n一次性返回前端初始化所需核心数据：\n- 当前用户信息\n- API 权限列表\n- 菜单树",
  "required": [
    "user",
    "permissions",
    "menus"
  ],
  "fields": {
    "user": {
      "description": "当前用户信息",
      "required": true,
      "nullable": false,
      "ref": "UserResponse"
    },
    "permissions": {
      "title": "Permissions",
      "description": "当前用户 API 权限列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "ApiPermissionInfo"
      }
    },
    "menus": {
      "title": "Menus",
      "description": "当前用户可访问菜单树",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "MenuTreeResponseSimple"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
