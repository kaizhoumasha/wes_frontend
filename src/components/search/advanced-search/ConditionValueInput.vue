<template>
  <div class="condition-value-input">
    <template v-if="!field">
      <div class="condition-value-input__placeholder">请先选择字段</div>
    </template>

    <template v-else-if="!needsAdvancedValue(operator)">
      <div class="condition-value-input__placeholder">该操作符无需输入值</div>
    </template>

    <template v-else-if="operator === 'between' && field.dataType === 'date'">
      <div class="condition-value-input__range">
        <el-date-picker
          :model-value="dateBounds[0]"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="开始日期"
          class="condition-value-input__control"
          @update:model-value="value => handleDateBoundChange(0, value)"
        />
        <span class="condition-value-input__separator">至</span>
        <el-date-picker
          :model-value="dateBounds[1]"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="结束日期"
          class="condition-value-input__control"
          @update:model-value="value => handleDateBoundChange(1, value)"
        />
      </div>
    </template>

    <template v-else-if="operator === 'between'">
      <div class="condition-value-input__range">
        <el-input-number
          :model-value="numberRangeValue[0]"
          placeholder="最小值"
          controls-position="right"
          class="condition-value-input__number"
          @update:model-value="value => handleNumberRangeChange(0, value)"
        />
        <span class="condition-value-input__separator">至</span>
        <el-input-number
          :model-value="numberRangeValue[1]"
          placeholder="最大值"
          controls-position="right"
          class="condition-value-input__number"
          @update:model-value="value => handleNumberRangeChange(1, value)"
        />
      </div>
    </template>

    <template v-else-if="operator === 'in' || operator === 'nin'">
      <el-select
        :model-value="multipleValue"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :allow-create="field.dataType === 'text' || field.dataType === 'number'"
        :default-first-option="field.dataType === 'text' || field.dataType === 'number'"
        class="condition-value-input__control"
        placeholder="输入或选择多个值"
        @update:model-value="handleMultipleChange"
      >
        <el-option
          v-for="option in field.options ?? []"
          :key="`${typeof option.value}-${String(option.value)}`"
          :label="option.label"
          :value="coerceOptionValue(option.value)"
        />
      </el-select>
    </template>

    <template v-else-if="field.dataType === 'boolean'">
      <el-select
        :model-value="singleSelectValue"
        placeholder="选择值"
        class="condition-value-input__control"
        @update:model-value="value => emit('update:modelValue', value)"
      >
        <el-option label="是" :value="true" />
        <el-option label="否" :value="false" />
      </el-select>
    </template>

    <template v-else-if="field.dataType === 'enum'">
      <el-select
        :model-value="singleSelectValue"
        placeholder="选择值"
        class="condition-value-input__control"
        @update:model-value="value => emit('update:modelValue', value)"
      >
        <el-option
          v-for="option in field.options ?? []"
          :key="`${typeof option.value}-${String(option.value)}`"
          :label="option.label"
          :value="coerceOptionValue(option.value)"
        />
      </el-select>
    </template>

    <template v-else-if="field.dataType === 'date'">
      <el-date-picker
        :model-value="singleDateValue"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="选择日期"
        class="condition-value-input__control"
        @update:model-value="value => emit('update:modelValue', value)"
      />
    </template>

    <template v-else-if="field.dataType === 'number'">
      <el-input-number
        :model-value="typeof modelValue === 'number' ? modelValue : undefined"
        placeholder="输入数值"
        controls-position="right"
        class="condition-value-input__control"
        @update:model-value="value => emit('update:modelValue', value)"
      />
    </template>

    <template v-else>
      <el-input
        :model-value="singleTextValue"
        :placeholder="field.placeholder || '输入条件值'"
        class="condition-value-input__control"
        @update:model-value="value => emit('update:modelValue', value)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { AdvancedFilterOperator, SearchFieldDef } from '@/types/search'
import { needsAdvancedValue } from '@/utils/advanced-search'

interface Props {
  modelValue?: unknown
  operator: AdvancedFilterOperator
  field?: SearchFieldDef
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const multipleValue = computed<Array<string | number | boolean>>(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.filter(
        (value): value is string | number | boolean =>
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      )
    : []
)
const singleSelectValue = computed<string | number | boolean | undefined>(() => {
  if (
    typeof props.modelValue === 'string' ||
    typeof props.modelValue === 'number' ||
    typeof props.modelValue === 'boolean'
  ) {
    return props.modelValue
  }

  return undefined
})
const singleDateValue = computed<string | undefined>(() =>
  typeof props.modelValue === 'string' ? props.modelValue : undefined
)
const dateBounds = computed<[string | undefined, string | undefined]>(() => {
  if (!Array.isArray(props.modelValue)) {
    return [undefined, undefined]
  }

  return [
    typeof props.modelValue[0] === 'string' ? (props.modelValue[0] as string) : undefined,
    typeof props.modelValue[1] === 'string' ? (props.modelValue[1] as string) : undefined
  ]
})
const numberRangeValue = computed<[number | undefined, number | undefined]>(() => {
  if (!Array.isArray(props.modelValue)) {
    return [undefined, undefined]
  }

  return [
    typeof props.modelValue[0] === 'number' ? (props.modelValue[0] as number) : undefined,
    typeof props.modelValue[1] === 'number' ? (props.modelValue[1] as number) : undefined
  ]
})
const singleTextValue = computed<string | undefined>(() =>
  typeof props.modelValue === 'string' ? props.modelValue : undefined
)

function handleNumberRangeChange(index: 0 | 1, nextValue: number | null | undefined) {
  const current = [...numberRangeValue.value]
  current[index] = nextValue ?? undefined
  emit('update:modelValue', current)
}

function handleDateBoundChange(index: 0 | 1, value: string | undefined) {
  const current = [...dateBounds.value]
  current[index] = value
  emit('update:modelValue', current)
}

function coerceOptionValue(value: unknown): string | number | boolean {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return String(value ?? '')
}

function handleMultipleChange(values: unknown[]) {
  if (props.field?.dataType === 'number') {
    emit(
      'update:modelValue',
      values
        .map(value => (typeof value === 'number' ? value : Number(value)))
        .filter(value => !Number.isNaN(value))
    )
    return
  }

  emit('update:modelValue', values)
}
</script>

<style scoped lang="scss">
.condition-value-input {
  width: 100%;

  &__control,
  &__number {
    width: 100%;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--el-fill-color-light) 88%, transparent);
    border: 1px dashed var(--el-border-color);
    border-radius: 10px;
  }

  &__range {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  &__separator {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    white-space: nowrap;
  }
}
</style>
