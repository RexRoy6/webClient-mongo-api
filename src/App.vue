<template>
  <!-- Apply business theme if available -->
  <div :class="['app-container', businessStore.theme]">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'

const businessStore = useBusinessStore()

// Initialize business store on app load
onMounted(() => {
  businessStore.init()
})
</script>

<style>
.app-container {
  min-height: 100vh;
}

/* Business themes */
.theme-lunas-cafe {
  --primary-blue: #4caf50;
  --primary-orange: #ff9800;
}

.theme-hotel-del-sol {
  --primary-blue: #2196f3;
  --primary-orange: #ff5722;
}

/* Default theme stays as is */
</style>