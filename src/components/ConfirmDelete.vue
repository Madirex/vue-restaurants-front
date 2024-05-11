<template>
    <div class="modal" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="close" @click="cancelDelete">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar este elemento?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancelar</button>
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>
              <button type="button" class="btn btn-danger" @click="confirmDelete">Eliminar</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        loading: false,
      };
    },
    props: {
      type: String,
      id: String,
    },
    methods: {
      cancelDelete() {
        this.$emit('cancel');
      },
      confirmDelete() {
        this.$emit('confirm', { type: this.type, id: this.id });
        this.loading = true;
      },
    },
  };
  </script>
  
  <style scoped>
    .close {
        padding: 1rem;
        margin: -1rem -1rem -1rem auto;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 2rem;
    }
    .close:hover{
        color: red;
    }
  </style>
  