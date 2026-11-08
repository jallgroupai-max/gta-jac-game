# Formato del mapa (`mapa.json`, versión 1)

Contrato entre el **editor** (`editor/index.html`) y el **juego** (`index.html`). Todo en **metros**.
Ejes: **x → este**, **z → sur** (en el editor el norte queda ARRIBA, así que z crece hacia abajo de la pantalla). Origen libre (0,0).
Un punto es `[x, z]`. Un polígono es una lista de puntos (sin repetir el primero al final). Una polilínea es una lista de ≥2 puntos.
Los campos que falten toman el valor por defecto indicado. Cada elemento lleva un `id` único (string) que el editor genera (`"c1"`, `"i3"`…).

```jsonc
{
  "version": 1,
  "versionMapa": "0.0.1",                         // versión del CONTENIDO del mapa "MAYOR.MENOR.PARCHE" (no confundir con `version`, que es el formato). Cada exportación a archivo del editor la sube (0.0.1 → 0.0.2…; el archivo se llama «MAPA VERSION 0.0.2.json»); si falta, el editor asume 0.0.0. El juego la ignora
  "nombre": "JAC Arena",

  "calles": [{
    "id": "c1", "nombre": "Calle Central",
    "puntos": [[99,-229],[54,40],[10,315]],      // eje de la calle (polilínea)
    "ancho": 22,                                  // m, def. 13
    "jugable": true,                              // false = calle externa: se ve pero no se puede entrar (def. true)
    "marca": "discontinua",                       // "ninguna" | "discontinua" | "continua" | "doble" | "semicontinua"  (def. "discontinua")
                                                  //   discontinua = raya amarilla de trazos; continua = 1 raya amarilla continua;
                                                  //   doble = 2 rayas amarillas continuas; semicontinua = 1 continua + 1 de trazos (se pasa por un solo lado)
    "carriles": 0,                                // nº total de carriles; >0 dibuja líneas blancas de trazos entre carriles (def. 0)
    "bordes": false,                              // línea blanca continua en cada borde (def. false)
    "separador": 0,                               // >0: hilera de concreto amarillo en el eje, de ese ancho en m (def. 0). Se interrumpe sola en los cruces
    "separadorAlto": 0.22,                        // m (def. 0.22)
    "extra": false,                               // true = pavimento extra (carril de giro, ensanche): sin marcas ni farolas y no cuenta como cruce
    "suavizar": false,                            // true = curva suave automática por los puntos (ver "Suavizado")
    "izq": [11, 11, 14],                          // opcional: semiancho del lado izquierdo en CADA vértice (m), mismo orden que `puntos`; faltante = ancho/2. Izquierdo = el lado a la izquierda al avanzar de puntos[0] a puntos[n-1] mirando el mapa con el norte arriba (para ir hacia el este, izq = norte)
    "der": [11, 11, 9],                           // ídem para el lado derecho (para ir hacia el este, der = sur). Permite mover los lados de la calle por separado; el ancho entre vértices se interpola
    "color": "gris"                               // solo para el minimapa y el editor: "gris" | "naranja" (def.: gris si jugable, naranja si no)
  }],

  "calzadaAuto": true,                           // true = el asfalto cubre TODO el interior de `zonaJugable` que no ocupen `bloques` (la calle sigue a los bordes y esquinas de las manzanas; se ven los lados editables). Los bloques deben quedar dentro de la zona. (def. true)
  "alumbrado": false,                             // postes de alumbrado a lo largo de las calles jugables (def. false = SIN postes; el campo viejo `farolas` se ignora)

  "relieve": {                                    // relieve del terreno esculpido con pincel: rejilla de alturas por trozos (solo se guardan los trozos modificados)
    "celda": 2,                                   // m entre nodos de la rejilla (def. 2)
    "tam": 32,                                    // nodos por lado de cada trozo (def. 32 → trozos de 64 m)
    "chunks": { "-3,5": "AAAA..." }               // clave "i,j" = trozo; valor = base64 de un Int16 little-endian de tam×tam alturas en CENTÍMETROS, fila por fila (z creciente) y columna (x creciente)
  },                                              // El nodo (k,l) está en x = k·celda, z = l·celda y pertenece al trozo i = floor(k/tam), j = floor(l/tam); su índice es (l − j·tam)·tam + (k − i·tam). Sin trozo = 0 m.
                                                  // Altura en (x,z): interpolación bilineal de los 4 nodos vecinos. Los trozos vecinos de uno modificado también se dibujan (con sus nodos): sin grietas.

  "terrenoBase": "mixto",                         // terreno de fondo de todo el mundo: "mixto" (césped con manchas de tierra) | "cesped" | "tierra"  (def. "mixto")

  "terrenos": [{                                  // zonas de suelo con otra textura, planas, por debajo de calles y objetos. Las posteriores de la lista tapan a las anteriores
    "id": "g1", "nombre": "Arenal",
    "puntos": [[0,0],[100,0],[100,60],[0,60]],    // polígono
    "textura": "tierra",                          // "cesped" | "tierra" | "asfalto" | "adoquin" | "concreto" | "cemento"(amarillo) | "piedras" (guijarros claros, 1,5 m) | "piedras_cafe" (guijarros marrones, 1,5 m) | "cesped_isla" (el césped claro de las islas) | "cesped_parque" (el césped de los parques)  (def. "cesped")
    "escala": 1,                                  // multiplicador del tamaño de la textura (2 = el doble de grande)  (def. 1)
    "rotacion": 0,                                // grados: gira la TEXTURA alrededor del centro del terreno (def. 0); el editor, al girar el terreno, gira también sus puntos y suma el mismo ángulo aquí
    "suavizar": false
  }],

  "edificios": [{                                 // modelos 3D colocados en el mapa (ver modelos/catalogo.json)
    "id": "e1", "nombre": "Edificio comercial",
    "modelo": "edificio-comercial-v3",            // id del catálogo `modelos/catalogo.json`
    "x": 0, "z": 0,                               // posición del ORIGEN del modelo (para este edificio: el centro de su huella), en m
    "rumbo": 180,                                 // hacia dónde mira el FRENTE del modelo, en grados de brújula (0 = norte, 90 = este, 180 = sur, 270 = oeste); def. 180
    "escala": 1,                                  // multiplicador uniforme (def. 1)
    "ancho": 21.5,                                // solo modelos `modular.libre`: ancho total en m (reemplaza a `modulos`)
    "modulos": 1,                                 // solo modelos con `modular` en el catálogo: nº de copias pegadas a lo ancho (def. 1)
    "y": 0                                        // altura de la base sobre el suelo en m (def. 0; las manzanas están a 0,15)
  }],

  "semaforos": [{                                 // GRUPOS de semáforos (edificios con modelo `semaforo:true`, p. ej. "semaforo-gantry"): trabajan juntos y dejan pasar UNA sola calle a la vez
    "id": "sg1", "nombre": "Cruce 1",
    "miembros": ["e3", "e5", "e8"],               // ids de edificios-semáforo, 2 a 4, en orden de turno: el 1.º da verde, luego el 2.º, etc.; los demás quedan en rojo (un semáforo solo en un grupo)
    "verde": 9, "ambar": 2, "despeje": 1          // s de verde y de ámbar de cada turno; `despeje` = s con todos en rojo entre turnos (def. 9 / 2 / 1)
  }],                                             // un semáforo sin grupo hace su propio ciclo (verde 9 s, ámbar 2 s, rojo 9 s)

  "macetas": [{                                   // complemento: maceta urbana de concreto (cajón abierto con tierra y palmeras areca)
    "id": "m1", "nombre": "Maceta",
    "x": 0, "z": 0,                               // centro de la maceta (m)
    "rumbo": 90,                                  // dirección del lado LARGO, en grados de brújula (0 = norte-sur, 90 = este-oeste; def. 90)
    "largo": 3.5, "ancho": 1, "alto": 0.9,         // m (def. 3,5 × 1 × 0,9). Se estira: es una sola pieza
    "planta": "areca",                            // "areca" (palmera areca, def.) | "ninguna". Una mata cada ~1,1 m a lo largo: np = max(1, round(largo / 1.1))
    "plantaAlto": 1.8,                            // altura de cada mata en m (def. 1,8)
    "y": 0                                        // opcional: altura de la base (def. el suelo/manzana bajo su centro)
  }],

  "cercas": [{                                    // complemento: cerca de panel de malla soldada verde con postes cuadrados, a lo largo de una polilínea
    "id": "z1", "nombre": "Cerca",
    "puntos": [[0,0],[20,0]],                     // polilínea; poste en cada vértice y cada módulo
    "alto": 1.8,                                  // m (def. 1,8)
    "color": "#1f6b45",                           // color de la cerca (CSS: "#rrggbb" o nombre; def. verde "#1f6b45"): tiñe los paneles y los postes (postes algo más oscuros)
    "modulo": 2.5,                                // m de cada panel (def. 2,5). La longitud NO estira los paneles: por tramo hay n = max(1, round(L / modulo)) paneles de ancho L/n, con un poste en cada unión
    "suavizar": false
  }],

  "estacionamientos": [{                          // complemento: líneas de estacionamiento (pintura). Más `alto` = MÁS rayas (cada `paso` m), nunca rayas más gruesas
    "id": "p1", "nombre": "Estacionamiento",
    "x": 0, "z": 0,                               // centro del grupo (m)
    "rumbo": 0,                                   // dirección de cada raya, en grados de brújula (0 = norte-sur, 90 = este-oeste); las rayas se reparten en la perpendicular
    "ancho": 5,                                   // largo de cada raya en m (profundidad de la plaza; def. 5)
    "alto": 12.5,                                 // extensión del grupo en la perpendicular, en m (def. 12,5): nº de rayas n = floor(alto / paso) + 1
    "paso": 2.5,                                  // separación entre rayas MEDIDA A LO LARGO DE LA FILA (perpendicular a `rumbo`), m (def. 2,5)
    "inclinacion": 0,                             // grados (-75..75; def. 0): inclina las rayas respecto a la perpendicular de la fila para estacionamiento en diagonal (45° = diagonal típica). La fila (reparto) no cambia; cada raya gira esos grados alrededor de su centro. Positivo = hacia el lado p = (cos rumbo, sin rumbo) en (x,z)
    "grosor": 0.12,                               // grosor de cada raya, m (def. 0,12; fijo, no depende de alto)
    "color": "amarillo"                           // "amarillo" (def.) | "blanco"
  }],

  "rampas": [{                                    // complemento: ENTRADA a una manzana/terreno elevado, DENTRO de la manzana (el vehículo sube sin salto)
    "id": "q1", "nombre": "Entrada",
    "x": 0, "z": 0,                               // punto del BORDE de la manzana donde está la boca de la entrada (centro del ancho), a nivel de calle
    "rumbo": 0,                                   // dirección hacia dentro de la manzana, grados de brújula (0 = norte, 90 = este)
    "ancho": 4, "largo": 5,                       // m: ancho de la entrada; largo = hasta dónde se interna en la manzana: sube de 0,02 (borde) a la altura del terreno a `largo` m
    "bordes": "recto",                            // "recto" (def.) | "redondeado": las esquinas del bordillo a cada lado de la boca se redondean con `radio`
    "radio": 1.5,                                 // m (solo con bordes "redondeado"; def. 1,5)
    "alto": 0.3                                   // m de altura del terreno al fondo (def.: la altura de la manzana en ese punto)
  }],

  "flechas": [{                                   // complemento: flechas de pavimento que indican el sentido de la vía (pintura de grosor fijo)
    "id": "f1", "nombre": "Flecha",
    "x": 0, "z": 0,                               // COLA de la flecha (origen del sistema local; si cantidad > 1, centro de la fila)
    "rumbo": 0,                                   // hacia dónde apunta (grados de brújula: 0 = norte, 90 = este)
    "tipo": "recta",                              // lineal: "recta" · de cruce: "izquierda" | "derecha" | "recta-izq" | "recta-der" | "izq-der" | "retorno"  (def. "recta")
    "largo": 4.5,                                 // m de largo total (def. 4,5); escala la flecha completa (el grosor de pintura 0,3 m es fijo)
    "cantidad": 1, "paso": 20,                    // repetir `cantidad` flechas en fila a lo largo de `rumbo`, separadas `paso` m (def. 1 y 20): flechas lineales cada cierta distancia
    "grosor": 0.3,                                // grosor de la pintura de las flechas en m (def. 0,3; 0,05–1; real, no escala con `largo`); la punta se ensancha con el grosor extra: semiancho de la punta = 0,55·e + (grosor − 0,3) m
    "color": "blanco"                             // "blanco" (def.) | "amarillo"
  }],

  "escaleras": [{                                 // complemento: ESCALERA de acceso a una manzana/terreno elevado, excavada DENTRO de la manzana desde el borde, como las rampas (la muesca forma los muros laterales); usa el suelo de la ACERA (`texturaAcera`); bloquea solo a vehículos (el peatón la sube)
    "id": "x1", "nombre": "Escalera",
    "x": 0, "z": 0,                               // punto del BORDE de la manzana donde está el primer peldaño (centro del ancho), a nivel de calle
    "rumbo": 0,                                   // dirección hacia dentro de la manzana, grados de brújula (0 = norte, 90 = este)
    "ancho": 3,                                   // m (def. 3)
    "peldanos": 2,                                // nº de peldaños (def. = round(alto / 0,17)); cada contrahuella mide (alto − 0,02) / peldaños
    "largo": 0.6,                                 // profundidad total hacia dentro, m (def. peldaños × 0,3 m de huella)
    "alto": 0.3                                   // m de altura al terreno (def.: la de la manzana en ese punto)
  }],

  "cruces": [{                                    // complemento: CRUCE PEATONAL (paso de cebra); pintura de grosor fijo; más `largo` = MÁS barras, nunca barras más gruesas
    "id": "p1", "nombre": "Cruce peatonal",
    "x": 0, "z": 0,                               // centro del cruce (m)
    "rumbo": 0,                                   // dirección en que CAMINA el peatón, o sea a través de la calle (grados de brújula: 0 = norte, 90 = este). Las barras quedan paralelas al tráfico
    "tipo": "cebra",                              // "cebra" (barras) | "lineas" (dos líneas continuas a cada lado) | "escalera" (líneas + barras)  (def. "cebra")
    "largo": 8,                                   // m a través de la calle (el cruce completo); nº de barras = floor(largo / paso) + 1
    "ancho": 3,                                   // m a lo largo del tráfico (largo de cada barra y separación entre las dos líneas; def. 3)
    "paso": 1, "barra": 0.5,                      // separación centro a centro entre barras (def. 1) y grosor de cada barra (def. 0,5): barra y hueco de 0,5 m
    "color": "blanco"                             // "blanco" (def.) | "amarillo"
  }],

  "luces": [{                                     // complemento: luces peatonales (se encienden de noche y dejan un charco de luz en el suelo)
    "id": "l1", "nombre": "Luz peatonal",
    "x": 0, "z": 0,
    "tipo": "poste",                              // "poste" (peatonal de 3,6 m con globo) | "bolardo" (0,9 m con anillo de luz) | "semaforo" (semáforo peatonal 2,6 m: figura roja/verde, alterna cada 6 s)
    "alto": 3.6,                                  // m (def. según tipo: poste 3,6 · bolardo 0,9 · semáforo 2,6)
    "color": "#ffd58a",                           // color de la luz (poste y bolardo; def. cálido "#ffd58a")
    "rumbo": 0                                    // solo semáforo: hacia dónde mira la cara con las figuras (brújula)
  }],

  "separadores": [{                               // hilera suelta de concreto amarillo (como el separador de una calle, pero libre)
    "id": "s1", "puntos": [[0,0],[40,3]], "ancho": 0.3, "alto": 0.2, "suavizar": false,
    "bordeDe": "a1"                               // opcional, informativo: id de la isla cuyo borde dibuja este separador (lo usa el editor para regenerarlo; el juego lo ignora). Un borde cerrado repite el primer punto al final
  }],

  "areas": [{                                     // áreas verdes: isla (alto>0, con bordillo amarillo) o parque (alto 0)
    "id": "a1", "nombre": "Isla Av. 4",
    "puntos": [[0,0],[100,0],[100,10],[0,10]],    // polígono
    "alto": 0.4,                                  // m; 0 = al ras del suelo, sin bordillo (parque)  (def. 0)
    "superficie": "cesped",                       // "cesped" | "concreto" | "piedras" | "piedras_cafe"  (def. "cesped")
    "borde": true,                                // bordillo/banda de concreto amarillo (solo si alto>0)  (def. true)
    "arboles": 13,                                // separación media entre árboles en m; 0 = sin árboles (def. 0)
    "tipos": "mixto",                             // "mixto" | "frondosos" | "palmas"  (def. "mixto")
    "suavizar": false
  }],

  "arboles": [{ "id": "t1", "x": 10, "z": 20, "tipo": 3 }],   // árbol suelto: tipo 0,1,2 = frondosos, 3 = palma

  "bloques": [{                                   // manzanas: losa elevada con bordillo y banda de concreto gris (aquí irán los edificios)
    "id": "b1", "puntos": [[0,0],[100,0],[100,80],[0,80]], "suavizar": false,
    "alto": 0.3,                                  // altura de la ACERA peatonal / bordillo de la manzana, m sobre la calle (def. 0,3)
    "aceraAncho": 0,                              // ancho de la acera medido HACIA ADENTRO desde el borde (m, >= 0; nunca hacia la calle). 0 = sin acera aparte: toda la manzana a `alto`
    "aceraLados": [true, true, false, true],      // opcional: un booleano por ARISTA de `puntos` (la arista i va del punto i al i+1); false = SIN acera en ese lado (el terreno interior llega hasta el borde; la acera de los lados vecinos termina RECTA, perpendicular a su lado, no en diagonal). Si falta = acera en todos los lados. Solo tiene efecto con aceraAncho > 0
    "bordeLados": [true, false, true, true],      // opcional: un booleano por ARISTA de `puntos`; false = SIN bordillo (la banda superior clara de 0,4 m) en ese lado; el muro vertical se conserva y los extremos del bordillo vecino quedan rectos. Si falta = bordillo en todos los lados
    "altoInterior": 0.3,                          // altura del terreno interior (dentro de la acera), m (def. = alto). Ej.: 0.02 = estacionamiento a nivel de calle con acera alrededor
    "texturaAcera": "adoquin",                    // suelo de la acera (mismos valores que `textura`; def. "adoquin"). `textura` es el del terreno interior
    "textura": "adoquin",                         // suelo de la manzana: "adoquin" (def.) | "cesped" | "tierra" | "asfalto" | "concreto" | "cemento" | "piedras" | "piedras_cafe" (mismos valores que `terrenos`)
    "escala": 1                                   // multiplicador del tamaño de la textura (def. 1)
  }],

  "barreras": [{                                  // cierre "NO PASE": hilera rojo/blanco + cartel rosa
    "id": "r1", "x": 101, "z": -238,              // centro de la barrera
    "dx": 0.2, "dz": -1,                          // dirección de salida (se normaliza); la hilera queda perpendicular
    "ancho": 24                                   // m de hilera
  }],

  "zonaJugable": [[0,0],[500,0],[500,400],[0,400]],   // polígono: el carro y el personaje no pasan de aquí ([] = sin límite)
  "zonaReservada": [[0,0],[40,0],[40,120],[0,120]],   // polígono azul translúcido (opcional, [] = ninguna)
  "spawn": { "x": 30, "z": 150, "hd": 3.14 }          // arranque del carro; hd = rumbo en radianes: 0 = hacia el sur (+z), π = norte, π/2 = este
}
```

