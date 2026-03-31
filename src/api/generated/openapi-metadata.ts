/**
 * 自动生成的 OpenAPI 字段元数据
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm type:generate
 */

export type OpenApiEnumValue = string | number | boolean | null

export interface OpenApiArrayMetadata {
  type?: string
  format?: string
  ref?: string
  enum?: OpenApiEnumValue[]
}

export interface OpenApiFieldMetadata {
  title?: string
  description?: string
  type?: string
  format?: string
  required: boolean
  nullable: boolean
  default?: unknown
  enum?: OpenApiEnumValue[]
  ref?: string
  items?: OpenApiArrayMetadata
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
}

export interface OpenApiSchemaMetadata {
  title?: string
  description?: string
  required: string[]
  additionalProperties?: boolean
  fields: Record<string, OpenApiFieldMetadata>
}

export const OPENAPI_SCHEMA_METADATA = {
  "APIAccessLogResponse": {
    "title": "APIAccessLogResponse",
    "required": [
      "app_id",
      "app_name",
      "request_id",
      "method",
      "path",
      "status_code",
      "response_time_ms",
      "ip_address",
      "id"
    ],
    "fields": {
      "app_id": {
        "title": "App Id",
        "description": "应用ID",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "app_name": {
        "title": "App Name",
        "description": "应用名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "request_id": {
        "title": "Request Id",
        "description": "请求ID",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "method": {
        "title": "Method",
        "description": "HTTP方法",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 10
      },
      "path": {
        "title": "Path",
        "description": "请求路径",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 500
      },
      "status_code": {
        "title": "Status Code",
        "description": "响应状态码",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "response_time_ms": {
        "title": "Response Time Ms",
        "description": "响应时间(毫秒)",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "ip_address": {
        "title": "Ip Address",
        "description": "客户端IP",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "user_agent": {
        "title": "User Agent",
        "description": "User-Agent",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "error_message": {
        "title": "Error Message",
        "description": "错误信息",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 1000
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "APIApplicationCreate": {
    "title": "APIApplicationCreate",
    "required": [
      "app_name"
    ],
    "additionalProperties": false,
    "fields": {
      "app_name": {
        "title": "App Name",
        "description": "应用名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "app_type": {
        "description": "应用类型",
        "required": false,
        "nullable": false,
        "default": "ECS",
        "ref": "AppType"
      },
      "description": {
        "title": "Description",
        "description": "应用描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "ip_whitelist": {
        "title": "Ip Whitelist",
        "description": "IP白名单",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "type": "string"
        }
      },
      "rate_limit_per_minute": {
        "title": "Rate Limit Per Minute",
        "description": "每分钟请求限制",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 100,
        "minimum": 1,
        "maximum": 10000
      },
      "rate_limit_per_hour": {
        "title": "Rate Limit Per Hour",
        "description": "每小时请求限制",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 5000,
        "minimum": 1,
        "maximum": 1000000
      },
      "validity_period": {
        "description": "有效期时长",
        "required": false,
        "nullable": false,
        "default": "1y",
        "ref": "ValidityPeriod"
      }
    }
  },
  "APIApplicationResponse": {
    "title": "APIApplicationResponse",
    "required": [
      "app_name",
      "app_id",
      "remaining_days"
    ],
    "fields": {
      "version": {
        "title": "Version",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": false
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_by": {
        "title": "Deleted By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_at": {
        "title": "Deleted At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "is_deleted": {
        "title": "Is Deleted",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      },
      "created_by": {
        "title": "Created By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "updated_by": {
        "title": "Updated By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "app_name": {
        "title": "App Name",
        "description": "应用名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "app_type": {
        "description": "应用类型",
        "required": false,
        "nullable": false,
        "default": "ECS",
        "ref": "AppType"
      },
      "description": {
        "title": "Description",
        "description": "应用描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "ip_whitelist": {
        "title": "Ip Whitelist",
        "description": "IP白名单",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "type": "string"
        }
      },
      "rate_limit_per_minute": {
        "title": "Rate Limit Per Minute",
        "description": "每分钟请求限制",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 100,
        "minimum": 1,
        "maximum": 10000
      },
      "rate_limit_per_hour": {
        "title": "Rate Limit Per Hour",
        "description": "每小时请求限制",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 5000,
        "minimum": 1,
        "maximum": 1000000
      },
      "validity_period": {
        "description": "有效期时长",
        "required": false,
        "nullable": false,
        "default": "1y",
        "ref": "ValidityPeriod"
      },
      "app_id": {
        "title": "App Id",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "status": {
        "required": false,
        "nullable": false,
        "default": "active",
        "ref": "AppStatus"
      },
      "expires_at": {
        "title": "Expires At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "remaining_days": {
        "title": "Remaining Days",
        "description": "剩余天数",
        "type": "integer",
        "required": true,
        "nullable": true
      }
    }
  },
  "APIApplicationUpdate": {
    "title": "APIApplicationUpdate",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "app_name": {
        "title": "App Name",
        "description": "应用名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "app_type": {
        "description": "应用类型",
        "required": false,
        "nullable": true,
        "ref": "AppType"
      },
      "description": {
        "title": "Description",
        "description": "应用描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "ip_whitelist": {
        "title": "Ip Whitelist",
        "description": "IP白名单",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "type": "string"
        }
      },
      "rate_limit_per_minute": {
        "title": "Rate Limit Per Minute",
        "description": "每分钟请求限制",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 10000
      },
      "rate_limit_per_hour": {
        "title": "Rate Limit Per Hour",
        "description": "每小时请求限制",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 1000000
      },
      "validity_period": {
        "description": "有效期时长",
        "required": false,
        "nullable": true,
        "ref": "ValidityPeriod"
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "ActiveSessionsResponse": {
    "title": "ActiveSessionsResponse",
    "description": "活跃会话列表响应 Schema\n\n包含用户所有活跃会话",
    "required": [
      "total",
      "sessions"
    ],
    "fields": {
      "total": {
        "title": "Total",
        "description": "活跃会话总数",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "sessions": {
        "title": "Sessions",
        "description": "会话列表",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "ref": "SessionInfo"
        }
      }
    }
  },
  "ApiPermissionInfo": {
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
  },
  "AppStatus": {
    "title": "AppStatus",
    "required": [],
    "fields": {
      "__enum": {
        "title": "AppStatus",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "active",
          "revoked",
          "expired"
        ]
      }
    }
  },
  "AppType": {
    "title": "AppType",
    "required": [],
    "fields": {
      "__enum": {
        "title": "AppType",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "ECS",
          "RCS",
          "WMS",
          "Third-Party"
        ]
      }
    }
  },
  "AssignRolesRequest": {
    "title": "AssignRolesRequest",
    "description": "为用户分配角色请求",
    "required": [
      "role_ids"
    ],
    "fields": {
      "role_ids": {
        "title": "Role Ids",
        "description": "角色 ID 列表",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "type": "integer"
        }
      }
    }
  },
  "AuditLogResponse": {
    "title": "AuditLogResponse",
    "description": "AuditLog 响应 Schema",
    "required": [
      "trace_id",
      "method",
      "title",
      "path",
      "ip",
      "user_agent",
      "code",
      "cost_time",
      "id"
    ],
    "fields": {
      "trace_id": {
        "title": "Trace Id",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 64
      },
      "username": {
        "title": "Username",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 32
      },
      "method": {
        "title": "Method",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 10
      },
      "title": {
        "title": "Title",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "path": {
        "title": "Path",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 200
      },
      "ip": {
        "title": "Ip",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 64
      },
      "country": {
        "title": "Country",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "region": {
        "title": "Region",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "city": {
        "title": "City",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "user_agent": {
        "title": "User Agent",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 500
      },
      "os": {
        "title": "Os",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "browser": {
        "title": "Browser",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "device": {
        "title": "Device",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 64
      },
      "args": {
        "title": "Args",
        "type": "object",
        "required": false,
        "nullable": true
      },
      "status": {
        "description": "操作状态",
        "required": false,
        "nullable": false,
        "default": "SUCCESS",
        "ref": "OperaStatus"
      },
      "code": {
        "title": "Code",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 20
      },
      "msg": {
        "title": "Msg",
        "type": "string",
        "required": false,
        "nullable": true
      },
      "cost_time": {
        "title": "Cost Time",
        "type": "number",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "opera_time": {
        "title": "Opera Time",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": false
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "AuthMyResponse": {
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
  },
  "BatchOperationResponseModel": {
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "BatchOperationResult"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "BatchOperationResult": {
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
  },
  "Body_api_auth_applications_by_id_permissions_post": {
    "title": "Body_api_auth_applications_by_id_permissions_post",
    "required": [
      "permission_ids"
    ],
    "fields": {
      "permission_ids": {
        "title": "Permission Ids",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "type": "integer"
        }
      }
    }
  },
  "Body_callback_logs_query_post": {
    "title": "Body_callback_logs_query_post",
    "required": [],
    "fields": {
      "filters": {
        "required": false,
        "nullable": true,
        "ref": "FilterGroup"
      },
      "sort": {
        "title": "Sort",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "SortField"
        }
      }
    }
  },
  "Body_menus_move_put": {
    "title": "Body_menus_move_put",
    "required": [
      "node_id",
      "new_parent_id"
    ],
    "fields": {
      "node_id": {
        "title": "Node Id",
        "description": "要移动的节点ID",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "new_parent_id": {
        "title": "New Parent Id",
        "description": "新的父节点ID",
        "type": "integer",
        "required": true,
        "nullable": true
      }
    }
  },
  "Body_permissions_move_put": {
    "title": "Body_permissions_move_put",
    "required": [
      "node_id",
      "new_parent_id"
    ],
    "fields": {
      "node_id": {
        "title": "Node Id",
        "description": "要移动的节点ID",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "new_parent_id": {
        "title": "New Parent Id",
        "description": "新的父节点ID",
        "type": "integer",
        "required": true,
        "nullable": true
      }
    }
  },
  "CallbackLogResponse": {
    "title": "CallbackLogResponse",
    "description": "回调日志响应 Schema",
    "required": [
      "id",
      "callback_type",
      "device_id",
      "request_body",
      "client_ip",
      "user_agent",
      "request_id",
      "correlation_id",
      "response_status",
      "response_time_ms",
      "error_message",
      "created_at",
      "updated_at"
    ],
    "fields": {
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "callback_type": {
        "title": "Callback Type",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "device_id": {
        "title": "Device Id",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "request_body": {
        "title": "Request Body",
        "type": "object",
        "required": true,
        "nullable": false
      },
      "client_ip": {
        "title": "Client Ip",
        "type": "string",
        "required": true,
        "nullable": true
      },
      "user_agent": {
        "title": "User Agent",
        "type": "string",
        "required": true,
        "nullable": true
      },
      "request_id": {
        "title": "Request Id",
        "type": "string",
        "required": true,
        "nullable": true
      },
      "correlation_id": {
        "title": "Correlation Id",
        "type": "string",
        "required": true,
        "nullable": true
      },
      "response_status": {
        "title": "Response Status",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "response_time_ms": {
        "title": "Response Time Ms",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "error_message": {
        "title": "Error Message",
        "type": "string",
        "required": true,
        "nullable": true
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      }
    }
  },
  "DemoProductCreate": {
    "title": "DemoProductCreate",
    "description": "DemoProduct 创建模型",
    "required": [
      "name",
      "price",
      "stock"
    ],
    "additionalProperties": false,
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "price": {
        "title": "Price",
        "type": "number",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "stock": {
        "title": "Stock",
        "type": "integer",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "product_lists": {
        "title": "Product Lists",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "DemoProductListCreate"
        }
      }
    }
  },
  "DemoProductListCreate": {
    "title": "DemoProductListCreate",
    "description": "DemoProductList 创建模型\n\n注意：product_id 在创建时是可选的，因为会自动从主表 ID 设置",
    "required": [
      "quantity"
    ],
    "additionalProperties": false,
    "fields": {
      "product_id": {
        "title": "Product Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "quantity": {
        "title": "Quantity",
        "type": "integer",
        "required": true,
        "nullable": false,
        "minimum": 0
      }
    }
  },
  "DemoProductListResponse": {
    "title": "DemoProductListResponse",
    "description": "DemoProductList 响应模型",
    "required": [
      "product_id",
      "quantity",
      "id"
    ],
    "fields": {
      "product_id": {
        "title": "Product Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "quantity": {
        "title": "Quantity",
        "type": "integer",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "DemoProductListUpdate": {
    "title": "DemoProductListUpdate",
    "description": "DemoProductList 更新模型\n\n注意：在更新主表时，使用 Diff 算法处理从表：\n- 有 id：更新现有记录\n- 无 id：创建新记录\n- 缺失：删除记录\n\n因此 id 和 product_id 都是可选的",
    "required": [],
    "additionalProperties": false,
    "fields": {
      "product_id": {
        "title": "Product Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "quantity": {
        "title": "Quantity",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 0
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": false,
        "nullable": true
      }
    }
  },
  "DemoProductResponse": {
    "title": "DemoProductResponse",
    "description": "DemoProduct 响应模型\n\n包含 version 字段，前端在更新时必须传回该字段",
    "required": [
      "name",
      "price",
      "stock",
      "id",
      "product_lists"
    ],
    "fields": {
      "deleted_by": {
        "title": "Deleted By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_at": {
        "title": "Deleted At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "is_deleted": {
        "title": "Is Deleted",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": false
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "created_by": {
        "title": "Created By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "updated_by": {
        "title": "Updated By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "name": {
        "title": "Name",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "price": {
        "title": "Price",
        "type": "number",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "stock": {
        "title": "Stock",
        "type": "integer",
        "required": true,
        "nullable": false,
        "minimum": 0
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "product_lists": {
        "title": "Product Lists",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "ref": "DemoProductListResponse"
        }
      }
    }
  },
  "DemoProductUpdate": {
    "title": "DemoProductUpdate",
    "description": "DemoProduct 更新模型\n\n注意：更新时必须包含 version 字段（乐观锁）",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "price": {
        "title": "Price",
        "type": "number",
        "required": false,
        "nullable": true,
        "minimum": 0
      },
      "stock": {
        "title": "Stock",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 0
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "product_lists": {
        "title": "Product Lists",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "DemoProductListUpdate"
        }
      }
    }
  },
  "DeviceCreate": {
    "title": "DeviceCreate",
    "description": "设备创建 Schema - 接收客户端输入",
    "required": [
      "device_code",
      "device_name",
      "device_type",
      "device_role",
      "capabilities",
      "supported_commands"
    ],
    "additionalProperties": false,
    "fields": {
      "device_code": {
        "title": "Device Code",
        "description": "设备编码（业务主键）",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 50
      },
      "device_name": {
        "title": "Device Name",
        "description": "设备名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 100
      },
      "device_type": {
        "description": "设备类型",
        "required": true,
        "nullable": false,
        "ref": "DeviceType"
      },
      "work_line_id": {
        "title": "Work Line Id",
        "description": "所属作业线 ID",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "description": {
        "title": "Description",
        "description": "设备用途说明",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "device_role": {
        "title": "Device Role",
        "description": "设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "role_index": {
        "title": "Role Index",
        "description": "同角色序号（1, 2, 3...）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1,
        "minimum": 1
      },
      "upstream_device_id": {
        "title": "Upstream Device Id",
        "description": "上游设备ID（线性拓扑）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "vendor_type": {
        "title": "Vendor Type",
        "description": "厂商类型（ECS, KEYENCE, FANUC...）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "设备绑定的工作线插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_profile": {
        "title": "Contract Profile",
        "description": "设备绑定的协议 profile",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_version": {
        "title": "Contract Version",
        "description": "设备绑定的协议版本",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "capabilities": {
        "title": "Capabilities",
        "description": "能力列表（业务能力，如 [SCAN, PICK, PUT]）",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "type": "string"
        }
      },
      "host": {
        "title": "Host",
        "description": "设备 IP 地址",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "port": {
        "title": "Port",
        "description": "服务端口",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 65535
      },
      "protocol": {
        "description": "通信协议",
        "required": false,
        "nullable": false,
        "default": "HTTP",
        "ref": "DeviceProtocol"
      },
      "auth_token": {
        "title": "Auth Token",
        "description": "认证 Token（Bearer Token）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "timeout": {
        "title": "Timeout",
        "description": "请求超时时间（毫秒，默认 10s）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 10000,
        "minimum": 1000,
        "maximum": 300000
      },
      "device_status": {
        "description": "设备实时状态（IDLE/RUNNING/ERROR/OFFLINE）",
        "required": false,
        "nullable": false,
        "default": "IDLE",
        "ref": "DeviceStatus"
      },
      "current_command_id": {
        "title": "Current Command Id",
        "description": "当前执行的指令 ID（关联 DeviceCommand.id）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "last_heartbeat_at": {
        "title": "Last Heartbeat At",
        "description": "最后心跳时间",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "error_code": {
        "title": "Error Code",
        "description": "错误代码（status=ERROR 时）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "supported_commands": {
        "title": "Supported Commands",
        "description": "支持的指令类型（PICK/PUT/SCAN/ROTATE/PROCESS）",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "type": "string"
        }
      },
      "max_concurrent_tasks": {
        "title": "Max Concurrent Tasks",
        "description": "最大并发任务数",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1,
        "minimum": 1,
        "maximum": 10
      },
      "idempotency_ttl": {
        "title": "Idempotency Ttl",
        "description": "指令去重缓存时间（秒，默认 1 小时）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 3600,
        "minimum": 60,
        "maximum": 86400
      }
    }
  },
  "DeviceProtocol": {
    "title": "DeviceProtocol",
    "description": "设备通信协议枚举（白皮书 2.1 节）",
    "required": [],
    "fields": {
      "__enum": {
        "title": "DeviceProtocol",
        "description": "设备通信协议枚举（白皮书 2.1 节）",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "HTTP",
          "HTTPS",
          "TCP",
          "MODBUS",
          "MQTT"
        ]
      }
    }
  },
  "DeviceResponse": {
    "title": "DeviceResponse",
    "description": "设备响应 Schema - 返回给客户端",
    "required": [
      "device_code",
      "device_name",
      "device_type",
      "device_role",
      "id",
      "version"
    ],
    "fields": {
      "device_code": {
        "title": "Device Code",
        "description": "设备编码（业务主键）",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 50
      },
      "device_name": {
        "title": "Device Name",
        "description": "设备名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 100
      },
      "device_type": {
        "description": "设备类型",
        "required": true,
        "nullable": false,
        "ref": "DeviceType"
      },
      "work_line_id": {
        "title": "Work Line Id",
        "description": "所属作业线 ID",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "description": {
        "title": "Description",
        "description": "设备用途说明",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "device_role": {
        "title": "Device Role",
        "description": "设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "role_index": {
        "title": "Role Index",
        "description": "同角色序号（1, 2, 3...）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1,
        "minimum": 1
      },
      "upstream_device_id": {
        "title": "Upstream Device Id",
        "description": "上游设备ID（线性拓扑）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "vendor_type": {
        "title": "Vendor Type",
        "description": "厂商类型（ECS, KEYENCE, FANUC...）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "设备绑定的工作线插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_profile": {
        "title": "Contract Profile",
        "description": "设备绑定的协议 profile",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_version": {
        "title": "Contract Version",
        "description": "设备绑定的协议版本",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "capabilities": {
        "title": "Capabilities",
        "description": "能力列表（业务能力，如 [SCAN, PICK, PUT]）",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "type": "string"
        }
      },
      "host": {
        "title": "Host",
        "description": "设备 IP 地址",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "port": {
        "title": "Port",
        "description": "服务端口",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 65535
      },
      "protocol": {
        "description": "通信协议",
        "required": false,
        "nullable": false,
        "default": "HTTP",
        "ref": "DeviceProtocol"
      },
      "auth_token": {
        "title": "Auth Token",
        "description": "认证 Token（Bearer Token）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "timeout": {
        "title": "Timeout",
        "description": "请求超时时间（毫秒，默认 10s）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 10000,
        "minimum": 1000,
        "maximum": 300000
      },
      "device_status": {
        "description": "设备实时状态（IDLE/RUNNING/ERROR/OFFLINE）",
        "required": false,
        "nullable": false,
        "default": "IDLE",
        "ref": "DeviceStatus"
      },
      "current_command_id": {
        "title": "Current Command Id",
        "description": "当前执行的指令 ID（关联 DeviceCommand.id）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "last_heartbeat_at": {
        "title": "Last Heartbeat At",
        "description": "最后心跳时间",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "error_code": {
        "title": "Error Code",
        "description": "错误代码（status=ERROR 时）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "supported_commands": {
        "title": "Supported Commands",
        "description": "支持的指令类型（PICK/PUT/SCAN/ROTATE/PROCESS）",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "type": "string"
        }
      },
      "max_concurrent_tasks": {
        "title": "Max Concurrent Tasks",
        "description": "最大并发任务数",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1,
        "minimum": 1,
        "maximum": 10
      },
      "idempotency_ttl": {
        "title": "Idempotency Ttl",
        "description": "指令去重缓存时间（秒，默认 1 小时）",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 3600,
        "minimum": 60,
        "maximum": 86400
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "DeviceStatus": {
    "title": "DeviceStatus",
    "description": "设备状态枚举（白皮书 5.2 节）",
    "required": [],
    "fields": {
      "__enum": {
        "title": "DeviceStatus",
        "description": "设备状态枚举（白皮书 5.2 节）",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "IDLE",
          "RUNNING",
          "ERROR",
          "OFFLINE"
        ]
      }
    }
  },
  "DeviceType": {
    "title": "DeviceType",
    "description": "设备类型枚举 (SRS 3.3.0 节)",
    "required": [],
    "fields": {
      "__enum": {
        "title": "DeviceType",
        "description": "设备类型枚举 (SRS 3.3.0 节)",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "PDA",
          "INDUSTRIAL_PC",
          "PRINTER",
          "COMPUTER",
          "LCR_TESTER",
          "ROBOTIC_ARM",
          "VISION_CAMERA",
          "CONVEYOR",
          "LABELER",
          "XRAY",
          "SCANNER"
        ]
      }
    }
  },
  "DeviceUpdate": {
    "title": "DeviceUpdate",
    "description": "设备更新 Schema - 所有字段可选",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "device_code": {
        "title": "Device Code",
        "description": "设备编码（业务主键）",
        "type": "string",
        "required": false,
        "nullable": true,
        "minLength": 1,
        "maxLength": 50
      },
      "device_name": {
        "title": "Device Name",
        "description": "设备名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "minLength": 1,
        "maxLength": 100
      },
      "device_type": {
        "description": "设备类型",
        "required": false,
        "nullable": true,
        "ref": "DeviceType"
      },
      "work_line_id": {
        "title": "Work Line Id",
        "description": "所属作业线 ID",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "description": {
        "title": "Description",
        "description": "设备用途说明",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "device_role": {
        "title": "Device Role",
        "description": "设备业务角色（SCANNER, ROBOT_ARM, XRAY, CONVEYOR）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "role_index": {
        "title": "Role Index",
        "description": "同角色序号（1, 2, 3...）",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1
      },
      "upstream_device_id": {
        "title": "Upstream Device Id",
        "description": "上游设备ID（线性拓扑）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "vendor_type": {
        "title": "Vendor Type",
        "description": "厂商类型（ECS, KEYENCE, FANUC...）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "设备绑定的工作线插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_profile": {
        "title": "Contract Profile",
        "description": "设备绑定的协议 profile",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "contract_version": {
        "title": "Contract Version",
        "description": "设备绑定的协议版本",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "capabilities": {
        "title": "Capabilities",
        "description": "能力列表（业务能力，如 [SCAN, PICK, PUT]）",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "type": "string"
        }
      },
      "host": {
        "title": "Host",
        "description": "设备 IP 地址",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "port": {
        "title": "Port",
        "description": "服务端口",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 65535
      },
      "protocol": {
        "description": "通信协议",
        "required": false,
        "nullable": true,
        "ref": "DeviceProtocol"
      },
      "auth_token": {
        "title": "Auth Token",
        "description": "认证 Token（Bearer Token）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "timeout": {
        "title": "Timeout",
        "description": "请求超时时间（毫秒，默认 10s）",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1000,
        "maximum": 300000
      },
      "device_status": {
        "description": "设备实时状态（IDLE/RUNNING/ERROR/OFFLINE）",
        "required": false,
        "nullable": true,
        "ref": "DeviceStatus"
      },
      "current_command_id": {
        "title": "Current Command Id",
        "description": "当前执行的指令 ID（关联 DeviceCommand.id）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "last_heartbeat_at": {
        "title": "Last Heartbeat At",
        "description": "最后心跳时间",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "error_code": {
        "title": "Error Code",
        "description": "错误代码（status=ERROR 时）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "supported_commands": {
        "title": "Supported Commands",
        "description": "支持的指令类型（PICK/PUT/SCAN/ROTATE/PROCESS）",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "type": "string"
        }
      },
      "max_concurrent_tasks": {
        "title": "Max Concurrent Tasks",
        "description": "最大并发任务数",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 1,
        "maximum": 10
      },
      "idempotency_ttl": {
        "title": "Idempotency Ttl",
        "description": "指令去重缓存时间（秒，默认 1 小时）",
        "type": "integer",
        "required": false,
        "nullable": true,
        "minimum": 60,
        "maximum": 86400
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "FilterCondition": {
    "title": "FilterCondition",
    "description": "单个过滤条件",
    "required": [
      "field",
      "op"
    ],
    "fields": {
      "field": {
        "title": "Field",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "op": {
        "required": true,
        "nullable": false,
        "ref": "FilterOperator"
      },
      "value": {
        "title": "Value",
        "required": false,
        "nullable": true
      }
    }
  },
  "FilterGroup": {
    "title": "FilterGroup",
    "description": "过滤条件组",
    "required": [],
    "fields": {
      "couple": {
        "title": "Couple",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "and",
        "enum": [
          "and",
          "or",
          "not"
        ]
      },
      "conditions": {
        "title": "Conditions",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {}
      }
    }
  },
  "FilterOperator": {
    "title": "FilterOperator",
    "description": "过滤操作符",
    "required": [],
    "fields": {
      "__enum": {
        "title": "FilterOperator",
        "description": "过滤操作符",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "eq",
          "ne",
          "gt",
          "ge",
          "lt",
          "le",
          "in",
          "nin",
          "ilike",
          "between",
          "is_null",
          "not_null"
        ]
      }
    }
  },
  "HTTPValidationError": {
    "title": "HTTPValidationError",
    "required": [],
    "fields": {
      "detail": {
        "title": "Detail",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "ValidationError"
        }
      }
    }
  },
  "LineType": {
    "title": "LineType",
    "description": "作业线类型枚举",
    "required": [],
    "fields": {
      "__enum": {
        "title": "LineType",
        "description": "作业线类型枚举",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "AUTO",
          "MANUAL",
          "HYBRID"
        ]
      }
    }
  },
  "ListResponseData_APIAccessLogResponse_": {
    "title": "ListResponseData[APIAccessLogResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "APIAccessLogResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_APIApplicationResponse_": {
    "title": "ListResponseData[APIApplicationResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "APIApplicationResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_AuditLogResponse_": {
    "title": "ListResponseData[AuditLogResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "AuditLogResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_DemoProductResponse_": {
    "title": "ListResponseData[DemoProductResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "DemoProductResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_DeviceResponse_": {
    "title": "ListResponseData[DeviceResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "DeviceResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_MenuResponse_": {
    "title": "ListResponseData[MenuResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "MenuResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_PermissionResponse_": {
    "title": "ListResponseData[PermissionResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "PermissionResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_RoleResponse_": {
    "title": "ListResponseData[RoleResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "RoleResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_UserResponse_": {
    "title": "ListResponseData[UserResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "UserResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseData_WorkLineResponse_": {
    "title": "ListResponseData[WorkLineResponse]",
    "required": [],
    "fields": {
      "total": {
        "title": "Total",
        "description": "总数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "items": {
        "title": "Items",
        "description": "列表数据",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "WorkLineResponse"
        }
      },
      "limit": {
        "title": "Limit",
        "description": "分页大小",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "offset": {
        "title": "Offset",
        "description": "偏移量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      }
    }
  },
  "ListResponseSchemaModel_APIAccessLogResponse_": {
    "title": "ListResponseSchemaModel[APIAccessLogResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_APIAccessLogResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_APIApplicationResponse_": {
    "title": "ListResponseSchemaModel[APIApplicationResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_APIApplicationResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_AuditLogResponse_": {
    "title": "ListResponseSchemaModel[AuditLogResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_AuditLogResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_DemoProductResponse_": {
    "title": "ListResponseSchemaModel[DemoProductResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_DemoProductResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_DeviceResponse_": {
    "title": "ListResponseSchemaModel[DeviceResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_DeviceResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_MenuResponse_": {
    "title": "ListResponseSchemaModel[MenuResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_MenuResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_PermissionResponse_": {
    "title": "ListResponseSchemaModel[PermissionResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_PermissionResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_RoleResponse_": {
    "title": "ListResponseSchemaModel[RoleResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_RoleResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_UserResponse_": {
    "title": "ListResponseSchemaModel[UserResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_UserResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ListResponseSchemaModel_WorkLineResponse_": {
    "title": "ListResponseSchemaModel[WorkLineResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ListResponseData_WorkLineResponse_"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "LoginRequest": {
    "title": "LoginRequest",
    "description": "登录请求 Schema",
    "required": [
      "username",
      "password"
    ],
    "fields": {
      "username": {
        "title": "Username",
        "description": "用户名",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 3,
        "maxLength": 50
      },
      "password": {
        "title": "Password",
        "description": "密码",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 6,
        "maxLength": 100
      }
    }
  },
  "LoginResponse": {
    "title": "LoginResponse",
    "description": "登录响应 Schema\n\n包含访问令牌、刷新令牌元数据和用户信息",
    "required": [
      "access_token",
      "access_token_jti",
      "refresh_token_jti",
      "access_token_expire_time",
      "refresh_token_expire_time",
      "session_uuid",
      "user",
      "expires_in",
      "refresh_expires_in"
    ],
    "fields": {
      "access_token": {
        "title": "Access Token",
        "description": "访问令牌",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "access_token_jti": {
        "title": "Access Token Jti",
        "description": "访问令牌唯一标识符（用于撤销）",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "refresh_token_jti": {
        "title": "Refresh Token Jti",
        "description": "刷新令牌唯一标识符（用于撤销）",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "access_token_expire_time": {
        "title": "Access Token Expire Time",
        "description": "访问令牌过期时间",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "refresh_token_expire_time": {
        "title": "Refresh Token Expire Time",
        "description": "刷新令牌过期时间（令牌仅存储于 HttpOnly Cookie）",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "session_uuid": {
        "title": "Session Uuid",
        "description": "会话 UUID",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "user": {
        "description": "用户信息",
        "required": true,
        "nullable": false,
        "ref": "UserResponse"
      },
      "expires_in": {
        "title": "Expires In",
        "description": "访问令牌过期时间（秒）- OAuth 2.0 标准字段",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "refresh_expires_in": {
        "title": "Refresh Expires In",
        "description": "刷新令牌过期时间（秒）",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "LogoutResponse": {
    "title": "LogoutResponse",
    "description": "登出响应 Schema",
    "required": [
      "message"
    ],
    "fields": {
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "revoked_count": {
        "title": "Revoked Count",
        "description": "撤销的令牌数量",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      }
    }
  },
  "MenuCreate": {
    "title": "MenuCreate",
    "description": "菜单创建 Schema",
    "required": [
      "name",
      "title",
      "path"
    ],
    "additionalProperties": false,
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "菜单标识，如 system:users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "title": {
        "title": "Title",
        "description": "显示标题",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "path": {
        "title": "Path",
        "description": "路由路径，如 /system/users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 200
      },
      "component": {
        "title": "Component",
        "description": "组件路径，如 views/system/users.vue",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "icon": {
        "title": "Icon",
        "description": "图标",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "is_hidden": {
        "title": "Is Hidden",
        "description": "是否隐藏",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      }
    }
  },
  "MenuResponse": {
    "title": "MenuResponse",
    "description": "菜单响应 Schema",
    "required": [
      "name",
      "title",
      "path",
      "id",
      "version"
    ],
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "菜单标识，如 system:users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "title": {
        "title": "Title",
        "description": "显示标题",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "path": {
        "title": "Path",
        "description": "路由路径，如 /system/users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 200
      },
      "component": {
        "title": "Component",
        "description": "组件路径，如 views/system/users.vue",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "icon": {
        "title": "Icon",
        "description": "图标",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "is_hidden": {
        "title": "Is Hidden",
        "description": "是否隐藏",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "roles": {
        "title": "Roles",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "RoleResponse"
        }
      }
    }
  },
  "MenuTreeResponse": {
    "title": "MenuTreeResponse",
    "description": "菜单树响应 Schema",
    "required": [
      "name",
      "title",
      "path",
      "id",
      "version"
    ],
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "菜单标识，如 system:users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "title": {
        "title": "Title",
        "description": "显示标题",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "path": {
        "title": "Path",
        "description": "路由路径，如 /system/users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 200
      },
      "component": {
        "title": "Component",
        "description": "组件路径，如 views/system/users.vue",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "icon": {
        "title": "Icon",
        "description": "图标",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "is_hidden": {
        "title": "Is Hidden",
        "description": "是否隐藏",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "roles": {
        "title": "Roles",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "RoleResponse"
        }
      },
      "children": {
        "title": "Children",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "MenuResponse"
        }
      }
    }
  },
  "MenuTreeResponseSimple": {
    "title": "MenuTreeResponseSimple",
    "description": "菜单树响应 Schema",
    "required": [
      "name",
      "title",
      "path",
      "id",
      "version"
    ],
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "菜单标识，如 system:users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "title": {
        "title": "Title",
        "description": "显示标题",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 50
      },
      "path": {
        "title": "Path",
        "description": "路由路径，如 /system/users",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 200
      },
      "component": {
        "title": "Component",
        "description": "组件路径，如 views/system/users.vue",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "icon": {
        "title": "Icon",
        "description": "图标",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "is_hidden": {
        "title": "Is Hidden",
        "description": "是否隐藏",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "children": {
        "title": "Children",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "MenuTreeResponseSimple"
        }
      }
    }
  },
  "MenuUpdate": {
    "title": "MenuUpdate",
    "description": "菜单更新 Schema",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": true
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "name": {
        "title": "Name",
        "description": "菜单标识，如 system:users",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "title": {
        "title": "Title",
        "description": "显示标题",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "path": {
        "title": "Path",
        "description": "路由路径，如 /system/users",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "component": {
        "title": "Component",
        "description": "组件路径，如 views/system/users.vue",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 200
      },
      "icon": {
        "title": "Icon",
        "description": "图标",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "is_hidden": {
        "title": "Is Hidden",
        "description": "是否隐藏",
        "type": "boolean",
        "required": false,
        "nullable": true
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "OperaStatus": {
    "title": "OperaStatus",
    "description": "操作日志状态",
    "required": [],
    "fields": {
      "__enum": {
        "title": "OperaStatus",
        "description": "操作日志状态",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "FAIL",
          "SUCCESS"
        ]
      }
    }
  },
  "PermissionCreate": {
    "title": "PermissionCreate",
    "description": "API 权限创建 Schema",
    "required": [
      "name"
    ],
    "additionalProperties": false,
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "权限标识，如 admin:role:create",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "description": "权限描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "type": {
        "title": "Type",
        "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "user_api",
        "maxLength": 20
      },
      "category": {
        "title": "Category",
        "description": "权限分类：admin、system、business 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "resource": {
        "title": "Resource",
        "description": "资源类型：user、role、permission、warehouse 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "action": {
        "title": "Action",
        "description": "操作：create、read、update、delete、list 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "method": {
        "title": "Method",
        "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 10
      },
      "path": {
        "title": "Path",
        "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      }
    }
  },
  "PermissionResponse": {
    "title": "PermissionResponse",
    "description": "API 权限响应 Schema（完整版）",
    "required": [
      "name",
      "id",
      "version",
      "full_name"
    ],
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "权限标识，如 admin:role:create",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "description": "权限描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "type": {
        "title": "Type",
        "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "user_api",
        "maxLength": 20
      },
      "category": {
        "title": "Category",
        "description": "权限分类：admin、system、business 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "resource": {
        "title": "Resource",
        "description": "资源类型：user、role、permission、warehouse 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "action": {
        "title": "Action",
        "description": "操作：create、read、update、delete、list 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "method": {
        "title": "Method",
        "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 10
      },
      "path": {
        "title": "Path",
        "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "full_name": {
        "title": "Full Name",
        "description": "生成完整的权限标识（包含类型前缀）",
        "type": "string",
        "required": true,
        "nullable": false
      }
    }
  },
  "PermissionTree": {
    "title": "PermissionTree",
    "description": "API 权限树形结构 Schema\n\n用于权限分组展示和管理（如按模块分组）",
    "required": [
      "name",
      "id",
      "is_leaf",
      "has_children"
    ],
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "/"
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "name": {
        "title": "Name",
        "description": "权限标识，如 admin:role:create",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "description": "权限描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "type": {
        "title": "Type",
        "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "user_api",
        "maxLength": 20
      },
      "category": {
        "title": "Category",
        "description": "权限分类：admin、system、business 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "resource": {
        "title": "Resource",
        "description": "资源类型：user、role、permission、warehouse 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "action": {
        "title": "Action",
        "description": "操作：create、read、update、delete、list 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "method": {
        "title": "Method",
        "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 10
      },
      "path": {
        "title": "Path",
        "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "children": {
        "title": "Children",
        "description": "子权限列表",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "PermissionTree"
        }
      },
      "is_leaf": {
        "title": "Is Leaf",
        "description": "是否为叶子节点（无子权限）",
        "type": "boolean",
        "required": true,
        "nullable": false
      },
      "has_children": {
        "title": "Has Children",
        "description": "是否有子权限",
        "type": "boolean",
        "required": true,
        "nullable": false
      }
    }
  },
  "PermissionUpdate": {
    "title": "PermissionUpdate",
    "description": "API 权限更新 Schema",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "parent_id": {
        "title": "Parent Id",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "tree_path": {
        "title": "Tree Path",
        "type": "string",
        "required": false,
        "nullable": true
      },
      "level": {
        "title": "Level",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "name": {
        "title": "Name",
        "description": "权限标识，如 admin:role:create",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "description": "权限描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "type": {
        "title": "Type",
        "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 20
      },
      "category": {
        "title": "Category",
        "description": "权限分类：admin、system、business 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "resource": {
        "title": "Resource",
        "description": "资源类型：user、role、permission、warehouse 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "action": {
        "title": "Action",
        "description": "操作：create、read、update、delete、list 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 50
      },
      "method": {
        "title": "Method",
        "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 10
      },
      "path": {
        "title": "Path",
        "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "QueryOptions": {
    "title": "QueryOptions",
    "description": "查询选项",
    "required": [],
    "fields": {
      "filters": {
        "required": false,
        "nullable": true,
        "ref": "FilterGroup"
      },
      "sort": {
        "title": "Sort",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "SortField"
        }
      },
      "offset": {
        "title": "Offset",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0,
        "minimum": 0
      },
      "limit": {
        "title": "Limit",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 10,
        "minimum": 1,
        "maximum": 100
      },
      "max_depth": {
        "title": "Max Depth",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 1,
        "minimum": 0,
        "maximum": 3
      },
      "include_deleted": {
        "title": "Include Deleted",
        "description": "是否包含已删除记录",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": false
      }
    }
  },
  "RefreshTokenResponse": {
    "title": "RefreshTokenResponse",
    "description": "刷新令牌响应 Schema\n\n包含新的访问令牌和刷新令牌元数据",
    "required": [
      "access_token",
      "access_token_jti",
      "refresh_token_jti",
      "access_token_expire_time",
      "refresh_token_expire_time",
      "session_uuid",
      "expires_in",
      "refresh_expires_in"
    ],
    "fields": {
      "access_token": {
        "title": "Access Token",
        "description": "新的访问令牌",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "access_token_jti": {
        "title": "Access Token Jti",
        "description": "访问令牌唯一标识符",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "refresh_token_jti": {
        "title": "Refresh Token Jti",
        "description": "刷新令牌唯一标识符",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "access_token_expire_time": {
        "title": "Access Token Expire Time",
        "description": "访问令牌过期时间",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "refresh_token_expire_time": {
        "title": "Refresh Token Expire Time",
        "description": "刷新令牌过期时间（令牌仅存储于 HttpOnly Cookie）",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "session_uuid": {
        "title": "Session Uuid",
        "description": "会话 UUID",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "expires_in": {
        "title": "Expires In",
        "description": "访问令牌过期时间（秒）- OAuth 2.0 标准字段",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "refresh_expires_in": {
        "title": "Refresh Expires In",
        "description": "刷新令牌过期时间（秒）",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "ResetPasswordRequest": {
    "title": "ResetPasswordRequest",
    "description": "管理员重置密码请求",
    "required": [
      "new_password"
    ],
    "fields": {
      "new_password": {
        "title": "New Password",
        "description": "新密码",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 6,
        "maxLength": 100
      }
    }
  },
  "ResetValidityPeriodSchema": {
    "title": "ResetValidityPeriodSchema",
    "description": "重置有效期 Schema",
    "required": [
      "validity_period"
    ],
    "fields": {
      "version": {
        "title": "Version",
        "description": "数据版本",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "validity_period": {
        "description": "新的有效期时长",
        "required": true,
        "nullable": false,
        "ref": "ValidityPeriod"
      }
    }
  },
  "ResponseSchemaModel_APIAccessLogResponse_": {
    "title": "ResponseSchemaModel[APIAccessLogResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "APIAccessLogResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_APIApplicationResponse_": {
    "title": "ResponseSchemaModel[APIApplicationResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "APIApplicationResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_ActiveSessionsResponse_": {
    "title": "ResponseSchemaModel[ActiveSessionsResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "ActiveSessionsResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_AuditLogResponse_": {
    "title": "ResponseSchemaModel[AuditLogResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "AuditLogResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_AuthMyResponse_": {
    "title": "ResponseSchemaModel[AuthMyResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "AuthMyResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_DemoProductResponse_": {
    "title": "ResponseSchemaModel[DemoProductResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "DemoProductResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_DeviceResponse_": {
    "title": "ResponseSchemaModel[DeviceResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "DeviceResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_LoginResponse_": {
    "title": "ResponseSchemaModel[LoginResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "LoginResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_LogoutResponse_": {
    "title": "ResponseSchemaModel[LogoutResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "LogoutResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_MenuResponse_": {
    "title": "ResponseSchemaModel[MenuResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "MenuResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_NoneType_": {
    "title": "ResponseSchemaModel[NoneType]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "null",
        "required": false,
        "nullable": false
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_PermissionResponse_": {
    "title": "ResponseSchemaModel[PermissionResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "PermissionResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_RefreshTokenResponse_": {
    "title": "ResponseSchemaModel[RefreshTokenResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "RefreshTokenResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_RevokeSessionResponse_": {
    "title": "ResponseSchemaModel[RevokeSessionResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "RevokeSessionResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_RoleResponse_": {
    "title": "ResponseSchemaModel[RoleResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "RoleResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_UserPermissionsResponse_": {
    "title": "ResponseSchemaModel[UserPermissionsResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "UserPermissionsResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_UserResponse_": {
    "title": "ResponseSchemaModel[UserResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "UserResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_UserSimpleResponse_": {
    "title": "ResponseSchemaModel[UserSimpleResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "UserSimpleResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_WorkLineResponse_": {
    "title": "ResponseSchemaModel[WorkLineResponse]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "description": "响应数据",
        "required": false,
        "nullable": true,
        "ref": "WorkLineResponse"
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_dict_str__Any__": {
    "title": "ResponseSchemaModel[dict[str, Any]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "object",
        "required": false,
        "nullable": true
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_dict_str__str__": {
    "title": "ResponseSchemaModel[dict[str, str]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "object",
        "required": false,
        "nullable": true
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_Any__": {
    "title": "ResponseSchemaModel[list[Any]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {}
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_MenuResponse__": {
    "title": "ResponseSchemaModel[list[MenuResponse]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "MenuResponse"
        }
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_MenuTreeResponseSimple__": {
    "title": "ResponseSchemaModel[list[MenuTreeResponseSimple]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "MenuTreeResponseSimple"
        }
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_MenuTreeResponse__": {
    "title": "ResponseSchemaModel[list[MenuTreeResponse]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "MenuTreeResponse"
        }
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_PermissionResponse__": {
    "title": "ResponseSchemaModel[list[PermissionResponse]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "PermissionResponse"
        }
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "ResponseSchemaModel_list_PermissionTree__": {
    "title": "ResponseSchemaModel[list[PermissionTree]]",
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
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "操作成功"
      },
      "data": {
        "title": "Data",
        "description": "响应数据",
        "type": "array",
        "required": false,
        "nullable": true,
        "items": {
          "ref": "PermissionTree"
        }
      },
      "timestamp": {
        "title": "Timestamp",
        "description": "响应时间戳(ISO 8601格式)",
        "type": "string",
        "required": false,
        "nullable": false
      }
    }
  },
  "RevokeSessionResponse": {
    "title": "RevokeSessionResponse",
    "description": "撤销会话响应 Schema",
    "required": [
      "message",
      "session_uuid"
    ],
    "fields": {
      "message": {
        "title": "Message",
        "description": "响应消息",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "session_uuid": {
        "title": "Session Uuid",
        "description": "被撤销的会话 UUID",
        "type": "string",
        "required": true,
        "nullable": false
      }
    }
  },
  "RoleCreate": {
    "title": "RoleCreate",
    "description": "角色创建 Schema",
    "required": [
      "name"
    ],
    "additionalProperties": false,
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      }
    }
  },
  "RoleResponse": {
    "title": "RoleResponse",
    "description": "角色响应 Schema",
    "required": [
      "name",
      "id",
      "version"
    ],
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "permissions": {
        "title": "Permissions",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "PermissionResponse"
        }
      }
    }
  },
  "RoleResponseSimple": {
    "title": "RoleResponseSimple",
    "description": "角色响应 Schema（简化版，不含权限）",
    "required": [
      "name",
      "id"
    ],
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "RoleUpdate": {
    "title": "RoleUpdate",
    "description": "角色更新 Schema",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "name": {
        "title": "Name",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "description": {
        "title": "Description",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 255
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "SessionInfo": {
    "title": "SessionInfo",
    "description": "会话信息 Schema\n\n描述一个活跃的用户会话",
    "required": [
      "session_uuid",
      "jti",
      "created_at"
    ],
    "fields": {
      "session_uuid": {
        "title": "Session Uuid",
        "description": "会话 UUID",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "jti": {
        "title": "Jti",
        "description": "JWT ID",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "created_at": {
        "title": "Created At",
        "description": "会话创建时间",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "device_info": {
        "title": "Device Info",
        "description": "设备信息（可选）",
        "type": "object",
        "required": false,
        "nullable": true
      },
      "last_active": {
        "title": "Last Active",
        "description": "最后活跃时间",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      }
    }
  },
  "SortField": {
    "title": "SortField",
    "description": "排序字段",
    "required": [
      "field"
    ],
    "fields": {
      "field": {
        "title": "Field",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "order": {
        "title": "Order",
        "type": "string",
        "required": false,
        "nullable": false,
        "default": "desc",
        "enum": [
          "asc",
          "desc"
        ]
      }
    }
  },
  "TryInvokeApplication": {
    "title": "TryInvokeApplication",
    "description": "测试 API 调用数据模型",
    "required": [
      "command_name",
      "command_description",
      "command_parameters",
      "command_response"
    ],
    "fields": {
      "command_name": {
        "title": "Command Name",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "command_description": {
        "title": "Command Description",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "command_parameters": {
        "title": "Command Parameters",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "type": "string"
        }
      },
      "command_response": {
        "title": "Command Response",
        "type": "string",
        "required": true,
        "nullable": false
      }
    }
  },
  "TryInvokeApplicationRequest": {
    "title": "TryInvokeApplicationRequest",
    "description": "测试 API 调用请求模型（包裹格式）",
    "required": [
      "data"
    ],
    "fields": {
      "data": {
        "required": true,
        "nullable": false,
        "ref": "TryInvokeApplication"
      }
    }
  },
  "UserCreate": {
    "title": "UserCreate",
    "description": "用户创建 Schema - 接收客户端输入",
    "required": [
      "username",
      "email",
      "password"
    ],
    "additionalProperties": false,
    "fields": {
      "username": {
        "title": "Username",
        "description": "用户名",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 3,
        "maxLength": 50
      },
      "email": {
        "title": "Email",
        "description": "邮箱",
        "type": "string",
        "format": "email",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "full_name": {
        "title": "Full Name",
        "description": "姓名",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "password": {
        "title": "Password",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 6,
        "maxLength": 100
      }
    }
  },
  "UserPermissionsResponse": {
    "title": "UserPermissionsResponse",
    "description": "用户权限列表响应 Schema\n\n包含用户有权限访问的所有 API 权限",
    "required": [
      "total",
      "permissions"
    ],
    "fields": {
      "total": {
        "title": "Total",
        "description": "权限总数",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "permissions": {
        "title": "Permissions",
        "description": "用户有权限访问的 API 列表",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {
          "ref": "ApiPermissionInfo"
        }
      }
    }
  },
  "UserResponse": {
    "title": "UserResponse",
    "description": "用户响应 Schema - 返回给客户端",
    "required": [
      "username",
      "email",
      "id",
      "is_superuser",
      "is_multi_login",
      "created_at",
      "created_by"
    ],
    "fields": {
      "username": {
        "title": "Username",
        "description": "用户名",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 3,
        "maxLength": 50
      },
      "email": {
        "title": "Email",
        "description": "邮箱",
        "type": "string",
        "format": "email",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "full_name": {
        "title": "Full Name",
        "description": "姓名",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "is_superuser": {
        "title": "Is Superuser",
        "type": "boolean",
        "required": true,
        "nullable": false
      },
      "is_multi_login": {
        "title": "Is Multi Login",
        "type": "boolean",
        "required": true,
        "nullable": false
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "created_by": {
        "title": "Created By",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "updated_by": {
        "title": "Updated By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_by": {
        "title": "Deleted By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_at": {
        "title": "Deleted At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "roles": {
        "title": "Roles",
        "type": "array",
        "required": false,
        "nullable": false,
        "items": {
          "ref": "RoleResponseSimple"
        }
      }
    }
  },
  "UserSimpleResponse": {
    "title": "UserSimpleResponse",
    "description": "用户响应 Schema 无关联关系 - 返回给客户端",
    "required": [
      "username",
      "email",
      "id",
      "is_superuser",
      "is_multi_login",
      "created_at",
      "created_by"
    ],
    "fields": {
      "username": {
        "title": "Username",
        "description": "用户名",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 3,
        "maxLength": 50
      },
      "email": {
        "title": "Email",
        "description": "邮箱",
        "type": "string",
        "format": "email",
        "required": true,
        "nullable": false,
        "maxLength": 100
      },
      "full_name": {
        "title": "Full Name",
        "description": "姓名",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "is_superuser": {
        "title": "Is Superuser",
        "type": "boolean",
        "required": true,
        "nullable": false
      },
      "is_multi_login": {
        "title": "Is Multi Login",
        "type": "boolean",
        "required": true,
        "nullable": false
      },
      "created_at": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "required": true,
        "nullable": false
      },
      "created_by": {
        "title": "Created By",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "updated_at": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      },
      "updated_by": {
        "title": "Updated By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_by": {
        "title": "Deleted By",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "deleted_at": {
        "title": "Deleted At",
        "type": "string",
        "format": "date-time",
        "required": false,
        "nullable": true
      }
    }
  },
  "UserUpdate": {
    "title": "UserUpdate",
    "description": "用户更新 Schema - 所有字段可选",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "username": {
        "title": "Username",
        "description": "用户名",
        "type": "string",
        "required": false,
        "nullable": true,
        "minLength": 3,
        "maxLength": 50
      },
      "email": {
        "title": "Email",
        "description": "邮箱",
        "type": "string",
        "format": "email",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "full_name": {
        "title": "Full Name",
        "description": "姓名",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "ValidationError": {
    "title": "ValidationError",
    "required": [
      "loc",
      "msg",
      "type"
    ],
    "fields": {
      "loc": {
        "title": "Location",
        "type": "array",
        "required": true,
        "nullable": false,
        "items": {}
      },
      "msg": {
        "title": "Message",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "type": {
        "title": "Error Type",
        "type": "string",
        "required": true,
        "nullable": false
      },
      "input": {
        "title": "Input",
        "required": false,
        "nullable": false
      },
      "ctx": {
        "title": "Context",
        "type": "object",
        "required": false,
        "nullable": false
      }
    }
  },
  "ValidityPeriod": {
    "title": "ValidityPeriod",
    "description": "有效期枚举",
    "required": [],
    "fields": {
      "__enum": {
        "title": "ValidityPeriod",
        "description": "有效期枚举",
        "type": "string",
        "required": true,
        "nullable": false,
        "enum": [
          "1d",
          "1w",
          "1m",
          "6m",
          "1y",
          "never"
        ]
      }
    }
  },
  "WorkLineCreate": {
    "title": "WorkLineCreate",
    "description": "作业线创建 Schema - 接收客户端输入",
    "required": [
      "line_code",
      "line_name",
      "line_type",
      "config"
    ],
    "additionalProperties": false,
    "fields": {
      "line_code": {
        "title": "Line Code",
        "description": "作业线编码（业务主键）",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 50
      },
      "line_name": {
        "title": "Line Name",
        "description": "作业线名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 100
      },
      "line_type": {
        "description": "作业线类型",
        "required": true,
        "nullable": false,
        "ref": "LineType"
      },
      "zone_name": {
        "title": "Zone Name",
        "description": "区域名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "工作线执行插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "config": {
        "title": "Config",
        "description": "工作线插件配置",
        "type": "object",
        "required": true,
        "nullable": false
      },
      "description": {
        "title": "Description",
        "description": "作业线描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": true
      },
      "capacity": {
        "title": "Capacity",
        "description": "产能（件/小时）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      }
    }
  },
  "WorkLineResponse": {
    "title": "WorkLineResponse",
    "description": "作业线响应 Schema - 返回给客户端",
    "required": [
      "line_code",
      "line_name",
      "line_type",
      "id",
      "version"
    ],
    "fields": {
      "line_code": {
        "title": "Line Code",
        "description": "作业线编码（业务主键）",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 50
      },
      "line_name": {
        "title": "Line Name",
        "description": "作业线名称",
        "type": "string",
        "required": true,
        "nullable": false,
        "minLength": 1,
        "maxLength": 100
      },
      "line_type": {
        "description": "作业线类型",
        "required": true,
        "nullable": false,
        "ref": "LineType"
      },
      "zone_name": {
        "title": "Zone Name",
        "description": "区域名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "工作线执行插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "config": {
        "title": "Config",
        "description": "工作线插件配置",
        "type": "object",
        "required": false,
        "nullable": false
      },
      "description": {
        "title": "Description",
        "description": "作业线描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": false,
        "default": true
      },
      "capacity": {
        "title": "Capacity",
        "description": "产能（件/小时）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": false,
        "default": 0
      },
      "id": {
        "title": "Id",
        "type": "integer",
        "required": true,
        "nullable": false
      },
      "version": {
        "title": "Version",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  },
  "WorkLineUpdate": {
    "title": "WorkLineUpdate",
    "description": "作业线更新 Schema - 所有字段可选",
    "required": [
      "version"
    ],
    "additionalProperties": false,
    "fields": {
      "line_code": {
        "title": "Line Code",
        "description": "作业线编码（业务主键）",
        "type": "string",
        "required": false,
        "nullable": true,
        "minLength": 1,
        "maxLength": 50
      },
      "line_name": {
        "title": "Line Name",
        "description": "作业线名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "minLength": 1,
        "maxLength": 100
      },
      "line_type": {
        "description": "作业线类型",
        "required": false,
        "nullable": true,
        "ref": "LineType"
      },
      "zone_name": {
        "title": "Zone Name",
        "description": "区域名称",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "plugin_key": {
        "title": "Plugin Key",
        "description": "工作线执行插件标识",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 100
      },
      "config": {
        "title": "Config",
        "description": "工作线插件配置",
        "type": "object",
        "required": false,
        "nullable": true
      },
      "description": {
        "title": "Description",
        "description": "作业线描述",
        "type": "string",
        "required": false,
        "nullable": true,
        "maxLength": 500
      },
      "is_active": {
        "title": "Is Active",
        "description": "是否启用",
        "type": "boolean",
        "required": false,
        "nullable": true
      },
      "capacity": {
        "title": "Capacity",
        "description": "产能（件/小时）",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "sort_order": {
        "title": "Sort Order",
        "description": "排序顺序",
        "type": "integer",
        "required": false,
        "nullable": true
      },
      "version": {
        "title": "Version",
        "description": "乐观锁版本号，更新时必传",
        "type": "integer",
        "required": true,
        "nullable": false
      }
    }
  }
} as const satisfies Record<
  string,
  OpenApiSchemaMetadata
>

export function getOpenApiSchemaMetadata(schemaName: string): OpenApiSchemaMetadata | undefined {
  return (OPENAPI_SCHEMA_METADATA as Record<string, OpenApiSchemaMetadata>)[schemaName]
}

export function getOpenApiFieldMetadata(
  schemaName: string,
  fieldName: string
): OpenApiFieldMetadata | undefined {
  return (OPENAPI_SCHEMA_METADATA as Record<string, OpenApiSchemaMetadata>)[schemaName]?.fields[fieldName]
}
