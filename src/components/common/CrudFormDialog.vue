<script setup lang="ts">
import { computed, toRef, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ZodSchema } from 'zod'
import type { FormFieldConfig, FormMode } from '@/composables/useTableColumns'
import { StandardDialog } from '@/components/ui/StandardDialog'
import {
  buildFormValuesFromData,
  createEmptyFormValues,
  isFieldVisibleInMode,
  type CrudFormValues
} from '@/components/common/crud-form/form-helpers'
import { useCrudFormBindings } from '@/components/common/crud-form/useCrudFormBindings'
import { useCrudFormEditSession } from '@/components/common/crud-form/useCrudFormEditSession'
import { useCrudFormSubmit } from '@/components/common/crud-form/useCrudFormSubmit'
import CrudFormFieldRenderer from '@/components/common/crud-form/CrudFormFieldRenderer.vue'

interface Props {
  open: boolean
  editId: number | string | null
  cachedData?: Record<string, unknown> | null
  loadData?: (id: number | string) => Promise<Record<string, unknown> | null | undefined>
  schema?: ZodSchema
  updateSchema?: ZodSchema
  fieldConfig: FormFieldConfig[]
  title?: string
  width?: string
  enableOptimisticLock?: boolean
  versionField?: string
  createInitialValues?: Record<string, unknown> | null
  readonlyDisplayFields?: Record<string, string>
  treeSelectConfig?: {
    data: unknown[]
    props: {
      value: string
      label: string
      children: string
    }
    placeholder?: string
  }
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
  cachedData: null,
  createInitialValues: null,
  readonlyDisplayFields: undefined,
  treeSelectConfig: undefined
})

const emit = defineEmits<Emits>()

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

function isTreeSelectField(key: string): boolean {
  return !!props.treeSelectConfig && key === 'parent_id'
}

type FormValues = CrudFormValues

function buildEmptyFormValues(): FormValues {
  return createEmptyFormValues({
    fieldConfig: props.fieldConfig,
    createInitialValues: props.createInitialValues,
    enableOptimisticLock: props.enableOptimisticLock,
    versionField: props.versionField,
    isTreeSelectField
  })
}

function mapFormValuesFromData(data: Record<string, unknown>): FormValues {
  return buildFormValuesFromData({
    data,
    fieldConfig: props.fieldConfig,
    createInitialValues: props.createInitialValues,
    enableOptimisticLock: props.enableOptimisticLock,
    versionField: props.versionField,
    isTreeSelectField
  })
}

const formSchema = computed(() => {
  if (isEditMode.value && props.updateSchema) {
    return toTypedSchema(props.updateSchema)
  }
  if (props.schema) {
    return toTypedSchema(props.schema)
  }
  return toTypedSchema({} as unknown as ZodSchema)
})

const {
  handleSubmit,
  errors,
  defineField,
  resetForm,
  values: formValues,
  setFieldValue
} = useForm<FormValues>({
  validationSchema: formSchema,
  initialValues: buildEmptyFormValues()
})

const { getFieldValue, getFieldHandler, getFieldOtherAttrs } = useCrudFormBindings({
  fieldConfig: toRef(props, 'fieldConfig'),
  formValues: computed(() => formValues.value as Record<string, unknown>),
  defineField: path => defineField(path as keyof FormValues),
  setFieldValue: (key, value) => {
    setFieldValue(key as keyof FormValues, value)
  }
})

const { originalData, resetDialogState, resolveEditData } = useCrudFormEditSession({
  open: toRef(props, 'open'),
  editId: toRef(props, 'editId'),
  cachedData: toRef(props, 'cachedData'),
  loadData: toRef(props, 'loadData'),
  buildEmptyFormValues,
  mapFormValuesFromData,
  resetForm,
  closeDialog: () => emit('update:open', false)
})

const visibleFields = computed(() => {
  return props.fieldConfig.filter(field =>
    isFieldVisibleInMode(field, currentFormMode.value)
  )
})

const { submitting, conflictDialogVisible, resetSubmitState, onSubmit, handleConflictRefresh } =
  useCrudFormSubmit<FormValues>({
    isEditMode,
    editId: toRef(props, 'editId'),
    enableOptimisticLock: toRef(props, 'enableOptimisticLock'),
    versionField: toRef(props, 'versionField'),
    fieldConfig: toRef(props, 'fieldConfig'),
    originalData,
    handleSubmit,
    getFieldValue,
    setFieldValue: (key, value) => {
      setFieldValue(key as keyof FormValues, value)
    },
    resetForm,
    mapFormValuesFromData,
    resolveEditData,
    emitSubmit: data => emit('submit', data)
  })

function onSubmitClick(): void {
  onSubmit()
}

watch(
  () => props.open,
  open => {
    if (!open) {
      resetDialogState()
      resetSubmitState()
    }
  }
)
</script>

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
    <el-form
      v-if="open"
      :model="formValues"
      label-width="100px"
      @submit.prevent="onSubmitClick"
    >
      <CrudFormFieldRenderer
        v-for="field in visibleFields"
        :key="field.key"
        :field="field"
        :error="errors[field.key]"
        :model-value="getFieldValue(field.key)"
        :other-attrs="getFieldOtherAttrs(field.key)"
        :is-edit-mode="isEditMode"
        :readonly-display-fields="readonlyDisplayFields"
        :tree-select-config="treeSelectConfig"
        @update:model-value="val => getFieldHandler(field.key)?.(val)"
      />
    </el-form>
  </StandardDialog>

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
