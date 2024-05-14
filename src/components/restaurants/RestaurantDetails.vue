<template>
  <div class="container mt-4">
    <div v-if="restaurant">
      <h2>{{ restaurant.name }}</h2>

      <!-- Dirección del Restaurante -->
      <div v-if="restaurant.address" class="address">
        <span>
          {{
            [
              restaurant.address.street,
              restaurant.address.number,
              restaurant.address.city,
              restaurant.address.province,
              restaurant.address.country,
              restaurant.address.postal_code
            ].filter(Boolean).join(', ')
          }}
        </span>
      </div>

      <h3>Platos</h3>
      <router-link :to="{ name: 'DishCreate', params: { restaurantId: restaurant.pk } }" class="btn btn-success m-2">
        <i class="fas fa-plus"></i> Crear plato
      </router-link>
      <!-- Contenedor del slider -->
      <div class="slider-container" ref="sliderContainer">
        <!-- Platos del Restaurante -->
        <div class="dishes" :style="{ transform: `translateX(${translateValue}px)` }">
          <div v-for="dish in dishes" :key="dish.pk" class="dish">
            <h3>{{ dish.name }}</h3>
            <p>{{ dish.description }}</p>
            <p>Precio: {{ dish.price }}</p>
            <p>Calorias: {{ dish.calories }}</p>
            <p>Tiempo de preparación: {{ dish.preparation_time }} minutos</p>
            <p>Categoría: {{ dish.category }}</p>
            <p>Tipo de plato:
              <span v-if="dish.dish_type === 'APPETIZER'">Aperitivo</span>
              <span v-if="dish.dish_type === 'MAIN_COURSE'">Plato principal</span>
              <span v-if="dish.dish_type === 'DESSERT'">Postre</span>
              <span v-if="dish.dish_type === 'DRINK'">Bebida</span>
              <span v-if="dish.dish_type === 'OTHER'">Otro</span>
            </p>
            <a class="dish-image">
              <img v-if="dish.image" :src="imagePath + dish.image" alt="Dish Image">
            </a>

            <!-- Panel de administrador -->
            <div v-if="isAdmin" class="admin-panel">
              <!-- Botón de eliminación -->
              <button type="button" class="btn btn-danger m-2" @click="showDeleteModalDish(dish.pk)">
                <i class="fas fa-trash-alt"></i>
              </button>
              <!-- Botón de edición -->
              <router-link :to="{ name: 'DishEdit', params: { id: dish.pk, restaurantId: restaurant.pk } }"
                class="btn btn-primary m-2">
                <i class="fas fa-edit"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>


      <!-- Panel solo si es admin -->
      <div v-if="isAdmin">
        <!-- Botón de eliminación -->
        <button type="button" class="btn btn-danger m-2" @click="showDeleteModal">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>

        <!-- Botón de editar -->
        <router-link :to="{ name: 'RestaurantEdit', params: { id: restaurant.pk } }" class="btn btn-primary m-2">
          <i class="fas fa-edit"></i> Editar
        </router-link>
      </div>

      <!-- Componentes del modal de confirmación de eliminación -->
      <ConfirmDelete v-if="showModal" :type="'restaurants'" :id="restaurant.pk" @cancel="closeDeleteModal"
        @confirm="handleDeleteConfirmation" />

      <ConfirmDelete v-if="selectedDish !== null" :type="'dishes'" :id="selectedDish" @cancel="closeDeleteModal"
        @confirm="handleDeleteConfirmationDish" />
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
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import axios from 'axios';

export default {
  components: {
    ConfirmDelete,
  },
  data() {
    return {
      restaurant: null,
      loadingSpinnerEnable: false,
      showModal: false,
      selectedDish: null,
      isAdmin: localStorage.getItem('isAdmin') === 'true',
      alert: {
        message: '',
        type: '',
      },
      imagePath: '',
    };
  },
  created() {
    this.imagePath = import.meta.env.VUE_APP_SERVER_URL || 'https://localhost:8000';
    setTimeout(() => {
      this.loadingSpinnerEnable = true;
    }, 1000);
    this.fetchRestaurantDetails();
  },
  methods: {
    async fetchRestaurantDetails() {
      try {
        const id = this.$route.params.id;
        const [restaurantResponse, menuResponse] = await Promise.all([
          axios.get(`/api/restaurants/${id}/`),
          axios.get(`/api/restaurants/${id}/menu/`),
        ]);
        this.restaurant = restaurantResponse.data;
        this.dishes = menuResponse.data;
      } catch (error) {
        this.loadingSpinnerEnable = false;
        this.$router.push({ path: '/restaurants', query: { error: 'Restaurante no encontrado' } });
        console.error('Error al obtener los detalles del restaurante:', error);
      }
    },
    showDeleteModal() {
      this.showModal = true;
    },
    showDeleteModalDish(id) {
      this.selectedDish = id;
    },
    closeDeleteModal() {
      this.showModal = false;
      this.selectedDish = null;
    },
    handleDeleteConfirmation({ type, id }) {
      const calendarId = this.restaurant.calendar;
      // eliminar calendar asociado
      axios.delete(`/api/calendars/${calendarId}/`)
        .then(response => {
          if (response.status === 204) {
            console.log(`Calendario con ID ${calendarId} eliminado exitosamente.`);
          } else {
            console.error('Error al eliminar el calendario:', response);
          }
        })
        .catch(error => {
          console.error('Error al eliminar el calendario:', error);
        });
      // eliminar restaurant
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
          this.selectedDish = null;
        });
    },
    handleDeleteConfirmationDish({ type, id }) {
      axios.delete(`/api/dishes/${id}/`)
        .then(response => {
          if (response.status === 204) {
            console.log(`Plato con ID ${id} eliminado exitosamente.`);
            // Filtrar el plato eliminado de la lista de platos
            this.dishes = this.dishes.filter(dish => dish.pk !== id);
          } else {
            console.error('Error al eliminar el plato:', response);
            // Manejar el error aquí
          }
        })
        .catch(error => {
          console.error('Error al eliminar el plato:', error);
          // Manejar el error aquí
        })
        .finally(() => {
          this.selectedDish = null;
        });
    }

  },
};
</script>

<style scoped>
.address {
  font-style: italic;
  margin-bottom: 20px;
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

/* Estilo del contenedor del slider */
.slider-container {
  overflow-x: hidden;
}

/* Estilo de los platos */
.dish {
  display: inline-grid;
  width: 300px;
  margin-right: 20px;
  margin-bottom: 20px;
  min-height: 400px;
}

.dish-image {
  display: block;
  text-align: center;
}

.admin-panel {
  bottom: 10px;
  right: 10px;
}
</style>