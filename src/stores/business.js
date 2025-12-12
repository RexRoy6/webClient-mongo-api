import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/apiClient'

export const useBusinessStore = defineStore('business', () => {
  // State
  const currentBusiness = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  
  // Getters
  const hasBusinessContext = computed(() => !!currentBusiness.value)
  const businessName = computed(() => currentBusiness.value?.name || '')
  const businessKey = computed(() => currentBusiness.value?.key || '')
  const businessCode = computed(() => currentBusiness.value?.code || '')
  const businessConfig = computed(() => currentBusiness.value?.public_config || {})
  const loginOptions = computed(() => businessConfig.value?.login_options || [])
  const theme = computed(() => businessConfig.value?.theme || 'default')
  
  // Actions
  async function identifyBusiness(identifier) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/identify-business', {
        identifier: identifier
      })
      
      currentBusiness.value = response.data.business
      
      // Store in localStorage for persistence
      localStorage.setItem('current_business', JSON.stringify(currentBusiness.value))
      
      // Configure API client with business context
      setApiBusinessContext(businessCode.value)
      
      return currentBusiness.value
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to identify business'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  function setApiBusinessContext(businessCode) {
    // Add business context to all future API calls
    api.defaults.headers.common['X-Business-Code'] = businessCode
  }
  
  function clearBusiness() {
    currentBusiness.value = null
    localStorage.removeItem('current_business')
    delete api.defaults.headers.common['X-Business-Code']
  }
  
  function loadStoredBusiness() {
    const stored = localStorage.getItem('current_business')
    if (stored) {
      currentBusiness.value = JSON.parse(stored)
      setApiBusinessContext(businessCode.value)
      return true
    }
    return false
  }
  
  // Initialize
  function init() {
    loadStoredBusiness()
  }
  
  return {
    // State
    currentBusiness,
    isLoading,
    error,
    
    // Getters
    hasBusinessContext,
    businessName,
    businessKey,
    businessCode,
    businessConfig,
    loginOptions,
    theme,
    
    // Actions
    identifyBusiness,
    clearBusiness,
    loadStoredBusiness,
    init,
  }
})