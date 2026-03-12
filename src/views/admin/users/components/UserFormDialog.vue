<!--
用户表单弹窗组件

支持创建和编辑两种模式
使用 vee-validate + Zod schemas 进行表单验证
内置乐观锁冲突处理和恢复机制
-->
<template>
  <el-dialog
    :model-value="open"
    :title="dialogTitle"
    width="600px"
    @update:model-value="$emit('update:open', $event)"
  >
    <!-- 使用 v-if 确保只在弹窗打开时才渲染表单，避免动态 schema 切换时的验证错误 -->
    <el-form
      v-if="open"
      label-width="100px"
      @submit.prevent="onSubmitClick"
    >
      <!-- 用户名 -->
      <el-form-item
        label="用户名"
        required
        :error="errors.username"
      >
        <el-input
          v-model="username"
          v-bind="usernameAttrs"
          placeholder="请输入用户名（3-50字符）"
          :disabled="isEditMode"
          autocomplete="username"
        />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item
        label="邮箱"
        required
        :error="errors.email"
      >
        <el-input
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          placeholder="请输入邮箱地址"
          autocomplete="email"
        />
      </el-form-item>

      <!-- 姓名 -->
      <el-form-item
        label="姓名"
        :error="errors.full_name"
      >
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
      <el-button @click="$emit('update:open', false)">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="onSubmitClick"
      >
        {{ isEditMode ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>

  <!-- 乐观锁冲突恢复对话框 -->
  <el-dialog
    v-model="conflictDialogVisible"
    title="数据已被修改"
    width="450px"
    :append-to-body="true"
  >
    <el-alert
      type="warning"
      :closable="false"
      show-icon
    >
      该用户的数据已被其他用户修改。您可以选择：
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

    <template #footer>
      <el-button @click="conflictDialogVisible = false">关闭</el-button>
      <el-button
        type="primary"
        @click="handleConflictRefresh"
      >
        刷新并继续
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { UserCreateSchema, UserUpdateSchema } from '@/types/zod-extensions'
import { userApi } from '@/api/modules/user'
import type { CreateUserInput, UpdateUserInput, User } from '@/api/modules/user'
import { ElMessage } from 'element-plus'

// ==================== 类型定义 ====================

interface Props {
  /** 弹窗是否打开 */
  open: boolean
  /** 编辑的用户 ID（null = 创建模式） */
  userId: number | null
  /** 缓存的用户数据（可选，优先使用此数据而不是请求后端） */
  cachedUserData?: User | null
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

const dialogTitle = computed(() => (isEditMode.value ? '编辑用户' : '创建用户'))

// ==================== 表单验证 (vee-validate + Zod) ====================

// 使用联合类型定义表单值（包含所有可能的字段）
interface FormValues {
  username: string
  email: string
  full_name: string
  password: string
  version?: number // 版本号作为表单字段，用于乐观锁
}

/**
 * 创建空表单值
 */
function createEmptyFormValues(): FormValues {
  return {
    username: '',
    email: '',
    full_name: '',
    password: '',
    version: undefined
  }
}

const createFormSchema = toTypedSchema(UserCreateSchema)
// update schema 包含 version 字段（乐观锁必需）
const updateFormSchema = toTypedSchema(UserUpdateSchema)

// 创建表单实例（使用动态 schema）
const { handleSubmit, errors, defineField, resetForm } = useForm<FormValues>({
  validationSchema: computed(() => (isEditMode.value ? updateFormSchema : createFormSchema)),
  initialValues: createEmptyFormValues()
})

// 定义表单字段
const [username, usernameAttrs] = defineField('username')
const [email, emailAttrs] = defineField('email')
const [full_name, full_nameAttrs] = defineField('full_name')
const [password, passwordAttrs] = defineField('password')
const [version] = defineField('version')

// ==================== 提交状态 ====================

const submitting = ref(false)

function setSubmitting(value: boolean) {
  submitting.value = value
}

// ==================== 乐观锁冲突处理 ====================

/**
 * 乐观锁冲突对话框可见性
 */
const conflictDialogVisible = ref(false)

/**
 * 待恢复的表单数据（冲突发生时保存）
 */
const pendingFormData = ref<UpdateUserInput | null>(null)

/**
 * 处理乐观锁冲突
 */
function handleVersionConflict(error: unknown) {
  // 检查是否是版本冲突错误（HTTP 409 或特定错误码）
  const isConflictError =
    error instanceof Error &&
    (error.message.includes('version') ||
      error.message.includes('409') ||
      error.message.includes('冲突'))

  if (isConflictError && isEditMode.value) {
    // 保存当前表单数据
    const currentVersion = version.value
    if (currentVersion === undefined) {
      ElMessage.error('版本号缺失，请重新打开编辑弹窗')
      return
    }
    pendingFormData.value = {
      version: currentVersion,
      email: email.value !== originalData.value?.email ? email.value : undefined,
      full_name: full_name.value !== originalData.value?.full_name ? full_name.value : undefined
    }
    // 显示冲突对话框
    conflictDialogVisible.value = true
  } else {
    // 其他错误：直接显示错误消息
    const message = error instanceof Error ? error.message : '保存失败'
    ElMessage.error(message)
  }
}

/**
 * 刷新数据并继续编辑
 */
async function handleConflictRefresh() {
  if (!props.userId) return

  try {
    // 从后端获取最新数据
    const latestUserData = await userApi.getById(props.userId)

    // 保存用户当前的修改
    const currentEmail = email.value
    const currentFullName = full_name.value

    // 填充最新数据
    resetForm({
      values: {
        username: latestUserData.username,
        email: latestUserData.email,
        full_name: latestUserData.full_name || '',
        password: '',
        version: latestUserData.version
      }
    })

    // 更新原始数据
    originalData.value = {
      email: latestUserData.email,
      full_name: latestUserData.full_name || '',
      version: latestUserData.version
    }

    // 如果用户之前修改了字段，重新应用这些修改
    if (currentEmail !== originalData.value?.email) {
      email.value = currentEmail
    }
    if (currentFullName !== originalData.value?.full_name) {
      full_name.value = currentFullName
    }

    // 关闭冲突对话框
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

// ==================== 原始数据对比 ====================

/**
 * 保存原始数据（用于对比哪些字段有变化）
 */
const originalData = ref<{
  email: string
  full_name: string
  version: number
} | null>(null)

// ==================== 提交处理 ====================

/**
 * 提交表单
 */
const onSubmit = handleSubmit(async values => {
  setSubmitting(true)
  try {
    if (isEditMode.value) {
      // 验证 version 字段（乐观锁必需）
      if (values.version === undefined) {
        ElMessage.error('版本号缺失，请重新打开编辑弹窗')
        return
      }

      // 编辑模式：只发送有变化的字段 + version
      const updateData: UpdateUserInput = {
        version: values.version
      }

      // 对比字段变化
      if (values.email !== originalData.value?.email) {
        updateData.email = values.email
      }
      if (values.full_name !== originalData.value?.full_name) {
        updateData.full_name = values.full_name
      }

      emit('submit', updateData)
    } else {
      // 创建模式：发送所有字段
      const createData: CreateUserInput = {
        username: values.username,
        email: values.email,
        full_name: values.full_name,
        password: values.password!
      }
      emit('submit', createData)
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
function onSubmitClick() {
  onSubmit()
}

// ==================== 监听弹窗打开 ====================

// 监听弹窗打开状态和用户 ID
watch(
  () => [props.open, props.userId] as const,
  async ([open, userId]) => {
    if (!open) {
      // 弹窗关闭时重置表单，避免下次打开时出现验证错误
      resetForm({
        values: createEmptyFormValues()
      })
      originalData.value = null
      conflictDialogVisible.value = false
      pendingFormData.value = null
      return
    }

    if (userId) {
      // 编辑模式：优先使用缓存数据（后端返回的最新数据）
      let userData: User

      if (props.cachedUserData) {
        // 使用缓存的最新数据（来自后端更新返回）
        userData = props.cachedUserData
      } else {
        // 降级方案：从后端获取最新数据
        try {
          userData = await userApi.getById(userId)
        } catch (error) {
          console.error('获取用户数据失败:', error)
          ElMessage.error('获取用户数据失败，请重试')
          // 发生错误时关闭弹窗
          emit('update:open', false)
          return
        }
      }

      // 使用 resetForm 填充表单数据，避免触发验证
      resetForm({
        values: {
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name || '',
          password: '', // 编辑模式不需要密码
          version: userData.version // 版本号作为表单字段
        }
      })

      // 保存原始数据（用于对比哪些字段有变化）
      originalData.value = {
        email: userData.email,
        full_name: userData.full_name || '',
        version: userData.version
      }
    } else {
      // 创建模式：重置表单到初始值
      resetForm({
        values: createEmptyFormValues()
      })
      originalData.value = null
    }
  },
  { immediate: true }
)
</script>
