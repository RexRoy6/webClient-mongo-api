<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import api from '@/api/apiClient'

const auth = useAuthStore()
const router = useRouter()

// Menu state
const menu = ref(null)
const loading = ref(false)
const error = ref(null)
const menuKey = ref('menu_cafe') // Hardcoded for now, can be made dynamic later

async function logout() {
  await auth.logoutClient()
  router.push('/')
}

async function fetchMenu() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/hotel/menus', {
      params: {
        menu_key: menuKey.value
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

// Fetch menu when component mounts
onMounted(() => {
  fetchMenu()
})
</script>

<template>
  <div class="dashboard">
    <h1>Client Dashboard</h1>

    <!-- Guest Info -->
    <div class="box">
      <h3>Logged in as:</h3>
      <p><strong>Name:</strong> {{ auth.guest?.guest_name }}</p>
      <p><strong>Room Number:</strong> {{ auth.guest?.room_number }}</p>
      <p><strong>UUID:</strong> {{ auth.guest?.guest_uuid }}</p>
    </div>

    <button @click="logout" class="logout-btn">Logout</button>

    <!-- Menu Section -->
    <div class="box">
      <h3>Menu: {{ menuKey }}</h3>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading menu...
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error">
        {{ error }}
        <button @click="fetchMenu" class="retry-btn">Retry</button>
      </div>
      
      <!-- Menu Display -->
      <div v-if="menu && !loading">
        <div class="menu-header">
          <p><strong>Menu Info:</strong> {{ menu.menu_info }}</p>
          <p><small>Updated: {{ new Date(menu.updated_at).toLocaleDateString() }}</small></p>
        </div>
        
        <div class="menu-items">
          <div v-for="item in menu.items" :key="item.name" class="menu-item">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="price">${{ item.price }} MXN</p>
            </div>
            <div class="item-actions">
              <button class="add-btn" @click="addToCart(item)">Add to Order</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Refresh Button -->
      <button @click="fetchMenu" class="refresh-btn" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh Menu' }}
      </button>
    </div>

    <!-- Token Info (Optional - you might want to remove this in production) -->
    <div class="box" v-if="auth.token">
      <h3>Token Info:</h3>
      <p><strong>Token:</strong> {{ auth.token.substring(0, 20) }}...</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.box {
  background: #f4f4f4;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logout-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 25px;
  font-size: 16px;
  font-weight: bold;
}
.logout-btn:hover {
  background: #e60000;
}

/* Menu Styles */
.menu-header {
  background: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.menu-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  transition: transform 0.2s;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.item-info h4 {
  margin: 0 0 5px 0;
  text-transform: capitalize;
  color: #333;
}

.item-info .price {
  margin: 0;
  color: #2c5282;
  font-weight: bold;
  font-size: 1.1em;
}

/* Button Styles */
.add-btn {
  background: #2d3748;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #4a5568;
}

.refresh-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.refresh-btn:hover:not(:disabled) {
  background: #3182ce;
}

.refresh-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

/* Loading & Error States */
.loading {
  text-align: center;
  padding: 20px;
  color: #4a5568;
}

.error {
  background: #fed7d7;
  color: #9b2c2c;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #c53030;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-items {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .menu-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-actions {
    margin-top: 10px;
  }
}
</style>