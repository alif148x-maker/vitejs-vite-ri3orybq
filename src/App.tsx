import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RotateCw, Trash2, Plus, Minus, Home, Palette, Ruler, ShoppingCart, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, Check, MessageCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* CONFIGURACIÓN DE TIENDA — esto es lo único que cambia entre clientes */
/* Cada mueblería que rente el servicio recibe su propio objeto STORE  */
/* con su nombre, colores de marca, WhatsApp y catálogo real.          */
/* ------------------------------------------------------------------ */

const STORE = {
  name: "Mueblería Roble",
  logoLetter: "R",
  primary: "#2C4A3E", // color de marca principal (botones, header, acentos)
  primaryDark: "#1D332B",
  ink: "#211D18",
  whatsapp: "50760000000", // número de la tienda, formato internacional sin +
};

const CATEGORIES = ["Sala", "Comedor", "Dormitorio", "Closets", "Oficina"];

const CATALOG = [
  { id: "c1", category: "Sala", type: "sofa", name: "Sofá Milano 3 puestos", w: 2.2, d: 0.95, h: 0.85, price: 899, color: "#6B4A3A" },
  { id: "c2", category: "Sala", type: "table", name: "Mesa de centro Oslo", w: 1.1, d: 0.55, h: 0.4, price: 249, color: "#3B2A20" },
  { id: "c3", category: "Sala", type: "armchair", name: "Sillón reclinable Nova", w: 0.85, d: 0.9, h: 1.0, price: 399, color: "#2E3A46" },
  { id: "c4", category: "Comedor", type: "table", name: "Comedor Vento (6p)", w: 1.8, d: 0.9, h: 0.75, price: 799, color: "#4B3423" },
  { id: "c5", category: "Comedor", type: "chair", name: "Silla Vento", w: 0.45, d: 0.5, h: 0.9, price: 89, color: "#4B3423" },
  { id: "c6", category: "Dormitorio", type: "bed", name: "Cama Berlín Queen", w: 1.6, d: 2.0, h: 0.5, price: 649, color: "#E8E2D6" },
  { id: "c7", category: "Dormitorio", type: "nightstand", name: "Mesa de noche Nordic", w: 0.45, d: 0.4, h: 0.55, price: 99, color: "#F2EFE8" },
  { id: "c8", category: "Closets", type: "closet", name: "Closet Praga 3 puertas", w: 1.5, d: 0.6, h: 2.0, price: 549, color: "#D8C9A3" },
  { id: "c9", category: "Oficina", type: "table", name: "Escritorio Studio", w: 1.2, d: 0.6, h: 0.75, price: 259, color: "#D9D2C2" },
  { id: "c10", category: "Oficina", type: "chair", name: "Silla Escritorio Studio", w: 0.55, d: 0.55, h: 0.95, price: 149, color: "#2B2B2B" },
];

const getCatalogItem = (id) => CATALOG.find((c) => c.id === id);

const WALL_COLORS = [
  { name: "Blanco cálido", hex: "#F5F2EC" },
  { name: "Gris piedra", hex: "#C9C6BC" },
  { name: "Azul pizarra", hex: "#3E5560" },
  { name: "Verde salvia", hex: "#7C8C74" },
  { name: "Terracota", hex: "#B06B47" },
];

const FLOOR_COLORS = [
  { name: "Roble claro", hex: "#C9A66B" },
  { name: "Nogal oscuro", hex: "#5B4030" },
  { name: "Cemento pulido", hex: "#B7B4AC" },
  { name: "Blanco piso", hex: "#EDEAE2" },
  { name: "Porcelanato gris", hex: "#8C8C86" },
];

/* ------------------------------------------------------------------ */
/* Constructores de muebles low-poly                                   */
/* ------------------------------------------------------------------ */

const box = (w, h, d, color, roughness = 0.75) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 }));

const LEG_COLOR = "#2B2420";

