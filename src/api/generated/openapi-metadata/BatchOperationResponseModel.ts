/**
 * 自动生成的 OpenAPI schema 字段元数据: BatchOperationResponseModel
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BatchOperationResponseModelMetadata = {
  "title": "BatchOperationResponseModel",
  "description": "批量操作响应模型\n\n专门用于批量操作的响应模型。\n\nExample:\n    ```python\n    @router.post('/users/batch', response_model=BatchOperationResponseModel)\n    def batch_create_users(users: List[UserCreate]) -> BatchOperationResponseModel:\n        result = process_batch_create(users)\n        return BatchOperationResponseModel(\n            code=SuccessCode.CREATED,\n            data=result\n        )\n    ```",
  "required": [],
  "fields": {
    "code": {
      "title": "Code",
      "description": "响应码",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "1000"
    },
    "data": {
      "description": "响应数据",
      "required": false,
      "nullable": true,
      "ref": "BatchOperationResult"
    },
    "message": {
      "title": "Message",
      "description": "响应消息",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "操作成功"
    },
    "timestamp": {
      "title": "Timestamp",
      "description": "响应时间戳(ISO 8601格式)",
      "type": "string",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
