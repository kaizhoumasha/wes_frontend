<template>
  <div class="sandbox-action-list">
    <!-- Pending section -->
    <div class="sandbox-action-list__header">
      <span class="sandbox-action-list__title">需人工推进命令</span>
      <span class="sandbox-action-list__count">{{ pendingSessionViews.length }}</span>
      <span
        v-if="actionableCommandCount"
        class="sandbox-action-list__meta"
      >
        {{ actionableCommandCount }} 条可操作
      </span>
    </div>

    <div
      v-if="pendingSessionViews.length"
      class="sandbox-action-list__pending"
    >
      <div
        v-for="sessionView in pendingSessionViews"
        :key="sessionView.key"
        class="sandbox-action-list__pending-session"
      >
        <div class="sandbox-action-list__pending-session-header">
          <RuntimeStatusBadge
            v-if="sessionView.status"
            :status="sessionView.status"
            size="small"
          />
          <div class="sandbox-action-list__pending-session-main">
            <div class="sandbox-action-list__completed-entity">
              <span class="sandbox-action-list__completed-entity-label">
                {{ sessionView.identity.primary.label }}
              </span>
              <span
                class="sandbox-action-list__completed-entity-value"
                :title="sessionView.identity.primary.value"
              >
                {{ sessionView.identity.primary.value }}
              </span>
            </div>
            <div
              v-if="sessionView.identity.summaryFields.length"
              class="sandbox-action-list__completed-summary"
            >
              <span
                v-for="field in sessionView.identity.summaryFields"
                :key="`${sessionView.key}-${field.label}-${field.value}`"
                class="sandbox-action-list__completed-chip"
              >
                <span class="sandbox-action-list__completed-chip-label">{{ field.label }}</span>
                {{ field.value }}
              </span>
            </div>
          </div>
          <span class="sandbox-action-list__pending-session-state">
            {{ sessionView.actionSummary }}
          </span>
        </div>

        <div
          v-if="sessionView.items.length"
          class="sandbox-action-list__items sandbox-action-list__items--nested"
        >
          <div
            v-for="item in sessionView.items"
            :key="item.id"
            class="sandbox-action-list__item"
            :class="{ 'is-history': item.is_current_action === false }"
          >
            <div class="sandbox-action-list__item-info">
              <RuntimeStatusBadge
                :status="item.status ?? 'NEW'"
                size="small"
              />
              <span class="sandbox-action-list__item-key">{{ commandLabel(item) }}</span>
              <span class="sandbox-action-list__item-target">→ {{ item.target_code || '—' }}</span>
            </div>
            <div
              v-if="itemNote(item)"
              class="sandbox-action-list__item-note"
            >
              {{ itemNote(item) }}
              <RouterLink
                v-if="runtimeHoldId(item)"
                class="sandbox-action-list__hold-link"
                :to="{ name: 'RuntimeHoldDetail', params: { holdId: runtimeHoldId(item) } }"
              >
                Runtime Hold #{{ runtimeHoldId(item) }}
              </RouterLink>
            </div>
            <div class="sandbox-action-list__item-action">
              <el-button
                v-if="canAckSandboxOutbox(item)"
                size="small"
                type="warning"
                plain
                :loading="loading === item.id"
                :disabled="disabled"
                :title="disabled ? disabledReason : undefined"
                @click="emit('ack', item)"
              >
                模拟 ACK
              </el-button>
              <el-button
                v-else-if="canSubmitSandboxResult(item)"
                size="small"
                type="success"
                plain
                :loading="loading === item.id"
                :disabled="disabled || isResultSubmitted(item)"
                :title="buttonDisabledReason(item)"
                @click="emit('result', item)"
              >
                模拟 Result
              </el-button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="sandbox-action-list__pending-waiting"
        >
          事件已接收，等待运行时产生下一步命令。
        </div>
      </div>
    </div>

    <div
      v-else
      class="sandbox-action-list__empty"
    >
      暂无需人工推进命令
    </div>

    <!-- Completed section -->
    <template v-if="completedItemsResolved.length">
      <div class="sandbox-action-list__divider" />
      <div class="sandbox-action-list__header">
        <span class="sandbox-action-list__title">历史命令</span>
        <span class="sandbox-action-list__count">{{ completedItemsResolved.length }}</span>
      </div>
      <div class="sandbox-action-list__completed">
        <div
          v-for="sessionView in completedSessionViews"
          :key="`completed-${sessionView.sessionGroup.session.id}`"
          class="sandbox-action-list__completed-session"
        >
          <div
            class="sandbox-action-list__completed-session-header"
            @click="toggleSession(sessionView.sessionGroup.session.id)"
          >
            <svg
              class="sandbox-action-list__completed-chevron"
              :class="{
                'sandbox-action-list__completed-chevron--open': expandedSessions.has(
                  sessionView.sessionGroup.session.id
                )
              }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
            <RuntimeStatusBadge
              :status="sessionView.sessionGroup.session.status"
              size="small"
            />
            <div class="sandbox-action-list__completed-session-main">
              <div class="sandbox-action-list__completed-entity">
                <span class="sandbox-action-list__completed-entity-label">
                  {{ sessionView.identity.primary.label }}
                </span>
                <span
                  class="sandbox-action-list__completed-entity-value"
                  :title="sessionView.identity.primary.value"
                >
                  {{ sessionView.identity.primary.value }}
                </span>
              </div>
              <div
                v-if="sessionView.identity.summaryFields.length"
                class="sandbox-action-list__completed-summary"
              >
                <span
                  v-for="field in sessionView.identity.summaryFields"
                  :key="`${field.label}-${field.value}`"
                  class="sandbox-action-list__completed-chip"
                >
                  <span class="sandbox-action-list__completed-chip-label">{{ field.label }}</span>
                  {{ field.value }}
                </span>
              </div>
            </div>
            <span class="sandbox-action-list__completed-session-count">
              {{ sessionView.sessionGroup.outbox_items.length }} 条命令
            </span>
          </div>
          <div
            v-if="expandedSessions.has(sessionView.sessionGroup.session.id)"
            class="sandbox-action-list__completed-session-body"
          >
            <div
              v-if="sessionView.identity.detailFields.length"
              class="sandbox-action-list__completed-facts"
            >
              <div
                v-for="field in sessionView.identity.detailFields"
                :key="`${field.label}-${field.value}`"
                class="sandbox-action-list__completed-fact"
              >
                <span class="sandbox-action-list__completed-fact-label">{{ field.label }}</span>
                <span class="sandbox-action-list__completed-fact-value">{{ field.value }}</span>
              </div>
            </div>
            <div class="sandbox-action-list__completed-trace">
              <span
                v-for="field in sessionView.identity.traceFields"
                :key="`${field.label}-${field.value}`"
                class="sandbox-action-list__completed-trace-item"
              >
                <span class="sandbox-action-list__completed-trace-label">{{ field.label }}</span>
                {{ field.value }}
              </span>
            </div>
            <div
              v-if="sessionView.sessionGroup.session.event_payload"
              class="sandbox-action-list__completed-session-payload"
            >
              <pre class="sandbox-action-list__payload-json">{{
                formatPayload(sessionView.sessionGroup.session.event_payload)
              }}</pre>
            </div>
            <div class="sandbox-action-list__completed-items">
              <div
                v-for="item in sessionView.sessionGroup.outbox_items"
                :key="`outbox-${item.id}`"
                class="sandbox-action-list__completed-item"
              >
                <span class="sandbox-action-list__completed-item-key">
                  {{ commandLabel(item) }}
                </span>
                <span class="sandbox-action-list__completed-item-target">
                  → {{ item.target_code || '—' }}
                </span>
                <RuntimeStatusBadge
                  :status="item.status ?? 'ACKED'"
                  size="small"
                />
                <span
                  v-if="itemNote(item)"
                  class="sandbox-action-list__completed-item-error"
                >
                  {{ itemNote(item) }}
                  <RouterLink
                    v-if="runtimeHoldId(item)"
                    class="sandbox-action-list__hold-link"
                    :to="{ name: 'RuntimeHoldDetail', params: { holdId: runtimeHoldId(item) } }"
                  >
                    Runtime Hold #{{ runtimeHoldId(item) }}
                  </RouterLink>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type {
  RuntimeTraceListItem,
  SandboxCompletedSession,
  SandboxPendingOutbox
} from '@/types/runtime'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { displayCommand, displaySession } from '@/utils/runtime-display-identity'
import {
  canAckSandboxOutbox,
  canSubmitSandboxResult,
  isCurrentSandboxAction
} from '@/utils/sandbox-outbox'

