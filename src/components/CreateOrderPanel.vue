<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'update:note'])

function submitOrder() {
  emit('submit')
}
</script>


<template>
  <div class="card p-4">
    <h3 class="text-lg font-semibold mb-4">Create Order</h3>

    <div class="order-note mb-4">
      <textarea
        :value="note"
        @input="emit('update:note', $event.target.value)"
        placeholder="Add special instructions for your order..."
        rows="2"
        class="form-input w-full"
      />
    </div>

    <button
      class="btn btn-success w-full"
      :disabled="disabled"
      @click="submitOrder"
    >
      Create Order
    </button>
  </div>
</template>

