import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { createClient } from "@supabase/supabase-js";
import { RotateCw, Trash2, Plus, Minus, Home, Palette, Ruler, ShoppingCart, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, Check, MessageCircle } from "lucide-react";

const SUPABASE_URL = "https://yqkvxceisuhxgndwxoqa.supabase.co";
const SUPABASE_KEY = "sb_publishable_cmerPO_b3ygWKd59fyz1yQ_oMrQmVJK";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const STORE_SLUG = "mueble-roble";

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

const box = (w, h, d, color, roughness = 0.75) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 }));
const cyl = (rt, rb, h, color, roughness = 0.6, seg = 10) =>
  new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 }));

const LEG_COLOR = "#2B2420";
const METAL = new THREE.MeshStandardMaterial({ color: "#8a8a86", metalness: 0.6, roughness: 0.3 });

function buildLegs(w, d, h, thick = 0.04) {
  const group = new THREE.Group();
  const offsets = [
    [w / 2 - thick, d / 2 - thick], [-(w / 2 - thick), d / 2 - thick],
    [w / 2 - thick, -(d / 2 - thick)], [-(w / 2 - thick), -(d / 2 - thick)],
  ];
  offsets.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(thick * 2, h, thick * 2), new THREE.MeshStandardMaterial({ color: LEG_COLOR, roughness: 0.6 }));
    leg.position.set(x, h / 2, z);
    group.add(leg);
  });
  return group;
}

function buildTaperedLegs(w, d, h, topR = 0.028, botR = 0.016, inset = 0.06) {
  const group = new THREE.Group();
  const offsets = [
    [w / 2 - inset, d / 2 - inset], [-(w / 2 - inset), d / 2 - inset],
    [w / 2 - inset, -(d / 2 - inset)], [-(w / 2 - inset), -(d / 2 - inset)],
  ];
  offsets.forEach(([x, z]) => {
    const leg = cyl(topR, botR, h, LEG_COLOR, 0.55, 8);
    leg.position.set(x, h / 2, z);
    group.add(leg);
  });
  return group;
}

function cushion(w, h, d, color, topInset = 0.85) {
  const grp = new THREE.Group();
  const base = box(w, h * 0.6, d, color, 0.85);
  base.position.y = h * 0.3;
  const top = box(w * topInset, h * 0.45, d * topInset, color, 0.9);
  top.position.y = h * 0.6 + h * 0.225 - h * 0.05;
  grp.add(base, top);
  return grp;
}

function rolledArm(armW, armH, d, color) {
  const grp = new THREE.Group();
  const body = box(armW, armH, d, color, 0.8);
  body.position.y = armH / 2;
  const roll = cyl(armW / 2, armW / 2, d, color, 0.8, 12);
  roll.rotation.z = Math.PI / 2;
  roll.rotation.y = Math.PI / 2;
  roll.position.set(0, armH, 0);
  grp.add(body, roll);
  return grp;
}

