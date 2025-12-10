<template>
  <div class="dashboard">
    <h1>Kitchen Dashboard</h1>

    <!-- Kitchen User Info -->
    <div class="dashboard-box" v-if="auth.kitchenUser">
      <h3>Logged in as:</h3>
      <p><strong>Name:</strong> {{ auth.kitchenUser.name_kitchenUser }}</p>
      <p><strong>Kitchen User UUID:</strong> {{ auth.kitchenUser.kitchenUser_uuid }}</p>
    </div>

    <button @click="logout" class="dashboard-btn logout-btn">Logout</button>

    <!-- Orders Section -->
    <div class="dashboard-box">
      <div class="orders-header">
        <h3>All Orders</h3>
        <button @click="fetchOrders" :disabled="loading" class="refresh-orders-btn">
          {{ loading ? 'Refreshing...' : 'Refresh Orders' }}
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading orders...
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error">
        {{ error }}
        <button @click="fetchOrders" class="retry-btn">Retry</button>
      </div>
      
      <!-- Orders Display -->
      <div v-if="orders.length > 0 && !loading" class="orders-list">
        <div class="order-filters">
          <div class="filter-buttons">
            <button 
              @click="filterStatus = 'all'" 
              :class="{ active: filterStatus === 'all' }"
              class="filter-btn"
            >
              All ({{ orders.length }})
            </button>
            <button 
              @click="filterStatus = 'created'" 
              :class="{ active: filterStatus === 'created' }"
              class="filter-btn"
            >
              Created ({{ orders.filter(o => o.current_status === 'created').length }})
            </button>
            <button 
              @click="filterStatus = 'preparing'" 
              :class="{ active: filterStatus === 'preparing' }"
              class="filter-btn"
            >
              Preparing ({{ orders.filter(o => o.current_status === 'preparing').length }})
            </button>
            <button 
              @click="filterStatus = 'ready'" 
              :class="{ active: filterStatus === 'ready' }"
              class="filter-btn"
            >
              Ready ({{ orders.filter(o => o.current_status === 'ready').length }})
            </button>
            <button 
              @click="filterStatus = 'delivered'" 
              :class="{ active: filterStatus === 'delivered' }"
              class="filter-btn"
            >
              Delivered ({{ orders.filter(o => o.current_status === 'delivered').length }})
            </button>
            <button 
              @click="filterStatus = 'cancelled'" 
              :class="{ active: filterStatus === 'cancelled' }"
              class="filter-btn"
            >
              Cancelled ({{ orders.filter(o => o.current_status === 'cancelled').length }})
            </button>
          </div>
        </div>
        
        <div class="filtered-orders">
          <div v-for="order in filteredOrders" :key="order.uuid" class="order-card">
            <div class="order-header">
              <div class="order-id">
                <strong>Order #{{ order.uuid.substring(0, 8) }}</strong>
                <span class="order-date">{{ new Date(order.created_at).toLocaleString() }}</span>
              </div>
              <div class="order-status-section">
                <span class="status-badge" :style="{ backgroundColor: getStatusColor(order.current_status) }">
                  {{ order.current_status }}
                </span>
                <span class="guest-room" v-if="order.solicitud.guest_room">
                  Room {{ order.solicitud.guest_room }}
                </span>
              </div>
            </div>
            
            <div class="order-details">
              <div class="order-items">
                <h4>Items:</h4>
                <div v-for="item in order.solicitud.items" :key="item.name" class="order-item">
                  <span>{{ item.name }} × {{ item.qty }}</span>
                  <span>${{ item.line_total }} MXN</span>
                </div>
              </div>
              
              <div class="order-summary">
                <p><strong>Total:</strong> ${{ order.solicitud.total }} MXN</p>
                <p v-if="order.solicitud.note"><strong>Note:</strong> {{ order.solicitud.note }}</p>
                <p><strong>Menu:</strong> {{ order.solicitud.menu_key }}</p>
                <p><strong>Order ID:</strong> {{ order.uuid }}</p>
                <p><strong>Created by:</strong> {{ order.created_by.substring(0, 8) }}...</p>
              </div>
            </div>
            
            <!-- Status Update Buttons -->
            <div class="status-actions" v-if="order.current_status !== 'cancelled' && order.current_status !== 'delivered'">
              <button 
                @click="updateOrderStatus(order, 'preparing')" 
                :disabled="updatingStatus === order.uuid"
                class="status-btn preparing-btn"
                v-if="order.current_status === 'created'"
              >
                Mark as Preparing
              </button>
              
              <button 
                @click="updateOrderStatus(order, 'ready')" 
                :disabled="updatingStatus === order.uuid"
                class="status-btn ready-btn"
                v-if="order.current_status === 'preparing' || order.current_status === 'created'"
              >
                Mark as Ready
              </button>
              
              <button 
                @click="updateOrderStatus(order, 'delivered')" 
                :disabled="updatingStatus === order.uuid"
                class="status-btn delivered-btn"
                v-if="order.current_status === 'ready'"
              >
                Mark as Delivered
              </button>
            </div>
            
            <div v-if="order.status_history && order.status_history.length > 0" class="order-history">
              <h4>Status History:</h4>
              <div v-for="history in order.status_history" :key="history.updated_at" class="history-item">
                <span class="history-status">{{ history.status }}</span>
                <span class="history-time">{{ new Date(history.updated_at).toLocaleString() }}</span>
                <span v-if="history.notes" class="history-notes">{{ history.notes }}</span>
                <span class="history-by">by: {{ history.updated_by === 'kitchen' ? 'Kitchen' : history.updated_by.substring(0, 8) }}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Orders -->
      <div v-if="orders.length === 0 && !loading && !error" class="no-orders">
        <p>No orders found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/api/apiClient'