type SessionIdentityCandidateGroup = [string, ...string[]]

const PRIMARY_IDENTITY_CANDIDATES: SessionIdentityCandidateGroup[] = [
  ['PkgID', 'PkgID', 'pkg_id', 'package_id'],
  ['料箱', 'container_code', 'container_id', 'box_code', 'bin_code'],
  ['货架', 'rack_code', 'rack_id', 'shelf_code', 'shelf_id'],
  ['扫码', 'barcode', 'bar_code', 'scan_code'],
  ['料号', 'HHPN', 'hhpn', 'material_code', 'materialCode'],
  ['厂商料号', 'MfrPN', 'mfrpn', 'manufacturer_part_number']
]

const SUMMARY_IDENTITY_CANDIDATES: SessionIdentityCandidateGroup[] = [
  ['HHPN', 'HHPN', 'hhpn', 'material_code', 'materialCode'],
  ['MfrPN', 'MfrPN', 'mfrpn', 'manufacturer_part_number'],
  ['Qty', 'Qty', 'qty', 'quantity'],
  ['Lot', 'LotCode', 'lot_code', 'lot'],
  ['Date', 'DateCode', 'date_code'],
  ['位置', 'Location', 'location']
]

const DETAIL_IDENTITY_CANDIDATES: SessionIdentityCandidateGroup[] = [
  ['扫码', 'barcode', 'bar_code', 'scan_code'],
  ['料箱', 'container_code', 'container_id', 'box_code', 'bin_code'],
  ['货架', 'rack_code', 'rack_id', 'shelf_code', 'shelf_id']
]