function buildFurniture(type, w, d, h, color) {
  const g = new THREE.Group();
  switch (type) {
    case "sofa": {
      const legH = h * 0.14;
      const seatY = legH;
      const frame = box(w * 0.97, h * 0.32, d * 0.95, "#3A332C", 0.7);
      frame.position.y = seatY + h * 0.16;
      g.add(frame, buildTaperedLegs(w, d, legH, 0.03, 0.018, 0.07));
      const seatCount = 3;
      const seatW = (w * 0.92) / seatCount;
      const gap = seatW * 0.04;
      for (let i = 0; i < seatCount; i++) {
        const c = cushion(seatW - gap, h * 0.28, d * 0.82, color);
        c.position.set(-w * 0.46 + seatW * (i + 0.5), seatY + h * 0.32, -d * 0.03);
        g.add(c);
      }
      for (let i = 0; i < seatCount; i++) {
        const c = cushion(seatW - gap, h * 0.42, d * 0.18, color, 0.8);
        c.position.set(-w * 0.46 + seatW * (i + 0.5), seatY + h * 0.32 + h * 0.24, -d / 2 + d * 0.1);
        g.add(c);
      }
      const armL = rolledArm(w * 0.09, h * 0.58, d, color);
      armL.position.set(-w / 2 + w * 0.045, seatY, 0);
      const armR = rolledArm(w * 0.09, h * 0.58, d, color);
      armR.position.set(w / 2 - w * 0.045, seatY, 0);
      g.add(armL, armR);
      break;
    }
    case "armchair": {
      const legH = h * 0.14;
      const seatY = legH;
      const frame = box(w * 0.95, h * 0.3, d * 0.92, "#3A332C", 0.7);
      frame.position.y = seatY + h * 0.15;
      g.add(frame, buildTaperedLegs(w, d, legH, 0.03, 0.018, 0.09));
      const seat = cushion(w * 0.78, h * 0.3, d * 0.8, color);
      seat.position.set(0, seatY + h * 0.3, -d * 0.02);
      const back = cushion(w * 0.8, h * 0.46, d * 0.2, color, 0.8);
      back.position.set(0, seatY + h * 0.3 + h * 0.26, -d / 2 + d * 0.11);
      const armL = rolledArm(w * 0.13, h * 0.55, d, color);
      armL.position.set(-w / 2 + w * 0.065, seatY, 0);
      const armR = rolledArm(w * 0.13, h * 0.55, d, color);
      armR.position.set(w / 2 - w * 0.065, seatY, 0);
      g.add(seat, back, armL, armR);
      break;
    }
    case "chair": {
      const legH = h * 0.48;
      const seat = box(w, h * 0.07, d, color, 0.7);
      seat.position.y = legH;
      const cushionTop = box(w * 0.92, h * 0.04, d * 0.9, color, 0.9);
      cushionTop.position.y = legH + h * 0.045 + h * 0.02;
      const slatCount = 3;
      for (let i = 0; i < slatCount; i++) {
        const slat = box(w * 0.12, h * 0.42, 0.025, color, 0.75);
        slat.position.set(-w * 0.32 + (w * 0.64 * i) / (slatCount - 1), legH + h * 0.07 + h * 0.21, -d / 2 + 0.02);
        g.add(slat);
      }
      const topRail = box(w * 0.85, 0.03, 0.03, color, 0.75);
      topRail.position.set(0, legH + h * 0.07 + h * 0.42, -d / 2 + 0.02);
      g.add(seat, cushionTop, topRail, buildTaperedLegs(w, d, legH, 0.022, 0.014, 0.03));
      break;
    }
    case "table": {
      const skirt = box(w * 0.94, 0.05, d * 0.9, color, 0.5);
      skirt.position.y = h - 0.08;
      const top = box(w, 0.04, d, color, 0.35);
      top.position.y = h - 0.02;
      g.add(top, skirt, buildTaperedLegs(w, d, h - 0.1, 0.026, 0.017, 0.045));
      break;
    }
    case "bed": {
      const frame = box(w, h * 0.28, d, "#2B2320");
      frame.position.y = h * 0.14;
      const mattress = box(w * 0.96, h * 0.36, d * 0.96, color, 0.9);
      mattress.position.y = h * 0.28 + h * 0.18;
      const pillowTop = box(w * 0.96, h * 0.1, d * 0.96, "#FAF8F3", 0.95);
      pillowTop.position.y = h * 0.28 + h * 0.36 + h * 0.05;
      const pillowL = box(w * 0.26, h * 0.16, d * 0.2, "#FFFFFF", 0.95);
      pillowL.position.set(-w * 0.22, h * 0.28 + h * 0.41 + h * 0.08, -d / 2 + d * 0.15);
      const pillowR = pillowL.clone();
      pillowR.position.x = w * 0.22;
      const throw_ = box(w * 0.96, h * 0.09, d * 0.22, "#4A5A3C", 0.9);
      throw_.position.set(0, h * 0.28 + h * 0.41, d / 2 - d * 0.14);
      const headboard = box(w, h * 0.85, 0.07, color, 0.85);
      headboard.position.set(0, h * 0.425, -d / 2 - 0.025);
      const trim = box(w * 0.92, 0.03, 0.08, "#2B2320", 0.6);
      trim.position.set(0, h * 0.6, -d / 2 - 0.02);
      g.add(frame, mattress, pillowTop, pillowL, pillowR, throw_, headboard, trim, buildLegs(w * 0.9, d * 0.9, h * 0.1, 0.03));
      break;
    }
    case "closet": {
      const plinth = box(w * 0.96, h * 0.05, d * 0.9, "#2B2320", 0.6);
      plinth.position.y = h * 0.025;
      const body = box(w, h * 0.92, d, color, 0.6);
      body.position.y = h * 0.05 + h * 0.46;
      const cornice = box(w * 1.02, 0.04, d * 1.02, color, 0.5);
      cornice.position.y = h * 0.97 + 0.02;
      const seam = box(0.012, h * 0.85, 0.01, "#00000030", 0.9);
      seam.position.set(0, h * 0.5, d / 2 + 0.006);
      const panelL = box(w * 0.4, h * 0.7, 0.01, new THREE.Color(color).multiplyScalar(0.9), 0.7);
      panelL.position.set(-w * 0.24, h * 0.5, d / 2 + 0.007);
      const panelR = panelL.clone();
      panelR.position.x = w * 0.24;
      const handle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), METAL);
      handle1.rotation.z = Math.PI / 2;
      handle1.position.set(-0.07, h * 0.5, d / 2 + 0.025);
      const handle2 = handle1.clone();
      handle2.position.x = 0.07;
      g.add(plinth, body, cornice, seam, panelL, panelR, handle1, handle2);
      break;
    }
    case "nightstand": {
      const legH = h * 0.15;
      const body = box(w, h * 0.75, d, color, 0.6);
      body.position.y = legH + h * 0.375;
      const drawer = box(w * 0.82, h * 0.28, 0.012, new THREE.Color(color).multiplyScalar(0.92), 0.7);
      drawer.position.set(0, legH + h * 0.55, d / 2 + 0.008);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), METAL);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, legH + h * 0.55, d / 2 + 0.02);
      const top = box(w * 1.04, 0.025, d * 1.04, color, 0.4);
      top.position.y = legH + h * 0.75 + 0.0125;
      g.add(body, drawer, handle, top, buildTaperedLegs(w, d, legH, 0.02, 0.013, 0.03));
      break;
    }
    default: {
      const bodyM = box(w, h, d, color);
      bodyM.position.y = h / 2;
      g.add(bodyM);
    }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return g;
}

