# EV Interactive Lab — Fase 4: potencia y eficiencia

Entrega local del 19 de octubre de 2026. Recurso PMSM genérico v1.3.0.

## Preservación y alcance

Rama de trabajo: `feature/ev-interactive-lab`.

Antes de implementar se comprobaron los siete cambios pendientes de la revisión UI/UX anterior. Pasaron sus 23 pruebas unitarias (11.106 aserciones), 42 grupos de navegador, TypeScript, ESLint del laboratorio y compilación cliente/SSR. Se guardaron esos cambios en el commit local de recuperación **`a55089a8b2b1892542d389c4954d1cd2a5cc9cfa`** (`feat: preserve validated phase 3 lab UI revision`).

La Fase 4 queda sin commit, en el árbol de trabajo, para revisión. No se hicieron push, PR, merge, publicación ni cambios de Lovable. No se modificaron la página principal, la navegación, las guías, los recursos públicos ni las dependencias del producto. Los archivos sincronizados de `sources/` permanecen intactos.

Consulta de solo lectura a GitHub: tanto `main` como `feature/ev-interactive-lab` siguen apuntando a **`79ecbd55439fc48a0fa5955045525c7f8bd4f3da`**. No existe una rama local `main`; no se creó ni movió. El destino de push continúa deshabilitado (`disabled://local-only`). La rama local conserva cuatro commits de recuperación por delante de la referencia remota.

## Implementación

- Nuevo modo **Simular**, junto a Explorar y Cómo funciona; Desmontar sigue disponible en los controles del visor.
- Un único visor 3D, con las mismas geometrías, proporciones y 65 piezas. Sin geometrías duplicadas ni cambios en la escena.
- Dos escenarios independientes, A y B, editables con número o deslizador. Rangos didácticos: 0–12.000 rpm, 0–400 Nm y 50–100% de eficiencia. No son límites de fabricantes.
- Resultados inmediatos: potencia del eje en **kW y hp mecánicos**, velocidad angular, potencia eléctrica de entrada y pérdidas. rpm, torque y eficiencia permanecen visibles en los controles.
- Gráfica SVG de potencia frente a rpm con torque fijo o frente a torque con rpm fijas. Punto activo marcado. No se presenta como envolvente de prestaciones.
- Balance SVG de potencias de entrada, salida y pérdidas. Comparación desplegable A/B con tabla, barras y diferencia de potencia mecánica.
- Giro proporcional a rpm, con escalas visuales 1:400, 1:200 y 1:100. Se muestra explícitamente la equivalencia entre rpm del punto y rpm visuales.
- Se conservan selección, cámara, transparencia, aislamiento, ensamblaje y alternativa 2D. Las explicaciones siguen a la izquierda y las herramientas a la derecha; distribución vertical en móvil. El visor conserva su tamaño previo.
- Contenido educativo sobre torque, velocidad, potencia, eficiencia, pérdidas, cero velocidad, ecuaciones, ejemplo comprobable y distinción entre kW, hp y kWh.

## Ecuaciones, unidades y límites físicos

Los puntos se almacenan en SI: velocidad angular en rad/s, torque en Nm, eficiencia adimensional. Los resultados internos están en W. Solo se redondea al mostrar.

```text
ω = 2π × rpm / 60
Pm = T × ω
Pe = Pm / η
Ppérdidas = Pe − Pm
hp = Pm[W] / 745.6998715822702
```

Solo cuadrante motor: ω ≥ 0, T ≥ 0, 0 < η ≤ 1. El calculador rechaza negativos, entradas no finitas, eficiencia nula o mayor que uno y desbordamiento de resultados. El rango de eficiencia de la interfaz es más limitado que el dominio de las ecuaciones, por elección didáctica.

Ejemplo inicial A: 3000 rpm, 150 Nm, η = 0,90. ω ≈ 314,1593 rad/s; Pm ≈ 47,12389 kW ≈ 63,19418 hp; Pe ≈ 52,35988 kW; pérdidas ≈ 5,23599 kW. B inicia en 6000 rpm, 100 Nm y 92%.

La equivalencia utiliza el horsepower **mecánico** (550 ft·lbf/s), no el hp eléctrico de 746 W ni el caballo métrico CV/PS. **1 kW ≈ 1,3410 hp; 100 kW ≈ 134,1 hp.** kWh es energía: 100 kW constantes durante 0,5 h equivalen a 50 kWh. No hay conversión de hp a kWh sin una duración.

