<template>
  <div class="dashboard-container">
    <el-container>
      <el-header>
        <h1>P9 WES - 休斯顿智能仓储执行系统</h1>
        <el-button @click="handleLogout">退出</el-button>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="i in 4" :key="i">
            <el-card class="stat-card">
              <div class="stat-content">
                <h3>统计项 {{ i }}</h3>
                <p class="stat-value">{{ i * 123 }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <el-card>
              <template #header>
                <h3>系统状态</h3>
              </template>
              <p>欢迎使用 P9 WES 前端项目！</p>
              <p>当前环境: {{ env }}</p>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const env = computed(() => import.meta.env.VITE_APP_TITLE)

const handleLogout = () => {
  localStorage.removeItem('access_token')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.el-main {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  text-align: center;
}

.stat-content h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #999;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
</style>
