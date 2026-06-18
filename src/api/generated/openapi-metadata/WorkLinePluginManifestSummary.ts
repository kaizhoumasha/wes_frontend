/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePluginManifestSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePluginManifestSummaryMetadata = {
  "title": "WorkLinePluginManifestSummary",
  "description": "单插件 manifest 摘要。",
  "required": [
    "plugin_key",
    "contract_version",
    "topology"
  ],
  "fields": {
    "plugin_key": {
      "title": "Plugin Key",
      "description": "工作线执行插件标识",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "contract_version": {
      "title": "Contract Version",
      "description": "插件契约版本",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "devices": {
      "title": "Devices",
      "description": "设备角色要求",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "DeviceRequirement"
      }
    },
    "rack_positions": {
      "title": "Rack Positions",
      "description": "货架停靠位声明",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RackPosition"
      }
    },
    "topology": {
      "description": "静态拓扑声明",
      "required": true,
      "nullable": false,
      "ref": "TopologySpec"
    },
    "events": {
      "title": "Events",
      "description": "事件绑定",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "EventBinding"
      }
    },
    "commands": {
      "title": "Commands",
      "description": "命令绑定",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "CommandBinding"
      }
    },
    "resource_boundaries": {
      "title": "Resource Boundaries",
      "description": "资源边界",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "ResourceBoundary"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
