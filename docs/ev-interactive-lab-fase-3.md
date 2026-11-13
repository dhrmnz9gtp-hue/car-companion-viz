# EV Interactive Lab — Fase 3

Entrega local del 14 de octubre de 2026, para revisión. Repositorio `dhrmnz9gtp-hue/car-companion-viz`, rama `feature/ev-interactive-lab`.

## Preservación de la Fase 2

Antes de modificar el laboratorio se verificaron la rama y los cambios pendientes. Todos correspondían a la Fase 2. Pasaron las 15 pruebas automatizadas anteriores (7.788 aserciones), TypeScript, la compilación y las suites de navegador de las fases 1B y 2. Después se creó el commit **local** de recuperación:

`497490f1707487b9dad304e3bac1da7238921fd0` — `feat: preserve validated EV Interactive Lab phase 2`.

La Fase 3 queda sin confirmar para revisión. No se hizo push.

## 1. Funcionalidades implementadas

- **Cómo funciona:** activa el modo educativo, inicialmente en pausa. Volver a explorar detiene la reproducción y conserva la orientación alcanzada.
- **Movimiento:** giran rotor, eje, ocho imanes y dos pistas interiores de rodamientos: 12 piezas. Las otras 53 permanecen fijas. Se usan los ensamblajes, pivotes y ejes existentes.
- **Referencias del campo:** un marcador verde indica su avance angular y uno ámbar la referencia del rotor. El diagrama eléctrico αβ acompaña las señales. Son anotaciones angulares, no líneas de flujo ni mapas calculados de densidad magnética.
- **Alimentación trifásica:** tres señales sinusoidales normalizadas, con nombres, colores y trazos diferenciados, desfasadas 120° eléctricos. Los valores, el vector equivalente y el giro comparten una sola fase temporal.
- **Reproducción:** iniciar, pausar, restablecer, velocidades 0,25×/0,5×/1×/2× y avance manual. Una vuelta mecánica contiene cuatro ciclos eléctricos. A 1× se muestran 0,5 ciclos eléctricos por segundo, deliberadamente lentos.
- **Explicaciones:** campo giratorio, tres fases, imanes permanentes, origen del torque, sincronismo y relación entre frecuencia eléctrica y velocidad síncrona.
- **Exploración:** cámara, selección real sobre geometría rotada, transparencia y aislamiento siguen disponibles. No se duplican las geometrías físicas.
- **Desmontaje:** cualquier separación pausa el funcionamiento conservando su ángulo. Se bloquean reproducción y avance manual hasta ensamblar al 0%; la reanudación requiere pulsar Iniciar. Las traslaciones de desmontaje se aplican después de la rotación.
- **Visibilidad de anotaciones:** se ocultan al desmontar o aislar, para evitar referencias ambiguas. Las señales y explicaciones se conservan.
- **Alternativa 2D:** mantiene el esquema estático de componentes; las señales y el diagrama eléctrico sí se animan. Cambiar de vista pausa. Perder WebGL pausa y ofrece continuar mediante Esquema 2D.
- **Accesibilidad:** controles nativos, navegación por teclado, interacción táctil, sin reproducción automática y pausa al ocultar la pestaña. La preferencia de movimiento reducido permite avance manual o inicio explícito.

Restablecer funcionamiento vuelve al ángulo inicial y pausa, conservando la exploración. Restablecer vista restaura además cámara, separación, transparencia, aislamiento y selección. La velocidad de reproducción elegida se conserva.

## Arquitectura y coherencia didáctica

`usePlayback` administra el reloj y sus controles sin conocer piezas del motor. `electromagnetics` contiene relaciones matemáticas y transformaciones puras. `OperationPanel` y `Signals` presentan controles y señales; `OperationOverlay.client` dibuja anotaciones. La escena aplica las transformaciones a los ensamblajes declarados, sin buscar nombres específicos del PMSM.

La definición del modelo contiene los cuatro pares de polos, desfases, adelanto ilustrativo, frecuencia de ejemplo, posiciones de marcadores y textos. Otros modelos pueden reutilizar reproducción y transformación; una batería o cargador necesitaría su propia relación física educativa, sin heredar las ecuaciones síncronas.

Se usan corrientes equilibradas cosenoidales y la transformación de Clarke con amplitud invariante. El vector resultante tiene magnitud unitaria; no mide teslas. La relación angular es θeléctrico = p · θmecánico. Se prescribe un adelanto constante de 30° eléctricos entre la referencia del campo y la del rotor: 7,5° mecánicos con cuatro pares. El diagrama eléctrico y el marcador espacial expresan escalas distintas y la interfaz lo indica.

