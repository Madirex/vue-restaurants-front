<template>
  <div class="map-container">
    <h2>Plano del Restaurante</h2>
    <div v-if="isAdmin" class="controls">
      <label for="size">Tamaño del Plano:</label>
      <input type="number" v-model="size" :min="minSize" max="20" @input="validateSize($event)" />
      <p><i>El tamaño máximo permitido es 20.</i></p>
    </div>
    <div v-if="tablesLoaded">
      <div class="grid" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
        <div v-for="slot in slots" :key="slot.id" class="grid-slot"
          :class="{ occupied: slot.occupied, 'admin-cursor': isAdmin }" draggable="true" @dragstart="dragStart(slot)"
          @dragover.prevent @drop="drop(slot)">
          <img src="/table.png" v-if="slot.occupied" class="table-icon" alt="Mesa" />
          <div v-if="slot.occupied && isAdmin" class="edit-button" @click.stop="editSlot(slot)">
          </div>
          <div v-if="!slot.occupied && isAdmin" class="add-button" @click.stop="editSlot(slot)">
            <i class="fas fa-plus add-icon"></i>
          </div>
          <div v-if="slot.chairs > 0" class="chair-info">
            <img src="/chair.png" alt="Sillas" class="chair-icon" />
            <span class="chair-num">{{ slot.chairs }}</span>
          </div>
        </div>
      </div>
      <TableForm v-if="selectedSlot" :slot="selectedSlot" :pk="selectedSlot.pk" :chairs="selectedSlot.chairs"
        @close="closeTableForm" @refresh="generateGrid" />
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
import TableForm from './TableForm.vue';

