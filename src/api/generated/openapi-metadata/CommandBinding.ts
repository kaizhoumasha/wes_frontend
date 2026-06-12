/**
 * 自动生成的 OpenAPI schema 字段元数据: CommandBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CommandBindingMetadata = {
  "title": "CommandBinding",
  "description": "插件命令及目标设备/结果绑定。",
  "required": [
    "command",
    "target_device_role"
  ],
  "fields": {
    "command": {
      "title": "Command",
      "description": "命令类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "target_device_role": {
      "title": "Target Device Role",
      "description": "目标设备角色",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "position_args": {
      "title": "Position Args",
      "description": "位置参数声明",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PositionArg"
      }
    },
    "payload_schema_ref": {
      "title": "Payload Schema Ref",
      "description": "命令 payload schema 引用",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "result_bindings": {
      "title": "Result Bindings",
      "description": "命令结果绑定",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "CommandResultBinding"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
