# EV Interactive Lab — Fase 5B

Implementación local sobre feature/ev-interactive-lab. Recuperación de la Fase 4: ad7e72e36d1959db1cbc8818293ae67bc41aa85c. No se agregan funciones, geometrías, controles ni ecuaciones.

## Visibilidad y tiempo

IntersectionObserver observa la superficie existente del visor. Si el navegador agrupa avisos de entrada y salida durante un desplazamiento rápido, se usa el más reciente para evitar un estado de visibilidad obsoleto. Cuando sale completamente de pantalla en modo 3D, usePlayback cancela su RAF y conserva fase e intención de reproducción. Al volver, crea una referencia temporal nueva: no acumula el tiempo invisible ni salta de posición. El estado existente indica la suspensión por visibilidad. La pausa manual, el desmontaje, el cambio de modo y la pérdida de WebGL mantienen prioridad; no se reanuda una reproducción detenida por esas acciones. La selección, cámara y escenarios no se restablecen. La alternativa 2D conserva sus señales independientes de la visibilidad del visor. Sin IntersectionObserver se conserva el comportamiento anterior.

## Ciclo de vida de Three r186

1. OrbitControls obtiene getRootNode() al conectar y nuevamente al desconectar. Si R3F ya retiró el canvas, puede retirar el evento del nodo equivocado. disposeControls conserva la raíz original y retira únicamente los handlers de esa instancia, además del dispose público.
2. La textura DFG_LUT es una caché compartida válida. En Three 0.186.1 conserva callbacks onTextureDispose de renderizadores desmontados. manageRendererLifetime captura el callback que registra cada renderizador durante su primera subida síncrona y lo ejecuta antes de su dispose. Se libera su asignación y su listener, sin emitir dispose sobre la textura compartida. Las funciones de render y properties.get se restauran tras la captura; no se envuelve el render permanente.

Ambos adaptadores usan detalles internos acotados de la versión fijada. Deben revisarse al actualizar Three. La prueba de dos renderizadores concurrentes comprueba que cerrar uno no destruye la textura ni interrumpe al otro. No se cambia node_modules ni se eliminan cachés compartidas.

## Calidad y trabajo por frame

La política conservadora usa el puntero primario coarse o capacidad CPU/RAM baja conocida. No usa ancho de ventana. Mantiene DPR 1 sin antialias en el perfil limitado y la calidad anterior DPR 1–1,5 con antialias en escritorio capaz. Los indicios desconocidos no se interpretan como RAM/CPU nulas. Es una heurística por verificar en hardware real, no una detección de GPU.

El perfil identificó gráficas y formato numérico repetidos durante el giro. Las tres vistas de gráficas usan memo con sus parámetros existentes; Intl.NumberFormat se reutiliza. No se cambian sus ecuaciones, series, aspecto ni geometrías. El resto de la animación se mantiene.

## Pruebas y evidencia

Se añaden regresiones para limpieza de eventos con Control pulsado, pausa y retorno por visibilidad, prioridad de pausa manual/modos, escenarios, señales 2D, recuperación WebGL, DPR en ambas orientaciones y supervivencia de dos renderizadores con LUT compartida. Las pruebas existentes que esperan movimiento llevan primero el visor a pantalla. Los artefactos y perfiles se guardan fuera del repositorio, en la carpeta hermana ev-lab-optimizacion-fase-5b-2026-10-20. El informe de mediciones y sus limitaciones está en informe-fase-5b.md de esa carpeta. La evidencia de Fase 5A se conserva.

No se publica ni se integra el laboratorio en la navegación. Android/iPhone físicos y consumo térmico/energético permanecen pendientes.
