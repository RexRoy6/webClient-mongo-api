<template> <!-- Menu Display -->

  <!-- Loading State -->
  <div v-if="loading" class="loading text-center py-8 text-gray-500">
    Loading menu...
  </div>

  <!-- Error State -->
  <div v-if="error" class="error-box mb-4 flex justify-between items-center">
    <span>{{ error }}</span>
    <button @click="fetchMenu" class="btn btn-danger btn-sm">
      Retry
    </button>
  </div>


  <div v-if="menu && !loading">

    <div class="menu-header card p-4 mb-6">
      <p class="font-semibold">
        {{ props.mode === 'edit' ? 'Editing Order Menu' : 'Create Order Menu' }}
      </p>
      <p class="text-sm text-gray-500 mt-1">
        Updated: {{ new Date(menu.updated_at).toLocaleDateString() }}
      </p>
    </div>



    <div class="menu-items grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div v-for="item in menu.items" :key="item.name" class="menu-item card p-4">
        <!-- elementos de el menu -->
        <div class="menu-item-content">
          <h4 class="font-medium capitalize">{{ item.name }}</h4>

          <p class="price text-primary-blue font-bold text-lg mb-3">
            ${{ item.price }} MXN
          </p>

          <button class="btn btn-primary btn-sm w-full" @click="emit('add-to-cart', item)">
            {{ props.mode === 'edit' ? 'Add to Order' : 'Add to Cart' }}
          </button>

        </div>



      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/apiClient'
import { useBusinessStore } from '@/stores/business'

const business = useBusinessStore()
const emit = defineEmits(['add-to-cart'])

const menu = ref(null)
const loading = ref(false)
const error = ref(null)

const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create' | 'edit'
  },
})

async function fetchMenu() {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/api/menus', {
      headers: {
        'X-Business-Code': business.businessCode
      }
    })

    menu.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load menu'
    console.error('Error fetching menu:', err)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchMenu()
})
</script>