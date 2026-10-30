# Pura Corriente — EV Explainers — Fase 6B

Fecha: 30 de octubre de 2026, America/Mexico_City. Implementación exclusivamente local en feature/ev-interactive-lab. HEAD de referencia conservado: 95814004586d2bea43fb94545127f2528bfb9fc7. No se realiza el commit de integración; se espera aprobación visual y funcional del usuario.

## Resultado

La portada mantiene su diseño y su botón «Guía de Vehículo EV». Ese botón abre el documento existente tesla-model-3.html en un contexto educativo explícito. Al seleccionar «2 · Motor» aparecen el texto solicitado, el acceso «Explorar motor eléctrico en 3D» y la aclaración de modelo didáctico genérico. Se navega en la ventana principal al laboratorio existente y se puede regresar al mismo apartado.

No se duplica el HTML, el modelo, el canvas ni la lógica del PMSM. No se crea otra sección educativa. La imagen Tesla Model 3 permanece como referencia visual. Se mantienen las seis secciones, botones, teclado y acceso al catálogo de guías.

## Contexto y contenido

- Portada educativa: URL principal con guide=education y section limitada a bateria, motor, carga, cabina, regen o seguridad. El iframe recibe únicamente context=education; su dirección permanece estable al cambiar de sección para evitar recargarlo.
- Contexto específico: el botón de la tarjeta Tesla sigue abriendo el mismo HTML sin el parámetro educativo. Se conservan las seis explicaciones, títulos, listas, estadísticas y citas del documento original y no aparece el acceso genérico.
- Se verifica además por SHA-256 que la definición SECTIONS de datos comerciales es idéntica a la referencia. No se verifican ni corrigen esas cifras comerciales en esta fase.
- En contexto educativo, se presentan explicaciones generales de los seis sistemas y se conservan los datos particulares dentro de desplegables «Ejemplo particular: Tesla Model 3 · no universal». Las cuatro cifras inferiores también se etiquetan como datos del vehículo ilustrado. No se atribuye PMSM a todos los EV ni se identifica el modelo genérico como motor real de Tesla.
- La ruta /guias/tesla-model-3, su componente y los datos vehicleGuides permanecen intactos.

## Comunicación y seguridad

El HTML informa ready, section y open-lab mediante postMessage. El contenedor comprueba que event.origin coincide con el origen actual, que event.source es la ventana del iframe montado, que el canal es pura-ev-guide-v1 y que tipo/sección son reconocidos. open-lab solo se admite desde Motor. El destino se fija en el contenedor: /laboratorio/motor-electrico?from=ev-guide. No se acepta un destino enviado por el documento.

La restauración en sentido contrario también verifica origen, ventana padre, canal y sección. Las coordenadas guardadas se normalizan a números finitos y acotados; el foco solo admite identificadores previstos. Estas comprobaciones delimitan la comunicación entre documentos; no son un sistema de autenticación ni una defensa frente a scripts que ya controlasen toda la aplicación del mismo origen.

## Historial, scroll y foco

- Abrir la guía y cambiar de sistema reemplaza el contexto de la entrada de portada, sin crear una entrada por cada botón del iframe.
- Entrar al laboratorio añade una navegación principal y desmonta el modal/iframe. Solo existe el canvas actual del laboratorio.
- El enlace contextual vive en la envoltura de la ruta, fuera de src/features/ev-lab. Si hay una entrada de origen creada por la aplicación, vuelve con Atrás; en un enlace contextual directo sin esa entrada usa la portada educativa/Motor como destino fijo con replace.
- Recarga, Atrás y Adelante conservan el contexto reconocido por URL. Sin from=ev-guide, el laboratorio no muestra el nuevo retorno y conserva su navegación previa al catálogo. Una procedencia no reconocida no genera redirecciones.
- sessionStorage guarda sección, scroll del iframe/portada y objetivo de foco. Se verifica el regreso desde 120 px de scroll de portada y la posición real del iframe. La restauración espera a que el iframe y la imagen estén preparados, y devuelve el foco al acceso del motor.
- Si el almacenamiento no está disponible o el enlace se abre en otra sesión, la URL permite recuperar Motor, pero no garantiza el scroll previo. No se promete persistencia de cámara o escenarios después de desmontar el laboratorio.
- El modal conserva el bloqueo/restauración del scroll. Escape desde el documento cierra el modal, el tabulador recorre los controles del HTML Tesla y el botón Cerrar, y al cerrar se devuelve el foco al control de origen o al botón educativo.
- El portal espera al montaje cliente para mantener iguales el SSR inicial y la hidratación.

