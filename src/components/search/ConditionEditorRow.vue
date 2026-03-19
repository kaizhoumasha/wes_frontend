<!--
条件编辑器行组件

用于在高级搜索弹窗中编辑单个条件。
-->
<!-- eslint-disable vue/no-deprecated-filter -- 'as' is TypeScript type assertion, not Vue filter syntax -->
<template>
  <div
    class="condition-editor-row"
    :class="{ 'condition-editor-row--between': isBetweenOperator(condition.operator) }"
  >
    <!-- 字段选择 -->
    <el-select
      :model-value="condition.field"
      placeholder="选择字段"
      @change="handleFieldChange"
    >
      <el-option
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :value="field.key"
      />
    </el-select>

    <!-- 操作符选择 -->
    <el-select
      :model-value="condition.operator"
      placeholder="操作符"
      @change="handleOperatorChange"
    >
      <el-option
        v-for="op in availableOperators"
        :key="op"
        :label="getOperatorLabel(op)"
        :value="op"
      />
    </el-select>

    <!-- 值输入 -->
    <!-- between 操作符：根据数据类型使用不同的输入组件 -->
    <template v-if="isBetweenOperator(condition.operator)">
      <!-- 日期类型：使用日期范围选择器 -->
      <template v-if="fieldDataType === 'date'">
        <el-date-picker
          :model-value="(condition.value as unknown[] | undefined)?.[0] as string | undefined"
          type="date"
          placeholder="开始日期"
          :editable="false"
          :clearable="true"
          value-format="YYYY-MM-DD"
          @change="(v: string) => handleBetweenMinChange(v)"
        />
        <span class="condition-editor-row__between-separator">-</span>
        <el-date-picker
          :model-value="(condition.value as unknown[] | undefined)?.[1] as string | undefined"
          type="date"
          placeholder="结束日期"
          :editable="false"
          :clearable="true"
          value-format="YYYY-MM-DD"
          @change="(v: string) => handleBetweenMaxChange(v)"
        />
      </template>

      <!-- 数值类型：使用数字输入框 -->
      <template v-else>
        <el-input-number
          :model-value="(condition.value as unknown[] | undefined)?.[0] as number | undefined"
          placeholder="最小值"
          :controls-position="'right'"
          @change="handleBetweenMinChange"
        />
        <span class="condition-editor-row__between-separator">-</span>
        <el-input-number
          :model-value="(condition.value as unknown[] | undefined)?.[1] as number | undefined"
          placeholder="最大值"
          :controls-position="'right'"
          @change="handleBetweenMaxChange"
        />
      </template>
    </template>

    <!-- in / notIn 操作符：TODO 待实现专用多选组件 -->
    <!-- 当前使用通用文本输入，用户可输入逗号分隔的值 -->
    <!-- 未来计划：实现标签输入或多选下拉组件 -->

    <!-- 布尔类型：使用 el-select + 选项 -->
    <el-select
      v-else-if="fieldDataType === 'boolean'"
      :model-value="condition.value as boolean"
      placeholder="选择值"
      @change="handleValueChange"
    >
      <el-option
        :label="'是'"
        :value="true"
      />
      <el-option
        :label="'否'"
        :value="false"
      />
    </el-select>

    <!-- 枚举类型：使用 el-select + 动态选项 -->
    <el-select
      v-else-if="fieldDataType === 'enum'"
      :model-value="condition.value as string | number"
      placeholder="选择值"
      @change="handleValueChange"
    >
      <el-option
        v-for="opt in enumOptions"
        :key="`${typeof opt.value}-${opt.value}`"
        :label="opt.label"
        :value="opt.value as string | number | boolean"
      />
    </el-select>

    <!-- 其他类型：使用 el-input -->
    <el-input
      v-else
      :model-value="`${condition.value ?? ''}`"
      :placeholder="valuePlaceholder"
      :type="fieldDataType === 'number' ? 'number' : 'text'"
      @change="handleValueChange"
    />

    <!-- 删除按钮 -->
    <el-button
      type="danger"
      text
      @click="handleRemove"
    >
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Delete } from '@element-plus/icons-vue'

import type { SearchCondition, SearchFieldDef, SearchOperator } from '@/types/search'
import {
  getOperatorsForDataType,
  getOperatorLabel,
  INPUT_PLACEHOLDERS,
  isBetweenOperator
} from '@/types/search'

// ==================== 类型定义 ====================

interface Props {
  /** 条件 */
  condition: SearchCondition
  /** 字段列表 */
  fields: SearchFieldDef[]
}

interface Emits {
  /** 更新条件 */
  (e: 'update', condition: SearchCondition): void
  /** 删除条件 */
  (e: 'remove'): void
}

// ==================== Props & Emits ====================

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 状态 ==================== (无)

// ==================== 计算属性 ====================

/**
 * 当前字段定义（缓存避免重复查找）
 */
const currentField = computed(() => props.fields.find(f => f.key === props.condition.field))

