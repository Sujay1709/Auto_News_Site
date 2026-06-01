import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const TYPE_PROPORTIONS = {
  sedan:    { bodyW: 2.2, bodyH: 0.55, bodyD: 1.0,  roofH: 0.45, roofShrink: 0.5 },
  suv:      { bodyW: 2.0, bodyH: 0.85, bodyD: 1.1,  roofH: 0.6,  roofShrink: 0.3 },
  sports:   { bodyW: 2.3, bodyH: 0.45, bodyD: 1.05, roofH: 0.32, roofShrink: 0.55 },
  electric: { bodyW: 2.1, bodyH: 0.6,  bodyD: 1.05, roofH: 0.42, roofShrink: 0.45 },
};

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function disposeGroup(group) {
  group.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
  while (group.children.length) group.remove(group.children[0]);
}

export class ProceduralCarViewer {
  constructor(mount) {
    this.mount = mount;
    this.disposed = false;

    const w = Math.max(1, mount.clientWidth);
    const h = Math.max(1, mount.clientHeight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    mount.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(4, 2.5, 5);
    this.camera.lookAt(0, 0.4, 0);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 1.0, metalness: 0.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    this.carGroup = new THREE.Group();
    this.carGroup.name = 'carGroup';
    this.scene.add(this.carGroup);

    this.resizeObserver = new ResizeObserver(() => this._handleResize());
    this.resizeObserver.observe(mount);

    this._animate = this._animate.bind(this);
    this._rafId = requestAnimationFrame(this._animate);
  }

  _handleResize() {
    if (this.disposed) return;
    const w = Math.max(1, this.mount.clientWidth);
    const h = Math.max(1, this.mount.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _animate() {
    if (this.disposed) return;
    this.carGroup.rotation.y += 0.005;
    this.renderer.render(this.scene, this.camera);
    this._rafId = requestAnimationFrame(this._animate);
  }

  setCar(car) {
    if (this.disposed || !car) return;

    disposeGroup(this.carGroup);

    const type = (car.type || 'sedan').toLowerCase();
    const prop = TYPE_PROPORTIONS[type] || TYPE_PROPORTIONS.sedan;

    const hueSeed = hashString(`${car.make || ''} ${car.model || ''}`);
    const bodyColor = new THREE.Color().setHSL((hueSeed % 360) / 360, 0.55, 0.45);
    const roofColor = bodyColor.clone().multiplyScalar(0.7);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(prop.bodyW, prop.bodyH, prop.bodyD),
      new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.3 })
    );
    body.position.y = 0.32 + prop.bodyH / 2;
    this.carGroup.add(body);

    const roofW = prop.bodyW * (1 - prop.roofShrink);
    const roofD = prop.bodyD * 0.92;
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(roofW, prop.roofH, roofD),
      new THREE.MeshStandardMaterial({ color: roofColor, metalness: 0.6, roughness: 0.35 })
    );
    roof.position.y = 0.32 + prop.bodyH + prop.roofH / 2;
    roof.position.x = -prop.bodyW * 0.05;
    this.carGroup.add(roof);

    const windowMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, metalness: 0.9, roughness: 0.1 });
    const windowBand = new THREE.Mesh(
      new THREE.BoxGeometry(roofW * 0.98, prop.roofH * 0.7, roofD * 1.005),
      windowMat
    );
    windowBand.position.copy(roof.position);
    this.carGroup.add(windowBand);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 24);
    const wheelOffsets = [
      [ prop.bodyW * 0.38,  prop.bodyD * 0.55],
      [ prop.bodyW * 0.38, -prop.bodyD * 0.55],
      [-prop.bodyW * 0.38,  prop.bodyD * 0.55],
      [-prop.bodyW * 0.38, -prop.bodyD * 0.55],
    ];
    for (const [x, z] of wheelOffsets) {
      const wheel = new THREE.Mesh(wheelGeo.clone(), wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.32, z);
      this.carGroup.add(wheel);
    }
    wheelGeo.dispose();

    if (type === 'electric') {
      const glow = new THREE.PointLight(0x4488ff, 0.6, 3);
      glow.position.set(0, 0.2, 0);
      this.carGroup.add(glow);
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    disposeGroup(this.carGroup);
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}