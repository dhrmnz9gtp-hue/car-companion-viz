# EV Interactive Lab — Fase 2

Entrega local del 14 de octubre de 2026. Repositorio `dhrmnz9gtp-hue/car-companion-viz`, rama `feature/ev-interactive-lab`.

## Recuperación de la Fase 1B

Antes de editar se verificaron rama y estado. Los cambios coincidían con la entrega anterior: dependencias, ruta y archivos del laboratorio; no se encontraron cambios ajenos. El servidor local estaba detenido y se reinició.

Se ejecutaron las siete pruebas del recurso, los tipos, la compilación y los 15 grupos de pruebas de navegador existentes. Pasaron. Después se creó el commit **local** de recuperación:

`65d89be2e5567641b969c762f236c16931083eac` — `feat: preserve validated EV Interactive Lab phase 1B`.

Este commit contiene la Fase 1B completa. La Fase 2 queda como cambios locales sin preparar ni confirmar, para revisión. No se hizo push.

## 1. Funcionalidades implementadas

- **Desmontar / Ensamblar:** movimiento suave, reversible e interrumpible desde cualquier posición.
- **Nivel de separación 0–100%:** control nativo compatible con mouse, tacto y teclado. Los cambios del deslizador también tienen una transición corta.
- **Detener:** conserva la posición alcanzada, sin continuar el movimiento en segundo plano.
- **Cámara:** mantiene el giro libre y el zoom durante el desmontaje. El encuadre se amplía progresivamente con la separación; el enfoque utiliza las posiciones desplazadas y puede seguir el conjunto enfocado.
- **Selección:** las piezas conservan sus identificadores, resaltado y explicaciones durante la separación.
- **Transparencia 0–100%:** carcasa opaca, envolvente translúcida o carcasa oculta. La envolvente permite seleccionar el interior.
- **Aislar componente / Mostrar todo:** muestra el componente elegido y permite cambiarlo desde la lista; conserva sus posiciones. Mostrar todo cancela el aislamiento, respetando el ajuste de transparencia.
- **Restablecer vista:** restablece cámara, selección, separación, transparencia y aislamiento.
- **Esquema 2D:** permanece ensamblado y educativo; no ofrece controles 3D inoperantes. Los ajustes de separación se conservan al volver al visor. Un fallo de WebGL mantiene la alternativa 2D.
- **Movimiento reducido:** respeta la preferencia del sistema y llega a la posición solicitada sin animación.

Los botones de cámara se sitúan debajo del visor para evitar que tapen piezas en pantallas pequeñas. No se añadieron enlaces al laboratorio en la navegación existente.

## Ensamblaje y arquitectura

El plan de desmontaje declara cinco conjuntos de movimiento sobre las 65 piezas existentes:

1. Tapa y rodamiento delantero.
2. Tapa y rodamiento trasero.
3. Rotor, eje e imanes unidos.
4. Estator y bobinados unidos.
5. Envolvente, nervaduras y apoyos de la carcasa.

Primero se retiran los apoyos axialmente. Después se extraen rotor y estator en sentidos axiales opuestos. Solo cuando han librado la carcasa se realiza el desplazamiento lateral final del estator y la elevación de la envolvente. El ensamblaje invierte la misma trayectoria.

Las etapas referencian los `explodeDirection` originales por ID, con escala, sentido y un intervalo de activación. Las agrupaciones para desmontaje se mantienen separadas de los ensamblajes previstos para el giro del rotor. Así, por ejemplo, un rodamiento se retira completo con su tapa sin cambiar la asociación original de su pista interior al conjunto giratorio.

La lógica no contiene nombres de piezas PMSM. `separationOffsets` calcula traslaciones desde los datos; `partAppearance` resuelve visibilidad y selección; `useSeparation` administra una sola transición cancelable. No se duplican geometrías. Otros modelos pueden definir sus propios conjuntos, etapas, envolventes y trayectorias sin copiar el visor.

Se compararon las piezas con el commit de recuperación: **las 65 geometrías, IDs, posiciones originales, rotaciones y ensamblajes físicos permanecen idénticos**. Se conservan 30.496 triángulos. El recurso pasa a versión `1.1.0`.

