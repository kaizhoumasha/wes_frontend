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

function handleFieldChange(fieldKey: string) {
  const newField = props.fields.find(f => f.key === fieldKey)
  if (!newField) return

  const newDataType = newField.dataType
  const newOperators = getOperatorsForDataType(newDataType)
  const currentValue = props.condition.value

  // 检查当前操作符是否对新类型有效
  const currentOperatorValid = newOperators.includes(props.condition.operator)

  // 获取新字段的默认操作符
  const defaultOperator = newField.defaultOperator || newOperators[0] || 'equals'

  // 根据目标数据类型决定值的处理（彻底清理跨类型脏状态）
  let newValue: unknown = undefined

  switch (newDataType) {
    case 'boolean':
      // 布尔类型：总是重置为 true
      newValue = true
      break

    case 'enum':
      // 枚举类型：使用第一个选项
      if (newField.options && newField.options.length > 0) {
        newValue = newField.options[0].value
      }
      break

    case 'number':
      // 数值类型：仅当旧值是 number 时保留，否则清空
      if (typeof currentValue === 'number') {
        newValue = currentValue
      }
      // 否则 newValue 保持 undefined，会被后续逻辑处理为 undefined
      break

    case 'text':
    case 'date':
      // 文本/日期类型：仅当旧值是 string 时保留，否则清空为空字符串
      if (typeof currentValue === 'string') {
        newValue = currentValue
      } else {
        // 跨类型切换（如 boolean → text）：清空为空字符串
        newValue = ''
      }
      break
  }

  const newCondition: SearchCondition = {
    ...props.condition,
    field: fieldKey,
    operator: currentOperatorValid ? props.condition.operator : defaultOperator,
    value: newValue
  }

  emit('update', newCondition)
}

function handleOperatorChange(operator: SearchOperator) {
  const newCondition: SearchCondition = {
    ...props.condition,
    operator
  }
  emit('update', newCondition)
}

function handleValueChange(value: unknown) {
  // 根据字段数据类型进行值归一化
  let normalizedValue: unknown = value

  switch (fieldDataType.value) {
    case 'number':
      // 数值类型：将字符串转换为数值
      if (typeof value === 'string') {
        const num = parseFloat(value)
        normalizedValue = isNaN(num) ? undefined : num
      } else if (typeof value === 'number') {
        normalizedValue = value
      } else {
        normalizedValue = undefined
      }
      break

    case 'boolean':
      // 布尔类型：确保为布尔值
      normalizedValue = Boolean(value)
      break

    case 'text':
    case 'date':
      // 文本/日期类型：转换为字符串
      normalizedValue = String(value ?? '')
      break

    case 'enum':
      // 枚举类型：保持原值（已在 el-select 中确保类型正确）
      normalizedValue = value
      break
  }

  const newCondition: SearchCondition = {
    ...props.condition,
    value: normalizedValue
  }
  emit('update', newCondition)
}

/**
 * between 操作符 - 最小值变化处理
 * 支持 el-input-number 和 el-date-picker 两种组件
 */
function handleBetweenMinChange(value: unknown) {
  // el-input-number 的 change 事件：(cur: number | undefined, prev: number | undefined) => any
  // 我们需要取第一个参数 cur 作为最小值
  const minValue = typeof value === 'object' ? (value as { cur?: number })?.cur : value

  const currentValue = props.condition.value as unknown[] | undefined
  const currentMax = currentValue?.[1]

  // 如果 max 不存在或小于等于 min，自动调整 max
  let newMax = currentMax
  if (
    newMax === undefined ||
    (typeof minValue === 'number' && typeof newMax === 'number' && newMax <= minValue)
  ) {
    // 对于数值类型，设置 max = min + 1（确保 min < max）
    if (typeof minValue === 'number') {
      newMax = minValue + 1
    } else if (typeof minValue === 'string') {
      // 日期类型：如果最小值大于等于最大值，清空最大值让用户重新选择
      newMax = undefined
    } else {
      newMax = minValue
    }
  }

  const newCondition: SearchCondition = {
    ...props.condition,
    value: [minValue, newMax]
  }
  emit('update', newCondition)
}

/**
 * between 操作符 - 最大值变化处理
 * 支持 el-input-number 和 el-date-picker 两种组件
 */
function handleBetweenMaxChange(value: unknown) {
  // el-input-number 的 change 事件：(cur: number | undefined, prev: number | undefined) => any
  const maxValue = typeof value === 'object' ? (value as { cur?: number })?.cur : value

  const currentValue = props.condition.value as unknown[] | undefined
  const currentMin = currentValue?.[0]

  // 如果 min 不存在或大于等于 max，自动调整 min
  let newMin = currentMin
  if (
    newMin === undefined ||
    (typeof newMin === 'number' && typeof maxValue === 'number' && newMin >= maxValue)
  ) {
    // 对于数值类型，设置 min = max - 1（确保 min < max）
    if (typeof maxValue === 'number') {
      newMin = maxValue - 1
    } else if (typeof maxValue === 'string') {
      // 日期类型：如果最大值小于等于最小值，清空最小值让用户重新选择
      newMin = undefined
    } else {
      newMin = maxValue
    }
  }

  const newCondition: SearchCondition = {
    ...props.condition,
    value: [newMin, maxValue]
  }
  emit('update', newCondition)
}

function handleRemove() {
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
