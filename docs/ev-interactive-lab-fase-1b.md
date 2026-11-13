# EV Interactive Lab — entrega de Fase 1B

Fecha: 13 de octubre de 2026. Repositorio: `dhrmnz9gtp-hue/car-companion-viz`.

## 1. Resultado y alcance

Se implementó un laboratorio permanente y modular en `/laboratorio/motor-electrico`, integrado en la aplicación existente. Presenta un PMSM genérico, didáctico y seleccionable, con explicaciones en español. El trabajo queda **solamente en el checkout local**, pendiente de revisión del usuario. No se inició la Fase 2.

Los resultados descritos como verificados corresponden a las pruebas locales indicadas abajo. La publicación automática de una futura actualización remota y el rendimiento en teléfonos físicos permanecen sin verificar.

## 2. Archivos creados

Rutas relativas a este repositorio:

- `src/features/ev-lab/model.ts`: contrato serializable, relaciones con vehículos y validación del recurso.
- `src/features/ev-lab/library.ts`: catálogo de tecnologías y asociaciones con vehículos.
- `src/features/ev-lab/models/pmsm.ts`: geometría declarativa y contenido del PMSM.
- `src/features/ev-lab/models/PmsmDiagram.tsx`: esquema 2D interactivo específico del recurso.
- `src/features/ev-lab/viewer/geometry.ts`: generador de geometrías reutilizables.
- `src/features/ev-lab/viewer/Scene.client.tsx`: escena, selección y cámara WebGL.
- `src/features/ev-lab/viewer/Viewport.tsx`: carga en navegador, detección de WebGL y recuperación ante fallos.
- `src/features/ev-lab/Lab.tsx`: interfaz y estado educativo compartidos.
- `src/features/ev-lab/lab.css`: estilos del laboratorio con clases propias.
- `src/routes/laboratorio.motor-electrico.tsx`: nueva ruta independiente.
- `tests/ev-lab.test.ts`: pruebas de contrato, geometría y relaciones mecánicas.
- `scripts/test-lab-browser.mjs`: pruebas de navegador, interacción y regresión.
- `docs/ev-interactive-lab-fase-1b.md`: este informe.

Las capturas y resultados JSON están fuera del repositorio, en `../ev-lab-validation/`. Los archivos sincronizados de `sources/` no se tocaron.

## 3. Archivos existentes modificados

| Archivo | Cambio |
| --- | --- |
| `package.json` | Tres dependencias nuevas, sin cambiar scripts ni versiones declaradas existentes. |
| `bun.lock` | Resolución de dependencias con Bun; incluye los paquetes transitivos y la normalización del lockfile. |
| `src/routeTree.gen.ts` | Registro generado por TanStack para la ruta nueva. |

No hay modificaciones en la portada, las guías React, los datos de vehículos, las guías HTML, los estilos generales, `vite.config.ts`, `wrangler.jsonc` o `.lovable/`.

## 4. Dependencias

| Dependencia añadida | Versión exacta | Uso |
| --- | --- | --- |
| `three` | 0.186.1 | Geometrías, materiales, renderizado y OrbitControls. |
| `@react-three/fiber` | 9.8.1 | Integración de la escena con React 19. |
| `@types/three` | 0.186.0 | Tipos de desarrollo. |

No se añadió Drei: OrbitControls cubre las necesidades actuales. Se conservaron React 19.2.5, TypeScript 5.9.3 y Vite 7.3.2 resueltos en el proyecto. Se respetó Bun y su lockfile; no se instalaron herramientas globales. Playwright y Chrome disponibles en el equipo se usaron para validar sin añadirlos a las dependencias del producto.

## 5. Estructura y separación de responsabilidades

```text
src/routes/laboratorio.motor-electrico.tsx
  └─ Lab + definición del catálogo + esquema específico
src/features/ev-lab/
  ├─ model.ts                  contrato sin React ni WebGL
  ├─ library.ts                biblioteca y asociaciones
  ├─ models/
  │  ├─ pmsm.ts                datos, piezas y explicaciones
  │  └─ PmsmDiagram.tsx        representación 2D
  ├─ viewer/
  │  ├─ Viewport.tsx           límite navegador/SSR y fallback
  │  ├─ Scene.client.tsx       renderizador genérico
  │  └─ geometry.ts           adaptador procedural
  ├─ Lab.tsx                   interfaz educativa reutilizable
  └─ lab.css
```