const props = defineProps<{
  items: SandboxPendingOutbox[]
  activeSessions?: RuntimeTraceListItem[]
  completedItems?: SandboxCompletedSession[]
  loading?: number | null
  disabled?: boolean
  disabledReason?: string
  submittedResultOutboxIds?: Set<number>
  submittedResultOutboxKeys?: Set<string>
  submittedResultReason?: string
}>()

const disabled = computed(() => props.disabled === true)
const disabledReason = computed(() => props.disabledReason || '当前状态禁止推进 sandbox 流程。')
const submittedResultReason = computed(
  () => props.submittedResultReason || '该 Result 已提交，正在等待后续编排。'
)

const expandedSessions = ref<Set<number>>(new Set())

function toggleSession(sessionId: number): void {
  const nextExpandedSessions = new Set(expandedSessions.value)
  if (nextExpandedSessions.has(sessionId)) {
    nextExpandedSessions.delete(sessionId)
  } else {
    nextExpandedSessions.add(sessionId)
  }
  expandedSessions.value = nextExpandedSessions
}

const completedItemsResolved = computed(() => props.completedItems ?? [])

interface SessionIdentityField {
  label: string
  value: string
}

interface SessionIdentity {
  primary: SessionIdentityField
  summaryFields: SessionIdentityField[]
  detailFields: SessionIdentityField[]
  traceFields: SessionIdentityField[]
}

interface PendingSessionView {
  key: string
  sessionId: number | null
  status: string | null
  session: RuntimeTraceListItem | null
  items: SandboxPendingOutbox[]
  identity: SessionIdentity
  actionSummary: string
}

const completedSessionViews = computed(() =>
  completedItemsResolved.value.map(sessionGroup => ({
    sessionGroup,
    identity: buildSessionIdentity(sessionGroup)
  }))
)

const activeSessionById = computed(() => {
  const index = new Map<number, RuntimeTraceListItem>()
  for (const session of props.activeSessions ?? []) {
    index.set(session.session_id, session)
  }
  return index
})

