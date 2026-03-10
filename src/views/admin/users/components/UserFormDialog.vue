<!--
用户表单弹窗组件

支持创建和编辑两种模式
使用 vee-validate + Zod schemas 进行表单验证
-->
<template>
  <el-dialog
    :model-value="open"
    :title="dialogTitle"
    width="600px"
    @update:model-value="$emit('update:open', $event)"
  >
    <el-form
      label-width="100px"
      @submit.prevent="onSubmitClick"
    >
      <!-- 用户名 -->
      <el-form-item label="用户名" required :error="errors.username">
        <el-input
          v-model="username"
          v-bind="usernameAttrs"
          placeholder="请输入用户名（3-50字符）"
          :disabled="isEditMode"
          autocomplete="username"
        />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" required :error="errors.email">
        <el-input
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          placeholder="请输入邮箱地址"
          autocomplete="email"
        />
      </el-form-item>

      <!-- 姓名 -->
      <el-form-item label="姓名" :error="errors.full_name">
        <el-input
          v-model="full_name"
          v-bind="full_nameAttrs"
          placeholder="请输入姓名（可选）"
        />
      </el-form-item>

      <!-- 密码（仅创建模式） -->
      <el-form-item
        v-if="!isEditMode"
        label="密码"
        required
        :error="errors.password"
      >
        <el-input
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          placeholder="请输入密码（6-100字符）"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:open', false)">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="onSubmitClick"
      >
        {{ isEditMode ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useForm } from 'vee-validate'
import { UserCreateSchema, UserUpdateSchema } from '@/types/zod-extensions'
import type { CreateUserInput, UpdateUserInput } from '@/api/modules/user'

// ==================== 类型定义 ====================

interface Props {
  /** 弹窗是否打开 */
  open: boolean
  /** 编辑的用户 ID（null = 创建模式） */
  userId: number | null
}

type FormSubmitData = CreateUserInput | UpdateUserInput

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: FormSubmitData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================

const isEditMode = computed(() => props.userId !== null)

const dialogTitle = computed(() =>
  isEditMode.value ? '编辑用户' : '创建用户'
)

// ==================== 表单验证 (vee-validate + Zod) ====================

// 使用联合类型定义表单值（包含所有可能的字段）
interface FormValues {
  username: string
  email: string
  full_name?: string
  password?: string
}

// 创建表单实例（使用 Create schema 作为基础，动态切换）
const { handleSubmit, errors, defineField, resetForm } = useForm<FormValues>({
  validationSchema: computed(() => isEditMode.value ? UserUpdateSchema : UserCreateSchema),
  initialValues: {
    username: '',
    email: '',
    full_name: '',
    password: '',
  },
})

// 定义表单字段
const [username, usernameAttrs] = defineField('username')
const [email, emailAttrs] = defineField('email')
const [full_name, full_nameAttrs] = defineField('full_name')
const [password, passwordAttrs] = defineField('password')

// ==================== 提交状态 ====================

const submitting = ref(false)

function setSubmitting(value: boolean) {
  submitting.value = value
}

// ==================== 提交处理 ====================

/**
 * 提交表单
 */
const onSubmit = handleSubmit(async values => {
  setSubmitting(true)
  try {
    if (isEditMode.value) {
      // 编辑模式：只发送 email 和 full_name
      const updateData: UpdateUserInput = {
        email: values.email,
        full_name: values.full_name,
      }
      emit('submit', updateData)
    } else {
      // 创建模式：发送所有字段
      const createData: CreateUserInput = {
        username: values.username,
        email: values.email,
        full_name: values.full_name,
        password: values.password!,
      }
      emit('submit', createData)
    }
  } finally {
    setSubmitting(false)
  }
})

/**
 * 包装提交处理，暴露给模板使用
 */
function onSubmitClick() {
  onSubmit()
}

// ==================== 监听弹窗状态 ====================

// 弹窗关闭时重置表单
watch(() => props.open, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>
