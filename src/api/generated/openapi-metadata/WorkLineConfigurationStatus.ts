/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineConfigurationStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineConfigurationStatusMetadata = {
  "title": "WorkLineConfigurationStatus",
  "description": "作业线配置状态响应。",
  "required": [
    "workline_id",
    "is_active",
    "can_activate"
  ],
  "fields": {
    "workline_id": {
      "title": "Workline Id",
      "description": "作业线 ID",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "is_active": {
      "title": "Is Active",
      "description": "是否已启用",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "can_activate": {
      "title": "Can Activate",
      "description": "是否满足启用条件",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "checks": {
      "title": "Checks",
      "description": "启用前检查项",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "WorkLineConfigurationCheck"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
