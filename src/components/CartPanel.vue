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
  <div v-if="cart.length" class="card">
    <div class="flex justify-between mb-4">
      <h3 class="font-bold">Cart ({{ cartItemCount }})</h3>
      <button class="btn btn-danger btn-sm" @click="emit('clear')">
        Clear
      </button>
    </div>

    <div v-for="item in cart" :key="item.name" class="mb-3">
      <div class="flex justify-between">
        <strong>{{ item.name }}</strong>
        <span>${{ item.unit_price * item.qty }}</span>
      </div>

      <div class="flex gap-2 mt-2">
        <button class="btn btn-sm" @click="emit('remove', item.name)">−</button>
        <span>{{ item.qty }}</span>
        <button class="btn btn-sm" @click="emit('add', item)">+</button>
        <button class="btn btn-danger btn-sm" @click="emit('remove-all', item.name)">×</button>
      </div>
    </div>

    <div class="font-bold text-right mt-4">
      Total: ${{ total }} MXN
    </div>
  </div>
</template>
