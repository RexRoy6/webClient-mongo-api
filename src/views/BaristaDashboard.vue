<template>
  <div class="dashboard container p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
  {{ auth.staffUser.role === 'barista' ? 'Barista Dashboard' : 'Kitchen Dashboard' }}
</h1>

      
      <!-- Kitchen User Info - MOVED TO TOP RIGHT -->
      <div v-if="auth.staffUser" class="text-right">
        <div class="text-sm text-gray-600">Logged in as:</div>
        <div class="font-semibold">{{ auth.staffUser.name }}</div>
        <div class="font-semibold">{{ auth.staffUser.role }}</div>
      </div>
    </div> <!-- Close the flex container here -->

    <!-- Orders Section -->
     <!-- LEFT: Orders (2/3 width) -->
<div class="lg:col-span-2">
     <div class="card mb-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">All Orders</h2>
        <button 
          @click="fetchOrders" 
          :disabled="loading" 
          class="btn btn-secondary btn-md flex items-center gap-2"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Refreshing...' : 'Refresh Orders' }}
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading text-center py-8">
        <div class="spinner mx-auto mb-2"></div>
        Loading orders...
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-box">
        <span>{{ error }}</span>
        <button @click="fetchOrders" class="btn btn-secondary btn-sm ml-4">
          Retry
        </button>
      </div>
      
      <!-- Orders Display -->
      <template v-else-if="orders.length > 0">
        <div class="order-filters mb-6">
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="status in orderStatuses" 
              :key="status.key"
              @click="filterStatus = status.key" 
              :class="[
                'btn btn-sm', 
                filterStatus === status.key ? 'btn-primary' : 'btn-secondary'
              ]"
            >
              {{ status.label }} ({{ statusCounts[status.key] || 0 }})
            </button>
          </div>
        </div>
        
        <div class="filtered-orders space-y-4">
          <div 
            v-for="order in filteredOrders" 
            :key="order.uuid" 
            class="order-card"
          >
            <div class="order-header mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <strong class="text-lg">Order #{{ order.uuid.substring(0, 8) }}</strong>
                  <span 
                    class="status-badge"
                    :class="`status-${order.current_status}`"
                  >
                    {{ order.current_status }}
                  </span>
                  <span 
                    v-if="order.solicitud.guest_room"
                    class="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold"
                  >
                    Room {{ order.solicitud.guest_room }}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  {{ new Date(order.created_at).toLocaleString() }}
                </div>
              </div>
            </div>
            
            <div class="order-details grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="order-items">
                <h4 class="font-semibold mb-2">Items:</h4>
                <div class="space-y-1">
                  <div 
                    v-for="item in order.solicitud.items" 
                    :key="item.name" 
                    class="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
                  >
                    <span>{{ item.name }} × {{ item.qty }}</span>
                    <span class="font-medium">${{ item.line_total }} MXN</span>
                  </div>
                </div>
              </div>
              
              <div class="order-summary space-y-2">
                <p><strong>Total:</strong> ${{ order.solicitud.total }} MXN</p>
                <p v-if="order.solicitud.note">
                  <strong>Note:</strong> {{ order.solicitud.note }}
                </p>
                <p><strong>Menu:</strong> {{ order.solicitud.menu_key }}</p>
                <p><strong>Order ID:</strong> {{ order.uuid }}</p>
                <p><strong>Created by:</strong> {{ order.created_by.substring(0, 8) }}...</p>
              </div>
            </div>
            
            <!-- Status Update Buttons -->
            <div 
              v-if="order.current_status !== 'cancelled' && order.current_status !== 'delivered'"
              class="status-actions border-t pt-4 flex flex-wrap gap-2"
            >
              <button 
                v-if="order.current_status === 'created'"
                @click="updateOrderStatus(order, 'pending')" 
                :disabled="updatingStatus === order.uuid"
                class="btn btn-warning btn-sm"
              >
                Mark as Pending
              </button>
              
              <button 
                v-if="order.current_status === 'created' || order.current_status === 'pending'"
                @click="updateOrderStatus(order, 'preparing')" 
                :disabled="updatingStatus === order.uuid"
                class="btn btn-warning btn-sm"
              >
                Mark as Preparing
              </button>
              
              <button 
                v-if="order.current_status === 'preparing'"
                @click="updateOrderStatus(order, 'ready')" 
                :disabled="updatingStatus === order.uuid"
                class="btn btn-success btn-sm"
              >
                Mark as Ready
              </button>
              
              <button 
                v-if="order.current_status === 'ready'"
                @click="updateOrderStatus(order, 'delivered')" 
                :disabled="updatingStatus === order.uuid"
                class="btn btn-secondary btn-sm"
              >
                Mark as Delivered
              </button>
              
              <button 
                v-if="['created', 'pending', 'preparing'].includes(order.current_status)"
                @click="updateOrderStatus(order, 'cancelled')" 
                :disabled="updatingStatus === order.uuid"
                class="btn btn-danger btn-sm"
              >
                Cancel Order
              </button>
            </div>
            
            <div 
              v-if="order.status_history && order.status_history.length > 0" 
              class="order-history mt-4 pt-4 border-t"
            >
              <h4 class="font-semibold mb-2">Status History:</h4>
              <div class="space-y-1">
                <div 
                  v-for="history in order.status_history" 
                  :key="history.updated_at" 
                  class="flex flex-wrap items-center gap-2 text-sm py-1"
                >
                  <span 
                    class="status-badge status-created"
                  >
                    {{ history.status }}
                  </span>
                  <span class="text-gray-500">
                    {{ new Date(history.updated_at).toLocaleString() }}
                  </span>
                  <span 
                    v-if="history.notes" 
                    class="text-gray-600 italic"
                  >
                    {{ history.notes }}
                  </span>
                  <span class="text-gray-400 text-xs">
                    by: {{ history.updated_by === 'kitchen' ? 'Kitchen' : history.updated_by.substring(0, 8) }}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- No Orders -->
      <div 
        v-else-if="!loading && !error" 
        class="text-center py-8 text-gray-500"
      >
        <p>No orders found.</p>
        <button 
          @click="fetchOrders" 
          class="btn btn-primary mt-4"
        >
          Refresh
        </button>
      </div>
    </div> <!-- Close the card -->
