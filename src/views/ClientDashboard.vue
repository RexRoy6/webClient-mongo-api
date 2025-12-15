<template>
  <div class="dashboard container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Client Dashboard</h1>

   <!-- Order History -->
    <div class="dashboard-box card">
      <div class="orders-header flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Your Orders</h3>
        <button @click="fetchOrders" :disabled="loadingOrders" class="btn btn-primary btn-sm">
          {{ loadingOrders ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="loadingOrders" class="loading text-center py-8 text-gray-500">
        Loading orders...
      </div>
      
      <div v-else-if="orders.length === 0" class="no-orders text-center py-8 text-gray-500">
        <p>No orders yet. Start by adding items to your cart!</p>
      </div>
      
      <div v-else class="orders-list space-y-4">
        <div v-for="order in orders" :key="order.uuid" class="order-card card">
          <div class="order-header mb-4">
            <div class="order-id">
              <strong class="text-lg">Order #{{ order.uuid.substring(0, 8) }}</strong>
              <p class="order-date text-sm text-gray-500 mt-1">{{ new Date(order.created_at).toLocaleString() }}</p>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="`status-${order.current_status}`">
                {{ order.current_status }}
              </span>
            </div>
          </div>
          
          <div class="order-details grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div class="order-items">
              <h4 class="font-semibold mb-2">Items:</h4>
              <div v-for="item in order.solicitud.items" :key="item.name" class="order-item flex justify-between py-2 border-b border-gray-200">
                <span>{{ item.name }} × {{ item.qty }}</span>
                <span class="font-medium">${{ item.line_total }} MXN</span>
              </div>
            </div>
            
            <div class="order-summary">
              <p class="mb-2"><strong>Total:</strong> ${{ order.solicitud.total }} MXN</p>
              <p v-if="order.solicitud.note" class="mb-2"><strong>Note:</strong> {{ order.solicitud.note }}</p>
              <p><strong>Menu:</strong> {{ order.solicitud.menu_key }}</p>
            </div>
          </div>
          
          <!-- Cancel Button -->
          <div v-if="canCancelOrder(order)" class="cancel-order-section pt-4 border-t text-right">
            <button 
              @click="openCancelModal(order)" 
              class="btn btn-danger btn-sm"
              :disabled="cancelingOrder === order.uuid"
            >
              {{ cancelingOrder === order.uuid ? 'Cancelling...' : 'Cancel Order' }}
            </button>
          </div>
          
          <div v-if="order.status_history && order.status_history.length > 0" class="order-history pt-4 border-t mt-4">
            <h4 class="font-semibold mb-2">Status History:</h4>
            <div v-for="history in order.status_history" :key="history.updated_at" class="history-item text-sm py-1">
              <div class="flex justify-between items-center">
                <span class="history-status font-medium">{{ history.status }}</span>
                <span class="history-time text-gray-500">{{ new Date(history.updated_at).toLocaleString() }}</span>
              </div>
              <span v-if="history.notes" class="history-notes text-gray-600 italic block mt-1">{{ history.notes }}</span>
            </div>
          </div>
        </div>
    </div>

    <!-- Cart Sidebar -->
    <div class="cart-sidebar card" v-if="cart.length > 0">
      <div class="cart-header flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Your Cart ({{ cartItemCount }} items)</h3>
        <button @click="clearCart" class="btn btn-danger btn-sm">
          Clear
        </button>
      </div>
      
      <div class="cart-items mb-4">
        <div v-for="item in cart" :key="item.name" class="cart-item card p-3 mb-3">
          <div class="flex justify-between items-center">
            <div class="cart-item-info">
              <h4 class="font-medium text-gray-800">{{ item.name }}</h4>
              <p class="item-price text-sm text-gray-600">${{ item.unit_price }} MXN × {{ item.qty }}</p>
              <p class="item-total font-bold text-gray-900">${{ item.unit_price * item.qty }} MXN</p>
            </div>
            <div class="cart-item-actions flex items-center gap-2">
              <button @click="removeFromCart(item.name)" class="qty-btn btn btn-secondary btn-sm px-3">−</button>
              <span class="qty-display font-bold min-w-8 text-center">{{ item.qty }}</span>
              <button @click="addToCart({ name: item.name, price: item.unit_price })" class="qty-btn btn btn-secondary btn-sm px-3">+</button>
              <button @click="removeItemCompletely(item.name)" class="remove-btn btn btn-danger btn-sm px-3">×</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cart-total text-right text-lg font-bold mb-4 pt-4 border-t">
        Total: ${{ cartTotal }} MXN
      </div>
      
      <div class="order-note mb-4">
        <textarea 
          v-model="orderNote" 
          placeholder="Add special instructions for your order..."
          rows="2"
          class="form-input w-full"
        ></textarea>
      </div>
      
      <div class="order-actions mb-4">
        <button 
          @click="createOrder" 
          :disabled="creatingOrder" 
          class="btn btn-success btn-lg w-full"
        >
          {{ creatingOrder ? 'Placing Order...' : 'Place Order' }}
        </button>
      </div>
      
      <!-- Order Messages -->
      <div v-if="orderError" class="error-box mb-4">
        {{ orderError }}
      </div>
      
      <div v-if="orderSuccess" class="success-box mb-4">
        <h4 class="font-bold text-lg mb-2">✅ Order Created Successfully!</h4>
        <p>Order ID: {{ orderSuccess.uuid }}</p>
        <p>Status: {{ orderSuccess.current_status }}</p>
        <p>Total: ${{ orderSuccess.solicitud.total }} MXN</p>
      </div>
    </div>

    <!-- Menu Section -->
    <div class="dashboard-box card mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Menu: {{ menuKey }}</h3>
        <button @click="fetchMenu" class="btn btn-primary btn-sm" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
      
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
      
      <!-- Menu Display -->
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
              <div class="item-actions">
                <button class="btn btn-primary btn-sm" @click="addToCart(item)">
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Guest Info -->
    <div class="dashboard-box card mb-6">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">Logged in as:</h3>
      <div class="space-y-2">
        <p><strong class="text-gray-600">Name:</strong> {{ auth.guest.guest_name }}</p>
        <p><strong class="text-gray-600">Room Number:</strong> {{ auth.guest?.room_number }}</p>
        <p><strong class="text-gray-600">Role:</strong> {{ auth.guest?.role }}</p>
      </div>
    </div>

    <button @click="logout" class="btn btn-danger btn-lg mb-6">
      Logout
    </button>
    
    </div>

    <!-- Cancel Order Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-bold text-red-600">Cancel Order</h3>
          <button @click="closeCancelModal" class="modal-close-btn btn btn-secondary btn-sm p-2 rounded-full">
            ×
          </button>
        </div>
        
        <div class="modal-content p-6">
          <p class="mb-4">Are you sure you want to cancel order <strong>#{{ orderToCancel?.uuid?.substring(0, 8) }}</strong>?</p>
          <p class="mb-2"><strong>Status:</strong> {{ orderToCancel?.current_status }}</p>
          <p class="mb-6"><strong>Total:</strong> ${{ orderToCancel?.solicitud?.total }} MXN</p>
          
          <div class="cancel-note mb-6">
            <label for="cancelNote" class="form-label">Reason for cancellation (optional):</label>
            <textarea 
              id="cancelNote"
              v-model="cancelNote" 
              placeholder="E.g. Changed my mind, too long wait time, etc."
              rows="3"
              class="form-input w-full"
            ></textarea>
          </div>
          
          <div v-if="cancelError" class="error-box mb-6">
            {{ cancelError }}
          </div>
        </div>
        
        <div class="modal-actions flex justify-end gap-4 p-6 border-t">
          <button @click="closeCancelModal" class="btn btn-secondary">
            No, Keep Order
          </button>
          <button 
            @click="confirmCancelOrder" 
            :disabled="cancelingOrder"
            class="btn btn-danger"
          >
            {{ cancelingOrder ? 'Cancelling...' : 'Yes, Cancel Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Keep the same <script> section -->
<script setup>
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/api/apiClient'

const auth = useAuthStore()
const router = useRouter()
const business = useBusinessStore()

// Menu state
const menu = ref(null)
const loading = ref(false)
const error = ref(null)
const menuKey = ref('menu_la_pergola_t')//ver como sacarlo desde el busness de laapi

// Cart state
const cart = ref([])
const orderNote = ref('')

// Order history state
const orders = ref([])
const loadingOrders = ref(false)
const creatingOrder = ref(false)
const orderSuccess = ref(null)
const orderError = ref(null)

// Cancel order state
const cancelingOrder = ref(null)
const cancelNote = ref('')
const cancelError = ref(null)
const showCancelModal = ref(false)
const orderToCancel = ref(null)

async function logout() {
  await auth.logoutClient()
  await business.clearBusiness()
  router.push('/')
}

async function fetchMenu() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/menus', {
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

// Cart functions
function addToCart(item) {
  const existingItem = cart.value.find(i => i.name === item.name)
  
  if (existingItem) {
    existingItem.qty++
  } else {
    cart.value.push({
      name: item.name,
      qty: 1,
      unit_price: item.price,
      image: item.image
    })
  }
}

function removeFromCart(itemName) {
  const itemIndex = cart.value.findIndex(i => i.name === itemName)
  if (itemIndex !== -1) {
    if (cart.value[itemIndex].qty > 1) {
      cart.value[itemIndex].qty--
    } else {
      cart.value.splice(itemIndex, 1)
    }
  }
}

function removeItemCompletely(itemName) {
  cart.value = cart.value.filter(item => item.name !== itemName)
}

function clearCart() {
  cart.value = []
  orderNote.value = ''
}

// Cart computed properties
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.unit_price * item.qty), 0)
})

