<template>
  <el-radio-group
    :model-value="modelValue"
    size="small"
    class="couple-selector"
    @update:model-value="handleUpdate"
  >
    <el-radio-button
      v-for="option in options"
      :key="option.value"
      :class="`couple-selector__option couple-selector__option--${option.value}`"
      :title="option.hint"
      :value="option.value"
    >
      <span class="couple-selector__mode">{{ option.mode }}</span>
      <span class="couple-selector__label">{{ option.label }}</span>
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
import type { FilterCouple } from '@/api/base/crud-request-adapter'

interface Props {
  modelValue: FilterCouple
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterCouple): void
}>()

const options: Array<{ value: FilterCouple; label: string; mode: string; hint: string }> = [
  { value: 'and', label: '且', mode: 'AND', hint: '全部满足' },
  { value: 'or', label: '或', mode: 'OR', hint: '任一满足' },
  { value: 'not', label: '非', mode: 'NOT', hint: '排除命中' }
]

function handleUpdate(value: string | number | boolean | undefined) {
  emit('update:modelValue', (value ?? props.modelValue) as FilterCouple)
}
</script>

<style scoped lang="scss">
.couple-selector {
  display: inline-flex;
  padding: 2px;
  background: color-mix(in srgb, var(--el-fill-color-light) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-border-color) 88%, transparent);
  border-radius: 14px;

  :deep(.el-radio-button__inner) {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
    padding: 0 10px;
    color: var(--el-text-color-regular);
    background: transparent;
    border: none;
    border-radius: 10px;
    box-shadow: none;
    transition:
      background-color 0.18s ease,
      color 0.18s ease,
      box-shadow 0.18s ease;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner),
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 10px;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 22%, transparent),
      0 1px 2px rgba(15, 23, 42, 0.06);
  }

  :deep(.el-radio-button:not(.is-active):hover .el-radio-button__inner) {
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--el-bg-color) 72%, transparent);
  }

  &__option {
    :deep(.el-radio-button__inner) {
      position: relative;
    }
  }

  &__option--and {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: color-mix(in srgb, var(--el-color-success-dark-2) 88%, var(--el-text-color-primary));
      background: color-mix(in srgb, var(--el-color-success-light-9) 78%, var(--el-bg-color));
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--el-color-success) 26%, transparent),
        0 1px 2px rgba(21, 128, 61, 0.08);
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner::before) {
      background: var(--el-color-success);
    }
  }

  &__option--or {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: color-mix(in srgb, var(--el-color-primary-dark-2) 88%, var(--el-text-color-primary));
      background: color-mix(in srgb, var(--el-color-primary-light-9) 78%, var(--el-bg-color));
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
        0 1px 2px rgba(29, 78, 216, 0.08);
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner::before) {
      background: var(--el-color-primary);
    }
  }

  &__option--not {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: color-mix(in srgb, var(--el-color-danger-dark-2) 88%, var(--el-text-color-primary));
      background: color-mix(in srgb, var(--el-color-danger-light-9) 76%, var(--el-bg-color));
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--el-color-danger) 30%, transparent),
        0 1px 2px rgba(190, 24, 93, 0.08);
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner::before) {
      background: var(--el-color-danger);
    }
  }

  &__mode {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 18px;
    padding: 0 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--el-fill-color) 92%, transparent);
    border-radius: 999px;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) .couple-selector__mode {
    color: inherit;
    background: color-mix(in srgb, currentColor 12%, white);
  }

  &__label {
    font-weight: 600;
    font-size: 13px;
  }
  :deep(.el-radio-button__inner::before) {
    position: absolute;
    top: 6px;
    left: 4px;
    width: 3px;
    height: calc(100% - 12px);
    content: '';
    background: transparent;
    border-radius: 999px;
    transition: background-color 0.18s ease;
  }
}
</style>
