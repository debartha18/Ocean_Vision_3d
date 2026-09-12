import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { generateEarthTopographyTexture, generateBathymetryTexture } from './proceduralTextures';
import { OceanSurfaceShader, DepthWallShader } from './OceanShaders';

// Helper to create text sprite for 3D depth ticks (0m, 100m, 500m, etc.)
function createDepthLabelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 10, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.4, 0.15, 1);
  return sprite;
}

// Helper to create floating circular buoy badge icon sprite
function createBuoyBadgeSprite(type = 'mooredBuoy') {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  let fillCol = '#0284c7';
  let strokeCol = '#38bdf8';
  let label = '';

  if (type === 'gliderProfile') {
    fillCol = '#0891b2';
    strokeCol = '#22d3ee';
    label = 'GL';
  } else if (type === 'bgcArgo') {
    fillCol = '#9333ea';
    strokeCol = '#c084fc';
    label = 'BGC';
  } else if (type === 'adcpMooring') {
    fillCol = '#ea580c';
    strokeCol = '#fb923c';
    label = 'ADCP';
  }

  ctx.fillStyle = fillCol;
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = strokeCol;
  ctx.stroke();

  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 32, 33);
  } else {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(32, 32, 12, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(32, 32, 6, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.22, 0.22, 1);
  return sprite;
}

// Builds specialized 3D geometries for each in-situ instrument type
function buildInstrumentMesh(buoy) {
  const buoyObj = new THREE.Group();
  buoyObj.position.set(buoy.x * 1.6, 0.03, buoy.z * 1.3);
  buoyObj.userData = buoy;

  if (buoy.type === 'gliderProfile') {
    // Slocum Underwater Glider: Streamlined torpedo fuselage + swept delta wings + tail rudder
    const fuseGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.22, 16);
    fuseGeo.rotateX(Math.PI * 0.5);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.5, roughness: 0.25 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.y = 0.015;
    buoyObj.add(fuse);

    const wingGeo = new THREE.BoxGeometry(0.26, 0.005, 0.045);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.3, roughness: 0.3 });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.015, -0.01);
    buoyObj.add(wing);

    const finGeo = new THREE.BoxGeometry(0.006, 0.04, 0.03);
    const fin = new THREE.Mesh(finGeo, wingMat);
    fin.position.set(0, 0.035, -0.08);
    buoyObj.add(fin);
  } else if (buoy.type === 'bgcArgo') {
    // BGC Argo Float: Slender profiler hull with bio-optical sensor cap
    const bodyGeo = new THREE.CylinderGeometry(0.028, 0.03, 0.18, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.4, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.06;
    buoyObj.add(body);

    const headGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.7, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.15;
    buoyObj.add(head);
  } else if (buoy.type === 'adcpMooring') {
    // ADCP Acoustic Profiler: Subsurface float sphere & 4-beam upward transducer
    const sphereGeo = new THREE.SphereGeometry(0.048, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.4 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = -0.02;
    buoyObj.add(sphere);

    const coneGeo = new THREE.ConeGeometry(0.032, 0.045, 4);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 0.035;
    buoyObj.add(cone);
  } else {
    // Moored Buoy & Core Argo
    const hullGeo = new THREE.CylinderGeometry(0.055, 0.06, 0.045, 16);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.35, roughness: 0.3 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.022;
    buoyObj.add(hull);

    const mastGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 0.09;
    buoyObj.add(mast);
  }

  // Floating telemetry badge
  const badge = createBuoyBadgeSprite(buoy.type);
  badge.position.set(0, 0.26, 0);
  buoyObj.add(badge);

  // Surface pulse ring
  const ringGeo = new THREE.RingGeometry(0.07, 0.14, 16);
  ringGeo.rotateX(-Math.PI * 0.5);
  const ringColor = buoy.type === 'gliderProfile' ? 0x06b6d4 : (buoy.type === 'bgcArgo' ? 0xa855f7 : (buoy.type === 'adcpMooring' ? 0xf97316 : 0x00f0ff));
  const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.01;
  buoyObj.add(ring);

  return buoyObj;
}

// Helper to create 3D Hurricane Cloud Texture (Soft misty spiral cloud bands)
function createHurricaneVortexTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'transparent';
  ctx.clearRect(0, 0, 512, 512);

  // Soft misty spiral arms using radial cloud puffs
  for (let arm = 0; arm < 3; arm++) {
    const baseAngle = (arm * Math.PI * 2) / 3;
    for (let r = 20; r < 210; r += 7) {
      const angle = baseAngle + Math.pow(r / 65, 1.25);
      const x = 256 + Math.cos(angle) * r;
      const y = 256 + Math.sin(angle) * r;

      const puffRadius = 16 + (r / 210) * 16;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, puffRadius);
      grad.addColorStop(0, 'rgba(235, 243, 255, 0.42)');
      grad.addColorStop(0.5, 'rgba(205, 225, 250, 0.20)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central Eye of the Storm (subtle misty ring)
  const eyeGrad = ctx.createRadialGradient(256, 256, 8, 256, 256, 32);
  eyeGrad.addColorStop(0, 'rgba(10, 25, 60, 0.6)');
  eyeGrad.addColorStop(0.5, 'rgba(220, 235, 255, 0.45)');
  eyeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to create subtle, non-intrusive 3D Marine Waterspout Funnel
function createTornadoFunnelMesh(radiusTop = 0.16, radiusBottom = 0.03, height = 0.44, opacity = 0.35) {
  const group = new THREE.Group();

  // 1. Twisted inner core - translucent mist
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 28, 10, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const progress = (y + height / 2) / height;
    const angle = progress * Math.PI * 2.8;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x * Math.cos(angle) - z * Math.sin(angle);
    const nz = x * Math.sin(angle) + z * Math.cos(angle);
    pos.setX(i, nx + Math.sin(progress * Math.PI) * 0.03);
    pos.setZ(i, nz + Math.cos(progress * Math.PI) * 0.02);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    emissive: 0x64748b,
    emissiveIntensity: 0.12,
    roughness: 0.6,
    metalness: 0.02,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const innerMesh = new THREE.Mesh(geo, mat);
  group.add(innerMesh);

  // 2. Light misty outer sleeve
  const outerGeo = new THREE.CylinderGeometry(radiusTop * 1.12, radiusBottom * 1.25, height, 24, 6, true);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: opacity * 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  group.add(outerMesh);

  return group;
}

export default function OceanCanvas({
  selectedParam = 'sst',
  depth = 50,
  viewMode = 'depth_slice',
  activeRegion,
  isStormLayerActive = false,
  onSelectBuoy,
  _selectedBuoy = null,
  isPlaying = true,
  simSpeed = 1,
  ensoState = { phase: 'elnino', intensity: 0.75, isPlaying: true },
  palette = 'turbo',
  layerOpacity = 0.95,
  verticalExaggeration = 1.0,
  isLogScale = false
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef({});
  const depthWallUniformsRef = useRef({});
  const depthCutawayGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const buoysGroupRef = useRef(null);
  const earthMeshRef = useRef(null);
  const stormGroupRef = useRef(null);
  const cycloneVortexRef = useRef(null);
  const tornadoMeshRef = useRef(null);
  const sprayRingMainRef = useRef(null);
  const rainMeshRef = useRef(null);
  const lightningLightRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const propsRef = useRef({
    activeRegion,
    isStormLayerActive,
    onSelectBuoy,
    isPlaying,
    simSpeed,
    ensoState
  });

  useEffect(() => {
    propsRef.current = {
      activeRegion,
      isStormLayerActive,
      onSelectBuoy,
      isPlaying,
      simSpeed,
      ensoState
    };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x06141b, 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.1, 3.4, 4.8);
    camera.lookAt(0, -0.35, 0.1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Cinematic Ocean Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1720, 2.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 3.2);
    sunLight.position.set(3, 9, 4.5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const atmosphereRim = new THREE.DirectionalLight(0x00f0ff, 2.6);
    atmosphereRim.position.set(-6, -1, -5);
    scene.add(atmosphereRim);

    const abyssBiolum = new THREE.PointLight(0x0284c7, 4.0, 8);
    abyssBiolum.position.set(0, -2.4, 0.2);
    scene.add(abyssBiolum);

    // Lightning Flash Light for Storms
    const lightningLight = new THREE.PointLight(0xdbeafe, 0, 12, 1.5);
    lightningLight.position.set(0.35, 1.2, -0.1);
    scene.add(lightningLight);
    lightningLightRef.current = lightningLight;

    // Earth Globe Regional Cutaway
    const earthTexture = generateEarthTopographyTexture();
    const globeRadius = 6.2;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 96, 96, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.12,
      bumpMap: earthTexture,
      bumpScale: 0.05,
    });
    const earthMesh = new THREE.Mesh(globeGeo, globeMat);
    earthMesh.rotation.x = Math.PI * 0.58;
    earthMesh.rotation.z = -Math.PI * 0.12;
    earthMesh.position.set(0, -5.1, 0.35);
    earthMesh.receiveShadow = true;
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric cyan ring
    const atmosGeo = new THREE.RingGeometry(globeRadius * 0.99, globeRadius * 1.08, 96);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    atmosMesh.rotation.x = Math.PI * 0.5;
    atmosMesh.position.set(0, -0.05, 0.1);
    scene.add(atmosMesh);

    // Dynamic Ocean Surface Heatmap Mesh
    const oceanWidth = 3.6;
    const oceanDepth = 3.2;
    const oceanGeo = new THREE.PlaneGeometry(oceanWidth, oceanDepth, 180, 180);
    oceanGeo.rotateX(-Math.PI * 0.5);

    const oceanUniforms = {
      uTime: { value: 0 },
      uParamType: { value: 0 },
      uDepth: { value: 50.0 },
      uMode: { value: 1 },
      uWaveSwell: { value: 1.0 },
      uSunDirection: { value: new THREE.Vector3(0.5, 1.0, 0.5).normalize() },
      uEnsoPhase: { value: 1 },
      uEnsoIntensity: { value: 0.75 },
      uPalette: { value: 1 },
      uOpacity: { value: 0.95 },
      uLogScale: { value: 0 }
    };
    uniformsRef.current = oceanUniforms;

    const oceanMat = new THREE.ShaderMaterial({
      uniforms: oceanUniforms,
      vertexShader: OceanSurfaceShader.vertexShader,
      fragmentShader: OceanSurfaceShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, 0.02, 0.15);
    scene.add(oceanMesh);

    // Group for depth cutaway walls, depth ticks, seabed, and sensor probes for vertical exaggeration
    const depthCutawayGroup = new THREE.Group();
    scene.add(depthCutawayGroup);
    depthCutawayGroupRef.current = depthCutawayGroup;

    // Volumetric Depth Cutaway Walls
    const depthWallUniforms = {
      uTime: { value: 0 },
      uParamType: { value: 0 },
      uMaxDepth: { value: 6000.0 },
      uEnsoPhase: { value: 1 },
      uEnsoIntensity: { value: 0.75 },
      uPalette: { value: 1 },
      uOpacity: { value: 0.95 },
      uLogScale: { value: 0 }
    };
    depthWallUniformsRef.current = depthWallUniforms;

    const depthSliceHeight = 2.4;
    const wallGeoFront = new THREE.PlaneGeometry(oceanWidth, depthSliceHeight);
    const depthWallMat = new THREE.ShaderMaterial({
      uniforms: depthWallUniforms,
      vertexShader: DepthWallShader.vertexShader,
      fragmentShader: DepthWallShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    const wallFront = new THREE.Mesh(wallGeoFront, depthWallMat);
    wallFront.position.set(0, -depthSliceHeight * 0.5, 0.15 + oceanDepth * 0.5);
    depthCutawayGroup.add(wallFront);

    const wallGeoRight = new THREE.PlaneGeometry(oceanDepth, depthSliceHeight);
    wallGeoRight.rotateY(Math.PI * 0.5);
    const wallRight = new THREE.Mesh(wallGeoRight, depthWallMat);
    wallRight.position.set(oceanWidth * 0.5, -depthSliceHeight * 0.5, 0.15);
    depthCutawayGroup.add(wallRight);

    // 3D Depth Labels on Right Cutaway Wall Edge
    const depthTicks = [
      { text: '0 m', yRatio: 0.005 },
      { text: '100 m', yRatio: 0.06 },
      { text: '500 m', yRatio: 0.18 },
      { text: '1000 m', yRatio: 0.34 },
      { text: '2000 m', yRatio: 0.55 },
      { text: '4000 m', yRatio: 0.80 },
      { text: '6000 m', yRatio: 0.99 }
    ];

    depthTicks.forEach((tick) => {
      const sprite = createDepthLabelSprite(tick.text);
      const yPos = -(tick.yRatio * depthSliceHeight);
      sprite.position.set(oceanWidth * 0.5 + 0.28, yPos, 0.15 + oceanDepth * 0.5);
      depthCutawayGroup.add(sprite);

      const tickLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(oceanWidth * 0.5, yPos, 0.15 + oceanDepth * 0.5),
        new THREE.Vector3(oceanWidth * 0.5 + 0.08, yPos, 0.15 + oceanDepth * 0.5)
      ]);
      const tickLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const tickLine = new THREE.Line(tickLineGeo, tickLineMat);
      depthCutawayGroup.add(tickLine);
    });

    // Central Deep CTD Sensor Probe Cable & Sensor Beads
    const probeGroup = new THREE.Group();
    probeGroup.position.set(0.05, 0, 0.25);
    depthCutawayGroup.add(probeGroup);

    const cableGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -depthSliceHeight * 0.85, 0)
    ]);
    const cableMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.05, gapSize: 0.03 });
    const probeCable = new THREE.Line(cableGeo, cableMat);
    probeCable.computeLineDistances();
    probeGroup.add(probeCable);

    const beadGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sensorBead = new THREE.Mesh(beadGeo, beadMat);
    sensorBead.position.set(0, -depthSliceHeight * 0.12, 0);
    probeGroup.add(sensorBead);

    const leg1Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -depthSliceHeight * 0.85, 0),
      new THREE.Vector3(-0.25, -depthSliceHeight, 0.15)
    ]);
    const leg2Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -depthSliceHeight * 0.85, 0),
      new THREE.Vector3(0.25, -depthSliceHeight, 0.15)
    ]);
    const legMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.04, gapSize: 0.02 });
    const leg1 = new THREE.Line(leg1Geo, legMat);
    leg1.computeLineDistances();
    const leg2 = new THREE.Line(leg2Geo, legMat);
    leg2.computeLineDistances();
    probeGroup.add(leg1);
    probeGroup.add(leg2);

    // Rugged 3D Bathymetry Seabed Mountain Ranges
    const seabedTexture = generateBathymetryTexture();
    const seabedGeo = new THREE.PlaneGeometry(oceanWidth * 1.25, oceanDepth * 1.25, 80, 80);
    seabedGeo.rotateX(-Math.PI * 0.5);

    const posAttr = seabedGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const peak1 = Math.sin(vx * 4.0 + vz * 2.5) * 0.28;
      const peak2 = Math.cos(vx * 7.0 - vz * 3.0) * 0.14;
      const trench = -Math.exp(-(vx * vx + vz * vz) * 0.8) * 0.22;
      posAttr.setY(i, peak1 + peak2 + trench);
    }
    seabedGeo.computeVertexNormals();

    const seabedMat = new THREE.MeshStandardMaterial({
      map: seabedTexture,
      roughness: 0.75,
      metalness: 0.15,
      color: 0x2563eb,
      bumpMap: seabedTexture,
      bumpScale: 0.08
    });
    const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
    seabedMesh.position.set(0, -depthSliceHeight, 0.15);
    depthCutawayGroup.add(seabedMesh);

    // ---------------------------------------------------------------------------
    // 3D STORM, HURRICANE & TORNADO/WATERSPOUT ENGINE
    // ---------------------------------------------------------------------------
    const stormGroup = new THREE.Group();
    stormGroup.position.set(0.35, 0, -0.1);
    scene.add(stormGroup);
    stormGroupRef.current = stormGroup;

    // 1. Hurricane Rotating Cloud Vortex (Small & Misty)
    const cycloneTex = createHurricaneVortexTexture();
    const cycloneGeo = new THREE.PlaneGeometry(1.25, 1.25);
    cycloneGeo.rotateX(-Math.PI * 0.5);
    const cycloneMat = new THREE.MeshBasicMaterial({
      map: cycloneTex,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const cycloneMesh = new THREE.Mesh(cycloneGeo, cycloneMat);
    cycloneMesh.position.set(0, 0.52, 0);
    stormGroup.add(cycloneMesh);
    cycloneVortexRef.current = cycloneMesh;

    // 2. Single Subtle, Non-Disturbing Marine Waterspout Funnel
    const tornadoMesh = createTornadoFunnelMesh(0.16, 0.035, 0.44, 0.35);
    tornadoMesh.position.set(0, 0.25, 0);
    stormGroup.add(tornadoMesh);
    tornadoMeshRef.current = tornadoMesh;

    // Main Waterspout Spray Ring on Water Surface (Gentle Mist)
    const sprayGeo = new THREE.RingGeometry(0.04, 0.16, 24);
    sprayGeo.rotateX(-Math.PI * 0.5);
    const sprayMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const sprayRingMain = new THREE.Mesh(sprayGeo, sprayMat);
    sprayRingMain.position.set(0, 0.038, 0);
    stormGroup.add(sprayRingMain);
    sprayRingMainRef.current = sprayRingMain;

    // 5. Rain Squall Particles Falling from Cloud to Sea
    const rainCount = 450;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 1.6;
      rainPositions[i * 3 + 1] = 0.04 + Math.random() * 0.46;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const rainMesh = new THREE.Points(rainGeo, rainMat);
    stormGroup.add(rainMesh);
    rainMeshRef.current = { mesh: rainMesh, count: rainCount };

    // Animated White Vector Particle Streamlines (Gyre Flow)
    const particleCount = 950;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * (oceanWidth * 0.88);
      const pz = (Math.random() - 0.5) * (oceanDepth * 0.88);
      const py = 0.04 + Math.random() * 0.015;

      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;

      particleVelocities.push({
        x: px,
        z: pz,
        speed: 0.0035 + Math.random() * 0.006,
        angle: Math.atan2(pz + 0.05, px - 0.28) + Math.PI * 0.5
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
    pGrad.addColorStop(1, 'transparent');
    pCtx.fillStyle = pGrad;
    pCtx.beginPath();
    pCtx.arc(16, 16, 16, 0, Math.PI * 2);
    pCtx.fill();
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      map: particleTex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);
    particlesRef.current = { mesh: particlesMesh, velocities: particleVelocities, count: particleCount };

    // 3D Floating Buoy Fleet
    const buoysGroup = new THREE.Group();
    buoysGroupRef.current = buoysGroup;
    scene.add(buoysGroup);

    const buoysList = activeRegion?.buoys || [];
    buoysList.forEach((buoy) => {
      const buoyObj = buildInstrumentMesh(buoy);
      buoysGroup.add(buoyObj);
    });

    // Orbit Drag & Click
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 5.8, theta: 0.08, phi: 1.05 };

    const updateCamera = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta) + 0.3;
      camera.lookAt(0, -0.35, 0.1);
    };
    updateCamera();

    const dom = renderer.domElement;
    const onMouseDown = (e) => { isDragging = true; prevMousePos = { x: e.clientX, y: e.clientY }; };
    const onMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - prevMousePos.x;
        const dy = e.clientY - prevMousePos.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.4, Math.min(Math.PI * 0.46, spherical.phi - dy * 0.005));
        updateCamera();
        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius = Math.max(3.2, Math.min(8.0, spherical.radius + e.deltaY * 0.003));
      updateCamera();
    };

    const onClick = (e) => {
      const rect = dom.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(buoysGroup.children, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.id && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.id && propsRef.current.onSelectBuoy) {
          propsRef.current.onSelectBuoy(parent.userData);
        }
      }
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const currentProps = propsRef.current;
      const isPlayingCurrent = currentProps.isPlaying;
      const simSpeedCurrent = currentProps.simSpeed;
      const speedMult = isPlayingCurrent ? simSpeedCurrent : 0;

      if (uniformsRef.current.uTime) uniformsRef.current.uTime.value = elapsed;
      if (depthWallUniformsRef.current.uTime) depthWallUniformsRef.current.uTime.value = elapsed;

      // Real-time ENSO Phase & Intensity Uniform Updates
      const ensoPhaseVal = currentProps.ensoState?.phase === 'elnino' ? 1 : currentProps.ensoState?.phase === 'lanina' ? 2 : 0;
      const ensoIntensityVal = currentProps.ensoState?.intensity ?? 0.75;
      if (uniformsRef.current.uEnsoPhase) uniformsRef.current.uEnsoPhase.value = ensoPhaseVal;
      if (uniformsRef.current.uEnsoIntensity) uniformsRef.current.uEnsoIntensity.value = ensoIntensityVal;
      if (depthWallUniformsRef.current.uEnsoPhase) depthWallUniformsRef.current.uEnsoPhase.value = ensoPhaseVal;
      if (depthWallUniformsRef.current.uEnsoIntensity) depthWallUniformsRef.current.uEnsoIntensity.value = ensoIntensityVal;

      // Animate 3D Storm, Hurricane & Tornado Funnels
      if (stormGroupRef.current) {
        const stormProb = currentProps.activeRegion?.stormProbability ?? 30;
        // Visible whenever the Storm Layer is toggled ON (isStormLayerActive)
        const hasStorm = Boolean(currentProps.isStormLayerActive);
        stormGroupRef.current.visible = hasStorm;

        if (hasStorm) {
          // Dynamic intensity scaling: minimum 0.35 so simulation is always clearly visible and animated when active
          const stormIntensity = Math.max(0.35, Math.min(1.0, stormProb / 100));

          // 1. Rotate Hurricane cloud arms (soft & misty)
          if (cycloneVortexRef.current) {
            cycloneVortexRef.current.rotation.z = -elapsed * (0.8 + stormIntensity * 1.0) * speedMult;
            cycloneVortexRef.current.scale.setScalar(0.75 + stormIntensity * 0.2);
          }

          // 2. Spin central subtle waterspout funnel
          if (tornadoMeshRef.current) {
            tornadoMeshRef.current.rotation.y = elapsed * 2.6 * speedMult;
            tornadoMeshRef.current.position.x = Math.sin(elapsed * 0.8) * 0.025;
            tornadoMeshRef.current.position.z = Math.cos(elapsed * 0.6) * 0.025;
          }

          // 3. Pulse gentle water spray ring
          if (sprayRingMainRef.current) {
            const sprayPulse = (elapsed * 2.2) % 1.5;
            sprayRingMainRef.current.scale.set(1 + sprayPulse * 0.4, 1 + sprayPulse * 0.4, 1);
            sprayRingMainRef.current.material.opacity = Math.max(0, 0.6 - sprayPulse * 0.4);
          }

          // 4. Falling rain squalls
          if (rainMeshRef.current) {
            const { mesh, count } = rainMeshRef.current;
            const pos = mesh.geometry.attributes.position;
            for (let i = 0; i < count; i++) {
              let py = pos.getY(i) - (0.015 + stormIntensity * 0.02) * (isPlayingCurrent ? simSpeedCurrent : 1);
              if (py < 0.03) py = 0.52;
              pos.setY(i, py);
            }
            pos.needsUpdate = true;
          }

          // 5. Subtle ambient storm glow (gentle, non-disturbing)
          if (lightningLightRef.current) {
            if (stormProb >= 55 && Math.random() < 0.012 * speedMult) {
              lightningLightRef.current.intensity = 2.2 + Math.random() * 1.8;
            } else {
              lightningLightRef.current.intensity *= 0.82;
            }
          }
        }
      }

      // Streamline particles with ENSO physical flow advection
      if (particlesRef.current) {
        const { mesh, count } = particlesRef.current;
        const pos = mesh.geometry.attributes.position;
        const ensoPhase = currentProps.ensoState?.phase || 'elnino';
        const ensoIntensity = currentProps.ensoState?.intensity ?? 0.75;
        const isEnsoPlaying = currentProps.ensoState?.isPlaying ?? true;
        const activeSpeedMult = isEnsoPlaying ? speedMult : 0;

        for (let i = 0; i < count; i++) {
          if (ensoPhase === 'elnino') {
            // El Niño: Reversal / Eastward Kelvin wave surge (→ → →)
            const speed = (0.007 + ensoIntensity * 0.009 + Math.sin(elapsed * 2.5 + i * 0.1) * 0.001) * activeSpeedMult;
            let nx = pos.getX(i) + speed;
            let nz = pos.getZ(i) + Math.sin(nx * 5.0 + elapsed) * 0.0008;

            if (nx > oceanWidth * 0.44) {
              nx = -oceanWidth * 0.44;
              nz = (Math.random() - 0.5) * (oceanDepth * 0.82);
            }
            pos.setX(i, nx);
            pos.setZ(i, nz);
          } else if (ensoPhase === 'lanina') {
            // La Niña: Supercharged westward trade wind flow (← ← ←)
            const speed = (0.009 + ensoIntensity * 0.009) * activeSpeedMult;
            let nx = pos.getX(i) - speed;
            let nz = pos.getZ(i) + Math.sin(nx * 5.0 + elapsed) * 0.0008;

            if (nx < -oceanWidth * 0.44) {
              nx = oceanWidth * 0.44;
              nz = (Math.random() - 0.5) * (oceanDepth * 0.82);
            }
            pos.setX(i, nx);
            pos.setZ(i, nz);
          } else {
            // Normal: Standard Subtropical Gyre Circulation
            const dx = pos.getX(i) - 0.28;
            const dz = pos.getZ(i) + 0.05;
            const dist = Math.sqrt(dx * dx + dz * dz) + 0.06;

            const speed = (0.0045 + (1.0 / dist) * 0.0012) * speedMult;
            const nx = pos.getX(i) - (dz / dist) * speed;
            const nz = pos.getZ(i) + (dx / dist) * speed;

            if (Math.abs(nx) > oceanWidth * 0.44 || Math.abs(nz) > oceanDepth * 0.44) {
              pos.setX(i, (Math.random() - 0.5) * (oceanWidth * 0.75));
              pos.setZ(i, (Math.random() - 0.5) * (oceanDepth * 0.75));
            } else {
              pos.setX(i, nx);
              pos.setZ(i, nz);
            }
          }
        }
        pos.needsUpdate = true;
      }

      // Buoys bobbing animation
      buoysGroup.children.forEach((buoyObj, idx) => {
        const bob = Math.sin(elapsed * 2.2 + idx * 1.6) * 0.012;
        buoyObj.position.y = 0.03 + bob;

        const ring = buoyObj.children.find(c => c instanceof THREE.Mesh && c.geometry instanceof THREE.RingGeometry);
        if (ring) {
          const pulse = (elapsed * 1.6 + idx * 0.8) % 2.0;
          ring.scale.set(1 + pulse * 1.2, 1 + pulse * 1.2, 1);
          ring.material.opacity = Math.max(0, 0.75 - pulse * 0.38);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Buoys whenever activeRegion changes
  useEffect(() => {
    if (!buoysGroupRef.current) return;
    const group = buoysGroupRef.current;
    group.clear();

    const buoysList = activeRegion?.buoys || [];
    buoysList.forEach((buoy) => {
      const buoyObj = buildInstrumentMesh(buoy);
      group.add(buoyObj);
    });
  }, [activeRegion]);

  // Update Region and Earth Globe rotation & dynamic wave swell when activeRegion changes
  useEffect(() => {
    if (earthMeshRef.current && activeRegion?.earthRotation) {
      earthMeshRef.current.rotation.set(...activeRegion.earthRotation);
    }

    if (uniformsRef.current.uWaveSwell) {
      const waveH = activeRegion?.waveHeight || 1.65;
      const stormProb = activeRegion?.stormProbability || 50;
      const swellMultiplier = 0.7 + (waveH / 2.0) * 0.8 + (stormProb / 100) * 0.5;
      uniformsRef.current.uWaveSwell.value = swellMultiplier;
    }
  }, [activeRegion]);

  useEffect(() => {
    const paramIndices = { sst: 0, salinity: 1, currents: 2, wave: 3, chlorophyll: 4, oxygen: 5 };
    const pIdx = paramIndices[selectedParam] ?? 0;

    if (uniformsRef.current.uParamType) uniformsRef.current.uParamType.value = pIdx;
    if (depthWallUniformsRef.current.uParamType) depthWallUniformsRef.current.uParamType.value = pIdx;
    if (uniformsRef.current.uDepth) uniformsRef.current.uDepth.value = depth;

    const modeIndices = { surface: 0, depth_slice: 1, volume: 2, volume_render: 2, isosurface: 3, iso_surface: 3, vector_field: 4 };
    if (uniformsRef.current.uMode) uniformsRef.current.uMode.value = modeIndices[viewMode] ?? 1;
  }, [selectedParam, depth, viewMode]);

  // Synchronize Color Palette, Layer Opacity, Vertical Exaggeration & Scale Mode
  useEffect(() => {
    const paletteMap = { default: 0, turbo: 1, viridis: 2, thermal: 3, coolwarm: 4, jet: 5 };
    const palVal = paletteMap[palette] ?? 1;

    if (uniformsRef.current.uPalette) uniformsRef.current.uPalette.value = palVal;
    if (depthWallUniformsRef.current.uPalette) depthWallUniformsRef.current.uPalette.value = palVal;

    if (uniformsRef.current.uOpacity) uniformsRef.current.uOpacity.value = layerOpacity;
    if (depthWallUniformsRef.current.uOpacity) depthWallUniformsRef.current.uOpacity.value = layerOpacity;

    if (uniformsRef.current.uLogScale) uniformsRef.current.uLogScale.value = isLogScale ? 1 : 0;
    if (depthWallUniformsRef.current.uLogScale) depthWallUniformsRef.current.uLogScale.value = isLogScale ? 1 : 0;

    if (depthCutawayGroupRef.current) {
      depthCutawayGroupRef.current.scale.y = verticalExaggeration;
    }
  }, [palette, layerOpacity, verticalExaggeration, isLogScale]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
