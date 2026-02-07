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
  <div class="card cart-panel w-full md:w-auto">

    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4">
      <h3 class="font-bold text-lg">
        {{ title }} ({{ cartItemCount }})
      </h3>

      <button v-if="cart.length" class="btn btn-danger btn-sm self-start sm:self-auto" @click="emit('clear')">
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
      <div v-for="item in cart" :key="item.name" class="mb-4 pb-4 border-b border-gray-700 last:border-b-0">

        <div class="flex justify-between">
          <strong>{{ item.name }}</strong>
          <span>${{ item.unit_price * item.qty }}</span>
        </div>
        

        <div v-if="item.options" class="text-xs text-gray-400">
  <div v-for="(value, key) in item.options" :key="key">
    {{ key }}: {{ value }}
  </div>
</div>



        <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <!-- Qty controls -->

          <div class="flex items-center gap-3">
            <button class="btn btn-sm px-4 py-2 text-lg font-bold" @click="emit('remove', item.name)">
              −
            </button>

            <span class="text-lg font-semibold w-6 text-center">
              {{ item.qty }}
            </span>

            <button class="btn btn-sm px-4 py-2 text-lg font-bold" @click="emit('add', item)">
              +
            </button>
          </div>


          <!-- Remove button (below) -->
          <button class="text-xs text-red-400 hover:text-red-300 underline" @click="emit('remove-all', item.name)">
            Remove
          </button>


        </div>


      </div>

      <div class="font-bold text-right mt-4 pt-3 border-t border-gray-700">
        Total: ${{ total }} MXN
      </div>

    </template>
  </div>
</template>