Este desmontaje es una representación educativa. No simula esfuerzos, herramientas, uniones adhesivas o procedimientos reales de mantenimiento. No se añadieron giro del rotor, flujo energético ni simulaciones físicas.

## 2. Archivos modificados y creados

Rutas relativas al repositorio.

| Modificado | Propósito |
| --- | --- |
| `src/features/ev-lab/Lab.tsx` | Estado de exploración, integración de controles, restauración y compatibilidad 2D. |
| `src/features/ev-lab/lab.css` | Controles responsive, rangos y cámara fuera de la zona del modelo. |
| `src/features/ev-lab/model.ts` | Contrato y validación del plan de desmontaje y de la envolvente transparente. |
| `src/features/ev-lab/models/pmsm.ts` | Cinco conjuntos, etapas, capacidades habilitadas y versión del recurso. |
| `src/features/ev-lab/viewer/Scene.client.tsx` | Transformaciones, cámara, visibilidad, materiales y selección. |
| `tests/ev-lab.test.ts` | Expectativas de capacidades actualizadas para esta fase. |

| Creado | Propósito |
| --- | --- |
| `src/features/ev-lab/AssemblyControls.tsx` | Interfaz reutilizable de desmontaje y visibilidad. |
| `src/features/ev-lab/exploration.ts` | Cálculos puros independientes de React y WebGL. |
| `src/features/ev-lab/useSeparation.ts` | Transición interrumpible y preferencia de movimiento reducido. |
| `tests/ev-lab-exploration.test.ts` | Pruebas de agrupación, secuencias, reversibilidad y visibilidad. |
| `scripts/test-lab-assembly-browser.mjs` | Validación de interacciones de la Fase 2 y capturas. |
| `docs/ev-interactive-lab-fase-2.md` | Informe de entrega. |

No se incorporaron dependencias. `package.json`, `bun.lock`, la ruta, las configuraciones de Lovable, la portada y las guías no cambiaron respecto al commit de recuperación.

## 3. Resultados de validación

| Comprobación | Resultado |
| --- | --- |
| TypeScript | Correcto. |
| Compilación cliente y servidor | Correcta. Mantiene la advertencia conocida de paquete de escena superior a 500 kB. |
| ESLint del laboratorio y sus pruebas TypeScript | Correcto. |
| Pruebas del modelo | 15 pruebas, 7.788 aserciones, cero fallos. Incluyen las pruebas anteriores actualizadas. |
| Regresión de navegador de Fase 1B | 15 grupos aprobados: selección, cámara, zoom táctil, teclado, SSR, fallback y guías. |
| Navegador de Fase 2 | 12 grupos aprobados, descritos abajo. |
| Guías existentes | Las diez rutas React y las diez HTML responden HTTP 200; la suite comprueba también una interacción HTML de ejemplo. |
| Geometrías frente al checkpoint | Idénticas para las 65 piezas; sin duplicación durante la separación. |
| Renderizado en reposo | La escena deja de producir cuadros al finalizar el movimiento. |
| SSR e hidratación | La ruta entrega contenido educativo sin canvas en el servidor; escena e interacción cargan en navegador sin errores no controlados. |

Los 12 grupos nuevos comprueban: desmontaje animado y detención; posición al 50%; selección real, enfoque y aislamiento durante la separación; posición al 100%, encuadre y reposo; retorno exacto al ensamblado; transparencia y restauración; recuperación de una carcasa oculta al aislarla; ida y vuelta a 2D; restablecimiento completo; pérdida de WebGL después del desmontaje; interacción táctil y ausencia de desbordamiento; movimiento reducido.

Las pruebas de contrato verifican cobertura única de todas las piezas, continuidad en los límites de las etapas, posiciones finitas, conservación de grupos rígidos, liberación de apoyos antes de extraer el conjunto, separación lateral posterior a la extracción y ausencia de mutación del recurso original. No constituyen un análisis exhaustivo de colisiones físicas entre superficies.

**Alcance de las pruebas móviles:** Chrome con SwiftShader y emulación táctil a 390 × 844. No se probó un teléfono físico ni se certifican 30 FPS. En esta fase no se repitió la ejecución de producción en Cloudflare local; sí se comprobaron compilación SSR y ejecución en el servidor de desarrollo.

Evidencias fuera del repositorio, en `../ev-lab-validation-phase2/`:

- `baseline/browser-results.json`: pruebas anteriores al commit de recuperación.
- `browser-results.json`: regresión de Fase 1B después de incorporar la funcionalidad.
- `assembly-browser-results.json`: pruebas de Fase 2.
- `guide-route-results.json`: respuestas de las 20 guías.
- `git-final-state.json`: estado final de Git.

## 4. Capturas

En el mismo directorio de evidencias:

- `ensamblado.png`: visor al 0%.
- `desmontado.png`: visor al 100%.
- `ensamblado-pagina.png` y `desmontado-pagina.png`: página completa de escritorio.
- `transparencia.png`: carcasa al 60% de transparencia.
- `desmontado-movil.png`: vista completa con emulación táctil.

## 5. Problemas encontrados y soluciones

- **Desplazamientos independientes incoherentes:** aplicar los siete vectores por separado separaría imanes, rotor, eje y bobinados de sus conjuntos. Se añadieron agrupaciones y etapas basadas en los IDs existentes.
- **Superposición visual desde la cámara inicial:** el estator quedaba detrás de la carcasa aunque ya estuviera separado espacialmente. Se ajustó su desplazamiento lateral final, conservando la extracción axial previa.
- **Capas transparentes:** superponer tapas, nervaduras y envolvente complicaría el orden visual. Mientras la carcasa es translúcida se utiliza una sola envolvente frontal, sin escribir profundidad; los demás detalles exteriores se ocultan. La interfaz explica esta simplificación. No se modifican sus geometrías.
- **Visibilidad al cambiar de componente aislado:** una carcasa previamente oculta podía quedar invisible al seleccionarla en aislamiento. Ahora se restablece su opacidad en ese caso.
- **Restauración después de 2D:** los comandos anteriores de cámara no se repiten al montar otra vez la escena; el encuadre se calcula con la separación conservada.
- **Controles sobre piezas en móvil:** se trasladaron debajo del visor.

Continúa la limitación documentada en la Fase 1B: `bun run preview` no es la vía validada para este proyecto, por la diferencia entre la entrada que espera TanStack y la salida Cloudflare. No se cambió la configuración compartida.

## 6. Mejoras recomendadas para evaluar después de la revisión

- Medir fluidez, batería y memoria en teléfonos Android/iOS reales de gama media.
- Revisar con un especialista la secuencia didáctica y añadir explicaciones de las uniones cuando se amplíe el alcance.
- Evaluar líneas guía o etiquetas espaciales para relacionar conjuntos separados, sin añadirlas en esta fase.
- Comprobar Safari y Firefox, además de Chrome.
- Confirmar las automatizaciones de publicación de GitHub/Lovable antes de autorizar cualquier push futuro.

## 7. Apertura y estado de Git

Abrir [laboratorio local](http://127.0.0.1:5173/laboratorio/motor-electrico) mientras esté activo el servidor. La dirección solo corresponde a este equipo. Si ya está abierto, recargar la pestaña.

Para iniciar desde la raíz del repositorio:

```sh
bun run dev --host 127.0.0.1 --port 5173
```

Se usa el mismo runtime local de Bun indicado en el informe de Fase 1B; no se instaló globalmente. Para repetir las verificaciones:

```sh
bun test tests
bun x tsc --noEmit
bun x eslint src/features/ev-lab tests
bun run build
node scripts/test-lab-assembly-browser.mjs
```

El último comando requiere el servidor de desarrollo, Playwright y un navegador. Se utilizaron los runtimes existentes mediante `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE` y `LAB_ARTIFACT_DIR`, sin agregar dependencias al producto.

Estado final:

- Rama local: `feature/ev-interactive-lab`.
- HEAD local: `65d89be2e5567641b969c762f236c16931083eac`, checkpoint de Fase 1B.
- Fase 2: seis archivos modificados y seis nuevos, sin preparar ni confirmar.
- `main` remota y rama remota de desarrollo conservan `79ecbd55439fc48a0fa5955045525c7f8bd4f3da`.
- Destino de push local protegido: `disabled://local-only`.

**No se hizo push, publicación, despliegue, PR ni merge. No se modificaron main, la portada, las guías, la navegación pública ni Lovable.** Tampoco se modificaron los archivos sincronizados de `sources/`.

La Fase 2 se entrega para revisión. No se inició la siguiente fase.
