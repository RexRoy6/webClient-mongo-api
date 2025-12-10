<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/api/apiClient'

const auth = useAuthStore()
const router = useRouter()

// Menu state
const menu = ref(null)
const loading = ref(false)
const error = ref(null)
const menuKey = ref('menu_cafe')

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

  if (!auth.guest?.guest_uuid) {
    orderError.value = 'User information not found. Please log in again.'
    return
  }

  creatingOrder.value = true
  orderError.value = null
  orderSuccess.value = null

  try {
    const orderData = {
      guest_uuid: auth.guest.guest_uuid,
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

    const response = await api.post('/api/hotel/orders', orderData)
    
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
  if (!auth.guest?.guest_uuid) return

  loadingOrders.value = true
  
  try {
    const response = await api.get('/api/hotel/orders', {
      params: {
        guest_uuid: auth.guest.guest_uuid
      }
    })
    
    orders.value = response.data
  } catch (err) {
    console.error('Error fetching orders:', err)
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
  if (!orderToCancel.value || !auth.guest?.guest_uuid) {
    cancelError.value = 'Cannot cancel order. Missing information.'
    return
  }

  cancelingOrder.value = orderToCancel.value.uuid
  cancelError.value = null

  try {
    // Using PUT method with query parameters
    const response = await api.put('/api/hotel/orders', null, {
      params: {
        uuid: orderToCancel.value.uuid,
        notes: cancelNote.value.trim() || 'Cancelled by guest',
        guest_uuid: auth.guest.guest_uuid
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

<template>
  <div class="dashboard">
    <h1>Client Dashboard</h1>

    <!-- Guest Info -->
    <div class="dashboard-box">
      <h3>Logged in as:</h3>
      <p><strong>Name:</strong> {{ auth.guest?.guest_name }}</p>
      <p><strong>Room Number:</strong> {{ auth.guest?.room_number }}</p>
      <p><strong>UUID:</strong> {{ auth.guest?.guest_uuid }}</p>
    </div>

    <button @click="logout" class="dashboard-btn logout-btn">Logout</button>

    <!-- Cart Sidebar -->
    <div class="cart-sidebar" v-if="cart.length > 0">
      <div class="cart-header">
        <h3>Your Cart ({{ cartItemCount }} items)</h3>
        <button @click="clearCart" class="clear-cart-btn">Clear</button>
      </div>
      
      <div class="cart-items">
        <div v-for="item in cart" :key="item.name" class="cart-item">
          <div class="cart-item-info">
            <h4>{{ item.name }}</h4>
            <p class="item-price">${{ item.unit_price }} MXN × {{ item.qty }}</p>
            <p class="item-total">${{ item.unit_price * item.qty }} MXN</p>
          </div>
          <div class="cart-item-actions">
            <button @click="removeFromCart(item.name)" class="qty-btn">−</button>
            <span class="qty-display">{{ item.qty }}</span>
            <button @click="addToCart({ name: item.name, price: item.unit_price })" class="qty-btn">+</button>
            <button @click="removeItemCompletely(item.name)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      
      <div class="cart-total">
        <strong>Total: ${{ cartTotal }} MXN</strong>
      </div>
      
      <div class="order-note">
        <textarea 
          v-model="orderNote" 
          placeholder="Add special instructions for your order..."
          rows="2"
        ></textarea>
      </div>
      
      <div class="order-actions">
        <button 
          @click="createOrder" 
          :disabled="creatingOrder" 
          class="checkout-btn"
        >
          {{ creatingOrder ? 'Placing Order...' : 'Place Order' }}
        </button>
      </div>
      
      <!-- Order Messages -->
      <div v-if="orderError" class="error-message">
        {{ orderError }}
      </div>
      
      <div v-if="orderSuccess" class="success-message">
        <h4>✅ Order Created Successfully!</h4>
        <p>Order ID: {{ orderSuccess.uuid }}</p>
        <p>Status: {{ orderSuccess.current_status }}</p>
        <p>Total: ${{ orderSuccess.solicitud.total }} MXN</p>
      </div>
    </div>

    <!-- Menu Section -->
    <div class="dashboard-box">
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

    <!-- Order History -->
    <div class="dashboard-box">
      <div class="orders-header">
        <h3>Your Orders</h3>
        <button @click="fetchOrders" :disabled="loadingOrders" class="refresh-orders-btn">
          {{ loadingOrders ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="loadingOrders" class="loading">
        Loading orders...
      </div>
      
      <div v-else-if="orders.length === 0" class="no-orders">
        <p>No orders yet. Start by adding items to your cart!</p>
      </div>
      
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.uuid" class="order-card">
          <div class="order-header">
            <div class="order-id">
              <strong>Order #{{ order.uuid.substring(0, 8) }}</strong>
              <span class="order-date">{{ new Date(order.created_at).toLocaleString() }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge" :style="{ backgroundColor: getStatusColor(order.current_status) }">
                {{ order.current_status }}
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
            </div>
          </div>
          
          <!-- Cancel Button -->
          <div v-if="canCancelOrder(order)" class="cancel-order-section">
            <button 
              @click="openCancelModal(order)" 
              class="cancel-order-btn"
              :disabled="cancelingOrder === order.uuid"
            >
              {{ cancelingOrder === order.uuid ? 'Cancelling...' : 'Cancel Order' }}
            </button>
          </div>
          
          <div v-if="order.status_history && order.status_history.length > 0" class="order-history">
            <h4>Status History:</h4>
            <div v-for="history in order.status_history" :key="history.updated_at" class="history-item">
              <span class="history-status">{{ history.status }}</span>
              <span class="history-time">{{ new Date(history.updated_at).toLocaleString() }}</span>
              <span v-if="history.notes" class="history-notes">{{ history.notes }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Cancel Order</h3>
          <button @click="closeCancelModal" class="modal-close-btn">×</button>
        </div>
        
        <div class="modal-content">
          <p>Are you sure you want to cancel order <strong>#{{ orderToCancel?.uuid?.substring(0, 8) }}</strong>?</p>
          <p><strong>Status:</strong> {{ orderToCancel?.current_status }}</p>
          <p><strong>Total:</strong> ${{ orderToCancel?.solicitud?.total }} MXN</p>
          
          <div class="cancel-note">
            <label for="cancelNote">Reason for cancellation (optional):</label>
            <textarea 
              id="cancelNote"
              v-model="cancelNote" 
              placeholder="E.g. Changed my mind, too long wait time, etc."
              rows="3"
            ></textarea>
          </div>
          
          <div v-if="cancelError" class="error-message">
            {{ cancelError }}
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="closeCancelModal" class="modal-btn cancel-btn">No, Keep Order</button>
          <button 
            @click="confirmCancelOrder" 
            :disabled="cancelingOrder"
            class="modal-btn confirm-cancel-btn"
          >
            {{ cancelingOrder ? 'Cancelling...' : 'Yes, Cancel Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>