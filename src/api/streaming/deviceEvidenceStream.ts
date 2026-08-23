import { apiClient, resolveApiBaseUrl } from '@/api/client'
import type { StreamQuery } from '@/api/modules/device'
import {
  getAccessToken as getStoredAccessToken,
  refreshAccessToken as refreshStoredAccessToken
} from '@/api/services/token-refresh'

export interface DeviceIngressAttemptEvent {
  request_id: string
  kind: 'DEVICE_RESULT' | 'DEVICE_EVENT'
  path: string
  received_at: string
  disposition: 'ACCEPTED' | 'DUPLICATE' | 'CONFLICT' | 'REJECTED'
  status_code: number
  evidence_id: number | null
  source_event_id: string | null
  device_code: string | null
  command_code: string | null
  event_type: string | null
  apply_status: string | null
  error_code: string | null
  observed_body_bytes: number
  raw_payload: Record<string, unknown> | null
}

export interface DeviceEvidenceUpdatedEvent {
  evidence_id: number
  kind: 'DEVICE_RESULT' | 'DEVICE_EVENT'
  source_event_id: string
  device_code: string
  command_code: string | null
  event_type: string | null
  apply_status: string
  processed_at: string
}

export type DeviceEvidenceStreamEvent =
  | { type: 'device_ingress.attempted'; payload: DeviceIngressAttemptEvent }
  | { type: 'device_evidence.updated'; payload: DeviceEvidenceUpdatedEvent }

export interface DeviceEvidenceStreamOptions {
  filters: StreamQuery
  signal: AbortSignal
  onOpen?: () => void
  onEvent: (event: DeviceEvidenceStreamEvent) => void
  baseUrl?: string
}

interface DeviceEvidenceStreamDependencies {
  fetchImpl: typeof fetch
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string>
}

const DEFAULT_DEPENDENCIES: DeviceEvidenceStreamDependencies = {
  fetchImpl: (...args) => globalThis.fetch(...args),
  getAccessToken: getStoredAccessToken,
  refreshAccessToken: () => refreshStoredAccessToken(apiClient)
}
const MAX_INCOMPLETE_FRAME_BYTES = 512 * 1024

export class DeviceEvidenceStreamHttpError extends Error {
  constructor(public readonly status: number) {
    super(`SSE 连接失败（HTTP ${status}）`)
    this.name = 'DeviceEvidenceStreamHttpError'
  }
}

export class DeviceEvidenceStreamProtocolError extends Error {
  constructor(message = 'SSE 未完成帧超过 512 KiB') {
    super(message)
    this.name = 'DeviceEvidenceStreamProtocolError'
  }
}

export async function consumeDeviceEvidenceStream(
  options: DeviceEvidenceStreamOptions,
  dependencies: DeviceEvidenceStreamDependencies = DEFAULT_DEPENDENCIES
): Promise<void> {
  const url = buildStreamUrl(options.baseUrl ?? resolveApiBaseUrl(), options.filters)
  let response = await requestStream(
    url,
    options.signal,
    dependencies,
    dependencies.getAccessToken()
  )

  if (response.status === 401 && !options.signal.aborted) {
    await cancelResponseBody(response)
    if (options.signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const refreshedToken = await dependencies.refreshAccessToken()
    response = await requestStream(url, options.signal, dependencies, refreshedToken)
  }

  if (!response.ok) {
    await cancelResponseBody(response)
    throw new DeviceEvidenceStreamHttpError(response.status)
  }
  const mediaType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (mediaType !== 'text/event-stream') {
    await cancelResponseBody(response)
    throw new DeviceEvidenceStreamProtocolError('SSE 响应 Content-Type 必须是 text/event-stream')
  }
  if (!response.body) {
    throw new Error('SSE 响应缺少可读流')
  }

  await readFrames(response.body, options.onEvent, options.onOpen)
}

async function cancelResponseBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined)
}

function buildStreamUrl(baseUrl: string, filters: StreamQuery): string {
  const url = new URL('/api/v1/device/evidences/stream', baseUrl)
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function requestStream(
  url: string,
  signal: AbortSignal,
  dependencies: DeviceEvidenceStreamDependencies,
  token: string | null
): Promise<Response> {
  return dependencies.fetchImpl(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include',
    cache: 'no-store',
    signal
  })
}

