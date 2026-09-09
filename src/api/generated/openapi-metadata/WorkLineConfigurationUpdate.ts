/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineConfigurationUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineConfigurationUpdateMetadata = {
  "title": "WorkLineConfigurationUpdate",
  "description": "仅替换插件选择与角色映射，不修改本线物理资源。",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "config": {
      "title": "Config",
      "description": "当前业务插件配置",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "plugin_key": {
      "title": "Plugin Key",
      "description": "业务插件标识",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "version": {
      "title": "Version",
      "description": "WorkLine 乐观锁版本号",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
