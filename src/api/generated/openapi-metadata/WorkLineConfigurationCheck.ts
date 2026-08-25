/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineConfigurationCheck
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineConfigurationCheckMetadata = {
  "title": "WorkLineConfigurationCheck",
  "description": "作业线启用前结构化检查项。",
  "required": [
    "code",
    "status",
    "severity"
  ],
  "fields": {
    "code": {
      "title": "Code",
      "description": "检查项编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "context": {
      "title": "Context",
      "description": "检查上下文",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "severity": {
      "title": "Severity",
      "description": "检查严重程度",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "INFO",
        "WARNING",
        "BLOCKER"
      ]
    },
    "status": {
      "title": "Status",
      "description": "检查结果",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PASS",
        "FAIL",
        "WARN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