const completedItemIndex = computed(() => {
  const outboxIds = new Set<number>()
  const outboxKeys = new Set<string>()
  const sessionIds = new Set<number>()

  for (const sessionGroup of completedItemsResolved.value) {
    sessionIds.add(sessionGroup.session.id)
    for (const item of sessionGroup.outbox_items) {
      outboxIds.add(item.id)
      if (item.dispatch_key) outboxKeys.add(item.dispatch_key)
    }
  }

  return { outboxIds, outboxKeys, sessionIds }
})

const actionableItems = computed(() => {
  const index = completedItemIndex.value
  return props.items.filter(item => {
    if (index.outboxIds.has(item.id)) return false
    if (item.dispatch_key && index.outboxKeys.has(item.dispatch_key)) return false
    if (item.session_id && index.sessionIds.has(item.session_id)) return false
    return true
  })
})

const actionableCommandCount = computed(
  () =>
    actionableItems.value.filter(
      item => isCurrentSandboxAction(item) && item.status !== 'BLOCKED_RESOURCE'
    ).length
)

const pendingSessionViews = computed<PendingSessionView[]>(() => {
  const groups = new Map<
    string,
    {
      key: string
      sessionId: number | null
      session: RuntimeTraceListItem | null
      items: SandboxPendingOutbox[]
    }
  >()

  for (const session of props.activeSessions ?? []) {
    if (isTerminalSession(session.status)) continue
    if (completedItemIndex.value.sessionIds.has(session.session_id)) continue
    const key = pendingSessionKey(session.session_id)
    groups.set(key, {
      key,
      sessionId: session.session_id,
      session,
      items: []
    })
  }

  for (const item of actionableItems.value) {
    const sessionId = item.session_id ?? null
    const key =
      item.history_group_key ??
      (sessionId === null ? pendingOutboxKey(item.id) : pendingSessionKey(sessionId))
    const existing = groups.get(key)
    if (existing) {
      existing.items.push(item)
      continue
    }
    groups.set(key, {
      key,
      sessionId,
      session: sessionId === null ? null : (activeSessionById.value.get(sessionId) ?? null),
      items: [item]
    })
  }

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      status: group.session?.status ?? null,
      identity: buildPendingSessionIdentity(group),
      actionSummary: pendingActionSummary(group)
    }))
    .sort((a, b) => pendingSortValue(b) - pendingSortValue(a))
})

function pendingSessionKey(sessionId: number): string {
  return `session:${sessionId}`
}

function pendingOutboxKey(outboxId: number): string {
  return `outbox:${outboxId}`
}

const emit = defineEmits<{
  ack: [item: SandboxPendingOutbox]
  result: [item: SandboxPendingOutbox]
}>()

function isResultSubmitted(item: SandboxPendingOutbox): boolean {
  if (props.submittedResultOutboxIds?.has(item.id)) return true
  return Boolean(item.dispatch_key && props.submittedResultOutboxKeys?.has(item.dispatch_key))
}

function buttonDisabledReason(item: SandboxPendingOutbox): string | undefined {
  if (disabled.value) return disabledReason.value
  if (isResultSubmitted(item)) return submittedResultReason.value
  return undefined
}

function commandLabel(item: SandboxPendingOutbox): string {
  return displayCommand({
    command_code: null,
    dispatch_key: item.dispatch_key
  })
}

function itemNote(item: SandboxPendingOutbox): string | null {
  const failure = item.failure_summary
  const failureMessage = [failure?.code, failure?.message].filter(Boolean).join(': ')
  if (failureMessage) return failureMessage
  if (item.last_error) return item.last_error
  if (item.status === 'BLOCKED_RESOURCE') return '已停靠，等待设备空闲后自动补发'
  if (!isCurrentSandboxAction(item)) return '历史命令，当前不可操作'
  return null
}

function runtimeHoldId(item: SandboxPendingOutbox): number | null {
  return item.runtime_hold_id ?? item.failure_summary?.runtime_hold_id ?? null
}

