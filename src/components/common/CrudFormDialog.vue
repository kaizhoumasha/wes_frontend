<!--
通用 CRUD 表单对话框组件

功能：
- 支持创建和编辑两种模式
- 基于 Zod schema 的表单验证
- 乐观锁冲突处理
- 字段级变更检测（仅发送变化的字段）
- 缓存数据支持（避免不必要的 API 请求）

使用示例：
```vue
<template>
  <CrudFormDialog
    v-model:open="dialogOpen"
    :edit-id="editingUserId"
    :cached-data="cachedUserData"
    :schema="UserSchema"
    :field-config="FIELD_CONFIG"
    title="用户"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { UserSchema } from '@/types/zod-extensions'
import CrudFormDialog from '@/components/common/CrudFormDialog.vue'

const FIELD_CONFIG = [
  {
    key: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    readonly: true, // 编辑模式下禁用
    required: true
  },
  {
    key: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    required: true
  },
  {
    key: 'full_name',
    label: '姓名',
    type: 'input',
    placeholder: '请输入姓名',
    required: false
  }
]

const dialogOpen = ref(false)
const editingUserId = ref<number | null>(null)
const cachedUserData = ref(null)

async function handleSubmit(data) {
  // data 在创建模式下包含所有字段
  // 在编辑模式下只包含变化的字段 + version
  await api.update(data)
}
</script>
```
-->
<template>
  <StandardDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="width"
    :confirm-loading="submitting"
    :confirm-text="isEditMode ? '保存' : '创建'"
    :confirm-icon="isEditMode ? 'lucide:save' : 'lucide:plus'"
    @confirm="onSubmitClick"
  >
    <!-- 使用 v-if 确保只在弹窗打开时才渲染表单，避免动态 schema 切换时的验证错误 -->
    <el-form
      v-if="open"
      :model="formValues"
      label-width="100px"
      @submit.prevent="onSubmitClick"
    >
      <!-- 动态渲染表单字段 -->
      <template
        v-for="field in visibleFields"
        :key="field.key"
      >
        <!-- 输入框 -->
        <el-form-item
          v-if="field.type === 'input'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-input
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            :type="field.inputType || 'text'"
            :placeholder="field.placeholder"
            :disabled="field.readonly && isEditMode"
            :autocomplete="field.autocomplete"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 密码框 -->
        <el-form-item
          v-else-if="field.type === 'password'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-input
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            type="password"
            :placeholder="field.placeholder"
            show-password
            :autocomplete="field.autocomplete"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 选择框 -->
        <el-form-item
          v-else-if="field.type === 'select'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-select
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            clearable
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          >
            <el-option
              v-for="(option, index) in field.options"
              :key="`${field.key}-option-${index}`"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <!-- 开关 -->
        <el-form-item
          v-else-if="field.type === 'switch'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-switch
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            :disabled="field.disabled"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 多选框 -->
        <el-form-item
          v-else-if="field.type === 'checkbox'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-checkbox-group
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          >
            <el-checkbox
              v-for="(option, index) in field.options"
              :key="`${field.key}-checkbox-${index}`"
              :label="option.label"
              :value="option.value"
            />
          </el-checkbox-group>
        </el-form-item>

        <!-- 文本域 -->
        <el-form-item
          v-else-if="field.type === 'textarea'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-input
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            type="textarea"
            :rows="field.rows || 4"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 数字输入框 -->
        <el-form-item
          v-else-if="field.type === 'number'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-input-number
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :min="field.min"
            :max="field.max"
            :step="field.step || 1"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 日期选择器 -->
        <el-form-item
          v-else-if="field.type === 'date'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-date-picker
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            type="date"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            value-format="YYYY-MM-DD"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 日期时间选择器 -->
        <el-form-item
          v-else-if="field.type === 'datetime'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-date-picker
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            type="datetime"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            value-format="YYYY-MM-DD HH:mm:ss"
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          />
        </el-form-item>

        <!-- 远程搜索选择器 -->
        <el-form-item
          v-else-if="field.type === 'remote-select'"
          :label="field.label"
          :required="field.required"
          :error="errors[field.key]"
        >
          <el-select
            :model-value="getFieldValue(field.key)"
            v-bind="getFieldOtherAttrs(field.key)"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            filterable
            remote
            :remote-method="field.remoteMethod"
            :loading="field.loading"
            clearable
            @update:model-value="(val: any) => getFieldHandler(field.key)?.(val)"
          >
            <el-option
              v-for="(option, index) in field.remoteOptions"
              :key="`${field.key}-remote-option-${index}`"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </template>
    </el-form>

  </StandardDialog>

  <!-- 乐观锁冲突恢复对话框 -->
  <StandardDialog
    v-model="conflictDialogVisible"
    title="数据已被修改"
    title-icon="warning"
    width="450px"
    cancel-text="关闭"
    confirm-text="刷新并继续"
    confirm-type="warning"
    @confirm="handleConflictRefresh"
  >
    <el-alert
      type="warning"
      :closable="false"
      show-icon
    >
      该数据已被其他用户修改。您可以选择：
      <ul style="margin: 8px 0 0 20px; padding: 0">
        <li>
          <strong>刷新并继续编辑</strong>
          ：获取最新数据并保留您的修改
        </li>
        <li>
          <strong>关闭弹窗</strong>
          ：放弃当前修改，稍后重试
        </li>
      </ul>
    </el-alert>
  </StandardDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ZodSchema } from 'zod'
