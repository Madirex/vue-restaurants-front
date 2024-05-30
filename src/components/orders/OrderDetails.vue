<template>
    <div class="order-details" v-if="order" ref="orderDetails">
      <h2>Detalles del Pedido</h2>
      <div class="order-info">
        <div><strong>Restaurante:</strong> {{ order.restaurant_name }}</div>
        <div><strong>Usuario:</strong> {{ order.user_name }}</div>
        <div><strong>Estado:</strong> <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span></div>
      </div>
      <ul class="order-lines">
        <li v-for="orderLine in order.order_lines" :key="orderLine.id">
          {{ orderLine.quantity }} x {{ orderLine.dish_name }} - {{ orderLine.total }}
        </li>
      </ul>
      <button v-if="order.status === 'pending'" @click="showCancelConfirmationDialog" :disabled="pushingCancel" class="btn btn-danger btn-cancel m-2">
        Cancelar pedido
        <span v-if="pushingCancel" class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </span>
      </button>
      <button @click="printOrder" class="btn btn-primary btn-print m-2">
        Imprimir en PDF
      </button>
      <ConfirmCancel v-if="showCancelDialog" @confirm="cancelOrder" @cancel="hideCancelConfirmationDialog" />
    </div>
    <div v-else>
      <p>Cargando detalles del pedido...</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import html2pdf from 'html2pdf.js';
  import ConfirmCancel from '@/components/ConfirmCancel.vue';
  
  export default {
    props: {
      orderId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        order: null,
        pushingCancel: false,
        showCancelDialog: false
      };
    },
    async mounted() {
      try {
        const response = await axios.get(`/api/users/get_order/?order_id=${this.orderId}`);
        this.order = response.data;
      } catch (error) {
        console.error('Error fetching order details:', error);
        if (error.response && error.response.status == 404) {
          this.$router.push('/404');
        } else if (error.response && error.response.status == 401) {
          this.$router.push('/401');
        }
      }
    },
    methods: {
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
            return 'pending';
          case 'confirmed':
            return 'confirmed';
          case 'cancelled':
            return 'cancelled';
          case 'completed':
            return 'completed';
          default:
            return '';
        }
      },
      showCancelConfirmationDialog() {
        this.showCancelDialog = true;
      },
      hideCancelConfirmationDialog() {
        this.showCancelDialog = false;
      },
      async cancelOrder() {
        this.pushingCancel = true;
        try {
          await axios.post(`/api/users/cancel_order/${this.order.pk}/`);
          this.order.status = 'cancelled';
        } catch (error) {
          console.error('Error cancelling order:', error);
          alert('Error al cancelar el pedido. Por favor, inténtalo de nuevo más tarde.');
        } finally {
          this.pushingCancel = false;
          this.hideCancelConfirmationDialog();
        }
      },
      async printOrder() {
        const element = this.$refs.orderDetails;
        const opt = {
          margin: 1,
          filename: `Pedido_${this.order.pk}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        const buttons = element.querySelectorAll('.btn-print, .btn-cancel');
        buttons.forEach(button => button.style.display = 'none');
        await html2pdf().from(element).set(opt).save();
        buttons.forEach(button => button.style.display = '');
      }
    },
    components: {
      ConfirmCancel
    }
  };
  </script>
  
  <style scoped>
  .order-details {
    text-align: center;
  }
  
  .order-info {
    margin-bottom: 20px;
  }
  
  .order-info div {
    margin-bottom: 10px;
  }
  
  .order-info span {
    font-weight: bold;
  }
  
  .order-lines {
    list-style-type: none;
    padding: 0;
  }
  
  .order-lines li {
    margin-bottom: 10px;
  }
  
  .pending {
    color: orange;
  }
  
  .confirmed {
    color: green;
  }
  
  .cancelled {
    color: red;
  }
  
  .completed {
    color: blue;
  }
  
  .btn-cancel {
    margin-top: 20px;
  }
  
  .btn-print {
    margin-top: 20px;
  }
  </style>
  