# Optimización del motor (juego-arena/index.html)

Motor real: **three.js** (módulo único, EffectComposer con bloom/SMAA, GLTFLoader sin Draco/KTX2/Meshopt), mapa por `mapa.json` + `modelos/catalogo.json`. Ya tenía: resolución dinámica (`ajustaDPR`), instancing de árboles/postes, LOD solo de edificios (THREE.LOD con todos los niveles cargados al inicio).

## Qué se hizo (sin tocar la geometría de Blender ni las posiciones del mapa)

| Sistema | Dónde | Qué hace |
|---|---|---|
| **LODManager** (`LODM`) | antes del bloque de edificios | Un solo nivel visible por edificio, elegido por la distancia al **borde de su huella** (no al centro), con histéresis (±8 %), sesgo por velocidad (+25 % a 40 m/s) y multiplicador de calidad. Los GLB de cada nivel se cargan **bajo demanda** (máx. 2 a la vez, los más cercanos primero); se parte del nivel más ligero. Los niveles sin uso 20 s se quitan de la escena y, si ningún edificio los usa, se liberan (`dispose` de geometrías, materiales y texturas). |
| **Reducción de texturas por nivel** | `LODM.reducir` | Al cargar: nivel 0 tope 2048, nivel 1 → 1024, nivel 2 → 512 (× perfil de calidad). Nunca amplía. El coche se carga con tope 4096 × calidad (alta/ultra no cambian nada). |
| **Perfiles de calidad** | `CAL` (`?calidad=ultra\|alta\|media\|baja`, **F4** rota y se recuerda) | `lod` (distancias ×1.7 / 1 / 0.7 / 0.45), `tex` (tope de texturas), `sombra` (resolución del mapa de sombras), `dpr` (resolución máxima, al recargar). No cambian geometría ni colisiones. Por defecto: alta (= comportamiento visual anterior). |
| **PerformanceMonitor** | `PERF`, `perfResumen()` | Percentiles de tiempo de cuadro (p50/p95/p99/máx), nº de tirones > 33 ms, CPU por cuadro, llamadas, triángulos, geometrías, texturas, heap JS. `JUEGO.perf()`; **F3** (o `?perf`) muestra el panel; `JUEGO.perfTex()` estima la memoria de texturas. |
| **Catálogo** | `modelos/catalogo.json` | Edificio Comercial JAC usa los LOD optimizados del agente de Blender (`edificio_comercial_opt_*.glb`, desde 0 / 200 / 450 m según su manifest) y su colisión de 9 volúmenes convexos (antes: cajas de 5 m sobre la huella). Los demás edificios mantienen sus LOD actuales. |

## Menú de pausa (Esc > Opciones)

Esc abre un menú que pausa la simulación: Continuar, Opciones (distancia de renderizado 150–1400 m, 560 m por defecto, y calidad ultra/alta/media/baja) y Volver. La distancia multiplica la niebla (visibilidad), `camera.far`, las distancias de LOD de los edificios y el recorte de detalles pequeños; se recuerda en `localStorage.jacDist`.

## Precarga (pantalla de carga)

La pantalla de carga avanza con lo que realmente se lee (tareas con peso en MB aprox.): entorno HDR, texturas del mundo, carro, conductor y, por cada modelo usado en el mapa, su nivel más ligero y el que toca en el punto de salida (peso medido con una petición HEAD y progreso por bytes). Después las texturas se suben a la GPU (hasta 14 ms por cuadro) y se espera a que cada edificio muestre su nivel; solo entonces se muestra el juego (con un tope de 180 s por si algo falla). Nada de `editor/` entra en la carga: solo se leen los modelos que el mapa usa; `catalogo.json` se lee únicamente para resolver sus archivos. Pruebas sin GPU: `?sinrender=1` (no dibuja, la lógica de carga corre igual).

Errores corregidos durante esta tarea: (1) un nivel recién leído se liberaba antes de que su edificio lo usara y se volvía a pedir sin fin (bucle de carga/descarga); (2) `compileAsync` sobre un modelo suelto lanzaba una excepción: se quitó (los shaders iguales se reutilizan).

## Mediciones reales (mismo mapa `mapa_recuperado.json`, Chrome headless con SwiftShader)

SwiftShader es render por software: **los FPS y tiempos de cuadro de esta máquina de pruebas no son representativos** y no se reportan como rendimiento del juego. Sí son válidos el nº de llamadas, triángulos y la memoria estimada.

| Medida (a los ~70 s del arranque, posición inicial) | Antes | Después (calidad alta) |
|---|---|---|
| Memoria estimada de texturas (suma de imágenes + mipmaps) | 4 067 MB | 2 099 MB |
| Heap JS | 481 MB | 196 MB |
| Texturas únicas | 319 | 183 |
| Geometrías | 459 | 368 |
| Llamadas de dibujo por cuadro (incl. pasadas de sombra) | 639 | 650 |
| Triángulos por cuadro | 4.29 M | 4.29 M |

Los triángulos y llamadas no bajan en la posición inicial porque casi todos los edificios están cerca y siguen en LOD0: la mejora medida es de **memoria**. Perfiles (a los 60 s): media ≈ 1 257 MB de texturas, baja ≈ 701 MB (la carga es asíncrona; los tiempos de SwiftShader hacen que no todas las cargas hayan terminado, así que son cifras orientativas).

Lo que aún pesa (medido): 3 texturas 4096² del coche = 256 MB y ~67 texturas 2048² = 1 408 MB (los LOD0 de los edificios).

## Lo que NO se ha hecho (y por qué)

- **Sectores/streaming de las 4 manzanas, occlusion culling, instancing de semáforos, LOD de físicas y peatones**: el mundo es pequeño y el coste dominante medido es la memoria de texturas de los modelos, no la geometría del mapa; el frustum culling de three.js ya está activo. Los semáforos necesitan lentes propias por instancia (grupos de turnos), así que no se instancian.
- **KTX2 / Meshopt / Draco**: el cargador no tiene decodificadores configurados; hace falta añadir `KTX2Loader`/`MeshoptDecoder` (dependencias) y que el agente de Blender exporte con esos formatos.
- **Lectura de `manifest.json`**: el catálogo se alimenta a mano desde los manifests (rutas y distancias); falta un lector automático y validación de dimensiones.
- **Medición de FPS/percentiles al conducir entre sectores en un equipo real**: hay que ejecutar el recorrido con una GPU real (F3 muestra los percentiles).
- **Rendimiento del vehículo** (`arena.glb`: 1.26 M triángulos, 499 MB de texturas según la auditoría de Blender): pendiente de su `.blend` fuente.
- Error ya existente (antes de estos cambios): `computeBoundingSphere ... NaN` en consola, de una geometría del mapa; no se ha investigado.

Copias previas: `index.pre-motor.html` (antes de LOD/calidad) e `index.pre-precarga.html` (antes de la precarga y de quitar el panel de controles). El panel de controles de la derecha ya no existe.
