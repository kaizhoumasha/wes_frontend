<script setup lang="ts">
/**
 * ResetPasswordDialog - 重置用户密码对话框
 *
 * 设计理念：
 * - 简洁安全的密码重置界面
 * - 密码强度实时反馈
 * - 一键生成随机密码
 */
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UsersItem as User, ResetPasswordInput as ResetUserPasswordInput } from '@/api/modules/users'
import { usersApi as userApi } from '@/api/modules/users'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { getSafeErrorMessage } from '@/utils/string'

// ==================== Props & Emits ====================

const props = defineProps<{
  user: User | null
}>()

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  success: []
}>()

// ==================== State ====================

const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)

// ==================== Computed ====================

const userName = computed(() => props.user?.username ?? '')

/** 密码强度 */
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return { level: 0, text: '', color: '' }

  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++

  if (score <= 2) return { level: 1, text: '弱', color: 'var(--el-color-danger)' }
  if (score <= 3) return { level: 2, text: '中', color: 'var(--el-color-warning)' }
  return { level: 3, text: '强', color: 'var(--el-color-success)' }
})

/** 密码验证错误 */
const passwordError = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 6) return '密码长度至少 6 位'
  if (password.value.length > 100) return '密码长度不能超过 100 位'
  return ''
})

/** 是否可以提交 */
const canSubmit = computed(() => {
  return password.value.length >= 6 && password.value.length <= 100
})

// ==================== Methods ====================

/** 重置表单 */
function resetForm() {
  password.value = ''
  showPassword.value = false
}

/** 切换密码显示 */
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

/** 生成随机密码 - 使用加密安全的随机数 */
function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  const array = new Uint32Array(12)
  crypto.getRandomValues(array)
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(array[i] % chars.length)
  }
  password.value = result
  showPassword.value = true
}

/** 复制密码到剪贴板 */
async function copyPassword() {
  if (!password.value) return
  try {
    await navigator.clipboard.writeText(password.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

/** 提交重置密码 */
async function handleSubmit() {
  if (!props.user || !canSubmit.value) return

  submitting.value = true

  try {
    const payload: ResetUserPasswordInput = {
      new_password: password.value
    }

    await userApi.resetPassword({ id: props.user.id }, payload)
    ElMessage.success(`已重置用户「${props.user.username}」的密码`)
    visible.value = false
    emit('success')
  } catch (e: unknown) {
    ElMessage.error(`重置密码失败：${getSafeErrorMessage(e)}`)
  } finally {
    submitting.value = false
  }
}

// ==================== Watchers ====================

watch(visible, isOpen => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<template>
  <StandardDialog
    v-model="visible"
    title="重置密码"
    size="sm"
    :confirm-loading="submitting"
    :confirm-disabled="!canSubmit"
    confirm-text="确认重置"
    confirm-type="warning"
    confirm-icon="lucide:key-round"
    @confirm="handleSubmit"
  >
    <div class="reset-password-dialog">
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-info__avatar">
          <AppIcon
            icon="ep:user"
            :size="24"
          />
        </div>
        <div class="user-info__detail">
          <span class="user-info__label">重置用户</span>
          <span class="user-info__name">{{ userName }}</span>
        </div>
      </div>

      <!-- 密码输入 -->
      <div class="password-field">
        <div class="password-field__header">
          <label class="password-field__label">
            新密码
            <span class="password-field__required">*</span>
          </label>
          <button
            type="button"
            class="password-field__generate"
            @click="generateRandomPassword"
          >
            <AppIcon
              icon="ep:refresh"
              :size="14"
            />
            随机生成
          </button>
        </div>
        <div class="password-field__input">
          <el-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入 6-100 位新密码"
            clearable
            @keydown.enter="canSubmit && handleSubmit()"
          >
            <template #suffix>
              <AppIcon
                v-if="password"
                icon="ep:document-copy"
                :size="16"
                class="password-field__action"
                @click="copyPassword"
              />
              <AppIcon
                :icon="showPassword ? 'ep:view' : 'ep:hide'"
                :size="16"
                class="password-field__action"
                @click="togglePasswordVisibility"
              />
            </template>
          </el-input>

          <!-- 密码强度指示器 -->
          <div
            v-if="password"
            class="password-strength"
          >
            <div class="password-strength__bar">
              <div
                class="password-strength__fill"
                :style="{
                  width: `${(passwordStrength.level / 3) * 100}%`,
                  backgroundColor: passwordStrength.color
                }"
              />
            </div>
            <span
              class="password-strength__text"
              :style="{ color: passwordStrength.color }"
            >
              {{ passwordStrength.text }}
            </span>
          </div>

          <!-- 错误提示 -->
          <div
            v-if="passwordError"
            class="password-field__error"
          >
            {{ passwordError }}
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-tip">
        <AppIcon
          icon="ep:warning-filled"
          :size="14"
        />
        <span>重置后，用户需要使用新密码重新登录</span>
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.reset-password-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ==================== 用户信息 ==================== */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.user-info__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--el-color-warning-light-7);
  border-radius: 50%;
  color: var(--el-color-warning-dark-2);
}

.user-info__detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.user-info__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* ==================== 密码输入 ==================== */
.password-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.password-field__required {
  color: var(--el-color-danger);
  margin-left: 2px;
}

.password-field__generate {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border: none;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.password-field__generate:hover {
  background: var(--el-color-primary-light-8);
}

.password-field__input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-field__action {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  transition: color 0.15s ease;
  margin-left: 4px;
}

.password-field__action:hover {
  color: var(--el-text-color-primary);
}

.password-field__error {
  font-size: 12px;
  color: var(--el-color-danger);
}

/* ==================== 密码强度 ==================== */
.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-strength__bar {
  flex: 1;
  height: 4px;
  background: var(--el-fill-color);
  border-radius: 2px;
  overflow: hidden;
}

.password-strength__fill {
  height: 100%;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.password-strength__text {
  font-size: 12px;
  font-weight: 500;
  min-width: 20px;
}

/* ==================== 安全提示 ==================== */
.security-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border-radius: 6px;
}

.security-tip .app-icon {
  color: var(--el-color-warning);
}
</style>
