<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createWorkLinePageConfig } from './config/pageConfig'

const config = createWorkLinePageConfig()
</script>
