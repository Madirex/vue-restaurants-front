<template>
    <div class="modal" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar cancelación de pedido</h5>
            <button type="button" class="close" @click="cancel">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Quieres cancelar este pedido?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancel">No</button>
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>
              <button type="button" class="btn btn-danger" @click="confirmCancel">Cancelar pedido</button>
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
      cancel() {
        this.$emit('cancel');
      },
      confirmCancel() {
        this.$emit('confirm', { type: this.type, id: this.id });
        this.$emit('cancel');
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
  