La eficiencia es un supuesto ajustable, no el resultado de un modelo de pérdidas. No se calcula corriente, tensión, temperatura, inercia, aceleración, regeneración, capacidad de batería, autonomía, torque máximo ni límites reales de velocidad. No se incluyen pérdidas del inversor, batería o transmisión. Las ecuaciones son coherentes para el punto prescrito; la factibilidad de ese punto en un motor real no está demostrada.

Con torque o velocidad cero, las tres potencias calculadas son cero. El modelo no representa consumo en vacío ni calentamiento a rotor detenido. La eficiencia escogida no es una medición del cociente 0/0.

La animación mueve rotor, eje, ocho imanes y dos pistas interiores; las otras 53 piezas permanecen fijas. El torque no se usa como aceleración. La escala temporal no cambia los cálculos. La protección existente limita los saltos de tiempo por cuadro; en equipos lentos la animación puede avanzar más despacio, por lo que no sirve para medir rendimiento real.

Fuentes primarias:

- [OpenStax: trabajo y potencia de rotación](https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion).
- [NIST SP 811, Appendix B.8: factores de conversión](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8).

## Transiciones y recuperación

| Acción                             | Resultado                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Explorar / Cómo funciona / Simular | Pausa inmediatamente; conserva escenarios, posición angular y ajustes de exploración.                              |
| Desmontar o mover separación       | Pausa el giro. Solo permite iniciarlo de nuevo ensamblado al 0%. Los cálculos siguen disponibles.                  |
| Cambiar rpm                        | Cambia la velocidad visual proporcionalmente, sin saltar la posición angular. A 0 rpm pausa y deshabilita Iniciar. |
| Cambiar torque o eficiencia        | Actualiza cálculos y gráficas, sin alterar la velocidad de giro.                                                   |
| Cambiar A/B                        | Cambia el punto activo, conservando ambos escenarios. Si está girando, adopta las rpm del nuevo punto.             |
| Esquema 2D o pérdida de WebGL      | Conserva cálculos y selección; no anima el esquema de piezas.                                                      |
| Reiniciar giro                     | Pausa y devuelve el ángulo a cero, sin borrar escenarios ni exploración.                                           |
| Restablecer vista                  | Recupera cámara, ensamblaje, opacidad, selección, aislamiento y ángulo; conserva escenarios.                       |
| Restablecer escenarios             | Recupera A/B, escala temporal y eje de gráfica iniciales; reinicia y pausa el giro. Conserva exploración.          |

Los controles numéricos muestran un error para una entrada fuera del rango y mantienen el último cálculo válido. Al salir del campo recuperan ese valor válido. El estado se conserva durante la sesión montada; no se guarda entre recargas de página.

## Arquitectura y archivos

Archivos creados bajo `src/features/ev-lab/simulation/`:

| Archivo                 | Responsabilidad                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `physics.ts`            | Ecuaciones puras SI, conversiones rpm/hp, comparación y escala visual. Sin React ni Three.js. |
| `definition.ts`         | Contrato, rangos y escenarios ilustrativos; verificación de pertenencia al rango.             |
| `useSimulation.ts`      | Estado de escenarios, selección activa, escala y eje de gráfica.                              |
| `ParameterControl.tsx`  | Entrada numérica y deslizador accesibles, validación de borrador.                             |
| `SimulationPanel.tsx`   | Controles, resultados y reproducción.                                                         |
| `Charts.tsx`            | Tres visualizaciones ligeras con SVG y tabla accesible.                                       |
| `SimulationLessons.tsx` | Explicaciones, ejemplo, alcance y fuentes.                                                    |

Otros archivos creados:

- `tests/ev-lab-simulation.test.ts`: nueve pruebas nuevas de física, equivalencias, validación, comparación, rangos y escala temporal.
- `scripts/test-lab-simulation-browser.mjs`: ocho grupos de interacción y capturas en escritorio/móvil emulado.
- `scripts/test-lab-routes.mjs`: regresión HTTP/SSR de las veinte rutas educativas.
- `docs/ev-interactive-lab-fase-4.md`: este informe.

Archivos modificados:

- `src/features/ev-lab/Lab.tsx`: integración y reglas de transición; reutiliza el visor.
- `src/features/ev-lab/lab.css`: estilos locales del nuevo panel y selector de modos.
- `src/features/ev-lab/model.ts`: definición opcional de simulación y validación del contrato.
- `src/features/ev-lab/models/pmsm.ts`: habilitación del recurso didáctico y versión; sin alterar geometrías.
- `src/features/ev-lab/operation/usePlayback.ts`: parámetro opcional de escala para compartir reproducción sin perder la velocidad elegida en Cómo funciona.
- `tests/ev-lab.test.ts` y `tests/ev-lab-operation.test.ts`: expectativa de capacidad de simulación ahora habilitada.

