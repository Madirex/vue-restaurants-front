<template>
    <div class="seasonal-calendar-container">
      <h3>Calendario Estacional</h3>
  
      <!-- Alertas de Bootstrap -->
      <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
        {{ alert.message }}
      </div>
  
      <div v-if="loading" class="loading-indicator">
        <div class="spinner-border orange-spinner" role="status">
          <span>🍕</span>
        </div>
      </div>
  
      <div v-else>
        <!-- Sección de Horario Normal -->
        <div class="season-section">
          <h4>Horario Normal</h4>
          <div v-if="normalSchedule">
            <ul class="list-group">
              <li v-for="(hour, index) in normalSchedule.opened_hours" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                {{ hour }}
                <button class="btn btn-danger btn-sm" @click="confirmDelete('normalSchedule', index)">Eliminar</button>
              </li>
            </ul>
            <div class="mt-2 d-flex">
              <select v-model="newNormalTime" class="form-select me-2">
                <option v-for="time in availableTimes('normalSchedule')" :key="time" :value="time">{{ time }}</option>
              </select>
              <button class="btn btn-primary mt-2" @click="addTimeSlot('normalSchedule')">Añadir hora abierta</button>
            </div>
          </div>
          <div v-else>
            <button class="btn btn-primary" @click="createSchedule('normalSchedule')">Crear Horario</button>
          </div>
        </div>
  
        <!-- Sección de Horario de Verano -->
        <div class="season-section">
          <h4>Horario de Verano</h4>
          <div v-if="summerSchedule">
            <ul class="list-group">
              <li v-for="(hour, index) in summerSchedule.opened_hours" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                {{ hour }}
                <button class="btn btn-danger btn-sm" @click="confirmDelete('summerSchedule', index)">Eliminar</button>
              </li>
            </ul>
            <div class="mt-2 d-flex">
              <select v-model="newSummerTime" class="form-select me-2">
                <option v-for="time in availableTimes('summerSchedule')" :key="time" :value="time">{{ time }}</option>
              </select>
              <button class="btn btn-primary mt-2" @click="addTimeSlot('summerSchedule')">Añadir hora abierta</button>
            </div>
          </div>
          <div v-else>
            <button class="btn btn-primary" @click="createSchedule('summerSchedule')">Crear Horario</button>
          </div>
        </div>
  
        <!-- Sección de Horario de Invierno -->
        <div class="season-section">
          <h4>Horario de Invierno</h4>
          <div v-if="winterSchedule">
            <ul class="list-group">
              <li v-for="(hour, index) in winterSchedule.opened_hours" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                {{ hour }}
                <button class="btn btn-danger btn-sm" @click="confirmDelete('winterSchedule', index)">Eliminar</button>
              </li>
            </ul>
            <div class="mt-2 d-flex">
              <select v-model="newWinterTime" class="form-select me-2">
                <option v-for="time in availableTimes('winterSchedule')" :key="time" :value="time">{{ time }}</option>
              </select>
              <button class="btn btn-primary mt-2" @click="addTimeSlot('winterSchedule')">Añadir hora abierta</button>
            </div>
          </div>
          <div v-else>
            <button class="btn btn-primary" @click="createSchedule('winterSchedule')">Crear Horario</button>
          </div>
        </div>
      </div>
  
      <!-- ConfirmDelete Modal -->
      <ConfirmDelete v-if="showModal" :type="'horario'" :index="selectedIndex" @cancel="closeDeleteModal" @confirm="deleteTimeSlot" />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import ConfirmDelete from '@/components/ConfirmDelete.vue';
  
  export default {
    components: {
      ConfirmDelete
    },
    props: {
      restaurantId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        normalSchedule: null,
        summerSchedule: null,
        winterSchedule: null,
        loading: false,
        alert: {
          message: '',
          type: ''
        },
        newNormalTime: '',
        newSummerTime: '',
        newWinterTime: '',
        allTimes: this.generateAllTimes(),
        showModal: false,
        selectedIndex: null,
        selectedScheduleType: null,
      };
    },
    created() {
      this.fetchSeasonalSchedules();
    },
    methods: {
      generateAllTimes() {
        let times = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 30) {
            let time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            times.push(time);
          }
        }
        return times;
      },
      confirmDelete(scheduleType, index) {
        this.selectedScheduleType = scheduleType;
        this.selectedIndex = index;
        this.showModal = true;
      },
      closeDeleteModal() {
        this.showModal = false;
        this.selectedIndex = null;
      },
      deleteTimeSlot() {
        this[this.selectedScheduleType].opened_hours.splice(this.selectedIndex, 1);
        this.updateSchedule(this.selectedScheduleType, this[this.selectedScheduleType].pk);
        this.closeDeleteModal();
      },
      availableTimes(scheduleType) {
        const selectedTimes = new Set(this[scheduleType].opened_hours);
        return this.allTimes.filter(time => !selectedTimes.has(time));
      },
      async fetchSeasonalSchedules() {
        try {
          this.loading = true;
          const response = await axios.get(`/api/calendars/${this.restaurantId}/`);
          const { normal_week_schedule, summer_week_schedule, winter_week_schedule } = response.data;
          if (normal_week_schedule) {
            this.normalSchedule = await this.fetchSchedule(normal_week_schedule);
          }
          if (summer_week_schedule) {
            this.summerSchedule = await this.fetchSchedule(summer_week_schedule);
          }
          if (winter_week_schedule) {
            this.winterSchedule = await this.fetchSchedule(winter_week_schedule);
          }
        } catch (error) {
          console.error('Error fetching seasonal schedules:', error);
          this.alert.type = 'alert-danger';
          this.alert.message = 'Error al obtener los horarios estacionales';
        } finally {
          this.loading = false;
        }
      },
      async fetchSchedule(scheduleId) {
        const response = await axios.get(`/api/schedules/${scheduleId}/`);
        return response.data;
      },
      async createSchedule(scheduleType) {
        try {
          this.loading = true;
          const response = await axios.post('/api/schedules/', { opened_hours: [], calendar: this.restaurantId });
          const scheduleId = response.data.pk;
          this[scheduleType] = await this.fetchSchedule(scheduleId);
        } catch (error) {
          console.error(`Error creating ${scheduleType} schedule:`, error);
          this.alert.type = 'alert-danger';
          this.alert.message = `Error al crear el horario ${scheduleType}`;
        } finally {
          this.loading = false;
        }
      },
      async updateSchedule(scheduleType, scheduleId) {
        try {
          this.loading = true;
          await axios.put(`/api/schedules/${scheduleId}/`, this[scheduleType]);
          this.alert.type = 'alert-success';
          this.alert.message = 'Horario actualizado con éxito';
        } catch (error) {
          console.error(`Error updating ${scheduleType} schedule:`, error);
          this.alert.type = 'alert-danger';
          this.alert.message = `Error al actualizar el horario ${scheduleType}`;
        } finally {
          this.loading = false;
        }
      },
      addTimeSlot(scheduleType) {
        if (scheduleType === 'normalSchedule' && this.newNormalTime) {
          this.normalSchedule.opened_hours.push(this.newNormalTime);
          this.updateSchedule('normalSchedule', this.normalSchedule.pk);
          this.newNormalTime = '';
        } else if (scheduleType === 'summerSchedule' && this.newSummerTime) {
          this.summerSchedule.opened_hours.push(this.newSummerTime);
          this.updateSchedule('summerSchedule', this.summerSchedule.pk);
          this.newSummerTime = '';
        } else if (scheduleType === 'winterSchedule' && this.newWinterTime) {
          this.winterSchedule.opened_hours.push(this.newWinterTime);
          this.updateSchedule('winterSchedule', this.winterSchedule.pk);
          this.newWinterTime = '';
  
        }
      },
      removeTimeSlot(scheduleType, index) {
        this[scheduleType].opened_hours.splice(index, 1);
        this.updateSchedule(scheduleType, this[scheduleType].pk);
      }
    }
  };
  </script>
  
  <style scoped>
  .seasonal-calendar-container {
    margin: 20px;
  }
  .season-section {
    margin-bottom: 20px;
  }
  .list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  