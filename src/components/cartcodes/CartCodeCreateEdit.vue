<template>
  <div class="container mt-4">
    <h2>{{ mode === 'create' ? 'Crear' : 'Editar' }} Código de Carrito</h2>

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
        <label for="code">Código:</label>
        <input type="text" v-model="cartCode.code" class="form-control" id="code" required>
      </div>

      <div class="form-group mb-4">
        <label for="discount_type">Tipo de descuento:</label>
        <select v-model="cartCode.discount_type" class="form-control" id="discount_type">
          <option value="percent">Descuento porcentual</option>
          <option value="fixed">Descuento fijo</option>
        </select>
      </div>

      <div class="form-group mb-4">
        <label for="discount">Descuento:</label>
        <input type="number" v-model="cartCode.discount" class="form-control" id="discount" required>
      </div>

      <div class="form-group mb-4">
        <label for="available_uses">Usos disponibles:</label>
        <input type="number" v-model="cartCode.available_uses" class="form-control" id="available_uses" required>
      </div>

      <div class="form-group mb-4">
        <label for="expiration_date">Fecha de vencimiento:</label>
        <input type="datetime-local" v-model="cartCode.expiration_date" class="form-control" id="expiration_date">
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
      cartCodeId: null,
      cartCode: {
        code: '',
        discount_type: 'percent',
        discount: 0,
        available_uses: 1,
        expiration_date: null,
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
    // Verificar si se está editando un código de carrito existente
    const cartCodeId = this.$route.params.id;
    if (cartCodeId) {
      this.mode = 'edit';
      this.cartCodeId = cartCodeId;
      this.fetchCartCodeDetails();
    } else {
      this.loadingSpinnerEnable = false;
    }
  },
  methods: {
    async fetchCartCodeDetails() {
      try {
        const response = await axios.get(`/api/cartcodes/${this.cartCodeId}/`);
        this.cartCode = response.data;
        // Ajustar el tipo de descuento según el valor actual
        if (this.cartCode.percent_discount > 0) {
          this.cartCode.discount_type = 'percent';
          this.cartCode.discount = this.cartCode.percent_discount;
        } else {
          this.cartCode.discount_type = 'fixed';
          this.cartCode.discount = this.cartCode.fixed_discount;
        }
        if (this.cartCode.expiration_date) {
          const expirationDate = new Date(this.cartCode.expiration_date).toISOString().slice(0, 16);
          this.cartCode.expiration_date = expirationDate;
        }
      } catch (error) {
        console.error('Error al obtener los detalles del código de carrito:', error);
      } finally {
        this.loadingSpinnerEnable = false;
      }
    },

    async handleSubmit() {
      try {
        // Dependiendo del tipo de descuento seleccionado, asigna el valor correcto al campo correspondiente
        if (this.cartCode.discount_type === 'percent') {
          this.cartCode.percent_discount = this.cartCode.discount;
          this.cartCode.fixed_discount = 0; // Asegúrate de reiniciar el descuento fijo
        } else {
          this.cartCode.fixed_discount = this.cartCode.discount;
          this.cartCode.percent_discount = 0; // Asegúrate de reiniciar el descuento porcentual
        }
        if (this.mode === 'create') {
          const response = await axios.post('/api/cartcodes/', this.cartCode);
          const createdCartCodeId = response.data.id; // Obtener el ID del código de carrito creado
          this.$router.push({ path: `/cartcodes/${createdCartCodeId}`, query: { success: 'Código de carrito creado exitosamente' } });
        } else if (this.mode === 'edit') {
          await axios.put(`/api/cartcodes/${this.cartCodeId}/`, this.cartCode);
          this.$router.push({ path: `/cartcodes/${this.cartCodeId}`, query: { success: 'Código de carrito editado exitosamente' } });
        }
      } catch (error) {
        console.error('Error al guardar el código de carrito:', error.response.data);
        const errors = error.response.data;
        let errorMessage = 'Error al guardar el código de carrito.';
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
