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
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">cafe</code>
                <code class="text-xs px-2 py-1 bg-gray-200 rounded">80123456</code>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Business Info Display (When identified) -->
      <div v-else class="space-y-8">

        <!-- Success Header -->
        <div class="text-center space-y-4 mb-6">
          <div class="flex items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-green-700 font-semibold text-base">
                Business Identified ✓
              </p>
              <h2 class="text-3xl font-bold text-gray-900 mt-1">
                {{ businessStore.businessName }}
              </h2>
            </div>
          </div>
          <p class="text-gray-500 text-sm">You're ready to continue to login</p>
        </div>

        <!-- Business Card -->
        <div class="dashboard-box space-y-6">

          <!-- Status Header -->
          <div class="flex justify-between items-center pb-4 border-b border-gray-200">
            <div>
              <h3 class="font-semibold text-gray-800 text-lg">
                Business Details
              </h3>
              <p class="text-sm text-gray-500 mt-1">Key business information</p>
            </div>
            <span class="px-4 py-2 rounded-full text-sm font-bold uppercase" :class="businessStore.currentBusiness.is_active
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-red-600 text-white shadow-sm'">
              {{ businessStore.currentBusiness.is_active ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>

          <!-- Info Blocks -->
          <div class="space-y-4">
            <!-- Business Key -->
            <div
              class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">Business Key</p>
                <p class="font-semibold text-gray-900 text-base">
                  {{ businessStore.businessKey }}
                </p>
              </div>
              <div class="p-3 bg-white rounded-lg shadow">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Business Code -->
            <div
              class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">Business Code</p>
                <p class="font-semibold text-gray-900 text-base">
                  {{ businessStore.businessCode }}
                </p>
              </div>
              <div class="p-3 bg-white rounded-lg shadow">
                <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Welcome Message -->
            <div v-if="businessStore.businessConfig.welcome_message"
              class="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-3">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-2">
                    Welcome Message
                  </p>
                  <p class="text-blue-900 text-base italic leading-relaxed">
                    "{{ businessStore.businessConfig.welcome_message }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Login Options Preview -->
          <div class="pt-5 border-t border-gray-200">
            <p class="text-gray-800 font-semibold mb-4 text-base">
              Choose how you want to continue
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="option in businessStore.loginOptions" :key="option"
                class="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:shadow-md transition-all duration-200"
                :class="getOptionClass(option)">
                <div class="p-2 rounded-full bg-white/30">
                  <svg v-if="option === 'client'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <svg v-else-if="option === 'kitchen'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="option === 'barista'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="option === 'admin'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-sm font-bold capitalize tracking-wide">{{ option }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <button @click="goToLoginSelection"
            class="btn btn-primary btn-xl w-full py-4 text-lg font-bold hover:shadow-lg transition-all">
            <span class="flex items-center justify-center gap-3">
              <span>Enter {{ businessStore.businessName }}</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <button @click="clearBusiness"
            class="btn btn-secondary btn-md w-full py-3 text-base hover:bg-gray-300 transition-colors">
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
    client: 'bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200',
    kitchen: 'bg-orange-100 border border-orange-300 text-orange-800 hover:bg-orange-200',
    barista: 'bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200',
    admin: 'bg-red-100 border border-red-300 text-red-800 hover:bg-red-200'
  }
  return classes[option] || 'bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200'
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
</style>