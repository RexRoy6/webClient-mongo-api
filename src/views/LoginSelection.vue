<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h1>Welcome</h1>
        <p class="login-subtitle">Please choose your access type</p>
      </div>

      <!-- Selection Buttons -->
      <div class="selection-buttons">
        <button 
          @click="goClientLogin" 
          class="selection-btn client-btn"
        >
          <span class="btn-icon">👤</span>
          <span class="btn-text">Guest Login</span>
          <span class="btn-subtext">For hotel guests</span>
        </button>
        
        <button 
          @click="goKitchenLogin" 
          class="selection-btn kitchen-btn"
        >
          <span class="btn-icon">👨‍🍳</span>
          <span class="btn-text">Kitchen Login</span>
          <span class="btn-subtext">For kitchen staff</span>
        </button>
      </div>

      <!-- Optional: Add a decorative element -->
      <div class="decoration">
        <div class="decoration-dot"></div>
        <div class="decoration-dot"></div>
        <div class="decoration-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goClientLogin = () => router.push('/client/login')
const goKitchenLogin = () => router.push('/kitchen/login')
</script>