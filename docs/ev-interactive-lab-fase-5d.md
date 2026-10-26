# PURA CORRIENTE — EV Interactive Lab
# Fase 5D: cierre técnico del motor PMSM educativo

Fecha: 26 de octubre de 2026, America/Mexico_City. Alcance: cierre local de la primera versión educativa; no integración ni publicación. Este documento registra hallazgos verificados en código/pruebas, observaciones físicas comunicadas por el usuario y recomendaciones futuras, distinguiéndolos expresamente.

## 1. Funcionalidades terminadas y preservadas

- Motor PMSM procedimental genérico: siete componentes educativos, 65 mallas del modelo y proporciones/pivotes preservados; no representa un vehículo comercial ni dimensiones de fabricación.
- Cámara orbital, zoom, selección por componente/pieza, explicaciones y restablecimiento de vista; soporte de controles táctiles y teclado.
- Separación progresiva 0–100%, detener/reanudar y ensamblar. Rotor/eje/imanes conservan su relación de conjunto; las transformaciones no alteran la geometría original.
- Transparencia de carcasa, aislamiento y Mostrar todo; esquema 2D disponible sin WebGL2 o ante pérdida de contexto.
- Animación del conjunto móvil, corrientes normalizadas con desfase de 120° eléctricos y marcadores angulares educativos; reproducción, pausa, reset y velocidad visual. No son líneas de flujo calculadas ni resolución electromagnética industrial.
- Simulación estacionaria: velocidad, torque, eficiencia supuesta, potencia mecánica/eléctrica y pérdidas, comparación A/B y gráficas existentes. kW y hp son potencia; kWh es energía y no una conversión directa de hp. Se conservan las relaciones matemáticas, límites y advertencias.
- SSR con contenido educativo sin canvas, carga de escena solo en cliente tras detección WebGL2, error boundary y alternativa 2D.
- Render por demanda en reposo, pausa fuera del visor 3D con conservación de fase, política gráfica conservadora y limpieza por instancia de controles/renderizador.

No se cambian componentes, modelos, ecuaciones, controles, estilos, contenidos ni comportamiento de producto en 5D. No se añaden animaciones ni simulaciones avanzadas.

## 2. Pruebas físicas: observación del usuario

La fuente de esta evidencia es la confirmación directa incluida en la solicitud de Fase 5D. El agente no instrumentó ni observó por sí mismo los diez minutos en cada teléfono. No se registró una duración exacta ni las versiones de SO/navegador.

| Dispositivo físico | Navegador informado | Duración informada | Resultado comunicado |
|---|---|---|---|
| Apple iPhone 15 Plus | Safari | Más de diez minutos continuos | Sin problemas observados por el usuario en animaciones y funcionamiento general |
| Samsung Galaxy S25 FE | Chrome | Más de diez minutos continuos | Sin problemas observados por el usuario en animaciones y funcionamiento general |

Es una validación funcional observada, no certificación de rendimiento ni ejecución instrumentada de todos los pasos del checklist. No se infiere que el usuario midió cada control, perdió WebGL a propósito o realizó 100 alternancias. El registro estructurado está en physical-tests.json. La foto del Samsung recibida previamente muestra la portada y no se presenta como prueba visual del motor en movimiento.

| Métrica física | iPhone | Samsung |
|---|---|---|
| FPS sostenidos / tiempos de frame | NO MEDIDAS | NO MEDIDAS |
| Heap JS y tendencias de memoria | NO MEDIDAS | NO MEDIDAS |
| VRAM / utilización GPU / CPU | NO MEDIDAS | NO MEDIDAS |
| Potencia o consumo energético | NO MEDIDAS | NO MEDIDAS |
| Batería y temperatura | NO MEDIDAS | NO MEDIDAS |
| Carga inicial educativa / 3D interactivo | NO MEDIDAS | NO MEDIDAS |
| Carga en 4G razonable | NO MEDIDAS | NO MEDIDAS |

