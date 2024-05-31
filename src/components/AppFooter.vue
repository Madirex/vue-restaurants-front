<template>
    <footer class="footer bg-light text-dark">
      <div class="py-4">
            <p>Plataforma dedicada a conectar a los amantes de la comida con los mejores restaurantes.</p>
        <div class="text-center py-3">
          <p>&copy; 2024 Madirex Restaurants. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'AppFooter',
  };
  </script>
  
  <style scoped>
  .footer {
    font-size: 1em;
    font-family: 'Roboto', sans-serif;
    margin-top: 25px;
    padding: 10px;
    padding-bottom: 0 !important;
    padding-top: 0 !important;
    background-color: #ffffff14 !important;
    color: white !important;
    text-align: center;
  }
  
  .footer .nav-link {
    transition: color 0.3s;
  }
  
  .footer .nav-link:hover {
    color: #5f6cff;
    text-decoration: none;
  }
  
  .footer h5 {
    font-size: 1.2em;
    margin-bottom: 1em;
  }
  
  .footer p {
    margin-bottom: 0.5em;
  }
  </style>
  