El ejemplo separado de frecuencia utiliza nₛ = 60 fₑ / p: 50 Hz y cuatro pares corresponden a 750 rpm. La animación ralentizada no reproduce esas rpm. Referencias de apoyo: [MathWorks, Clarke Transform](https://www.mathworks.com/help/mcb/ref/clarketransform.html) y [Microchip, Permanent Magnet Synchronous Motor](https://onlinedocs.microchip.com/oxy/GUID-0A4BC4EE-29F5-4736-8125-17139B84E7B5-en-US-2/GUID-C1C929BC-0D12-40FB-B555-F28B23CB457E.html).

## 2. Archivos

Rutas relativas al repositorio. Se modificaron seis archivos existentes:

| Archivo | Cambio |
| --- | --- |
| `src/features/ev-lab/Lab.tsx` | Integración del modo educativo y reglas de compatibilidad. |
| `src/features/ev-lab/lab.css` | Presentación de controles, señales y explicaciones. |
| `src/features/ev-lab/model.ts` | Contrato y validación de la operación educativa. |
| `src/features/ev-lab/models/pmsm.ts` | Parámetros físicos didácticos, referencias y contenidos; versión 1.2.0. |
| `src/features/ev-lab/viewer/Scene.client.tsx` | Rotación de ensamblajes y diagnósticos de transformaciones para pruebas. |
| `tests/ev-lab.test.ts` | Actualización de la capacidad de animación habilitada. |

Se añadieron ocho archivos:

| Archivo | Propósito |
| --- | --- |
| `src/features/ev-lab/operation/electromagnetics.ts` | Relaciones matemáticas y rotación alrededor de un pivote. |
| `src/features/ev-lab/operation/usePlayback.ts` | Reproducción, pausa, velocidad, avance manual y ciclo temporal. |
| `src/features/ev-lab/operation/OperationPanel.tsx` | Controles y contenidos educativos. |
| `src/features/ev-lab/operation/Signals.tsx` | Señales trifásicas y diagrama angular SVG. |
| `src/features/ev-lab/viewer/OperationOverlay.client.tsx` | Marcadores angulares 3D. |
| `tests/ev-lab-operation.test.ts` | Pruebas matemáticas y de transformación. |
| `scripts/test-lab-operation-browser.mjs` | Pruebas de interacción y capturas de Fase 3. |
| `docs/ev-interactive-lab-fase-3.md` | Este informe. |

No se añadieron dependencias ni se modificaron archivos de configuración, rutas públicas, portada, navegación o guías. La comparación contra el commit de recuperación confirma que las definiciones de las 65 piezas, ensamblajes y plan de desmontaje son idénticas.

## 3. Validación

| Comprobación | Resultado |
| --- | --- |
| Pruebas automatizadas | 23 aprobadas, 11.106 aserciones, cero fallos. |
| TypeScript | Correcto. |
| ESLint del laboratorio y pruebas | Correcto. |
| Compilación de cliente y SSR | Correcta; permanece la advertencia de tamaño del paquete 3D. |
| Regresión de navegador Fase 1B | 15 grupos aprobados. |
| Regresión de navegador Fase 2 | 12 grupos aprobados. |
| Navegador Fase 3 | 8 grupos aprobados, sin errores no controlados. |
| Rutas educativas | Las 10 rutas React y 10 HTML responden HTTP 200. La suite verifica además una guía React y una interacción HTML de ejemplo. |
| Geometrías conservadas | 65 piezas, 30.496 triángulos físicos; anotaciones separadas y no seleccionables. |
| SSR e hidratación | Contenido educativo servido sin canvas; carga e hidratación del visor verificadas en desarrollo. |

Las pruebas matemáticas cubren el desfase de 120°, suma instantánea nula de las corrientes, magnitud y orientación del vector equivalente, relación de cuatro ciclos eléctricos por vuelta, velocidad síncrona, conservación de pivotes y distancias, composición de grupos y evolución temporal.

La suite nueva verifica: inicio pausado; giro de exactamente 12 piezas y restauración de sus matrices tras una vuelta; correspondencia entre señales y ángulos; controles y cámara; selección real sobre un imán rotado; aislamiento y transparencia; bloqueo durante el desmontaje y conservación de orientación al ensamblar; restauración; alternativa 2D y pérdida de WebGL; tacto y ausencia de desbordamiento a 390 × 844.

El navegador utilizado fue Chrome con SwiftShader y emulación táctil. No se probó un dispositivo móvil físico, Safari o Firefox ni se certifica una tasa de cuadros. La compilación incluye SSR; no se repitió la ejecución del paquete de producción en Cloudflare local. Continúa la limitación de `bun run preview` documentada en la Fase 1B; no se cambió la configuración compartida.

## 4. Evidencias

Fuera del repositorio, en `../ev-lab-validation-phase3/`:

- `funcionamiento-3d.png`: motor y referencias angulares.
- `senales-y-explicaciones.png`: controles, tres fases, diagrama y relación frecuencia/velocidad.
- `funcionamiento-escritorio.png`, `funcionamiento-movil.png`, `funcionamiento-2d.png`: vistas completas.
- `operation-browser-results.json`: ocho grupos de Fase 3.
- `browser-results.json` y `assembly-browser-results.json`: regresión anterior.
- `guide-route-results.json`: comprobación de las veinte rutas.
- `git-final-state.json`: estado de Git al entregar.
- `baseline/`: evidencias previas al commit de recuperación.

## 5. Limitaciones físicas y problemas encontrados

El movimiento es prescrito, no el resultado de resolver una ecuación dinámica. No calcula arranque, carga, torque, eficiencia, saturación, PWM, armónicos, pérdidas, temperatura ni densidad de flujo. No reconstruye las conexiones de cada bobina del recurso simplificado. Los colores del cobre no representan corriente instantánea. Las bolas de los rodamientos no simulan rodadura; solo giran las pistas interiores declaradas.

El principal conflicto entre modos era animar piezas mientras se retiran sus apoyos. Se resolvió con pausa explícita y bloqueo hasta ensamblar, manteniendo el ángulo alcanzado. Para evitar confundir ángulos eléctricos con mecánicos se etiquetaron sus escalas y se explicó la relación de cuatro a uno. La pérdida de WebGL pausa la reproducción antes de permitir continuar en 2D.

La advertencia de tamaño del paquete 3D permanece; este sigue cargándose por demanda exclusivamente en el laboratorio. Conviene medir rendimiento y consumo en teléfonos físicos y revisar las explicaciones con un especialista antes de plantear publicación. En móvil, las explicaciones requieren desplazamiento vertical; una revisión posterior puede optimizar la lectura simultánea del visor y las señales.

Una ejecución de regresión no alcanzó a pulsar Detener antes de finalizar la transición de 1,6 segundos, mientras se compilaba en paralelo. La repetición sin compilación concurrente verificó la detención intermedia correctamente, sin cambiar el producto ni la prueba. Se conservó el registro del intento fallido; su causa exacta no se atribuye a un fallo funcional demostrado.

## 6. Estado y apertura

- Rama activa: `feature/ev-interactive-lab`.
- HEAD local: `497490f1707487b9dad304e3bac1da7238921fd0`, recuperación de Fase 2.
- No existe una rama local `main` en este checkout; se verificó su referencia remota sin crearla ni modificarla.
- Fase 3: seis archivos modificados y ocho nuevos, sin preparar ni confirmar.
- `main` remota y rama remota de desarrollo: `79ecbd55439fc48a0fa5955045525c7f8bd4f3da`, verificadas al cierre.
- Destino de push protegido localmente: `disabled://local-only`.

Abrir [laboratorio local](http://127.0.0.1:5173/laboratorio/motor-electrico), recargar si ya estaba abierto y pulsar **Cómo funciona → Iniciar**. El motor debe estar ensamblado al 0%. Para ver las señales sin WebGL, elegir **Esquema 2D**. El servidor local debe permanecer activo.

Para repetir las comprobaciones desde el repositorio, usando los runtimes existentes:

```sh
bun test tests
bun x tsc --noEmit
bun x eslint src/features/ev-lab tests
bun run build
node scripts/test-lab-browser.mjs
node scripts/test-lab-assembly-browser.mjs
node scripts/test-lab-operation-browser.mjs
```

Las suites de navegador requieren el servidor local, Playwright y Chrome; aceptan `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE` y `LAB_ARTIFACT_DIR`. No se instalaron dependencias adicionales en esta fase.

**No se publicó ni desplegó ningún cambio. No hubo push, PR, merge, cambios a main, Lovable, portada, guías o navegación principal.** No se tocaron los archivos sincronizados de `sources/`. La Fase 3 queda pendiente de revisión; no se iniciaron simulaciones avanzadas ni la siguiente fase.
