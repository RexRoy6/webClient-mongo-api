<template> <!-- Menu Display -->
    <div v-if="menu && !loading">
        <div class="menu-header card p-4 mb-6">
            <p><strong>Menu Info:</strong> {{ menu.menu_info }}</p>
            <p class="text-sm text-gray-500 mt-1">Updated: {{ new Date(menu.updated_at).toLocaleDateString() }}</p>
        </div>
        <div class="menu-items grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div v-for="item in menu.items" :key="item.name" class="menu-item card p-4">
                <div class="flex justify-between items-center">
                    <div class="item-info">
                        <h4 class="font-medium text-gray-800 capitalize">{{ item.name }}</h4>
                        <p class="price text-primary-blue font-bold text-lg">${{ item.price }} MXN</p>
                    </div>
                    <div class="item-actions"> <button class="btn btn-primary btn-sm"
                            @click="emit('add-to-cart', item)">
                            Add to Order
                        </button>
                    </div>
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


async function fetchMenu() {
    loading.value = true
    error.value = null

    try {
        const response = await api.get('/api/menus')

        menu.value = response.data
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load menu'
        console.error('Error fetching menu:', err)
    } finally {
        loading.value = false
    }
}

</script>