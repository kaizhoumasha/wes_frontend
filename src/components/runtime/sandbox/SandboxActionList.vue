<template>
  <div class="sandbox-action-list">
    <!-- Active Materials -->
    <div class="sandbox-action-list__header">
      <span class="sandbox-action-list__title">在途物料</span>
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
        class="sandbox-action-list__material-card"
      >
        <!-- Material Identity (hero) -->
        <div class="sandbox-action-list__mat-hero">
          <span class="sandbox-action-list__mat-label">
            {{ sessionView.identity.primary.label }}
          </span>
          <span
            class="sandbox-action-list__mat-value"
            :title="sessionView.identity.primary.value"
          >
            {{ sessionView.identity.primary.value }}
          </span>
          <RuntimeStatusBadge
            v-if="sessionView.status"
            :status="sessionView.status"
            size="small"
          />
          <span class="sandbox-action-list__mat-stage">
            <span
              class="sandbox-action-list__mat-stage-dot"
              :class="stageClass(sessionView)"
            />
            {{ sessionView.actionSummary }}
          </span>
        </div>

        <!-- Material Summary -->
        <div
          v-if="sessionView.identity.summaryFields.length"
          class="sandbox-action-list__mat-chips"
        >
          <span
            v-for="field in sessionView.identity.summaryFields"
            :key="`${sessionView.key}-${field.label}-${field.value}`"
            class="sandbox-action-list__mat-chip"
          >
            <span class="sandbox-action-list__mat-chip-label">{{ field.label }}</span>
            {{ field.value }}
          </span>
        </div>

        <div
          v-if="sessionView.intervention"
          class="sandbox-action-list__session-alert"
        >
          <div class="sandbox-action-list__session-alert-head">
            <span class="sandbox-action-list__session-alert-label">异常原因</span>
            <span class="sandbox-action-list__session-alert-code">
              {{ sessionView.intervention.code }}
            </span>
          </div>
          <p class="sandbox-action-list__session-alert-message">
            {{ sessionView.intervention.message }}
          </p>
          <p class="sandbox-action-list__session-alert-action">
            {{ sessionView.intervention.action }}
          </p>
          <div class="sandbox-action-list__session-alert-actions">
            <RouterLink
              v-if="sessionView.intervention.holdRoute"
              class="sandbox-action-list__hold-cta"
              :to="sessionView.intervention.holdRoute"
            >
              {{ sessionView.intervention.holdLabel }}
            </RouterLink>
            <el-button
              v-if="
                sessionView.intervention.canReplay &&
                getLegacyFields(sessionView.session)?.last_inbox_id
              "
              size="small"
              type="danger"
              plain
              data-test="sandbox-replay-inbox"
              :loading="replayLoading === getLegacyFields(sessionView.session)?.last_inbox_id"
              :disabled="replayDisabled"
              :title="replayDisabled ? replayDisabledReason : undefined"
              @click="emit('replay', sessionView.session!)"
            >
              重放 Event
            </el-button>
          </div>
        </div>

        <!-- Flow Steps -->
        <div
          v-if="sessionView.items.length"
          class="sandbox-action-list__flow"
        >
          <template
            v-for="item in sessionView.items"
            :key="item.id"
          >
            <!-- Current actionable -->
            <div
              v-if="isCurrentSandboxAction(item) && item.status !== 'BLOCKED_RESOURCE'"
              class="sandbox-action-list__flow-step is-active"
            >
              <div class="sandbox-action-list__step-info">
                <span class="sandbox-action-list__step-cmd">{{ commandLabel(item) }}</span>
                <span class="sandbox-action-list__step-target">
                  → {{ item.target_code || '—' }}
                </span>
              </div>
              <div
                v-if="itemNote(item)"
                class="sandbox-action-list__step-note"
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
              <div
                v-if="hasCommandEnvelope(item)"
                class="sandbox-action-list__command-payload"
              >
                <div class="sandbox-action-list__command-payload-head">
                  <span>设备实际 Payload</span>
                  <button
                    type="button"
                    class="sandbox-action-list__copy"
                    data-test="copy-command-envelope"
                    @click.stop="copyCommandEnvelope(item)"
                  >
                    复制设备 Payload
                  </button>
                </div>
                <p class="sandbox-action-list__command-payload-hint">
                  仅此 JSON 会下发给设备；Outbox 元数据只用于 WES 派发追踪。
                </p>
                <dl class="sandbox-action-list__command-fields">
                  <template
                    v-for="field in commandEnvelopeFields(item)"
                    :key="`${item.id}-${field.label}`"
                  >
                    <dt>{{ field.label }}</dt>
                    <dd>{{ field.value }}</dd>
                  </template>
                </dl>
                <details class="sandbox-action-list__command-json">
                  <summary>设备 Payload JSON</summary>
                  <pre>{{ commandEnvelopeJson(item) }}</pre>
                </details>
                <details class="sandbox-action-list__command-json">
                  <summary>WES Outbox 元数据</summary>
                  <pre>{{ commandOutboxMetadataJson(item) }}</pre>
                </details>
              </div>
              <div class="sandbox-action-list__step-action">
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
                <el-button
                  v-else-if="canSubmitSandboxExternalCallback(item)"
                  size="small"
                  type="primary"
                  plain
                  :loading="loading === item.id"
                  :disabled="disabled"
                  :title="disabled ? disabledReason : undefined"
                  @click="emit('externalCallback', item)"
                >
                  模拟外部回调
                </el-button>
              </div>
            </div>

            <!-- Blocked -->
            <div
              v-else-if="item.status === 'BLOCKED_RESOURCE'"
              class="sandbox-action-list__flow-step is-blocked"
            >
              <div class="sandbox-action-list__step-info">
                <span class="sandbox-action-list__step-cmd">{{ commandLabel(item) }}</span>
                <span class="sandbox-action-list__step-target">
                  → {{ item.target_code || '—' }}
                </span>
              </div>
              <div
                v-if="hasCommandEnvelope(item)"
                class="sandbox-action-list__command-payload"
              >
                <div class="sandbox-action-list__command-payload-head">
                  <span>设备实际 Payload</span>
                  <button
                    type="button"
                    class="sandbox-action-list__copy"
                    data-test="copy-command-envelope"
                    @click.stop="copyCommandEnvelope(item)"
                  >
                    复制设备 Payload
                  </button>
                </div>
                <p class="sandbox-action-list__command-payload-hint">
                  仅此 JSON 会下发给设备；Outbox 元数据只用于 WES 派发追踪。
                </p>
                <dl class="sandbox-action-list__command-fields">
                  <template
                    v-for="field in commandEnvelopeFields(item)"
                    :key="`${item.id}-${field.label}`"
                  >
                    <dt>{{ field.label }}</dt>
                    <dd>{{ field.value }}</dd>
                  </template>
                </dl>
                <details class="sandbox-action-list__command-json">
                  <summary>设备 Payload JSON</summary>
                  <pre>{{ commandEnvelopeJson(item) }}</pre>
                </details>
                <details class="sandbox-action-list__command-json">
                  <summary>WES Outbox 元数据</summary>
                  <pre>{{ commandOutboxMetadataJson(item) }}</pre>
                </details>
              </div>
              <span class="sandbox-action-list__step-badge">已停靠</span>
            </div>
          </template>

          <!-- History toggle -->
          <template v-if="historyEntriesFor(sessionView).length > 0">
            <button
              type="button"
              class="sandbox-action-list__history-toggle"
              @click="toggleHistory(sessionView.key)"
            >
              <svg
                class="sandbox-action-list__chevron"
                :class="{ 'is-open': expandedHistory.has(sessionView.key) }"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ historyEntriesFor(sessionView).length }} 条历史
            </button>
            <div
              v-if="expandedHistory.has(sessionView.key)"
              class="sandbox-action-list__history-items"
            >
              <template
                v-for="entry in historyEntriesFor(sessionView)"
                :key="entry.key"
              >
                <div
                  v-if="entry.kind === 'command'"
                  class="sandbox-action-list__flow-step is-history"
                >
                  <span class="sandbox-action-list__step-cmd">{{ commandLabel(entry.item) }}</span>
                  <span class="sandbox-action-list__step-target">
                    → {{ entry.item.target_code || '—' }}
                  </span>
                  <div
                    v-if="hasCommandEnvelope(entry.item)"
                    class="sandbox-action-list__command-payload"
                  >
                    <div class="sandbox-action-list__command-payload-head">
                      <span>设备实际 Payload</span>
                      <button
                        type="button"
                        class="sandbox-action-list__copy"
                        data-test="copy-command-envelope"
                        @click.stop="copyCommandEnvelope(entry.item)"
                      >
                        复制设备 Payload
                      </button>
                    </div>
                    <p class="sandbox-action-list__command-payload-hint">
                      仅此 JSON 会下发给设备；Outbox 元数据只用于 WES 派发追踪。
                    </p>
                    <dl class="sandbox-action-list__command-fields">
                      <template
                        v-for="field in commandEnvelopeFields(entry.item)"
                        :key="`${entry.item.id}-${field.label}`"
                      >
                        <dt>{{ field.label }}</dt>
                        <dd>{{ field.value }}</dd>
                      </template>
                    </dl>
                    <details class="sandbox-action-list__command-json">
                      <summary>设备 Payload JSON</summary>
                      <pre>{{ commandEnvelopeJson(entry.item) }}</pre>
                    </details>
                    <details class="sandbox-action-list__command-json">
                      <summary>WES Outbox 元数据</summary>
                      <pre>{{ commandOutboxMetadataJson(entry.item) }}</pre>
                    </details>
                  </div>
                </div>
                <div
                  v-else
                  class="sandbox-action-list__event-step is-history"
                  :class="{ 'has-failure': Boolean(eventIssueText(entry.source)) }"
                >
                  <div class="sandbox-action-list__event-head">
                    <span class="sandbox-action-list__event-label">Event</span>
                    <button
                      type="button"
                      class="sandbox-action-list__copy"
                      data-test="copy-event-envelope"
                      @click.stop="copyEventEnvelope(entry.source)"
                    >
                      复制 JSON
                    </button>
                  </div>
                  <dl class="sandbox-action-list__event-fields">
                    <template
                      v-for="field in eventEnvelopeFields(entry.source)"
                      :key="`${entry.key}-${field.label}`"
                    >
                      <dt>{{ field.label }}</dt>
                      <dd>{{ field.value }}</dd>
                    </template>
                  </dl>
                  <p
                    v-if="eventIssueText(entry.source)"
                    class="sandbox-action-list__event-issue"
                  >
                    {{ eventIssueText(entry.source) }}
                  </p>
                  <details class="sandbox-action-list__event-json">
                    <summary>完整 JSON</summary>
                    <pre>{{ eventEnvelopeJson(entry.source) }}</pre>
                  </details>
                </div>
              </template>
            </div>
          </template>
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
      暂无在途物料
    </div>

    <!-- Completed Materials -->
    <template v-if="completedItemsResolved.length">
      <div class="sandbox-action-list__divider" />
      <div class="sandbox-action-list__header">
        <span class="sandbox-action-list__title">已完成</span>
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
            <RuntimeStatusBadge
              :status="sessionView.sessionGroup.session.status"
              size="small"
            />
            <span class="sandbox-action-list__completed-session-count">
              {{ sessionView.deviceGroups.devices.length }} 台设备
              <span v-if="sessionView.deviceGroups.externals.length">
                · {{ sessionView.deviceGroups.externals.length }} 外部
              </span>
            </span>
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
              v-if="completedHistoryEntries(sessionView).length"
              class="sandbox-action-list__history-items"
            >
              <template
                v-for="entry in completedHistoryEntries(sessionView)"
                :key="entry.key"
              >
                <div
                  v-if="entry.kind === 'command'"
                  class="sandbox-action-list__flow-step is-history"
                  :class="{
                    'is-failed': entry.item.status === 'FAILED' || entry.item.status === 'CANCELLED'
                  }"
                >
                  <span class="sandbox-action-list__step-cmd">{{ commandLabel(entry.item) }}</span>
                  <span class="sandbox-action-list__step-target">
                    → {{ entry.item.target_code || '—' }}
                  </span>
                  <RuntimeStatusBadge
                    :status="entry.item.status ?? 'ACKED'"
                    size="small"
                  />
                  <span
                    v-if="itemNote(entry.item)"
                    class="sandbox-action-list__step-note"
                  >
                    {{ itemNote(entry.item) }}
                    <RouterLink
                      v-if="runtimeHoldId(entry.item)"
                      class="sandbox-action-list__hold-link"
                      :to="{
                        name: 'RuntimeHoldDetail',
                        params: { holdId: runtimeHoldId(entry.item) }
                      }"
                    >
                      Runtime Hold #{{ runtimeHoldId(entry.item) }}
                    </RouterLink>
                  </span>
                  <div
                    v-if="hasCommandEnvelope(entry.item)"
                    class="sandbox-action-list__command-payload"
                  >
                    <div class="sandbox-action-list__command-payload-head">
                      <span>设备实际 Payload</span>
                      <button
                        type="button"
                        class="sandbox-action-list__copy"
                        data-test="copy-command-envelope"
                        @click.stop="copyCommandEnvelope(entry.item)"
                      >
                        复制设备 Payload
                      </button>
                    </div>
                    <p class="sandbox-action-list__command-payload-hint">
                      仅此 JSON 会下发给设备；Outbox 元数据只用于 WES 派发追踪。
                    </p>
                    <dl class="sandbox-action-list__command-fields">
                      <template
                        v-for="field in commandEnvelopeFields(entry.item)"
                        :key="`${entry.item.id}-${field.label}`"
                      >
                        <dt>{{ field.label }}</dt>
                        <dd>{{ field.value }}</dd>
                      </template>
                    </dl>
                    <details class="sandbox-action-list__command-json">
                      <summary>设备 Payload JSON</summary>
                      <pre>{{ commandEnvelopeJson(entry.item) }}</pre>
                    </details>
                    <details class="sandbox-action-list__command-json">
                      <summary>WES Outbox 元数据</summary>
                      <pre>{{ commandOutboxMetadataJson(entry.item) }}</pre>
                    </details>
                  </div>
                </div>
                <div
                  v-else
                  class="sandbox-action-list__event-step is-history"
                  :class="{ 'has-failure': Boolean(eventIssueText(entry.source)) }"
                >
                  <div class="sandbox-action-list__event-head">
                    <span class="sandbox-action-list__event-label">Event</span>
                    <button
                      type="button"
                      class="sandbox-action-list__copy"
                      data-test="copy-event-envelope"
                      @click.stop="copyEventEnvelope(entry.source)"
                    >
                      复制 JSON
                    </button>
                  </div>
                  <dl class="sandbox-action-list__event-fields">
                    <template
                      v-for="field in eventEnvelopeFields(entry.source)"
                      :key="`${entry.key}-${field.label}`"
                    >
                      <dt>{{ field.label }}</dt>
                      <dd>{{ field.value }}</dd>
                    </template>
                  </dl>
                  <p
                    v-if="eventIssueText(entry.source)"
                    class="sandbox-action-list__event-issue"
                  >
                    {{ eventIssueText(entry.source) }}
                  </p>
                  <details class="sandbox-action-list__event-json">
                    <summary>完整 JSON</summary>
                    <pre>{{ eventEnvelopeJson(entry.source) }}</pre>
                  </details>
                </div>
              </template>
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
import { ElMessage } from 'element-plus'
import type {
  RuntimeMonitorSessionItem,
  RuntimeMonitorTraceItem,
  SandboxCompletedSession,
  SandboxPendingOutbox
} from '@/types/runtime'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { resolveRuntimeProgressLabel } from '@/utils/runtime-display'
import { displayCommand, displaySession } from '@/utils/runtime-display-identity'
import {
  canAckSandboxOutbox,
  canSubmitSandboxExternalCallback,
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
  activeSessions?: (RuntimeMonitorSessionItem | RuntimeMonitorTraceItem)[]
  completedItems?: SandboxCompletedSession[]
  loading?: number | null
  disabled?: boolean
  disabledReason?: string
  replayDisabled?: boolean
  replayDisabledReason?: string
  submittedResultOutboxIds?: Set<number>
  submittedResultOutboxKeys?: Set<string>
  submittedResultReason?: string
  replayLoading?: number | null
  runtimeHoldIds?: number[]
}>()

