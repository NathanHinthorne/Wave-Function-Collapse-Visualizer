<template>
  <Menubar :model="items" class="header">
    <template #start>
      <img alt="logo" src="../assets/favicon.ico" height="40" class="mr-2" />
      <span class="font-bold text-2xl">WFC Algorithm Visualizer</span>
    </template>
    <template #end>
      <InputText placeholder="Search" type="text" />
    </template>
  </Menubar>
</template>

<script setup>
import { ref } from 'vue';
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    to: '/'
  },
  {
    label: 'Algorithm',
    icon: 'pi pi-fw pi-cog',
    to: '/algorithm'
  },
  {
    label: 'Examples',
    icon: 'pi pi-fw pi-images',
    to: '/examples'
  },
  {
    label: 'About',
    icon: 'pi pi-fw pi-info-circle',
    to: '/about'
  }
]);
</script>

<style scoped>
.header {
  padding: 0.5rem 1rem;
}
</style>