function createTextSprite(text, color, fontSize = 46) {
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
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(canvas.width * 0.011, canvas.height * 0.011, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function dashedLine(points, color) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.85 }));
  line.computeLineDistances();
  return line;
}

function findFreePosition(existing, catalogById, roomW, roomL, w, d) {
  const margin = 0.25;
  const footprint = Math.max(w, d);
  const halfW = Math.max(roomW / 2 - footprint / 2 - margin, 0);
  const halfL = Math.max(roomL / 2 - footprint / 2 - margin, 0);
  const radius = footprint / 2 + 0.12;
  for (let gz = -halfL; gz <= halfL + 0.001; gz += 0.45) {
    for (let gx = -halfW; gx <= halfW + 0.001; gx += 0.45) {
      let ok = true;
      for (const e of existing) {
        const ec = catalogById.get(e.catalogId);
        const er = Math.max(ec.w, ec.d) / 2 + 0.12;
        if (Math.hypot(gx - e.x, gz - e.z) < radius + er) { ok = false; break; }
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

export default function CroquisApp() {
  const [store, setStore] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loadStatus, setLoadStatus] = useState("cargando");
  const [loadError, setLoadError] = useState("");


  const [room, setRoom] = useState({ width: 4, length: 2.8, height: 2.6, wallColor: "#F5F2EC", floorColor: "#C9A66B" });
  const [roomDraft, setRoomDraft] = useState({ width: "4", length: "2.8", height: "2.6" });
  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [catTab, setCatTab] = useState("Todas");
  const [sent, setSent] = useState(false);

  const mountRef = useRef(null);
  const threeRef = useRef({});
  const camState = useRef({ theta: 0.7, phi: 1.05, radius: 7, target: new THREE.Vector3(0, 0.8, 0) });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, moved: 0 });
  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);

    useEffect(() => {
    (async () => {
     try {
      const { data: storeRow, error: storeErr } = await supabase.from("stores").select("*").eq("slug", STORE_SLUG).single();
      if (storeErr || !storeRow) { setLoadStatus("error"); setLoadError(storeErr?.message || "tienda no encontrada"); return; }
      setStore(storeRow);
      const { data: cats } = await supabase.from("categories").select("*").eq("store_id", storeRow.id).order("sort_order");
      const catNameById = new Map((cats || []).map((c) => [c.id, c.name]));
      setCategoryNames((cats || []).map((c) => c.name));
      const { data: prods, error: prodErr } = await supabase.from("products").select("*").eq("store_id", storeRow.id).eq("is_active", true);
      if (prodErr) { setLoadStatus("error"); return; }
      setCatalog((prods || []).map((p) => ({
        id: p.id, name: p.name, category: catNameById.get(p.category_id) || "General",
        type: p.furniture_type, w: Number(p.width_m), d: Number(p.depth_m), h: Number(p.height_m),
        color: p.color_hex, price: Number(p.price),
      })));
           setLoadStatus("listo");
     } catch (err) {
       setLoadStatus("error");
       setLoadError(err?.message || String(err));
     }
    })();
  }, []);


  useEffect(() => {
    if (loadStatus !== "listo") return;
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
      new THREE.MeshBasicMaterial({ color: store.primary_color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.visible = false;
    scene.add(roomGroup, itemsGroup, selectionRing);

    threeRef.current = { scene, camera, renderer, roomGroup, itemsGroup, selectionRing, meshes: new Map() };

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
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
    const loop = () => { updateCamera(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();

    const dom = renderer.domElement;
    const onDown = (e) => { dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY, moved: 0 }; };
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
      if (dragRef.current.dragging && dragRef.current.moved < 6) doRaycastSelect(e);
      dragRef.current.dragging = false;
    };
    const onWheel = (e) => { e.preventDefault(); camState.current.radius = Math.min(16, Math.max(2, camState.current.radius + e.deltaY * 0.003)); };
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
      } else setSelectedId(null);
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
  }, [loadStatus]);

  useEffect(() => {
    const t = threeRef.current;
    if (!t.roomGroup || !store) return;
    t.roomGroup.clear();
    const { width, length, height, wallColor, floorColor } = room;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.85 }));
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

    const zFront = length / 2 + 0.35;
    t.roomGroup.add(dashedLine([new THREE.Vector3(-width / 2, 0.01, zFront), new THREE.Vector3(width / 2, 0.01, zFront)], store.primary_color));
    const wLabel = createTextSprite(`${width.toFixed(2)} m`, store.primary_color);
    wLabel.position.set(0, 0.35, zFront + 0.15);
    t.roomGroup.add(wLabel);

    const xSide = width / 2 + 0.35;
    t.roomGroup.add(dashedLine([new THREE.Vector3(xSide, 0.01, -length / 2), new THREE.Vector3(xSide, 0.01, length / 2)], store.primary_color));
    const lLabel = createTextSprite(`${length.toFixed(2)} m`, store.primary_color);
    lLabel.position.set(xSide + 0.55, 0.35, 0);
    t.roomGroup.add(lLabel);

    camState.current.target.set(0, height * 0.35, 0);
    camState.current.radius = Math.max(width, length) * 1.35 + 2.2;

    setPlaced((prev) => prev.map((p) => {
      const cat = catalogById.get(p.catalogId);
      const { x, z } = clampToRoom(p.x, p.z, cat.w, cat.d, width, length);
      return { ...p, x, z };
    }));
  }, [room.width, room.length, room.height, room.wallColor, room.floorColor, store]);

  useEffect(() => {
    const t = threeRef.current;
    if (!t.itemsGroup) return;
    const meshes = t.meshes;
    const currentIds = new Set(placed.map((p) => p.id));
    for (const [id, mesh] of meshes) { if (!currentIds.has(id)) { t.itemsGroup.remove(mesh); meshes.delete(id); } }
    placed.forEach((p) => {
      const cat = catalogById.get(p.catalogId);
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
  }, [placed, catalogById]);

  useEffect(() => {
    const t = threeRef.current;
    if (!t.selectionRing) return;
    const p = placed.find((i) => i.id === selectedId);
    if (!p) { t.selectionRing.visible = false; return; }
    const cat = catalogById.get(p.catalogId);
    const r = Math.max(cat.w, cat.d) / 2 + 0.1;
    t.selectionRing.geometry.dispose();
    t.selectionRing.geometry = new THREE.RingGeometry(r - 0.02, r, 40);
    t.selectionRing.position.set(p.x, 0.015, p.z);
    t.selectionRing.visible = true;
  }, [selectedId, placed, catalogById]);

  const addItem = useCallback((catalogId) => {
    const cat = catalogById.get(catalogId);
    const pos = findFreePosition(placed, catalogById, room.width, room.length, cat.w, cat.d);
    const id = `${catalogId}-${Date.now()}`;
    setPlaced((prev) => [...prev, { id, catalogId, x: pos.x, z: pos.z, rotY: 0 }]);
    setSelectedId(id);
  }, [placed, catalogById, room.width, room.length]);

  const nudge = (dx, dz) => {
    setPlaced((prev) => prev.map((p) => {
      if (p.id !== selectedId) return p;
      const cat = catalogById.get(p.catalogId);
      const { x, z } = clampToRoom(p.x + dx, p.z + dz, cat.w, cat.d, room.width, room.length);
      return { ...p, x, z };
    }));
  };
  const rotateSelected = () => setPlaced((prev) => prev.map((p) => (p.id === selectedId ? { ...p, rotY: p.rotY + Math.PI / 2 } : p)));
  const removeSelected = () => { setPlaced((prev) => prev.filter((p) => p.id !== selectedId)); setSelectedId(null); };
  const resetView = () => { camState.current.theta = 0.7; camState.current.phi = 1.05; camState.current.radius = Math.max(room.width, room.length) * 1.35 + 2.2; };
  const topView = () => { camState.current.theta = 0.001; camState.current.phi = 0.32; };
  const zoom = (delta) => { camState.current.radius = Math.min(16, Math.max(2, camState.current.radius + delta)); };

  const filteredCatalog = useMemo(() => catalog.filter((c) => catTab === "Todas" || c.category === catTab), [catalog, catTab]);
  const total = useMemo(() => placed.reduce((sum, p) => sum + catalogById.get(p.catalogId).price, 0), [placed, catalogById]);
  const selectedItem = placed.find((p) => p.id === selectedId);
  const selectedCat = selectedItem ? catalogById.get(selectedItem.catalogId) : null;
  const setRoomField = (field, value) => setRoom((r) => ({ ...r, [field]: value }));

  const sendQuote = async () => {
    if (placed.length === 0 || !store) return;
    const { data: quote, error } = await supabase.from("quotes").insert({ store_id: store.id, total, status: "nueva" }).select().single();
    if (!error && quote) {
      const items = placed.map((p) => ({ quote_id: quote.id, product_id: p.catalogId, price_at_quote: catalogById.get(p.catalogId).price }));
      await supabase.from("quote_items").insert(items);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    }
  };

  const waMessage = useMemo(() => {
    if (placed.length === 0 || !store) return "";
    const lines = placed.map((p) => { const c = catalogById.get(p.catalogId); return `• ${c.name} — $${c.price}`; });
    return encodeURIComponent(`Hola ${store.name}, quiero cotizar este espacio diseñado en la app:\n\n${lines.join("\n")}\n\nTotal aprox: $${total.toLocaleString()}\nCuarto: ${room.width}×${room.length} m`);
  }, [placed, total, room.width, room.length, store, catalogById]);
  const waLink = store ? `https://wa.me/${store.whatsapp_number}?text=${waMessage}` : "#";

  if (loadStatus === "cargando") {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>Cargando catálogo…</div>;
  }
  if (loadStatus === "error" || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>
                No se pudo cargar la tienda "{STORE_SLUG}".<br/>Detalle: {loadError}

      </div>
    );
  }

  return (
    <div className="croquis-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .croquis-root{
          --bg:#F5F2EC; --ink:#211D18; --brand:${store.primary_color}; --brand-dark:${store.primary_color};
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

      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center disp font-bold text-white" style={{ background: "var(--brand)" }}>
            {store.name?.[0] || "T"}
          </div>
          <div>
            <div className="disp font-bold text-base leading-none">{store.name}</div>
            <span className="mono text-[10px]" style={{ color: "var(--brand-light)" }}>visualizador de espacios</span>
          </div>
        </div>
        <span className="mono text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: "var(--line)", color: "var(--walnut)" }}>
          CONECTADO
        </span>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
        <div className="lg:w-[280px] flex-shrink-0 flex flex-col gap-4 order-1">
          <div className="cardline rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler size={16} style={{ color: "var(--brand)" }} />
              <h3 className="disp font-semibold text-sm">Dimensiones del cuarto</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[{ key: "width", label: "Ancho" }, { key: "length", label: "Largo" }, { key: "height", label: "Altura" }].map((f) => (
                <label key={f.key} className="text-[11px] flex flex-col gap-1">
                  <span style={{ color: "var(--brand-light)" }}>{f.label} (m)</span>
                  <input
                    type="number" step="0.1" inputMode="decimal"
                    value={roomDraft[f.key]}
                    onChange={(e) => setRoomDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                    onBlur={(e) => {
                      const min = f.key === "height" ? 2 : 1.5;
                      const max = f.key === "height" ? 5 : 10;
                      const n = Number(e.target.value);
                      const clamped = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : room[f.key];
                      setRoomField(f.key, clamped);
                      setRoomDraft((d) => ({ ...d, [f.key]: String(clamped) }));
                    }}
                    className="mono w-full border rounded px-1.5 py-1 text-sm" style={{ borderColor: "var(--line)" }}
                  />
                </label>
              ))}
            </div>
            <div className="mb-3">
              <div className="text-[11px] mb-1.5 flex items-center gap-1" style={{ color: "var(--brand-light)" }}><Palette size={12} /> Color de pared</div>
              <div className="flex gap-1.5 flex-wrap">{WALL_COLORS.map((c) => <button key={c.hex} title={c.name} className={`swatch ${room.wallColor === c.hex ? "active" : ""}`} style={{ background: c.hex }} onClick={() => setRoomField("wallColor", c.hex)} />)}</div>
            </div>
            <div>
              <div className="text-[11px] mb-1.5 flex items-center gap-1" style={{ color: "var(--brand-light)" }}><Home size={12} /> Color de piso</div>
              <div className="flex gap-1.5 flex-wrap">{FLOOR_COLORS.map((c) => <button key={c.hex} title={c.name} className={`swatch ${room.floorColor === c.hex ? "active" : ""}`} style={{ background: c.hex }} onClick={() => setRoomField("floorColor", c.hex)} />)}</div>
            </div>
          </div>

          {selectedItem && selectedCat && (
            <div className="cardline rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Move size={16} style={{ color: "var(--brand)" }} /><h3 className="disp font-semibold text-sm">{selectedCat.name}</h3></div>
              <p className="mono text-[11px] mb-3" style={{ color: "var(--walnut)" }}>{selectedCat.w}×{selectedCat.d}×{selectedCat.h} m · ${selectedCat.price}</p>
              <div className="grid grid-cols-3 gap-1.5 w-[140px] mx-auto mb-3">
                <div /><button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, -0.1)}><ArrowUp size={14} /></button><div />
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(-0.1, 0)}><ArrowLeft size={14} /></button>
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={rotateSelected}><RotateCw size={14} /></button>
                <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0.1, 0)}><ArrowRight size={14} /></button>
                <div /><button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, 0.1)}><ArrowDown size={14} /></button><div />
              </div>
              <button onClick={removeSelected} className="w-full flex items-center justify-center gap-1.5 text-[12px] py-1.5 rounded border" style={{ borderColor: "#B0472F55", color: "#B0472F" }}><Trash2 size={13} /> Quitar del espacio</button>
            </div>
          )}
        </div>

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

          <div className="cardline rounded-xl p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2.5">
              <ShoppingCart size={16} style={{ color: "var(--brand)" }} />
              <h3 className="disp font-semibold text-sm">Catálogo {store.name}</h3>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
              {["Todas", ...categoryNames].map((c) => (
                <button key={c} className={`tabpill ${catTab === c ? "active" : ""}`} onClick={() => setCatTab(c)}>{c}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: 260 }}>
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
        </div>
      </main>

      <div className="sticky bottom-0 border-t px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
        <div className="min-w-0">
          <p className="mono text-[10px]" style={{ color: "var(--brand-light)" }}>{placed.length} {placed.length === 1 ? "pieza" : "piezas"}</p>
          <p className="disp font-bold text-lg">${total.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={placed.length ? waLink : undefined} target="_blank" rel="noreferrer"
            onClick={(e) => { if (!placed.length) e.preventDefault(); }}
            className="btn-wa rounded-lg px-3.5 py-2.5 text-sm font-medium flex items-center gap-2 flex-shrink-0"
            style={{ opacity: placed.length ? 1 : 0.4, pointerEvents: placed.length ? "auto" : "none" }}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <button
            disabled={placed.length === 0} onClick={sendQuote}
            className="btn-primary rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 disabled:opacity-40 flex-shrink-0"
          >
            {sent ? (<><Check size={15} /> Enviada</>) : "Enviar cotización"}
          </button>
        </div>
      </div>
    </div>
  );
}
