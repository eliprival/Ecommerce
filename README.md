# Experiencia de Ecommerce Northwind Colectivo

Una landing page de ecommerce responsiva que muestra productos curados, artículos útiles y caminos claros para que las personas
exploren colecciones o se suscriban a las novedades.

## Características

- Barra de navegación fija con menú móvil para recorrer las secciones con facilidad.
- Sección hero con buscador, propuesta de valor e imágenes inspiradoras.
- Chips de categoría, filtros por etiquetas y búsqueda instantánea para encontrar productos relevantes.
- Grid de productos con precios, botones de acción y opciones de ordenamiento.
- Cada producto destacado abre una página de detalle estilo marketplace con galería interactiva, reseñas y caja de compra.
- Sección de revista que resalta artículos editoriales relacionados con los productos destacados.
- Formulario de boletín, testimonios y mensajes enfocados en sostenibilidad.
- Navegación a páginas dedicadas (colecciones, artículos, soporte, políticas y más) para ofrecer contexto ampliado sin alterar la landing principal.
- Diseño totalmente responsivo con tipografía moderna y visuales suaves.

## Cómo empezar

1. Clona o descarga este repositorio en tu equipo.
2. Abre una terminal dentro de la carpeta `Ecommerce` y ejecuta `python3 -m http.server 8000` para iniciar un servidor local.
3. Ingresa a `http://localhost:8000` desde tu navegador y navega la experiencia completa.
4. Si prefieres no usar un servidor, también puedes abrir el archivo `index.html` directamente en el navegador.

Personaliza la información de productos, imágenes y contenido editorial directamente en el marcado para que coincida con tu catálogo y tono de marca.

## Páginas adicionales disponibles

Todos los enlaces de la barra de navegación y del pie de página dirigen a páginas individuales dentro de la carpeta `pages/`. Algunas de las más consultadas son:

- `pages/colecciones.html`, `pages/mas-vendidos.html`, `pages/revista.html` y `pages/boletin.html` para las secciones editoriales y comerciales principales.
- `pages/coleccion-rituales.html`, `pages/coleccion-bienestar.html` y `pages/coleccion-aventura.html` con detalle de cada colección destacada.
- Ocho páginas de producto dedicadas (`pages/producto-te-botanico.html`, `pages/producto-morral-weekend.html`, etc.) con carrusel de imágenes y argumentos de venta listos para personalizar.
- `pages/centro-de-ayuda.html`, `pages/envios-y-devoluciones.html` y `pages/rastrea-tu-pedido.html` con información de soporte.
- `pages/politica-privacidad.html`, `pages/terminos-condiciones.html` y `pages/accesibilidad.html` para las políticas legales y de accesibilidad.

Puedes modificar o ampliar cualquier página adicional manteniendo la misma estructura de estilos para garantizar una experiencia consistente.

## Despliegue en Netlify

1. Crea una cuenta gratuita en [Netlify](https://www.netlify.com/) o inicia sesión si ya tienes una.
2. Desde el panel principal, haz clic en **Add new site** y selecciona **Import an existing project**.
3. Conecta tu repositorio de GitHub, GitLab o Bitbucket que contenga este proyecto y autoriza a Netlify a acceder.
4. En el paso de configuración selecciona la rama que contiene el código del sitio (en este repositorio es `work`) y deja en blanco los campos de comando de build y directorio de publicación, ya que este sitio es estático.
5. Haz clic en **Deploy site**. Netlify subirá los archivos `index.html`, `styles.css` y `script.js` y generará una URL pública.
6. Personaliza la URL desde la sección **Site settings → Domain management** o conecta tu propio dominio siguiendo el asistente de Netlify.

Cada vez que hagas un nuevo commit en la rama seleccionada, Netlify volverá a construir el sitio automáticamente. Si necesitas subir archivos sin usar Git, también puedes arrastrar y soltar la carpeta del proyecto en la opción **Deploy manually** del panel principal. Si ves un mensaje de "Page Not Found" en tu dominio, verifica que la rama elegida en Netlify coincide con la rama `work` o la que tenga el archivo `index.html` en la raíz.
