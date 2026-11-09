// Ajuste del Arena Pro a la ficha técnica (JAC Arena SUV compacto): largo 4,340 m, ancho 1,790 m, alto 1,680 m, distancia entre ejes 2,620 m,
// voladizos 0,870 / 0,850 m. El modelo original medía 4,151 x 2,000 (carrocería sin espejos) x 1,833 m con ejes a ±1,28 m (voladizos 0,905 / 0,685).
// Se aplica al cargar a todos los Arena (el conducible y los de catálogo): x * 0,895; y igual hasta 1,15 m (asiento, tablero, volante) y comprimido por encima hasta 1,68 m (techo);
// z por tramos (eje delantero, entre ejes, eje trasero). Las llantas NO se deforman: solo se recolocan en los nuevos ejes. Las puertas giran en su bisagra, el volante y el socket solo se trasladan.
export const AJ_ARENA = { sx: 0.895, yBase: 1.15, sy: 0.776, ejeOrig: 1.28, ejeNuevo: 1.31, vdOrig: 0.905, vdNuevo: 0.870, vtOrig: 0.685, vtNuevo: 0.850 };
const A = AJ_ARENA;
export const ajFx = (x) => x * A.sx;
export const ajFy = (y) => (y <= A.yBase ? y : A.yBase + (y - A.yBase) * A.sy);
export const ajFz = (z) => (z >= A.ejeOrig ? A.ejeNuevo + (z - A.ejeOrig) * (A.vdNuevo / A.vdOrig) : z <= -A.ejeOrig ? -A.ejeNuevo + (z + A.ejeOrig) * (A.vtNuevo / A.vtOrig) : z * (A.ejeNuevo / A.ejeOrig));
export function ajustaArena(THREE, root) {
  root.updateWorldMatrix(true, true);   // también los padres: la raíz puede estar ya dentro del carro
  const nodos = []; root.traverse((o) => nodos.push(o));
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), W0 = new Map(), W1 = new Map();   // posiciones en el marco del modelo (la raíz puede estar ya dentro del carro, movido y girado)
  for (const o of nodos) W0.set(o, o.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv));
  const rueda = (o) => { for (let p = o; p; p = p.parent) if (/^(Rueda|Pinza)/.test(p.name)) return true; return false; };
  const gira = (p) => Math.abs(p.quaternion.x) + Math.abs(p.quaternion.y) + Math.abs(p.quaternion.z) > 1e-4 || Math.abs(p.scale.x - 1) + Math.abs(p.scale.y - 1) + Math.abs(p.scale.z - 1) > 1e-4;
  const ancestroGira = (o) => { for (let p = o.parent; p && p !== root.parent; p = p.parent) if (gira(p)) return true; return false; };
  const F = (v) => v.set(ajFx(v.x), ajFy(v.y), ajFz(v.z));
  const cero = new THREE.Vector3();
  for (const o of nodos) {
    if (o === root || rueda(o) || ancestroGira(o)) continue;
    const nw = F(W0.get(o).clone()); W1.set(o, nw);
    if (o.isMesh && !gira(o)) {   // vértices: p' = F(p + W) - F(W)
      const pos = o.geometry.attributes.position, w = W0.get(o), v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).add(w); F(v).sub(nw); pos.setXYZ(i, v.x, v.y, v.z); }
      pos.needsUpdate = true; o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere();
    }
    const pw = o.parent ? (W1.get(o.parent) ?? W0.get(o.parent) ?? cero) : cero;
    o.position.copy(nw).sub(pw);
  }
  for (const o of nodos) {   // llantas: mismo tamaño, centro en el nuevo eje y la nueva vía
    if (!/^Rueda_/.test(o.name) || /^Rueda/.test(o.parent?.name ?? "")) continue;
    const bb = new THREE.Box3().setFromObject(o).applyMatrix4(inv), c = bb.getCenter(new THREE.Vector3()), d = new THREE.Vector3(ajFx(c.x) - c.x, 0, (c.z >= 0 ? A.ejeNuevo : -A.ejeNuevo) - c.z);
    o.position.add(d);
    const cal = nodos.find((q) => q.name === o.name.replace("Rueda", "Pinza")); if (cal) cal.position.add(d);
  }
  root.updateWorldMatrix(true, true);
}
