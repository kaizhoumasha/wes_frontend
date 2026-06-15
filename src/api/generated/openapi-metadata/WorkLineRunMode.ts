/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineRunMode
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineRunModeMetadata = {
  "title": "WorkLineRunMode",
  "description": "作业线运行模式枚举。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "WorkLineRunMode",
      "description": "作业线运行模式枚举。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "AUTO",
        "MANUAL",
        "SIMULATION"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