TanStack sirve el contenido educativo en HTML. Después de la hidratación se comprueba WebGL2 y se carga la escena mediante una importación dinámica protegida con `createClientOnlyFn`. La portada no solicita el paquete de la escena. No se añadió ningún enlace al laboratorio en páginas existentes; la ruta contiene `noindex, nofollow`, que no constituye control de acceso.

## 6. Motor implementado

Recurso `motor-pmsm-generico`, versión `1.0.0`. Siete componentes estables: `housing`, `stator`, `windings`, `rotor`, `magnets`, `shaft`, `bearings`. Contiene **65 piezas de malla con identificadores únicos**.

La carcasa y el estator tienen un corte fijo de un cuarto de circunferencia. El estator representa una disposición de 12 dientes, con nueve visibles al retirar el sector. Los bobinados rodean dientes y sus cabezas sobresalen axialmente del núcleo. El rotor lleva ocho imanes superficiales de polaridad alternada, separados del estator por un entrehierro. El eje atraviesa el rotor y dos rodamientos lo apoyan en las tapas. Se distinguen conjuntos fijos y giratorios, incluidas las pistas de los rodamientos.

El modelo no tiene dimensiones de fabricación ni reproduce un motor comercial. El corte, las vueltas reducidas, los colores, las proporciones ilustrativas y las conexiones omitidas se explican en la interfaz. No se presentan torque, potencia o eficiencia inventados. El corte estático permite estudiar el interior; todavía no hay transparencia o vista explosionada.

