<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    default: ''
  },
  name_client: {
    type: String,
    default: ''
  },
  payment_method: {
    type: String,
    default: 'cash'
  }
})

const emit = defineEmits(['submit',  'cancel', 'update:note', 'update:name_client', 'update:payment_method'])

function submitOrder() {
  emit('submit')
}
</script>


<template>
  <div class="card p-4">
    <h3 class="text-lg font-semibold mb-4">Create Order</h3>

    <div class="order-note mb-4">
      <textarea :value="name_client" @input="emit('update:name_client', $event.target.value)"
        placeholder="Add customer name" rows="1" class="form-input w-full" />
    </div>


    <div class="order-note mb-4">
      <textarea :value="note" @input="emit('update:note', $event.target.value)"
        placeholder="Add special instructions for your order..." rows="2" class="form-input w-full" />
    </div>
<div class="order-note mb-4">
  <label class="block text-sm font-semibold mb-2">
    Payment Method
  </label>

  <div class="grid grid-cols-3 gap-2">
    <button
      type="button"
      class="btn-order"
      :class="payment_method === 'cash'
        ? 'btn-success'
        : 'btn-secondary'"
      @click="emit('update:payment_method', 'cash')"
    >
      💵 Cash
    </button>

    <button
      type="button"
      class="btn-order"
      :class="payment_method === 'card'
        ? 'btn-success'
        : 'btn-secondary'"
      @click="emit('update:payment_method', 'card')"
    >
      💳 Card
    </button>

    <button
      type="button"
      class="btn-order"
      :class="payment_method === 'transfer'
        ? 'btn-success'
        : 'btn-secondary'"
      @click="emit('update:payment_method', 'transfer')"
    >
      🏦 Transfer
    </button>
  </div>
</div>


    <button class="btn btn-success w-full" :disabled="disabled" @click="submitOrder">
      Create Order
    </button>
    <button
  class="btn btn-secondary w-full mt-2"
  @click="$emit('cancel')"
>
  ← Back to Cart
</button>

  </div>
  
</template>