## Archivos modificados y creados

| Archivo | Estado | Propósito |
|---|---|---|
| [src/routes/index.tsx](../src/routes/index.tsx) | Modificado | Contexto educativo, navegación y composición con modal reutilizado. Conserva clases y contenidos de portada; se normaliza formato con Prettier al intervenir el archivo. |
| [public/interactivos/tesla-model-3.html](../public/interactivos/tesla-model-3.html) | Modificado | Contexto educativo, explicación/CTA de Motor, aclaraciones, comunicación y restauración. Mantiene los datos específicos originales. |
| [src/routes/laboratorio.motor-electrico.tsx](../src/routes/laboratorio.motor-electrico.tsx) | Modificado | Procedencia validada y retorno contextual exterior; el componente Lab no se modifica. |
| [src/components/EvGuideModal.tsx](../src/components/EvGuideModal.tsx) | Nuevo | Extracción del modal existente, ciclo de scroll/foco y comunicación validada. Se reutiliza para las aperturas previas. |
| [src/lib/ev-guide-context.ts](../src/lib/ev-guide-context.ts) | Nuevo | Listas permitidas, validadores y almacenamiento temporal acotado. |
| [tests/ev-guide-context.test.ts](../tests/ev-guide-context.test.ts) | Nuevo | Cuatro pruebas de límites de contexto, sección, origen y restauración. |
| [scripts/test-ev-guide-integration-browser.mjs](../scripts/test-ev-guide-integration-browser.mjs) | Nuevo | Recorrido educativo/específico, historial, seguridad, scroll/foco, ciclo de vida, móvil y capturas. |
| [docs/ev-explainers-fase-6b.md](ev-explainers-fase-6b.md) | Nuevo | Este informe local pendiente de revisión. |

