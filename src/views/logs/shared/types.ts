import type { ApiAccessLogsItem } from '@/api/modules/apiAccessLogs'
import type { AuditLogsItem as AuditLogBase } from '@/api/modules/auditLogs'

export interface AuditLogStructuredFields {
  object_type?: string | null
  action?: string | null
  object_id?: string | null
  change_summary?: string | null
}

export type AuditLogViewItem = AuditLogBase & AuditLogStructuredFields

export type APIAccessLogViewItem = ApiAccessLogsItem
