<template>
  <div class="footer">
    <Divider />
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <h4>WFC Algorithm Showcase</h4>
        <p>Exploring the possibilities of Wave Function Collapse</p>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <h4>Quick Links</h4>
        <ul class="list-none p-0 m-0">
          <li><a href="/">Home</a></li>
          <li><a href="/algorithm">Algorithm</a></li>
          <li><a href="/examples">Examples</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <h4>Resources</h4>
        <ul class="list-none p-0 m-0">
          <li><a href="#">Documentation</a></li>
          <li><a href="#">GitHub Repository</a></li>
          <li><a href="#">Research Paper</a></li>
        </ul>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <h4>Contact</h4>
        <ul class="list-none p-0 m-0">
          <li><i class="pi pi-envelope mr-2"></i>contact@wfcshowcase.com</li>
          <li><i class="pi pi-twitter mr-2"></i>@WFCShowcase</li>
          <li><i class="pi pi-github mr-2"></i>WFCShowcase</li>
        </ul>
      </div>
    </div>
    <div class="text-center mt-4">
      © 2024 WFC Algorithm Showcase. All rights reserved.
    </div>
  </div>
</template>

<script setup>
import Divider from 'primevue/divider';
</script>

<style scoped>
.footer {
  background-color: var(--surface-ground);
  color: var(--text-color);
  padding: 2rem;
}

.footer h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.footer ul li {
  margin-bottom: 0.5rem;
}

.footer a {
  color: var(--text-color);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>