Notas
- `hd`: dirección de avance = `(sin hd, cos hd)` en (x, z).
- Las calles con `extra:true` se dibujan con el mismo asfalto, pero no producen marcas, farolas, ni cortan separadores por "cruce"; sí cortan el separador central de otra calle si lo cubren (así se abren los huecos de giro).
- El juego carga `mapa.json` (misma carpeta que `index.html`). Con `?mapa=local` carga en cambio `localStorage["jacMapa"]` (lo escribe el editor con "Probar en el juego").

## Suavizado (`suavizar: true`)
Aplica a `calles`, `separadores` (polilíneas abiertas) y `areas`, `bloques`, `terrenos` (polígonos cerrados). Los puntos guardados NO cambian: el suavizado se calcula al dibujar (editor) y al cargar (juego) con
EXACTAMENTE este algoritmo (spline Catmull-Rom uniforme que pasa por todos los puntos), para que ambos coincidan:

```js
function suavizar(pts, cerrado) {
  const n = pts.length; if (n < 3) return pts.map((p) => [p[0], p[1]]);
  const P = (i) => (cerrado ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out = [], segs = cerrado ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), k = Math.max(2, Math.ceil(L / 3));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
    }
  }
  if (!cerrado) out.push([pts[n - 1][0], pts[n - 1][1]]);
  return out;
}
```

