import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { createClient } from "@supabase/supabase-js";
import { RotateCw, Trash2, Plus, Minus, Home, Palette, Ruler, ShoppingCart, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, Check, MessageCircle, LogOut, Store, Pencil, LayoutGrid, MessageSquareText, Phone, Clock, CircleDot, X, Mail, Lock } from "lucide-react";

/* ------------------------------------------------------------------ */
/* CONEXIÓN A SUPABASE                                                  */
/* ------------------------------------------------------------------ */
const SUPABASE_URL = "https://yqkvxceisuhxgndwxoqa.supabase.co";
const SUPABASE_KEY = "sb_publishable_cmerPO_b3ygWKd59fyz1yQ_oMrQmVJK";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Multi-tienda: la tienda a mostrar se decide por la dirección web.
// tuapp.com/mueble-roble -> muestra esa tienda. tuapp.com/ (sin nada) -> tienda de ejemplo.
function getStoreSlugFromPath() {
  if (typeof window === "undefined") return "mueble-roble";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path || path === "admin") return "mueble-roble";
  return path;
}

const WALL_COLORS = [
  { name: "Blanco cálido", hex: "#F5F2EC" },
  { name: "Marfil", hex: "#EDE6D6" },
  { name: "Gris piedra", hex: "#C9C6BC" },
  { name: "Gris perla", hex: "#DAD7D0" },
  { name: "Azul pizarra", hex: "#3E5560" },
  { name: "Azul niebla", hex: "#8FA3AC" },
  { name: "Verde salvia", hex: "#7C8C74" },
  { name: "Verde oliva", hex: "#5C6A44" },
  { name: "Terracota", hex: "#B06B47" },
  { name: "Arena rosa", hex: "#D9B7A3" },
  { name: "Mostaza suave", hex: "#C9A24B" },
  { name: "Grafito", hex: "#4A4640" },
];

const FLOOR_COLORS = [
  { name: "Roble claro", hex: "#C9A66B", finish: "wood" },
  { name: "Roble miel", hex: "#B98B52", finish: "wood" },
  { name: "Nogal oscuro", hex: "#5B4030", finish: "wood" },
  { name: "Nogal rojizo", hex: "#7A3E2E", finish: "wood" },
  { name: "Pino natural", hex: "#DCC28E", finish: "wood" },
  { name: "Cemento pulido", hex: "#B7B4AC", finish: "concrete" },
  { name: "Concreto oscuro", hex: "#8A867E", finish: "concrete" },
  { name: "Blanco piso", hex: "#EDEAE2", finish: "tile" },
  { name: "Porcelanato gris", hex: "#8C8C86", finish: "tile" },
  { name: "Mármol claro", hex: "#DCD6CC", finish: "marble" },
  { name: "Terracota piso", hex: "#A85C3F", finish: "tile" },
  { name: "Ébano", hex: "#2E241D", finish: "wood" },
];

/* ------------------------------------------------------------------ */
/* Constructores de muebles low-poly                                   */
/* ------------------------------------------------------------------ */

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
    case "window": {
      const frameMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.5 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frameMat);
      g.add(frame);
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.86, h * 0.8, 0.015),
        new THREE.MeshStandardMaterial({ color: "#AFC9D6", roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.55 })
      );
      glass.position.z = 0.025;
      g.add(glass);
      const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.03, h * 0.82, 0.03), frameMat);
      mullionV.position.z = 0.03;
      const mullionH = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.03, 0.03), frameMat);
      mullionH.position.z = 0.03;
      g.add(mullionV, mullionH);
      break;
    }
    case "tv": {
      const bezelMat = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.3, metalness: 0.4 });
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), bezelMat);
      g.add(bezel);
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.95, h * 0.92, 0.01),
        new THREE.MeshStandardMaterial({ color: "#2A3238", roughness: 0.2, metalness: 0.15 })
      );
      screen.position.z = 0.025;
      g.add(screen);
      const mount = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: "#2B2420", roughness: 0.6 }));
      mount.position.z = -0.05;
      g.add(mount);
      break;
    }
    case "painting": {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.035), new THREE.MeshStandardMaterial({ color: LEG_COLOR, roughness: 0.55 }));
      g.add(frame);
      const canvas = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, h * 0.85, 0.01), new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
      canvas.position.z = 0.02;
      g.add(canvas);
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

const WALL_ELEVATION = { window: 1.0, tv: 1.15, painting: 1.5 };
const isWallType = (type) => type === "window" || type === "tv" || type === "painting";

function findFreeWallX(existingWallItems, roomWidth, w) {
  const half = Math.max(roomWidth / 2 - w / 2 - 0.1, 0);
  for (let x = -half; x <= half + 0.001; x += 0.4) {
    let ok = true;
    for (const e of existingWallItems) {
      if (Math.abs(x - e.x) < w / 2 + e.w / 2 + 0.1) { ok = false; break; }
    }
    if (ok) return x;
  }
  return 0;
}

