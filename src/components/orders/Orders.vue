<template>
    <div class="container mt-4">
      <h2>Pedidos</h2>
  
      <div v-if="loading && loadingSpinnerEnable" class="loading-indicator">
        <div class="spinner-border orange-spinner" role="status">
          <span>🍕</span>
        </div>
      </div>
  
      <div v-else>
        <div v-for="order in orders" :key="order.pk" class="mb-4 order-item" @click="redirectToOrder(order.pk)">
          <div>
            <strong>Restaurante:</strong> {{ order.restaurant_name }}
          </div>
          <div>
            <strong>Total:</strong> ${{ order.total }}
          </div>
          <div>
            <strong>Estado:</strong> <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
          </div>
          <hr>
        </div>
        <div v-if="orders.length === 0">
          No hay pedidos disponibles.
        </div>
  
        <!-- Paginación -->
        <nav aria-label="Page navigation" v-if="totalPages > 1">
          <ul class="pagination">
            <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
              <a class="page-link" href="#" aria-label="Previous" @click.prevent="prevPage">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li v-for="pageNumber in totalPages" :key="pageNumber" class="page-item" :class="{ 'active': pageNumber === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(pageNumber)">{{ pageNumber }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
              <a class="page-link" href="#" aria-label="Next" @click.prevent="nextPage">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        orders: [],
        loading: true,
        loadingSpinnerEnable: false,
        currentPage: 1,
        totalPages: 0,
        cache: {}
      };
    },
    mounted() {
      this.fetchOrders();
    },
    methods: {
      async fetchOrders(page = 1) {
        try {
          if (this.cache[page]) {
            this.orders = this.cache[page];
          } else {
            this.loadingSpinnerEnable = false;
            setTimeout(() => {
              this.loadingSpinnerEnable = true;
            }, 1000);
            this.loading = true;
            const response = await axios.get(`/api/users/orders/?limit=10&offset=${(page - 1) * 10}`);
            this.orders = response.data.results;
            this.cache[page] = response.data.results;
            this.totalPages = Math.ceil(response.data.count / 10);
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            this.$router.push('/401');
          } else {
            console.error('Error fetching orders:', error);
          }
        } finally {
          this.loading = false;
        }
      },
      redirectToOrder(orderId) {
        this.$router.push(`/orders/${orderId}`);
      },
      changePage(pageNumber) {
        if (pageNumber !== this.currentPage) {
          this.currentPage = pageNumber;
          this.fetchOrders(pageNumber);
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.fetchOrders(this.currentPage + 1);
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.fetchOrders(this.currentPage - 1);
        }
      },
      getStatusText(status) {
        switch (status) {
          case 'pending':
            return 'Pendiente';
          case 'confirmed':
            return 'Confirmado';
          case 'cancelled':
            return 'Cancelado';
          case 'completed':
            return 'Completado';
          default:
            return 'Desconocido';
        }
      },
      getStatusClass(status) {
        switch (status) {
          case 'pending':
            return 'text-warning';
          case 'confirmed':
            return 'text-success';
          case 'cancelled':
            return 'text-danger';
          case 'completed':
            return 'text-primary';
          default:
            return '';
        }
      },
    }
  };
  </script>
  
  <style>
  .pagination {
    display: flex;
    justify-content: center;
  }
  
  .page-item {
    cursor: pointer;
  }
  
  .page-link {
    color: #007bff;
  }
  
  .page-link:hover {
    text-decoration: none;
  }
  
  .page-item.disabled .page-link {
    color: #6c757d;
  }
  
  .order-item {
    cursor: pointer;
  }
  </style>
  