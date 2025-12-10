<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const roomNumber = ref('')
const roomKey = ref('')
const guestName = ref('')
const errorMsg = ref(null)
const loading = ref(false)

async function login() {
  errorMsg.value = null
  loading.value = true

  try {
    const response = await auth.loginClient(
      Number(roomNumber.value),
      Number(roomKey.value),
      guestName.value
    )

    console.log('Logged in:', response)

    // ⭐ Redirect to dashboard
    router.push('/client/dashboard')
  } catch (error) {
    errorMsg.value = error.message || 'Login failed'
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
        <h1>Client Login</h1>
        <p class="login-subtitle">Enter your room details to order</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="error-box">
        <span class="error-icon">⚠️</span>
        {{ errorMsg }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="login-form">
        <!-- Room Number -->
        <div class="login-form-group">
          <label for="roomNumber">Room Number</label>
          <input 
            id="roomNumber"
            v-model="roomNumber" 
            type="number" 
            placeholder="e.g., 101"
            required
            autocomplete="off"
            inputmode="numeric"
            class="login-form-input"
            :disabled="loading"
          />
        </div>

        <!-- Room Key -->
        <div class="login-form-group">
          <label for="roomKey">Room Key</label>
          <input 
            id="roomKey"
            v-model="roomKey" 
            type="number" 
            placeholder="e.g., 1234"
            required
            autocomplete="off"
            inputmode="numeric"
            class="login-form-input"
            :disabled="loading"
          />
        </div>

        <!-- Guest Name -->
        <div class="login-form-group">
          <label for="guestName">Your Name</label>
          <input 
            id="guestName"
            v-model="guestName" 
            type="text" 
            placeholder="Enter your name"
            required
            autocomplete="name"
            class="login-form-input"
            :disabled="loading"
          />
        </div>

        <!-- Login Button -->
        <button 
          type="submit" 
          class="login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>Log In</span>
        </button>
      </form>

      <!-- Back Link -->
      <router-link to="/" class="back-link">
        ← Back to selection
      </router-link>
    </div>
  </div>
</template>