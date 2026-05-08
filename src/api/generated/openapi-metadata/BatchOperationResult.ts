/**
 * 自动生成的 OpenAPI schema 字段元数据: BatchOperationResult
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BatchOperationResultMetadata = {
  "title": "BatchOperationResult",
  "description": "批量操作结果模型\n\n用于批量操作（如批量创建、批量更新、批量删除）的响应数据。\n\nAttributes:\n    success: 成功数量\n    failed: 失败数量\n    total: 总数量\n    results: 详细结果列表（可选）\n    errors: 错误信息列表（可选）\n\nExample:\n    ```python\n    result = BatchOperationResult(\n        success=8,\n        failed=2,\n        total=10,\n        errors=[\n            {\"index\": 3, \"message\": \"参数错误\"},\n            {\"index\": 7, \"message\": \"权限不足\"}\n        ]\n    )\n    ```",
  "required": [],
  "fields": {
    "success": {
      "title": "Success",
      "description": "成功数量",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "failed": {
      "title": "Failed",
      "description": "失败数量",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "total": {
      "title": "Total",
      "description": "总数量",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "results": {
      "title": "Results",
      "description": "详细结果列表",
      "type": "array",
      "required": false,
      "nullable": true,
      "items": {}
    },
    "errors": {
      "title": "Errors",
      "description": "错误信息列表",
      "type": "array",
      "required": false,
      "nullable": true,
      "items": {
        "type": "object"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
