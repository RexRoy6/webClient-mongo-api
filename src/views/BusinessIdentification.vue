<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome</h1>
        <p class="login-subtitle">Enter your business identifier</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <input v-model="identifier" type="text" placeholder="e.g., cafe or 80123456"
            :disabled="businessStore.isLoading" @keyup.enter="handleIdentify" class="form-input"
            :class="{ 'input-error': errorMessage }" />
          <small class="text-sm text-gray-500 mt-1">
            Enter business key or 8-digit code
          </small>
        </div>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <button class="login-btn" :disabled="!identifier || businessStore.isLoading" @click="handleIdentify">
          <span v-if="businessStore.isLoading" class="spinner mr-2"></span>
          {{ businessStore.isLoading ? 'Identifying...' : 'Continue to Login' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business'

const router = useRouter()
const businessStore = useBusinessStore()

const identifier = ref('')
const errorMessage = ref('')

onMounted(() => {
  businessStore.init()

  // Defensive redirect (router already handles this, but safe)
  if (businessStore.hasBusinessContext) {
    router.replace('/select-login')
  }
})

async function handleIdentify() {
  if (!identifier.value.trim()) {
    errorMessage.value = 'Please enter a business identifier'
    return
  }

  errorMessage.value = ''

  try {
    await businessStore.identifyBusiness(identifier.value)
    router.push('/select-login')
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Failed to identify business'
  }
}
</script>


<style scoped>
/* Add these styles to your main.css or keep here */
.input-error {
  border-color: var(--primary-red) !important;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

/* Additional utility classes */
.bg-blue-100 {
  background-color: #ebf8ff;
}

.text-blue-800 {
  color: #2c5282;
}

.bg-orange-100 {
  background-color: #fffaf0;
}

.text-orange-800 {
  color: #9c4221;
}

.bg-purple-100 {
  background-color: #faf5ff;
}

.text-purple-800 {
  color: #553c9a;
}

.bg-red-100 {
  background-color: #fff5f5;
}

.text-red-800 {
  color: #9b2c2c;
}

.bg-gray-100 {
  background-color: #f7fafc;
}

.text-gray-800 {
  color: #2d3748;
}

.identified-box {
  text-align: center;
  padding: 2rem 1.5rem;
  color: #111827;
  cursor: pointer;
  font-weight: 600;
  color: #111827;
}

.success-header .check {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.5rem;
}

.options {
  margin-top: 2rem;
  display: grid;
  gap: 0.75rem;
}

.option-btn {
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f3f4f6;
  font-weight: 600;
  text-transform: capitalize;
}

.change-btn {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

details,
details summary,
details div,
details p,
details li {
  color: #111827;
  /* near-black, Tailwind gray-900 */
}

details summary {
  cursor: pointer;
  font-weight: 600;
  color: #111827;
}
</style>