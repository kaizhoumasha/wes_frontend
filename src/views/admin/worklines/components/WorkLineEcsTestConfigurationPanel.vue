<script setup lang="ts">
import { computed, h, inject, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import {
  devicesApiMethods,
  type DevicesItem,
  type EcsTestDefaultResult
} from '@/api/modules/devices'
import { workLinesApiMethods, type WorkLinesItem as Workline } from '@/api/modules/workLines'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'
import { fetchWorkLineDevices } from './fetchWorkLineDevices'

type EcsTestRule = {
  source_device_code: string
  target_device_code: string
  task_type: string
  params: Record<string, unknown>
  [key: string]: unknown
}
type DeviceEcsTestDefault = NonNullable<EcsTestDefaultResult['default']>

const forbiddenParamKeys = new Set([
  'axis',
  'coordinate',
  'coordinates',
  'joint',
  'joint_angle',
  'plc',
  'plc_address',
  'plc_point',
  'safety_loop',
  'speed',
  'velocity',
  'x_coord',
  'y_coord'
])

const props = defineProps<{ workline: Pick<Workline, 'id'> | null }>()
const modelValue = defineModel<boolean>({ default: false })
const { hasPermission } = usePermission()
const refresh = inject(CRUD_PAGE_REFRESH_KEY, undefined)
const currentWorkline = ref<Workline | null>(null)
const devices = ref<DevicesItem[]>([])
const rules = ref<EcsTestRule[]>([])
const sourceDeviceCode = ref('')
const targetDeviceCode = ref('')
const taskType = ref('')
const paramsText = ref('{}')
const savedDeviceDefault = ref<DeviceEcsTestDefault | null>(null)
const savedDraft = ref('')
const loadError = ref('')
const rulesError = ref('')
const defaultError = ref('')
const actionError = ref('')
const loading = ref(false)
const defaultLoading = ref(false)
const savingDefault = ref(false)
const clearingDefault = ref(false)
const removingRule = ref('')
const submitting = ref(false)
let loadSequence = 0
let sourceSequence = 0

const canReadDefault = computed(() => hasPermission(BIZ_PERMISSIONS.device.detail))
const canSaveDefault = computed(() => hasPermission(BIZ_PERMISSIONS.device.update))
const canUpdateWorkline = computed(() => hasPermission(BIZ_PERMISSIONS.workline.update))
const busy = computed(
  () =>
    loading.value ||
    defaultLoading.value ||
    savingDefault.value ||
    clearingDefault.value ||
    Boolean(removingRule.value) ||
    submitting.value
)
const paramsValue = computed<Record<string, unknown> | null>(() => {
  try {
    const parsed: unknown = JSON.parse(paramsText.value)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
})
const paramsError = computed(() => {
  if (paramsValue.value === null) return 'params 必须是合法的 JSON 对象（可使用 {}）'
  return findParamsValidationError(paramsValue.value) ?? ''
})
const taskTypeError = computed(() =>
  taskType.value.trim().length > 100 ? 'task_type 不能超过 100 个字符' : ''
)
const targetDeviceCodeError = computed(() =>
  targetDeviceCode.value.trim().length > 100 ? 'target_device_code 不能超过 100 个字符' : ''
)
const editorSnapshot = computed(() =>
  JSON.stringify({
    sourceDeviceCode: sourceDeviceCode.value,
    targetDeviceCode: targetDeviceCode.value,
    taskType: taskType.value,
    paramsText: paramsText.value
  })
)
const draftRule = computed<EcsTestRule | null>(() => {
  const params = paramsValue.value
  if (
    !sourceDeviceCode.value ||
    !targetDeviceCode.value.trim() ||
    !taskType.value.trim() ||
    params === null ||
    paramsError.value ||
    taskTypeError.value ||
    targetDeviceCodeError.value
  )
    return null
  return {
    source_device_code: sourceDeviceCode.value,
    target_device_code: targetDeviceCode.value.trim(),
    task_type: taskType.value.trim(),
    params
  }
})
const nextRules = computed<EcsTestRule[] | null>(() => {
  const draft = draftRule.value
  if (!draft) return null
  const index = rules.value.findIndex(rule => rule.source_device_code === draft.source_device_code)
  return index < 0
    ? [...rules.value, draft]
    : rules.value.map((rule, position) => (position === index ? draft : rule))
})
const nextRulesError = computed(() => {
  for (const rule of nextRules.value ?? []) {
    if (!rule.task_type.trim()) return `${rule.source_device_code} 的 task_type 不能为空`
    if (!rule.target_device_code.trim())
      return `${rule.source_device_code} 的 target_device_code 不能为空`
    if (rule.task_type.trim().length > 100)
      return `${rule.source_device_code} 的 task_type 不能超过 100 个字符`
    if (rule.target_device_code.trim().length > 100)
      return `${rule.source_device_code} 的 target_device_code 不能超过 100 个字符`
    const missingDevice = [rule.source_device_code, rule.target_device_code].find(
      code => !devices.value.some(device => device.device_code === code)
    )
    if (missingDevice) return `${rule.source_device_code} 引用的设备 ${missingDevice} 不属于本线`
    const paramsError = findParamsValidationError(rule.params)
    if (paramsError) return `${rule.source_device_code}：${paramsError}`
  }
  return ''
})
const needsApply = computed(() =>
  Boolean(
    sourceDeviceCode.value &&
    draftRule.value &&
    currentWorkline.value &&
    (currentWorkline.value.run_mode !== 'ECS_TEST' ||
      JSON.stringify(nextRules.value) !== JSON.stringify(rules.value))
  )
)
const cannotRemoveLastEcsTestRule = computed(
  () => currentWorkline.value?.run_mode === 'ECS_TEST' && rules.value.length === 1
)
const isDirty = computed(() =>
  Boolean(sourceDeviceCode.value && (editorSnapshot.value !== savedDraft.value || needsApply.value))
)
const targetOnWorkline = computed(() =>
  devices.value.some(device => device.device_code === targetDeviceCode.value.trim())
)
const confirmDisabled = computed(
  () =>
    busy.value ||
    !currentWorkline.value ||
    currentWorkline.value.is_active === true ||
    !canUpdateWorkline.value ||
    Boolean(loadError.value || rulesError.value || nextRulesError.value) ||
    !needsApply.value ||
    !targetOnWorkline.value
)
const defaultSaveDisabled = computed(
  () => busy.value || !canSaveDefault.value || !draftRule.value || Boolean(loadError.value)
)
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function findParamsValidationError(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const error = findParamsValidationError(item)
      if (error) return error
    }
    return null
  }
  if (!isRecord(value)) return null
  for (const [rawKey, nested] of Object.entries(value)) {
    const key = rawKey.trim()
    if (!key) return 'params 参数 key 不能为空'
    if (forbiddenParamKeys.has(key.toLowerCase()))
      return `params 禁止包含硬件控制字段：${key.toLowerCase()}`
    if (rawKey !== key) return '参数 key 不可包含首尾空白'
    const error = findParamsValidationError(nested)
    if (error) return error
  }
  return null
}

