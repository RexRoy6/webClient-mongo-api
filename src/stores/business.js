import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/apiClient'
import { useAuthStore } from '@/stores/auth'

export const useBusinessStore = defineStore('business', () => {
  // State
  const currentBusiness = ref(null)
  const businessCode = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const hasBusinessContext = computed(() => !!businessCode.value)
  const businessName = computed(() => currentBusiness.value?.name || '')
  const businessKey = computed(() => currentBusiness.value?.key || '')
  const businessConfig = computed(() => currentBusiness.value?.public_config || {})
  const loginOptions = computed(() => businessConfig.value?.login_options || [])
  const theme = computed(() => businessConfig.value?.theme || 'default')


  // Actions
  async function identifyBusiness(identifier) {
    const auth = useAuthStore()
    auth.logout() // 🔐 clear previous user session

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/api/identify-business', {
        identifier
      })

      const { business, api_context } = response.data

      currentBusiness.value = business
      businessCode.value = api_context.headers['X-Business-Code']

      // Persist minimal business context
      localStorage.setItem(
        'current_business',
        JSON.stringify({
          code: businessCode.value,
          key: business.key,
          name: business.name,
          identifiedAt: Date.now()
        })
      )


      return business
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to identify business'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function loadStoredBusiness() {
    const stored = localStorage.getItem('current_business')
    if (!stored) return false

    try {
      const parsed = JSON.parse(stored)

      const BUSINESS_TTL_MS = 1000 * 60 * 60 * 8
      const now = Date.now()

      if (!parsed.identifiedAt || now - parsed.identifiedAt > BUSINESS_TTL_MS) {
        localStorage.setItem('business_expired', 'true')

        const auth = useAuthStore()
        auth.logout() // ✅ logout ONLY here

        clearBusiness()
        return false
      }

      businessCode.value = parsed.code
      currentBusiness.value = {
        name: parsed.name,
        key: parsed.key
      }

      return true
    } catch {
      clearBusiness()
      return false
    }
  }



  function clearBusiness() {
    currentBusiness.value = null
    businessCode.value = null
    localStorage.removeItem('current_business')
  }



  function init() {
    loadStoredBusiness()
  }
  function setBusinessFromAuth(business) {
    if (!business) return

    // Business code must already exist (from identify-business)
    const stored = localStorage.getItem('current_business')
    if (!stored) return

    const parsed = JSON.parse(stored)

    currentBusiness.value = business
    businessCode.value = parsed.code

    // Refresh persisted business info
    localStorage.setItem(
      'current_business',
      JSON.stringify({
        code: parsed.code,
        key: business.key,
        name: business.name,
        identifiedAt: parsed.identifiedAt
      })
    )
  }


  return {
    // State
    currentBusiness,
    businessCode,
    isLoading,
    error,

    // Getters
    hasBusinessContext,
    businessName,
    businessKey,
    businessConfig,
    loginOptions,
    theme,

    // Actions
    identifyBusiness,
    setBusinessFromAuth,
    loadStoredBusiness,
    clearBusiness,
    init
  }
})
