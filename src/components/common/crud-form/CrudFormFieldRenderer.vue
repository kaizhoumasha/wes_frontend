<script setup lang="ts">
import type { TreeNodeData } from 'element-plus/es/components/tree'
import type { FormFieldConfig } from '@/composables/useTableColumns'
import IconSelect from '@/components/ui/IconSelect.vue'

interface TreeSelectConfig {
  data: unknown[]
  props: {
    value: string
    label: string
    children: string
  }
  placeholder?: string
}

interface Props {
  field: FormFieldConfig
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue: any
  otherAttrs?: Record<string, unknown>
  isEditMode: boolean
  readonlyDisplayFields?: Record<string, string>
  treeSelectConfig?: TreeSelectConfig
}

const props = withDefaults(defineProps<Props>(), {
  error: undefined,
  otherAttrs: () => ({}),
  readonlyDisplayFields: undefined,
  treeSelectConfig: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

function isReadonlyField(): boolean {
  return !!props.readonlyDisplayFields && props.field.key in props.readonlyDisplayFields
}

function isTreeSelectField(): boolean {
  return !!props.treeSelectConfig && props.field.key === 'parent_id'
}

function updateValue(value: unknown): void {
  emit('update:modelValue', value)
}
</script>

<template>
  <el-form-item
    v-if="field.type === 'input'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-input
      :model-value="modelValue"
      v-bind="otherAttrs"
      :type="field.inputType || 'text'"
      :placeholder="field.placeholder"
      :disabled="field.readonly && isEditMode"
      :autocomplete="field.autocomplete"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'password'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-input
      :model-value="modelValue"
      v-bind="otherAttrs"
      type="password"
      :placeholder="field.placeholder"
      show-password
      :autocomplete="field.autocomplete"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'select'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-select
      :model-value="modelValue"
      v-bind="otherAttrs"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      clearable
      @update:model-value="updateValue"
    >
      <el-option
        v-for="(option, index) in field.options"
        :key="`${field.key}-option-${index}`"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'switch'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-switch
      :model-value="modelValue"
      v-bind="otherAttrs"
      :disabled="field.disabled"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'checkbox'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-checkbox-group
      :model-value="modelValue"
      v-bind="otherAttrs"
      @update:model-value="updateValue"
    >
      <el-checkbox
        v-for="(option, index) in field.options"
        :key="`${field.key}-checkbox-${index}`"
        :label="option.label"
        :value="option.value"
      />
    </el-checkbox-group>
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'textarea'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-input
      :model-value="modelValue"
      v-bind="otherAttrs"
      type="textarea"
      :rows="field.rows || 4"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'number' && !isReadonlyField() && !isTreeSelectField()"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-input-number
      :model-value="modelValue"
      v-bind="otherAttrs"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="isReadonlyField()"
    :label="field.label"
    :required="field.required"
  >
    <el-input
      :model-value="readonlyDisplayFields![field.key]"
      readonly
    />
  </el-form-item>

  <el-form-item
    v-else-if="isTreeSelectField()"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-tree-select
      :model-value="modelValue"
      :data="treeSelectConfig!.data as TreeNodeData[]"
      :props="treeSelectConfig!.props"
      :placeholder="treeSelectConfig!.placeholder || '请选择'"
      check-strictly
      :render-after-expand="false"
      clearable
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'date'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-date-picker
      :model-value="modelValue"
      v-bind="otherAttrs"
      type="date"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      value-format="YYYY-MM-DD"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'datetime'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-date-picker
      :model-value="modelValue"
      v-bind="otherAttrs"
      type="datetime"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      value-format="YYYY-MM-DD HH:mm:ss"
      @update:model-value="updateValue"
    />
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'remote-select'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <el-select
      :model-value="modelValue"
      v-bind="otherAttrs"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      filterable
      remote
      :remote-method="field.remoteMethod"
      :loading="field.loading"
      clearable
      @update:model-value="updateValue"
    >
      <el-option
        v-for="(option, index) in field.remoteOptions"
        :key="`${field.key}-remote-option-${index}`"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </el-form-item>

  <el-form-item
    v-else-if="field.type === 'icon'"
    :label="field.label"
    :required="field.required"
    :error="error"
  >
    <IconSelect
      :model-value="modelValue"
      :placeholder="field.placeholder"
      @update:model-value="updateValue"
    />
  </el-form-item>
</template>
