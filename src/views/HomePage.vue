<template>
  <div class="layout-wrapper">
    <header class="layout-topbar">
      <div class="layout-topbar-logo">
        <img src="/path-to-your-logo.png" alt="Logo" height="40" class="mr-2" />
        <span>WFC Algorithm Showcase</span>
      </div>
      <Button icon="pi pi-bars" @click="toggleMenu" class="p-button-rounded p-button-text p-button-plain layout-menu-button"/>
      <Menu ref="menu" :model="menuItems" />
    </header>

    <div class="layout-sidebar" :class="{ 'active': menuActive }">
      <PanelMenu :model="menuItems" class="w-full md:w-25rem" />
    </div>

    <div class="layout-main-container">
      <div class="layout-main">
        <h1>Welcome to WFC Algorithm Showcase</h1>
        <!-- Add your home page content here -->
      </div>
    </div>

    <footer class="layout-footer">
      <span class="font-bold mr-2">WFC Algorithm Showcase</span>
      <span>All rights reserved</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import PanelMenu from 'primevue/panelmenu';

const router = useRouter();
const menuActive = ref(false);
const menu = ref();

const toggleMenu = () => {
  menuActive.value = !menuActive.value;
};

const menuItems = [
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Algorithm',
    icon: 'pi pi-fw pi-cog',
    command: () => router.push('/algorithm')
  },
  {
    label: 'Examples',
    icon: 'pi pi-fw pi-images',
    command: () => router.push('/examples')
  },
  {
    label: 'About',
    icon: 'pi pi-fw pi-info-circle',
    command: () => router.push('/about')
  }
];
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-topbar {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--surface-card);
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2);
}

.layout-topbar-logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 500;
}

.layout-sidebar {
  width: 250px;
  background-color: var(--surface-overlay);
  transition: transform 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  padding-top: 4rem;
  transform: translateX(-100%);

  &.active {
    transform: translateX(0);
  }
}

.layout-main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  padding-left: 250px;
  transition: padding-left 0.3s;
}

.layout-main {
  flex-grow: 1;
  padding: 2rem;
}

.layout-footer {
  background-color: var(--surface-card);
  padding: 1rem;
  text-align: center;
}

@media screen and (max-width: 960px) {
  .layout-sidebar {
    transform: translateX(-100%);
    z-index: 999;
  }

  .layout-main-container {
    padding-left: 0;
  }
}
</style>