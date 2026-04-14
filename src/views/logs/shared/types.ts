import type { GetByIdResult as APIAccessLogBase } from '@/api/modules/apiAuth'
import type { GetByIdResult as AuditLogBase } from '@/api/modules/sys'

export interface AuditLogStructuredFields {
  object_type?: string | null
  action?: string | null
  object_id?: string | null
  change_summary?: string | null
}

export interface APIAccessLogTimeFields {
  created_at?: string
}

export type AuditLogViewItem = AuditLogBase & AuditLogStructuredFields

export type APIAccessLogViewItem = APIAccessLogBase & APIAccessLogTimeFields
