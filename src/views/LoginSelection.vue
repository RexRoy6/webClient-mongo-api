<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Business Header -->
      <div class="login-header" v-if="businessStore.hasBusinessContext">
        <h1>Welcome to {{ businessStore.businessName }}</h1>
        <p class="login-subtitle">{{ businessStore.businessConfig.welcome_message || 'Please choose your access type' }}</p>
        <div class="mt-2 text-sm text-gray-500">
          Business: {{ businessStore.businessKey }}
        </div>
      </div>
      
      <div class="login-header" v-else>
        <h1>Welcome</h1>
        <p class="login-subtitle">Business context required</p>
      </div>

      <!-- Business Warning -->
      <div v-if="!businessStore.hasBusinessContext" class="error-box mb-6">
        <span>No business identified. Please go back and enter your business identifier.</span>
        <button @click="goToBusinessIdentification" class="btn btn-primary btn-sm ml-4">
          Identify Business
        </button>
      </div>

      <!-- Selection Buttons -->
      <div class="selection-buttons" v-if="businessStore.hasBusinessContext">
        <button 
          v-if="businessStore.loginOptions.includes('client')"
          @click="goClientLogin" 
          class="btn btn-xl w-full mb-4 client-btn flex flex-col items-center justify-center gap-2"
        >
          <span class="text-2xl">👤</span>
          <span class="text-lg font-bold">Guest Login</span>
          <span class="text-sm opacity-90">For hotel guests</span>
        </button>
        
        <button 
          v-if="businessStore.loginOptions.includes('kitchen')"
          @click="goKitchenLogin" 
          class="btn btn-xl w-full kitchen-btn flex flex-col items-center justify-center gap-2"
        >
          <span class="text-2xl">👨‍🍳</span>
          <span class="text-lg font-bold">Kitchen Login</span>
          <span class="text-sm opacity-90">For kitchen staff</span>
        </button>
        
        <button 
          v-if="businessStore.loginOptions.includes('barista')"
          @click="goBaristaLogin" 
          class="btn btn-xl w-full mb-4 flex flex-col items-center justify-center gap-2"
          style="background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white;"
        >
          <span class="text-2xl">☕</span>
          <span class="text-lg font-bold">Barista Login</span>
          <span class="text-sm opacity-90">For coffee bar staff</span>
        </button>
        
        <button 
          v-if="businessStore.loginOptions.includes('admin')"
          @click="goAdminLogin" 
          class="btn btn-xl w-full flex flex-col items-center justify-center gap-2"
          style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); color: white;"
        >
          <span class="text-2xl">⚙️</span>
          <span class="text-lg font-bold">Admin Login</span>
          <span class="text-sm opacity-90">For managers and owners</span>
        </button>
      </div>

      <!-- Change Business Button -->
      <div v-if="businessStore.hasBusinessContext" class="mt-6">
        <button @click="changeBusiness" class="btn btn-secondary btn-sm w-full">
          Not {{ businessStore.businessName }}? Change Business
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business'

const router = useRouter()
const businessStore = useBusinessStore()

const goClientLogin = () => router.push('/client/login')
const goKitchenLogin = () => router.push('/kitchen/login')
const goBaristaLogin = () => router.push('/barista/login')
const goAdminLogin = () => router.push('/admin/login')
const goToBusinessIdentification = () => router.push('/business-identification')

function changeBusiness() {
  businessStore.clearBusiness()
  router.push('/business-identification')
}
</script>

<style scoped>
.client-btn {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.kitchen-btn {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
}

.client-btn:hover:not(:disabled),
.kitchen-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>