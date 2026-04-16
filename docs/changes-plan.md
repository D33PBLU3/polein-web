# Plan de Cambios — Polein Web

## Estado de imágenes requeridas

Las siguientes imágenes mencionadas en los cambios **ya existen** en `public/img/`:
- `Imágenes para WEB-POLEIN_Header.webp` ✅
- `Imágenes para WEB-POLEIN_Quienes Somos.webp` ✅

---

## Preguntas antes de implementar

1. **Galería — imágenes adicionales:** Se pide agregar más imágenes para mostrar diferentes marcas y tipos de equipo, pero actualmente solo hay 10 imágenes en `public/img/portfolio/`. ¿Tienes archivos de imagen listos para agregar? ¿Cuántas imágenes quieres en total?

2. **Testimonios — ¿cuáles quitar?:** Hay 9 testimonios actualmente (Luis Fernandez, Sofia Martinez, Scarlett Álvarez, Alexander García, Antonio Rivera, Carlos Vargas, David Rodríguez, Natalia Ruiz, Benjamin Torres). ¿Cuáles 2 se eliminan?

3. **Header — posición del botón "Servicios":** ¿El botón debe quedar debajo del párrafo de texto, centrado, o en algún lugar específico de la imagen?

4. **Galería — tamaño de imagen:** ¿Tienes una referencia de qué tan pequeñas deben ser? (por ejemplo, 3 columnas con imágenes más cortas, o 4 columnas, o cuadradas).

5. **Contact — "hacerlo más visible":** ¿Se refiere a aumentar el tamaño del texto de confirmación después de enviar, o al tamaño del texto del formulario en general?

---

## Categorización por dificultad

### 🟢 FÁCIL — Solo cambios en `src/data/data.json`

Todos estos se pueden hacer en una sola edición de archivo, sin tocar componentes ni CSS.

| # | Cambio | Archivo | Detalle |
|---|---|---|---|
| F1 | Título Features → "LO QUE NOS DISTINGUE" | `features.jsx` | Cambio de hardcode en JSX |
| F2 | Features: íconos y textos de las 4 tarjetas | `data.json` → `Features[]` | 4 ítems: icon + text + title |
| F3 | About: párrafo de descripción | `data.json` → `About.paragraph` | Texto en español provisto |
| F4 | About: subtítulo "¿QUÉ NOS DISTINGUE?" → "¿POR QUÉ ELEGIRNOS?" | `about.jsx` | Cambio de hardcode en JSX |
| F5 | Services: descripciones, nombres, íconos de los 3 servicios existentes | `data.json` → `Services[]` | Mantenimiento, Reparación, Reemplazo |
| F6 | Services: eliminar Calibración, Limpieza y Revisión de Seguridad | `data.json` → `Services[]` | Quitar 3 ítems |
| F7 | Services: agregar Armado de Equipos, Instalación de Piso, Venta de Equipos | `data.json` → `Services[]` | Agregar 3 ítems con ícono |
| F8 | Testimonios: agregar César García y Angelica Nares | `data.json` → `Testimonials[]` | 2 nuevos ítems |
| F9 | Testimonios: quitar 2 (pendiente confirmar cuáles) | `data.json` → `Testimonials[]` | Eliminar 2 ítems |
| F10 | Contact: texto principal del formulario | `data.json` → `Contact` o `contact.jsx` | Texto hardcoded en JSX |
| F11 | Contact: mensaje de confirmación | `contact.jsx` | Hardcoded en el `then()` del sendForm |
| F12 | Gallery: subtítulo | `gallery.jsx` | Hardcoded en JSX |

---

### 🟡 MEDIO — Cambios en componentes JSX y/o CSS