Objetivos de 30 FPS sostenidos y carga interactiva <5 s en 4G continúan pendientes de medición. Las sensaciones de fluidez no se convierten en FPS; Wi-Fi local no equivale a 4G.

## 3. Cierre de acceso LAN

Verificación inicial: PID 95542 escuchaba en la IP local de la prueba en el puerto 4173 y su comando coincidía exactamente con el runner externo creado para Fase 5C. Se ejecutó el helper stop-preview.mjs documentado, que comprueba el comando del PID antes de enviar SIGTERM. El proceso y su runtime local se cerraron; lsof dejó de mostrar listener en 4173. No se detuvieron procesos ajenos ni se modificaron firewall, router o interfaces.

Para la regresión posterior se usaron únicamente 127.0.0.1:5173 (desarrollo) y 127.0.0.1:4183 (compilación Cloudflare local). El puerto 4173 no se reabrió. Al terminar también se cerraron esos dos servidores de validación y se repitió la comprobación de sockets. No se conserva un enlace LAN activo. Una página ya cargada en el teléfono podría seguir funcionando desde memoria: cerrar también sus pestañas.

Evidencia: cierre LAN y comprobación final de puertos.

## 4. Regresión final ejecutada

Entorno automatizado: Mac, Chrome 155.0.8059.85, herramientas locales existentes, sin instalaciones ni actualizaciones. Las cinco suites históricas usan SwiftShader; las dos de rendimiento/ciclo de vida usan WebGL nativo de escritorio. Son pruebas automatizadas del Mac; las emulaciones táctiles no se reportan como teléfonos físicos.

| Verificación | Resultado nuevo de 5D |
|---|---|
| TypeScript sin emitir archivos | PASS |
| Compilación cliente/SSR con configuración original | PASS |
| ESLint acotado al laboratorio, tests y scripts test-lab | PASS |
| Pruebas unitarias | 36 PASS, 11.185 aserciones, cero fallos |
| Layout | 7/7 PASS |
| Operación electromagnética | 8/8 PASS |
| Visor general, cámara, 2D/WebGL y tacto emulado | 15/15 PASS |
| Ensamblaje y transparencia | 12/12 PASS |
| Simulación | 8/8 PASS |
| Visibilidad, eventos y política gráfica | 7/7 PASS |
| Dos renderizadores con LUT compartida | 1/1 PASS |
| Regresión de rutas en desarrollo | 20/20 PASS |
| Veinte rutas educativas compiladas | 20/20 PASS: diez guías SSR y diez HTML |
| Producción compilada en workerd local | Cuatro grupos PASS, sin pageerror |

La comprobación compilada verifica respuesta 200, H1/SSR sin canvas en HTML, ausencia del cliente Vite, hidratación 3D y ausencia de diagnóstico DEV, siete selecciones, aislamiento/Mostrar todo, separación/ensamblaje, transparencia, fase y suspensión fuera de pantalla, reanudación, kW/hp y modificación de parámetros, veinte alternancias 2D/3D y conservación de valores.

Las veinte rutas se prueban por HTTP y contenido H1 significativo; no se verifican todas las acciones de cada guía. La suite general cubre además una interacción representativa de guía. El build local Cloudflare no demuestra comportamiento del hosting remoto.

Incidencias, repeticiones y limitaciones de esta ejecución: Sin fallos ni repeticiones en la regresión final de 5D. Las siete suites suman 58 grupos PASS. No se confirmó un problema nuevo de producto. No se cambió producto para obtener un pase. La suite de layout utiliza el PNG histórico requerido con su mismo hash; no se regeneró la referencia. Las suites con labDiagnostics se ejecutaron en desarrollo, porque ese diagnóstico está deliberadamente ausente en producción. Los intentos con fixture faltante/diagnóstico de producción de 5C quedan en sus registros históricos y no se presentan como fallos nuevos de 5D.

