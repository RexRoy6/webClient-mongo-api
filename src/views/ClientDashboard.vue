<template>
  <div class="dashboard">
    <h1>Client Dashboard</h1>

    <div class="box">
      <h3>Logged in as:</h3>
      <p><strong>Name:</strong> {{ auth.guest?.guest_name }}</p>
      <p><strong>Room Number:</strong> {{ auth.guest?.room_number }}</p>
      <p><strong>UUID:</strong> {{ auth.guest?.guest_uuid }}</p>
    </div>

    <div class="box">
      <h3>Token Info:</h3>
      <p><strong>Token:</strong> {{ auth.token }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.box {
  background: #f4f4f4;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 6px;
}
</style>