import { ElMessage } from 'element-plus'
import type { FormFieldConfig, FormMode } from '@/composables/useTableColumns'
import { StandardDialog } from '@/components/ui/StandardDialog'

// ============================================================================
// 类型定义
// ============================================================================

interface Props {
  /** 弹窗是否打开 */
  open: boolean
  /** 编辑的 ID（null = 创建模式） */
  editId: number | string | null
  /** 缓存的数据（可选，优先使用此数据而不是请求后端） */
  cachedData?: Record<string, unknown> | null
  /** 获取最新数据（无缓存或冲突恢复时使用） */
  loadData?: (id: number | string) => Promise<Record<string, unknown> | null | undefined>
  /** Zod schema（创建模式） */
  schema?: ZodSchema
  /** Zod schema（编辑模式，可选包含 version 字段） */
  updateSchema?: ZodSchema
  /** 字段配置列表 */
  fieldConfig: FormFieldConfig[]
  /** 对话框标题（可选，默认根据模式生成） */
  title?: string
  /** 对话框宽度 */
  width?: string
  /** 是否显示乐观锁冲突处理（默认 true） */
  enableOptimisticLock?: boolean
  /** 版本号字段名（默认 'version'） */
  versionField?: string
}

type FormSubmitData = Record<string, unknown>

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: FormSubmitData): void
}

const props = withDefaults(defineProps<Props>(), {
  schema: undefined,
  updateSchema: undefined,
  title: undefined,
  loadData: undefined,
  width: '600px',
  enableOptimisticLock: true,
  versionField: 'version',
  cachedData: null
})

const emit = defineEmits<Emits>()

// ============================================================================
// 计算属性
// ============================================================================

const isEditMode = computed(() => props.editId !== null)
const currentFormMode = computed<FormMode>(() => (isEditMode.value ? 'edit' : 'create'))

const dialogTitle = computed(() => {
  if (props.title) return props.title
  return isEditMode.value ? '编辑' : '创建'
})

const dialogVisible = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

/**
 * 获取可见的字段列表（根据编辑/创建模式过滤）
 */
function isFieldVisibleInMode(field: FormFieldConfig, mode: FormMode): boolean {
  if (!field.modes?.length) {
    return true
  }

  return field.modes.includes(mode)
}

const visibleFields = computed(() =>
  props.fieldConfig.filter(field => isFieldVisibleInMode(field, currentFormMode.value))
)

// ============================================================================
// 表单验证 (vee-validate + Zod)
// ============================================================================

type FormValues = Record<string, unknown>

/**
 * 创建空表单值
 */
function createEmptyFormValues(): FormValues {
  const values: FormValues = {}
  props.fieldConfig.forEach(field => {
    values[field.key] = field.type === 'checkbox' ? [] : ''
  })
  // 添加版本号字段
  if (props.enableOptimisticLock) {
    values[props.versionField] = undefined
  }
  return values
}

function buildFormValuesFromData(data: Record<string, unknown>): FormValues {
  const formValues = createEmptyFormValues()

  props.fieldConfig.forEach(field => {
    formValues[field.key] = data[field.key] ?? ''
  })

  if (props.enableOptimisticLock && props.versionField in data) {
    formValues[props.versionField] = data[props.versionField]
  }

  return formValues
}

