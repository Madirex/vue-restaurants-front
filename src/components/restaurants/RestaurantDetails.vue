<template>
  <div class="container mt-4">
    <div v-if="restaurant">
      <h2 class="title">{{ restaurant.name }}</h2>

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

      <div class="reserve-button">
        <button type="button" class="btn btn-primary" @click="order">
          Realizar reserva
        </button>
      </div>

      <!-- icono reserva -->
      <h2 class="title">Menú</h2>

      <router-link v-if="isAdmin" :to="{ name: 'DishCreate', params: { restaurantId: restaurant.pk } }"
        class="btn btn-success m-2">
        <i class="fas fa-plus"></i> Crear plato
      </router-link>
      <!-- Contenedor del slider -->
      <div class="slider-container" ref="sliderContainer">
        <!-- Platos del Restaurante -->
        <div class="dishes" :style="{ transform: `translateX(${translateValue}px)` }">
          <div v-for="type in uniqueDishTypes" :key="type" class="dish-type">
            <h4 class="title mt-4">{{ getTypeTitle(type) }}</h4>
            <div v-for="dish in getDishesByType(type)" :key="dish.pk" class="dish">
              <h5 class="title-dish">{{ dish.name }}</h5>
              <p>Precio: {{ dish.price }} €</p>
              <p>Calorias: {{ dish.calories }}</p>
              <p>Tiempo de preparación: {{ dish.preparation_time }} minutos</p>
              <p>Categoría: {{ dish.category }}</p>
              <a class="dish-image m-3">
                <img v-if="dish.image" :src="imagePath + dish.image" alt="Dish Image">
              </a>
              <p>{{ dish.description }}</p>

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

          <!-- si no hay platos disponibles -->
          <div v-if="dishes.length === 0" class="alert alert-info" role="alert">
            No hay platos disponibles
          </div>
        </div>

      </div>

      <h3 class="title">Horarios</h3>
      <div class="calendar-container">
        <!-- Indicador de carga -->
        <div v-if="loadingSchedules && !waitingLoadingDelay" class="loading-overlay">
          <div class="spinner-border text-light" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <vue-cal :events="schedules" class="vuecal" @view-change="handleViewChange" @cell-click="handleCellClick">
          <template v-slot:event="{ event }">
            <div
              :style="{ backgroundColor: event.class === 'schedule-open' ? '#82bc82' : 'red', color: 'white', fontSize: 'smaller' }">
              {{
                event.title }}</div>
          </template>

          <template #events-count="{ events }">
            <span :style="{ fontWeight: 'bold' }">{{ events.length }}
            </span>
          </template>
        </vue-cal>

        <div v-if="isAdmin">
          <router-link :to="{ name: 'CalendarSeasonsConfig', params: { restaurantId: restaurant.pk } }"
            class="btn btn-info m-2">
            <i class="fas fa-calendar-alt"></i> Configurar calendario estacional
          </router-link>

          <router-link :to="{ name: 'CustomSchedulesConfig', params: { restaurantId: restaurant.pk } }"
            class="btn btn-info m-2">
            <i class="fas fa-calendar-alt"></i> Configurar horarios personalizados
          </router-link>

          <router-link :to="{ name: 'ClosedDaysConfig', params: { restaurantId: restaurant.pk } }"
            class="btn btn-warning m-2">
            <i class="fas fa-calendar-times"></i> Configurar días cerrados
          </router-link>

        </div>
      </div>

      <div>
        <RestaurantMap :restaurant="restaurant" @editSlot="editSlot" />
      </div>

      <div class="reserve-button">
        <button type="button" class="btn btn-primary" @click="order">
          Realizar reserva
        </button>
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
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import RestaurantMap from './RestaurantMap.vue';

export default {
  components: {
    ConfirmDelete,
    RestaurantMap,
    VueCal,
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
      schedules: [],
      startDate: new Date(),  // Fecha de inicio
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),  // Fecha de fin (1 mes después)
      loadingSchedules: false,
      waitingLoadingDelay: false,
    };
  },
  created() {
    this.imagePath = import.meta.env.VUE_APP_SERVER_URL || 'https://server.madirex.com:8000';
    setTimeout(() => {
      this.loadingSpinnerEnable = true;
    }, 1000);
    this.fetchRestaurantDetails();
    this.fetchRestaurantSchedules();
  },
  computed: {
    uniqueDishTypes() {
      return [...new Set(this.dishes.map(dish => dish.dish_type))];
    },
  },
  methods: {
    getDishesByType(type) {
      return this.dishes.filter(dish => dish.dish_type === type);
    },
    getTypeTitle(type) {
      switch (type) {
        case 'APPETIZER':
          return 'Aperitivos';
        case 'MAIN_COURSE':
          return 'Platos principales';
        case 'DESSERT':
          return 'Postres';
        case 'DRINK':
          return 'Bebidas';
        case 'OTHER':
          return 'Otros';
        default:
          return 'Desconocido';
      }
    },
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
    async fetchRestaurantSchedules() {
      if (!this.startDate || !this.endDate) {
        return;
      }

      this.loadingSchedules = true;
      this.waitingLoadingDelay = true;

      // esperar 1 segundo antes de poner el waitingloadingdelay como false si este es true
      setTimeout(() => {
        if (this.waitingLoadingDelay) {
          this.waitingLoadingDelay = false;
        }
      }, 1000);

      try {
        const id = this.$route.params.id;
        const response = await axios.get(`/api/restaurants/${id}/schedules/`, {
          params: {
            start_date: this.startDate.toISOString().split('T')[0],
            end_date: this.endDate.toISOString().split('T')[0],
          },
        });

        if (Array.isArray(response.data)) {
          this.schedules = response.data.flatMap(schedule => {
            return schedule.schedule.map(time => ({
              start: new Date(`${schedule.date}T${time}`),
              end: new Date(`${schedule.date}T${new Date(new Date(`${schedule.date}T${time}`).getTime() + 30 * 60000).toISOString().split('T')[1]}`), // Añadir 30 minutos a la hora de inicio
              title: time,
              class: 'schedule-open',
            }));
          });

        } else {
          console.error('response.data no es un array:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener los horarios del restaurante:', error);
      } finally {
        this.loadingSchedules = false;
        this.waitingLoadingDelay = false;
      }
    },
    handleViewChange({ startDate, endDate }) {
      this.startDate = new Date(startDate);
      this.endDate = new Date(endDate);
      this.fetchRestaurantSchedules();
    },
    showDeleteModal() {
      this.showModal = true;
    },
    order() {
      this.$router.push({ path: '/restaurants/' + this.restaurant.pk + '/order' });
    },
    showDeleteModalDish(id) {
      this.selectedDish = id;
    },
    closeDeleteModal() {
      this.showModal = false;
      this.selectedDish = null;
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
    },
  },
};
</script>

<style scoped>
.reserve-button {
  display: flex !important;
  flex-direction: column;
  margin: 40px !important;
}

.vuecal {
  background-color: #fff;
}

.address {
  font-style: italic;
  margin-bottom: 20px;
}

.dish {
  border: 1px solid #ccc;
  background-color: #dbdbdb;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
}

.dish img {
  max-width: 200px;
  margin-right: 10px;
  border-radius: 5px;
}

.dish-details {
  display: inline-block;
  vertical-align: top;
}

.dish p {
  margin: 1px;
}

/* Estilo del contenedor del slider */
.slider-container {
  overflow-x: hidden;
  text-align: center;
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.calendar-container {
  position: relative;
}
</style>