## Catálogo de modelos (`modelos/catalogo.json`)
Lista de modelos 3D (GLB) disponibles para `edificios`. Cada entrada: `id`, `nombre`, `archivo` (relativo a `modelos/`), `miniatura` (PNG cenital con transparencia, norte arriba, con el frente
del modelo mirando al sur/abajo; cubre EXACTAMENTE la huella), `huella` = `{ancho, fondo, cx, cz}` (rectángulo en planta, en m, antes de escalar; `cx,cz` = centro de la huella respecto al origen del modelo),
`alto` (m) y `frente` ("+z": el frente del modelo mira hacia +z local = sur con rumbo 180).
En el juego: la rotación es `rotation.y = π - rumbo·π/180`; la huella se rota/escala igual y sirve para la colisión. En el editor se dibuja la miniatura en el rectángulo orientado.

## Suavizar solo una esquina (`radios`)
Opcional en `bloques`, `terrenos` y `areas` (polígonos cerrados) y, si se quiere, en `calles` y `separadores` (polilíneas abiertas: los extremos no se redondean).
`"radios": [0, 0, 12, 0]` = un número por vértice (mismo orden que `puntos`; faltantes = 0). Un valor > 0 redondea ESA esquina: la curva empieza a `radio` metros del vértice
sobre cada arista (se limita a la mitad de la arista) y es una curva cuadrática con el vértice como punto de control. Los `puntos` guardados no cambian. Si el elemento tiene
`suavizar: true`, `radios` se ignora (suavizar ya redondea todo). Algoritmo EXACTO (editor y juego):