const auth = useAuthStore()
const router = useRouter()

// Orders state
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const updatingStatus = ref(null)
const filterStatus = ref('all')

async function logout() {
  auth.logout()
  router.push('/')
}

async function fetchOrders() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/kitchen/orders')
    
    // Check if response is successful (status code 200-299)
    if (response.status >= 200 && response.status < 300) {
      orders.value = response.data
    } else {
      throw new Error(`HTTP ${response.status}: Failed to fetch orders`)
    }
  } catch (err) {
    // Handle different types of errors
    if (err.response) {
      // Server responded with error status
      const status = err.response.status
      if (status === 401) {
        error.value = 'Unauthorized. Please log in again.'
        auth.logout()
        router.push('/kitchen/login')
      } else if (status === 403) {
        error.value = 'Forbidden. You do not have permission to view orders.'
      } else if (status === 404) {
        error.value = 'Orders endpoint not found.'
      } else if (status === 500) {
        error.value = 'Server error. Please try again later.'
      } else {
        error.value = err.response?.data?.message || `Error ${status}: Failed to load orders`
      }
    } else if (err.request) {
      // Request was made but no response
      error.value = 'Network error. Please check your connection.'
    } else {
      // Something else happened
      error.value = err.message || 'Failed to load orders'
    }
    
    console.error('Error fetching orders:', err)
  } finally {
    loading.value = false
  }
}

async function updateOrderStatus(order, newStatus) {
  updatingStatus.value = order.uuid
  
  try {
    const response = await api.put('/api/kitchen/orders', null, {
      params: {
        uuid: order.uuid,
        new_status: newStatus,
        notes: `Status changed to ${newStatus} by kitchen`
      }
    })
    
    if (response.status >= 200 && response.status < 300) {
      // Update local order status
      const orderIndex = orders.value.findIndex(o => o.uuid === order.uuid)
      if (orderIndex !== -1) {
        orders.value[orderIndex].current_status = newStatus
        
        // Add to status history
        if (!orders.value[orderIndex].status_history) {
          orders.value[orderIndex].status_history = []
        }
        
        orders.value[orderIndex].status_history.push({
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: 'kitchen',
          notes: `Status changed to ${newStatus} by kitchen`
        })
      }
    } else {
      throw new Error(`HTTP ${response.status}: Failed to update order status`)
    }
  } catch (err) {
    let errorMessage = 'Failed to update order status'
    
    if (err.response) {
      const status = err.response.status
      if (status === 401) {
        errorMessage = 'Unauthorized. Please log in again.'
        auth.logout()
        router.push('/kitchen/login')
      } else if (status === 404) {
        errorMessage = 'Order not found.'
      } else {
        errorMessage = err.response?.data?.message || `Error ${status}: ${errorMessage}`
      }
    } else if (err.request) {
      errorMessage = 'Network error. Please check your connection.'
    } else {
      errorMessage = err.message || errorMessage
    }
    
    alert(errorMessage)
    console.error('Error updating order status:', err)
  } finally {
    updatingStatus.value = null
  }
}

// Filter orders by status
const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.current_status === filterStatus.value)
})

// Get status color
function getStatusColor(status) {
  const colors = {
    'created': '#4299e1',     // blue
    'preparing': '#ed8936',   // orange
    'ready': '#38a169',       // green
    'delivered': '#9f7aea',   // purple
    'cancelled': '#e53e3e'    // red
  }
  return colors[status] || '#718096' // gray
}

// Initialize
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Filter Buttons */
.order-filters {
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #cbd5e0;
}

.filter-btn.active {
  background: #4299e1;
  color: white;
  font-weight: bold;
}

/* Order Card Updates */
.order-status-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guest-room {
  background: #2d3748;
  color: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

/* Status Action Buttons */
.status-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
}

.status-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.status-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.6;
}

.preparing-btn {
  background: #ed8936;
}

.preparing-btn:hover:not(:disabled) {
  background: #dd6b20;
}

.ready-btn {
  background: #38a169;
}

.ready-btn:hover:not(:disabled) {
  background: #2f855a;
}

.delivered-btn {
  background: #9f7aea;
}

.delivered-btn:hover:not(:disabled) {
  background: #805ad5;
}

/* History updates */
.history-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
}

.history-by {
  color: #4a5568;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-buttons {
    flex-direction: column;
  }
  
  .filter-btn {
    width: 100%;
  }
  
  .status-actions {
    flex-direction: column;
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>