## Validación y evidencias

| Verificación final | Resultado |
| --- | --- |
| Unitarias (4 archivos) | 32 aprobadas; 11.179 aserciones; cero fallos. |
| Navegador de fases anteriores | 42 grupos aprobados. |
| Navegador de simulación | 8 grupos aprobados; cero errores funcionales o de hidratación. |
| Rutas educativas HTTP/SSR | 20/20 con respuesta 200 y contenido educativo. |
| TypeScript | Sin errores. |
| ESLint | Sin errores en laboratorio, pruebas y scripts nuevos. |
| Compilación | Cliente y servidor correctos; advertencia previa del bloque 3D. |
| Geometría | 65 piezas, 30.496 triángulos físicos; no se modificó la geometría. |

Los resultados y capturas están fuera del repositorio, en `../ev-lab-validation-phase4/`. El runtime de Bun que usaban las pruebas anteriores había desaparecido de la carpeta temporal; se recuperó la misma versión oficial 1.4.3 desde npm, verificando SHA-512 y guardándola en la carpeta de evidencias. No se cambiaron paquetes ni archivos de bloqueo del proyecto.

Las pruebas automatizadas verifican los resultados conocidos, límites, cero, eficiencia inválida, hp, comparación, movimientos del conjunto, controles, conservación entre modos, alternativa 2D, falta de WebGL, interacción táctil y tamaños del visor. La regresión HTTP comprueba 10 guías React con contenido SSR y 10 interactivos HTML. Las suites de fases anteriores comprueban además hidratación, selección mediante raycasting, cámara, señales trifásicas, desmontaje y distribución adaptable.

Incidencias resueltas durante la validación:

- La pausa al cambiar de modo se trasladó a la propia acción del botón para que sea inmediata, manteniendo el efecto defensivo.
- Una expectativa inicial de la prueba móvil usaba la altura de tablet (460 px). Se corrigió para comparar con el tamaño real del visor antes de activar Simular: 350 px en el ancho móvil existente. No se cambió el tamaño del visor.

Incidencias preexistentes y limitaciones:

- El sitio no tiene `favicon.ico`: Chrome registra un 404 de ese recurso global. Se informa por separado de los errores funcionales; no se modificó la cabecera general ni se ocultaron otros errores.
- La compilación advierte del tamaño del bloque 3D, ya existente. No se añadieron dependencias ni geometrías.
- Pruebas de navegador en Chrome con SwiftShader y emulación táctil de 390×844. No se probó un teléfono físico ni se certificó Safari móvil.

## Revisión local

Abrir [el laboratorio local](http://127.0.0.1:5173/laboratorio/motor-electrico), pulsar **Simular**, cambiar rpm/torque/eficiencia y usar A/B para comparar. Para observar el rotor, aumentar transparencia y pulsar Iniciar. El servidor local debe estar activo; esta URL no es pública.

Mejoras propuestas para una futura fase, pendientes de autorización: pruebas en teléfonos físicos y Safari; revisión pedagógica con usuarios; incorporación de curvas medidas únicamente con fuentes verificables y un contrato adicional de datos; evaluación de carga diferida del panel si crece. No se implementaron estas mejoras ni se avanzó a otra fase.

## Capturas y estado exacto de Git

- Escritorio completo
- Escritorio: visor y resultados
- Móvil completo
- Móvil: panel
- Comparación A/B

Estado final: 7 archivos rastreados modificados y 11 archivos nuevos sin seguimiento; ningún cambio preparado en el índice. HEAD sigue en el punto de recuperación `a55089a8b2b1892542d389c4954d1cd2a5cc9cfa`.

```text
 M src/features/ev-lab/Lab.tsx
 M src/features/ev-lab/lab.css
 M src/features/ev-lab/model.ts
 M src/features/ev-lab/models/pmsm.ts
 M src/features/ev-lab/operation/usePlayback.ts
 M tests/ev-lab-operation.test.ts
 M tests/ev-lab.test.ts
?? docs/ev-interactive-lab-fase-4.md
?? scripts/test-lab-routes.mjs
?? scripts/test-lab-simulation-browser.mjs
?? src/features/ev-lab/simulation/Charts.tsx
?? src/features/ev-lab/simulation/ParameterControl.tsx
?? src/features/ev-lab/simulation/SimulationLessons.tsx
?? src/features/ev-lab/simulation/SimulationPanel.tsx
?? src/features/ev-lab/simulation/definition.ts
?? src/features/ev-lab/simulation/physics.ts
?? src/features/ev-lab/simulation/useSimulation.ts
?? tests/ev-lab-simulation.test.ts
```
