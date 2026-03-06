<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件
</script>

<style>
/* ==================== 全局基础样式 ==================== */
* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==================== 全局滚动条样式 ==================== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgb(0 243 255 / 10%);
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(0 243 255 / 20%);
}

/* ==================== Element Plus 深色主题覆盖 ==================== */

/* 背景 */
.el-main,
.el-card,
.el-table,
.el-form {
  background-color: transparent !important;
}

/* 卡片 */
.el-card {
  background: rgb(13 17 23 / 80%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
  backdrop-filter: blur(10px) !important;
}

.el-card__header {
  border-bottom: 1px solid rgb(0 243 255 / 10%) !important;
  color: rgb(255 255 255 / 90%) !important;
}

/* 表格 */
.el-table {
  color: rgb(255 255 255 / 80%) !important;
}

.el-table th.el-table__cell {
  background: rgb(0 243 255 / 5%) !important;
  color: #00f3ff !important;
  border-bottom: 1px solid rgb(0 243 255 / 15%) !important;
}

.el-table td.el-table__cell {
  border-bottom: 1px solid rgb(0 243 255 / 8%) !important;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: rgb(0 243 255 / 5%) !important;
}

/* 表单 */
.el-form-item__label {
  color: rgb(255 255 255 / 70%) !important;
}

.el-input__wrapper,
.el-textarea__inner {
  background: rgb(255 255 255 / 3%) !important;
  border: 1px solid rgb(255 255 255 / 10%) !important;
  box-shadow: none !important;
}

.el-input__wrapper:hover,
.el-textarea__inner:hover {
  border-color: rgb(0 243 255 / 30%) !important;
}

.el-input__wrapper.is-focus,
.el-textarea__inner:focus {
  border-color: #00f3ff !important;
  box-shadow: 0 0 0 1px rgb(0 243 255 / 10%) !important;
}

.el-input__inner,
.el-textarea__inner {
  color: rgb(255 255 255 / 90%) !important;
}

.el-input__inner::placeholder,
.el-textarea__inner::placeholder {
  color: rgb(255 255 255 / 30%) !important;
}

/* 按钮 */
.el-button--primary {
  background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%) !important;
  border: none !important;
  color: #0a0e27 !important;
}

.el-button--primary:hover {
  opacity: 0.9 !important;
}

/* 对话框 */
.el-dialog {
  background: rgb(10 14 39 / 98%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
  backdrop-filter: blur(20px) !important;
}

.el-dialog__title {
  color: rgb(255 255 255 / 90%) !important;
}

/* 消息提示 */
.el-message {
  background: rgb(10 14 39 / 98%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 0 40px rgb(0 243 255 / 10%) !important;
}

.el-message__content {
  color: rgb(255 255 255 / 90%) !important;
}

/* 下拉菜单 */
.el-dropdown-menu {
  background: rgb(10 14 39 / 98%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
  backdrop-filter: blur(20px) !important;
}

/* 面包屑 */
.el-breadcrumb__item {
  display: flex;
  align-items: center;
}

.el-breadcrumb__inner {
  color: rgb(255 255 255 / 60%) !important;
  transition: color 0.3s ease;
}

.el-breadcrumb__inner:hover {
  color: #00f3ff !important;
}

.el-breadcrumb__separator {
  color: rgb(255 255 255 / 30%) !important;
  margin: 0 8px !important;
}

/* 分页 */
.el-pagination button {
  background: rgb(13 17 23 / 80%) !important;
  color: rgb(255 255 255 / 70%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
}

.el-pagination button:hover {
  border-color: rgb(0 243 255 / 30%) !important;
}

.el-pager li {
  background: rgb(13 17 23 / 80%) !important;
  color: rgb(255 255 255 / 70%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
}

.el-pager li:hover {
  border-color: rgb(0 243 255 / 30%) !important;
}

.el-pager li.is-active {
  background: #00f3ff !important;
  color: #0a0e27 !important;
  border-color: #00f3ff !important;
}

/* ==================== 工具类 ==================== */
.text-primary {
  color: #00f3ff !important;
}

.text-success {
  color: #0f8 !important;
}

.text-warning {
  color: #e6a23c !important;
}

.text-danger {
  color: #f56c6c !important;
}

.bg-glass {
  background: rgb(13 17 23 / 80%) !important;
  backdrop-filter: blur(10px) !important;
}

.border-glow {
  border: 1px solid rgb(0 243 255 / 10%) !important;
}
</style>