const cartItemCount = computed(() => {
  return cart.value.reduce((count, item) => count + item.qty, 0)
})

// Order functions
async function createOrder() {
  if (cart.value.length === 0) {
    orderError.value = 'Your cart is empty'
    return
  }

  // console.log('info user/guest:', auth.guest)

  creatingOrder.value = true
  orderError.value = null
  orderSuccess.value = null

  try {
    const orderData = {
      menu_key: menuKey.value,
      solicitud: {
        items: cart.value.map(item => ({
          name: item.name,
          qty: item.qty
        })),
        note: orderNote.value.trim() || undefined,
        currency: 'mxn'
      }
    }

    const response = await api.post('/api/orders', orderData)
    
    orderSuccess.value = response.data
    clearCart()
    
    // Refresh orders list
    fetchOrders()
  } catch (err) {
    orderError.value = err.response?.data?.message || 'Failed to create order'
    console.error('Error creating order:', err)
  } finally {
    creatingOrder.value = false
  }
}

async function fetchOrders() {
  loadingOrders.value = true
  
  try {
    // Check if we have business context
    if (!business.businessCode) {
      console.error('No business code available')
      loadingOrders.value = false
      return
    }

    const response = await api.get('/api/orders', {
      headers: {
        'X-Business-Code': business.businessCode
      }
    })
    
    // Access the orders array from the response structure
    orders.value = response.data.orders || []
    
    // Optional: You might want to store other data too
    console.log('Full response:', response.data)
    console.log('Orders:', orders.value)
    
  } catch (err) {
    console.error('Error fetching orders:', err)
    orders.value = [] // Ensure it's an empty array on error
  } finally {
    loadingOrders.value = false
  }
}