Referencia técnica incluida: [Microchip — Permanent Magnet Synchronous Motor](https://onlinedocs.microchip.com/oxy/GUID-0A4BC4EE-29F5-4736-8125-17139B84E7B5-en-US-2/GUID-C1C929BC-0D12-40FB-B555-F28B23CB457E.html). Respalda el principio y la variante superficial; no las dimensiones de esta representación.

## 7. Interacciones terminadas

- Giro orbital 360° con mouse y gestos táctiles; controles de teclado y botones.
- Zoom con rueda, pellizco y botones, limitado entre 4,8 y 14 unidades de cámara.
- Selección directa de piezas, identificación de la pieza y resaltado de su componente.
- Selección equivalente por lista de botones o etiquetas del esquema.
- Explicación de nombre, función, funcionamiento y relación con el sistema para los siete componentes.
- Enfoque del componente y restablecimiento de cámara y selección.
- Alternancia manual 3D/2D y recuperación educativa ante falta o pérdida de WebGL.
- Exploración táctil desactivada inicialmente en dispositivos de puntero grueso; activación y pausa explícitas para permitir desplazar la página.
- Navegación por teclado, foco visible, enlace de salto y anuncios del panel mediante `aria-live`.

Al fallar la escena se retiran los controles de cámara y enfoque. La lista sigue disponible como alternativa a las etiquetas pequeñas del esquema móvil.

## 8. Reutilización y preparación de futuras fases

`ModelDefinition` separa contenido, geometrías, posiciones originales, enfoques de cámara, direcciones de separación, referencias y capacidades. La escena no contiene nombres ni reglas específicas del PMSM. El esquema 2D se inyecta como un componente propio de cada recurso.

`VehicleModelBinding` mantiene fabricante, vehículo, año, variante, mercado, diferencias, configuración, referencias y estado de verificación separados del modelo tecnológico. El catálogo de asociaciones está vacío: no se ha atribuido este motor a Tesla, BYD u otro fabricante.

Para añadir una tecnología procedural se crea su definición, se registra y se proporciona su esquema. Para un recurso detallado GLTF se ha reservado un contrato con URL y correspondencia de nodos a identificadores, pero **el cargador GLTF todavía no está implementado**. Será necesario añadir ese adaptador; la interfaz educativa y los IDs se pueden conservar.

Las direcciones de separación y los conjuntos con pivotes/ejes preparan vista explosionada y animación. Las capacidades de explosión, transparencia, aislamiento, animación y simulación siguen desactivadas. Las futuras animaciones distinguen `illustrative` y `physical`, con referencias; aún no existe un motor de simulación ni visualización de flujo energético.

## 9. Validación verificada

| Comprobación | Resultado |
| --- | --- |
| Compilación y tipos del proyecto antes del cambio | Correctos. |
| TypeScript final (`tsc --noEmit`) | Correcto. |
| Compilación cliente y servidor (`bun run build`) | Correcta; advertencia de tamaño descrita abajo. |
| ESLint sobre archivos TS/TSX nuevos | Correcto. No equivale a afirmar que todo el código histórico pasa lint. |
| Pruebas de modelo (`bun test tests/ev-lab.test.ts`) | 7 aprobadas, 187 aserciones, 0 fallos. |
| Pruebas existentes en el commit base | No se encontraron archivos ni un script de pruebas automatizadas. |
| Navegador Chrome/Chromium | 15 grupos aprobados; sin errores de navegador o hidratación no controlados. |
| Regresión de rutas educativas | 10 rutas React y 10 HTML devuelven HTTP 200. Interacción de hotspot comprobada en la guía HTML BYD Yuan Up. |
| SSR de la nueva ruta | HTML educativo disponible sin canvas; hidratación correcta. |
| Compilación de producción en Cloudflare local | HTTP 200, WebGL, selección y 2D correctos; portada sin cargar escena. |
| Móvil | Emulación táctil a 390 × 844, giro, zoom por pellizco, selección y pausa; sin desbordamiento horizontal. |
| Fallos de gráficos | Contexto WebGL2 ausente y pérdida de contexto existente: alternativa 2D y explicaciones conservadas. |
| Revisión visual | Capturas de escritorio, esquema y móvil revisadas. |

Las pruebas de navegador verifican también selección real de un imán, las siete explicaciones, un giro completo, límites de zoom, enfoque, reinicio, teclado y ausencia de renderizado continuo en reposo. Se utilizó SwiftShader: **no son pruebas físicas de GPU o teléfono, ni una medición representativa de FPS**.

Rendimiento observado:

- 30.496 triángulos y 65 mallas; por debajo de 100.000 triángulos.
- Escena aislada: 948,38 kB de JavaScript minificado, aproximadamente 256,52 kB gzip. La ruta educativa añade 22,41 kB y sus estilos 12,33 kB sin comprimir.
- No hay descargas de GLB ni texturas externas del modelo. El recurso incremental está por debajo de la referencia de 5 MB; esto no describe el peso total de toda la aplicación ni la memoria GPU.
- Renderizado bajo demanda, sin sombras ni posprocesamiento; resolución limitada a DPR 1 en pantallas pequeñas o pocos núcleos, y máximo 1,5 en el resto.

## 10. Incidencias corregidas y limitación identificada

Se corrigió la incompatibilidad entre el evento de OrbitControls y `invalidate` mediante un callback. La protección de importaciones de TanStack detectó inicialmente una importación de escena cliente alcanzable por SSR; quedó aislada con `createClientOnlyFn` y pasó la compilación posterior.

La revisión visual detectó controles 3D sobre la alternativa 2D. Se sincronizó la disponibilidad de la escena con la interfaz y se añadió una comprobación de regresión. En móvil se adelantó la lista de componentes al panel educativo y se ampliaron los botones de cámara. Los puntos de las etiquetas 2D ahora proceden del contrato de datos.

Un primer reintento del navegador encontró el servidor de desarrollo detenido (`ERR_CONNECTION_REFUSED`); se reinició y la suite posterior pasó. El registro de ese intento se conserva como evidencia histórica.

**Limitación de vista previa:** `bun run preview` responde HTTP 500 porque intenta importar `dist/server/server.js`, mientras que el destino Cloudflare genera `dist/server/index.js`. No se cambió la configuración compartida para resolverlo. La compilación se comprobó con Wrangler en modo estrictamente local; el servidor de desarrollo funciona. El error de `preview` no permite considerar ese comando validado.

## 11. Riesgos y pendientes

- Faltan pruebas en teléfonos físicos Android/iOS de gama media, Safari y Firefox. El objetivo de 30 FPS no está certificado.
- Vite advierte que el paquete de la escena supera 500 kB minificados. Ya se carga por separado, pero faltan mediciones en redes lentas y dispositivos reales.
- El recurso es didáctico. Antes de añadir simulación, modelos específicos o nuevas relaciones mecánicas conviene una revisión técnica del contenido y la geometría.
- La recuperación de fallos WebGL está probada; no se inyectaron todos los posibles fallos de descarga de módulos. Existe un límite de errores para ofrecer el esquema.
- Durante la revisión de automatizaciones se observó `pages-build-deployment` activo y ejecuciones en `main`. No se pudo acreditar la configuración completa de GitHub Pages ni las integraciones privadas de Lovable. **El aislamiento de una futura publicación remota sigue pendiente: no hacer push todavía.**
- Una ruta sin enlaces y `noindex` no es privada si se publica en el futuro.
- El comando `preview` requiere una corrección o decisión posterior sobre el entorno; no bloquea el desarrollo local ni la compilación Cloudflare validada.

## 12. Cómo abrir y repetir pruebas

Desde la raíz del repositorio, con Bun instalado:

```sh
bun install --frozen-lockfile
bun run dev --host 127.0.0.1 --port 5173
```

Abrir [laboratorio local](http://127.0.0.1:5173/laboratorio/motor-electrico). La dirección funciona solamente en este equipo mientras el servidor esté activo. Para esta sesión se utilizó Bun 1.4.3 disponible en:

```text
/var/folders/2s/0t04d06x27bd7053m9l8hs6w0000gn/T/ev-lab-bun-AlUZwU/package/bin/bun
```

Si `bun` no está en el PATH, puede invocarse esa ruta en lugar de `bun` mientras exista el archivo temporal. No se instaló globalmente.

Validación de código:

```sh
bun x tsc --noEmit
bun test tests/ev-lab.test.ts
bun x eslint src/features/ev-lab src/routes/laboratorio.motor-electrico.tsx tests/ev-lab.test.ts
bun run build
```

Para las pruebas de navegador, con el servidor de desarrollo activo, usar Node y Playwright disponibles. `PLAYWRIGHT_MODULE` puede apuntar al módulo existente, `CHROME_EXECUTABLE` a Chrome y `LAB_ARTIFACT_DIR` al directorio de resultados:

```sh
node scripts/test-lab-browser.mjs
```

La suite usa diagnósticos de desarrollo; no debe ejecutarse contra la compilación de producción sin adaptar esas comprobaciones. No hay que añadir Playwright al producto para usar un runtime de pruebas externo.

Vista previa del build Cloudflare comprobada, sin publicación:

```sh
WRANGLER_SEND_METRICS=false node node_modules/wrangler/bin/wrangler.js dev --local --config dist/server/wrangler.json --ip 127.0.0.1 --port 4174
```

## 13. Estado exacto de Git

Rama local: `feature/ev-interactive-lab`. HEAD y referencia remota de esa rama: `79ecbd55439fc48a0fa5955045525c7f8bd4f3da`. `main` remota fue consultada nuevamente y conserva el mismo SHA. El checkout se creó limpio a partir de la rama indicada.

Hay **3 archivos seguidos modificados y 13 archivos nuevos sin seguimiento**, enumerados en las secciones 2 y 3. No hay cambios preparados en el índice ni commits adicionales. La clonación es de una sola rama; no se creó ni se cambió una rama local `main`.

Como protección local adicional, el destino de push está configurado en `.git/config` como `disabled://local-only`. Este ajuste no modifica GitHub ni Lovable. No se debe quitar sin confirmar primero el aislamiento de publicación.

## 14. Protección de main y del producto existente

`main` remota conserva el SHA original. La comparación de archivos seguidos limita los cambios a las dependencias y al árbol generado de rutas; portada, guías, configuraciones y contenidos existentes permanecen intactos. Las 20 rutas educativas respondieron y se comprobaron muestras interactivas.

## 15. Publicación y cierre

No se creó ningún commit, push, pull request, merge ni despliegue. No se alteró la plataforma publicada ni la configuración de Lovable. Los servidores utilizados escuchan únicamente en este equipo; no se creó un túnel público.

La Fase 1B queda entregada y validada en local, con las limitaciones explícitas anteriores. La próxima tarea, solo después de instrucciones del usuario, es implementar la vista explosionada aprovechando los IDs y direcciones de separación ya definidos.
