<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h1>Welcome</h1>
        <p class="login-subtitle">Please choose your access type</p>
      </div>

      <!-- Selection Buttons -->
      <div class="selection-buttons">
        <button 
          @click="goClientLogin" 
          class="btn btn-xl w-full mb-4 client-btn flex flex-col items-center justify-center gap-2"
        >
          <span class="text-2xl">👤</span>
          <span class="text-lg font-bold">Guest Login</span>
          <span class="text-sm opacity-90">For hotel guests</span>
        </button>
        
        <button 
          @click="goKitchenLogin" 
          class="btn btn-xl w-full kitchen-btn flex flex-col items-center justify-center gap-2"
        >
          <span class="text-2xl">👨‍🍳</span>
          <span class="text-lg font-bold">Kitchen Login</span>
          <span class="text-sm opacity-90">For kitchen staff</span>
        </button>
      </div>

      <!-- Decorative dots -->
      <div class="flex justify-center gap-2 mt-6">
        <div class="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
        <div class="w-2 h-2 rounded-full bg-gray-300 animate-pulse animation-delay-200"></div>
        <div class="w-2 h-2 rounded-full bg-gray-300 animate-pulse animation-delay-400"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goClientLogin = () => router.push('/client/login')
const goKitchenLogin = () => router.push('/kitchen/login')
</script>

<style>
/* Add these small additions to main.css or keep here */
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