```js
function redondear(pts, radios, cerrado) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const r = radios[i] || 0, P = pts[i], extremo = !cerrado && (i === 0 || i === n - 1);
    if (r <= 0 || extremo || n < 3) { out.push([P[0], P[1]]); continue; }
    const A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n], la = Math.hypot(A[0] - P[0], A[1] - P[1]), lb = Math.hypot(B[0] - P[0], B[1] - P[1]);
    if (la < 1e-6 || lb < 1e-6) { out.push([P[0], P[1]]); continue; }
    const d = Math.min(r, la / 2, lb / 2), T1 = [P[0] + (A[0] - P[0]) / la * d, P[1] + (A[1] - P[1]) / la * d], T2 = [P[0] + (B[0] - P[0]) / lb * d, P[1] + (B[1] - P[1]) / lb * d], k = Math.max(4, Math.ceil(d / 1.5));
    for (let j = 0; j <= k; j++) { const t = j / k, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; out.push([a * T1[0] + b * P[0] + c * T2[0], a * T1[1] + b * P[1] + c * T2[1]]); }
  }
  return out;
}
```

## Lados de calle y esquinas de cruce
- **Lados (`izq`/`der`)**: ver `calles`. El juego dibuja el asfalto con ese semiancho en cada vértice (interpolado). `ancho` sigue siendo el valor base/por defecto y el que usan marcas, farolas y detección de cruces.
  Si la calle tiene `suavizar:true`, los semianchos se suavizan con el mismo esquema (Catmull-Rom sobre el valor).
