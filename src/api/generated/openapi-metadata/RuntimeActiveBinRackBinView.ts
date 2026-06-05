/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeActiveBinRackBinView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeActiveBinRackBinViewMetadata = {
  "title": "RuntimeActiveBinRackBinView",
  "required": [],
  "fields": {
    "rack_slot_code": {
      "title": "Rack Slot Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "rack_slot_location_code": {
      "title": "Rack Slot Location Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_id": {
      "title": "Bin Id",
      "required": false,
      "nullable": true
    },
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_type": {
      "title": "Bin Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_orientation_code": {
      "title": "Bin Orientation Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "cells": {
      "title": "Cells",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeActiveBinRackCellView"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