// Genera una textura real (madera/mosaico/concreto/mármol/yeso) pintándola con código, sin depender de fotos externas.
function createSurfaceTexture(baseHex, kind) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(baseHex);
  const darker = base.clone().multiplyScalar(0.84);
  const lighter = base.clone().multiplyScalar(1.14);
  const toCss = (c) => `#${c.getHexString()}`;
  ctx.fillStyle = toCss(base);
  ctx.fillRect(0, 0, size, size);

  if (kind === "wood") {
    for (let i = 0; i < 46; i++) {
      const y = Math.random() * size;
      ctx.strokeStyle = Math.random() > 0.5 ? toCss(darker) : toCss(lighter);
      ctx.globalAlpha = 0.05 + Math.random() * 0.09;
      ctx.lineWidth = 1 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (Math.random() * 6 - 3), size * 0.7, y + (Math.random() * 6 - 3), size, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = toCss(darker);
    ctx.lineWidth = 2;
    for (let x = 0; x <= size; x += size / 4) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke(); }
  } else if (kind === "tile") {
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = toCss(darker);
    ctx.lineWidth = 3;
    const grid = 4;
    for (let i = 0; i <= grid; i++) {
      const p = (size / grid) * i;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }
  } else if (kind === "concrete" || kind === "marble") {
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? toCss(darker) : toCss(lighter);
      ctx.globalAlpha = 0.035 + Math.random() * 0.05;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
    if (kind === "marble") {
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = toCss(lighter);
      for (let i = 0; i < 5; i++) {
        let x = Math.random() * size, y = 0;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 6; s++) { x += Math.random() * 60 - 30; y += size / 6; ctx.lineTo(x, y); }
        ctx.lineWidth = 1 + Math.random();
        ctx.stroke();
      }
    }
  } else {
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? toCss(darker) : toCss(lighter);
      ctx.globalAlpha = 0.02 + Math.random() * 0.03;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
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

// Igual que clampToRoom, pero si el cuarto es en L, permite que el mueble entre a la extensión.
function clampToRoomShape(x, z, w, d, roomW, roomL, isL, extW, extD) {
  const footprint = Math.max(w, d);
  const halfW = Math.max(roomW / 2 - footprint / 2 - 0.05, 0);
  const halfLBase = Math.max(roomL / 2 - footprint / 2 - 0.05, 0);
  const cx = Math.min(halfW, Math.max(-halfW, x));
  const stepX = roomW / 2 - extW;
  const inExt = isL && extW > 0.2 && extD > 0.2 && cx + footprint / 2 > stepX;
  const extraBack = inExt ? Math.max(extD - 0.05, 0) : 0;
  const zMin = -halfLBase - extraBack;
  const cz = Math.min(halfLBase, Math.max(zMin, z));
  return { x: cx, z: cz };
}

// "Imán" a las paredes: si arrastras un mueble cerca de una pared, se pega justo contra ella.
function snapToWalls(x, z, w, d, rotY, roomW, roomL, isL, extW, extD) {
  const k = ((Math.round(rotY / (Math.PI / 2)) % 4) + 4) % 4;
  const halfX = k % 2 === 0 ? w / 2 : d / 2;
  const halfZ = k % 2 === 0 ? d / 2 : w / 2;
  const margin = 0.015;
  const snapDist = 0.28;
  let nx = x, nz = z;
  if (x - halfX < -roomW / 2 + snapDist) nx = -roomW / 2 + halfX + margin;
  const stepX = roomW / 2 - (extW || 0);
  const inExt = isL && extW > 0.2 && extD > 0.2 && nx + halfX > stepX;
  const backWallZ = inExt ? -(roomL / 2 + extD) : -roomL / 2;
  if (z - halfZ < backWallZ + snapDist) nz = backWallZ + halfZ + margin;
  const halfWclamp = Math.max(roomW / 2 - halfX - 0.02, 0);
  const zMinClamp = inExt ? backWallZ + halfZ + 0.02 : -(Math.max(roomL / 2 - halfZ - 0.02, 0));
  const halfLclamp = Math.max(roomL / 2 - halfZ - 0.02, 0);
  return { x: Math.min(halfWclamp, Math.max(-halfWclamp, nx)), z: Math.min(halfLclamp, Math.max(zMinClamp, nz)) };
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

function CroquisApp() {
  const [store, setStore] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loadStatus, setLoadStatus] = useState("cargando");
  const [storeSlug] = useState(() => getStoreSlugFromPath());

  const [room, setRoom] = useState({ width: 4, length: 2.8, height: 2.6, wallColor: "#F5F2EC", floorColor: "#C9A66B", shape: "rect", extWidth: 1.5, extDepth: 1.5 });
  const [roomDraft, setRoomDraft] = useState({ width: "4", length: "2.8", height: "2.6", extWidth: "1.5", extDepth: "1.5" });
  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [catTab, setCatTab] = useState("Todas");
  const [sent, setSent] = useState(false);

  const mountRef = useRef(null);
  const threeRef = useRef({});
  const camState = useRef({ theta: 0.7, phi: 1.05, radius: 7, target: new THREE.Vector3(0, 0.8, 0) });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, moved: 0 });
  const furnitureDragRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const placedRef = useRef([]);
  const catalogByIdRef = useRef(new Map());
  const roomRef = useRef({ width: 4, length: 2.8 });
  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);
  useEffect(() => { placedRef.current = placed; }, [placed]);
  useEffect(() => { catalogByIdRef.current = catalogById; }, [catalogById]);
  useEffect(() => { roomRef.current = room; }, [room]);

  /* ---------- cargar datos reales de Supabase ---------- */
  useEffect(() => {
    (async () => {
      const { data: storeRow, error: storeErr } = await supabase.from("stores").select("*").eq("slug", storeSlug).single();
      if (storeErr || !storeRow) { setLoadStatus("error"); return; }
      setStore(storeRow);
      const { data: cats } = await supabase.from("categories").select("*").eq("store_id", storeRow.id).order("sort_order");
      const catNameById = new Map((cats || []).map((c) => [c.id, c.name]));
      setCategoryNames((cats || []).map((c) => c.name));
      const { data: prods, error: prodErr } = await supabase.from("products").select("*").eq("store_id", storeRow.id).eq("is_active", true);
      if (prodErr) { setLoadStatus("error"); return; }
      setCatalog((prods || []).map((p) => ({
        id: p.id, name: p.name, category: catNameById.get(p.category_id) || "General",
        type: p.furniture_type, w: Number(p.width_m), d: Number(p.depth_m), h: Number(p.height_m),
        color: p.color_hex, price: Number(p.price), photo: p.photo_url || null,
      })));
      setLoadStatus("listo");
    })();
  }, [storeSlug]);

  /* ---------- init three.js (una vez) ---------- */
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
    const selectionRing = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 0, -0.5),
        new THREE.Vector3(0.5, 0, 0.5), new THREE.Vector3(-0.5, 0, 0.5),
      ]),
      new THREE.LineBasicMaterial({ color: store.primary_color, transparent: true, opacity: 0.95, linewidth: 2 })
    );
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
    const raycaster = raycasterRef.current;
    const floorPlane = floorPlaneRef.current;
    const dragPoint = new THREE.Vector3();
    const getMouse = (e) => {
      const rect = dom.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    };
    const hitFurniture = (e) => {
      raycaster.setFromCamera(getMouse(e), camera);
      const hits = raycaster.intersectObjects(itemsGroup.children, true);
      if (hits.length === 0) return null;
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.itemId) obj = obj.parent;
      return obj.userData.itemId || null;
    };
    const onDown = (e) => {
      const id = hitFurniture(e);
      if (id) {
        furnitureDragRef.current = id;
        setSelectedId(id);
      } else {
        furnitureDragRef.current = null;
        dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
      }
    };
    const onMove = (e) => {
      if (furnitureDragRef.current) {
        const id = furnitureDragRef.current;
        const item = placedRef.current.find((p) => p.id === id);
        const cat = item ? catalogByIdRef.current.get(item.catalogId) : null;
        if (item && cat) {
          raycaster.setFromCamera(getMouse(e), camera);
          if (isWallType(cat.type)) {
            const isSide = item.wall === "side";
            const wallPlane = isSide
              ? new THREE.Plane(new THREE.Vector3(1, 0, 0), roomRef.current.width / 2)
              : new THREE.Plane(new THREE.Vector3(0, 0, 1), roomRef.current.length / 2);
            if (raycaster.ray.intersectPlane(wallPlane, dragPoint)) {
              const roomSpan = isSide ? roomRef.current.length : roomRef.current.width;
              const half = Math.max(roomSpan / 2 - cat.w / 2 - 0.05, 0);
              const raw = isSide ? dragPoint.z : dragPoint.x;
              const x = Math.min(half, Math.max(-half, raw));
              const minY = cat.h / 2 + 0.1;
              const maxY = roomRef.current.height - cat.h / 2 - 0.1;
              const elevY = Math.min(maxY, Math.max(minY, dragPoint.y));
              setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, x, elevY } : p)));
            }
          } else if (raycaster.ray.intersectPlane(floorPlane, dragPoint)) {
            const r = roomRef.current;
            const { x, z } = snapToWalls(dragPoint.x, dragPoint.z, cat.w, cat.d, item.rotY, r.width, r.length, r.shape === "L", r.extWidth, r.extDepth);
            setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, x, z } : p)));
          }
        }
        return;
      }
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
      if (furnitureDragRef.current) { furnitureDragRef.current = null; return; }
      if (dragRef.current.dragging && dragRef.current.moved < 6) doRaycastSelect(e);
      dragRef.current.dragging = false;
    };
    const onWheel = (e) => { e.preventDefault(); camState.current.radius = Math.min(16, Math.max(2, camState.current.radius + e.deltaY * 0.003)); };
    const doRaycastSelect = (e) => { setSelectedId(hitFurniture(e)); };

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

  /* ---------- reconstruir cuarto ---------- */
  useEffect(() => {
    const t = threeRef.current;
    if (!t.roomGroup || !store) return;
    t.roomGroup.clear();
    const { width, length, height, wallColor, floorColor, shape, extWidth, extDepth } = room;
    const isL = shape === "L";
    const extW = isL ? Math.min(extWidth, width - 0.6) : 0;
    const extD = isL ? Math.max(extDepth, 0) : 0;
    const stepX = width / 2 - extW;

    const floorSwatch = FLOOR_COLORS.find((c) => c.hex === floorColor);
    const floorFinish = floorSwatch?.finish || "wood";
    const makeFloorMat = (rw, rl) => {
      const tex = createSurfaceTexture(floorColor, floorFinish);
      tex.repeat.set(Math.max(rw, 1), Math.max(rl, 1));
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), makeFloorMat(width, length));
    floor.rotation.x = -Math.PI / 2;
    t.roomGroup.add(floor);

    if (isL && extW > 0.2 && extD > 0.2) {
      const extFloor = new THREE.Mesh(new THREE.PlaneGeometry(extW, extD), makeFloorMat(extW, extD));
      extFloor.rotation.x = -Math.PI / 2;
      extFloor.position.set(width / 2 - extW / 2, 0, -(length / 2 + extD / 2));
      t.roomGroup.add(extFloor);
    }

    const grid = new THREE.GridHelper(Math.max(width, length + extD) + 1, Math.round((Math.max(width, length + extD) + 1) * 2), "#00000022", "#00000015");
    grid.position.y = 0.005;
    t.roomGroup.add(grid);

    const makeWallMat = (span) => {
      const tex = createSurfaceTexture(wallColor, "plaster");
      tex.repeat.set(Math.max(span, 1), Math.max(height, 1));
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 1, side: THREE.DoubleSide });
    };

    if (isL && extW > 0.2 && extD > 0.2) {
      const backMainW = width - extW;
      const backMain = new THREE.Mesh(new THREE.PlaneGeometry(backMainW, height), makeWallMat(backMainW));
      backMain.position.set(-extW / 2, height / 2, -length / 2);
      const backExt = new THREE.Mesh(new THREE.PlaneGeometry(extW, height), makeWallMat(extW));
      backExt.position.set(width / 2 - extW / 2, height / 2, -(length / 2 + extD));
      const stepWall = new THREE.Mesh(new THREE.PlaneGeometry(extD, height), makeWallMat(extD));
      stepWall.rotation.y = Math.PI / 2;
      stepWall.position.set(stepX, height / 2, -(length / 2 + extD / 2));
      t.roomGroup.add(backMain, backExt, stepWall);
    } else {
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), makeWallMat(width));
      backWall.position.set(0, height / 2, -length / 2);
      t.roomGroup.add(backWall);
    }
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(length, height), makeWallMat(length));
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2, height / 2, 0);
    t.roomGroup.add(leftWall);

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

    camState.current.target.set(isL ? width * 0.12 : 0, height * 0.35, isL ? -extD * 0.3 : 0);
    camState.current.radius = Math.max(width, length + extD) * 1.35 + 2.2;

    setPlaced((prev) => prev.map((p) => {
      const cat = catalogById.get(p.catalogId);
      if (isWallType(cat.type)) return p;
      const { x, z } = clampToRoomShape(p.x, p.z, cat.w, cat.d, width, length, isL, extW, extD);
      return { ...p, x, z };
    }));
  }, [room.width, room.length, room.height, room.wallColor, room.floorColor, room.shape, room.extWidth, room.extDepth, store]);

  /* ---------- sincronizar muebles colocados ---------- */
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
      if (isWallType(cat.type)) {
        const elevY = p.elevY || WALL_ELEVATION[cat.type] || 1.2;
        if (p.wall === "side") {
          mesh.position.set(-room.width / 2 + 0.03, elevY, p.x);
          mesh.rotation.y = Math.PI / 2;
        } else {
          mesh.position.set(p.x, elevY, -room.length / 2 + 0.03);
          mesh.rotation.y = 0;
        }
      } else {
        mesh.position.set(p.x, 0, p.z);
        mesh.rotation.y = p.rotY;
      }
    });
  }, [placed, catalogById, room.length, room.width]);

  /* ---------- resaltar selección ---------- */
  useEffect(() => {
    const t = threeRef.current;
    if (!t.selectionRing) return;
    const p = placed.find((i) => i.id === selectedId);
    if (!p) { t.selectionRing.visible = false; return; }
    const cat = catalogById.get(p.catalogId);
    const hw = cat.w / 2 + 0.03;
    const hd = cat.d / 2 + 0.03;
    t.selectionRing.geometry.dispose();
    t.selectionRing.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-hw, 0, -hd), new THREE.Vector3(hw, 0, -hd),
      new THREE.Vector3(hw, 0, hd), new THREE.Vector3(-hw, 0, hd),
    ]);
    t.selectionRing.position.set(p.x, 0.02, p.z);
    t.selectionRing.rotation.y = p.rotY;
    t.selectionRing.visible = true;
  }, [selectedId, placed, catalogById]);

  /* ---------- acciones ---------- */
  const addItem = useCallback((catalogId) => {
    const cat = catalogById.get(catalogId);
    const id = `${catalogId}-${Date.now()}`;
    if (isWallType(cat.type)) {
      const existingWall = placed
        .filter((p) => isWallType(catalogById.get(p.catalogId)?.type) && p.wall === "back")
        .map((p) => ({ x: p.x, w: catalogById.get(p.catalogId).w }));
      const x = findFreeWallX(existingWall, room.width, cat.w);
      setPlaced((prev) => [...prev, { id, catalogId, x, z: -room.length / 2, rotY: 0, wall: "back", elevY: WALL_ELEVATION[cat.type] || 1.2 }]);
    } else {
      const pos = findFreePosition(placed, catalogById, room.width, room.length, cat.w, cat.d);
      setPlaced((prev) => [...prev, { id, catalogId, x: pos.x, z: pos.z, rotY: 0 }]);
    }
    setSelectedId(id);
  }, [placed, catalogById, room.width, room.length]);

  const setWallSide = (wall) => {
    setPlaced((prev) => prev.map((p) => (p.id === selectedId ? { ...p, wall, x: 0 } : p)));
  };
  const nudgeHeight = (dy) => {
    setPlaced((prev) => prev.map((p) => {
      if (p.id !== selectedId) return p;
      const cat = catalogById.get(p.catalogId);
      const minY = cat.h / 2 + 0.1;
      const maxY = room.height - cat.h / 2 - 0.1;
      return { ...p, elevY: Math.min(maxY, Math.max(minY, (p.elevY || 1.2) + dy)) };
    }));
  };

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

  /* ---------- guardar cotización en Supabase ---------- */
  const [quoteError, setQuoteError] = useState("");
  const sendQuote = async () => {
    if (placed.length === 0 || !store) return;
    setQuoteError("");
    const { data: quote, error } = await supabase.from("quotes").insert({ store_id: store.id, total, status: "nueva" }).select().single();
    if (error || !quote) { setQuoteError("No se pudo guardar la cotización. Intenta de nuevo, o usa el botón de WhatsApp."); return; }
    const items = placed.map((p) => ({ quote_id: quote.id, product_id: p.catalogId, price_at_quote: catalogById.get(p.catalogId).price }));
    const { error: itemsErr } = await supabase.from("quote_items").insert(items);
    if (itemsErr) { setQuoteError("Se guardó la cotización, pero hubo un problema con el detalle de piezas."); }
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const waMessage = useMemo(() => {
    if (placed.length === 0 || !store) return "";
    const lines = placed.map((p) => { const c = catalogById.get(p.catalogId); return `• ${c.name} — $${c.price}`; });
    return encodeURIComponent(`Hola ${store.name}, quiero cotizar este espacio diseñado en la app:\n\n${lines.join("\n")}\n\nTotal aprox: $${total.toLocaleString()}\nCuarto: ${room.width}×${room.length} m`);
  }, [placed, total, room.width, room.length, store, catalogById]);
  // Temporal: mientras pruebas, las cotizaciones llegan a tu WhatsApp.
  // Cuando conectes una mueblería real, cambia esto de vuelta a store.whatsapp_number.
  const OWNER_WHATSAPP = "50769800375";
  const waLink = store ? `https://wa.me/${OWNER_WHATSAPP}?text=${waMessage}` : "#";

  if (loadStatus === "cargando") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#F5F2EC", fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        `}</style>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#2C4A3E", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.6s ease-in-out infinite" }}>
          <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
        <p style={{ color: "#96602F", fontSize: 13, letterSpacing: "0.02em" }}>Preparando tu espacio…</p>
      </div>
    );
  }
  if (loadStatus === "error" || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>
        No se pudo cargar la tienda "{storeSlug}".
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
        <div className="flex items-center gap-3">
          <a href="/admin" className="mono text-[10px] underline" style={{ color: "var(--brand-light)" }}>
            Acceso para tiendas
          </a>
          <span className="mono text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: "var(--line)", color: "var(--walnut)" }}>
            CONECTADO
          </span>
        </div>
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
              <div className="text-[11px] mb-1.5" style={{ color: "var(--brand-light)" }}>Forma del cuarto</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setRoomField("shape", "rect")}
                  className="flex-1 text-[11px] py-1.5 rounded border"
                  style={{ borderColor: "var(--line)", background: room.shape !== "L" ? "var(--brand)" : "transparent", color: room.shape !== "L" ? "#fff" : "var(--ink)" }}
                >Rectangular</button>
                <button
                  onClick={() => setRoomField("shape", "L")}
                  className="flex-1 text-[11px] py-1.5 rounded border"
                  style={{ borderColor: "var(--line)", background: room.shape === "L" ? "var(--brand)" : "transparent", color: room.shape === "L" ? "#fff" : "var(--ink)" }}
                >En L</button>
              </div>
            </div>

            {room.shape === "L" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[{ key: "extWidth", label: "Ancho extensión" }, { key: "extDepth", label: "Fondo extensión" }].map((f) => (
                  <label key={f.key} className="text-[11px] flex flex-col gap-1">
                    <span style={{ color: "var(--brand-light)" }}>{f.label} (m)</span>
                    <input
                      type="number" step="0.1" inputMode="decimal"
                      value={roomDraft[f.key]}
                      onChange={(e) => setRoomDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        const clamped = Number.isFinite(n) ? Math.min(4, Math.max(0.8, n)) : room[f.key];
                        setRoomField(f.key, clamped);
                        setRoomDraft((d) => ({ ...d, [f.key]: String(clamped) }));
                      }}
                      className="mono w-full border rounded px-1.5 py-1 text-sm" style={{ borderColor: "var(--line)" }}
                    />
                  </label>
                ))}
              </div>
            )}
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

              {isWallType(selectedCat.type) ? (
                <>
                  <div className="text-[11px] mb-1.5" style={{ color: "var(--brand-light)" }}>Pared</div>
                  <div className="flex gap-1.5 mb-3">
                    <button
                      onClick={() => setWallSide("back")}
                      className="flex-1 text-[11px] py-1.5 rounded border"
                      style={{ borderColor: "var(--line)", background: (selectedItem.wall || "back") === "back" ? "var(--brand)" : "transparent", color: (selectedItem.wall || "back") === "back" ? "#fff" : "var(--ink)" }}
                    >Trasera</button>
                    <button
                      onClick={() => setWallSide("side")}
                      className="flex-1 text-[11px] py-1.5 rounded border"
                      style={{ borderColor: "var(--line)", background: selectedItem.wall === "side" ? "var(--brand)" : "transparent", color: selectedItem.wall === "side" ? "#fff" : "var(--ink)" }}
                    >Lateral</button>
                  </div>
                  <div className="text-[11px] mb-1.5" style={{ color: "var(--brand-light)" }}>Altura</div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudgeHeight(-0.1)}><ArrowDown size={14} /></button>
                    <span className="mono text-[11px]" style={{ color: "var(--walnut)" }}>{(selectedItem.elevY || 1.2).toFixed(1)} m</span>
                    <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudgeHeight(0.1)}><ArrowUp size={14} /></button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 w-[140px] mx-auto mb-3">
                  <div /><button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, -0.1)}><ArrowUp size={14} /></button><div />
                  <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(-0.1, 0)}><ArrowLeft size={14} /></button>
                  <button className="ctrlbtn rounded p-2 flex justify-center" onClick={rotateSelected}><RotateCw size={14} /></button>
                  <button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0.1, 0)}><ArrowRight size={14} /></button>
                  <div /><button className="ctrlbtn rounded p-2 flex justify-center" onClick={() => nudge(0, 0.1)}><ArrowDown size={14} /></button><div />
                </div>
              )}
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
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-11 h-11 rounded-md flex-shrink-0 object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-md flex-shrink-0" style={{ background: item.color }} />
                  )}
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

      {quoteError && (
        <div className="px-4 sm:px-6 py-2 text-[12px] text-center" style={{ background: "#B0472F15", color: "#B0472F" }}>{quoteError}</div>
      )}
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

