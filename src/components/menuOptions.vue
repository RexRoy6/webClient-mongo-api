<template>
  <div v-if="open && item" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="$emit('close')">


    <div class="bg-gray-900 text-gray-100 shadow-xl w-full max-w-md rounded-xl p-5">





      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold capitalize mb-2 text-gray-100">
          {{ item.name }}
        </h3>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </div>

      <!-- OPTIONS -->
      <div class="space-y-4">
        <div v-for="(option, key) in item.options" :key="key">
          <p class="font-medium capitalize mb-2 text-gray-100">

            {{ key }}
          </p>

          <div class="grid grid-cols-2 gap-2">
            <button v-for="value in option.values" :key="value"
              class="px-3 py-2 rounded-md text-sm font-medium border transition" :class="modelValue[key] === value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'" @click="updateOption(key, value)">
              {{ value }}
            </button>
vca
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="mt-6 flex gap-3">
        <button class="btn btn-primary flex-1" :disabled="!allOptionsSelected" @click="$emit('confirm')">
          Add to Cart
        </button>

        <button class="btn btn-secondary" @click="$emit('close')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  item: Object,
  modelValue: Object // selectedOptions
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

function updateOption(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const allOptionsSelected = computed(() => {
  if (!props.item?.options) return true
  return Object.keys(props.item.options).every(
    key => props.modelValue[key]
  )
})

///handle esc key
function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})


</script>