</div>
 <!-- aqui termina ordenes-->

 <!-- RIGHT: Menu + Cart + Create Order -->
<div class="space-y-6">
  <MenuPanel
    :menus="menus"
    @add-to-cart="addToCart"
  />

  <CartPanel
    :cart="cart"
    :total="cartTotal"
    @remove="removeFromCart"
  />

  <CreateOrderPanel
    :disabled="cart.length === 0 || creatingOrder"
    @submit="createOrder"
  />
</div>

   

    <!-- Logout Button - MOVED TO BOTTOM -->
    <div class="text-center mt-8">
      <button 
        @click="logout" 
        class="btn btn-danger btn-md"
      >
        Logout
      </button>
    </div>
  </div> <!-- Close the main container -->
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/api/apiClient'
import MenuPanel from '@/components/MenuPanel.vue'
import CartPanel from '@/components/CartPanel.vue'
import CreateOrderPanel from '@/components/CreateOrderPanel.vue'



const auth = useAuthStore()
const router = useRouter()
const business = useBusinessStore()

// Orders state
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const updatingStatus = ref(null)
const filterStatus = ref('all')
// Cart state , ver como sacartlo de create order panel
const cart = ref([])


// Status configuration
const orderStatuses = [
  { key: 'all', label: 'All' },
  { key: 'created', label: 'Created' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
]

async function logout() {
  await auth.logoutKitchen()
  await business.clearBusiness()
  router.push('/')
}

async function fetchOrders() {
  loading.value = true
  error.value = null
  
  try {

     if (!business.businessCode) {
      console.error('No business code available')
      loadingOrders.value = false
      return
    }

    const response = await api.get('/api/orders/kitchen', {
      headers: {
        'X-Business-Code': business.businessCode
      }
    })
    
    
    // Check if response is successful (status code 200-299)
    if (response.status >= 200 && response.status < 300) {
      orders.value = response.data.orders || []
          // Optional: You might want to store other data too
    //console.log('Full response:', response.data)
    //console.log('Orders:', orders.value)

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
    const response = await api.put('/api/orders/kitchen/update', null, {
      headers: {
        'X-Business-Code': business.businessCode
      },
      params: {
        order_uuid: order.uuid,
        status: newStatus,
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
          notes: `Status changed to ${newStatus} by ${auth.staffUser.role}`

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
      } else if (status === 422) {
        // Handle validation errors
        const errors = err.response.data.errors || {}
        errorMessage = Object.values(errors).flat().join(', ') || 'Invalid data sent to server'
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

// Computed properties
const statusCounts = computed(() => {
  const counts = { all: orders.value.length }
  orderStatuses.slice(1).forEach(status => {
    counts[status.key] = orders.value.filter(o => o.current_status === status.key).length
  })
  return counts
})

const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.current_status === filterStatus.value)
})
function addToCart(item) {
  const existing = cart.value.find(i => i.name === item.name)

  if (existing) {
    existing.qty++
  } else {
    cart.value.push({
      name: item.name,
      qty: 1,
      unit_price: item.price
    })
  }
}

function removeFromCart(name) {
  const index = cart.value.findIndex(i => i.name === name)
  if (index !== -1) {
    cart.value[index].qty > 1
      ? cart.value[index].qty--
      : cart.value.splice(index, 1)
  }
}

const cartTotal = computed(() =>
  cart.value.reduce((t, i) => t + i.unit_price * i.qty, 0)
)


// Initialize
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
/* Component-specific styles that aren't covered by main.css */

/* Order card hover effect */
.order-card {
  transition: all var(--transition-fast);
  border: 1px solid var(--gray-200);
}

.order-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
  transform: translateY(-1px);
}

/* Status badge enhancement */
.status-badge {
  text-transform: capitalize;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

/* Responsive adjustments for buttons */
@media (max-width: 768px) {
  .status-actions {
    flex-direction: column;
  }
  
  .status-actions .btn {
    width: 100%;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
}

/* Animation for status updates */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.order-card:has(.updating-status) {
  animation: pulse 1s ease-in-out infinite;
}

/* Custom spinner for loading state */
.loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 153, 225, 0.2);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .order-card {
    border-color: var(--gray-700);
  }
  
  .order-details .border-gray-100 {
    border-color: var(--gray-700);
  }
}
</style>