function readRuntimeConfig(value: unknown): Record<string, unknown> {
  if (value == null) return {}
  if (!isRecord(value)) throw new Error('WorkLine 运行配置不是对象，无法安全编辑')
  return value
}

function readRules(value: unknown): EcsTestRule[] {
  if (value === undefined) return []
  if (!Array.isArray(value))
    throw new Error('当前 ecs_test_rules 不是规则数组，已停止编辑以避免覆盖')
  const seenSources = new Set<string>()
  return value.map((item, index) => {
    if (
      !isRecord(item) ||
      typeof item.source_device_code !== 'string' ||
      !item.source_device_code ||
      typeof item.target_device_code !== 'string' ||
      !item.target_device_code ||
      typeof item.task_type !== 'string' ||
      !item.task_type ||
      !isRecord(item.params)
    )
      throw new Error(`第 ${index + 1} 条 ecs_test_rules 不符合规则结构，已停止编辑以避免覆盖`)
    if (seenSources.has(item.source_device_code))
      throw new Error(
        `ecs_test_rules 存在重复来源 ${item.source_device_code}，已停止编辑以避免覆盖`
      )
    seenSources.add(item.source_device_code)
    return { ...item, params: { ...item.params } } as EcsTestRule
  })
}

function setEditor(rule?: Pick<EcsTestRule, 'target_device_code' | 'task_type' | 'params'>): void {
  targetDeviceCode.value = rule?.target_device_code ?? ''
  taskType.value = rule?.task_type ?? ''
  paramsText.value = JSON.stringify(rule?.params ?? {}, null, 2)
}