const disabled = computed(() => props.disabled === true)
const disabledReason = computed(() => props.disabledReason || '当前状态禁止推进 sandbox 流程。')
const replayDisabled = computed(() => props.replayDisabled ?? disabled.value)
const replayDisabledReason = computed(() => props.replayDisabledReason || disabledReason.value)
const submittedResultReason = computed(
  () => props.submittedResultReason || '该 Result 已提交，正在等待后续编排。'
)

interface LegacySessionFields {
  business_key?: string | null
  command_code?: string | null
  current_wait_type?: string | null
  last_inbox_id?: number | null
}

function getLegacyFields(session: unknown): LegacySessionFields {
  return (session || {}) as LegacySessionFields
}

const expandedSessions = ref<Set<number>>(new Set())
const expandedHistory = ref<Set<string>>(new Set())

function toggleSession(sessionId: number): void {
  const next = new Set(expandedSessions.value)
  if (next.has(sessionId)) {
    next.delete(sessionId)
  } else {
    next.add(sessionId)
  }
  expandedSessions.value = next
}

function toggleHistory(key: string): void {
  const next = new Set(expandedHistory.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedHistory.value = next
}

function historyItemsFor(view: { items: SandboxPendingOutbox[] }): SandboxPendingOutbox[] {
  return view.items.filter(
    item => !isCurrentSandboxAction(item) && item.status !== 'BLOCKED_RESOURCE'
  )
}

function historyEntriesFor(view: {
  key: string
  session: RuntimeEventSource | null
  items: SandboxPendingOutbox[]
}): SandboxHistoryEntry[] {
  return sortHistoryEntries([
    ...historyItemsFor(view).map(commandHistoryEntry),
    ...eventHistoryEntry(view.session, `${view.key}:event`)
  ])
}

function completedHistoryEntries(view: {
  sessionGroup: SandboxCompletedSession
}): SandboxHistoryEntry[] {
  return sortHistoryEntries([
    ...view.sessionGroup.outbox_items.map(commandHistoryEntry),
    ...eventHistoryEntry(
      view.sessionGroup.session,
      `completed:${view.sessionGroup.session.id}:event`
    )
  ])
}

function commandHistoryEntry(item: SandboxPendingOutbox): CommandHistoryEntry {
  return {
    kind: 'command',
    key: `command:${item.id}`,
    item,
    sortValue: item.id
  }
}

function eventHistoryEntry(source: RuntimeEventSource | null, key: string): EventHistoryEntry[] {
  if (!source || !hasEventEnvelope(source)) return []
  return [
    {
      kind: 'event',
      key,
      source,
      sortValue: 0
    }
  ]
}

function sortHistoryEntries(entries: SandboxHistoryEntry[]): SandboxHistoryEntry[] {
  return [...entries].sort((a, b) => b.sortValue - a.sortValue)
}

function stageClass(view: { items: SandboxPendingOutbox[] }): string {
  const hasAckable = view.items.some(item => canAckSandboxOutbox(item))
  const hasResultable = view.items.some(item => canSubmitSandboxResult(item))
  const hasExternalCallback = view.items.some(item => canSubmitSandboxExternalCallback(item))
  const hasBlocked = view.items.some(item => item.status === 'BLOCKED_RESOURCE')
  if (hasExternalCallback) return 'is-result'
  if (hasResultable) return 'is-result'
  if (hasAckable) return 'is-ack'
  if (hasBlocked) return 'is-blocked'
  return 'is-idle'
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
  session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem | null
  items: SandboxPendingOutbox[]
  identity: SessionIdentity
  intervention: SessionIntervention | null
  actionSummary: string
}

interface SessionIntervention {
  code: string
  message: string
  action: string
  canReplay: boolean
  holdRoute: RuntimeHoldRoute | null
  holdLabel: string
}

interface CommandEnvelopeField {
  label: string
  value: string
}

interface EventEnvelopeField {
  label: string
  value: string
}

interface RuntimeEventSource {
  event_type?: string | null
  event_payload?: Record<string, unknown> | null
  device_code?: string | null
  business_key?: string | null
  last_inbox_id?: number | null
  failure_code?: string | null
  failure_message?: string | null
  latest_timeline_message?: string | null
}

interface CommandHistoryEntry {
  kind: 'command'
  key: string
  item: SandboxPendingOutbox
  sortValue: number
}

interface EventHistoryEntry {
  kind: 'event'
  key: string
  source: RuntimeEventSource
  sortValue: number
}

type SandboxHistoryEntry = CommandHistoryEntry | EventHistoryEntry
type RuntimeHoldRoute =
  | { name: 'RuntimeHoldDetail'; params: { holdId: number } }
  | {
      name: 'RuntimeHolds'
      query: {
        worklineId?: string
        sessionId?: string
        status?: string
      }
    }

const EVENT_RUNTIME_META_KEYS = new Set([
  'replay_of_event_id',
  'replay_reason',
  'replay_operator_id'
])

const runtimeHoldIdsResolved = computed(() => props.runtimeHoldIds ?? [])

const completedSessionViews = computed(() =>
  completedItemsResolved.value.map(sessionGroup => ({
    sessionGroup,
    identity: buildSessionIdentity(sessionGroup),
    deviceGroups: groupItemsByDevice(sessionGroup.outbox_items)
  }))
)

/** 判断 outbox item 是否指向外部服务（非设备） */
function isExternalTarget(item: SandboxPendingOutbox): boolean {
  const t = item.target_type?.toUpperCase()
  return t === 'HTTP_ENDPOINT' || t === 'INTERNAL_SERVICE'
}

interface CompletedDeviceGroup {
  targetCode: string
  items: SandboxPendingOutbox[]
  hasFailure: boolean
}

interface CompletedSessionGroups {
  devices: CompletedDeviceGroup[]
  externals: CompletedDeviceGroup[]
}

/**
 * 将单个 completed session 的 outbox_items 按 target_type 分为设备/外部请求两组，
 * 再在各自组内按 target_code 聚合。
 */
function groupItemsByDevice(items: SandboxPendingOutbox[]): CompletedSessionGroups {
  const deviceMap = new Map<string, SandboxPendingOutbox[]>()
  const externalMap = new Map<string, SandboxPendingOutbox[]>()

  for (const item of items) {
    if (isExternalTarget(item)) {
      const key = item.target_code || '__unknown__'
      if (!externalMap.has(key)) externalMap.set(key, [])
      externalMap.get(key)!.push(item)
    } else {
      const key = item.target_code || '__unknown__'
      if (!deviceMap.has(key)) deviceMap.set(key, [])
      deviceMap.get(key)!.push(item)
    }
  }

  const makeGroups = (map: Map<string, SandboxPendingOutbox[]>) =>
    Array.from(map.entries()).map(([targetCode, groupItems]) => ({
      targetCode,
      items: groupItems,
      hasFailure: groupItems.some(i => i.status === 'FAILED' || i.status === 'CANCELLED')
    }))

  return {
    devices: makeGroups(deviceMap),
    externals: makeGroups(externalMap)
  }
}

const activeSessionById = computed(() => {
  const index = new Map<number, RuntimeMonitorSessionItem | RuntimeMonitorTraceItem>()
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
      session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem | null
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
      intervention: buildPendingSessionIntervention(group.session),
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
  externalCallback: [item: SandboxPendingOutbox]
  replay: [session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem]
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

function commandPayload(item: SandboxPendingOutbox): Record<string, unknown> {
  return isRecord(item.payload_json) ? item.payload_json : {}
}

function hasCommandEnvelope(item: SandboxPendingOutbox): boolean {
  const payload = commandPayload(item)
  return item.dispatch_type === 'DEVICE_COMMAND' || scalarValue(payload.command_code) !== null
}

function commandEnvelopeFields(item: SandboxPendingOutbox): CommandEnvelopeField[] {
  const payload = commandPayload(item)
  return [
    { label: 'command_code', value: scalarValue(payload.command_code) },
    {
      label: 'task_type',
      value: scalarValue(payload.task_type ?? payload.command_type ?? payload.action)
    },
    { label: 'device_code', value: scalarValue(payload.device_code) },
    { label: 'priority', value: scalarValue(payload.priority) },
    { label: 'timeout', value: scalarValue(payload.timeout) },
    { label: 'params', value: commandParamsSummary(payload) }
  ].filter((field): field is CommandEnvelopeField => field.value !== null)
}

function commandParamsSummary(payload: Record<string, unknown>): string | null {
  const params = payload.params ?? payload.data
  return compactJsonValue(params)
}

function compactJsonValue(value: unknown): string | null {
  if (isRecord(value) || Array.isArray(value)) return JSON.stringify(value)
  return scalarValue(value)
}

function commandEnvelopeJson(item: SandboxPendingOutbox): string {
  return formatPayload(commandPayload(item))
}

function commandOutboxMetadataJson(item: SandboxPendingOutbox): string {
  return formatPayload({
    dispatch_key: item.dispatch_key ?? null,
    dispatch_type: item.dispatch_type ?? null,
    target_type: item.target_type ?? null,
    target_code: item.target_code ?? null,
    status: item.status ?? null,
    session_id: item.session_id ?? null
  })
}

async function copyCommandEnvelope(item: SandboxPendingOutbox): Promise<void> {
  try {
    await navigator.clipboard.writeText(commandEnvelopeJson(item))
    ElMessage.success('设备 Payload 已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制设备 Payload')
  }
}

function eventPayload(source: RuntimeEventSource | null): Record<string, unknown> {
  return source && isRecord(source.event_payload) ? source.event_payload : {}
}

function originalEventPayload(source: RuntimeEventSource | null): Record<string, unknown> {
  const payload = eventPayload(source)
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !EVENT_RUNTIME_META_KEYS.has(key))
  )
}

function eventType(source: RuntimeEventSource | null): string | null {
  const payload = eventPayload(source)
  return scalarValue(source?.event_type ?? payload.canonical_event_type ?? payload.event_type)
}

function hasEventEnvelope(source: RuntimeEventSource | null): boolean {
  return Boolean(eventType(source) || Object.keys(eventPayload(source)).length)
}

function eventEnvelopeFields(source: RuntimeEventSource | null): EventEnvelopeField[] {
  const payload = eventPayload(source)
  return [
    { label: 'event_type', value: eventType(source) },
    { label: 'device_code', value: scalarValue(payload.device_code ?? source?.device_code) },
    { label: 'business_key', value: scalarValue(source?.business_key) },
    { label: 'inbox_id', value: scalarValue(source?.last_inbox_id) },
    { label: 'data', value: compactJsonValue(payload.data ?? payload.params) }
  ].filter((field): field is EventEnvelopeField => field.value !== null)
}

function eventEnvelopeJson(source: RuntimeEventSource | null): string {
  return formatPayload(originalEventPayload(source))
}

async function copyEventEnvelope(source: RuntimeEventSource | null): Promise<void> {
  try {
    await navigator.clipboard.writeText(eventEnvelopeJson(source))
    ElMessage.success('Event JSON 已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制完整 JSON')
  }
}

function eventIssueText(source: RuntimeEventSource | null): string | null {
  if (!source?.failure_code) return null
  return [source.failure_code, source.latest_timeline_message ?? source.failure_message]
    .filter(Boolean)
    .join(': ')
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
  session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem | null
}): SessionIdentity {
  const session = group.session
  const sessionLabel = displaySession({
    session_code: session?.session_code,
    session_id: group.sessionId
  })
  const primary = scalarField('业务', getLegacyFields(session).business_key) ??
    scalarField('扫码', session?.barcode) ?? { label: '会话', value: sessionLabel }

  const summaryFields = uniqueFields(
    [
      scalarField('会话', sessionLabel),
      scalarField('进度', session ? resolveRuntimeProgressLabel(session) : null),
      scalarField('失败', session?.failure_code),
      scalarField('等待', waitTypeLabel(getLegacyFields(session).current_wait_type)),
      scalarField('当前命令', getLegacyFields(session).command_code),
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

function buildPendingSessionIntervention(
  session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem | null
): SessionIntervention | null {
  if (!session) return null
  if (session.failure_code) {
    const message = session.latest_timeline_message || session.failure_code
    return {
      code: session.failure_code,
      message,
      action:
        session.failure_code === 'PAYLOAD_INVALID'
          ? '请修正 Event payload 后重新发送。'
          : '请打开 Trace 查看异常详情，确认后重新发送或人工处置。',
      canReplay: session.failure_code === 'PAYLOAD_INVALID',
      holdRoute: null,
      holdLabel: ''
    }
  }
  if (session.status !== 'MANUAL_HOLD') return null
  const message = session.latest_timeline_message || session.failure_code
  return {
    code: 'MANUAL_HOLD',
    message: message || '当前会话已进入人工挂起。',
    action: '请前往 Hold 处置页确认现场状态并解除阻断。',
    canReplay: false,
    holdRoute: runtimeHoldRoute(session),
    holdLabel: runtimeHoldLinkLabel()
  }
}

function runtimeHoldRoute(
  session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem
): RuntimeHoldRoute {
  const runtimeHoldIds = runtimeHoldIdsResolved.value
  if (runtimeHoldIds.length === 1) {
    return { name: 'RuntimeHoldDetail', params: { holdId: runtimeHoldIds[0] } }
  }
  return {
    name: 'RuntimeHolds',
    query: {
      worklineId: String(session.workline_id),
      sessionId: String(session.session_id),
      status: 'OPEN'
    }
  }
}

function runtimeHoldLinkLabel(): string {
  const runtimeHoldIds = runtimeHoldIdsResolved.value
  if (runtimeHoldIds.length === 1) return `Runtime Hold #${runtimeHoldIds[0]}`
  return '打开 Hold 处置'
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
  session: RuntimeMonitorSessionItem | RuntimeMonitorTraceItem | null
  items: SandboxPendingOutbox[]
}): string {
  const blockedCount = group.items.filter(item => item.status === 'BLOCKED_RESOURCE').length
  const currentCount = group.items.filter(
    item => isCurrentSandboxAction(item) && item.status !== 'BLOCKED_RESOURCE'
  ).length
  const eventCount = hasEventEnvelope(group.session) ? 1 : 0
  const historyCount = group.items.length - currentCount - blockedCount + eventCount
  if (blockedCount > 0 && currentCount > 0) return `${currentCount} 可操作 · ${blockedCount} 已停靠`
  if (blockedCount > 0) return `${blockedCount} 已停靠`
  if (currentCount > 0 && historyCount > 0) return `${currentCount} 当前 · ${historyCount} 历史`
  if (currentCount > 0) return `${currentCount} 条命令`
  if (historyCount > 0) return `${historyCount} 条历史`
  if (group.session?.failure_code) return '需处理异常'
  const waitLabel = waitTypeLabel(getLegacyFields(group.session).current_wait_type)
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
    scalarField('进度', completedSessionProgress(session)),
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

function completedSessionProgress(session: SandboxCompletedSession['session']): string | null {
  return session.event_type || session.status || null
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

.sandbox-action-list__pending {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== Material Card ===== */
.sandbox-action-list__material-card {
  padding: 12px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__mat-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.sandbox-action-list__mat-label {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.sandbox-action-list__mat-value {
  min-width: 0;
  overflow: hidden;
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__mat-stage {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  flex-shrink: 0;
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.sandbox-action-list__mat-stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #475569;
}

.sandbox-action-list__mat-stage-dot.is-ack {
  background: #eab308;
  box-shadow: 0 0 6px rgb(234, 179, 8, 0.4);
}

.sandbox-action-list__mat-stage-dot.is-result {
  background: #06b6d4;
  box-shadow: 0 0 6px rgb(6, 182, 212, 0.4);
}

.sandbox-action-list__mat-stage-dot.is-blocked {
  background: #ef4444;
}

.sandbox-action-list__mat-stage-dot.is-idle {
  background: #3b82f6;
}

/* Summary chips */
.sandbox-action-list__mat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.sandbox-action-list__mat-chip {
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

.sandbox-action-list__mat-chip-label {
  color: var(--runtime-text-muted);
  font-family: inherit;
  font-weight: 700;
}

.sandbox-action-list__session-alert {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid rgb(239, 68, 68, 0.2);
  border-radius: 8px;
  background: rgb(239, 68, 68, 0.06);
  color: var(--runtime-text-secondary);
}

.sandbox-action-list__session-alert-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sandbox-action-list__session-alert-label {
  color: #fecaca;
  font-size: 10px;
  font-weight: 700;
}

.sandbox-action-list__session-alert-code {
  min-width: 0;
  color: #fca5a5;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.sandbox-action-list__session-alert-message,
.sandbox-action-list__session-alert-action {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.sandbox-action-list__session-alert-action {
  color: var(--runtime-text-muted);
}

.sandbox-action-list__session-alert-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}

.sandbox-action-list__hold-cta {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(6, 182, 212, 0.24);
  border-radius: 6px;
  background: rgb(6, 182, 212, 0.1);
  color: #67e8f9;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
}

.sandbox-action-list__hold-cta:hover {
  border-color: rgb(6, 182, 212, 0.42);
  background: rgb(6, 182, 212, 0.16);
}

/* ===== Flow Steps ===== */
.sandbox-action-list__flow {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sandbox-action-list__event-step {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin-bottom: 8px;
  padding: 9px 10px;
  border: 1px solid rgb(34, 197, 94, 0.18);
  border-radius: 8px;
  background: rgb(34, 197, 94, 0.045);
}

.sandbox-action-list__event-step.has-failure {
  border-color: rgb(239, 68, 68, 0.24);
  background: rgb(239, 68, 68, 0.055);
}

.sandbox-action-list__event-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sandbox-action-list__event-label {
  color: #bbf7d0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
}

.sandbox-action-list__event-fields {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
}

.sandbox-action-list__event-fields dt {
  color: var(--runtime-text-muted);
  font-weight: 700;
}

.sandbox-action-list__event-fields dd {
  min-width: 0;
  margin: 0;
  color: var(--runtime-text-secondary);
  overflow-wrap: anywhere;
}

.sandbox-action-list__event-issue {
  margin: 0;
  color: var(--runtime-danger, #ef4444);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.sandbox-action-list__event-json {
  min-width: 0;
  color: var(--runtime-text-muted);
  font-size: 10px;
}

.sandbox-action-list__event-json summary {
  cursor: pointer;
}

.sandbox-action-list__event-json pre {
  max-height: 160px;
  margin: 6px 0 0;
  padding: 8px;
  overflow: auto;
  border-radius: 6px;
  background: rgb(15, 23, 42, 0.72);
  color: #dcfce7;
}

.sandbox-action-list__command-payload {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin-top: 6px;
  padding: 8px;
  border: 1px solid rgb(59, 130, 246, 0.15);
  border-radius: 6px;
  background: rgb(59, 130, 246, 0.04);
}

.sandbox-action-list__flow-step.is-history .sandbox-action-list__command-payload,
.sandbox-action-list__completed-item .sandbox-action-list__command-payload {
  flex-basis: 100%;
  width: 100%;
}

.sandbox-action-list__command-payload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #bfdbfe;
  font-size: 10px;
  font-weight: 700;
}

.sandbox-action-list__command-payload-hint {
  margin: 0;
  color: var(--runtime-text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.sandbox-action-list__copy {
  flex: 0 0 auto;
  padding: 2px 6px;
  border: 1px solid rgb(147, 197, 253, 0.3);
  border-radius: 5px;
  background: rgb(147, 197, 253, 0.08);
  color: #bfdbfe;
  cursor: pointer;
  font-size: 10px;
  line-height: 1.4;
}

.sandbox-action-list__copy:hover {
  border-color: rgb(147, 197, 253, 0.5);
  background: rgb(147, 197, 253, 0.14);
}

.sandbox-action-list__command-fields {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
}

.sandbox-action-list__command-fields dt {
  color: var(--runtime-text-muted);
  font-weight: 700;
}

.sandbox-action-list__command-fields dd {
  min-width: 0;
  margin: 0;
  color: var(--runtime-text-secondary);
  overflow-wrap: anywhere;
}

.sandbox-action-list__command-json {
  min-width: 0;
  color: var(--runtime-text-muted);
  font-size: 10px;
}

.sandbox-action-list__command-json summary {
  cursor: pointer;
}

.sandbox-action-list__command-json pre {
  max-height: 160px;
  margin: 6px 0 0;
  padding: 8px;
  overflow: auto;
  border-radius: 6px;
  background: rgb(15, 23, 42, 0.72);
  color: #dbeafe;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.sandbox-action-list__flow-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__flow-step.is-active {
  border-color: rgb(245, 158, 11, 0.18);
  background: rgb(245, 158, 11, 0.04);
}

.sandbox-action-list__flow-step.is-blocked {
  border-color: rgb(239, 68, 68, 0.15);
  opacity: 0.75;
}

.sandbox-action-list__flow-step.is-history {
  border-color: transparent;
  background: transparent;
  padding: 3px 10px;
  opacity: 0.5;
}

.sandbox-action-list__step-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sandbox-action-list__step-cmd {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__step-target {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.sandbox-action-list__step-note {
  flex-basis: 100%;
  color: var(--runtime-text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.sandbox-action-list__step-action {
  flex-shrink: 0;
}

.sandbox-action-list__step-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 10px;
  font-weight: 600;
}

/* ===== History Toggle ===== */
.sandbox-action-list__history-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--runtime-text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: color 0.15s;
}

.sandbox-action-list__history-toggle:hover {
  color: var(--runtime-text-secondary);
}

.sandbox-action-list__chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.sandbox-action-list__chevron.is-open {
  transform: rotate(90deg);
}

.sandbox-action-list__history-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ===== Shared ===== */
.sandbox-action-list__pending-waiting {
  padding: 8px 10px;
  border: 1px dashed var(--runtime-border-neutral);
  border-radius: 6px;
  color: var(--runtime-text-muted);
  font-size: 12px;
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

.sandbox-action-list__hold-link {
  color: #06b6d4;
  font-weight: 600;
}

/* ===== Completed Section ===== */
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
  flex-wrap: wrap;
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

/* ===== Device Groups (within completed session) ===== */
.sandbox-action-list__completed-device-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sandbox-action-list__completed-device-group {
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
  overflow: hidden;
}

.sandbox-action-list__completed-device-group:has(.has-failure) {
  border-color: rgb(239, 68, 68, 0.2);
}

.sandbox-action-list__completed-device-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: rgb(245, 158, 11, 0.04);
  border-bottom: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-device-header.has-failure {
  background: rgb(239, 68, 68, 0.06);
}

.sandbox-action-list__completed-device-identity {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sandbox-action-list__completed-device-icon {
  width: 14px;
  height: 14px;
  color: var(--runtime-text-muted);
  flex-shrink: 0;
}

.has-failure .sandbox-action-list__completed-device-icon {
  color: #ef4444;
}

.sandbox-action-list__completed-device-name {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-device-count {
  color: var(--runtime-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
}

.sandbox-action-list__completed-device-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(239, 68, 68, 0.12);
  color: #ef4444;
  flex-shrink: 0;
}

.sandbox-action-list__completed-device-badge svg {
  width: 12px;
  height: 12px;
}

.sandbox-action-list__completed-device-commands {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
}

.sandbox-action-list__completed-item.is-failed {
  border-left: 2px solid rgb(239, 68, 68, 0.4);
  background: rgb(239, 68, 68, 0.04);
  opacity: 1;
}

/* ===== External Requests ===== */
.sandbox-action-list__completed-external-label {
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
  padding-left: 4px;
}

.sandbox-action-list__completed-device-group.is-external {
  border-color: rgb(59, 130, 246, 0.15);
}

.sandbox-action-list__completed-device-group.is-external
  .sandbox-action-list__completed-device-header {
  background: rgb(59, 130, 246, 0.04);
}

.sandbox-action-list__completed-device-group.is-external
  .sandbox-action-list__completed-device-icon {
  color: #3b82f6;
}

.sandbox-action-list__completed-device-group.is-external.has-failure {
  border-color: rgb(239, 68, 68, 0.2);
}

.sandbox-action-list__completed-device-group.is-external.has-failure
  .sandbox-action-list__completed-device-header {
  background: rgb(239, 68, 68, 0.06);
}
</style>
