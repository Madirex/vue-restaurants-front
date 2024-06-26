<template>
  <div class="container mt-4">
    <h2 class="title">{{ mode === 'create' ? 'Crear' : 'Editar' }} Restaurante</h2>

    <div class="alert" :class="[alert.type, { 'd-none': !alert.message }]">
      {{ alert.message }}
    </div>

    <div v-if="loadingSpinnerEnable" class="loading-indicator">
      <div v-if="startTimeEnableSpinner" class="spinner-border orange-spinner" role="status">
        <span>🍕</span>
      </div>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div class="form-group mb-4">
        <label for="name">Nombre:</label>
        <input type="text" v-model="restaurantName" class="form-control" id="name" required>
      </div>

      <h3>Dirección</h3>
      <div class="form-group mb-4">
        <label for="street">Calle:</label>
        <input type="text" v-model="restaurantAddress.street" class="form-control" id="street" placeholder="Calle"
          required>
      </div>
      <div class="form-group mb-4">
        <label for="number">Número:</label>
        <input type="text" v-model="restaurantAddress.number" class="form-control" id="number" placeholder="Número">
      </div>
      <div class="form-group mb-4">
        <label for="city">Ciudad:</label>
        <input type="text" v-model="restaurantAddress.city" class="form-control" id="city" placeholder="Ciudad">
      </div>
      <div class="form-group mb-4">
        <label for="province">Provincia:</label>
        <input type="text" v-model="restaurantAddress.province" class="form-control" id="province"
          placeholder="Provincia">
      </div>
      <div class="form-group mb-4">
        <label for="country">País:</label>
        <input type="text" v-model="restaurantAddress.country" class="form-control" id="country" placeholder="País">
      </div>
      <div class="form-group mb-4">
        <label for="postal_code">Código Postal:</label>
        <input type="text" v-model="restaurantAddress.postal_code" class="form-control" id="postal_code"
          placeholder="Código Postal">
      </div>
      <button type="submit" class="btn btn-primary">{{ mode === 'create' ? 'Crear' : 'Guardar' }}</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      mode: 'create',
      restaurantId: null,
      restaurantName: '',
      restaurantAddress: {
        street: '',
        number: '',
        city: '',
        province: '',
        country: '',
        postal_code: '',
      },
      alert: {
        message: '',
        type: '',
      },
      loadingSpinnerEnable: true,
      startTimeEnableSpinner: false,
    };
  },
  created() {
    //timeout
    setTimeout(() => {
      this.startTimeEnableSpinner = true;
    }, 1000);
    // Verificar si se está editando un restaurante existente
    const restaurantId = this.$route.params.id;
    if (restaurantId) {
      this.mode = 'edit';
      this.restaurantId = restaurantId;
      this.fetchRestaurantDetails();
    } else {
      this.loadingSpinnerEnable = false;
    }
  },
  methods: {
    async fetchRestaurantDetails() {
      try {
        const response = await axios.get(`/api/restaurants/${this.restaurantId}/`);
        this.restaurantName = response.data.name;
        this.restaurantAddress = response.data.address;
      } catch (error) {
        console.error('Error al obtener los detalles del restaurante:', error);
      } finally {
        this.loadingSpinnerEnable = false;
      }
    },
    async handleSubmit() {
      let createdCalendar = false;
      try {
        const data = {
          name: this.restaurantName,
          address: this.restaurantAddress,
        };

        // dar error si el código postal no es un código de postal español válido
        if (!/^\d{5}$/.test(data.address.postal_code)) {
          this.alert.message = 'El código postal debe ser un código postal español válido.';
          this.alert.type = 'alert-danger';
          return;
        }

        if (this.mode === 'create') {
          // Crear calendar
          const calendarData = {
            normal_start_date: `2000-03-01`,
            summer_start_date: `2000-06-01`,
            winter_start_date: `2000-12-01`,
          };
          const calendarResponse = await axios.post('/api/calendars/', calendarData);
          const createdCalendarId = calendarResponse.data.pk;
          data.calendar = createdCalendarId;
          createdCalendar = true;

          const response = await axios.post('/api/restaurants/', data);
          const createdRestaurantId = response.data.pk; // Obtener el ID del restaurante creado
          this.$router.push({ path: `/restaurants/${createdRestaurantId}`, query: { success: 'Restaurante creado exitosamente' } });
        } else if (this.mode === 'edit') {
          await axios.put(`/api/restaurants/${this.restaurantId}/`, data);
          this.$router.push({ path: `/restaurants/${this.restaurantId}`, query: { success: 'Restaurante editado exitosamente' } });
        }
      } catch (error) {
        if (createdCalendar){
          // Eliminar calendar creado
          axios.delete(`/api/calendars/${this.restaurantId}/`)
            .then(response => {
              if (response.status === 204) {
                console.log(`Calendario con ID ${this.restaurantId} eliminado exitosamente.`);
              } else {
                console.error('Error al eliminar el calendario:', response);
              }
            })
            .catch(error => {
              console.error('Error al eliminar el calendario:', error);
            });
        }

        console.error('Error al guardar el restaurante:', error.response.data);
        const errors = error.response.data;
        let errorMessage = 'Error al guardar el restaurante.';
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            errors[key].forEach((errorMsg) => {
              errorMessage += `\n${key}: ${errorMsg}`;
            });
          } else {
            errorMessage += `\n${key}: ${errors[key]}`;
          }
        }
        this.alert.message = errorMessage;
        this.alert.type = 'alert-danger';
      }
    },

  },
};
</script>