function buildLegs(w, d, h, thick = 0.04) {
  const group = new THREE.Group();
  const offsets = [
    [w / 2 - thick, d / 2 - thick],
    [-(w / 2 - thick), d / 2 - thick],
    [w / 2 - thick, -(d / 2 - thick)],
    [-(w / 2 - thick), -(d / 2 - thick)],
  ];
  offsets.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(thick, thick, h, 8), new THREE.MeshStandardMaterial({ color: LEG_COLOR, roughness: 0.6 }));
    leg.position.set(x, h / 2, z);
    group.add(leg);
  });
  return group;
}

function buildFurniture(type, w, d, h, color) {
  const g = new THREE.Group();
  switch (type) {
    case "sofa": {
      const base = box(w, h * 0.45, d, color);
      base.position.y = h * 0.225;
      const back = box(w, h * 0.55, d * 0.22, color, 0.8);
      back.position.set(0, h * 0.225 + h * 0.275, -d / 2 + d * 0.11);
      const armL = box(w * 0.09, h * 0.6, d, color, 0.8);
      armL.position.set(-w / 2 + w * 0.045, h * 0.3, 0);
      const armR = armL.clone();
      armR.position.x = w / 2 - w * 0.045;
      g.add(base, back, armL, armR);
      break;
    }
    case "armchair": {
      const base = box(w, h * 0.45, d, color);
      base.position.y = h * 0.225;
      const back = box(w, h * 0.55, d * 0.25, color, 0.8);
      back.position.set(0, h * 0.225 + h * 0.275, -d / 2 + d * 0.12);
      const armL = box(w * 0.14, h * 0.55, d, color, 0.8);
      armL.position.set(-w / 2 + w * 0.07, h * 0.28, 0);
      const armR = armL.clone();
      armR.position.x = w / 2 - w * 0.07;
      g.add(base, back, armL, armR);
      break;
    }
    case "chair": {
      const seat = box(w, 0.06, d, color);
      seat.position.y = h * 0.5;
      const back = box(w, h * 0.5, 0.05, color, 0.8);
      back.position.set(0, h * 0.5 + h * 0.25, -d / 2 + 0.03);
      g.add(seat, back, buildLegs(w, d, h * 0.5, 0.025));
      break;
    }
    case "table": {
      const top = box(w, 0.05, d, color, 0.5);
      top.position.y = h - 0.025;
      g.add(top, buildLegs(w, d, h - 0.05, 0.035));
      break;
    }
    case "bed": {
      const frame = box(w, h * 0.3, d, "#2B2320");
      frame.position.y = h * 0.15;
      const mattress = box(w * 0.96, h * 0.45, d * 0.96, color, 0.9);
      mattress.position.y = h * 0.3 + h * 0.225;
      const pillowL = box(w * 0.28, h * 0.18, d * 0.22, "#FFFFFF", 0.95);
      pillowL.position.set(-w * 0.22, h * 0.3 + h * 0.45 + 0.05, -d / 2 + d * 0.16);
      const pillowR = pillowL.clone();
      pillowR.position.x = w * 0.22;
      const headboard = box(w, h * 0.9, 0.06, color, 0.85);
      headboard.position.set(0, h * 0.45, -d / 2 - 0.02);
      g.add(frame, mattress, pillowL, pillowR, headboard);
      break;
    }
    case "closet": {
      const body = box(w, h, d, color, 0.6);
      body.position.y = h / 2;
      const doorGap = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, h * 0.94, d * 0.02),
        new THREE.MeshStandardMaterial({ color: "#00000022", transparent: true, opacity: 0.3 })
      );
      doorGap.position.set(0, h / 2, d / 2 - 0.01);
      const handle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), new THREE.MeshStandardMaterial({ color: "#8a8a86", metalness: 0.6, roughness: 0.3 }));
      handle1.rotation.z = Math.PI / 2;
      handle1.position.set(-0.06, h / 2, d / 2 + 0.02);
      const handle2 = handle1.clone();
      handle2.position.x = 0.06;
      g.add(body, doorGap, handle1, handle2);
      break;
    }
    case "nightstand": {
      const body = box(w, h * 0.85, d, color, 0.6);
      body.position.y = h * 0.425;
      const top = box(w * 1.02, 0.03, d * 1.02, color, 0.4);
      top.position.y = h * 0.85 + 0.015;
      g.add(body, top);
      break;
    }
    default: {
      const body = box(w, h, d, color);
      body.position.y = h / 2;
      g.add(body);
    }
  }
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  return g;
}

