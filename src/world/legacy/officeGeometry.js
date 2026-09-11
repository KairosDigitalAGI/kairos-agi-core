// Adapted from the Founder office in kairos-os; provenance in docs/REUSE_PROVENANCE.md.
// Geometry only. No demo metrics, agents, data loaders or external calls were copied.
import * as THREE from 'three'
export function createOffice(accent = '#7c3aed') {
  const scene = new THREE.Group()
  const COL = { blue: new THREE.Color(accent), pink: new THREE.Color('#1287f8'), purple: new THREE.Color('#7b3ff2') }
  const M = {
    floor: new THREE.MeshStandardMaterial({color: 0x0c0c13, roughness: .92, metalness: .05}),
    wall: new THREE.MeshStandardMaterial({color: 0x0e0e16, roughness: .95}),
    desk: new THREE.MeshStandardMaterial({color: 0x1a1a26, roughness: .6, metalness: .2}),
    chair: new THREE.MeshStandardMaterial({color: 0x14141d, roughness: .8}),
    neonBlue: new THREE.MeshBasicMaterial({color: COL.blue, toneMapped: false}),
    neonPink: new THREE.MeshBasicMaterial({color: COL.pink, toneMapped: false}),
    neonPurple: new THREE.MeshBasicMaterial({color: COL.purple, toneMapped: false}),
  }
  function safe(fn) { fn() }
    var DESK_SLOTS = [];
    (function () {
      var rowsZ = [-6, -1.5, 3, 7.5], cols = [{ x: -6.5, dir: 1 }, { x: -11.5, dir: 1 }, { x: 6.5, dir: -1 }, { x: 11.5, dir: -1 }];
      for (var r = 0; r < rowsZ.length; r++) for (var c = 0; c < cols.length; c++) DESK_SLOTS.push({ x: cols[c].x, z: rowsZ[r], dir: cols[c].dir });
      // ordem: alterna asas para distribuir P1 perto do centro
      DESK_SLOTS.sort(function (a, b) { return (Math.abs(a.x) - Math.abs(b.x)) || (a.z - b.z) || (a.x - b.x); });
    })();

    // ───────── FASE 0/1: chão, grade, paredes, faixas de luz ─────────
    safe(function () {
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(46, 36), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.z = -1; scene.add(floor);
      var g1 = new THREE.GridHelper(46, 46, COL.blue, 0x1a1a2c); g1.position.set(0, 0.01, -1); g1.material.transparent = true; g1.material.opacity = 0.32; scene.add(g1);
      var g2 = new THREE.GridHelper(46, 8, COL.pink, COL.pink); g2.position.set(0, 0.012, -1); g2.material.transparent = true; g2.material.opacity = 0.18; scene.add(g2);
      // moldura neon do chão
      var edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-23, 0.02, 17), new THREE.Vector3(23, 0.02, 17), new THREE.Vector3(23, 0.02, -19), new THREE.Vector3(-23, 0.02, -19)]), new THREE.LineBasicMaterial({ color: COL.pink, toneMapped: false })); scene.add(edge);
      // paredes
      var back = new THREE.Mesh(new THREE.BoxGeometry(46, 6.5, 0.4), M.wall); back.position.set(0, 3.25, -19.2); scene.add(back);
      var left = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.5, 36), M.wall); left.position.set(-23.2, 3.25, -1); scene.add(left);
      var right = left.clone(); right.position.x = 23.2; scene.add(right);
      // faixas de luz
      function strip(w, h, d, x, y, z, mat) { var s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); s.position.set(x, y, z); scene.add(s); return s; }
      strip(46, 0.05, 0.05, 0, 4.6, -18.98, M.neonBlue); strip(46, 0.05, 0.05, 0, 2.2, -18.98, M.neonPink);
      strip(0.05, 0.05, 36, -22.98, 4.6, -1, M.neonPink); strip(0.05, 0.05, 36, 22.98, 4.6, -1, M.neonBlue);
      strip(0.05, 0.05, 36, -22.98, 2.2, -1, M.neonBlue); strip(0.05, 0.05, 36, 22.98, 2.2, -1, M.neonPink);
      for (var i = -20; i <= 20; i += 8) strip(0.06, 6.5, 0.06, i, 3.25, -18.95, i % 16 === 0 ? M.neonPurple : M.neonBlue);
      // corredor central
      var aisle = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 30), new THREE.MeshStandardMaterial({ color: 0x11111a, roughness: 0.6, metalness: 0.3, emissive: COL.purple, emissiveIntensity: 0.06 })); aisle.rotation.x = -Math.PI / 2; aisle.position.set(0, 0.015, -1); scene.add(aisle);
    }, 'escritório');

    // ───────── mesas (InstancedMesh) ─────────
    var screens = [];
    safe(function () {
      var n = DESK_SLOTS.length;
      var tmp = new THREE.Object3D();
      function inst(geo, mat, count) { var im = new THREE.InstancedMesh(geo, mat, count); im.frustumCulled = false; scene.add(im); return im; }
      var tops = inst(new THREE.BoxGeometry(1.7, 0.06, 0.85), M.desk, n);
      var edges = inst(new THREE.BoxGeometry(1.72, 0.02, 0.03), M.neonBlue, n);
      var legs = inst(new THREE.BoxGeometry(0.06, 0.74, 0.06), M.desk, n * 4);
      var monitors = inst(new THREE.BoxGeometry(0.05, 0.5, 0.86), M.chair, n);
      var stands = inst(new THREE.BoxGeometry(0.16, 0.12, 0.3), M.chair, n);
      var seats = inst(new THREE.BoxGeometry(0.52, 0.07, 0.52), M.chair, n);
      var backs = inst(new THREE.BoxGeometry(0.06, 0.55, 0.52), M.chair, n);
      DESK_SLOTS.forEach(function (s, i) {
        var d = s.dir; // +1: mesa voltada para +x (asa esquerda)
        tmp.position.set(s.x, 0.77, s.z); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); tops.setMatrixAt(i, tmp.matrix);
        tmp.position.set(s.x + d * 0.85, 0.81, s.z); tmp.updateMatrix(); edges.setMatrixAt(i, tmp.matrix);
        [[-0.78, -0.36], [0.78, -0.36], [-0.78, 0.36], [0.78, 0.36]].forEach(function (o, k) { tmp.position.set(s.x + o[0], 0.37, s.z + o[1]); tmp.updateMatrix(); legs.setMatrixAt(i * 4 + k, tmp.matrix); });
        tmp.position.set(s.x + d * 0.25, 1.15, s.z); tmp.rotation.set(0, 0, d * 0.12); tmp.updateMatrix(); monitors.setMatrixAt(i, tmp.matrix);
        tmp.position.set(s.x + d * 0.3, 0.86, s.z); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); stands.setMatrixAt(i, tmp.matrix);
        var seatX = s.x - d * 0.85;
        tmp.position.set(seatX, 0.45, s.z); tmp.updateMatrix(); seats.setMatrixAt(i, tmp.matrix);
        tmp.position.set(seatX - d * 0.25, 0.75, s.z); tmp.updateMatrix(); backs.setMatrixAt(i, tmp.matrix);
        // tela (separada: brilho por agente)
        var scr = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.42), new THREE.MeshBasicMaterial({ color: COL.blue, toneMapped: false, transparent: true, opacity: 0.9 }));
        scr.position.set(s.x + d * 0.22, 1.15, s.z); scr.rotation.y = d > 0 ? -Math.PI / 2 : Math.PI / 2; scr.rotation.z = 0; scene.add(scr);
        screens.push(scr);
      });
      [tops, edges, legs, monitors, stands, seats, backs].forEach(function (im) { im.instanceMatrix.needsUpdate = true; });
    }, 'mesas');


  const table = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.2, .12, 40), M.desk)
  table.position.set(0, .78, 8); scene.add(table)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.3, .04, 8, 60), M.neonBlue)
  ring.rotation.x = Math.PI/2; ring.position.set(0, .86, 8); scene.add(ring)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.5, .9, .74, 20), M.desk)
  base.position.set(0,.37,8); scene.add(base)
  return scene
}
export function disposeOffice(group) {
  const geometries = new Set(), materials = new Set()
  group.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) for (const material of [object.material].flat()) materials.add(material) })
  for (const geometry of geometries) geometry.dispose()
  for (const material of materials) material.dispose()
}