function resetDialogState(): void {
  resetForm({
    values: createEmptyFormValues()
  })
  originalData.value = null
  conflictDialogVisible.value = false
  pendingFormData.value = null
}

function collectChangedFields(values: FormValues): Record<string, unknown> {
  const changedData: Record<string, unknown> = {}

  props.fieldConfig.forEach(field => {
    if (!isFieldVisibleInMode(field, 'edit')) {
      return
    }

    const currentValue = values[field.key]
    const originalValue = originalData.value?.[field.key]

    if (currentValue !== originalValue) {
      changedData[field.key] = currentValue
    }
  })

  return changedData
}

function collectCreateFields(values: FormValues): Record<string, unknown> {
  const createData: Record<string, unknown> = {}

  props.fieldConfig.forEach(field => {
    if (!isFieldVisibleInMode(field, 'create')) {
      return
    }

    createData[field.key] = values[field.key]
  })

  return createData
}

// 动态 schema
const formSchema = computed(() => {
  if (isEditMode.value && props.updateSchema) {
    return toTypedSchema(props.updateSchema)
  }
  if (props.schema) {
    return toTypedSchema(props.schema)
  }
  // 如果没有 schema，返回一个空的 zod schema
  return toTypedSchema({} as unknown as ZodSchema)
})

// 创建表单实例
const {
  handleSubmit,
  errors,
  defineField,
  resetForm,
  values: formValues,
  setFieldValue
} = useForm<FormValues>({
  validationSchema: formSchema,
  initialValues: createEmptyFormValues()
})

// 动态创建字段绑定 - 存储 field 配置和对应的 vee-validate 绑定
/* eslint-disable @typescript-eslint/no-explicit-any */
const fieldBindingsMap = new Map<string, { value: any; attrs: any }>()

// 使用 watch 监听 fieldConfig 变化，重新创建绑定
watch(
  () => props.fieldConfig,
  () => {
    fieldBindingsMap.clear()
    props.fieldConfig.forEach(field => {
      try {
        const [value, attrs] = defineField(field.key as any)
        fieldBindingsMap.set(field.key, { value, attrs })
      } catch {
        // 字段不存在时，使用默认值
        const defaultValue = (formValues.value as Record<string, unknown>)[field.key] ?? ''
        fieldBindingsMap.set(field.key, { value: defaultValue, attrs: null })
      }
    })
  },
  { immediate: true }
)
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 获取字段值（用于 v-model 绑定）
 */
function getFieldValue(key: string) {
  const binding = fieldBindingsMap.get(key)
  if (!binding) return (formValues.value as Record<string, unknown>)[key] ?? ''
  // value 是 ref，需要访问 .value
  return binding.value?.value ?? binding.value ?? ''
}

/**
 * 获取 vee-validate 的事件处理器（用于 @update:model-value）
 * 使用 setFieldValue 直接更新表单值，避免 attrs getter 的上下文问题
 */
function getFieldHandler(key: string) {
  return (value: unknown) => {
    setFieldValue(key as keyof FormValues, value)
  }
}

/**
 * 获取字段的其他属性（不含事件处理器）
 */
function getFieldOtherAttrs(key: string): Record<string, unknown> {
  const binding = fieldBindingsMap.get(key)
  if (!binding || !binding.attrs) return {}
  const attrsObj = typeof binding.attrs === 'function' ? binding.attrs() : binding.attrs.props
  if (!attrsObj) return {}
  // 移除事件处理器，因为它们由 getFieldHandler 单独处理
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 'onUpdate:modelValue': _unused, ...rest } = attrsObj
  return rest
}

// ============================================================================
// 提交状态
// ============================================================================

const submitting = ref(false)

function setSubmitting(value: boolean) {
  submitting.value = value
}

// ============================================================================
// 乐观锁冲突处理
// ============================================================================

/**
 * 乐观锁冲突对话框可见性
 */
const conflictDialogVisible = ref(false)

/**
 * 待恢复的表单数据（冲突发生时保存）
 */
const pendingFormData = ref<Record<string, unknown> | null>(null)

/**
 * 保存原始数据（用于对比哪些字段有变化）
 */
