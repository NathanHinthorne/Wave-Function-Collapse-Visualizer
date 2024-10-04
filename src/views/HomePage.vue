<template>
  <div>
    <Button label="Home" />
    <Menubar :model="items" />

    <div class="p-grid p-m-3">
      <div class="p-col-12 p-md-6">
        <Card title="Welcome to My Home Page" subTitle="Using PrimeVue Components">
          <p>This is a simple home page using PrimeVue components.</p>
          <Button label="Learn More" icon="pi pi-info-circle" />
        </Card>
      </div>

      <div class="p-col-12 p-md-6">
        <Card title="Data Table Example">
          <DataTable :value="products">
            <Column field="name" header="Name"></Column>
            <Column field="price" header="Price"></Column>
          </DataTable>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

console.log("button", Button);

export default {
  components: {
    Menubar,
    Button,
    Card,
    DataTable,
    Column
  },
  data() {
    return {
      items: [
        {
          label: 'Home',
          icon: 'pi pi-fw pi-home',
          command: () => { window.location = '#'; }
        },
        {
          label: 'About',
          icon: 'pi pi-fw pi-info',
          command: () => { window.location = '#'; }
        }
      ],
      products: [
        { name: 'Product 1', price: '$10' },
        { name: 'Product 2', price: '$20' }
      ]
    };
  }
};
</script>

<style>
.p-grid {
  margin-top: 20px;
}
</style>