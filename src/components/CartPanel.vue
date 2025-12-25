<script setup>
import { computed } from 'vue'

const props = defineProps({
  cart: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'Cart'
  }
})


const emit = defineEmits([
  'add',
  'remove',
  'remove-all',
  'clear'
])

const cartItemCount = computed(() =>
  props.cart.reduce((sum, i) => sum + i.qty, 0)
)
</script>

<template>
  <div class="card cart-panel">
    <!-- Header -->
    <div class="flex justify-between mb-4">
      <h3 class="font-bold">
        {{ title }} ({{ cartItemCount }})
      </h3>


      <button v-if="cart.length" class="btn btn-danger btn-sm" @click="emit('clear')">
        Clear
      </button>
    </div>

    <!-- EMPTY CART STATE -->
    <div v-if="!cart.length" class="empty-cart">
      <p class="text-gray-500 text-center">
        Your cart is empty
      </p>
      <p class="text-sm text-gray-600 text-center mt-1">
        Add items from the menu
      </p>
    </div>

    <!-- CART ITEMS -->
    <template v-else>
      <div v-for="item in cart" :key="item.name" class="mb-3">
        <div class="flex justify-between">
          <strong>{{ item.name }}</strong>
          <span>${{ item.unit_price * item.qty }}</span>
        </div>

        <div class="flex gap-2 mt-2">
          <button class="btn btn-sm" @click="emit('remove', item.name)">−</button>
          <span>{{ item.qty }}</span>
          <button class="btn btn-sm" @click="emit('add', item)">+</button>
          <button class="btn btn-danger btn-sm" @click="emit('remove-all', item.name)">
            ×
          </button>
        </div>
      </div>

      <div class="font-bold text-right mt-4">
        Total: ${{ total }} MXN
      </div>
    </template>
  </div>
</template>
