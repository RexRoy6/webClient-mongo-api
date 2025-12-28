<template>
  <div class="client-dashboard p-6">

    <!-- HEADER -->
    <div class="header sticky top-0 z-30 mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Client Dashboard</h1>
        <div class="text-right text-sm">
          <div class="text-gray-600">Logged in as:</div>
          <div class="font-semibold">{{ auth.guest.guest_name }}</div>
          <div class="font-semibold">Room {{ auth.guest?.room_number }}</div>
        </div>
      </div>
    </div>

    <!-- VIEW SELECTOR -->
    <div class="view-selector mb-6 flex gap-2">
      <button class="btn btn-sm" :class="activeView === 'orders' ? 'btn-primary' : 'btn-secondary'"
        @click="activeView = 'orders'">
        Your Orders
      </button>

      <button class="btn btn-sm" :class="activeView === 'cart' ? 'btn-primary' : 'btn-secondary'"
        @click="activeView = 'cart'">
        Cart / Menu
      </button>
    </div>

    <!-- ================= ORDERS VIEW ================= -->
    <template v-if="activeView === 'orders'">
      <div class="orders-only">
        <div class="orders-scroll">
          <div class="card">

            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">Your Orders</h2>
              <button @click="fetchOrders" :disabled="loadingOrders" class="btn btn-secondary btn-sm">
                {{ loadingOrders ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>

            <!-- Loading -->
            <div v-if="loadingOrders" class="text-center py-8 text-gray-500">
              Loading orders...
            </div>

            <!-- Empty -->
            <div v-else-if="orders.length === 0" class="text-center py-8 text-gray-500">
              No orders yet.
            </div>

            <!-- Orders List -->
            <div v-else class="space-y-4 overflow-y-auto pr-2" style="max-height: calc(100vh - 260px);">
              <div v-for="order in orders" :key="order.uuid" class="order-card card">
                <div class="order-header mb-4 flex justify-between items-start">
                  <div>
                    <strong class="text-lg">Order #{{ order.uuid.substring(0, 8) }}</strong>
                    <div class="text-sm text-gray-500">
                      {{ new Date(order.created_at).toLocaleString() }}
                    </div>
                  </div>

                  <span class="status-badge" :class="`status-${order.current_status}`">
                    {{ order.current_status }}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 class="font-semibold mb-2">Items</h4>
                    <div v-for="item in order.solicitud.items" :key="item.name"
                      class="flex justify-between py-1 border-b">
                      <span>{{ item.name }} × {{ item.qty }}</span>
                      <span>${{ item.line_total }} MXN</span>
                    </div>
                  </div>

                  <div>
                    <p><strong>Total:</strong> ${{ order.solicitud.total }} MXN</p>
                    <p v-if="order.solicitud.note">
                      <strong>Note:</strong> {{ order.solicitud.note }}
                    </p>
                    <p><strong>Menu:</strong> {{ order.solicitud.menu_key }}</p>
                  </div>
                </div>

                <!-- Cancel -->
                <div v-if="canCancelOrder(order)" class="border-t pt-4 text-right">
                  <button class="btn btn-danger btn-sm" @click="openCancelModal(order)"
                    :disabled="cancelingOrder === order.uuid">
                    {{ cancelingOrder === order.uuid ? 'Cancelling...' : 'Cancel Order' }}
                  </button>
                </div>

                <!-- History -->
                <div v-if="order.status_history?.length" class="border-t mt-4 pt-4">
                  <h4 class="font-semibold mb-2">Status History</h4>
                  <div v-for="h in order.status_history" :key="h.updated_at" class="text-sm text-gray-600">
                    {{ h.status }} – {{ new Date(h.updated_at).toLocaleString() }}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <!-- cancel order -->
        <!-- 🔴 KEEP YOUR EXISTING MODAL CODE BELOW EXACTLY AS IS -->

        <!-- Cancel Order Modal -->
        <div v-if="showCancelModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-header flex justify-between items-center p-6 border-b">
              <h3 class="text-xl font-bold text-red-600">Cancel Order</h3> <button @click="closeCancelModal"
                class="modal-close-btn btn btn-secondary btn-sm p-2 rounded-full"> × </button>
            </div>
            <div class="modal-content p-6">
              <p class="mb-4">Are you sure you want to cancel order <strong>#{{ orderToCancel?.uuid?.substring(0, 8)
                  }}</strong>?</p>
              <p class="mb-2"><strong>Status:</strong> {{ orderToCancel?.current_status }}</p>
              <p class="mb-6"><strong>Total:</strong> ${{ orderToCancel?.solicitud?.total }} MXN</p>
              <div class="cancel-note mb-6"> <label for="cancelNote" class="form-label">Reason for cancellation
                  (optional):</label> <textarea id="cancelNote" v-model="cancelNote"
                  placeholder="E.g. Changed my mind, too long wait time, etc." rows="3"
                  class="form-input w-full"></textarea> </div>
              <div v-if="cancelError" class="error-box mb-6"> {{ cancelError }} </div>
            </div>
            <div class="modal-actions flex justify-end gap-4 p-6 border-t"> <button @click="closeCancelModal"
                class="btn btn-secondary"> No, Keep Order </button> <button @click="confirmCancelOrder"
                :disabled="cancelingOrder" class="btn btn-danger"> {{ cancelingOrder ? 'Cancelling...' :
                'Yes,CancelOrder' }} </button>
            </div>
          </div>
        </div>
        <!-- cancel order -->

      </div>
    </template>

    <!-- ================= CART / MENU VIEW ================= -->
    <template v-else>
      <div class="cart-menu-layout">

        <!-- MENU -->
        <div class="menu-scroll">
          <MenuPanel mode="create" @add-to-cart="handleAddFromMenu" />
        </div>

        <!-- CART -->
        <div class="cart-scroll">
          <CartPanel :cart="cart" :total="cartTotal" @add="addToCart" @remove="removeFromCart"
            @remove-all="removeItemCompletely" @clear="clearCart" />
        </div>

        <!-- CREATE ORDER -->
        <CreateOrderPanel v-model:note="orderNote" v-model:name_client="orderName"
          :disabled="cart.length === 0 || creatingOrder" @submit="createOrder" />
      </div>
    </template>

    <!-- ================= CART / MENU VIEW ================= -->

    <!-- FOOTER -->
    <div class="side-footer">
      <button @click="logout" class="btn btn-danger">
        Logout
      </button>
    </div>
  </div>
