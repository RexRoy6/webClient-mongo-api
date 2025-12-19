<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

function submitOrder() {
  emit('submit')
}
</script>

<template>
  <div class="card p-4">
    <h3 class="text-lg font-semibold mb-4">Create Order</h3>

    <button
      class="btn btn-success w-full"
      :disabled="disabled"
      @click="submitOrder"
    >
      Create Order
    </button>
  </div>
</template>
