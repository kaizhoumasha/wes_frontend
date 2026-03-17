<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createUserPageConfig } from './config/pageConfig'

const config = createUserPageConfig()
</script>