async function readFrames(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: DeviceEvidenceStreamEvent) => void,
  onOpen?: () => void
): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const encoder = new TextEncoder()
  let buffer = ''
  let bufferedBytes = 0
  let opened = false

  const markOpen = () => {
    if (opened) return
    opened = true
    onOpen?.()
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      bufferedBytes += value?.byteLength ?? 0
      let decodedChunk = ''
      try {
        decodedChunk = decoder.decode(value, { stream: !done })
      } catch {
        await cancelWithProtocolError(
          reader,
          new DeviceEvidenceStreamProtocolError('SSE 包含非法 UTF-8')
        )
      }
      const decodedBuffer = buffer + decodedChunk
      const remaining = dispatchCompleteFrames(decodedBuffer, onEvent, markOpen)
      if (remaining.length !== decodedBuffer.length) {
        const consumed = decodedBuffer.slice(0, decodedBuffer.length - remaining.length)
        bufferedBytes -= encoder.encode(consumed).byteLength
      }
      buffer = remaining
      if (bufferedBytes > MAX_INCOMPLETE_FRAME_BYTES) {
        await cancelWithProtocolError(reader, new DeviceEvidenceStreamProtocolError())
      }
      if (done) {
        return
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function cancelWithProtocolError(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  error: DeviceEvidenceStreamProtocolError
): Promise<never> {
  try {
    await reader.cancel(error)
  } catch {
    // 保留原始协议错误。
  }
  throw error
}

function dispatchCompleteFrames(
  buffer: string,
  onEvent: (event: DeviceEvidenceStreamEvent) => void,
  onFrame: () => void
): string {
  let remaining = buffer
  while (true) {
    const boundary = remaining.match(/\r?\n\r?\n/)
    if (!boundary?.index && boundary?.index !== 0) {
      return remaining
    }
    const frame = remaining.slice(0, boundary.index)
    remaining = remaining.slice(boundary.index + boundary[0].length)
    onFrame()
    dispatchFrame(frame, onEvent)
  }
}

function dispatchFrame(frame: string, onEvent: (event: DeviceEvidenceStreamEvent) => void): void {
  let eventType = ''
  const dataLines: string[] = []

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(':')) {
      continue
    }
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    const rawValue = separator === -1 ? '' : line.slice(separator + 1)
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue
    if (field === 'event') {
      eventType = value
    } else if (field === 'data') {
      dataLines.push(value)
    }
  }

  if (!dataLines.length) {
    return
  }

  let payload: unknown
  try {
    payload = JSON.parse(dataLines.join('\n'))
  } catch {
    return
  }

  const event = parseDeviceEvidenceEvent(eventType, payload)
  if (event) {
    onEvent(event)
  }
}

function parseDeviceEvidenceEvent(
  eventType: string,
  payload: unknown
): DeviceEvidenceStreamEvent | null {
  if (eventType === 'device_ingress.attempted' && isAttempt(payload)) {
    return { type: eventType, payload }
  }
  if (eventType === 'device_evidence.updated' && isUpdate(payload)) {
    return { type: eventType, payload }
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIngressKind(value: unknown): value is DeviceIngressAttemptEvent['kind'] {
  return value === 'DEVICE_RESULT' || value === 'DEVICE_EVENT'
}

function isAttempt(value: unknown): value is DeviceIngressAttemptEvent {
  return (
    isRecord(value) &&
    typeof value.request_id === 'string' &&
    isIngressKind(value.kind) &&
    typeof value.disposition === 'string' &&
    typeof value.status_code === 'number' &&
    typeof value.observed_body_bytes === 'number'
  )
}

function isUpdate(value: unknown): value is DeviceEvidenceUpdatedEvent {
  return (
    isRecord(value) &&
    typeof value.evidence_id === 'number' &&
    isIngressKind(value.kind) &&
    typeof value.source_event_id === 'string' &&
    typeof value.device_code === 'string' &&
    typeof value.apply_status === 'string' &&
    typeof value.processed_at === 'string'
  )
}
