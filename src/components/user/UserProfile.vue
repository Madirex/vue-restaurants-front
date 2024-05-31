<template>
  <div class="container mt-4">
    <h2 class="title">Perfil del Usuario</h2>

    <div v-if="user" class="profile">
      <div class="mb-3">
        <img v-if="user.photo" :src="'/api' + user.photo" alt="Foto de perfil" class="rounded-circle" width="150"
          height="150" />
      </div>
      <div class="mb-3">
        <strong>Nombre de usuario:</strong> {{ user.username }}
      </div>
      <div class="mb-3">
        <strong>Nombre:</strong> {{ user.first_name }}
      </div>
      <div class="mb-3">
        <strong>Apellido:</strong> {{ user.last_name }}
      </div>
      <div class="mb-3">
        <strong>Email:</strong> {{ user.email }}
      </div>
      <div class="mb-3" v-if="user.phone">
        <strong>Teléfono:</strong> {{ user.phone }}
      </div>
      <button class="btn btn-secondary" @click="showEditProfileModal = true">Editar perfil</button>
      <div class="mb-3">
        <strong>Dirección:</strong>
        <div v-if="user.address && Object.keys(user.address).length > 0">
          <div v-if="user.address.street || user.address.number">{{ user.address.street }} {{ user.address.number }}
          </div>
          <div v-if="user.address.city || user.address.province">{{ user.address.city }}, {{ user.address.province }}
          </div>
          <div v-if="user.address.country">{{ user.address.country }}</div>
          <div v-if="user.address.postal_code">{{ user.address.postal_code }}</div>
        </div>
        <div v-else>
          Sin dirección
        </div>
      </div>

      <button class="btn btn-primary" @click="showEditAddressModal = true">Editar dirección</button>

      <!-- poner el componente de Orders (COMPONENTE)-->
      <Orders />
    </div>
    <div v-else>
      Cargando perfil...
    </div>

    <div v-if="showEditAddressModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditAddressModal">&times;</span>
        <h2 class="title">Editar Dirección</h2>
        <form @submit.prevent="updateAddress">
          <div class="mb-3">
            <label for="street" class="form-label">Calle:</label>
            <input type="text" v-model="editAddress.street" class="form-control" required />
            <span v-if="errors.street" class="text-danger">{{ errors.street }}</span>
          </div>
          <div class="mb-3">
            <label for="number" class="form-label">Número:</label>
            <input type="text" v-model="editAddress.number" class="form-control" required />
            <span v-if="errors.number" class="text-danger">{{ errors.number }}</span>
          </div>
          <div class="mb-3">
            <label for="city" class="form-label">Ciudad:</label>
            <input type="text" v-model="editAddress.city" class="form-control" required />
            <span v-if="errors.city" class="text-danger">{{ errors.city }}</span>
          </div>
          <div class="mb-3">
            <label for="province" class="form-label">Provincia:</label>
            <input type="text" v-model="editAddress.province" class="form-control" required />
            <span v-if="errors.province" class="text-danger">{{ errors.province }}</span>
          </div>
          <div class="mb-3">
            <label for="country" class="form-label">País:</label>
            <input type="text" v-model="editAddress.country" class="form-control" required />
            <span v-if="errors.country" class="text-danger">{{ errors.country }}</span>
          </div>
          <div class="mb-3">
            <label for="postal_code" class="form-label">Código Postal:</label>
            <input type="text" v-model="editAddress.postal_code" class="form-control" required />
            <span v-if="errors.postal_code" class="text-danger">{{ errors.postal_code }}</span>
          </div>
          <div class="mb-3">
            <button type="submit" class="btn btn-primary" :disabled="loading">Actualizar dirección</button>
            <div v-if="loading" class="loading-indicator">
              <div class="spinner-border orange-spinner" role="status">
                <span>🍕</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditProfileModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditProfileModal">&times;</span>
        <h2 class="title">Editar Perfil</h2>
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label for="photo" class="form-label">Foto de perfil:</label>
            <div class="mb-3">
              <img v-if="user.photo" :src="'/api' + user.photo" alt="Foto de perfil" class="rounded-circle" width="150"
                height="150" />
            </div>
            <input type="file" @change="handlePhotoUpload" class="form-control" />
            <span v-if="errors.photo" class="text-danger">{{ errors.photo }}</span>
          </div>
          <div class="mb-3">
            <label for="username" class="form-label">Nombre de usuario:</label>
            <input type="text" v-model="editProfile.username" class="form-control" required />
            <span v-if="errors.username" class="text-danger">{{ errors.username }}</span>
          </div>
          <div class="mb-3">
            <label for="first_name" class="form-label">Nombre:</label>
            <input type="text" v-model="editProfile.first_name" class="form-control" required />
            <span v-if="errors.first_name" class="text-danger">{{ errors.first_name }}</span>
          </div>
          <div class="mb-3">
            <label for="last_name" class="form-label">Apellido:</label>
            <input type="text" v-model="editProfile.last_name" class="form-control" required />
            <span v-if="errors.last_name" class="text-danger">{{ errors.last_name }}</span>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email:</label>
            <input type="email" v-model="editProfile.email" class="form-control" required />
            <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
          </div>
          <div class="mb-3">
            <label for="phone" class="form-label">Teléfono:</label>
            <input type="text" v-model="editProfile.phone" class="form-control" required />
            <span v-if="errors.phone" class="text-danger">{{ errors.phone }}</span>
          </div>
          <div class="mb-3">
            <button type="submit" class="btn btn-primary" :disabled="loading">Actualizar perfil</button>
            <div v-if="loading" class="loading-indicator">
              <div class="spinner-border orange-spinner" role="status">
                <span>🍕</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Orders from '@/components/orders/Orders.vue';

