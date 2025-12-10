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
        <p class="subtitle">Enter your room details to order</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="error-box">
        <span class="error-icon">⚠️</span>
        {{ errorMsg }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="login-form">
        <!-- Room Number -->
        <div class="form-group">
          <label for="roomNumber">Room Number</label>
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
        <div class="form-group">
          <label for="roomKey">Room Key</label>
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
        <div class="form-group">
          <label for="guestName">Your Name</label>
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
          class="login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
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

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

/* Header */
.login-header {
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 16px;
  font-weight: 400;
}

/* Error Box */
.error-box {
  background: #fed7d7;
  color: #9b2c2c;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.error-icon {
  font-size: 18px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  color: #2d3748;
  background: #f7fafc;
  transition: all 0.2s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Remove number input spinners */
.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type=number] {
  -moz-appearance: textfield;
}

/* Login Button */
.login-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Back Link */
.back-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 8px 0;
}

.back-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
    background: white;
  }
  
  .login-card {
    padding: 24px 20px;
    box-shadow: none;
    max-width: 100%;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 15px;
  }
  
  .form-input {
    padding: 14px;
    font-size: 16px;
  }
  
  .login-btn {
    padding: 16px;
    font-size: 17px;
    min-height: 52px;
  }
  
  /* Improve touch targets */
  .form-group label {
    margin-bottom: 10px;
  }
  
  .login-form {
    gap: 28px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: #1a202c;
  }
  
  .login-header h1 {
    color: #f7fafc;
  }
  
  .subtitle {
    color: #a0aec0;
  }
  
  .form-group label {
    color: #cbd5e0;
  }
  
  .form-input {
    background: #2d3748;
    border-color: #4a5568;
    color: #f7fafc;
  }
  
  .form-input:focus {
    background: #2d3748;
    border-color: #667eea;
  }
  
  .back-link {
    color: #90cdf4;
  }
  
  .back-link:hover {
    color: #63b3ed;
  }
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  .login-container {
    min-height: -webkit-fill-available;
  }
  
  .form-input {
    font-size: 16px; /* Prevent iOS zoom on focus */
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-input {
    border-width: 3px;
  }
  
  .login-btn {
    border: 2px solid white;
  }
}
</style>