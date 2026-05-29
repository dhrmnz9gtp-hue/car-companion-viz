## Objetivo

Crear un archivo único `index.html` autocontenido con todo el contenido visual del proyecto BYD Yuan UP (carro interactivo con hotspots + tarjetas de tecnología), listo para subir a GitHub y abrir en cualquier navegador sin necesidad de build, Node, ni dependencias.

## Qué incluye el HTML

1. **HTML semántico** con todas las secciones actuales:
   - Hero con imagen principal del BYD Yuan UP
   - 9 hotspots posicionados sobre el carro (Carrocería, Cabina, Sensores, Puerto de carga, Motor, Frenos, Suspensión, Batería Blade, Llantas)
   - 7 tarjetas de tecnología (ADAS, Conducción autónoma, Climas extremos, Mantenimiento, IA, Seguridad batería, Frenos regenerativos)
2. **CSS embebido** dentro de `<style>` replicando el diseño actual (colores, tipografía, layout, animaciones de hover en hotspots y tarjetas).
3. **JavaScript embebido** dentro de `<script>` para la interactividad (mostrar/ocultar info al hacer click en hotspots, animaciones).
4. **Imágenes**: se entregan dos versiones para que elijas la que prefieras:
   - **Opción recomendada (más simple para GitHub)**: las 17 imágenes se incluyen como archivos separados en una carpeta `assets/` junto al HTML, referenciadas con rutas relativas (`./assets/byd-yuan-up.jpg`). Subes el HTML + la carpeta `assets/` al repo.
   - Las imágenes ya existen en `src/assets/` del proyecto y se copiarían tal cual.

## Estructura final entregada

```text
/mnt/documents/byd-yuan-up/
  index.html
  assets/
    byd-yuan-up.jpg
    hotspot-carroceria.png
    hotspot-cabina.png
    ... (17 imágenes en total)
```

Te entrego también un `.zip` con todo para que solo arrastres a tu repo de GitHub.

## Detalles técnicos

- Sin frameworks, sin React, sin build step. Solo HTML + CSS + JS plano.
- Compatible con GitHub Pages (puedes publicarlo gratis directo desde el repo).
- Diseño responsive equivalente al actual.
- Conservo los mismos tamaños/posiciones de hotspots e imágenes que ajustamos antes.

## Lo que NO incluye

- No incluye routing de TanStack ni código del backend (no aplica a un HTML estático).
- No incluye lógica de Lovable Cloud (el proyecto actual no la usa).

¿Procedo con esta estructura (HTML + carpeta assets + zip), o prefieres que las imágenes vayan embebidas en base64 dentro del mismo HTML (un solo archivo gigante, ~varios MB, pero literalmente un único archivo)?