export default {
  data() {
    return {
      user: null,
      showEditAddressModal: false,
      showEditProfileModal: false,
      editAddress: {
        street: '',
        number: '',
        city: '',
        province: '',
        country: '',
        postal_code: ''
      },
      editProfile: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        photo: null
      },
      loading: false,
      errors: {
        street: '',
        number: '',
        city: '',
        province: '',
        country: '',
        postal_code: '',
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        photo: ''
      }
    };
  },
  components: {
    Orders
  },
  async created() {
    try {
      const response = await axios.get('/api/users/me/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      this.user = response.data;

      // Asignar valores de dirección del usuario al objeto editAddress
      if (this.user && this.user.address) {
        this.editAddress = {
          street: this.user.address.street || '',
          number: this.user.address.number || '',
          city: this.user.address.city || '',
          province: this.user.address.province || '',
          country: this.user.address.country || '',
          postal_code: this.user.address.postal_code || ''
        };
      }

      // Asignar valores del perfil del usuario al objeto editProfile
      this.editProfile = {
        username: this.user.username,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        phone: this.user.phone || ''
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('Error al cargar el perfil del usuario.');
    }
  },
  methods: {
    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editProfile.photo = file;
      }
    },
    closeEditAddressModal() {
      this.showEditAddressModal = false;
    },
    closeEditProfileModal() {
      this.showEditProfileModal = false;
    },
    async updateAddress() {
      // Verificar la longitud de cada campo de dirección
      if (this.editAddress.street.length > 100) {
        this.errors.street = "El campo 'calle' no debe exceder 100 caracteres.";
        return;
      } else {
        this.errors.street = '';
      }

      if (this.editAddress.number.length > 10) {
        this.errors.number = "El campo 'número' no debe exceder 10 caracteres.";
        return;
      } else {
        this.errors.number = '';
      }

      if (isNaN(this.editAddress.number)) {
        this.errors.number = "El campo 'número' debe ser un número.";
        return;
      } else {
        this.errors.number = '';
      }

      if (this.editAddress.city.length > 50) {
        this.errors.city = "El campo 'ciudad' no debe exceder 50 caracteres.";
        return;
      } else {
        this.errors.city = '';
      }

      if (this.editAddress.province.length > 50) {
        this.errors.province = "El campo 'provincia' no debe exceder 50 caracteres.";
        return;
      } else {
        this.errors.province = '';
      }

      if (this.editAddress.country.length > 50) {
        this.errors.country = "El campo 'país' no debe exceder 50 caracteres.";
        return;
      } else {
        this.errors.country = '';
      }

      if (this.editAddress.postal_code.length > 10 || isNaN(this.editAddress.postal_code) || this.editAddress.postal_code.length != 5) {
        this.errors.postal_code = "El campo 'código postal' debe ser un número de 5 dígitos.";
        return;
      } else {
        this.errors.postal_code = '';
      }

      this.loading = true;
      try {
        // Realizar la solicitud de actualización de dirección
        await axios.put('/api/users/update_address/', { address: this.editAddress }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        // Actualizar la dirección del usuario
        this.user.address = { ...this.editAddress };

        // Cerrar el modal
        this.closeEditAddressModal();
      } catch (error) {
        console.error('Error updating address:', error);
        alert('Error al actualizar la dirección. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        this.loading = false;
      }
    },
    async updateProfile() {
      // Validaciones del perfil
      if (this.editProfile.username.length > 150) {
        this.errors.username = "El nombre de usuario no debe exceder 150 caracteres.";
        return;
      } else {
        this.errors.username = '';
      }

      if (this.editProfile.first_name.length > 30) {
        this.errors.first_name = "El nombre no debe exceder 30 caracteres.";
        return;
      } else {
        this.errors.first_name = '';
      }

      if (this.editProfile.last_name.length > 30) {
        this.errors.last_name = "El apellido no debe exceder 30 caracteres.";
        return;
      } else {
        this.errors.last_name = '';
      }

      if (!this.validateEmail(this.editProfile.email)) {
        this.errors.email = "El email no es válido.";
        return;
      } else {
        this.errors.email = '';
      }

      if (this.editProfile.phone && !/^\+?[0-9]*$/.test(this.editProfile.phone)) {
        this.errors.phone = "El teléfono debe ser un número válido.";
        return;
      } else {
        this.errors.phone = '';
      }

      this.loading = true;
      const formData = new FormData();
      formData.append('username', this.editProfile.username);
      formData.append('first_name', this.editProfile.first_name);
      formData.append('last_name', this.editProfile.last_name);
      formData.append('email', this.editProfile.email);
      formData.append('phone', this.editProfile.phone);
      if (this.editProfile.photo) {
        formData.append('photo', this.editProfile.photo);
      }

      try {
        const response = await axios.patch('/api/users/modify/', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        this.user = response.data;
        this.closeEditProfileModal();
      } catch (error) {
        if (error.response && error.response.data) {
          this.errors = error.response.data;
        } else {
          console.error('Error al actualizar el perfil:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    validateEmail(email) {
      const re = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
      return re.test(String(email).toLowerCase());
    }
  }
};
</script>
<style scoped>
.modal {
  display: block;
  /* Hidden by default */
  position: fixed;
  /* Stay in place */
  z-index: 1;
  /* Sit on top */
  left: 0;
  top: 0;
  width: 100%;
  /* Full width */
  height: 100%;
  /* Full height */
  overflow: auto;
  /* Enable scroll if needed */
  background-color: rgb(0, 0, 0);
  /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4);
  /* Black w/ opacity */
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  /* Could be more or less, depending on screen size */
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.loading-indicator {
  margin-top: 10px;
}

.orange-spinner .spinner-border {
  color: orange;
}

.profile{
  text-align: center;
}
</style>
