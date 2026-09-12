import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Thermometer, 
  Wind, 
  Activity, 
  Droplets, 
  Flower2, 
  Sparkles, 
  Compass, 
  Layers, 
  Box, 
  Boxes, 
  Maximize2, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  Globe2,
  ArrowRight,
  ShieldAlert,
  Gauge,
  BarChart3,
  Calendar,
  CloudRain
} from 'lucide-react';
import { PARAMETERS } from '../../data/oceanData';

export default function EnsoSimulationView({ onNavigateTab }) {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('Simulation');
  const [scenario, setScenario] = useState('elnino'); // 'normal' | 'elnino' | 'lanina'
  const [intensity, setIntensity] = useState(0.65);
  const [simYear, setSimYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState('Surface');
  const [selectedParam, setSelectedParam] = useState('sst');
  const [latInput, setLatInput] = useState('0.000');
  const [lonInput, setLonInput] = useState('160.000');

  const mountRef = useRef(null);
  const globeMeshRef = useRef(null);
  const thermalMeshRef = useRef(null);
  const depthSliceMeshRef = useRef(null);
  const volumeGroupRef = useRef(null);
  const vectorsGroupRef = useRef(null);

  const anomalyVal = scenario === 'elnino' 
    ? `+${(0.8 + intensity * 1.7).toFixed(1)} °C` 
    : scenario === 'lanina' 
    ? `-${(0.6 + intensity * 1.5).toFixed(1)} °C` 
    : '+0.1 °C';

  const ensoStatusTitle = scenario === 'elnino' 
    ? 'El Niño' 
    : scenario === 'lanina' 
    ? 'La Niña' 
    : 'Neutral (Normal)';

  const intensityLabel = intensity <= 0.35 
    ? 'Weak' 
    : intensity <= 0.7 
    ? 'Moderate' 
    : 'Strong';

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 4.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.3);
    sunLight.position.set(3, 4, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.8);
    rimLight.position.set(-4, -1, -3);
    scene.add(rimLight);

    const textureLoader = new THREE.TextureLoader();
    const globeRadius = 1.62;

    const satelliteTexture = textureLoader.load('/world_map_satellite.jpg', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      renderer.render(scene, camera);
    });

    // 1. Realistic Satellite Earth Sphere Mesh
    const globeGeo = new THREE.SphereGeometry(globeRadius, 96, 96);
    const globeMat = new THREE.MeshStandardMaterial({
      map: satelliteTexture,
      roughness: 0.48,
      metalness: 0.12
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    // Center directly on Equatorial Pacific Basin (160°W, Niño 3.4)
    globeMesh.rotation.y = Math.PI * 0.42;
    globeMesh.rotation.x = 0.08;
    scene.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // 2. High-Precision Seamless Equatorial Thermal Anomaly Shader Overlay
    const thermalGeo = new THREE.SphereGeometry(globeRadius * 1.006, 96, 96);
    const scenarioNum = scenario === 'elnino' ? 1.0 : scenario === 'lanina' ? 2.0 : 0.0;

    const thermalMat = new THREE.ShaderMaterial({
      uniforms: {
        uScenario: { value: scenarioNum },
        uIntensity: { value: intensity }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uScenario;
        uniform float uIntensity;
        varying vec3 vPosition;

        void main() {
          float radius = length(vPosition);
          float lat = asin(clamp(vPosition.y / radius, -1.0, 1.0));
          float theta = atan(vPosition.z, -vPosition.x);

          if (theta < -0.85 || theta > 1.85 || abs(lat) > 0.45) {
            discard;
          }

          float latDist = abs(lat);
          float latWeight = exp(-latDist * latDist * 28.0);

          if (uScenario > 0.5 && uScenario < 1.5) {
            // EL NIÑO: Warm pool surges eastward into Central & Eastern Pacific
            float lonDist = (theta - 0.75) / 0.95;
            float baseSurge = exp(-lonDist * lonDist * 1.7);
            float coastalCore = exp(-pow((theta - 1.45) / 0.45, 2.0)) * 0.95;
            float heat = max(baseSurge, coastalCore) * latWeight * uIntensity;

            if (heat < 0.05) discard;

            vec3 cCyan = vec3(0.0, 0.85, 0.95);
            vec3 cGreen = vec3(0.1, 0.95, 0.4);
            vec3 cYellow = vec3(1.0, 0.92, 0.0);
            vec3 cOrange = vec3(1.0, 0.45, 0.0);
            vec3 cRed = vec3(0.98, 0.08, 0.02);

            vec3 rgb;
            if (heat < 0.25) {
              rgb = mix(cCyan, cGreen, heat / 0.25);
            } else if (heat < 0.50) {
              rgb = mix(cGreen, cYellow, (heat - 0.25) / 0.25);
            } else if (heat < 0.75) {
              rgb = mix(cYellow, cOrange, (heat - 0.50) / 0.25);
            } else {
              rgb = mix(cOrange, cRed, (heat - 0.75) / 0.25);
            }

            gl_FragColor = vec4(rgb, clamp(heat * 1.15, 0.0, 0.94));

          } else if (uScenario > 1.5) {
            // LA NIÑA: Cold upwelling tongue along Central/Eastern Pacific
            float lonDist = (theta - 0.65) / 0.85;
            float coldSurge = exp(-lonDist * lonDist * 1.9) * latWeight * uIntensity;

            if (coldSurge < 0.05) discard;

            vec3 cDarkBlue = vec3(0.01, 0.12, 0.55);
            vec3 cRoyalBlue = vec3(0.0, 0.45, 0.95);
            vec3 cAqua = vec3(0.0, 0.9, 0.9);
            vec3 cMint = vec3(0.2, 0.95, 0.7);

            vec3 rgb;
            if (coldSurge < 0.35) {
              rgb = mix(cMint, cAqua, coldSurge / 0.35);
            } else if (coldSurge < 0.7) {
              rgb = mix(cAqua, cRoyalBlue, (coldSurge - 0.35) / 0.35);
            } else {
              rgb = mix(cRoyalBlue, cDarkBlue, (coldSurge - 0.7) / 0.3);
            }

            gl_FragColor = vec4(rgb, clamp(coldSurge * 1.1, 0.0, 0.92));

          } else {
            // NORMAL: Warm pool confined to Western Pacific
            float lonDist = (theta - (-0.35)) / 0.55;
            float normalPool = exp(-lonDist * lonDist * 2.2) * latWeight * 0.7;

            if (normalPool < 0.07) discard;
            vec3 rgb = mix(vec3(0.0, 0.8, 0.9), vec3(1.0, 0.6, 0.1), normalPool);
            gl_FragColor = vec4(rgb, normalPool * 0.75);
          }
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending
    });

    const thermalMesh = new THREE.Mesh(thermalGeo, thermalMat);
    globeMesh.add(thermalMesh);
    thermalMeshRef.current = thermalMesh;

    // 3. Glowing Atmospheric Ring
    const haloGeo = new THREE.SphereGeometry(globeRadius * 1.035, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.0, 0.75, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // 4. White Trade Wind Streamline Arrows matching reference
    const vectorGroup = new THREE.Group();
    globeMesh.add(vectorGroup);
    vectorsGroupRef.current = vectorGroup;

    const arrowTexCanvas = document.createElement('canvas');
    arrowTexCanvas.width = 128;
    arrowTexCanvas.height = 48;
    const aCtx = arrowTexCanvas.getContext('2d');
    aCtx.beginPath();
    aCtx.moveTo(15, 24);
    aCtx.lineTo(95, 24);
    aCtx.lineWidth = 7;
    aCtx.strokeStyle = '#ffffff';
    aCtx.stroke();
    aCtx.beginPath();
    aCtx.moveTo(75, 8);
    aCtx.lineTo(108, 24);
    aCtx.lineTo(75, 40);
    aCtx.fillStyle = '#ffffff';
    aCtx.fill();
    const arrowSpriteTex = new THREE.CanvasTexture(arrowTexCanvas);

    const arrowMeshes = [];
    const thetas = [-0.5, -0.2, 0.1, 0.4, 0.7, 1.0, 1.3];
    const lats = [-0.08, -0.02, 0.04, 0.10];

    thetas.forEach((th, cIdx) => {
      lats.forEach((lt, rIdx) => {
        const rad = globeRadius * 1.02;
        const y = rad * Math.sin(lt);
        const rCos = rad * Math.cos(lt);
        const x = -rCos * Math.cos(th);
        const z = rCos * Math.sin(th);

        const spriteMat = new THREE.SpriteMaterial({
          map: arrowSpriteTex,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMat);
        const scaleX = scenario === 'lanina' ? -0.18 : 0.18;
        sprite.scale.set(scaleX, 0.07, 1);
        sprite.position.set(x, y, z);

        vectorGroup.add(sprite);
        arrowMeshes.push({ sprite, cIdx, rIdx });
      });
    });

    // 5. View Mode: Depth Slice Subsurface Thermocline Mesh
    if (viewMode === 'Depth Slice') {
      const sliceGeo = new THREE.CylinderGeometry(globeRadius * 1.01, globeRadius * 0.85, 0.25, 48, 1, true, 0, Math.PI * 0.85);
      const sliceMat = new THREE.MeshBasicMaterial({
        color: scenario === 'elnino' ? 0xff4500 : scenario === 'lanina' ? 0x00d4ff : 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const depthSliceMesh = new THREE.Mesh(sliceGeo, sliceMat);
      depthSliceMesh.rotation.z = Math.PI * 0.5;
      globeMesh.add(depthSliceMesh);
      depthSliceMeshRef.current = depthSliceMesh;
    }

    // 6. View Mode: Volume Coordinate Grid
    if (viewMode === 'Volume') {
      const volGroup = new THREE.Group();
      [-0.15, 0.0, 0.15].forEach((latOffset) => {
        const ringRad = globeRadius * Math.cos(latOffset) * 1.015;
        const ringGeo = new THREE.RingGeometry(ringRad - 0.005, ringRad + 0.005, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: latOffset === 0.0 ? 0xfacc15 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.y = globeRadius * Math.sin(latOffset);
        ringMesh.rotation.x = Math.PI * 0.5;
        volGroup.add(ringMesh);
      });
      globeMesh.add(volGroup);
      volumeGroupRef.current = volGroup;
    }

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const dom = renderer.domElement;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging || !globeMeshRef.current) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      globeMeshRef.current.rotation.y += dx * 0.005;
      globeMeshRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, globeMeshRef.current.rotation.x + dy * 0.005));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(2.6, Math.min(6.2, camera.position.z + e.deltaY * 0.0025));
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isPlaying && globeMeshRef.current) {
        globeMeshRef.current.rotation.y += 0.0004;
      }

      arrowMeshes.forEach((item) => {
        const flow = (elapsed * 3.2 + item.cIdx * 0.75) % (Math.PI * 2);
        item.sprite.material.opacity = 0.35 + Math.sin(flow) * 0.65;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [scenario, intensity, isPlaying, viewMode, selectedParam]);

  const paramIcons = {
    sst: Thermometer,
    salinity: Droplets,
    currents: Wind,
    wave: Activity,
    chlorophyll: Flower2,
    oxygen: Sparkles
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#020713] text-slate-100 select-none overflow-hidden">
      <div className="relative flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Coordinates & 8 Parameters */}
        <aside className="w-72 h-full flex flex-col gap-3 p-3 select-none overflow-y-auto z-20 border-r border-sky-500/15 bg-[#03091e]/80 backdrop-blur-md">
          <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/30 shadow-cockpit bg-[#061230]/70">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('enso.positionCoords', 'Position / Coordinates')}</span>
              </div>
              <button className="text-[10px] font-bold text-cyan-400 hover:text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/30 transition-colors">
                {t('enso.changeBasin', 'Change Basin')}
              </button>
            </div>

            <div className="mb-2.5 px-1">
              <div className="text-xs font-bold text-white truncate">Pacific Ocean</div>
              <div className="text-[10px] font-mono text-sky-300/80">0.000° N, 160.000° W</div>
            </div>

            <div className="bg-[#03081a]/90 p-2.5 rounded-xl border border-sky-500/20 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block mb-0.5">{t('controls.latitude', 'Lat (°N/S)')}</span>
                  <input
                    type="text"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-[#020612] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block mb-0.5">{t('controls.longitude', 'Lon (°E/W)')}</span>
                  <input
                    type="text"
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-[#020612] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
              </div>
              <button className="w-full py-1.5 rounded-lg bg-sky-600/80 hover:bg-cyan-500 hover:text-slate-950 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-glow-cyan">
                <span>{t('enso.targetCoords', 'Target Coordinates')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3 border border-sky-500/20 bg-[#061230]/70 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                {t('controls.oceanParameters', 'Parameters')}
              </span>
              <span className="text-[10px] text-sky-400/80 font-mono">{t('enso.variablesCount', '8 Variables')}</span>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
              {Object.values(PARAMETERS).map((param) => {
                const Icon = paramIcons[param.id] || Activity;
                const isSelected = selectedParam === param.id;

                return (
                  <button
                    key={param.id}
                    onClick={() => setSelectedParam(param.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 text-white shadow-glow-cyan border border-cyan-400/50 scale-[1.01]'
                        : 'bg-[#0a1838]/50 text-slate-300 hover:bg-[#112450]/80 hover:text-white border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-sky-500/10 text-sky-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold leading-tight">
                        {t('parameters.' + param.id, param.name)}
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'text-cyan-200 bg-sky-900/50' : 'text-slate-400'}`}>
                      {param.unit}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setSelectedParam('density')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  selectedParam === 'density'
                    ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 text-white shadow-glow-cyan border border-cyan-400/50 scale-[1.01]'
                    : 'bg-[#0a1838]/50 text-slate-300 hover:bg-[#112450]/80 hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${selectedParam === 'density' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-sky-500/10 text-sky-400'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold leading-tight">{t('enso.oceanDensity', 'Ocean Density')}</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">kg/m³</span>
              </button>

              <button
                onClick={() => setSelectedParam('ph')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  selectedParam === 'ph'
                    ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 text-white shadow-glow-cyan border border-cyan-400/50 scale-[1.01]'
                    : 'bg-[#0a1838]/50 text-slate-300 hover:bg-[#112450]/80 hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${selectedParam === 'ph' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-sky-500/10 text-sky-400'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold leading-tight">{t('enso.oceanAcidification', 'Ocean Acidification (pH)')}</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">pH</span>
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: 3D Pacific Globe */}
        <main className="relative flex-1 h-full overflow-hidden bg-[#020713]">
          {/* Top Floating Control Bar matching reference image */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between bg-[#040e28]/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-sky-500/25 shadow-lg">
            {/* Title & Sub-tabs */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0">
                <div className="p-1 rounded-xl bg-orange-500/20 text-orange-400">
                  <Thermometer className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <h2 className="text-xs font-black tracking-wide text-white whitespace-nowrap">
                  {t('navbar.ensoSimulation', 'ENSO / El Niño Simulation')}
                </h2>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 bg-[#020817]/70 p-0.5 rounded-xl border border-white/10 shrink-0">
                {[
                  { key: 'simulation', label: 'Simulation' },
                  { key: 'prediction', label: 'Prediction' },
                  { key: 'ensoIndex', label: 'ENSO Index' },
                  { key: 'impactAnalysis', label: 'Impact Analysis' }
                ].map(({ key, label }) => {
                  const isActive = activeSubTab === label;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSubTab(label)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-glow-cyan'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {t(`enso.subTabs.${key}`, label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario, Intensity, and Year Controls */}
            <div className="flex items-center gap-2.5">
              {/* Scenario selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{t('enso.phaseState', 'Scenario')}</span>
                <div className="flex items-center gap-0.5 bg-[#020817] p-0.5 rounded-xl border border-white/10">
                  {[
                    { id: 'normal', label: t('enso.normal', 'Normal') },
                    { id: 'elnino', label: t('enso.elnino', 'El Niño') },
                    { id: 'lanina', label: t('enso.lanina', 'La Niña') }
                  ].map((sc) => {
                    const isCur = scenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => setScenario(sc.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap ${
                          isCur
                            ? sc.id === 'elnino'
                              ? 'bg-red-600 text-white border border-red-400/40 shadow-glow-red'
                              : sc.id === 'lanina'
                              ? 'bg-blue-600 text-white border border-cyan-400/40 shadow-glow-cyan'
                              : 'bg-sky-700 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{t('enso.intensityLabel', 'Intensity')}</span>
                <div className="flex items-center gap-1 bg-[#020817] px-2 py-0.5 rounded-xl border border-white/10">
                  <span className="text-[8.5px] font-mono text-slate-400">{t('enso.weak', 'Weak')}</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-14 h-1.5 bg-sky-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-[10px] font-mono font-bold text-amber-300 min-w-[48px] text-center">
                    {intensity <= 0.35 ? t('enso.weak', 'Weak') : intensity <= 0.7 ? t('enso.moderate', 'Moderate') : t('enso.strong', 'Strong')}
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-400">{t('enso.strong', 'Strong')}</span>
                </div>
              </div>

              {/* Year Scrubber */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Year</span>
                <div className="flex items-center gap-0.5 bg-[#020817] px-1.5 py-0.5 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setSimYear(y => y - 1)}
                    className="text-slate-400 hover:text-white px-1 font-bold text-xs"
                  >
                    &lt;
                  </button>
                  <span className="text-xs font-mono font-bold text-white px-1">{simYear}</span>
                  <button 
                    onClick={() => setSimYear(y => y + 1)}
                    className="text-slate-400 hover:text-white px-1 font-bold text-xs"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5 bg-[#030a1c]/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => onNavigateTab?.('3D View')}
              title="Return to Regional 3D View"
              className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Box className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigateTab?.('Map View')}
              title="2D Global Map"
              className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Globe2 className="w-4 h-4" />
            </button>
            <button 
              title="Toggle Layers"
              className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button 
              title="SST Layer Active"
              className="p-2.5 rounded-xl bg-red-500/30 text-red-300 border border-red-500/40 transition-colors"
            >
              <Thermometer className="w-4 h-4" />
            </button>
            <button 
              title="Volume Grid"
              className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Boxes className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-44 left-16 z-20 flex flex-col gap-8 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-white/40" />
              <span>0 m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-white/40" />
              <span>500 m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-white/40" />
              <span>1000 m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-white/40" />
              <span>2000 m</span>
            </div>
          </div>

          <div className="absolute bottom-20 left-6 z-20 bg-[#040e28]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-sky-500/25 flex items-center gap-3">
            <div className="text-cyan-300 font-mono font-bold tracking-widest text-sm animate-pulse">
              {scenario === 'elnino' ? '→ → →' : '← ← ←'}
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Trade Winds</div>
              <div className="text-xs font-bold text-white">
                {scenario === 'elnino' ? '(Weakened / Reversed)' : '(Intensified Easterlies)'}
              </div>
            </div>
          </div>

          <div className="absolute top-20 right-6 z-20 bg-[#040e28]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col gap-1.5 min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span>SST Anomaly (°C)</span>
            </div>
            <div 
              className="h-2.5 w-full rounded-full border border-white/20 shadow-inner"
              style={{
                background: 'linear-gradient(to right, #001f3f, #0074D9, #00d2be, #2ECC40, #FFDC00, #FF851B, #FF4136)'
              }}
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-300">
              <span>-2.0</span>
              <span>-1.0</span>
              <span>0.0</span>
              <span>+1.0</span>
              <span>+2.0</span>
            </div>
          </div>

          {/* Subtab Conditional Rendering */}
          {activeSubTab === 'Simulation' ? (
            <>
              {/* Three.js 3D Pacific Viewport */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* CONTINENT LABELS MATCHING REFERENCE IMAGE */}
              <div className="absolute top-[25%] left-[28%] z-20 pointer-events-none">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#03091e]/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
                  ASIA
                </div>
              </div>
              <div className="absolute top-[72%] left-[26%] z-20 pointer-events-none">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#03091e]/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
                  AUSTRALIA
                </div>
              </div>
              <div className="absolute top-[22%] right-[22%] z-20 pointer-events-none">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#03091e]/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
                  NORTH AMERICA
                </div>
              </div>
              <div className="absolute top-[62%] right-[20%] z-20 pointer-events-none">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#03091e]/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
                  SOUTH AMERICA
                </div>
              </div>
              <div className="absolute top-[38%] left-[50%] -translate-x-1/2 z-20 pointer-events-none">
                <div className="text-[12px] font-black uppercase tracking-widest text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] bg-[#020b1e]/75 px-3 py-0.5 rounded-lg border border-cyan-500/30 backdrop-blur-sm shadow-lg">
                  Pacific Ocean
                </div>
              </div>

              {/* FLOATING CALLOUT BADGES */}
              {scenario === 'elnino' ? (
                <>
                  <div className="absolute top-1/2 left-[54%] -translate-y-12 z-20 pointer-events-none animate-bounce">
                    <div className="bg-red-950/90 text-red-200 border border-red-500/50 shadow-glow-red px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                      <span>Warmer SST ({anomalyVal})</span>
                    </div>
                  </div>

                  <div className="absolute top-[58%] right-[32%] z-20 pointer-events-none">
                    <div className="bg-sky-950/90 text-sky-200 border border-sky-400/50 shadow-glow-cyan px-3 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md">
                      Reduced Upwelling
                    </div>
                  </div>
                </>
              ) : scenario === 'lanina' ? (
                <>
                  <div className="absolute top-1/2 left-[52%] -translate-y-12 z-20 pointer-events-none animate-bounce">
                    <div className="bg-blue-950/90 text-cyan-200 border border-cyan-400/50 shadow-glow-cyan px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Colder SST ({anomalyVal})</span>
                    </div>
                  </div>

                  <div className="absolute top-[58%] right-[32%] z-20 pointer-events-none">
                    <div className="bg-emerald-950/90 text-emerald-200 border border-emerald-400/50 shadow-glow-cyan px-3 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md">
                      Enhanced Upwelling (+58%)
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute top-1/2 left-[48%] -translate-y-12 z-20 pointer-events-none">
                  <div className="bg-slate-900/90 text-slate-200 border border-slate-500/50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <span>Equatorial Pacific Equilibrium</span>
                  </div>
                </div>
              )}
            </>
          ) : activeSubTab === 'Prediction' ? (
            <div className="w-full h-full p-6 pt-16 overflow-y-auto z-10 flex flex-col gap-4 bg-[#020817]/95 backdrop-blur-xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 glass-panel p-4 rounded-2xl border border-sky-500/20 bg-[#061433]/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-bold text-white">AI Multi-Model Ensemble Plume (2026-2027)</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 bg-sky-900/40 px-2 py-0.5 rounded border border-sky-500/30">
                      5 Dynamic Global Climate Models
                    </span>
                  </div>
                  <div className="h-56 w-full bg-[#03091e] rounded-xl p-3 border border-white/10 relative flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Threshold +0.5°C (El Niño)</span>
                      <span className="text-red-400 font-bold">Ensemble Mean: +1.6°C</span>
                    </div>
                    <svg className="w-full h-36" viewBox="0 0 100 40">
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="2,2" />
                      <line x1="0" y1="12" x2="100" y2="12" stroke="rgba(239,68,68,0.4)" strokeWidth="0.8" strokeDasharray="3,3" />
                      <line x1="0" y1="28" x2="100" y2="28" stroke="rgba(56,189,248,0.4)" strokeWidth="0.8" strokeDasharray="3,3" />
                      {/* NOAA CFSv2 */}
                      <path d="M 5,20 Q 25,14 50,8 T 95,10" fill="none" stroke="#ef4444" strokeWidth="1.8" />
                      {/* ECMWF SEAS5 */}
                      <path d="M 5,20 Q 25,16 50,11 T 95,13" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                      {/* BOM ACCESS-S2 */}
                      <path d="M 5,20 Q 25,15 50,9 T 95,11" fill="none" stroke="#10b981" strokeWidth="1.8" />
                      {/* Antigravity AI Transformer */}
                      <path d="M 5,20 Q 25,13 50,7 T 95,8" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                    </svg>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>May 2026</span>
                      <span>Jul 2026</span>
                      <span>Sep 2026 (Peak)</span>
                      <span>Nov 2026</span>
                      <span>Jan 2027</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-[#061433]/80 flex flex-col justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block mb-1">ENSO State Probabilities</span>
                    <span className="text-xs text-slate-400">Next 6 Months Forecast</span>
                  </div>
                  <div className="space-y-3 my-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-300 font-bold">El Niño Probability</span>
                        <span className="font-mono font-bold text-red-400">82%</span>
                      </div>
                      <div className="h-2.5 bg-[#03091e] rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[82%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Neutral Probability</span>
                        <span className="font-mono font-bold text-slate-400">14%</span>
                      </div>
                      <div className="h-2.5 bg-[#03091e] rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-slate-500 w-[14%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-300">La Niña Probability</span>
                        <span className="font-mono font-bold text-blue-400">4%</span>
                      </div>
                      <div className="h-2.5 bg-[#03091e] rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-cyan-500 w-[4%]" />
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300 bg-sky-950/80 p-2.5 rounded-xl border border-sky-500/20">
                    High probability of sustained warm episode extending through boreal winter 2026-27.
                  </div>
                </div>
              </div>
            </div>
          ) : activeSubTab === 'ENSO Index' ? (
            <div className="w-full h-full p-6 pt-16 overflow-y-auto z-10 flex flex-col gap-4 bg-[#020817]/95 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { region: 'Niño 1+2', area: '0°-10°S, 90°-80°W (Coastal Peru)', anomaly: '+1.9 °C', status: 'Extreme Warming', color: 'text-red-400 border-red-500/40' },
                  { region: 'Niño 3', area: '5°N-5°S, 150°-90°W (East Pacific)', anomaly: '+1.7 °C', status: 'Strong Surge', color: 'text-orange-400 border-orange-500/40' },
                  { region: 'Niño 3.4', area: '5°N-5°S, 170°-120°W (Core Index)', anomaly: anomalyVal, status: 'Official Indicator', color: 'text-red-400 border-red-500/40' },
                  { region: 'Niño 4', area: '5°N-5°S, 160°E-150°W (West-Central)', anomaly: '+0.8 °C', status: 'Moderate Surge', color: 'text-amber-400 border-amber-500/40' }
                ].map((item) => (
                  <div key={item.region} className={`glass-panel p-3.5 rounded-2xl border ${item.color} bg-[#061433]/80`}>
                    <div className="text-xs font-bold text-white mb-0.5">{item.region}</div>
                    <div className="text-[9.5px] font-mono text-slate-400 mb-2">{item.area}</div>
                    <div className="text-xl font-bold font-mono text-red-400">{item.anomaly}</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-1">{item.status}</div>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-[#061433]/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">Historical ONI & Super El Niño Analog Comparison</span>
                  <span className="text-xs font-mono text-cyan-300">Peak Oceanic Niño Index (°C)</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-[#03091e] p-3 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400">1997-1998</div>
                    <div className="text-lg font-bold font-mono text-red-400">+2.4 °C</div>
                    <div className="text-[10px] text-slate-400">Super El Niño</div>
                  </div>
                  <div className="bg-[#03091e] p-3 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400">2015-2016</div>
                    <div className="text-lg font-bold font-mono text-red-400">+2.6 °C</div>
                    <div className="text-[10px] text-slate-400">Record Godzilla Event</div>
                  </div>
                  <div className="bg-[#03091e] p-3 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400">2023-2024</div>
                    <div className="text-lg font-bold font-mono text-orange-400">+2.0 °C</div>
                    <div className="text-[10px] text-slate-400">Strong Event</div>
                  </div>
                  <div className="bg-[#03091e] p-3 rounded-xl border border-cyan-500/40 shadow-glow-cyan">
                    <div className="text-[10px] text-cyan-300 font-bold">2026 Simulation</div>
                    <div className="text-lg font-bold font-mono text-cyan-300">{anomalyVal}</div>
                    <div className="text-[10px] text-slate-300">{intensityLabel} Intensity</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full p-6 pt-16 overflow-y-auto z-10 flex flex-col gap-4 bg-[#020817]/95 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-[#0a1226]/80">
                  <div className="flex items-center gap-2 mb-2 text-amber-300 text-sm font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Indian Summer Monsoon (ISMR) Deficit Risk</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Walker circulation shift displaces convection eastward away from the Indian subcontinent, increasing probability of delayed or deficient monsoon precipitation.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#03091e] p-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Deficit Risk</span>
                      <span className="text-red-400 font-bold text-sm">68% High</span>
                    </div>
                    <div className="bg-[#03091e] p-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Reservoir Alert</span>
                      <span className="text-amber-400 font-bold text-sm">Moderate Alert</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-[#0a1226]/80">
                  <div className="flex items-center gap-2 mb-2 text-red-300 text-sm font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Pacific Marine Fisheries & Coral Bleaching</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Suppression of the Humboldt current upwelling restricts nutrient-rich cold bottom water, triggering collapses in anchovy biomass and severe coral bleaching across the central Pacific.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#03091e] p-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Upwelling Deficit</span>
                      <span className="text-red-400 font-bold text-sm">-58% Suppressed</span>
                    </div>
                    <div className="bg-[#03091e] p-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Bleaching Alert</span>
                      <span className="text-orange-400 font-bold text-sm">Level 2 Extreme</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#040e28]/90 backdrop-blur-md p-1.5 rounded-2xl border border-sky-500/30 shadow-2xl">
            {[
              { id: 'Surface', icon: Layers },
              { id: 'Depth Slice', icon: Box },
              { id: 'Volume', icon: Boxes },
              { id: 'Vector Field', icon: Maximize2 }
            ].map((m) => {
              const Icon = m.icon;
              const isSel = viewMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setViewMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSel
                      ? 'bg-sky-600 text-white shadow-glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.id}</span>
                </button>
              );
            })}
          </div>
        </main>

        {/* RIGHT COLUMN */}
        <aside className="w-80 h-full flex flex-col gap-3 p-3 select-none overflow-y-auto z-20 border-l border-sky-500/15 bg-[#03091e]/80 backdrop-blur-md">
          <div className="glass-panel rounded-2xl p-3.5 border border-red-500/30 bg-gradient-to-b from-[#180816]/90 to-[#08122d]/90 shadow-glow-red">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-red-500/20 text-red-400">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">ENSO STATUS</div>
                  <div className="text-base font-black text-white">{ensoStatusTitle}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/25 text-red-300 border border-red-500/30">
                {intensityLabel} Intensity
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
              <div>
                <div className="text-[9px] font-mono text-slate-400 uppercase">ENSO Index (Niño 3.4)</div>
                <div className="text-base font-bold font-mono text-red-400 mt-0.5 flex items-center gap-1">
                  <span>{anomalyVal}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-400 uppercase">Trend</div>
                <div className="text-xs font-bold text-white mt-1">Strengthening</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/20 bg-[#061230]/70">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
              SIMULATION CONTROLS
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isPlaying
                    ? 'bg-sky-600/80 hover:bg-sky-500 text-white border-sky-400/40 shadow-glow-cyan'
                    : 'bg-amber-600/80 hover:bg-amber-500 text-white border-amber-400/40'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setScenario('normal');
                  setIntensity(0.5);
                  setIsPlaying(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="relative flex items-center justify-between my-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <div className="flex-1 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 mx-1 rounded-full relative">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-glow-red transition-all"
                    style={{ left: scenario === 'elnino' ? '65%' : scenario === 'lanina' ? '90%' : '15%' }}
                  />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Normal</span>
                <span className="text-red-400 font-bold text-center">
                  {scenario === 'elnino' ? 'El Niño' : scenario === 'lanina' ? 'La Niña' : 'Normal'}
                  <div className="text-[8px] text-slate-400 font-normal">(You are here)</div>
                </span>
                <span>La Niña</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/20 bg-[#061230]/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI PREDICTION (Next 6 Months)</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2.5 mt-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">El Niño Probability</span>
                  <span className="font-bold text-cyan-300 font-mono">82%</span>
                </div>
                <div className="h-2 w-full bg-[#020817] rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Expected Intensity</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <span>↓ Moderate</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Confidence</span>
                <span className="font-mono font-bold text-emerald-400">76%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3.5 border border-amber-500/30 bg-gradient-to-b from-[#181105]/80 to-[#07132e]/90 shadow-glow-amber">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>REGIONAL IMPACT</span>
              </div>
              <button 
                onClick={() => onNavigateTab?.('3D View')}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>View Details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 -mt-1.5 mb-2 font-mono">(India / Bay of Bengal)</div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between bg-[#040e24]/70 p-1.5 rounded-lg border border-white/5">
                <span className="text-slate-300">Monsoon Risk</span>
                <span className="font-bold text-red-400 flex items-center gap-1 font-mono">
                  <span>↑ High</span>
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#040e24]/70 p-1.5 rounded-lg border border-white/5">
                <span className="text-slate-300">SST Anomaly</span>
                <span className="font-bold text-amber-300 font-mono">+0.8 °C</span>
              </div>

              <div className="flex items-center justify-between bg-[#040e24]/70 p-1.5 rounded-lg border border-white/5">
                <span className="text-slate-300">Rainfall Risk</span>
                <span className="font-bold text-blue-400 flex items-center gap-1 font-mono">
                  <span>↓ Below Normal</span>
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#040e24]/70 p-1.5 rounded-lg border border-white/5">
                <span className="text-slate-300">Marine Ecosystem</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1 font-mono">
                  <span>◎ Moderate</span>
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 2. BOTTOM 5-CARD DIAGNOSTIC CLIMATOLOGY STRIP */}
      <footer className="h-52 px-4 py-2 bg-[#020615] border-t border-sky-500/20 backdrop-blur-md flex flex-col justify-between z-30">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">
          {/* Card 1: SST Anomaly */}
          <div className="glass-panel rounded-2xl p-2.5 border border-sky-500/20 bg-[#051128]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-white uppercase">SST Anomaly</span>
              <span className="text-[9px] font-mono text-cyan-300">(Pacific Ocean)</span>
            </div>
            <div className="relative h-20 w-full rounded-xl overflow-hidden border border-white/10 bg-[#020b1e] flex items-center justify-center">
              <div 
                className="w-full h-full"
                style={{
                  background: scenario === 'elnino'
                    ? 'radial-gradient(ellipse at center, #ff1a00 0%, #ff8800 35%, #22c55e 65%, #0284c7 85%, #031538 100%)'
                    : scenario === 'lanina'
                    ? 'radial-gradient(ellipse at center, #0055ff 0%, #00bbff 35%, #00ffbb 65%, #0284c7 85%, #031538 100%)'
                    : 'radial-gradient(ellipse at center, #0284c7 0%, #0369a1 40%, #031538 100%)',
                  filter: 'blur(3px)',
                  opacity: 0.92
                }}
              />
              <div className="absolute inset-y-0 right-1 flex flex-col justify-between py-1 text-[8px] font-mono text-white/80">
                <span>+2.0</span>
                <span>+1.0</span>
                <span>0.0</span>
                <span>-1.0</span>
                <span>-2.0</span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate mt-1">
              {scenario === 'elnino' ? 'Central/Eastern Pacific warming' : scenario === 'lanina' ? 'Strong equatorial cold tongue' : 'Neutral thermal equilibrium'}
            </div>
          </div>

          {/* Card 2: Trade Wind Speed */}
          <div className="glass-panel rounded-2xl p-2.5 border border-sky-500/20 bg-[#051128]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-white uppercase">Trade Wind Speed</span>
              <span className="text-[9px] font-mono text-slate-400">m/s</span>
            </div>
            <div className="relative h-20 w-full rounded-xl border border-white/10 bg-[#020b1e] p-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-end gap-2 text-[8px] font-mono">
                <span className="text-sky-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-sky-400" /> Normal
                </span>
                <span className={`${scenario === 'elnino' ? 'text-red-400' : 'text-cyan-400'} flex items-center gap-1`}>
                  <span className={`w-2 h-0.5 ${scenario === 'elnino' ? 'bg-red-400' : 'bg-cyan-400'}`} /> {scenario === 'elnino' ? 'El Niño' : 'La Niña'}
                </span>
              </div>
              <svg className="w-full h-12" viewBox="0 0 100 40">
                <path
                  d="M 5,14 Q 25,18 50,15 T 95,20"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <path
                  d={scenario === 'elnino' ? "M 5,10 Q 25,24 50,28 T 95,34" : "M 5,20 Q 25,10 50,8 T 95,6"}
                  fill="none"
                  stroke={scenario === 'elnino' ? "#ef4444" : "#06b6d4"}
                  strokeWidth="2"
                />
                <circle cx="5" cy={scenario === 'elnino' ? 10 : 20} r="1.5" fill={scenario === 'elnino' ? "#ef4444" : "#06b6d4"} />
                <circle cx="28" cy={scenario === 'elnino' ? 24 : 10} r="1.5" fill={scenario === 'elnino' ? "#ef4444" : "#06b6d4"} />
                <circle cx="60" cy={scenario === 'elnino' ? 27 : 8} r="1.5" fill={scenario === 'elnino' ? "#ef4444" : "#06b6d4"} />
                <circle cx="95" cy={scenario === 'elnino' ? 34 : 6} r="1.5" fill={scenario === 'elnino' ? "#ef4444" : "#06b6d4"} />
              </svg>
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate mt-1">
              {scenario === 'elnino' ? 'Weaker trade winds during El Niño' : scenario === 'lanina' ? 'Intensified trade winds during La Niña' : 'Steady baseline easterlies'}
            </div>
          </div>

          {/* Card 3: Upwelling Index */}
          <div className="glass-panel rounded-2xl p-2.5 border border-sky-500/20 bg-[#051128]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-white uppercase">Upwelling Index</span>
              <span className="text-[9px] font-mono text-slate-400">%</span>
            </div>
            <div className="relative h-20 w-full rounded-xl border border-white/10 bg-[#020b1e] p-2 flex items-end justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-cyan-300 font-bold">100%</span>
                <div className="w-7 h-11 bg-gradient-to-t from-blue-700 to-cyan-400 rounded-t-lg shadow-glow-cyan" />
                <span className="text-[8.5px] font-mono text-slate-400 mt-0.5">Normal</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[9px] font-mono font-bold ${scenario === 'elnino' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scenario === 'elnino' ? '42%' : scenario === 'lanina' ? '158%' : '100%'}
                </span>
                <div 
                  className={`w-7 rounded-t-lg ${
                    scenario === 'elnino' 
                      ? 'h-5 bg-gradient-to-t from-red-800 to-red-500 shadow-glow-red' 
                      : scenario === 'lanina'
                      ? 'h-14 bg-gradient-to-t from-emerald-800 to-emerald-400 shadow-glow-cyan'
                      : 'h-11 bg-gradient-to-t from-sky-800 to-sky-400'
                  }`} 
                />
                <span className="text-[8.5px] font-mono text-slate-400 mt-0.5">{scenario === 'elnino' ? 'El Niño' : scenario === 'lanina' ? 'La Niña' : 'Neutral'}</span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate mt-1">
              {scenario === 'elnino' ? 'Reduced upwelling in eastern Pacific' : scenario === 'lanina' ? 'Supercharged nutrient-rich upwelling' : 'Equilibrium upwelling state'}
            </div>
          </div>

          {/* Card 4: Rainfall Pattern */}
          <div className="glass-panel rounded-2xl p-2.5 border border-sky-500/20 bg-[#051128]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-white uppercase">Rainfall Pattern</span>
            </div>
            <div className="relative h-20 w-full rounded-xl overflow-hidden border border-white/10 bg-[#030919] p-1 flex flex-col justify-between">
              <svg className="w-full h-12" viewBox="0 0 100 45">
                <path d="M 5,15 Q 12,8 25,12 T 35,25" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                <path d="M 65,10 Q 75,6 90,14 T 92,30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                {scenario === 'elnino' ? (
                  <>
                    <ellipse cx="55" cy="22" rx="16" ry="8" fill="rgba(0,255,200,0.6)" filter="blur(1px)" />
                    <circle cx="55" cy="22" r="5" fill="#facc15" />
                    <ellipse cx="22" cy="28" rx="9" ry="6" fill="rgba(239,68,68,0.6)" filter="blur(1px)" />
                  </>
                ) : (
                  <>
                    <ellipse cx="25" cy="22" rx="16" ry="8" fill="rgba(0,255,200,0.6)" filter="blur(1px)" />
                    <circle cx="25" cy="22" r="5" fill="#facc15" />
                    <ellipse cx="65" cy="28" rx="9" ry="6" fill="rgba(239,68,68,0.6)" filter="blur(1px)" />
                  </>
                )}
              </svg>
              <div className="flex items-center justify-center gap-3 text-[8px] font-mono">
                <span className="flex items-center gap-1 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> More Rainfall
                </span>
                <span className="flex items-center gap-1 text-red-300">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Less Rainfall
                </span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate mt-1">
              {scenario === 'elnino' ? 'Shifted convection towards central/eastern Pacific' : 'Convection centered over Indo-Pacific warm pool'}
            </div>
          </div>

          {/* Card 5: ENSO Index */}
          <div className="glass-panel rounded-2xl p-2.5 border border-sky-500/20 bg-[#051128]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-white uppercase">ENSO Index (Niño 3.4)</span>
              <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                Current {anomalyVal}
              </span>
            </div>
            <div className="relative h-20 w-full rounded-xl border border-white/10 bg-[#020b1e] p-1.5 flex flex-col justify-between">
              <div className="flex justify-between text-[7.5px] font-mono text-slate-500">
                <span>+2.0</span>
                <span>+1.0</span>
                <span>0.0</span>
                <span>-1.0</span>
                <span>-2.0</span>
              </div>
              <svg className="w-full h-10" viewBox="0 0 100 35">
                <line x1="0" y1="18" x2="100" y2="18" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <path
                  d="M 5,18 Q 15,14 25,22 Q 35,26 42,18 Z"
                  fill="rgba(56,189,248,0.3)"
                />
                <path
                  d={scenario === 'elnino' ? "M 42,18 Q 55,10 70,12 Q 85,8 95,6 L 95,18 Z" : "M 42,18 Q 55,24 70,26 Q 85,28 95,30 L 95,18 Z"}
                  fill={scenario === 'elnino' ? "rgba(239,68,68,0.35)" : "rgba(6,182,212,0.35)"}
                />
                <path
                  d={scenario === 'elnino' ? "M 5,16 Q 15,14 25,22 Q 35,26 42,18 Q 55,10 70,12 Q 85,8 95,6" : "M 5,16 Q 15,14 25,22 Q 35,26 42,18 Q 55,24 70,26 Q 85,28 95,30"}
                  fill="none"
                  stroke={scenario === 'elnino' ? "#ef4444" : "#06b6d4"}
                  strokeWidth="1.8"
                />
              </svg>
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>2023</span>
                <span>2024</span>
                <span>2025</span>
                <span>2026</span>
                <span>2027</span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate mt-1">
              Historical & Forecast
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <span>🌊</span> Ocean Vision 3D
            </span>
            <span>|</span>
            <span>Real-time Ocean Monitoring</span>
            <span>|</span>
            <span>Climate Intelligence</span>
            <span>|</span>
            <span>A Sustainable Future</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by AI + Satellite Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
