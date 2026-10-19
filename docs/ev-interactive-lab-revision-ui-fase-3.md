# Pura Corriente — Revisión UI/UX de Fase 3

Entrega local para revisión. No incorpora una fase nueva ni cambios en el funcionamiento del motor.

## Recuperación previa

Se verificó `feature/ev-interactive-lab`. Los cambios pendientes correspondían exclusivamente a la entrega de Fase 3. Antes de reorganizar la interfaz pasaron las 23 pruebas automatizadas (11.106 aserciones), TypeScript, ESLint, compilación cliente/SSR y los ocho grupos de navegador de funcionamiento electromagnético.

Se creó el commit local de recuperación **`4b17a260c43756948dafae4e16634aa0d68773be`**, `feat: preserve validated electromagnetic lab phase 3`. El checkout quedó limpio después del commit y antes de esta revisión. No se hizo push.

## Cambios de distribución

En escritorio, el visor mantiene su ancho y alto anteriores cuando está activo el modo de funcionamiento. La columna izquierda contiene visor y controles de exploración, lista de componentes, ficha del componente y explicaciones del funcionamiento. La columna derecha contiene exclusivamente controles eléctricos, señales, diagrama vectorial y relación entre frecuencia y velocidad.

La ficha conserva nombre, función, explicación técnica, relación con el sistema, identificación de la pieza seleccionada y botón de enfoque. Sus dos textos explicativos se distribuyen en columnas cuando hay espacio, con un máximo de 65 caracteres tipográficos de ancho aproximado por párrafo. Sin selección se muestra la introducción existente.

Los seis desplegables del funcionamiento y el apartado de límites se trasladaron sin modificar sus textos. Se muestran en dos columnas en escritorio y una en móvil. Cada apartado conserva su apertura independiente; pueden abrirse varios a la vez. No hay copias ocultas ni duplicación de contenido.

Hasta 1100 px, la página pasa a una columna: visor y controles de exploración → herramientas eléctricas → selección de componentes → ficha → explicaciones. Este es también el orden del documento y de navegación por teclado. No se añadieron barras internas de desplazamiento. Los controles conservan su interacción nativa y los resúmenes desplegables ofrecen al menos 44 px de altura.

Al salir del modo de funcionamiento se aprovecha el ancho disponible para la exploración y la ficha, sin dejar una columna eléctrica vacía. No se redujo la altura del visor ni se aumentaron las fuentes. Se conservaron colores, materiales e identidad visual.

## Archivos modificados

| Archivo | Cambio |
| --- | --- |
| `src/features/ev-lab/Lab.tsx` | Ubicación de los bloques, separación del panel eléctrico y ficha del componente. |
| `src/features/ev-lab/lab.css` | Distribución responsive, ancho de lectura y presentación de las explicaciones. |
| `src/features/ev-lab/operation/OperationPanel.tsx` | Retirada de los desplegables; controles y diagramas permanecen intactos. |
| `src/features/ev-lab/operation/OperationLessons.tsx` | Nuevo componente de presentación con los desplegables existentes. |
| `scripts/test-lab-layout-browser.mjs` | Prueba de distribución, selección, enfoque, desplegables y capturas. |
| `scripts/test-lab-browser.mjs` | Actualización de las coordenadas del visor tras desplazarse a la ficha. |
| `docs/ev-interactive-lab-revision-ui-fase-3.md` | Este informe. |

Son cuatro archivos existentes modificados y tres nuevos. No cambiaron geometrías, definición del modelo, escena, transformaciones, reproducción, relaciones matemáticas, señales SVG, desmontaje, transparencia, aislamiento ni cámara. Tampoco cambiaron dependencias, rutas, portada, datos de guías, recursos públicos o configuraciones. Estas exclusiones se comprobaron mediante comparación con el commit de recuperación.

## Capturas antes y después

Las evidencias están fuera del repositorio, en `../ev-lab-validation-ui-phase3/`.

| Vista | Archivo |
| --- | --- |
| Antes, escritorio | `before/funcionamiento-escritorio.png` |
| Antes, móvil | `before/funcionamiento-movil.png` |
| Después, escritorio | `after/despues-escritorio.png` |
| Después, con rotor seleccionado | `after/despues-componente-escritorio.png` |
| Después, escritorio de 1200 px | `after/despues-escritorio-1200.png` |
| Ficha del componente | `after/componente-escritorio.png` |
| Desplegables abiertos | `after/explicaciones-escritorio.png` |
| Después, tablet de 1024 px | `after/despues-tablet.png` |
| Después, móvil de 390 px | `after/despues-movil.png` |