- **Esquina de cruce redondeada**: cuando una manzana tiene `radios[i] > 0` en un vértice (esquina de cruce), el juego RELLENA de asfalto la zona recortada entre la esquina original y la curva (así la calle "cubre" más la esquina). Mismo
  cálculo que `redondear`: región polígono [vértice, T1, curva…, T2].

### Categorías y niveles de detalle del catálogo
Cada modelo lleva `categoria` (id de `categorias[]`; todos los edificios están en la categoría `"edificios"`, nombre "Edificios") para agruparlos en el editor. Opcionales: `modular: {eje:"x", paso}` (modelo MODULAR: al ensanchar el edificio NO se escala, se añaden copias idénticas pegadas a lo ancho cada `paso` m; en el edificio del mapa el campo `modulos` (entero ≥1, def. 1) dice cuántas; `x,z` = centro de toda la hilera; la huella total = `ancho`·`modulos`); `modular.libre: true` + `modular.anchoMin` (m): el ancho es CONTINUO y puede reducirse: el edificio del mapa usa `ancho` (m, def. paso·modulos) en vez de `modulos`; se ponen n = ceil(ancho/paso) copias y cada una se estira/comprime en X por ancho/(n·paso) (así se puede ir por debajo de un módulo, hasta `anchoMin`); `puedeRebasar: true` (el edificio puede solaparse/rebasar los límites de otros elementos, p. ej. invadir calle o acera; el editor no debe bloquearlo ni marcarlo en conflicto); `lods`: `[{archivo, desde}]` (cambio de nivel de detalle por distancia a la cámara en m,
el de `desde: 0` es el más detallado); `colision`: archivo GLB de colisión (el juego lo rasteriza en planta cada 1 m: solo cuenta lo que esté bajo el modelo de colisión; si falta, se usa la huella rectangular);
`emisivoSiempre`: nombres de materiales cuyo emisivo NO se apaga de día (luces interiores).

