<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import WorkLineConfigurationActions from './WorkLineConfigurationActions.vue'
import WorkLineBaseConfigurationPanel from './WorkLineBaseConfigurationPanel.vue'
import WorkLineBusinessConfigurationPanel from './WorkLineBusinessConfigurationPanel.vue'

type Section = 'base' | 'plugin' | 'slots'
interface PanelHandle {
  confirmLeave: () => Promise<boolean>
  submit: () => Promise<boolean>
  confirmDisabled: boolean
  submitting: boolean
  busy: boolean
  isDirty: boolean
  progress: Partial<Record<Section, string>>
}
const props = withDefaults(
  defineProps<{
    workline: (Pick<Workline, 'id'> & Partial<Workline>) | null
    initialSection?: Section
  }>(),
  {
    initialSection: 'base'
  }
)
const modelValue = defineModel<boolean>({ default: false })
const { hasPermission } = usePermission()
const section = ref<Section>(props.initialSection)
const panel = ref<PanelHandle | null>(null)
const navigation = ref<HTMLElement | null>(null)
const progress = ref<Partial<Record<Section, string>>>({})
watch(
  () => panel.value?.progress,
  value => {
    if (value) progress.value = { ...progress.value, ...value }
  },
  { deep: true }
)
const transitioning = ref(false)
const canReadBase = computed(
  () =>
    hasPermission(BIZ_PERMISSIONS.workline.baseConfiguration) &&
    hasPermission(BIZ_PERMISSIONS.device.list)
)
const canReadBusiness = computed(
  () =>
    canReadBase.value &&
    [
      BIZ_PERMISSIONS.workline.detail,
      BIZ_PERMISSIONS.workline.availablePlugins,
      BIZ_PERMISSIONS.workline.configurationStatus
    ].every(hasPermission)
)
const busy = computed(() => transitioning.value || panel.value?.busy === true)
const steps = [
  { key: 'base', title: '关联设备', detail: '建立本线设备清单' },
  { key: 'plugin', title: '选择插件', detail: '确认业务能力与资源要求' },
  { key: 'slots', title: '配置插槽', detail: '匹配设备 · 补充工作位' }
] as const
const saveText = computed(() => (section.value === 'slots' ? '保存配置' : '保存当前步骤'))
async function save(advance = false): Promise<void> {
  if (busy.value || !panel.value || panel.value.confirmDisabled) return
  const saved = await panel.value.submit()
  if (!saved || !advance) return
  if (section.value === 'base' && canReadBusiness.value) section.value = 'plugin'
  else if (section.value === 'plugin') section.value = 'slots'
}
async function confirmLeave(): Promise<boolean> {
  if (busy.value) return false
  return panel.value ? panel.value.confirmLeave() : true
}
defineExpose({ confirmLeave, isDirty: computed(() => panel.value?.isDirty ?? false), busy })

async function leave(destination?: Section): Promise<void> {
  if (busy.value || destination === section.value) return
  if (destination === 'plugin' && !canReadBusiness.value) return
  if (destination === 'slots' && !canReadBase.value) return
  if (destination === 'base' && !canReadBase.value) return
  transitioning.value = true
  try {
    if (
      (destination === undefined || destination === 'base' || section.value === 'base') &&
      panel.value &&
      !(await panel.value.confirmLeave())
    )
      return
    if (panel.value?.isDirty) {
      if (section.value === 'base') delete progress.value.base
      else {
        delete progress.value.plugin
        delete progress.value.slots
      }
    }
    if (destination) {
      section.value = destination
    } else {
      modelValue.value = false
    }
  } finally {
    transitioning.value = false
    await nextTick()
    navigation.value?.querySelector<HTMLButtonElement>(`[data-section="${section.value}"]`)?.focus()
  }
}

function navigate(event: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const index = steps.findIndex(step => step.key === section.value)
  const destination =
    event.key === 'Home'
      ? 'base'
      : event.key === 'End'
        ? 'slots'
        : steps[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]!.key
  void leave(destination)
}

watch(
  modelValue,
  open => {
    if (open)
      section.value =
        props.initialSection !== 'base' && canReadBusiness.value ? props.initialSection : 'base'
  },
  { immediate: true }
)
</script>