/**
 * 当前字段的数据类型
 */
const fieldDataType = computed(() => currentField.value?.dataType || 'text')

/**
 * 可用操作符列表
 */
const availableOperators = computed(() => getOperatorsForDataType(fieldDataType.value))

/**
 * 枚举类型选项列表
 */
const enumOptions = computed(() => currentField.value?.options || [])

/**
 * 值输入框占位符
 */
const valuePlaceholder = computed(() => INPUT_PLACEHOLDERS[fieldDataType.value])

// ==================== 事件处理 ====================

function emitUpdatedCondition(patch: Partial<SearchCondition>): void {
  emit('update', {
    ...props.condition,
    ...patch
  })
}

function resolveFieldChangeValue(
  newField: SearchFieldDef,
  currentValue: SearchCondition['value']
): unknown {
  switch (newField.dataType) {
    case 'boolean':
      return true
    case 'enum':
      return newField.options?.[0]?.value
    case 'number':
      return typeof currentValue === 'number' ? currentValue : undefined
    case 'text':
    case 'date':
      return typeof currentValue === 'string' ? currentValue : ''
  }
}

function normalizeConditionValue(value: unknown): unknown {
  switch (fieldDataType.value) {
    case 'number':
      if (typeof value === 'number') {
        return value
      }

      if (typeof value === 'string') {
        const numericValue = parseFloat(value)
        return Number.isNaN(numericValue) ? undefined : numericValue
      }

      return undefined
    case 'boolean':
      return Boolean(value)
    case 'text':
    case 'date':
      return String(value ?? '')
    case 'enum':
      return value
  }
}

function extractChangedValue(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'cur' in value) {
    return (value as { cur?: number }).cur
  }

  return value
}

function buildBetweenCondition(boundary: 'min' | 'max', changedValue: unknown): SearchCondition {
  const currentValue = props.condition.value as unknown[] | undefined
  const currentMin = currentValue?.[0]
  const currentMax = currentValue?.[1]

  if (boundary === 'min') {
    let nextMax = currentMax

    if (
      nextMax === undefined ||
      (typeof changedValue === 'number' &&
        typeof nextMax === 'number' &&
        nextMax <= changedValue)
    ) {
      if (typeof changedValue === 'number') {
        nextMax = changedValue + 1
      } else if (typeof changedValue === 'string') {
        nextMax = undefined
      } else {
        nextMax = changedValue
      }
    }

    return {
      ...props.condition,
      value: [changedValue, nextMax]
    }
  }

  let nextMin = currentMin

  if (
    nextMin === undefined ||
    (typeof nextMin === 'number' &&
      typeof changedValue === 'number' &&
      nextMin >= changedValue)
  ) {
    if (typeof changedValue === 'number') {
      nextMin = changedValue - 1
    } else if (typeof changedValue === 'string') {
      nextMin = undefined
    } else {
      nextMin = changedValue
    }
  }

  return {
    ...props.condition,
    value: [nextMin, changedValue]
  }
}

function handleFieldChange(fieldKey: string): void {
  const newField = props.fields.find(f => f.key === fieldKey)
  if (!newField) {
    return
  }

  const newDataType = newField.dataType
  const newOperators = getOperatorsForDataType(newDataType)

  // 检查当前操作符是否对新类型有效
  const currentOperatorValid = newOperators.includes(props.condition.operator)

  // 获取新字段的默认操作符
  const defaultOperator = newField.defaultOperator || newOperators[0] || 'equals'
  emitUpdatedCondition({
    field: fieldKey,
    operator: currentOperatorValid ? props.condition.operator : defaultOperator,
    value: resolveFieldChangeValue(newField, props.condition.value)
  })
}

function handleOperatorChange(operator: SearchOperator): void {
  emitUpdatedCondition({
    operator
  })
}

function handleValueChange(value: unknown): void {
  emitUpdatedCondition({
    value: normalizeConditionValue(value)
  })
}

/**
 * between 操作符 - 最小值变化处理
 * 支持 el-input-number 和 el-date-picker 两种组件
 */
function handleBetweenMinChange(value: unknown): void {
  emit('update', buildBetweenCondition('min', extractChangedValue(value)))
}

/**
 * between 操作符 - 最大值变化处理
 * 支持 el-input-number 和 el-date-picker 两种组件
 */
function handleBetweenMaxChange(value: unknown): void {
  emit('update', buildBetweenCondition('max', extractChangedValue(value)))
}

function handleRemove(): void {
  emit('remove')
}
</script>

<style scoped lang="scss">
.condition-editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: var(--el-fill-color-blank);

  > * {
    flex: 1;
  }

  > button {
    flex-shrink: 0;
  }

  &__between-separator {
    flex-shrink: 0;
    padding: 0 4px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  // between 操作符时的特殊布局
  &--between {
    // 确保 el-input-number 和分隔符正确排列
    .el-input-number {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