/* ------------------------------------------------------------------ */
/* Texto en sprite (cotas arquitectónicas)                             */
/* ------------------------------------------------------------------ */

function createTextSprite(text, { color = STORE.primary, fontSize = 46 } = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `600 ${fontSize}px 'IBM Plex Mono', monospace`;
  const w = ctx.measureText(text).width + 40;
  canvas.width = w;
  canvas.height = fontSize + 28;
  ctx.font = `600 ${fontSize}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = "#FAF8F3ee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, canvas.height / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.011;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function dashedLine(points, color) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.85 });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  return line;
}

/* ------------------------------------------------------------------ */
/* Posicionamiento automático sin colisión                             */
/* ------------------------------------------------------------------ */

function findFreePosition(existing, roomW, roomL, w, d) {
  const margin = 0.25;
  const footprint = Math.max(w, d);
  const halfW = Math.max(roomW / 2 - footprint / 2 - margin, 0);
  const halfL = Math.max(roomL / 2 - footprint / 2 - margin, 0);
  const radius = footprint / 2 + 0.12;
  for (let gz = -halfL; gz <= halfL + 0.001; gz += 0.45) {
    for (let gx = -halfW; gx <= halfW + 0.001; gx += 0.45) {
      let ok = true;
      for (const e of existing) {
        const ec = getCatalogItem(e.catalogId);
        const er = Math.max(ec.w, ec.d) / 2 + 0.12;
        if (Math.hypot(gx - e.x, gz - e.z) < radius + er) {
          ok = false;
          break;
        }
      }
      if (ok) return { x: gx, z: gz };
    }
  }
  return { x: 0, z: 0 };
}

function clampToRoom(x, z, w, d, roomW, roomL) {
  const footprint = Math.max(w, d);
  const halfW = Math.max(roomW / 2 - footprint / 2 - 0.05, 0);
  const halfL = Math.max(roomL / 2 - footprint / 2 - 0.05, 0);
  return { x: Math.min(halfW, Math.max(-halfW, x)), z: Math.min(halfL, Math.max(-halfL, z)) };
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function CroquisApp() {
  const [room, setRoom] = useState({ width: 4, length: 2.8, height: 2.6, wallColor: "#F5F2EC", floorColor: "#C9A66B" });
  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [catTab, setCatTab] = useState("Todas");
  const [sent, setSent] = useState(false);

  const mountRef = useRef(null);
  const threeRef = useRef({});
  const camState = useRef({ theta: 0.7, phi: 1.05, radius: 7, target: new THREE.Vector3(0, 0.8, 0) });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, moved: 0 });

  /* ---------- init three.js (una vez) ---------- */
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#EFEBE2");

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const hemi = new THREE.HemisphereLight("#ffffff", "#8a8272", 0.9);
    const dir = new THREE.DirectionalLight("#fff6e8", 0.85);
    dir.position.set(4, 6, 3);
    const amb = new THREE.AmbientLight("#ffffff", 0.25);
    scene.add(hemi, dir, amb);

    const roomGroup = new THREE.Group();
    const itemsGroup = new THREE.Group();
    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(0.01, 0.02, 32),
      new THREE.MeshBasicMaterial({ color: STORE.primary, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.visible = false;
    scene.add(roomGroup, itemsGroup, selectionRing);

    threeRef.current = { scene, camera, renderer, roomGroup, itemsGroup, selectionRing, meshes: new Map() };

    const resize = () => {
      const w = mount.clientWidth,
        h = mount.clientHeight;
      camera.aspect = w / (h || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const updateCamera = () => {
      const { theta, phi, radius, target } = camState.current;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    };
    updateCamera();

    let raf;
    const loop = () => {
      updateCamera();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const dom = renderer.domElement;
    const onDown = (e) => {
      dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
    };
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.moved += Math.abs(dx) + Math.abs(dy);
      camState.current.theta -= dx * 0.006;
      camState.current.phi = Math.min(Math.PI / 2 - 0.05, Math.max(0.25, camState.current.phi - dy * 0.006));
    };
    const onUp = (e) => {
      if (dragRef.current.dragging && dragRef.current.moved < 6) {
        doRaycastSelect(e);
      }
      dragRef.current.dragging = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      camState.current.radius = Math.min(16, Math.max(2, camState.current.radius + e.deltaY * 0.003));
    };
    const doRaycastSelect = (e) => {
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(itemsGroup.children, true);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !obj.userData.itemId) obj = obj.parent;
        setSelectedId(obj.userData.itemId || null);
      } else {
        setSelectedId(null);
      }
    };

    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dom.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- reconstruir cuarto cuando cambian dimensiones/colores ---------- */
  useEffect(() => {
    const t = threeRef.current;
    if (!t.roomGroup) return;
    t.roomGroup.clear();
    const { width, length, height, wallColor, floorColor } = room;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    t.roomGroup.add(floor);

    const grid = new THREE.GridHelper(Math.max(width, length) + 1, Math.round((Math.max(width, length) + 1) * 2), "#00000022", "#00000015");
    grid.position.y = 0.005;
    t.roomGroup.add(grid);

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 1, side: THREE.DoubleSide });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    backWall.position.set(0, height / 2, -length / 2);
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wallMat.clone());
    leftWall.material.color = new THREE.Color(wallColor).multiplyScalar(0.9);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2, height / 2, 0);
    t.roomGroup.add(backWall, leftWall);

    // cotas arquitectónicas
    const zFront = length / 2 + 0.35;
    t.roomGroup.add(dashedLine([new THREE.Vector3(-width / 2, 0.01, zFront), new THREE.Vector3(width / 2, 0.01, zFront)], STORE.primary));
    const wLabel = createTextSprite(`${width.toFixed(2)} m`);
    wLabel.position.set(0, 0.35, zFront + 0.15);
    t.roomGroup.add(wLabel);

    const xSide = width / 2 + 0.35;
    t.roomGroup.add(dashedLine([new THREE.Vector3(xSide, 0.01, -length / 2), new THREE.Vector3(xSide, 0.01, length / 2)], STORE.primary));
    const lLabel = createTextSprite(`${length.toFixed(2)} m`);
    lLabel.position.set(xSide + 0.55, 0.35, 0);
    t.roomGroup.add(lLabel);

    camState.current.target.set(0, height * 0.35, 0);
    camState.current.radius = Math.max(width, length) * 1.35 + 2.2;

    setPlaced((prev) =>
      prev.map((p) => {
        const cat = getCatalogItem(p.catalogId);
        const { x, z } = clampToRoom(p.x, p.z, cat.w, cat.d, width, length);
        return { ...p, x, z };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.width, room.length, room.height, room.wallColor, room.floorColor]);

  /* ---------- sincronizar muebles colocados ---------- */
  useEffect(() => {
    const t = threeRef.current;
    if (!t.itemsGroup) return;
    const meshes = t.meshes;
    const currentIds = new Set(placed.map((p) => p.id));

    for (const [id, mesh] of meshes) {
      if (!currentIds.has(id)) {
        t.itemsGroup.remove(mesh);
        meshes.delete(id);
      }
    }
    placed.forEach((p) => {
      const cat = getCatalogItem(p.catalogId);
      let mesh = meshes.get(p.id);
      if (!mesh) {
        mesh = buildFurniture(cat.type, cat.w, cat.d, cat.h, cat.color);
        mesh.userData.itemId = p.id;
        meshes.set(p.id, mesh);
        t.itemsGroup.add(mesh);
      }
      mesh.position.set(p.x, 0, p.z);
      mesh.rotation.y = p.rotY;
    });
  }, [placed]);

  /* ---------- resaltar selección ---------- */
  useEffect(() => {
    const t = threeRef.current;
    if (!t.selectionRing) return;
    const p = placed.find((i) => i.id === selectedId);
    if (!p) {
      t.selectionRing.visible = false;
      return;
    }
    const cat = getCatalogItem(p.catalogId);
    const r = Math.max(cat.w, cat.d) / 2 + 0.1;
    t.selectionRing.geometry.dispose();
    t.selectionRing.geometry = new THREE.RingGeometry(r - 0.02, r, 40);
    t.selectionRing.position.set(p.x, 0.015, p.z);
    t.selectionRing.visible = true;
  }, [selectedId, placed]);

  /* ---------- acciones ---------- */
  const addItem = useCallback(
    (catalogId) => {
      const cat = getCatalogItem(catalogId);
      const pos = findFreePosition(placed, room.width, room.length, cat.w, cat.d);
      const id = `${catalogId}-${Date.now()}`;
      setPlaced((prev) => [...prev, { id, catalogId, x: pos.x, z: pos.z, rotY: 0 }]);
      setSelectedId(id);
    },
    [placed, room.width, room.length]
  );

  const nudge = (dx, dz) => {
    setPlaced((prev) =>
      prev.map((p) => {
        if (p.id !== selectedId) return p;
        const cat = getCatalogItem(p.catalogId);
        const { x, z } = clampToRoom(p.x + dx, p.z + dz, cat.w, cat.d, room.width, room.length);
        return { ...p, x, z };
      })
    );
  };
  const rotateSelected = () => setPlaced((prev) => prev.map((p) => (p.id === selectedId ? { ...p, rotY: p.rotY + Math.PI / 2 } : p)));
  const removeSelected = () => {
    setPlaced((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  };
  const resetView = () => {
    camState.current.theta = 0.7;
    camState.current.phi = 1.05;
    camState.current.radius = Math.max(room.width, room.length) * 1.35 + 2.2;
  };
  const topView = () => {
    camState.current.theta = 0.001;
    camState.current.phi = 0.32;
  };
  const zoom = (delta) => {
    camState.current.radius = Math.min(16, Math.max(2, camState.current.radius + delta));
  };

  const filteredCatalog = useMemo(() => CATALOG.filter((c) => catTab === "Todas" || c.category === catTab), [catTab]);

  const total = useMemo(() => placed.reduce((sum, p) => sum + getCatalogItem(p.catalogId).price, 0), [placed]);
  const selectedItem = placed.find((p) => p.id === selectedId);
  const selectedCat = selectedItem ? getCatalogItem(selectedItem.catalogId) : null;

  const setRoomField = (field, value) => setRoom((r) => ({ ...r, [field]: value }));

  const waMessage = useMemo(() => {
    if (placed.length === 0) return "";
    const lines = placed.map((p) => {
      const c = getCatalogItem(p.catalogId);
      return `• ${c.name} — $${c.price}`;
    });
    return encodeURIComponent(
      `Hola ${STORE.name}, quiero cotizar este espacio diseñado en la app:\n\n${lines.join("\n")}\n\nTotal aprox: $${total.toLocaleString()}\nCuarto: ${room.width}×${room.length} m`
    );
  }, [placed, total, room.width, room.length]);
  const waLink = `https://wa.me/${STORE.whatsapp}?text=${waMessage}`;

  return (
    <div className="croquis-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .croquis-root{
          --bg:#F5F2EC; --ink:${STORE.ink}; --brand:${STORE.primary}; --brand-dark:${STORE.primaryDark};
          --brand-light:#7C948B; --walnut:#96602F; --line:#DED7C7; --panel:#FCFAF6;
          font-family:'Inter',sans-serif; color:var(--ink); background:var(--bg);
          min-height:100vh; display:flex; flex-direction:column;
        }
        .croquis-root .disp{ font-family:'Space Grotesk',sans-serif; }
        .croquis-root .mono{ font-family:'IBM Plex Mono',monospace; }
        .swatch{ width:26px; height:26px; border-radius:6px; cursor:pointer; border:2px solid transparent; flex-shrink:0; }
        .swatch.active{ border-color:var(--brand); box-shadow:0 0 0 2px #F5F2EC, 0 0 0 3px var(--brand); }
        .cardline{ border:1px solid var(--line); background:var(--panel); }
        .tabpill{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.02em; padding:5px 10px; border-radius:999px; border:1px solid var(--line); white-space:nowrap; }
        .tabpill.active{ background:var(--brand); color:#fff; border-color:var(--brand); }
        .catcard{ border:1px solid var(--line); background:var(--panel); transition:border-color .15s; }
        .catcard:hover{ border-color:var(--brand-light); }
        .btn-primary{ background:var(--brand); color:#fff; }
        .btn-primary:hover{ background:var(--brand-dark); }
        .btn-wa{ background:#25D366; color:#fff; }
        .btn-wa:hover{ background:#1DA851; }
        .ctrlbtn{ background:#fff; border:1px solid var(--line); }
        .ctrlbtn:active{ background:var(--bg); }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button{ opacity:1; }
      `}</style>

      {/* Header — todo lo que ves aquí sale de STORE, así se re-marca por tienda */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center disp font-bold text-white" style={{ background: "var(--brand)" }}>
            {STORE.logoLetter}
          </div>
          <div>
            <div className="disp font-bold text-base leading-none">{STORE.name}</div>
            <span className="mono text-[10px]" style={{ color: "var(--brand-light)" }}>visualizador de espacios</span>
          </div>
        </div>
        <span className="mono text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: "var(--line)", color: "var(--walnut)" }}>
          MARCA BLANCA
        </span>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
        {/* Columna izquierda */}
        <div className="hidden lg:flex lg:w-[280px] flex-shrink-0 flex-col gap-4 order-1">
          <div className="cardline rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler size={16} style={{ color: "var(--brand)" }} />
              <h3 className="disp font-semibold text-sm">Dimensiones del cuarto</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { key: "width", label: "Ancho" },
                { key: "length", label: "Largo" },
                { key: "height", label: "Altura" },
              ].map((f) => (
                <label key={f.key} className="text-[11px] flex flex-col gap-1">
                  <span style={{ color: "var(--brand-light)" }}>{f.label} (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    min={f.key === "height" ? 2.2 : 2}
                    max={f.key === "height" ? 3.6 : 9}
                    value={room[f.key]}
                    onChange={(e) => setRoomField(f.key, Math.min(f.key === "height" ? 3.6 : 9, Math.max(f.key === "height" ? 2.2 : 2, Number(e.target.value) || 0)))}
                    className="mono w-full border rounded px-1.5 py-1 text-sm"
                    style={{ borderColor: "var(--line)" }}
                  />
                </label>
              ))}
            </div>
            <div className="mb-3">
              <div className="text-[11px] mb-1.5 flex items-center gap-1" style={{ color: "var(--brand-light)" }}>
                <Palette size={12} /> Color de pared
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {WALL_COLORS.map((c) => (
                  <button key={c.hex} title={c.name} className={`swatch ${room.wallColor === c.hex ? "active" : ""}`} style={{ background: c.hex }} onClick={() => setRoomField("wallColor", c.hex)} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-1.5 flex items-center gap-1" style={{ color: "var(--brand-light)" }}>
                <Home size={12} /> Color de piso
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {FLOOR_COLORS.map((c) => (
                  <button key={c.hex} title={c.name} className={`swatch ${room.floorColor === c.hex ? "active" : ""}`} style={{ background: c.hex }} onClick={() => setRoomField("floorColor", c.hex)} />
                ))}
              </div>
            </div>
          </div>

          {selectedItem && selectedCat && (
            <div className="cardline rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Move size={16} style={{ color: "var(--brand)" }} />
                <h3 className="disp font-semibold text-sm">{selectedCat.name}</h3>
              </div>
              <p className="mono text-[11px] mb-3" style={{ color: "var(--walnut)" }}>
                {selectedCat.w}×{selectedCat.d}×{selectedCat.h} m · ${selectedCat.price}
              </p>
              <div className="grid grid-cols-3 gap-1.5 w-[140px] mx-auto mb-3">
                <div />
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, -0.1)}><ArrowUp size={14} /></button>
                <div />
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(-0.1, 0)}><ArrowLeft size={14} /></button>
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={rotateSelected}><RotateCw size={14} /></button>
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0.1, 0)}><ArrowRight size={14} /></button>
                <div />
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, 0.1)}><ArrowDown size={14} /></button>
                <div />
              </div>
              <button onClick={removeSelected} className="w-full flex items-center justify-center gap-1.5 text-[12px] py-1.5 rounded border" style={{ borderColor: "#B0472F55", color: "#B0472F" }}>
                <Trash2 size={13} /> Quitar del espacio
              </button>
            </div>
          )}
        </div>

        {/* Centro: visor 3D + catálogo */}
        <div className="flex-1 flex flex-col gap-2 order-2 min-w-0">
          <div className="relative rounded-xl overflow-hidden cardline" style={{ height: 420 }}>
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
              <button onClick={() => zoom(-0.8)} className="ctrlbtn rounded-lg p-2 shadow-sm"><Plus size={14} /></button>
              <button onClick={() => zoom(0.8)} className="ctrlbtn rounded-lg p-2 shadow-sm"><Minus size={14} /></button>
              <button onClick={topView} title="Vista de planta" className="ctrlbtn rounded-lg p-2 shadow-sm"><Compass size={14} /></button>
              <button onClick={resetView} title="Reiniciar vista" className="ctrlbtn rounded-lg p-2 shadow-sm mono text-[9px]">RST</button>
            </div>
            <div className="absolute bottom-2 left-2 mono text-[10px] px-2 py-1 rounded bg-white/85" style={{ color: "var(--brand-light)" }}>
              arrastra para rotar · rueda o +/- para zoom
            </div>
          </div>

          <div className="cardline rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-4 pb-2.5 flex items-center gap-2">
              <ShoppingCart size={16} style={{ color: "var(--brand)" }} />
              <h3 className="disp font-semibold text-sm">Catálogo {STORE.name}</h3>
            </div>
            <div className="flex gap-1.5 overflow-x-auto px-4 pb-2">
              {["Todas", ...CATEGORIES].map((c) => (
                <button key={c} className={`tabpill ${catTab === c ? "active" : ""}`} onClick={() => setCatTab(c)}>{c}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-1 min-h-0">
              <div className="grid sm:grid-cols-2 gap-2.5">
                {filteredCatalog.map((item) => (
                  <div key={item.id} className="catcard rounded-lg p-2.5 flex gap-2.5 items-center">
                    <div className="w-11 h-11 rounded-md flex-shrink-0" style={{ background: item.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium leading-tight truncate">{item.name}</p>
                      <p className="mono text-[10px]" style={{ color: "var(--brand-light)" }}>{item.w}×{item.d} m</p>
                      <p className="mono text-[11px] font-semibold" style={{ color: "var(--walnut)" }}>${item.price}</p>
                    </div>
                    <button onClick={() => addItem(item.id)} className="btn-primary rounded-md p-1.5 flex-shrink-0"><Plus size={14} /></button>
                  </div>
                ))}
                {filteredCatalog.length === 0 && <p className="text-[12px] col-span-2 py-4 text-center" style={{ color: "var(--brand-light)" }}>Sin resultados en este filtro.</p>}
              </div>
            </div>
            <div className="border-t px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <div className="min-w-0">
                <p className="disp font-bold text-lg">
                  {placed.length} {placed.length === 1 ? "pieza" : "piezas"} · ${total.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={placed.length ? waLink : undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { if (!placed.length) e.preventDefault(); }}
                  className="btn-wa rounded-lg px-3.5 py-2.5 text-sm font-medium flex items-center gap-2 flex-shrink-0"
                  style={{ opacity: placed.length ? 1 : 0.4, pointerEvents: placed.length ? "auto" : "none" }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <button
                  disabled={placed.length === 0}
                  onClick={() => { setSent(true); setTimeout(() => setSent(false), 4000); }}
                  className="btn-primary rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 disabled:opacity-40 flex-shrink-0"
                >
                  {sent ? (<><Check size={15} /> Enviada</>) : "Enviar cotización"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