<template>
  <section
    class="configuration-page"
    aria-label="工作线配置"
  >
    <header class="configuration-page__header">
      <div>
        <h2>工作线配置 · {{ workline?.line_name || workline?.id }}</h2>
        <p>{{ workline?.line_code }} · 首次按顺序配置，后续可直接进入需要调整的步骤。</p>
      </div>
      <ElButton
        :disabled="busy"
        @click="leave()"
      >
        返回工作线
      </ElButton>
    </header>
    <div class="configuration-workspace">
      <nav
        ref="navigation"
        class="configuration-workspace__tabs"
        role="tablist"
        aria-label="配置分区"
        @keydown="navigate"
      >
        <button
          v-for="(step, index) in steps"
          :id="`workline-${step.key}-tab`"
          :key="step.key"
          type="button"
          role="tab"
          :data-section="step.key"
          :aria-selected="section === step.key"
          aria-controls="workline-configuration-panel"
          :tabindex="section === step.key ? 0 : -1"
          :disabled="busy || (step.key === 'plugin' ? !canReadBusiness : !canReadBase)"
          @click="leave(step.key)"
        >
          <span>{{ index + 1 }}. {{ step.title }}</span>
          <small>{{ progress[step.key] || step.detail }}</small>
        </button>
      </nav>
      <div
        v-if="modelValue && workline"
        id="workline-configuration-panel"
        class="configuration-workspace__panel"
        role="tabpanel"
        :aria-labelledby="`workline-${section}-tab`"
      >
        <WorkLineBaseConfigurationPanel
          v-if="section === 'base' && canReadBase"
          ref="panel"
          :key="`base-${workline.id}`"
          :workline="workline"
          :model-value="true"
        />
        <WorkLineBusinessConfigurationPanel
          v-else-if="section !== 'base' && canReadBusiness"
          ref="panel"
          :key="`business-${workline.id}`"
          :step="section === 'plugin' ? 'plugin' : 'slots'"
          :workline="workline"
          :model-value="true"
          @navigate-base="leave('base')"
        />
        <WorkLineBaseConfigurationPanel
          v-else-if="section === 'slots' && canReadBase"
          ref="panel"
          :key="`positions-${workline.id}`"
          :workline="workline"
          :model-value="true"
          mode="positions"
        />
        <ElAlert
          v-else
          title="当前账号没有此分区的查看权限"
          type="info"
          :closable="false"
        />
      </div>
    </div>
    <WorkLineConfigurationActions
      :confirm-text="saveText"
      :confirm-disabled="busy || !panel || panel.confirmDisabled"
      :confirm-loading="panel?.submitting"
      :closable="!busy"
      :hide-cancel="busy"
      :dirty="panel?.isDirty"
      :show-continue="section !== 'slots' && canReadBusiness"
      @confirm="save(false)"
      @continue="save(true)"
      @close="leave()"
    />
  </section>
</template>

<style scoped>
.configuration-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-md);
  color: var(--color-text-primary);
}
.configuration-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.configuration-page__header h2 {
  margin: 0;
  font-size: var(--el-font-size-extra-large);
  font-weight: 600;
}
.configuration-page__header p {
  margin: var(--space-3xs) 0 0;
  font-size: var(--el-font-size-base);
  color: var(--color-text-secondary);
}

.configuration-workspace {
  display: grid;
  gap: var(--space-md);
  min-width: 0;
}
.configuration-workspace__panel {
  min-width: 0;
  padding: var(--space-md);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
}
.configuration-workspace__tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  background: transparent;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-xs);
}
.configuration-workspace__tabs button {
  display: grid;
  gap: var(--space-3xs);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
}
.configuration-workspace__tabs button[aria-selected='true'] {
  border-color: var(--color-primary);
  box-shadow: inset 0 -3px 0 var(--color-primary);
}
.configuration-workspace__tabs button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.configuration-workspace__tabs button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.configuration-workspace__tabs span {
  font-weight: 600;
  font-size: var(--el-font-size-medium);
}
.configuration-workspace__tabs small {
  color: var(--color-text-secondary);
}

@media (width <= 600px) {
  .configuration-page,
  .configuration-workspace__panel {
    padding: var(--space-sm);
  }
  .configuration-page__header {
    align-items: flex-start;
  }
  .configuration-workspace__tabs button {
    padding: var(--space-sm);
  }
}
</style>
