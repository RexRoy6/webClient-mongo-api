<template>
  <div class="kitchen-dashboard p-6">

    <!-- HEADER (same as barista) -->
    <div class="header sticky top-0 z-30 mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Kitchen Dashboard</h1>

        <div class="text-right">
          <div class="text-sm text-gray-600">Logged in as:</div>
          <div class="font-semibold">{{ auth.staffUser.name }}</div>
          <div class="font-semibold">{{ auth.staffUser.role }}</div>
        </div>
      </div>
    </div>

    <!-- ORDERS ONLY -->
    <div class="orders-only">
      <div class="orders-scroll">
        <div class="orders-column">
          <div class="card">

            <!-- Header row -->
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

            <!-- Loading -->
            <div v-if="loading" class="loading text-center py-8">
              <div class="spinner mx-auto mb-2"></div>
              Loading orders...
            </div>

            <!-- Error -->
            <div v-else-if="error" class="error-box">
              <span>{{ error }}</span>
              <button @click="fetchOrders" class="btn btn-secondary btn-sm ml-4">
                Retry
              </button>
            </div>

            <!-- Orders -->
            <template v-else-if="orders.length > 0">
              <div class="overflow-y-auto pr-2" style="max-height: calc(100vh - 260px);">

                <!-- FILTERS (sticky like barista) -->
                <div class="order-filters mb-6 sticky top-0 bg-inherit z-10">
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

                <!-- ORDER LIST -->
                <div class="filtered-orders space-y-4">
                  <div
                    v-for="order in filteredOrders"
                    :key="order.uuid"
                    class="order-card"
                  >

                    <!-- ORDER HEADER -->
                    <div class="order-header mb-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <strong class="text-lg">
                            Order #{{ order.uuid.substring(0, 8) }}
                          </strong>

                          <span
                            class="status-badge"
                            :class="`status-${order.current_status}`"
                          >
                            {{ order.current_status }}
                          </span>

                          <span
                            v-if="order.solicitud.guest_room"
                            class="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold"
                          >
                            Room {{ order.solicitud.guest_room }}
                          </span>
                        </div>

                        <div class="text-sm text-gray-500">
                          {{ new Date(order.created_at).toLocaleString() }}
                        </div>
                      </div>
                    </div>

                    <!-- ORDER DETAILS -->
                    <div class="order-details grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 class="font-semibold mb-2">Items:</h4>
                        <div class="space-y-1">
                          <div
                            v-for="item in order.solicitud.items"
                            :key="item.name"
                            class="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
                          >
                            <span>{{ item.name }} × {{ item.qty }}</span>
                            <span class="font-medium">
                              ${{ item.line_total }} MXN
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <p><strong>Total:</strong> ${{ order.solicitud.total }} MXN</p>
                        <p v-if="order.solicitud.note">
                          <strong>Note:</strong> {{ order.solicitud.note }}
                        </p>
                        <p><strong>Menu:</strong> {{ order.solicitud.menu_key }}</p>
                        <p><strong>Order ID:</strong> {{ order.uuid }}</p>
                      </div>
                    </div>

                    <!-- STATUS ACTIONS -->
                    <div
                      v-if="order.current_status !== 'cancelled' && order.current_status !== 'delivered'"
                      class="status-actions border-t pt-4 flex flex-wrap gap-2"
                    >
                      <button
                        v-if="order.current_status === 'created'"
                        @click="updateOrderStatus(order, 'pending')"
                        class="btn btn-warning btn-sm"
                      >
                        Mark as Pending
                      </button>

                      <button
                        v-if="['created','pending'].includes(order.current_status)"
                        @click="updateOrderStatus(order, 'preparing')"
                        class="btn btn-warning btn-sm"
                      >
                        Mark as Preparing
                      </button>

                      <button
                        v-if="order.current_status === 'preparing'"
                        @click="updateOrderStatus(order, 'ready')"
                        class="btn btn-success btn-sm"
                      >
                        Mark as Ready
                      </button>

                      <button
                        v-if="order.current_status === 'ready'"
                        @click="updateOrderStatus(order, 'delivered')"
                        class="btn btn-secondary btn-sm"
                      >
                        Mark as Delivered
                      </button>

                      <button
                        v-if="['created','pending','preparing'].includes(order.current_status)"
                        @click="updateOrderStatus(order, 'cancelled')"
                        class="btn btn-danger btn-sm"
                      >
                        Cancel Order
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </template>

            <!-- NO ORDERS -->
            <div v-else class="text-center py-8 text-gray-500">
              No orders found.
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="side-footer">
      <button @click="logout" class="btn btn-danger logout-btn">
        Logout
      </button>
    </div>

  </div>
</template>


<script setup>
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/api/apiClient'

const auth = useAuthStore()
const router = useRouter()
const business = useBusinessStore()

// Orders state
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const updatingStatus = ref(null)
const filterStatus = ref('all')

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