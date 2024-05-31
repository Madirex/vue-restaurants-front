<template>
    <div class="container mt-4">
        <h3>Horarios Personalizados</h3>

        <!-- Alertas de Bootstrap -->
        <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
            {{ alert.message }}
        </div>

        <div v-if="loadingSpinnerEnable" class="loading-indicator">
            <div v-if="startTimeEnableSpinner" class="spinner-border orange-spinner" role="status">
                <span>🍕</span>
            </div>
        </div>
        <div v-else-if="!errorFetchingSchedules">
            <!-- Tabla de horarios personalizados -->
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Horas Abiertas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="schedule in customSchedules">
                        <td>{{ schedule.day }}</td>
                        <td>
                            <span v-for="(hour, index) in schedule.opened_hours" :key="index" class="custom-hour">
                                {{ hour }}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-danger" @click="confirmDelete(schedule.pk)" :disabled="loading">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>

            </table>

            <!-- Formulario para agregar horarios personalizados -->
            <div class="add-schedule mt-4">
                <input type="date" v-model="newScheduleDay" class="form-control" :disabled="loading" />
                <input type="text" v-model="newScheduleHours" class="form-control mt-2"
                    placeholder="Ingrese las horas abiertas separadas por coma" :disabled="loading" />
                <button class="btn btn-primary mt-2" @click="addSchedule" :disabled="loading">
                    <i class="fas fa-plus"></i> Agregar horario
                    <span v-if="loadingAdd" class="spinner-border spinner-border-sm" role="status">
                        <span></span>
                    </span>
                </button>
            </div>
        </div>

        <!-- Modal de confirmación -->
        <ConfirmDelete v-if="showModal" :type="'schedules'" :id="selectedScheduleId" @cancel="closeDeleteModal"
            @confirm="deleteSchedule" />
    </div>
</template>

<script>
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import axios from 'axios';

export default {
    components: {
        ConfirmDelete,
    },
    props: {
        restaurantId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            customSchedules: [],
            newScheduleDay: '',
            newScheduleHours: '',
            showModal: false,
            selectedScheduleId: null,
            errorFetchingSchedules: false,
            alert: {
                message: '',
                type: '',
            },
            loadingSpinnerEnable: true,
            startTimeEnableSpinner: false,
            loading: false,
            loadingAdd: false,
        };
    },
    created() {
        this.fetchCustomSchedules();
    },
    methods: {
        async fetchCustomSchedules() {
            this.loadingSpinnerEnable = true;
            setTimeout(() => {
                this.startTimeEnableSpinner = true;
            }, 1000);
            try {
                const restaurantResponse = await axios.get(`/api/restaurants/${this.restaurantId}/`);

                if (!restaurantResponse.data.calendar) {
                    throw new Error('El restaurante no tiene un calendario asociado');
                }

                const calendarId = restaurantResponse.data.calendar;

                const customSchedulesResponse = await axios.get(`/api/calendars/${calendarId}/`);

                this.customSchedules = await Promise.all(customSchedulesResponse.data.customs_schedules.map(async scheduleId => {
                    const scheduleResponse = await axios.get(`/api/schedules/${scheduleId}/`);
                    return scheduleResponse.data;
                }));

            } catch (error) {
                console.error('Error fetching custom schedules:', error);
                this.errorFetchingSchedules = true;
                this.alert.type = 'alert-danger';
                this.alert.message = 'Error al obtener los horarios personalizados';
            } finally {
                this.loadingSpinnerEnable = false;
            }
        },



        async addSchedule() {
            if (!this.newScheduleDay || !this.newScheduleHours) return;
            this.loading = true;
            this.loadingAdd = true;
            try {
                const opened_hours = this.newScheduleHours.split(',').map(hour => hour.trim());
                await axios.post(`/api/schedules/`, {
                    day: this.newScheduleDay,
                    opened_hours,
                    calendar: this.restaurantId,
                });
                this.customSchedules.push({
                    day: this.newScheduleDay,
                    opened_hours,
                });
                this.newScheduleDay = '';
                this.newScheduleHours = '';
                this.alert.type = 'alert-success';
                this.alert.message = 'Horario personalizado agregado exitosamente';
            } catch (error) {
                console.error('Error saving custom schedule:', error);
                this.alert.type = 'alert-danger';
                this.alert.message = error.response.data.detail;
            } finally {
                this.loading = false;
                this.loadingAdd = false;
            }
        },
        confirmDelete(id) {
            this.selectedScheduleId = id;
            this.showModal = true;
        },
        closeDeleteModal() {
            this.showModal = false;
            this.selectedScheduleId = null;
        },
        async deleteSchedule() {
            this.loading = true;
            try {
                await axios.delete(`/api/schedules/${this.selectedScheduleId}/`);
                this.customSchedules = this.customSchedules.filter(schedule => schedule.pk !== this.selectedScheduleId);
                this.closeDeleteModal();

                //refresh
                this.fetchCustomSchedules();
                
                this.alert.type = 'alert-success';
                this.alert.message = 'Horario personalizado eliminado exitosamente';
                
            } catch (error) {
                console.error('Error deleting custom schedule:', error);
                this.alert.type = 'alert-danger';
                this.alert.message = error.response.data.detail;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>

.add-schedule {
    display: flex;
    flex-direction: column;
    max-width: 300px;
}

.custom-hour {
    background-color: #a1f8ab;
    border-radius: 4px;
    padding: 5px 10px;
    display: inline-block;
    margin: 2px;
}
</style>