export default {
  components: {
    TableForm,
  },
  data() {
    return {
      size: 10,
      oldSize: 10,
      slots: [],
      selectedSlot: null,
      restaurantTables: [],
      tablesLoaded: false,
      loadingSpinnerEnable: true,
      draggedSlot: null,
      isAdmin: localStorage.getItem('isAdmin') === 'true',
    };
  },
  created() {
    this.generateGrid();
  },
  computed: {
    minSize() {
      if (this.restaurantTables.length === 0) {
        return 1; // Si no hay mesas, el tamaño mínimo es 1
      }
      const maxX = Math.max(...this.restaurantTables.map(table => table.x_position));
      const maxY = Math.max(...this.restaurantTables.map(table => table.y_position));
      return Math.max(maxX, maxY);
    },
  },
  methods: {
    editSlot(slot) {
      this.selectedSlot = slot;
    },
    validateSize(event) {
      const value = event.target.value;
      if (value > 20) {
        this.size = this.oldSize;
      } else if (value < this.minSize) {
        this.size = this.oldSize;
      } else {
        this.size = value;
        this.oldSize = value;
      }
      this.generateGrid();
    },
    generateGrid() {
      this.slots = [];
      for (let x = 1; x <= this.size; x++) {
        for (let y = 1; y <= this.size; y++) {
          this.slots.push({ id: `${x}-${y}`, x, y, occupied: false, chairs: 0 });
        }
      }
      this.fetchTables();
    },
    async fetchTables() {
      const restaurantId = this.$route.params.id;
      try {
        this.tablesLoaded = false;
        setTimeout(() => {
          this.loadingSpinnerEnable = true;
        }, 1000);
        const response = await axios.get(`/api/restaurants/${restaurantId}/`);
        this.restaurantTables = response.data.tables;
        const minSize = this.minSize;
        if (minSize !== 1 && this.size < minSize) {
          this.size = minSize;
          this.oldSize = minSize;
          this.generateGrid(); // refresh
        }
        this.restaurantTables.forEach(table => {
          const slot = this.slots.find(s => s.x === table.x_position && s.y === table.y_position);
          if (slot) {
            slot.occupied = true;
            slot.pk = table.pk;
            slot.chairs = table.max_chairs;
          }
        });
        this.tablesLoaded = true;
        this.loadingSpinnerEnable = false;
      } catch (error) {
        if (error.response.status === 404) {
          this.tablesLoaded = true;
          this.loadingSpinnerEnable = false;
        } else {
          console.error('Error fetching tables:', error);
        }
      }
    },
    handleSlotClick(x, y) {
      const slot = this.slots.find(s => s.x === x && s.y === y);
      if (slot && !slot.occupied) {
        this.selectedSlot = slot;
      }
    },
    closeTableForm(refresh = false) {
      this.selectedSlot = null;
      if (refresh) {
        this.fetchTables();
      }
    },
    dragStart(slot) {
      if (this.isAdmin) {
        this.draggedSlot = slot;
      }
    },
    async drop(targetSlot) {
      if (this.draggedSlot && this.draggedSlot.id !== targetSlot.id) {
        // Guardar los valores originales de targetSlot
        const targetOriginal = {
          x: targetSlot.x,
          y: targetSlot.y,
          pk: targetSlot.pk,
          occupied: targetSlot.occupied,
          chairs: targetSlot.chairs,
          tableId: targetSlot.tableId,
        };

        // Guardar los valores originales de draggedSlot
        const draggedOriginal = {
          x: this.draggedSlot.x,
          y: this.draggedSlot.y,
          pk: this.draggedSlot.pk,
          occupied: this.draggedSlot.occupied,
          chairs: this.draggedSlot.chairs,
          tableId: this.draggedSlot.tableId,
        };

        // Intercambiar valores entre draggedSlot y targetSlot
        targetSlot.x = draggedOriginal.x;
        targetSlot.y = draggedOriginal.y;
        targetSlot.pk = draggedOriginal.pk;
        targetSlot.occupied = draggedOriginal.occupied;
        targetSlot.chairs = draggedOriginal.chairs;
        targetSlot.tableId = draggedOriginal.tableId;

        this.draggedSlot.x = targetOriginal.x;
        this.draggedSlot.y = targetOriginal.y;
        this.draggedSlot.pk = targetOriginal.pk;
        this.draggedSlot.occupied = targetOriginal.occupied;
        this.draggedSlot.chairs = targetOriginal.chairs;
        this.draggedSlot.tableId = targetOriginal.tableId;

        // Guardar cambios en el servidor
        try {
          if (draggedOriginal.pk && targetOriginal.pk) {
            await axios.put(`/api/tables/${draggedOriginal.pk}/`, {
              min_chairs: targetOriginal.chairs,
              max_chairs: targetOriginal.chairs,
            });
            await axios.put(`/api/tables/${targetOriginal.pk}/`, {
              min_chairs: draggedOriginal.chairs,
              max_chairs: draggedOriginal.chairs,
            });
          } else {
            if (draggedOriginal.pk) {
              await axios.put(`/api/tables/${draggedOriginal.pk}/`, {
                x_position: targetOriginal.x,
                y_position: targetOriginal.y,
              });
            }
            if (targetOriginal.pk) {
              await axios.put(`/api/tables/${targetOriginal.pk}/`, {
                x_position: draggedOriginal.x,
                y_position: draggedOriginal.y,
              });
            }
          }
        } catch (error) {
          console.error('Error updating table positions:', error);
        }

        this.draggedSlot = null;
      }
    },

  },
};
</script>
<style scoped>
.map-container {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  gap: 2px;
}

.grid-slot {
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 64px;
  flex-direction: column;
}

.admin-cursor {
  cursor: grab;
}

.grid-slot:active {
  cursor: grabbing;
}

.grid-slot.occupied {
  background-color: rgb(178, 222, 255);
}

.table-icon {
  max-width: 100%;
  max-height: 100%;
  padding: 5px;
}

.chair-info {
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin: 5px;
  background-color: #f5f5f5d6;
  border-radius: 10px;
  max-width: 100%;
  max-height: 100%;
  padding: 3px;
}

.chair-icon {
  width: 20px;
  height: auto;
  margin-right: 5px;
}

.chair-num {
  font-weight: bold;
}

.edit-button {
  width: 100%;
  height: 100%;
  position: absolute;
}

.add-button {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  color: #d7d7d7;
}

.add-icon {
  width: 16px;
  height: 16px;
}
</style>