El aviso del chunk grande y el favicon 404 son conocidos. El ESLint global no se ejecutó de nuevo ni se afirma que esté limpio; en 5B quedaron 147 errores y seis advertencias de archivos ajenos. Es una cifra histórica, no el resultado nuevo del ESLint acotado.

Registros nuevos: checks, unitarias, TypeScript, build, ESLint, suites, producción, rutas compiladas. Las capturas generadas por suites son de escritorio/emulación. No se etiquetan como capturas de un teléfono real.

## 5. Estado de optimización de memoria

Hallazgos históricos instrumentados de 5B, no mediciones físicas de 5C ni nuevas cifras de 5D:

1. OrbitControls podía intentar retirar sus handlers después de que R3F separara el canvas, usando una raíz equivocada. disposeControls conserva la raíz original y limpia solo los handlers de esa instancia además del dispose público.
2. La caché compartida DFG_LUT retenía callbacks de renderizadores desmontados. manageRendererLifetime libera únicamente la asignación/callback de cada renderer antes de su dispose; conserva la textura/caché compartida y la validez de otros visores.
3. En dos repeticiones de 100 alternancias, los nodos/eventos dejaron de crecer: de +600/+100 en la referencia a 0/0; heap de ~16,32 a ~10,01 MiB al ciclo 100. No es una meseta total de heap: persiste calentamiento del runtime; el diagnóstico adicional atribuyó el mayor crecimiento a código V8, sin crecimiento en conteos de objetos/closures entre 20 y 100 en ese ensayo.
4. La escena deja de renderizar continuamente en reposo/pausa y el reloj 3D se suspende cuando el visor sale completamente de pantalla; conserva intención/fase y no recupera de golpe el tiempo invisible. Las señales 2D mantienen su comportamiento propio. No hay una garantía universal de ausencia de fugas.
5. Política gráfica: DPR conservador y antialias según puntero/capacidad conocida, sin reducir geometrías; memoización de gráficas y reutilización de formato numérico. No se usa ancho de ventana como sustituto de capacidad GPU.

En 5D se reejecutan las regresiones de listeners/visibilidad y la prueba de dos renderizadores concurrentes. No se repite una auditoría completa de heap de cien ciclos, energía ni VRAM. Las versiones y adaptadores permanecen intactos. Al actualizar Three/R3F es obligatorio revisar esos detalles internos y repetir las pruebas; no eliminar cachés globales para simular una mejora.

Evidencia anterior preservada y con índice SHA-256: historical-evidence-index.json. Diagnóstico completo: informe 5B.

## 6. Inventario de módulos reutilizables

| Área | Entrada principal existente | Alcance y límite |
|---|---|---|
| Datos y contratos | [model.ts](../src/features/ev-lab/model.ts) | Definiciones, validación, capacidades e identificadores; asociaciones comerciales vacías. El contrato GLTF no equivale a un cargador implementado. |
| Modelo PMSM y alternativa 2D | [pmsm.ts](../src/features/ev-lab/models/pmsm.ts) | Recurso procedimental específico de esta lección; conservar proporciones, pivotes y siete conjuntos. |
| Visor y geometrías | [Viewport.tsx](../src/features/ev-lab/viewer/Viewport.tsx) | Carga cliente diferida, SSR seguro, canvas, cámara, selección, instanciación de geometrías y recuperación 2D. |
| Desmontaje y visibilidad | [exploration.ts](../src/features/ev-lab/exploration.ts) | Transformaciones puras por grupos/datos, línea temporal reversible, transparencia y aislamiento. |
| Reproducción y operación | [usePlayback.ts](../src/features/ev-lab/operation/usePlayback.ts) | Reloj reutilizable y relaciones específicas de sincronismo/trifásica claramente separadas; no FEM. |
| Cálculos y escenarios | [physics.ts](../src/features/ev-lab/simulation/physics.ts) | Cálculos SI, conversión hp, validación, A/B y presentación; modelo estacionario, no curva real de fabricante. |
| Política gráfica y ciclo de vida | [graphicsPolicy.ts](../src/features/ev-lab/viewer/graphicsPolicy.ts) | DPR conservador, pausa fuera de pantalla y liberación por instancia compatible con Three fijado. |
| Composición y educación | [Lab.tsx](../src/features/ev-lab/Lab.tsx) | Página actual, controles y contenidos; reutilizar sin duplicar geometrías ni montar varios canvas. |
| Entrada y regresiones | [laboratorio.motor-electrico.tsx](../src/routes/laboratorio.motor-electrico.tsx) | Ruta estable, metadatos, noindex/nofollow, matemáticas y cobertura de SSR/interacción/rutas existentes. |