// Cancel order functions
function openCancelModal(order) {
  orderToCancel.value = order
  cancelNote.value = ''
  cancelError.value = null
  showCancelModal.value = true
}

function closeCancelModal() {
  showCancelModal.value = false
  orderToCancel.value = null
  cancelNote.value = ''
  cancelError.value = null
}

async function confirmCancelOrder() {
  if (!orderToCancel.value || !auth.guest) {
    cancelError.value = 'Cannot cancel order. Missing information.'
    return
  }

  cancelingOrder.value = orderToCancel.value.uuid
  cancelError.value = null

  try {
    // Using PUT method with query parameters
    const response = await api.put('/api/orders/cancel', null, {
      headers: {
        'X-Business-Code': business.businessCode
      },
      params: {
        order_uuid: orderToCancel.value.uuid,
        notes: cancelNote.value.trim() || 'Cancelled by guest'
      }
    })
    
    // Update the order status locally
    const orderIndex = orders.value.findIndex(o => o.uuid === orderToCancel.value.uuid)
    if (orderIndex !== -1) {
      orders.value[orderIndex].current_status = 'cancelled'
      // Add to status history
      if (!orders.value[orderIndex].status_history) {
        orders.value[orderIndex].status_history = []
      }
      orders.value[orderIndex].status_history.push({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        updated_by: auth.guest.guest_uuid,
        notes: cancelNote.value.trim() || 'Cancelled by guest'
      })
    }
    
    closeCancelModal()
  } catch (err) {
    cancelError.value = err.response?.data?.message || 'Failed to cancel order'
    console.error('Error canceling order:', err)
  } finally {
    cancelingOrder.value = null
  }
}

// Check if order can be cancelled
function canCancelOrder(order) {
  // Only allow cancelling orders that are not already cancelled or delivered
  return order.current_status !== 'cancelled' && 
         order.current_status !== 'delivered' &&
         order.current_status !== 'ready' // You might want to allow cancellation even for ready orders
}

// Get status color
function getStatusColor(status) {
  const colors = {
    'created': 'blue',
    'preparing': 'orange',
    'ready': 'green',
    'delivered': 'purple',
    'cancelled': 'red'
  }
  return colors[status] || 'gray'
}

// Initialize
onMounted(() => {
  fetchMenu()
  fetchOrders()
})
</script>