const originalData = ref<Record<string, unknown> | null>(null)

/**
 * 处理乐观锁冲突
 */
function handleVersionConflict(error: unknown) {
  // 检查是否是版本冲突错误
  const isConflictError =
    error instanceof Error &&
    (error.message.includes('version') ||
      error.message.includes('409') ||
      error.message.includes('冲突'))

  if (isConflictError && isEditMode.value && props.enableOptimisticLock) {
    // 保存当前表单数据
    const currentVersion = getFieldValue(props.versionField)
    if (currentVersion === undefined || currentVersion === '') {
      ElMessage.error('版本号缺失，请重新打开编辑弹窗')
      return
    }

    // 构建只包含变化字段的数据
    const changedData: Record<string, unknown> = {
      [props.versionField]: currentVersion
    }

    props.fieldConfig.forEach(field => {
      if (!isFieldVisibleInMode(field, 'edit')) return

      const currentValue = getFieldValue(field.key)
      const originalValue = originalData.value?.[field.key]

      if (currentValue !== originalValue) {
        changedData[field.key] = currentValue
      }
    })

    pendingFormData.value = changedData
    conflictDialogVisible.value = true
  } else {
    // 其他错误：直接显示错误消息
    const message = error instanceof Error ? error.message : '操作失败'
    ElMessage.error(message)
  }
}

/**
 * 刷新数据并继续编辑
 */
async function handleConflictRefresh() {
  if (!props.editId) {
    return
  }

  try {
    const latestData = await resolveEditData(props.editId, { useCache: false })
    const pendingData = pendingFormData.value

    resetForm({
      values: buildFormValuesFromData(latestData)
    })

    originalData.value = { ...latestData }

    if (pendingData) {
      Object.entries(pendingData).forEach(([key, value]) => {
        if (key === props.versionField) {
          return
        }

        setFieldValue(key as keyof FormValues, value)
      })
    }

    conflictDialogVisible.value = false
    pendingFormData.value = null
    ElMessage.success('数据已刷新，您可以继续编辑')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败，请关闭弹窗后重试')
    conflictDialogVisible.value = false
    pendingFormData.value = null
  }
}

// ============================================================================
// 提交处理
// ============================================================================

/**
 * 提交表单
 */
const onSubmit = handleSubmit(async values => {
  setSubmitting(true)
  try {
    if (isEditMode.value) {
      // 编辑模式：只发送有变化的字段 + version
      const updateData = collectChangedFields(values)

      // 添加版本号
      if (props.enableOptimisticLock) {
        const versionValue = values[props.versionField]
        if (versionValue === undefined || versionValue === '') {
          ElMessage.error('版本号缺失，请重新打开编辑弹窗')
          return
        }
        updateData[props.versionField] = versionValue
      }

      emit('submit', updateData)
    } else {
      // 创建模式：发送所有字段
      emit('submit', collectCreateFields(values))
    }
  } catch (error) {
    // 捕获版本冲突错误
    handleVersionConflict(error)
  } finally {
    setSubmitting(false)
  }
})

/**
 * 包装提交处理，暴露给模板使用
 */
function onSubmitClick(): void {
  onSubmit()
}

async function resolveEditData(
  editId: number | string,
  options: { useCache?: boolean } = {}
): Promise<Record<string, unknown>> {
  if (options.useCache !== false && props.cachedData) {
    return props.cachedData
  }

  if (!props.loadData) {
    return {}
  }

  const loadedData = await props.loadData(editId)
  return loadedData ?? {}
}

// ============================================================================
// 监听弹窗打开
// ============================================================================

watch(
  () => [props.open, props.editId] as const,
  async ([open, editId]) => {
    if (!open) {
      resetDialogState()
      return
    }

    if (editId !== null) {
      let data: Record<string, unknown>

      try {
        data = await resolveEditData(editId)
      } catch (error) {
        console.error('获取编辑数据失败:', error)
        ElMessage.error('获取数据失败，请重试')
        emit('update:open', false)
        return
      }

      resetForm({
        values: buildFormValuesFromData(data)
      })

      // 保存原始数据
      originalData.value = { ...data }
    } else {
      // 创建模式：重置表单
      resetForm({
        values: createEmptyFormValues()
      })
      originalData.value = null
    }
  },
  { immediate: true }
)
</script>