El sistema de datos contempla modelos distintos y un contrato GLTF, pero el recurso y adaptador actuales son procedimentales. No se declara que exista un cargador GLB/GLTF listo. La lección PMSM y sus relaciones permanecen en su definición; para modelos nuevos se necesitarían datos/recursos y validaciones nuevas fuera de este cierre.

## 7. Dependencias y condiciones de integración

Versiones efectivamente instaladas y utilizadas, sin cambios en esta fase:

| Dependencia | Versión |
|---|---|
| react | 19.2.5 |
| react-dom | 19.2.5 |
| three | 0.186.1 |
| @react-three/fiber | 9.8.1 |
| @tanstack/react-router | 1.168.25 |
| @tanstack/react-start | 1.167.50 |
| vite | 7.3.2 |
| @cloudflare/vite-plugin | 1.33.1 |
| @lovable.dev/vite-tanstack-config | 1.7.0 |
| typescript | 5.9.3 |

Conservar bun.lock y compatibilidad React/R3F/Three; no actualizar como parte incidental de un enlace. WebGL2 y JavaScript son necesarios para 3D; el contenido SSR y el esquema 2D ofrecen continuidad. La frontera cliente de Viewport evita importar la escena Three durante SSR. Mantener carga diferida, un canvas activo por lección y limpieza al abandonar la ruta.

El preset Lovable ya configura React, TanStack Start/router, Tailwind, alias y deduplicación; no duplicar plugins. La entrada SSR src/server.ts y el build Cloudflare existente se conservan. En el preview local, un runner externo añade el plugin Cloudflare solo durante la ejecución de preview, porque la configuración del proyecto lo incluye únicamente en build; eso no es un cambio de configuración guardado ni un despliegue.

## 8. Git, recuperación y alcance del cierre

Rama: feature/ev-interactive-lab. Commit funcional aprobado conservado: **1ff556b506ddb5671bf34a93b0fedf186e567828**. Al comenzar no había cambios pendientes y los 158 archivos versionados se registraron con SHA-256. Al terminar las pruebas se verifica que todos conservan su contenido.

El único cambio nuevo de 5D es este documento de cierre. Se registra en un commit local documental, sin commits funcionales adicionales. Su identificador completo, estado final limpio, diff/check, refs y alcance constan en final-git.json, escrito después del commit para evitar una autorreferencia de hash. Los logs/capturas/mediciones permanecen fuera del repositorio; no se incluyen binarios pesados o cachés en Git.

No se cambia de rama, no se crea ni actualiza main, no hay push, PR, merge, fetch que actualice refs ni despliegue. El destino de push conserva disabled://local-only; las refs remotas permanecen iguales. No hay modificación de Lovable, guías, portada, dependencias ni configuraciones. Los archivos sources/ sincronizados son de solo lectura y no se alteran. Los únicos cambios de compilación son salidas/cachés ignoradas regeneradas por las herramientas existentes.

## 9. Riesgos y pendientes

