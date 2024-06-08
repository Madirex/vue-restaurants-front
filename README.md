# vue_restaurants_front

Proyecto front para la gestión de un grupo de restaurantes. Creado con Vue.

[Ir al proyecto del backend (desarrollado en Django)](https://github.com/Madirex/django-restaurants-api/)

## Restaurantes
El proyecto cuenta con una serie de restaurantes.
![Descripción de la imagen](/images/img1.png)

## Usuarios
Un usuario tiene un perfil y una dirección asociada que puede editar en todo momento. Además, cada usuario puede observar sus pedidos.
![Descripción de la imagen](/images/img2.png)

## Menú, horarios, mesas y gestión
El usuario administrador puede agregar nuevos platos al menú, cambiar el horario (agregar horarios estacionales, excluir días o agregar un horario personalizado). Además, el usuario administrador es capaz de configurar la distribución total del restaurante, pudiendo elegir en qué posiciones se encuentran las mesas y qué cantidad de sillas están disponibles.
![Descripción de la imagen](/images/img3.png)

## Realizar reservas
El usuario puede realizar reservas al restaurante seleccionado. Seleccionar la hora de la reserva, las mesas que desea reservar y la comida que quiere pedir.
![Descripción de la imagen](/images/img4.png)


## Comandos

Para instalar las dependencias, ejecuta el siguiente comando:

        npm i

Para iniciar el servidor de desarrollo, ejecuta el siguiente comando:

        npm run dev

## Dependencias

- **@fortawesome/fontawesome-free**: Librería de iconos que proporciona una amplia gama de iconos de alta calidad y de uso gratuito.
  
- **@popperjs/core**: Librería que proporciona utilidades para posicionar elementos emergentes y tooltips en la web.
  
- **axios**: Cliente HTTP basado en Promesas para el navegador y Node.js. Se utiliza para hacer peticiones HTTP al servidor backend.
  
- **bootstrap**: Framework CSS que proporciona una colección de herramientas y componentes para el diseño web responsivo y el desarrollo frontend.

- **html2pdf.js**: Biblioteca para generar archivos PDF a partir de contenido HTML en el navegador.

- **vue**: Biblioteca JavaScript para la construcción de interfaces de usuario interactivas y de una sola página.

- **vue-cal**: Componente de calendario para Vue.js que permite mostrar eventos y manejar interacciones de calendario.

- **vue-router**: Enrutador oficial de Vue.js para construir aplicaciones de una sola página.