</template>


<!-- Keep the same <script> section -->
<script setup>
//temp
// console.log('[CLIENT DASHBOARD] auth.token', auth.token)
// console.log('[CLIENT DASHBOARD] auth.userType', auth.userType)
// console.log('[CLIENT DASHBOARD] auth.guest', auth.guest)
// console.log('[CLIENT DASHBOARD] businessCode', business.businessCode)
//temp
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

// Menu state
const menu = ref(null)
const loading = ref(false)
const error = ref(null)
const menuKey = computed(() => business.businessKey)
const activeView = ref('orders')


// Cart state
const cart = ref([])
const orderNote = ref('')
const orderName = ref('')


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
//menu functions
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

function handleAddFromMenu(item) {
  addToCart(item)
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
  if (!cart.value.length) {
    orderError.value = 'Your cart is empty'
    return
  }

  creatingOrder.value = true
  orderError.value = null
  orderSuccess.value = null

  const orderData = {
    menu_key: 'default',
    solicitud: {
      items: cart.value.map(item => ({
        name: item.name,
        qty: item.qty
      })),
      note: orderNote.value?.trim() || undefined,
      name: orderName.value || undefined,
      currency: 'mxn'
    }
  }

  try {
    const response = await api.post('/api/orders', orderData)

    orderSuccess.value = response.data
    clearCart()
    fetchOrders()
  } catch (err) {
    console.error('Order error:', err.response)
    orderError.value =
      err.response?.data?.message ||
      `Order failed (${err.response?.status})`
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
    //console.log('Full response:', response.data)
    //console.log('Orders:', orders.value)

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