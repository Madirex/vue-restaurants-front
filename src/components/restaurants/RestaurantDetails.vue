<template>
    <div class="container mt-4">
      <div v-if="restaurant">
        <h2>{{ restaurant.name }}</h2>
  
        <!-- Dirección del Restaurante -->
        <div v-if="restaurant.address" class="address">
          <span v-if="restaurant.address.street">{{ restaurant.address.street }}, </span>
          <span v-if="restaurant.address.number">{{ restaurant.address.number }}, </span>
          <span v-if="restaurant.address.city">{{ restaurant.address.city }}, </span>
          <span v-if="restaurant.address.province">{{ restaurant.address.province }}, </span>
          <span v-if="restaurant.address.country">{{ restaurant.address.country }}, </span>
          <span v-if="restaurant.address.postal_code">{{ restaurant.address.postal_code }}</span>
        </div>
  
        <!-- Platos del Restaurante -->
       <!-- <div v-if="restaurant.dishes.length > 0">
          <h3>Platos</h3>
          <div v-for="dish in restaurant.dishes" :key="dish.id" class="dish">
            <img v-if="dish.image" :src="dish.image" alt="Dish Image">
            <div class="dish-details">
              <h4>{{ dish.name }}</h4>
              <p>{{ dish.description }}</p>
              <p>Price: ${{ dish.price }}</p>
            </div>
          </div>
        </div>-->
  
        <!-- Panel solo si es admin -->
        <div v-if="isAdmin">
          <!-- Botón de eliminación -->
          <button type="button" class="btn btn-danger m-2" @click="showDeleteModal">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
  
          <!-- Botón de editar -->
          <router-link :to="{ name: 'RestaurantEdit', params: { id: restaurant.id } }" class="btn btn-primary m-2">
            <i class="fas fa-edit"></i> Editar
          </router-link>
        </div>
  
        <!-- Componente del modal de confirmación de eliminación -->
        <ConfirmDelete v-if="showModal" :type="'restaurants'" :id="restaurant.id" @cancel="closeDeleteModal"
          @confirm="handleDeleteConfirmation" />
      </div>
      <div v-else>
        <div v-if="loadingSpinnerEnable" class="loading-indicator">
          <div class="spinner-border orange-spinner" role="status">
            <span>🍕</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import ConfirmDelete from '@/components/ConfirmDelete.vue';
  
  export default {
    components: {
      ConfirmDelete,
    },
    data() {
      return {
        restaurant: null,
        loadingSpinnerEnable: false,
        showModal: false,
        isAdmin: localStorage.getItem('isAdmin') === 'true',
        alert: {
          message: '',
          type: '',
        },
      };
    },
    created() {
      setTimeout(() => {
        this.loadingSpinnerEnable = true;
      }, 1000);
      this.fetchRestaurantDetails();
    },
    methods: {
      async fetchRestaurantDetails() {
        try {
          const id = this.$route.params.id;
          const res = await axios.get(`/api/restaurants/${id}/`);
          this.restaurant = res.data;
        } catch (error) {
          this.loadingSpinnerEnable = false;
          this.$router.push({ path: '/restaurants', query: { error: 'Restaurante no encontrado' } });
          console.error('Error al obtener los detalles del restaurante:', error);
        }
      },
      showDeleteModal() {
        this.showModal = true;
      },
      closeDeleteModal() {
        this.showModal = false;
      },
      handleDeleteConfirmation({ type, id }) {
        axios.delete(`/api/${type}/${id}/`)
          .then(response => {
            if (response.status === 204) {
              console.log(`Restaurante con ID ${id} eliminado exitosamente.`);
              this.$router.push({ path: '/restaurants', query: { success: 'Restaurante eliminado' } });
            } else {
              console.error('Error al eliminar el restaurante:', response);
              this.$router.push({ path: '/restaurants', query: { error: 'Error al intentar eliminar el restaurante' } });
            }
          })
          .catch(error => {
            console.error('Error al eliminar el restaurante:', error);
            this.$router.push({ path: '/restaurants', query: { error: 'Error al intentar eliminar el restaurante' } });
          })
          .finally(() => {
            this.showModal = false;
          });
      },
    },
  };
  </script>
  
  <style scoped>
  .address {
    font-style: italic;
  }
  
  .dish {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
  }
  
  .dish img {
    max-width: 100px;
    margin-right: 10px;
    border-radius: 5px;
  }
  
  .dish-details {
    display: inline-block;
    vertical-align: top;
  }
  </style>
  