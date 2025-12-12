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
          <input
            v-model="identifier"
            type="text"
            placeholder="e.g., lunas_cafe or 80123456"
            :disabled="businessStore.isLoading"
            @keyup.enter="handleIdentify"
            class="form-input"
            :class="{ 'input-error': errorMessage }"
          />
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
        <button
          @click="handleIdentify"
          :disabled="!identifier || businessStore.isLoading"
          class="login-btn"
        >
          <span v-if="businessStore.isLoading" class="spinner mr-2"></span>
          <span v-if="businessStore.isLoading">Identifying...</span>
          <span v-else>Continue to Login</span>
        </button>

        <!-- Help Text -->
        <div class="mt-4 text-center">
          <details>
            <summary class="text-sm text-gray-500 cursor-pointer">
              Need help finding your identifier?
            </summary>
            <div class="mt-2 p-3 bg-gray-50 rounded text-left">
              <p class="text-xs mb-2"><strong>What to enter:</strong></p>
              <ul class="text-xs space-y-1">
                <li>• Ask your manager or administrator</li>
                <li>• Look for a QR code in your establishment</li>
                <li>• Contact support for assistance</li>
              </ul>
              <p class="text-xs mt-2"><strong>Examples:</strong></p>
              <div class="flex gap-2 mt-1">
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">lunas_cafe</code>
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">80123456</code>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Business Info Display (When identified) -->
      <div v-else class="space-y-4">
        <div class="success-box">
          <p class="font-semibold">✓ Business Identified</p>
          <p class="text-sm mt-1">{{ businessStore.businessName }}</p>
        </div>

        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Business Details</h3>
            <span 
              class="status-badge"
              :class="businessStore.currentBusiness.is_active ? 'status-created' : 'status-cancelled'"
            >
              {{ businessStore.currentBusiness.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Key:</span>
              <span class="font-medium">{{ businessStore.businessKey }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Code:</span>
              <span class="font-medium">{{ businessStore.businessCode }}</span>
            </div>
            <div v-if="businessStore.businessConfig.welcome_message">
              <span class="text-gray-600">Welcome:</span>
              <p class="mt-1 italic">{{ businessStore.businessConfig.welcome_message }}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t">
            <p class="text-gray-600 mb-2">Available Login Types:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="option in businessStore.loginOptions" 
                :key="option"
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getOptionClass(option)"
              >
                {{ option }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="goToLoginSelection"
            class="btn btn-primary btn-lg w-full"
          >
            Continue to Login Selection
          </button>
          
          <button
            @click="clearBusiness"
            class="btn btn-secondary btn-md w-full"
          >
            Use Different Business
          </button>
        </div>
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

function getOptionClass(option) {
  const classes = {
    'client': 'bg-blue-100 text-blue-800',
    'kitchen': 'bg-orange-100 text-orange-800',
    'barista': 'bg-purple-100 text-purple-800',
    'admin': 'bg-red-100 text-red-800'
  }
  return classes[option] || 'bg-gray-100 text-gray-800'
}

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
    }, 1000)
    
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
.bg-blue-100 { background-color: #ebf8ff; }
.text-blue-800 { color: #2c5282; }

.bg-orange-100 { background-color: #fffaf0; }
.text-orange-800 { color: #9c4221; }

.bg-purple-100 { background-color: #faf5ff; }
.text-purple-800 { color: #553c9a; }

.bg-red-100 { background-color: #fff5f5; }
.text-red-800 { color: #9b2c2c; }

.bg-gray-100 { background-color: #f7fafc; }
.text-gray-800 { color: #2d3748; }
</style>