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

    //console.log('Logged in:', response)

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
      <div class="login-header mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Client Login</h1>
        <p class="login-subtitle text-gray-600">Enter your room details to order</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="error-box mb-6">
        <span class="error-icon">⚠️</span>
        {{ errorMsg }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="login-form">
        <!-- Room Number -->
        <div class="form-group mb-4">
          <label for="roomNumber" class="form-label">Room Number</label>
          <input 
            id="roomNumber"
            v-model="roomNumber" 
            type="number" 
            placeholder="e.g., 101"
            required
            autocomplete="off"
            inputmode="numeric"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <!-- Room Key -->
        <div class="form-group mb-4">
          <label for="roomKey" class="form-label">Room Key</label>
          <input 
            id="roomKey"
            v-model="roomKey" 
            type="number" 
            placeholder="e.g., 1234"
            required
            autocomplete="off"
            inputmode="numeric"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <!-- Guest Name -->
        <div class="form-group mb-6">
          <label for="guestName" class="form-label">Your Name</label>
          <input 
            id="guestName"
            v-model="guestName" 
            type="text" 
            placeholder="Enter your name"
            required
            autocomplete="name"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <!-- Login Button -->
        <button 
          type="submit" 
          class="btn btn-xl w-full login-btn mb-6"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner mr-2"></span>
          <span>{{ loading ? 'Logging in...' : 'Log In' }}</span>
        </button>
      </form>

      <!-- Back Link -->
      <router-link to="/" class="back-link text-primary-blue hover:text-primary-blue-dark">
        ← Back to selection
      </router-link>
    </div>
  </div>
</template>

<style>
/* Add to main.css or keep here */
.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
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

/* Remove number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>