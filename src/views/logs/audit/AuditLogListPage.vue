<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createAuditLogPageConfig } from './config/pageConfig'

const config = createAuditLogPageConfig()
</script>