## Flechas de pavimento: geometría (editor y juego)
Sistema local: u = hacia adelante (rumbo), v = a la derecha; punto(u,v) = (x,z) + d·u·e + p·v·e (+ d·desplazamiento de la fila), con d = (sin rumbo, −cos rumbo), p = (−d.z, d.x), e = largo/4,5.
Cada tipo es una lista de ramas (polilíneas, m para largo 4,5). Cada rama se dibuja con grosor 0,3 (cuadrilátero por tramo, con prolongación 0,15 en cada extremo) y termina en una punta triangular:
base de ancho 1,1 centrada en el último punto, perpendicular a la dirección del último tramo, y vértice a 1,3 m del último punto en esa dirección (todo × e).
- recta: [(0,0),(0,3.2)]
- izquierda: [(0,0),(0,1.8),(-0.25,2.25),(-0.8,2.5),(-1.6,2.5)]    · derecha: igual con v positivo
- recta-izq: [(0,0),(0,3.2)] + [(0,1.6),(-0.25,1.9),(-0.8,2.1),(-1.5,2.1)]    · recta-der: la segunda rama con v positivo
- izq-der: [(0,0),(0,1.6),(-0.25,1.95),(-0.8,2.15),(-1.4,2.15)] + [(0,1.6),(0.25,1.95),(0.8,2.15),(1.4,2.15)]
- retorno: [(0,0),(0,2.6),(-0.3,3.3),(-1.0,3.6),(-1.7,3.3),(-2.0,2.6),(-2.0,1.4)]
