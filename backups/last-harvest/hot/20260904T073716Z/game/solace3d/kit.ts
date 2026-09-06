function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material, dark: THREE.Material) {
  const g = new THREE.Group();
  g.name = "scythe";
  const snath = cyl(0.011, 0.015, 1.28, wood, 8);
  snath.rotation.z = Math.PI / 2;
  g.add(snath);
  const nib = (x: number) => {
    const n = cyl(0.012, 0.01, 0.11, wood, 6);
    n.position.set(x, 0.055, 0);
    g.add(n);
  };
  nib(-0.28);
  nib(0.22);
  const ring = cyl(0.02, 0.02, 0.035, steel, 8);
  ring.rotation.z = Math.PI / 2;
  ring.position.set(0.62, 0, 0);
  g.add(ring);
  add(g, box(0.04, 0.018, 0.03, dark), 0.6, 0, 0);

  const knife = new THREE.Shape();
  knife.moveTo(0, 0.004);
  knife.lineTo(0.02, 0.048);
  knife.quadraticCurveTo(0.28, 0.07, 0.58, 0.028);
  knife.quadraticCurveTo(0.6, 0.01, 0.61, 0);
  knife.quadraticCurveTo(0.3, -0.006, 0.02, 0.002);
  knife.lineTo(0, 0.004);
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(knife, { depth: 0.007, bevelEnabled: false, steps: 1 }),
    bladeM,
  );
  blade.rotation.set(Math.PI / 2, 0, 0);
  blade.position.set(0.6, 0.004, 0.01);
  g.add(blade);
  return g;
}