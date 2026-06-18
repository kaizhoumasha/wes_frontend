/**
 * 自动生成的 OpenAPI 字段元数据类型
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
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
