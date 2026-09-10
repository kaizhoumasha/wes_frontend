<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import WorkLineBaseConfigurationPanel from './WorkLineBaseConfigurationPanel.vue'
import WorkLineBusinessConfigurationPanel from './WorkLineBusinessConfigurationPanel.vue'

type Section = 'base' | 'business'
interface PanelHandle {
  confirmLeave: () => Promise<boolean>
  submit: () => Promise<void>
  confirmDisabled: boolean
  submitting: boolean
  busy: boolean
  isDirty: boolean
}
const props = withDefaults(defineProps<{ workline: Workline | null; initialSection?: Section }>(), {
  initialSection: 'base'
})
const modelValue = defineModel<boolean>({ default: false })
const { hasPermission } = usePermission()
const section = ref<Section>(props.initialSection)
const panel = ref<PanelHandle | null>(null)
const navigation = ref<HTMLElement | null>(null)
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
const visible = computed({
  get: () => modelValue.value,
  set: value => {
    if (!value) void leave()
  }
})

async function leave(destination?: Section): Promise<void> {
  if (busy.value || destination === section.value) return
  if (destination === 'business' && !canReadBusiness.value) return
  if (destination === 'base' && !canReadBase.value) return
  transitioning.value = true
  try {
    if (panel.value && !(await panel.value.confirmLeave())) return
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
  const destination =
    event.key === 'Home'
      ? 'base'
      : event.key === 'End'
        ? 'business'
        : section.value === 'base'
          ? 'business'
          : 'base'
  void leave(destination)
}

watch(
  modelValue,
  open => {
    if (open)
      section.value =
        props.initialSection === 'business' && canReadBusiness.value ? 'business' : 'base'
  },
  { immediate: true }
)
</script>

<template>
  <StandardDialog
    v-model="visible"
    :title="`工作线配置${workline ? `：${workline.line_name}` : ''}`"
    size="xl"
    :confirm-text="section === 'base' ? '保存基础配置' : '保存业务配置'"
    cancel-text="关闭"
    confirm-icon="lucide:save"
    :confirm-disabled="busy || !panel || panel.confirmDisabled"
    :confirm-loading="panel?.submitting"
    :closable="!busy"
    :hide-cancel="busy"
    @confirm="!busy && panel?.submit()"
  >
    <div class="configuration-workspace">
      <nav
        ref="navigation"
        class="configuration-workspace__tabs"
        role="tablist"
        aria-label="配置分区"
        @keydown="navigate"
      >
        <button
          id="workline-base-tab"
          type="button"
          role="tab"
          data-section="base"
          :aria-selected="section === 'base'"
          aria-controls="workline-configuration-panel"
          :tabindex="section === 'base' ? 0 : -1"
          :disabled="busy || !canReadBase"
          @click="leave('base')"
        >
          <span>基础配置</span>
          <small>本线设备 · 实际工作位</small>
        </button>
        <button
          id="workline-business-tab"
          type="button"
          role="tab"
          data-section="business"
          :aria-selected="section === 'business'"
          aria-controls="workline-configuration-panel"
          :tabindex="section === 'business' ? 0 : -1"
          :disabled="busy || !canReadBusiness"
          @click="leave('business')"
        >
          <span>业务配置</span>
          <small>选择插件 · 绑定插槽</small>
        </button>
      </nav>
      <div
        v-if="modelValue && workline"
        id="workline-configuration-panel"
        role="tabpanel"
        :aria-labelledby="section === 'base' ? 'workline-base-tab' : 'workline-business-tab'"
      >
        <WorkLineBaseConfigurationPanel
          v-if="section === 'base' && canReadBase"
          ref="panel"
          :key="`base-${workline.id}`"
          :workline="workline"
          :model-value="true"
        />
        <WorkLineBusinessConfigurationPanel
          v-else-if="section === 'business' && canReadBusiness"
          ref="panel"
          :key="`business-${workline.id}`"
          :workline="workline"
          :model-value="true"
          @navigate-base="leave('base')"
        />
        <ElAlert
          v-else
          title="当前账号没有此分区的查看权限"
          type="info"
          :closable="false"
        />
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.configuration-workspace {
  display: grid;
  gap: var(--space-md);
  min-width: 0;
}
.configuration-workspace__tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--el-bg-color);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .configuration-workspace__tabs button {
    padding: var(--space-sm);
  }
}
</style>
