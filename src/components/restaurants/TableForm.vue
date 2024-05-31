  <template>
    <div class="modal-overlay" @click.self="close">
      <div class="table-form modal-content">
        <h3>Configurar Mesa en {{ slot.x }}, {{ slot.y }}</h3>
        <form @submit.prevent="saveTable">
          <div>
            <label for="maxChairs">Sillas:</label>
            <input type="number" id="maxChairs" v-model.number="maxChairs" min="1" max="20" required />
          </div>
          <div class="positions">
            <div>
              <label for="x">Posición X:</label>
              <input type="number" id="x" v-model.number="positionX" @input="validatePositionX" required />
            </div>
            <div>
              <label for="y">Posición Y:</label>
              <input type="number" id="y" v-model.number="positionY" @input="validatePositionY" required />
            </div>
          </div>
          <div v-if="loading">
            <div class="loading-indicator">
              <div class="spinner-border orange-spinner" role="status">
                <span>🍕</span>
              </div>
            </div>
          </div>
          <div v-else>
            <button type="submit">Guardar</button>
            <button type="button" @click="deleteTable" v-if="slot.isTable">Eliminar</button>
            <button type="button" @click="close">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </template>

<script>
import axios from 'axios';

export default {
  props: ['slot', 'pk', 'chairs'],
  data() {
    return {
      maxChairs: this.chairs ? this.chairs : 1,
      positionX: this.slot.x,
      positionY: this.slot.y,
      loading: false,
    };
  },
  methods: {
    async saveTable() {
      const restaurantId = this.$route.params.id;
      try {
        this.loading = true;
        // Verificar si se está editando una mesa existente
        if (this.pk) {
          // Si se está editando, realizar una solicitud PUT
          await axios.put(`/api/tables/${this.pk}/`, {
            x_position: this.positionX,
            y_position: this.positionY,
            max_chairs: this.maxChairs,
            min_chairs: this.maxChairs,
          });
        } else {
          // Si no se está editando, realizar una solicitud POST
          await axios.post('/api/tables/', {
            assigned_restaurant: restaurantId,
            x_position: this.positionX,
            y_position: this.positionY,
            max_chairs: this.maxChairs,
            min_chairs: this.maxChairs,
          });
        }
        this.$emit('close');
        this.$emit('refresh');
      } catch (error) {
        console.error('Error saving table:', error);
      }
      this.loading = false;
    },

    async deleteTable() {
      try {
        this.loading = true;
        await axios.delete(`/api/tables/${this.slot.pk}/`);
        this.$emit('close');
        this.$emit('refresh');
      } catch (error) {
        console.error('Error deleting table:', error);
      }
      this.loading = false;
    },
    close() {
      this.$emit('close');
    },
    validatePositionX() {
      if (this.positionX < 1) {
        this.positionX = 1;
      }
    },
    validatePositionY() {
      if (this.positionY < 1) {
        this.positionY = 1;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  max-width: 400px;
  width: 100%;
}

.modal-content button {
  margin-top: 10px;
}

.positions {
  display: none;
}
</style>
