<template>
  <div class="container mt-4">
    <div v-if="cartCode">
      <h2>{{ cartCode.code }}</h2>

      <!-- Estado del código de carrito -->
      <div>
        <span v-if="cartCode.is_active && new Date() < new Date(cartCode.expiration_date)">Activo</span>
        <span v-else>Inactivo</span>
      </div>

      <!-- Descuento del código de carrito -->
      <div v-if="cartCode.percent_discount > 0">
        <span>Descuento porcentual: {{ cartCode.percent_discount }}%</span>
      </div>

      <div v-else>
        <span>Descuento fijo: ${{ cartCode.fixed_discount }}</span>
      </div>

      <!-- Usos disponibles del código de carrito -->
      <div>
        <span>Usos disponibles: {{ cartCode.available_uses }}</span>
      </div>

      <!-- Fecha de vencimiento del código de carrito -->
      <div v-if="cartCode.expiration_date">
        <span>Fecha de vencimiento: {{ cartCode.expiration_date }}</span>
      </div>

      <!-- Panel solo si es admin -->
      <div v-if="isAdmin">
        <!-- Botón de eliminación -->
        <button type="button" class="btn btn-danger m-2" @click="showDeleteModal">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>

        <!-- Botón de editar -->
        <button type="button" class="btn btn-primary m-2" @click="editCartCode">
          <i class="fas fa-edit"></i> Editar
        </button>
      </div>

      <!-- Componente del modal de confirmación de eliminación -->
      <ConfirmDelete v-if="showModal" :type="'cartcodes'" :id="cartCode.id" @cancel="closeDeleteModal"
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
  data() {
    return {
      cartCode: null,
      loadingSpinnerEnable: false,
      showModal: false,
      isAdmin: localStorage.getItem('isAdmin') === 'true',
      alert: {
        message: '',
        type: '',
      },
    };
  },
  components: {
    ConfirmDelete,
  },
  created() {
    setTimeout(() => {
      this.loadingSpinnerEnable = true;
    }, 1000);
    this.fetchCartCodeDetails();
  },
  methods: {
    async fetchCartCodeDetails() {
      try {
        const id = this.$route.params.id;
        const res = await axios.get(`/api/cartcodes/${id}/`);
        this.cartCode = res.data;
      } catch (error) {
        this.loadingSpinnerEnable = false;
        this.$router.push({ path: '/cartcodes', query: { error: 'Código de carrito no encontrado' } });
        console.error('Error al obtener los detalles del código de carrito:', error);
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
            console.log(`Código de carrito con ID ${id} eliminado exitosamente.`);
            this.$router.push({ path: '/cartcodes', query: { success: 'Código de carrito eliminado' } });
          } else {
            console.error('Error al eliminar el código de carrito:', response);
            this.$router.push({ path: '/cartcodes', query: { error: 'Error al intentar eliminar el código de carrito' } });
          }
        })
        .catch(error => {
          console.error('Error al eliminar el código de carrito:', error);
          this.$router.push({ path: '/cartcodes', query: { error: 'Error al intentar eliminar el código de carrito' } });
        })
        .finally(() => {
          this.showModal = false;
        });
    },
    editCartCode() {
      this.$router.push(`/cartcodes/${this.cartCode.id}/edit`);
    },
  },
};
</script>

<style scoped>
.address {
  font-style: italic;
}
</style>