function resetState(): void {
  currentWorkline.value = null
  devices.value = []
  rules.value = []
  sourceDeviceCode.value = ''
  setEditor()
  savedDeviceDefault.value = null
  savedDraft.value = ''
  loadError.value = ''
  rulesError.value = ''
  defaultError.value = ''
  actionError.value = ''
  removingRule.value = ''
}

async function load(): Promise<void> {
  const sequence = ++loadSequence
  ++sourceSequence
  resetState()
  if (!modelValue.value || !props.workline) return
  loading.value = true
  try {
    const [latest, rows] = await Promise.all([
      workLinesApiMethods.getById(props.workline.id).send(),
      fetchWorkLineDevices(props.workline.id)
    ])
    if (sequence !== loadSequence) return
    currentWorkline.value = latest
    devices.value = rows.filter(device => device.work_line_id === latest.id)
    try {
      const config = readRuntimeConfig(latest.runtime_config_json)
      rules.value = readRules(config.ecs_test_rules)
    } catch (error) {
      rulesError.value = getSafeErrorMessage(error)
    }
    savedDraft.value = editorSnapshot.value
  } catch (error) {
    if (sequence === loadSequence)
      loadError.value = `ECS_TEST 配置加载失败：${getSafeErrorMessage(error)}`
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

async function selectSource(code: string): Promise<void> {
  if (!code || code === sourceDeviceCode.value || busy.value) return
  if (isDirty.value) {
    try {
      await ElMessageBox.confirm('切换来源设备会放弃当前尚未应用的规则草稿。', '切换来源设备', {
        confirmButtonText: '切换',
        cancelButtonText: '继续编辑',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  const sequence = ++sourceSequence
  sourceDeviceCode.value = code
  savedDeviceDefault.value = null
  defaultError.value = ''
  actionError.value = ''
  setEditor()
  const appliedRule = rules.value.find(rule => rule.source_device_code === code)
  if (appliedRule) setEditor(appliedRule)
  savedDraft.value = editorSnapshot.value
  if (!canReadDefault.value) {
    defaultError.value = '缺少设备详情权限，无法读取该设备默认值；可手动填写规则。'
    return
  }
  defaultLoading.value = true
  try {
    const result = await devicesApiMethods.ecsTestDefault({ device_code: code }).send()
    if (sequence !== sourceSequence) return
    savedDeviceDefault.value = result.default
    if (!appliedRule && result.default) setEditor(result.default)
  } catch (error) {
    if (sequence === sourceSequence)
      defaultError.value = `设备默认值读取失败：${getSafeErrorMessage(error)}`
  } finally {
    if (sequence === sourceSequence) defaultLoading.value = false
  }
}

async function saveDefault(): Promise<void> {
  const rule = draftRule.value
  if (!rule || defaultSaveDisabled.value) return
  actionError.value = ''
  savingDefault.value = true
  try {
    const result = await devicesApiMethods
      .updateEcsTestDefault(
        { device_code: sourceDeviceCode.value },
        {
          default: {
            target_device_code: rule.target_device_code,
            task_type: rule.task_type,
            params: rule.params
          }
        }
      )
      .send()
    savedDeviceDefault.value = result.default
    ElMessage.success('设备默认值已保存；WorkLine 规则未更改，也未启动')
  } catch (error) {
    actionError.value = `设备默认值保存失败：${getSafeErrorMessage(error)}`
  } finally {
    savingDefault.value = false
  }
}

async function clearDefault(): Promise<void> {
  if (!sourceDeviceCode.value || !savedDeviceDefault.value || !canSaveDefault.value || busy.value)
    return
  try {
    await ElMessageBox.confirm(
      '只清除该设备的预填默认值，不会更改 WorkLine 已应用规则。',
      '清除设备默认值',
      {
        confirmButtonText: '清除默认值',
        cancelButtonText: '保留',
        type: 'warning'
      }
    )
  } catch {
    return
  }
  clearingDefault.value = true
  actionError.value = ''
  try {
    const result = await devicesApiMethods
      .updateEcsTestDefault({ device_code: sourceDeviceCode.value }, { default: null })
      .send()
    savedDeviceDefault.value = result.default
    ElMessage.success('设备默认值已清除；WorkLine 规则未更改')
  } catch (error) {
    actionError.value = `设备默认值清除失败：${getSafeErrorMessage(error)}`
  } finally {
    clearingDefault.value = false
  }
}

async function removeRule(sourceCode: string): Promise<void> {
  const latest = currentWorkline.value
  if (
    !latest ||
    latest.is_active === true ||
    !canUpdateWorkline.value ||
    busy.value ||
    loadError.value ||
    rulesError.value
  )
    return
  const proposed = rules.value.filter(rule => rule.source_device_code !== sourceCode)
  if (proposed.length === rules.value.length) return
  if (cannotRemoveLastEcsTestRule.value) return
  const runtime = readRuntimeConfig(latest.runtime_config_json)
  removingRule.value = sourceCode
  actionError.value = ''
  try {
    await ElMessageBox.confirm(
      h('div', [
        h(
          'p',
          `确认从 WorkLine「${latest.line_name ?? latest.id}」移除来源设备 ${sourceCode} 的规则？`
        ),
        h('p', `运行模式仍保持 ${latest.run_mode}，此操作不会启动 WorkLine。`),
        ...(sourceDeviceCode.value === sourceCode && isDirty.value
          ? [h('p', '当前来源设备的未应用草稿也会清除。')]
          : []),
        h('pre', { class: 'ecs-test__preview' }, JSON.stringify(proposed, null, 2))
      ]),
      '移除 ECS_TEST 规则',
      {
        confirmButtonText: '移除规则',
        cancelButtonText: '返回检查',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    const saved = await workLinesApiMethods
      .update(latest.id, {
        version: latest.version,
        run_mode: latest.run_mode,
        runtime_config_json: { ...runtime, ecs_test_rules: proposed }
      })
      .send()
    currentWorkline.value = saved
    rules.value = readRules(readRuntimeConfig(saved.runtime_config_json).ecs_test_rules)
    if (sourceDeviceCode.value === sourceCode) {
      ++sourceSequence
      sourceDeviceCode.value = ''
      setEditor()
      savedDeviceDefault.value = null
      savedDraft.value = editorSnapshot.value
    }
    ElMessage.success(`WorkLine 规则 ${sourceCode} 已移除；运行模式保持不变`)
    try {
      await refresh?.()
    } catch {
      ElMessage.warning('规则已移除，列表刷新失败，请手动刷新')
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close')
      actionError.value = `WorkLine 规则移除失败：${getSafeErrorMessage(error)}`
  } finally {
    removingRule.value = ''
  }
}

async function confirmLeave(): Promise<boolean> {
  if (busy.value) return false
  if (!isDirty.value) return true
  try {
    await ElMessageBox.confirm('ECS_TEST 配置尚未应用，确认放弃当前修改？', '未应用的修改', {
      confirmButtonText: '放弃修改',
      cancelButtonText: '继续编辑',
      type: 'warning'
    })
    return true
  } catch {
    return false
  }
}

async function submit(): Promise<boolean> {
  const latest = currentWorkline.value
  const replacement = draftRule.value
  const proposed = nextRules.value
  if (confirmDisabled.value || !latest || !replacement || !proposed) return false
  const runtime = readRuntimeConfig(latest.runtime_config_json)
  try {
    await ElMessageBox.confirm(
      h('div', [
        h(
          'p',
          `确认将以下完整规则集应用到 WorkLine「${latest.line_name ?? latest.id}」？此操作不会启动 WorkLine。`
        ),
        h('pre', { class: 'ecs-test__preview' }, JSON.stringify(proposed, null, 2))
      ]),
      '应用 ECS_TEST 配置',
      {
        confirmButtonText: '应用到 WorkLine',
        cancelButtonText: '返回检查',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
  } catch {
    return false
  }
  submitting.value = true
  actionError.value = ''
  try {
    const saved = await workLinesApiMethods
      .update(latest.id, {
        version: latest.version,
        run_mode: 'ECS_TEST',
        runtime_config_json: { ...runtime, ecs_test_rules: proposed }
      })
      .send()
    currentWorkline.value = saved
    rules.value = readRules(readRuntimeConfig(saved.runtime_config_json).ecs_test_rules)
    savedDraft.value = editorSnapshot.value
    ElMessage.success('ECS_TEST 规则已应用；请按既有流程确认后单独启动 WorkLine')
    try {
      await refresh?.()
    } catch {
      ElMessage.warning('规则已应用，列表刷新失败，请手动刷新')
    }
    return true
  } catch (error) {
    actionError.value = `ECS_TEST 配置应用失败：${getSafeErrorMessage(error)}`
    return false
  } finally {
    submitting.value = false
  }
}

const progress = computed(() =>
  currentWorkline.value
    ? { 'ecs-test': `${rules.value.length} 条规则${isDirty.value ? ' · 待应用' : ''}` }
    : {}
)

watch(
  [modelValue, () => props.workline?.id],
  ([open]) => {
    if (open) void load()
    else {
      ++loadSequence
      ++sourceSequence
    }
  },
  { immediate: true }
)

defineExpose({ confirmLeave, submit, confirmDisabled, submitting, busy, isDirty, progress })
</script>

<template>
  <section class="ecs-test">
    <header class="ecs-test__heading">
      <div>
        <h3>ECS_TEST 固定规则</h3>
        <p>选择来源设备后读取设备默认值；默认值只预填，不会自动应用或执行。</p>
      </div>
      <ElTag :type="currentWorkline?.is_active ? 'warning' : 'info'">
        {{ currentWorkline?.is_active ? 'WorkLine 运行中' : 'WorkLine 已停止' }}
      </ElTag>
    </header>

    <ElAlert
      v-if="loadError"
      :title="loadError"
      type="error"
      :closable="false"
    />
    <ElAlert
      v-if="rulesError"
      :title="rulesError"
      type="error"
      :closable="false"
    />
    <ElAlert
      v-if="currentWorkline?.is_active"
      title="本线运行中：可保存或清除设备预填默认值；应用 ECS_TEST 规则前必须先按既有流程停线。"
      type="warning"
      :closable="false"
    />

    <div
      v-loading="loading"
      class="ecs-test__body"
    >
      <div class="ecs-test__form">
        <label for="ecs-test-source">来源设备</label>
        <ElSelect
          id="ecs-test-source"
          :model-value="sourceDeviceCode"
          aria-label="来源设备"
          filterable
          :disabled="busy || !!rulesError"
          placeholder="选择本线 ECS_TEST 来源设备"
          @change="selectSource"
        >
          <ElOption
            v-for="device in devices"
            :key="device.device_code"
            :value="device.device_code"
            :label="`${device.device_name} (${device.device_code})`"
          />
        </ElSelect>

        <label for="ecs-test-target">目标设备编码</label>
        <ElInput
          id="ecs-test-target"
          v-model="targetDeviceCode"
          aria-label="目标设备编码"
          :disabled="busy || !!rulesError"
          placeholder="输入本线目标设备编码"
        />

        <label for="ecs-test-task-type">task_type</label>
        <ElInput
          id="ecs-test-task-type"
          v-model="taskType"
          aria-label="task_type"
          :disabled="busy || !!rulesError"
          placeholder="例如 MOVE_FORWARD"
        />

        <label for="ecs-test-params">params（JSON 对象）</label>
        <ElInput
          id="ecs-test-params"
          v-model="paramsText"
          aria-label="params JSON"
          type="textarea"
          :rows="8"
          :disabled="busy || !!rulesError"
          spellcheck="false"
        />
        <small>params 必须显式填写为 JSON 对象，空对象 {} 有效。</small>
      </div>

      <ElAlert
        v-if="defaultLoading"
        title="正在读取来源设备默认值…"
        type="info"
        :closable="false"
      />
      <ElAlert
        v-if="defaultError"
        :title="defaultError"
        type="warning"
        :closable="false"
      />
      <ElAlert
        v-if="paramsError && sourceDeviceCode"
        :title="paramsError"
        type="error"
        :closable="false"
      />
      <ElAlert
        v-if="taskTypeError && sourceDeviceCode"
        :title="taskTypeError"
        type="error"
        :closable="false"
      />
      <ElAlert
        v-if="targetDeviceCodeError && sourceDeviceCode"
        :title="targetDeviceCodeError"
        type="error"
        :closable="false"
      />
      <ElAlert
        v-if="nextRulesError"
        :title="nextRulesError"
        type="error"
        :closable="false"
      />
      <ElAlert
        v-if="targetDeviceCode && !targetOnWorkline"
        title="该默认目标当前不属于本线；可以保存为设备默认值，但应用到 WorkLine 前请改选本线设备。"
        type="warning"
        :closable="false"
      />
      <ElAlert
        v-if="actionError"
        :title="actionError"
        type="error"
        :closable="false"
      />

      <div class="ecs-test__default-actions">
        <ElButton
          v-if="savedDeviceDefault"
          type="danger"
          plain
          :disabled="busy || !canSaveDefault"
          @click="clearDefault"
        >
          清除该设备默认值
        </ElButton>
        <ElButton
          type="primary"
          :disabled="defaultSaveDisabled"
          :loading="savingDefault"
          @click="saveDefault"
        >
          保存为该设备默认值
        </ElButton>
      </div>

      <section
        class="ecs-test__rules"
        aria-label="当前 WorkLine 规则"
      >
        <h4>当前 WorkLine 规则（{{ rules.length }}）</h4>
        <p v-if="cannotRemoveLastEcsTestRule">
          ECS_TEST 至少需要一条规则；如需移除最后一条，请先切换 WorkLine 运行模式。
        </p>
        <p v-if="currentWorkline?.run_mode !== 'ECS_TEST'">
          当前运行模式为 {{ currentWorkline?.run_mode }}；应用规则会切换为
          ECS_TEST，但不会启动本线。
        </p>
        <ul v-if="rules.length">
          <li
            v-for="rule in rules"
            :key="rule.source_device_code"
          >
            <code>{{ rule.source_device_code }}</code>
            →
            <code>{{ rule.target_device_code }}</code>
            · {{ rule.task_type }}
            <ElButton
              type="danger"
              text
              :disabled="
                busy ||
                currentWorkline?.is_active === true ||
                !canUpdateWorkline ||
                cannotRemoveLastEcsTestRule ||
                !!loadError ||
                !!rulesError
              "
              :loading="removingRule === rule.source_device_code"
              @click="removeRule(rule.source_device_code)"
            >
              移除 {{ rule.source_device_code }}
            </ElButton>
          </li>
        </ul>
        <p v-else>当前没有已应用的 ECS_TEST 规则。</p>
      </section>
    </div>
  </section>
</template>

<style scoped>
.ecs-test {
  display: grid;
  gap: var(--space-md);
  color: var(--color-text-primary);
}
.ecs-test__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}
.ecs-test__heading h3,
.ecs-test__heading p,
.ecs-test__rules h4,
.ecs-test__rules p {
  margin: 0;
}
.ecs-test__heading h3,
.ecs-test__rules h4 {
  font-weight: 600;
}
.ecs-test__heading p,
.ecs-test__rules p,
.ecs-test__form small {
  margin-top: var(--space-3xs);
  color: var(--color-text-secondary);
}
.ecs-test__body {
  display: grid;
  gap: var(--space-md);
  max-width: 840px;
}
.ecs-test__form {
  display: grid;
  grid-template-columns: minmax(140px, 200px) minmax(0, 1fr);
  align-items: center;
  gap: var(--space-sm);
}
.ecs-test__form label {
  font-weight: 500;
}
.ecs-test__form small {
  grid-column: 2;
  margin-top: calc(-1 * var(--space-2xs));
}
.ecs-test__default-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.ecs-test__rules {
  display: grid;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-sm);
  background: var(--el-bg-color);
}
.ecs-test__rules ul {
  display: grid;
  gap: var(--space-2xs);
  margin: 0;
  padding-left: 1.25rem;
}
.ecs-test__preview {
  max-height: 40vh;
  overflow: auto;
  padding: var(--space-sm);
  color: var(--color-text-primary);
  background: var(--color-bg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (width <= 640px) {
  .ecs-test__form {
    grid-template-columns: 1fr;
  }
  .ecs-test__form small {
    grid-column: 1;
  }
}
</style>