- Métricas instrumentadas de ambos teléfonos y carga 4G pendientes. La observación de diez minutos valida funcionamiento general, no garantiza FPS, temperatura o batería.
- El preview de Cloudflare local sirvió el chunk 3D (~952 KB) sin Content-Encoding incluso solicitando gzip/br. No comparar su carga con el servidor gzip utilizado en 5B ni trasladar el resultado al CDN de destino. No se optimiza ni configura compresión aquí.
- Interfaces/canvas ocultos, iframes, preload o CSS global al integrar pueden alterar foco, gestos, tamaño, observador de visibilidad y limpieza. Hay que volver a probar el recorrido integrado.
- Los adaptadores de ciclo de vida dependen de Three fijado. Un cambio automático de versión por sincronización Lovable puede invalidarlos.
- La sincronización remota de Lovable y las automatizaciones de publicación no se auditan mediante la cuenta de Lovable en 5D. No se afirma que estén desactivadas. Revisarlas antes de cualquier operación remota futura expresamente autorizada.
- El recurso es genérico, no un PMSM industrial ni una ficha de motor comercial. No asociar estas proporciones, polos o cálculos a BYD/Tesla u otros vehículos.

## 10. Preparación para Fase 6: análisis, no implementación


### Hallazgos verificados en el checkout

- El motor existe en /laboratorio/motor-electrico como una página TanStack Start. La escena Three se carga solo tras hidratación y detección WebGL2. La ruta conserva robots noindex,nofollow y no tiene acceso desde la navegación principal.
- El botón de portada «Guía de Vehículo EV» abre /interactivos/tesla-model-3.html mediante un iframe modal. El nombre del botón no convierte a esa guía en un automóvil genérico.
- El índice /guias y los datos vehicleGuides describen vehículos comerciales. Hay diez rutas de guía SSR y diez interactivos HTML; se conservan.
- No se identificó en este checkout una ruta o sección dedicada al automóvil eléctrico genérico que pueda darse por destino ya existente. El archivo bateria-en-simple.html tiene título general pero usa contenido/imagen Blade BYD: tampoco debe tomarse como automóvil genérico neutral.
- modelLibrary contiene motor-pmsm-generico y vehicleModelBindings permanece vacío. El recurso avisa que no reproduce motores Tesla/BYD u otro fabricante.

### Propuesta mínima, sujeta a autorización de Fase 6

1. **Confirmar el punto de entrada genérico.** Localizar con el usuario la sección del automóvil eléctrico genérico en la versión educativa que se integrará; si está fuera de este repositorio, identificar su propietario, ruta y mecanismo de enlace. Si todavía no existe, acordar por separado el alcance de esa sección; no crear una plataforma paralela ni reutilizar una guía comercial como si fuera genérica.
2. **Añadir un único acceso contextual al motor existente** en el tema de propulsión de esa sección genérica. Texto sugerido: «Explorar un motor PMSM genérico». Mantener explicación de que es un ejemplo didáctico y que existen otras tecnologías. El usuario abre la ruta actual como página normal mediante el router del proyecto; en un sitio externo, un enlace absoluto al dominio aprobado tras la autorización de publicación correspondiente.
3. **Conservar la página y la carga bajo demanda.** Preferir navegación normal con regreso mediante historial/contexto de origen a abrir otro visor dentro del iframe modal de la portada. No duplicar Lab/Scene ni crear una segunda ruta equivalente. Comprobar que precarga de enlaces no descarga la escena 3D desde portada/guías ni mantiene un canvas oculto. No cargar Three en SSR ni añadir plugins duplicados.
4. **Definir el retorno sin promesas de persistencia nuevas.** Regresar a la sección genérica de origen con historial/posición razonables. La página actual conserva escenarios entre modos locales, pero no promete persistencia de cámara/escenarios después de desmontar toda la ruta. Si se exige persistencia entre páginas, tratarla como alcance adicional, no implementarla incidentalmente.
5. **Mantener metadatos y clasificación actuales** durante la integración local. Cualquier cambio de indexación, menú global, portada o publicación requiere alcance y aprobación explícitos. No enlazar desde fichas BYD/Tesla ni poblar VehicleModelBinding, ni copiar potencia, polos o dimensiones del ejemplo a modelos comerciales.
6. **Regresión de integración antes de publicar.** Repetir TypeScript, build cliente/SSR, ESLint acotado, unitarias, siete suites de navegador y veinte rutas; comprobar entrada desde la sección genérica y URL directa, volver/adelante, recarga profunda, ausencia de descargas 3D fuera de la lección, un solo canvas, desmontaje al salir y sin crecimiento de listeners al ir/volver repetidamente. Comprobar noindex y que las diez guías y diez HTML conservan sus URLs y acciones representativas.
7. **Validar otra vez en iPhone y Samsung desde el recorrido completo.** El pase funcional de 5C no valida automáticamente un iframe, estilos nuevos o contenedor de navegación futuro. Mantener alternativa 2D y controles táctiles. Medir FPS/red/memoria reales si hay instrumentos; no convertir el pase funcional en una garantía de rendimiento.
8. **Revisar sincronización y publicación como decisión separada.** Antes de cualquier operación remota futura, revisar branch destino, diferencias, configuración de sincronización Lovable y automatizaciones/deploy. El estado remoto de esos controles no está auditado mediante la cuenta de Lovable en esta fase. No suponer que un push a una rama es inocuo por el solo nombre de la rama. Mantener recuperación y reversión del enlace sin tocar el módulo del motor.

