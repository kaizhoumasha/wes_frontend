<template>
  <div class="filter-condition-row-wrap">
    <div class="filter-condition-row" :class="{ 'filter-condition-row--invalid': invalid }">
      <el-select
        ref="fieldSelectRef"
        :model-value="condition.field"
        filterable
        placeholder="选择字段"
        class="filter-condition-row__field"
        @update:model-value="handleFieldChange"
      >
        <el-option
          v-for="field in searchableFields"
          :key="field.key"
          :label="field.label"
          :value="field.key"
        />
      </el-select>

      <el-select
        ref="operatorSelectRef"
        :model-value="condition.op"
        placeholder="选择操作符"
        class="filter-condition-row__operator"
        @update:model-value="handleOperatorChange"
      >
        <el-option
          v-for="operator in availableOperators"
          :key="operator"
          :label="getAdvancedOperatorLabel(operator)"
          :value="operator"
        />
      </el-select>

      <ConditionValueInput
        ref="valueInputRef"
        :model-value="condition.value"
        :operator="condition.op"
        :field="currentField"
        class="filter-condition-row__value"
        @update:model-value="handleValueChange"
      />

      <el-button
        class="filter-condition-row__remove"
        text
        type="danger"
        @click="emit('remove')"
      >
        删除
      </el-button>
    </div>

    <p v-if="invalidMessage" class="filter-condition-row__error">
      {{ invalidMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { SearchFieldDef, UIFilterCondition } from '@/types/search'
import {
  getUIFilterConditionErrors,
  getAdvancedOperatorLabel,
  getAdvancedOperatorsForField,
  needsAdvancedValue,
  resolveInitialValueForOperator
} from '@/utils/advanced-search'
import ConditionValueInput from './ConditionValueInput.vue'

interface Props {
  condition: UIFilterCondition
  fields: SearchFieldDef[]
}

const props = defineProps<Props>()
const fieldSelectRef = ref<{ focus?: () => void } | null>(null)
const operatorSelectRef = ref<{ focus?: () => void } | null>(null)
const valueInputRef = ref<InstanceType<typeof ConditionValueInput> | null>(null)

const emit = defineEmits<{
  (e: 'update', value: UIFilterCondition): void
  (e: 'remove'): void
}>()

const searchableFields = computed(() => props.fields.filter(field => field.searchable !== false))
const currentField = computed(() =>
  searchableFields.value.find(field => field.key === props.condition.field)
)
const availableOperators = computed(() => getAdvancedOperatorsForField(currentField.value))
const conditionErrors = computed(() => getUIFilterConditionErrors(props.condition, props.fields))
const dirty = ref(false)
const invalid = computed(() => dirty.value && conditionErrors.value.length > 0)
const invalidMessage = computed(() => (dirty.value ? conditionErrors.value[0] : undefined))

function focusField(): boolean {
  if (!fieldSelectRef.value?.focus) {
    return false
  }

  fieldSelectRef.value.focus()
  return true
}

function focusOperator(): boolean {
  if (!operatorSelectRef.value?.focus) {
    return false
  }

  operatorSelectRef.value.focus()
  return true
}

function focusValue(): boolean {
  return valueInputRef.value?.focusPrimaryInput?.() ?? false
}

function isIncomplete(): boolean {
  return conditionErrors.value.length > 0
}

function focusPreferredInput(): boolean {
  if (!props.condition.field || !currentField.value) {
    return focusField()
  }

  if (!props.condition.op) {
    return focusOperator() || focusField()
  }

  if (!needsAdvancedValue(props.condition.op)) {
    return focusOperator() || focusField()
  }

  if (focusValue()) {
    return true
  }

  return focusOperator() || focusField()
}

function handleFieldChange(fieldKey: string) {
  dirty.value = true
  const field = searchableFields.value.find(candidate => candidate.key === fieldKey)
  if (!field) {
    return
  }

  const nextOperator = getAdvancedOperatorsForField(field).includes(props.condition.op)
    ? props.condition.op
    : getAdvancedOperatorsForField(field)[0]

  emit('update', {
    ...props.condition,
    field: fieldKey,
    op: nextOperator,
    value: resolveInitialValueForOperator(field, nextOperator)
  })
}

function handleOperatorChange(operator: UIFilterCondition['op']) {
  dirty.value = true
  emit('update', {
    ...props.condition,
    op: operator,
    value: resolveInitialValueForOperator(currentField.value, operator, props.condition.value)
  })
}

function handleValueChange(value: unknown) {
  dirty.value = true
  emit('update', {
    ...props.condition,
    value
  })
}

defineExpose({
  focusPreferredInput,
  isIncomplete
})
</script>

<style scoped lang="scss">
.filter-condition-row-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-condition-row {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(148px, 0.9fr) minmax(0, 1.8fr) auto;
  gap: 12px;
  align-items: start;
  padding: 14px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--el-fill-color-light) 72%, transparent), transparent),
    var(--el-bg-color);
  border: 1px solid color-mix(in srgb, var(--el-border-color) 82%, transparent);
  border-radius: 16px;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:focus-within {
    border-color: color-mix(in srgb, var(--el-color-primary) 42%, var(--el-border-color));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--el-color-primary) 30%, var(--el-border-color));
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  }

  &--invalid {
    border-color: color-mix(in srgb, var(--el-color-danger) 42%, var(--el-border-color));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-danger) 18%, transparent);
  }

  &__remove {
    align-self: center;
  }

  &__error {
    margin: 0 0 0 2px;
    font-size: 12px;
    color: var(--el-color-danger);
  }
}

@media (max-width: 768px) {
  .filter-condition-row {
    grid-template-columns: 1fr;

    &__remove {
      justify-self: end;
    }
  }
}
</style>
