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
      <div class="login-header">
        <h1>Kitchen Login</h1>
        <p class="login-subtitle">Enter your kitchen credentials</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-box">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="submit" class="login-form">
        <!-- Kitchen User Number -->
        <div class="login-form-group">
          <label for="kitchenNumber">Kitchen User Number</label>
          <input 
            id="kitchenNumber"
            v-model="number_kitchenNumber" 
            type="number" 
            placeholder="e.g., 1"
            required
            autocomplete="off"
            inputmode="numeric"
            class="login-form-input"
            :disabled="loading"
          />
          <p class="input-hint">Your assigned kitchen number</p>
        </div>

        <!-- Kitchen User Key -->
        <div class="login-form-group">
          <label for="kitchenKey">Kitchen User Key</label>
          <input 
            id="kitchenKey"
            v-model="kitchenUser_key" 
            type="number" 
            placeholder="e.g., 456"
            required
            autocomplete="off"
            inputmode="numeric"
            class="login-form-input"
            :disabled="loading"
          />
          <p class="input-hint">Your security key/password</p>
        </div>

        <!-- Login Button -->
        <button 
          type="submit" 
          class="login-btn kitchen-login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>
            <span class="btn-icon">👨‍🍳</span>
            Log In to Kitchen
          </span>
        </button>
      </form>

      <!-- Back Link -->
      <router-link to="/" class="back-link">
        ← Back to selection
      </router-link>
    </div>
  </div>
</template>

<!-- No <style> section needed - using main.css -->