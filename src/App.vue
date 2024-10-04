<template>
  <div class="app-container">
    <Header />
    <main class="flex-grow-1">
      <router-view></router-view>
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>