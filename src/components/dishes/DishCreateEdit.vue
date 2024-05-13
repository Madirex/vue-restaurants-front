<template>
  <div class="container mt-4">
    <h2>{{ mode === 'create' ? 'Crear' : 'Editar' }} Plato</h2>

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
        <input type="text" v-model="dishData.name" class="form-control" id="name" required>
      </div>

      <div class="form-group mb-4">
        <label for="description">Descripción:</label>
        <textarea v-model="dishData.description" class="form-control" id="description" rows="3" required></textarea>
      </div>

      <div class="form-group mb-4">
        <label for="price">Precio:</label>
        <input type="number" v-model="dishData.price" class="form-control" id="price" step="0.01" required>
      </div>

      <div class="form-group mb-4">
        <label for="calories">Calorías:</label>
        <input type="number" v-model="dishData.calories" class="form-control" id="calories" step="0.01" required>
      </div>

      <div class="form-group mb-4">
        <label for="preparation_time">Tiempo de preparación (minutos):</label>
        <input type="number" v-model="dishData.preparation_time" class="form-control" id="preparation_time" required>
      </div>

      <div class="form-group mb-4">
        <label for="category">Categoría:</label>
        <select v-model="dishData.category" class="form-control" id="category" required>
          <option v-for="category in categories" :value="category.name" :key="category.id">{{ category.name }}</option>
        </select>
      </div>

      <div class="form-group mb-4">
        <label for="dish_type">Tipo de plato:</label>
        <select v-model="dishData.dish_type" class="form-control" id="dish_type" required>
          <option value="APPETIZER">Aperitivo</option>
          <option value="MAIN_COURSE">Plato principal</option>
          <option value="DESSERT">Postre</option>
          <option value="DRINK">Bebida</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>

      <div class="form-group mb-4">
        <label for="image">Imagen:</label>
        <input type="file" @change="handleFileUpload" class="form-control" id="image">
        <img v-if="dishData.image" :src="dishData.image" alt="Imagen del plato" class="mt-2" style="max-width: 200px;">
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
      dishId: null,
      dishData: {
        name: '',
        description: '',
        price: '',
        calories: '',
        preparation_time: '',
        category: ''
      },
      restaurantId: null,
      categories: [],
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
    const dishId = this.$route.params.id;
    this.restaurantId = this.$route.params.restaurantId;
    if (dishId) {
      this.mode = 'edit';
      this.dishId = dishId;
      this.fetchDishDetails();
    } else {
      this.fetchCategories();
    }
  },
  methods: {
    async fetchDishDetails() {
      try {
        const response = await axios.get(`/api/dishes/${this.dishId}/`);
        this.dishData = response.data;
      } catch (error) {
        console.error('Error al obtener los detalles del plato:', error);
      }

      //fetch categories
      this.fetchCategories();
    },

    async fetchCategories() {
      try {
        const response = await axios.get(`/api/categories/`);
        const responseData = response.data;
        console.log(responseData)
        if (responseData && responseData.results && responseData.results.length > 0) {
          this.categories = responseData.results;
        } else {
          console.error('No se encontraron categorías en la respuesta.');
        }
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      } finally {
        this.loadingSpinnerEnable = false;
      }
    },

    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },

    async handleSubmit() {
      try {
        const data = this.dishData;
        const url = this.mode === 'create' ? '/api/dishes/' : `/api/dishes/${this.dishId}/`;

        const response = await axios[this.mode === 'create' ? 'post' : 'put'](url, data);

        // Manejar la respuesta según sea necesario
        if (response.status === 201 || response.status === 200) {
          const dishId = response.data.pk;

          // Solo crear el enlace si se está creando un nuevo plato
          if (this.mode === 'create') {
            const dishLinkData = { restaurant: this.restaurantId, dish: dishId, stock: 0 };

            await axios.post('/api/restaurant_dish_link/', dishLinkData);

            if (this.imageFile) {
              const formData = new FormData();
              formData.append('image', this.imageFile);
              await axios.patch(`/api/dishes/${dishId}/`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            }

            // Redirigir al restaurante con mensaje de éxito
            this.$router.push({ path: `/restaurants/${this.restaurantId}`, query: { success: 'Plato creado exitosamente' } });
          } else {
            if (this.imageFile) {
              const formData = new FormData();
              formData.append('image', this.imageFile);
              await axios.patch(`/api/dishes/${this.dishId}/`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            }

            // Redirigir al restaurante sin crear el enlace si se está editando
            this.$router.push({ path: `/restaurants/${this.restaurantId}`, query: { success: 'Plato editado exitosamente' } });
          }
        }
      } catch (error) {
        console.error('Error al guardar el plato:', error);
        const errors = error.response.data;
        let errorMessage = 'Error al guardar el plato.';
        // Manejar errores de la petición
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
    }

  }
};
</script>
