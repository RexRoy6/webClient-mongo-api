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
        {{ props.mode === 'edit' ? 'Editing Order' : 'Create Order' }}
      </p>
      <p class="text-sm text-gray-500 mt-1">
        menu name: {{ menuName }}
      </p>
      <p class="text-sm text-gray-500 mt-1">
        current menu: {{ menuDescription }}
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

          <span v-if="item.options && Object.keys(item.options).length" class="text-xs text-gray-500">
            Customizable
          </span>

          <button class="btn btn-primary btn-sm w-full" @click="handleAdd(item)">
            {{ props.mode === 'edit' ? 'Add to Order' : 'Add to Cart' }}
          </button>

        </div>




      </div>
    </div>
  </div>

  <!-- OPTIONS MODAL -->
  <MenuOptions
  :open="showOptions"
  :item="activeItem"
  v-model="selectedOptions"
  @confirm="confirmOptions"
  @close="showOptions = false"
/>



</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/apiClient'
import { useBusinessStore } from '@/stores/business'
import { computed } from 'vue'
import MenuOptions from '@/components/MenuOptions.vue'

const business = useBusinessStore()
const emit = defineEmits(['add-to-cart'])

//VALORES DEL menu
const menu = ref(null)
const menuName = ref(null)
const menuDescription = ref(null)

const loading = ref(false)
const error = ref(null)

const showOptions = ref(false)
const activeItem = ref(null)
const selectedOptions = ref({})

const allOptionsSelected = computed(() => {
  if (!activeItem.value || !activeItem.value.options) return true

  return Object.keys(activeItem.value.options).every(
    key => selectedOptions.value[key]
  )
})


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
    menuName.value = response.data.menu_key
    menuDescription.value = response.data.menu_info
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load menu'
    console.error('Error fetching menu:', err)
  } finally {
    loading.value = false
  }
}

function handleAdd(item) {
  if (item.options && Object.keys(item.options).length) {
    openOptionsModal(item)
  } else {
    emit('add-to-cart', item)
  }
}


function openOptionsModal(item) {
  activeItem.value = item
  selectedOptions.value = {}
  showOptions.value = true
}

function confirmOptions() {
  emit('add-to-cart', {
    ...activeItem.value,
    selectedOptions: { ...selectedOptions.value }
  })

  showOptions.value = false
  activeItem.value = null
}



// Initialize
onMounted(() => {
  fetchMenu()
})
</script>