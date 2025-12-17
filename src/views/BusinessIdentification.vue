<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h1>Welcome</h1>
        <p class="login-subtitle">Enter your business identifier</p>
      </div>

      <!-- Business Input Form -->
      <div class="login-form" v-if="!businessStore.hasBusinessContext">
        <div class="form-group">
          <input v-model="identifier" type="text" placeholder="e.g., cafe or 80123456"
            :disabled="businessStore.isLoading" @keyup.enter="handleIdentify" class="form-input"
            :class="{ 'input-error': errorMessage }" />
          <small class="text-sm text-gray-500 mt-1">
            Enter business key or 8-digit code
          </small>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-box">
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-box">
          <span>{{ successMessage }}</span>
        </div>

        <!-- Action Button -->
        <button @click="handleIdentify" :disabled="!identifier || businessStore.isLoading" class="login-btn">
          <span v-if="businessStore.isLoading" class="spinner mr-2"></span>
          <span v-if="businessStore.isLoading">Identifying...</span>
          <span v-else>Continue to Login</span>
        </button>

        <!-- Help Text -->
        <div class="mt-4 text-center">
          <details>
            <summary class="bg-blue-100">
              Need help finding your identifier?
            </summary>
            <div class="mt-2 p-3 bg-black-50 rounded text-left">
              <p class="text-xs mb-2"><strong>What to enter:</strong></p>
              <ul class="text-xs space-y-1">
                <li>• Ask your manager or administrator</li>
                <li>• Look for a QR code in your establishment</li>
                <li>• Contact support for assistance</li>
              </ul>
              <p class="text-xs mt-2"><strong>Examples:</strong></p>
              <div class="flex gap-2 mt-1">
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">cafe</code>
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">80123456</code>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Business Info Display (Simplified) -->
      <div class="identified-box">
        <h2 class="text-3xl font-bold text-gray-900 mt-1">
          {{ businessStore.businessName }}
        </h2>

        <p class="text-gray-500 text-sm">You're ready to continue to login</p>

        <!-- Change Business -->
        <button class="change-btn" @click="clearBusiness">
          Use a different business
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business'

const router = useRouter()
const businessStore = useBusinessStore()

const identifier = ref('')
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Initialize business store
  businessStore.init()

  // If already identified, show success message
  if (businessStore.hasBusinessContext) {
    successMessage.value = `Already identified: ${businessStore.businessName}`
  }
})



async function handleIdentify() {
  if (!identifier.value.trim()) {
    errorMessage.value = 'Please enter a business identifier'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await businessStore.identifyBusiness(identifier.value)
    successMessage.value = `Successfully identified: ${businessStore.businessName}`

    // Auto-redirect after 1 second
    setTimeout(() => {
      router.push('/select-login')
    }, 2000)

  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to identify business'
    console.error('Business identification error:', error)
  }
}

function goToLoginSelection() {
  router.push('/select-login')
}

function clearBusiness() {
  businessStore.clearBusiness()
  identifier.value = ''
  successMessage.value = ''
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