No se modifica ningún archivo de src/features/ev-lab/**, ninguna geometría ni cálculo, configuración, dependencia, bun.lock, guía React comercial o contenido de otros HTML. Las comprobaciones de integridad y el estado exacto están en final-state.json.

## Pruebas ejecutadas

Referencia inicial: Git limpio en el SHA indicado, TypeScript PASS y 36 pruebas unitarias PASS antes de editar. Se conserva el manifiesto SHA-256 inicial.

| Comprobación final | Resultado |
|---|---|
| TypeScript | PASS |
| Compilación cliente/SSR con configuración Cloudflare original | PASS |
| ESLint acotado a laboratorio, archivos TS/TSX intervenidos, tests y scripts | PASS |
| Unitarias | 40 PASS, 0 fallos, 11.204 aserciones; incluyen las 36 anteriores y 4 nuevas |
| Siete suites históricas de navegador | 58/58 grupos PASS, sin modificar las suites existentes |
| Nuevas pruebas de integración, desarrollo | 12 grupos PASS |
| Nuevas pruebas de integración, producción Cloudflare local | Los mismos 12 grupos PASS |
| Veinte rutas educativas compiladas | 20/20 PASS, diez SSR y diez HTML |

Total de cobertura de navegador: 70 grupos distintos: 58 existentes + 12 nuevos. La repetición de los doce grupos en producción se informa como una segunda ejecución, no como doce casos distintos adicionales.

Se cubren A–O de la solicitud: entrada educativa, Motor, acceso, navegación principal, retorno, Atrás/Adelante, recargas, acceso directo, contexto específico Tesla, seis secciones, teclado, tacto emulado, ausencia de descargas anticipadas de la escena, un solo canvas y limpieza al salir. Tres entradas/salidas consecutivas verifican ausencia de canvas residual y de acumulación de listeners de teclado del documento.

SSR y visor se comprueban tanto con las suites anteriores como en la nueva prueba sobre el build servido por el plugin Cloudflare existente/workerd local. Se mantienen noindex/nofollow y la carga Three cliente. El preview no es un despliegue Cloudflare remoto.

Entorno: Chrome 155.0.8059.85 de escritorio; la vista móvil 390×844 y el tacto son emulados. No se afirma una nueva prueba física en iPhone o Samsung ni se extrapolan FPS, consumo o memoria de esos teléfonos. Las suites históricas conservan sus condiciones de ejecución; no se reescriben para acomodar la integración.

## Incidencias y repeticiones

1. El primer recorrido móvil tocó el botón SSR antes de terminar la hidratación y expiró esperando el iframe. Un diagnóstico registró URL sin cambiar y cero diálogos. La prueba ahora espera la señal visual de montaje de la animación existente; no se añadieron retardos arbitrarios al producto.
2. Una comprobación de scroll esperaba 120 px antes de estabilizar la carga inicial. Un diagnóstico esperando hidratación confirmó almacenamiento y restauración a -120px. Se corrigió la preparación de la prueba y se ejecutó de nuevo.
3. La inspección visual detectó un solapamiento real del panel sticky con la navegación en móvil. Solo el contexto educativo bajo 960 px usa panel estático; el contexto específico conserva su CSS previo. Se añade una aserción de no solapamiento.
4. Las primeras capturas fullPage de un modal fijo incluían también partes de la portada fuera del viewport. Las capturas finales del modal muestran el viewport real. Las capturas de portada/laboratorio pueden mostrar página completa.
5. Se conservan logs de los intentos y resultados definitivos por separado. El aviso de chunk grande y el favicon 404 son conocidos. El ESLint global no se ejecutó ni se afirma limpio; el acotado sí pasó.

## Capturas finales de producción local

- Portada sin rediseño
- Guía educativa general
- Motor y acceso contextual
- Laboratorio a página completa
- Regreso a Motor con foco
- Contexto específico Tesla
- Motor en móvil emulado

Se revisaron visualmente el acceso, el retorno, el contexto específico y el móvil corregido. No se alteraron las capturas para ocultar contenido o defectos.

## Vista previa y límites

Abrir en el Mac: http://127.0.0.1:4183/

Recorrido: Guía de Vehículo EV → Motor eléctrico → Explorar motor eléctrico en 3D → Regresar a Motor. También se puede abrir directamente /?guide=education&section=motor en esa misma dirección local.

El servidor de producción escucha únicamente en loopback 127.0.0.1:4183. La vista de desarrollo temporal en 127.0.0.1:5173 se cierra al terminar las pruebas. No se reabre el acceso LAN de 5C ni se cambia firewall o red. La URL loopback no es accesible desde teléfonos externos.

El servidor se mantiene para revisión local. Los datos comerciales existentes requieren su propia verificación; no se modificaron ni se certifican aquí. La integración nueva todavía debe revisarse funcional y visualmente por el usuario, y su recorrido completo deberá volver a probarse en hardware físico si se autoriza una sesión posterior. No hay nuevas garantías de rendimiento.

## Git y publicación

Rama feature/ev-interactive-lab. HEAD permanece en 95814004586d2bea43fb94545127f2528bfb9fc7. Los tres archivos modificados y cinco nuevos quedan sin commit ni staging, pendientes de revisión. No se modifican main o refs remotas. No hay push, PR, merge, despliegue, configuración remota Lovable ni publicación manual/automática. El destino de push sigue disabled://local-only.

Las evidencias completas se conservan fuera del repositorio.

Esta entrega se detiene en Fase 6B. No se realiza el commit final ni se inicia Fase 6C hasta la autorización correspondiente.

Registros: checks, suites anteriores, integración desarrollo, integración producción, 20 rutas compiladas.