function buildPendingSessionIdentity(group: {
  sessionId: number | null
  session: RuntimeTraceListItem | null
}): SessionIdentity {
  const session = group.session
  const sessionLabel = displaySession({
    session_code: session?.session_code,
    session_id: group.sessionId
  })
  const primary = scalarField('业务', session?.business_key) ??
    scalarField('扫码', session?.barcode) ?? { label: '会话', value: sessionLabel }

  const summaryFields = uniqueFields(
    [
      scalarField('会话', sessionLabel),
      scalarField('阶段', session?.plugin_state),
      scalarField('等待', waitTypeLabel(session?.current_wait_type)),
      scalarField('当前命令', session?.command_code),
      scalarField('Trace', session?.trace_id)
    ],
    primary
  ).slice(0, 5)

  return {
    primary,
    summaryFields,
    detailFields: [],
    traceFields: []
  }
}

function waitTypeLabel(waitType: string | null | undefined): string | null {
  if (!waitType) return null
  const typeMap: Record<string, string> = {
    DEVICE_CALLBACK: '设备回调',
    EXTERNAL_API: '外部 API',
    TIMER: '定时器',
    MANUAL: '人工操作'
  }
  return typeMap[waitType] ?? waitType
}

function pendingActionSummary(group: {
  session: RuntimeTraceListItem | null
  items: SandboxPendingOutbox[]
}): string {
  const blockedCount = group.items.filter(item => item.status === 'BLOCKED_RESOURCE').length
  const currentCount = group.items.filter(
    item => isCurrentSandboxAction(item) && item.status !== 'BLOCKED_RESOURCE'
  ).length
  const historyCount = group.items.length - currentCount - blockedCount
  if (blockedCount > 0 && currentCount > 0) return `${currentCount} 可操作 · ${blockedCount} 已停靠`
  if (blockedCount > 0) return `${blockedCount} 已停靠`
  if (currentCount > 0 && historyCount > 0) return `${currentCount} 当前 · ${historyCount} 历史`
  if (currentCount > 0) return `${currentCount} 条命令`
  if (historyCount > 0) return `${historyCount} 条历史`
  const waitLabel = waitTypeLabel(group.session?.current_wait_type)
  if (waitLabel) return `等待${waitLabel}`
  if (group.session?.status === 'NEW' || group.session?.status === 'RUNNING') return '编排中'
  return '暂无命令'
}

function pendingSortValue(sessionView: {
  sessionId: number | null
  items: SandboxPendingOutbox[]
}): number {
  if (sessionView.items.length) return Math.max(...sessionView.items.map(item => item.id))
  return sessionView.sessionId ?? 0
}

function isTerminalSession(status: string | null | undefined): boolean {
  return status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED'
}

function buildSessionIdentity(sessionGroup: SandboxCompletedSession): SessionIdentity {
  const session = sessionGroup.session
  const eventData = extractEventData(session.event_payload)
  const primary = firstField(eventData, PRIMARY_IDENTITY_CANDIDATES) ??
    scalarField('扫码', session.barcode) ??
    scalarField('事件', session.event_type) ?? { label: '记录', value: '—' }

  const summaryFields = uniqueFields(
    [
      scalarField('失败', session.failure_code),
      ...SUMMARY_IDENTITY_CANDIDATES.map(candidate => firstField(eventData, [candidate]))
    ],
    primary
  ).slice(0, 5)

  const detailFields = uniqueFields(
    [
      primary,
      ...summaryFields,
      ...DETAIL_IDENTITY_CANDIDATES.map(candidate => firstField(eventData, [candidate]))
    ],
    null
  )

  const traceFields = [
    scalarField('事件', session.event_type),
    scalarField('业务阶段', session.plugin_state),
    scalarField('失败域', session.failure_domain),
    scalarField('失败原因', session.failure_message),
    scalarField('会话', session.session_code)
  ].filter((field): field is SessionIdentityField => field !== null)

  return {
    primary,
    summaryFields,
    detailFields,
    traceFields
  }
}

function extractEventData(
  payload: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!payload) return {}
  const data = payload.data
  return isRecord(data) ? data : payload
}

function firstField(
  source: Record<string, unknown>,
  candidates: SessionIdentityCandidateGroup[]
): SessionIdentityField | null {
  for (const [label, ...keys] of candidates) {
    for (const key of keys) {
      const value = scalarValue(source[key])
      if (value) return { label, value }
    }
  }
  return null
}