### Condiciones técnicas y riesgos

- Conservar React/ReactDOM 19.2.5, R3F 9.8.1 y Three 0.186.1 del entorno validado y respetar bun.lock. No instalar ni actualizar dependencias como parte incidental de añadir el enlace.
- Los adaptadores de limpieza de Three usan detalles internos acotados; cualquier actualización requiere repetir la prueba de dos renderizadores y las alternancias con eventos. No destruir DFG_LUT global ni cachés compartidas para forzar una meseta de memoria.
- Conservar el wrapper src/server.ts y la configuración TanStack/Cloudflare; el preset Lovable ya incluye plugins de React, router, Tailwind, deduplicación y compilación Cloudflare. Añadirlos otra vez puede romper build/SSR.
- El preview local con workerd no es un despliegue Cloudflare/Lovable real; el código servido localmente no reproduce TLS/CDN/compresión del hosting. El chunk 3D ronda 0,95 MB sin compresión. Acordar y medir el presupuesto de carga en el destino antes de prometer <5 s en 4G.
- CSS lab.css usa clases lab-*; confirmar en integración que estilos globales y contenedores no cambien dimensiones, scroll, controles, foco, gestos o el observador de visibilidad. Un iframe/modal introduce además problemas de historial, foco, altura y contenido oculto: requiere validación específica si se decide ese camino.
- La política gráfica es una heurística de puntero/capacidad, no identificación exacta de GPU. WebGL2 no está garantizado en todos los navegadores/dispositivos; mantener contenido SSR, límite de error y alternativa 2D.
- No atribuir inmunidad a fugas universal, FPS sostenidos, temperatura o consumo energético a partir de los dos pases observados. Son criterios pendientes de instrumentación.

### Condición de aceptación propuesta

Un único acceso desde el contexto genérico confirmado, apertura y retorno correctos, ruta actual intacta, cero vínculos comerciales añadidos, carga 3D diferida, todos los checks anteriores satisfactorios y revisión del usuario. No se inicia esta fase ni se publica nada con este documento.


## Criterio de cierre

Regresión satisfactoria, observaciones físicas registradas con sus límites, acceso LAN y servidores de validación cerrados, código y geometrías preservados, commit local documental y Git limpio. Se detiene el trabajo después de este informe. Fase 6 requiere autorización nueva; no se integra ni publica con esta entrega.