Las capturas de escritorio sin selección utilizan la misma fase eléctrica y el mismo viewport de 1440 × 1100 para comparar la distribución. Las capturas móviles muestran estados de selección distintos y no deben usarse para comparar alturas totales directamente.

## Validación

Resultados de las comprobaciones de cierre; los JSON y registros quedan en el directorio de evidencias:

Todas las comprobaciones siguientes finalizaron correctamente: 23 pruebas automatizadas y 42 grupos de navegador, sin errores no controlados. Se revisaron las capturas de escritorio, escritorio intermedio y móvil.

- Pruebas del modelo, relaciones matemáticas y exploración: 23 pruebas, 11.106 aserciones.
- TypeScript, ESLint del laboratorio y compilación de cliente y servidor.
- Nueva prueba UI: siete grupos sobre dimensiones del visor, ubicación de bloques, etiquetas en escritorio intermedio, siete selecciones y enfoque, siete desplegables con teclado, reproducción/pausa y presentación en tablet/móvil.
- Suite de Fase 3: ocho grupos de funcionamiento, selección, aislamiento, transparencia, desmontaje, restauración, 2D, pérdida de WebGL y tacto.
- Regresión de Fase 1B: 15 grupos aprobados. Regresión de Fase 2: 12 grupos aprobados.
- Veinte rutas educativas: diez React y diez HTML responden HTTP 200. La suite anterior verifica además una interacción HTML y una guía React.
- SSR: respuesta educativa sin canvas; visor cargado en cliente y ausencia de errores no controlados de hidratación en las suites.

Los resultados finales se registran en `after/layout-results.json`, `after/operation-browser-results.json`, `after/browser-results.json`, `after/assembly-browser-results.json` y `after/guide-route-results.json`.

El navegador de prueba es Chrome con SwiftShader. Las pruebas táctiles corresponden a emulación, no a teléfonos físicos; no se certifica rendimiento en hardware móvil, Safari o Firefox. La compilación mantiene la advertencia conocida del paquete 3D superior a 500 kB, cargado únicamente al entrar en el laboratorio. No se cambió la configuración de producción ni se ejecutó un despliegue.

## Problemas resueltos

- La barra eléctrica acumulaba herramientas y textos. Se separaron por función sin alterar sus datos ni estados.
- La ficha quedaba al final de la barra lateral. Ahora sigue a la selección de componentes bajo el área de exploración.
- El ancho de la columna izquierda podía producir párrafos demasiado largos. Se limitaron los anchos de lectura y se repartieron las explicaciones en dos columnas cuando hay espacio.
- Los títulos de las dos columnas de la ficha tenían separaciones superiores distintas. Se igualaron sus márgenes y líneas de separación.
- Las siete etiquetas de componentes necesitaban adaptarse a la columna más estrecha en escritorios intermedios. Su cuadrícula ahora calcula cuántas columnas caben, conservando un ancho mínimo de 130 px por botón; los tamaños móviles mantienen sus reglas existentes.
- La comparación automatizada de la captura anterior detectó un píxel de diferencia por redondeo del recorte. Se ajustó la tolerancia de la comprobación a un píxel; no se cambió el tamaño del visor para satisfacerla.
- Una prueba antigua reutilizaba las coordenadas del canvas anteriores al desplazamiento hacia el botón de enfoque. Se actualizó para volver al canvas y medir su posición antes del arrastre. Se conservó la comprobación de que el gesto cambia la cámara y no selecciona accidentalmente una pieza; no se modificó la cámara del producto.

## Estado y revisión

La rama continúa siendo `feature/ev-interactive-lab`; HEAD es el commit local de recuperación `4b17a260c43756948dafae4e16634aa0d68773be`. Esta revisión UI queda sin preparar ni confirmar, para inspección. No se modificó `main`.

Abrir [laboratorio local](http://127.0.0.1:5173/laboratorio/motor-electrico), recargar y activar **Cómo funciona**. Seleccionar una pieza para ver su ficha debajo de los controles y la lista. El servidor local debe estar activo.

**No se hizo push, publicación, despliegue, merge ni PR. No se alteraron Lovable, portada, guías, navegación principal o archivos sincronizados de `sources/`.** Se espera revisión antes de continuar.