function scalarField(label: string, value: unknown): SessionIdentityField | null {
  const scalar = scalarValue(value)
  return scalar ? { label, value: scalar } : null
}

function scalarValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function uniqueFields(
  fields: Array<SessionIdentityField | null>,
  excluded: SessionIdentityField | null
): SessionIdentityField[] {
  const seen = new Set<string>()
  const result: SessionIdentityField[] = []
  for (const field of fields) {
    if (!field) continue
    if (excluded && field.label === excluded.label && field.value === excluded.value) continue
    const key = `${field.label}:${field.value}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(field)
  }
  return result
}

function formatPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 2)
}
</script>

<style scoped>
.sandbox-action-list__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sandbox-action-list__title {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sandbox-action-list__count {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.sandbox-action-list__meta {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.sandbox-action-list__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sandbox-action-list__pending {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sandbox-action-list__pending-session {
  padding: 10px;
  border: 1px solid rgb(245, 158, 11, 0.1);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__pending-session-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sandbox-action-list__pending-session-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.sandbox-action-list__pending-session-state {
  color: var(--runtime-text-muted);
  font-size: 11px;
  margin-left: auto;
  flex-shrink: 0;
}

.sandbox-action-list__pending-waiting {
  padding: 8px 10px;
  border: 1px dashed var(--runtime-border-neutral);
  border-radius: 6px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.sandbox-action-list__items--nested {
  gap: 5px;
}

.sandbox-action-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__item.is-history {
  border-color: var(--runtime-border-neutral);
  background: var(--runtime-surface);
}

.sandbox-action-list__item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sandbox-action-list__item-key {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__item-target {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.sandbox-action-list__item-note {
  flex-basis: 100%;
  color: var(--runtime-text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.sandbox-action-list__item-action {
  flex-shrink: 0;
}

.sandbox-action-list__empty {
  padding: 16px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  text-align: center;
}

.sandbox-action-list__divider {
  margin: 16px 0;
  border-top: 1px solid rgb(245, 158, 11, 0.1);
}

.sandbox-action-list__completed {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sandbox-action-list__completed-session {
  padding: 10px;
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-session-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.sandbox-action-list__completed-chevron {
  width: 16px;
  height: 16px;
  color: var(--runtime-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sandbox-action-list__completed-chevron--open {
  transform: rotate(90deg);
}

.sandbox-action-list__completed-session-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  flex: 1;
}

.sandbox-action-list__completed-entity {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.sandbox-action-list__completed-entity-label {
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.sandbox-action-list__completed-entity-value {
  min-width: 0;
  overflow: hidden;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.sandbox-action-list__completed-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.08);
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.4;
}

.sandbox-action-list__completed-chip-label {
  color: var(--runtime-text-muted);
  font-family: inherit;
  font-weight: 700;
}

.sandbox-action-list__completed-session-count {
  color: var(--runtime-text-muted);
  font-size: 11px;
  margin-left: auto;
  flex-shrink: 0;
}

.sandbox-action-list__completed-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 8px;
}

.sandbox-action-list__completed-fact {
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__completed-fact-label {
  display: block;
  margin-bottom: 3px;
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 700;
}

.sandbox-action-list__completed-fact-value {
  display: block;
  overflow: hidden;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-trace {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.sandbox-action-list__completed-trace-item {
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 10px;
}

.sandbox-action-list__completed-trace-label {
  margin-right: 4px;
  color: var(--runtime-text-muted);
  font-family: inherit;
  font-weight: 700;
}

.sandbox-action-list__completed-session-payload {
  margin-top: 10px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-session-body {
  margin-top: 10px;
}

.sandbox-action-list__payload-json {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.sandbox-action-list__completed-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sandbox-action-list__completed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  opacity: 0.7;
}

.sandbox-action-list__completed-item-key {
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-item-target {
  color: var(--runtime-text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.sandbox-action-list__completed-item-error {
  min-width: 0;
  overflow: hidden;
  color: var(--runtime-danger, #ef4444);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
