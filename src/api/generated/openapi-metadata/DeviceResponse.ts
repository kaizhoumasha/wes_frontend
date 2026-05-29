/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceResponseMetadata = {
  "title": "DeviceResponse",
  "description": "设备响应 Schema - 返回给客户端",
  "required": [
    "device_code",
    "device_name",
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
      "description": "上游设备ID（物理路径辅助信息）",
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
    "capabilities_json": {
      "title": "Capabilities Json",
      "description": "设备能力声明（支持事件、命令、回调等）",
      "type": "object",
      "required": false,
      "nullable": false
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
      "enum": [
        "HTTP",
        "HTTPS",
        "TCP",
        "MODBUS",
        "MQTT"
      ],
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
    "callback_path": {
      "title": "Callback Path",
      "description": "设备侧回调/命令接收路径覆盖",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "device_status": {
      "description": "设备实时状态（IDLE/RUNNING/ERROR/OFFLINE/MAINTENANCE）",
      "required": false,
      "nullable": false,
      "default": "IDLE",
      "enum": [
        "IDLE",
        "RUNNING",
        "ERROR",
        "OFFLINE",
        "MAINTENANCE"
      ],
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
    "maintenance_mode": {
      "title": "Maintenance Mode",
      "description": "是否处于维护模式（维护中不参与正常编排）",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "max_concurrent_tasks": {
      "title": "Max Concurrent Tasks",
      "description": "固定为 1：单设备同一时间只允许一个硬件任务",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1,
      "maximum": 1
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
    "diagnostic_profile": {
      "title": "Diagnostic Profile",
      "description": "设备诊断配置（责任角色、显示偏好、扩展属性）",
      "type": "object",
      "required": false,
      "nullable": false
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
} satisfies OpenApiSchemaMetadata
