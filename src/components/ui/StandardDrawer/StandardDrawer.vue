<script setup lang="ts">
import { computed } from 'vue'
import { resolveDrawerSize } from './constants'
import type { StandardDrawerEmits, StandardDrawerProps } from './types'

const props = withDefaults(defineProps<StandardDrawerProps>(), {
  title: '',
  size: 'md',
  width: undefined,
  direction: 'rtl',
  customClass: '',
  bodyPadding: 'normal',
  bodyScrollable: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  destroyOnClose: false,
  appendToBody: false,
  modal: true,
  withHeader: true
})

const emit = defineEmits<StandardDrawerEmits>()

const computedSize = computed(() => {
  if (props.width) {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  return resolveDrawerSize(props.size)
})

const drawerClass = computed(() => ['standard-drawer', props.customClass])

const bodyClass = computed(() => [
  'standard-drawer__body',
  `standard-drawer__body--padding-${props.bodyPadding}`,
  {
    'standard-drawer__body--scrollable': props.bodyScrollable
  }
])
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="title"
    :direction="direction"
    :size="computedSize"
    :class="drawerClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :modal="modal"
    :with-header="withHeader"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('close')"
    @open="emit('open')"
  >
    <template
      v-if="withHeader"
      #header
    >
      <div class="standard-drawer__header">
        <slot name="header">
          <strong class="standard-drawer__title">
            {{ title }}
          </strong>
        </slot>
      </div>
    </template>

    <div :class="bodyClass">
      <slot />
    </div>

    <template
      v-if="$slots.footer"
      #footer
    >
      <div class="standard-drawer__footer">
        <slot name="footer" />
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
:global(.standard-drawer) {
  display: flex;
  flex-direction: column;
}

:global(.standard-drawer .el-drawer__header) {
  flex: 0 0 auto;
  margin-bottom: 0;
  padding: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

:global(.standard-drawer .el-drawer__body) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

:global(.standard-drawer .el-drawer__footer) {
  flex: 0 0 auto;
  padding: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.standard-drawer__header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.standard-drawer__title {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-drawer__body {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}

.standard-drawer__body--padding-normal {
  padding: 20px;
}

.standard-drawer__body--padding-none {
  padding: 0;
}

.standard-drawer__body--scrollable {
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.standard-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
}

.standard-drawer__footer > :slotted(*) {
  width: 100%;
}
</style>
