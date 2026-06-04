/**
 * Runtime entity display identity utilities.
 *
 * Hierarchy: business code > friendly name > formatted system ID.
 * Never show a raw numeric ID without an entity prefix.
 */

export function displaySession(input: {
  session_code?: string | null
  session_id?: number | null
}): string {
  if (input.session_code) return input.session_code
  if (input.session_id != null) return `SES-${input.session_id}`
  return '未知 Session'
}

export function displayDevice(input: {
  device_name?: string | null
  device_code?: string | null
  device_id?: number | null
}): string {
  if (input.device_name) return input.device_name
  if (input.device_code) return input.device_code
  if (input.device_id != null) return `设备 #${input.device_id}`
  return '未知设备'
}

export function displayWorkline(input: {
  line_name?: string | null
  line_code?: string | null
  workline_id?: number | null
}): string {
  if (input.line_name) return input.line_name
  if (input.line_code) return input.line_code
  if (input.workline_id != null) return `工作线 #${input.workline_id}`
  return '未知工作线'
}

export function displayCommand(input: {
  command_code?: string | null
  dispatch_key?: string | null
}): string {
  if (input.command_code) return input.command_code
  if (input.dispatch_key) {
    const parts = input.dispatch_key.split(':')
    return parts[parts.length - 1] || input.dispatch_key
  }
  return '未知命令'
}

export function displayTrace(input: {
  barcode?: string | null
  business_key?: string | null
  trace_id?: string | null
  session_code?: string | null
  session_id?: number | null
}): string {
  if (input.barcode) return input.barcode
  if (input.business_key) return input.business_key
  if (input.trace_id) return input.trace_id
  if (input.session_code) return input.session_code
  if (input.session_id != null) return `Session #${input.session_id}`
  return '未知 Trace'
}

export function displayCase(input: {
  barcode?: string | null
  session_code?: string | null
  business_key?: string | null
  session_id?: number | null
}): string {
  if (input.barcode) return input.barcode
  if (input.session_code) return input.session_code
  if (input.business_key) return input.business_key
  if (input.session_id != null) return `SES-${input.session_id}`
  return '未知案件'
}