/* ==================================================================== */
/* PANEL DE ADMINISTRACIÓN — con login real de Supabase                  */
/* ==================================================================== */

const FURNITURE_TYPES = [
  { value: "sofa", label: "Sofá" },
  { value: "armchair", label: "Sillón" },
  { value: "table", label: "Mesa" },
  { value: "chair", label: "Silla" },
  { value: "bed", label: "Cama" },
  { value: "closet", label: "Closet" },
  { value: "nightstand", label: "Mesa de noche" },
  { value: "window", label: "Ventana (de pared)" },
  { value: "tv", label: "TV (de pared)" },
  { value: "painting", label: "Cuadro (de pared)" },
];

const STATUS_META = {
  nueva: { label: "Nueva", icon: CircleDot, color: "#B0472F" },
  contactado: { label: "Contactado", icon: Clock, color: "#96602F" },
  cerrada: { label: "Cerrada", icon: Check, color: "#3D6B4A" },
};

const emptyProductForm = { category_id: "", furniture_type: "sofa", name: "", width_m: "", depth_m: "", height_m: "", color_hex: "#6B4A3A", price: "", is_active: true, photo_url: "" };

function AdminPanel() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteItemsByQuote, setQuoteItemsByQuote] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [tab, setTab] = useState("catalogo");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [showForm, setShowForm] = useState(false);
  const [brandDraft, setBrandDraft] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadStoreData = useCallback(async (userId) => {
    setDataLoading(true);
    setDataError("");
    const { data: adminRow, error: adminErr } = await supabase
      .from("store_admins").select("store_id, role, stores(*)").eq("user_id", userId).single();
    if (adminErr || !adminRow) { setDataError("Este usuario no está vinculado a ninguna tienda todavía."); setDataLoading(false); return; }
    setStore(adminRow.stores);
    setBrandDraft({ name: adminRow.stores.name, primary_color: adminRow.stores.primary_color, whatsapp_number: adminRow.stores.whatsapp_number || "" });

    const { data: cats } = await supabase.from("categories").select("*").eq("store_id", adminRow.store_id).order("sort_order");
    setCategories(cats || []);

    const { data: prods } = await supabase.from("products").select("*").eq("store_id", adminRow.store_id).order("created_at");
    setProducts(prods || []);

    const { data: qs } = await supabase.from("quotes").select("*").eq("store_id", adminRow.store_id).order("created_at", { ascending: false });
    setQuotes(qs || []);

    if (qs && qs.length) {
      const { data: items } = await supabase.from("quote_items").select("*, products(name)").in("quote_id", qs.map((q) => q.id));
      const grouped = {};
      (items || []).forEach((it) => { (grouped[it.quote_id] ||= []).push(it); });
      setQuoteItemsByQuote(grouped);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadStoreData(session.user.id);
  }, [session, loadStoreData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setSigningIn(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setStore(null); setProducts([]); setCategories([]); setQuotes([]); };

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const startNew = () => { setForm({ ...emptyProductForm, category_id: categories[0]?.id || "" }); setEditingId(null); setShowForm(true); };
  const startEdit = (p) => { setForm({ ...p }); setEditingId(p.id); setShowForm(true); };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const path = `${store.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    }
    setUploadingPhoto(false);
  };
  const [panelError, setPanelError] = useState("");
  const saveProduct = async () => {
    setPanelError("");
    if (!form.name.trim()) { setPanelError("Ponle un nombre al producto."); return; }
    if (!form.category_id) { setPanelError("Elige una categoría."); return; }
    const w = Number(form.width_m), d = Number(form.depth_m), h = Number(form.height_m), price = Number(form.price);
    if (!(w > 0) || !(d > 0) || !(h > 0)) { setPanelError("Las medidas deben ser mayores a 0."); return; }
    if (!(price > 0)) { setPanelError("El precio debe ser mayor a 0."); return; }
    const payload = {
      store_id: store.id, category_id: form.category_id, name: form.name.trim(), furniture_type: form.furniture_type,
      width_m: w, depth_m: d, height_m: h,
      color_hex: form.color_hex, price, is_active: form.is_active, photo_url: form.photo_url || null,
    };
    if (editingId) {
      const { data, error } = await supabase.from("products").update(payload).eq("id", editingId).select().single();
      if (error) { setPanelError("No se pudo guardar: " + error.message); return; }
      setProducts((p) => p.map((x) => (x.id === editingId ? data : x)));
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (error) { setPanelError("No se pudo agregar: " + error.message); return; }
      setProducts((p) => [...p, data]);
    }
    setShowForm(false);
  };
  const removeProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { setPanelError("No se pudo quitar el producto: " + error.message); return; }
    setProducts((p) => p.filter((x) => x.id !== id));
  };
  const toggleActive = async (p) => {
    const { data, error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id).select().single();
    if (error) { setPanelError("No se pudo actualizar: " + error.message); return; }
    setProducts((prev) => prev.map((x) => (x.id === p.id ? data : x)));
  };
  const setQuoteStatus = async (id, status) => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) { setPanelError("No se pudo actualizar la cotización: " + error.message); return; }
    setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status } : q)));
  };
  const saveBrand = async () => {
    if (!brandDraft.name.trim()) { setPanelError("El nombre de la tienda no puede quedar vacío."); return; }
    const { data, error } = await supabase.from("stores").update(brandDraft).eq("id", store.id).select().single();
    if (error) { setPanelError("No se pudo guardar la marca: " + error.message); return; }
    setStore(data);
    setPanelError("");
  };

  const activeCount = useMemo(() => products.filter((p) => p.is_active).length, [products]);
  const newQuotesCount = useMemo(() => quotes.filter((q) => q.status === "nueva").length, [quotes]);
  const brandColor = store?.primary_color || "#2C4A3E";

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>Cargando…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');`}</style>
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-xl p-6" style={{ background: "#FCFAF6", border: "1px solid #DED7C7" }}>
          <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4" style={{ background: "#2C4A3E" }}>
            <Store size={18} color="#fff" />
          </div>
          <h1 className="font-bold text-xl mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#211D18" }}>Panel de tienda</h1>
          <p className="text-[13px] mb-5" style={{ color: "#7C948B" }}>Inicia sesión para administrar tu catálogo.</p>

          <label className="text-[11px] block mb-1" style={{ color: "#7C948B" }}>Correo</label>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-3" style={{ borderColor: "#DED7C7" }}>
            <Mail size={14} color="#7C948B" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm outline-none" placeholder="tucorreo@ejemplo.com" />
          </div>

          <label className="text-[11px] block mb-1" style={{ color: "#7C948B" }}>Contraseña</label>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-4" style={{ borderColor: "#DED7C7" }}>
            <Lock size={14} color="#7C948B" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-sm outline-none" placeholder="••••••••" />
          </div>

          {authError && <p className="text-[12px] mb-3" style={{ color: "#B0472F" }}>{authError}</p>}

          <button type="submit" disabled={signingIn} className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "#2C4A3E" }}>
            {signingIn ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    );
  }

  if (dataLoading || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>
        {dataError ? (
          <div>
            <p className="mb-3" style={{ color: "#B0472F" }}>{dataError}</p>
            <button onClick={handleLogout} className="text-sm underline" style={{ color: "#7C948B" }}>Cerrar sesión</button>
          </div>
        ) : "Cargando tu tienda…"}
      </div>
    );
  }

  return (
    <div className="admin-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .admin-root{ --bg:#F5F2EC; --ink:#211D18; --brand:${brandColor}; --brand-light:#7C948B; --walnut:#96602F; --line:#DED7C7; --panel:#FCFAF6; --danger:#B0472F;
          font-family:'Inter',sans-serif; color:var(--ink); background:var(--bg); min-height:100vh; display:flex; }
        .disp{ font-family:'Space Grotesk',sans-serif; }
        .mono{ font-family:'IBM Plex Mono',monospace; }
        .navitem{ display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; font-size:13.5px; cursor:pointer; color:#5C554A; }
        .navitem:hover{ background:#00000008; }
        .navitem.active{ background:var(--brand); color:#fff; }
        .field label{ font-size:11px; color:var(--brand-light); display:block; margin-bottom:3px; }
        .field input, .field select{ width:100%; border:1px solid var(--line); border-radius:6px; padding:7px 9px; font-size:13.5px; background:#fff; }
        .btn-primary{ background:var(--brand); color:#fff; }
        .cardline{ border:1px solid var(--line); background:var(--panel); }
        .swatch{ width:24px; height:24px; border-radius:6px; cursor:pointer; border:2px solid transparent; }
        .swatch.active{ border-color:var(--ink); }
        table.plist{ width:100%; border-collapse:collapse; }
        table.plist th{ text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--brand-light); padding:8px 10px; border-bottom:1px solid var(--line); }
        table.plist td{ padding:9px 10px; border-bottom:1px solid var(--line); font-size:13px; vertical-align:middle; }
        .badge{ font-family:'IBM Plex Mono',monospace; font-size:10px; padding:2px 8px; border-radius:999px; }
      `}</style>

      <aside className="w-56 flex-shrink-0 border-r flex flex-col p-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md flex items-center justify-center disp font-bold text-white" style={{ background: "var(--brand)" }}>{store.name?.[0] || "T"}</div>
          <div>
            <div className="disp font-bold text-sm leading-none">{store.name}</div>
            <span className="mono text-[9px]" style={{ color: "var(--brand-light)" }}>panel de tienda</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <div className={`navitem ${tab === "catalogo" ? "active" : ""}`} onClick={() => setTab("catalogo")}>
            <LayoutGrid size={16} /> Catálogo <span className="mono ml-auto text-[10px]" style={{ opacity: 0.75 }}>{activeCount}</span>
          </div>
          <div className={`navitem ${tab === "cotizaciones" ? "active" : ""}`} onClick={() => setTab("cotizaciones")}>
            <MessageSquareText size={16} /> Cotizaciones
            {newQuotesCount > 0 && <span className="mono ml-auto text-[10px] px-1.5 rounded-full" style={{ background: "var(--danger)", color: "#fff" }}>{newQuotesCount}</span>}
          </div>
          <div className={`navitem ${tab === "marca" ? "active" : ""}`} onClick={() => setTab("marca")}>
            <Palette size={16} /> Marca de la tienda
          </div>
        </nav>
        <div className="navitem mt-auto" style={{ color: "var(--danger)" }} onClick={handleLogout}>
          <LogOut size={16} /> Cerrar sesión
        </div>
      </aside>

      <main className="flex-1 p-6 max-w-[900px]">
        {tab === "catalogo" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="disp font-bold text-xl">Catálogo</h2>
                <p className="text-[12.5px]" style={{ color: "var(--brand-light)" }}>Esto es lo que ven tus clientes en el visualizador.</p>
              </div>
              <button onClick={startNew} className="btn-primary rounded-lg px-3.5 py-2 text-sm font-medium flex items-center gap-1.5">
                <Plus size={15} /> Nuevo producto
              </button>
            </div>

            {showForm && (
              <div className="cardline rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="disp font-semibold text-sm">{editingId ? "Editar producto" : "Nuevo producto"}</h3>
                  <button onClick={() => setShowForm(false)}><X size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  <div className="field col-span-2 sm:col-span-3">
                    <label>Nombre</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Sofá Milano 3 puestos" />
                  </div>
                  <div className="field">
                    <label>Categoría</label>
                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Tipo (para el 3D)</label>
                    <select value={form.furniture_type} onChange={(e) => setForm({ ...form, furniture_type: e.target.value })}>
                      {FURNITURE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Precio (USD)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="899" />
                  </div>
                  <div className="field">
                    <label>Ancho (m)</label>
                    <input type="number" step="0.01" value={form.width_m} onChange={(e) => setForm({ ...form, width_m: e.target.value })} placeholder="2.20" />
                  </div>
                  <div className="field">
                    <label>Profundidad (m)</label>
                    <input type="number" step="0.01" value={form.depth_m} onChange={(e) => setForm({ ...form, depth_m: e.target.value })} placeholder="0.95" />
                  </div>
                  <div className="field">
                    <label>Alto (m)</label>
                    <input type="number" step="0.01" value={form.height_m} onChange={(e) => setForm({ ...form, height_m: e.target.value })} placeholder="0.85" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[11px] block mb-1.5" style={{ color: "var(--brand-light)" }}>Color</label>
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="w-8 h-8 rounded cursor-pointer border" style={{ borderColor: "var(--line)" }} />
                    <span className="mono text-[12px]" style={{ color: "var(--brand-light)" }}>{form.color_hex}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[11px] block mb-1.5" style={{ color: "var(--brand-light)" }}>Foto del producto (opcional)</label>
                  <div className="flex gap-2 items-center">
                    {form.photo_url && <img src={form.photo_url} alt="" className="w-12 h-12 rounded-md object-cover border" style={{ borderColor: "var(--line)" }} />}
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e.target.files?.[0])} className="text-[12px]" />
                  </div>
                  {uploadingPhoto && <p className="mono text-[11px] mt-1" style={{ color: "var(--brand-light)" }}>Subiendo…</p>}
                </div>
                {panelError && <p className="text-[12px] mb-2" style={{ color: "#B0472F" }}>{panelError}</p>}
                <button onClick={saveProduct} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
                  {editingId ? "Guardar cambios" : "Agregar al catálogo"}
                </button>
              </div>
            )}

            <div className="cardline rounded-xl overflow-hidden">
              <table className="plist">
                <thead><tr><th>Producto</th><th>Categoría</th><th>Medidas</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="flex items-center gap-2 py-2.5">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded flex-shrink-0" style={{ background: p.color_hex }} />
                        )}
                        {p.name}
                      </td>
                      <td>{categoryNameById.get(p.category_id) || "—"}</td>
                      <td className="mono text-[11.5px]">{p.width_m}×{p.depth_m}×{p.height_m} m</td>
                      <td className="mono">${p.price}</td>
                      <td>
                        <button onClick={() => toggleActive(p)} className="badge" style={{ background: p.is_active ? "#3D6B4A22" : "#00000010", color: p.is_active ? "#3D6B4A" : "#8a8478" }}>
                          {p.is_active ? "Visible" : "Oculto"}
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(p)}><Pencil size={14} color="var(--brand-light)" /></button>
                          <button onClick={() => removeProduct(p.id)}><Trash2 size={14} color="var(--danger)" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-[12.5px]" style={{ color: "var(--brand-light)" }}>Aún no hay productos. Agrega el primero arriba.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "cotizaciones" && (
          <div>
            <h2 className="disp font-bold text-xl mb-1">Cotizaciones</h2>
            <p className="text-[12.5px] mb-5" style={{ color: "var(--brand-light)" }}>Lo que tus clientes arman en el visualizador y te envían.</p>
            <div className="flex flex-col gap-3">
              {quotes.map((q) => {
                const meta = STATUS_META[q.status] || STATUS_META.nueva;
                const Icon = meta.icon;
                const items = quoteItemsByQuote[q.id] || [];
                return (
                  <div key={q.id} className="cardline rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="mono text-[11px] flex items-center gap-1" style={{ color: "var(--brand-light)" }}>
                        <Phone size={11} /> {new Date(q.created_at).toLocaleDateString()}
                      </p>
                      <span className="disp font-bold text-lg">${q.total}</span>
                    </div>
                    <p className="text-[12.5px] mb-3">{items.map((it) => it.products?.name).filter(Boolean).join(" · ") || "Sin detalle de piezas"}</p>
                    <div className="flex items-center gap-2">
                      <span className="badge flex items-center gap-1" style={{ background: meta.color + "1a", color: meta.color }}><Icon size={11} /> {meta.label}</span>
                      <div className="flex gap-1.5 ml-auto">
                        {Object.keys(STATUS_META).filter((s) => s !== q.status).map((s) => (
                          <button key={s} onClick={() => setQuoteStatus(q.id, s)} className="mono text-[10.5px] px-2 py-1 rounded border" style={{ borderColor: "var(--line)", color: "var(--brand-light)" }}>
                            Marcar {STATUS_META[s].label.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              {quotes.length === 0 && <p className="text-[12.5px] text-center py-6" style={{ color: "var(--brand-light)" }}>Aún no has recibido cotizaciones.</p>}
            </div>
          </div>
        )}

        {tab === "marca" && brandDraft && (
          <div>
            <h2 className="disp font-bold text-xl mb-1">Marca de la tienda</h2>
            <p className="text-[12.5px] mb-5" style={{ color: "var(--brand-light)" }}>Esto define cómo se ve tu visualizador para tus clientes.</p>
            <div className="cardline rounded-xl p-4 max-w-md">
              <div className="field mb-3">
                <label>Nombre de la tienda</label>
                <input value={brandDraft.name} onChange={(e) => setBrandDraft({ ...brandDraft, name: e.target.value })} />
              </div>
              <div className="field mb-3">
                <label>WhatsApp (con código de país, sin +)</label>
                <input value={brandDraft.whatsapp_number} onChange={(e) => setBrandDraft({ ...brandDraft, whatsapp_number: e.target.value })} placeholder="50760000000" />
              </div>
              <div className="mb-4">
                <label className="text-[11px] block mb-1.5" style={{ color: "var(--brand-light)" }}>Color de marca</label>
                <div className="flex gap-2">
                  {["#2C4A3E", "#24424E", "#5B3A29", "#6B2E2E", "#3D3A5C", "#4A5A2C"].map((c) => (
                    <button key={c} className={`swatch ${brandDraft.primary_color === c ? "active" : ""}`} style={{ background: c }} onClick={() => setBrandDraft({ ...brandDraft, primary_color: c })} />
                  ))}
                </div>
              </div>
              {panelError && <p className="text-[12px] mb-2" style={{ color: "#B0472F" }}>{panelError}</p>}
              <button onClick={saveBrand} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">Guardar cambios</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ==================================================================== */
/* Enrutador simple: /admin muestra el panel, todo lo demás el visualizador */
/* ==================================================================== */
function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setStatus("saving");
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setStatus("error"); return; }
    setStatus("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F5F2EC", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div className="w-full max-w-sm rounded-xl p-6" style={{ background: "#FCFAF6", border: "1px solid #DED7C7" }}>
        <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4" style={{ background: "#2C4A3E" }}>
          <Lock size={18} color="#fff" />
        </div>
        <h1 className="font-bold text-xl mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#211D18" }}>Nueva contraseña</h1>

        {status === "done" ? (
          <div>
            <p className="text-[13px] mb-4" style={{ color: "#3D6B4A" }}>Listo, tu contraseña quedó actualizada.</p>
            <a href="/admin" className="block text-center rounded-lg py-2.5 text-sm font-medium text-white" style={{ background: "#2C4A3E" }}>Ir a iniciar sesión</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-[13px] mb-5" style={{ color: "#7C948B" }}>Escribe tu nueva contraseña para el panel.</p>
            <label className="text-[11px] block mb-1" style={{ color: "#7C948B" }}>Nueva contraseña</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-3" style={{ borderColor: "#DED7C7" }}>
              <Lock size={14} color="#7C948B" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-sm outline-none" placeholder="••••••••" />
            </div>
            <label className="text-[11px] block mb-1" style={{ color: "#7C948B" }}>Confirmar contraseña</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-4" style={{ borderColor: "#DED7C7" }}>
              <Lock size={14} color="#7C948B" />
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full text-sm outline-none" placeholder="••••••••" />
            </div>
            {error && <p className="text-[12px] mb-3" style={{ color: "#B0472F" }}>{error}</p>}
            <button type="submit" disabled={status === "saving"} className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "#2C4A3E" }}>
              {status === "saving" ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const isRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  if (isRecovery) return <ResetPasswordScreen />;
  return isAdmin ? <AdminPanel /> : <CroquisApp />;
}
