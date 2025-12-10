<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const number_kitchenNumber = ref('')
const kitchenUser_key = ref('')
const error = ref(null)
const loading = ref(false)

const submit = async () => {
  error.value = null
  loading.value = true

  try {
    const data = await auth.loginKitchen(
      Number(number_kitchenNumber.value),
      Number(kitchenUser_key.value)
    )

    console.log('Kitchen logged in:', data)

    // Redirect to kitchen dashboard
    router.push('/kitchen/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Login failed'
    console.error('Login error:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Kitchen Login</h1>
        <p class="login-subtitle text-gray-600">Enter your kitchen credentials</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-box mb-6">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="submit" class="login-form">
        <!-- Kitchen User Number -->
        <div class="form-group mb-4">
          <label for="kitchenNumber" class="form-label">Kitchen User Number</label>
          <input 
            id="kitchenNumber"
            v-model="number_kitchenNumber" 
            type="number" 
            placeholder="e.g., 1"
            required
            autocomplete="off"
            inputmode="numeric"
            class="form-input"
            :disabled="loading"
          />
          <p class="input-hint mt-1 text-sm text-gray-500">Your assigned kitchen number</p>
        </div>

        <!-- Kitchen User Key -->
        <div class="form-group mb-6">
          <label for="kitchenKey" class="form-label">Kitchen User Key</label>
          <input 
            id="kitchenKey"
            v-model="kitchenUser_key" 
            type="number" 
            placeholder="e.g., 456"
            required
            autocomplete="off"
            inputmode="numeric"
            class="form-input"
            :disabled="loading"
          />
          <p class="input-hint mt-1 text-sm text-gray-500">Your security key/password</p>
        </div>

        <!-- Login Button -->
        <button 
          type="submit" 
          class="btn btn-xl w-full kitchen-login-btn mb-6"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner mr-2"></span>
          <span v-else class="flex items-center gap-2">
            <span>👨‍🍳</span>
            <span>Log In to Kitchen</span>
          </span>
        </button>
      </form>

      <!-- Back Link -->
      <router-link to="/" class="back-link text-primary-orange hover:text-orange-700">
        ← Back to selection
      </router-link>
    </div>
  </div>
</template>

<style>
/* Add to main.css or keep here */
.kitchen-login-btn {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.4);
}

.kitchen-login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(237, 137, 54, 0.6);
  background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>