| # | Cambio | Archivos | Detalle |
|---|---|---|---|
| M1 | Header: imagen de fondo | `public/css/style.css` `.intro` | Cambiar `url(../img/polein-intro3.jpg)` → `url(../img/Imágenes para WEB-POLEIN_Header.webp)` (URL encode del nombre) |
| M2 | Header: botón "Learn More" → "Servicios" y apunta a `#services` | `header.jsx` | Cambiar texto y `href` |
| M3 | Header: posición del botón | `public/css/style.css` `header .intro-text` | Ajustar `padding-bottom` o agregar margen al botón |
| M4 | About: imagen → Quienes Somos.webp | `about.jsx` | Cambiar `src="img/about2.jpg"` → `src="img/Imágenes para WEB-POLEIN_Quienes Somos.webp"` |
| M5 | About: texto con alineación justificada | `public/css/style.css` `#about p` | Agregar `text-align: justify` |
| M6 | Reordenar secciones: About antes de Features en App.jsx | `App.jsx` + `navigation.jsx` | Mover `<About>` antes de `<Features>` y actualizar orden de links en nav |
| M7 | Gallery: quitar lightbox (click en imagen) | `image.jsx` | Reemplazar `<a href={largeImage}>` por un `<div>` |
| M8 | Gallery: quitar hover naranja | `public/css/style.css` | Eliminar/comentar reglas `.hover-bg .hover-text` y `.hover-bg:hover .hover-text` |
| M9 | Gallery: imágenes más pequeñas | `public/css/style.css` | Reducir altura de `.portfolio-item img` o cambiar columnas a `col-md-3` |
| M10 | Contact: botón "ENVIAR MENSAJE" color naranja | `public/css/style.css` `#contact .btn-custom` | Cambiar a fondo `#ff8200` y quitar `background: transparent` |
| M11 | Contact: tamaño de texto de confirmación | `public/css/style.css` `.confirmation-message` | Aumentar `font-size` |
| M12 | Redes sociales: quitar ícono de Instagram | `contact.jsx` | Eliminar el `<li>` con `fa-instagram` |

---

### 🔴 REQUIERE ARCHIVOS EXTERNOS

| # | Cambio | Bloqueado por |
|---|---|---|
| R1 | Gallery: agregar más imágenes | Necesitas proporcionar los archivos de imagen. Van a `public/img/portfolio/` y luego se agregan a `data.json` → `Gallery[]` |

---

## Íconos Font Awesome 4 propuestos

(La versión instalada es Font Awesome 4.3.0)

| Sección | Tarjeta | Ícono actual | Ícono propuesto | Clase FA |
|---|---|---|---|---|
| Features | Experiencia y Profesionalismo | `fa-comments-o` (burbujas) | Certificado/medalla | `fa fa-certificate` |
| Features | Servicios Personalizados | `fa-bullhorn` (bocina) | Engranajes/herramientas | `fa fa-cogs` |
| Features | Reparaciones Confiables | `fa-group` (usuarios) | Llave inglesa | `fa fa-wrench` |
| Features | Soporte Continuo | `fa-bicycle` (bicicleta) | Auriculares/teléfono | `fa fa-headphones` |
| Services | Mantenimiento Preventivo | `fa-wordpress` (W) | Llave inglesa | `fa fa-wrench` |
| Services | Revisión y Reparación | `fa-cart-arrow-down` (carrito) | Lupa/búsqueda | `fa fa-search` |
| Services | Reemplazo de Piezas | `fa-cloud-download` (descarga) | Pieza/puzzle | `fa fa-puzzle-piece` |
| Services | Armado de Equipos (nuevo) | — | Martillo/construcción | `fa fa-gavel` |
| Services | Instalación de Piso (nuevo) | — | Cuadrícula/piso | `fa fa-th` |
| Services | Venta de Equipos (nuevo) | — | Etiqueta/tienda | `fa fa-tag` |

---

## Resumen de archivos a modificar

| Archivo | Cambios |
|---|---|
| `src/data/data.json` | Features (4 ítems), Services (6 ítems nuevos), About.paragraph, Testimonials (quitar 2, agregar 2) |
| `src/components/header.jsx` | Texto y href del botón |
| `src/components/features.jsx` | Título hardcodeado |
| `src/components/about.jsx` | Imagen src, subtítulo hardcodeado |
| `src/components/gallery.jsx` | Subtítulo hardcodeado |
| `src/components/image.jsx` | Quitar lightbox anchor |
| `src/components/contact.jsx` | Texto formulario, mensaje confirmación, quitar Instagram |
| `src/App.jsx` | Reordenar About antes de Features |
| `src/components/navigation.jsx` | Reordenar links nav |
| `public/css/style.css` | Header bg image, about text-align, gallery hover, gallery img size, contact button, confirmation msg font |
