import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCw, Shield, Sparkles, ChevronDown, ChevronUp, ZoomIn, Eye } from 'lucide-react';

// Pre-allocated math objects to guarantee zero Garbage Collection during 60fps loop
const _vec3 = new THREE.Vector3();
const _targetRotation = new THREE.Euler(0, 0, 0);

interface WorkPartner3DTokenProps {
  compact?: boolean;
}

export const WorkPartner3DToken: React.FC<WorkPartner3DTokenProps> = ({ compact = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [materialTheme, setMaterialTheme] = useState<'gold' | 'steel' | 'emerald'>('gold');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References to procedural groups and parts for damping animations
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rootGroup: THREE.Group;
    helmetGroup: THREE.Group;
    toolsGroup: THREE.Group;
    gearMesh: THREE.Mesh;
    baseMesh: THREE.Mesh;
    materials: THREE.Material[];
    reqId: number;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 280;

    // 1. Modern Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Scene & Studio PBR Environment
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Perspective Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    camera.lookAt(0, 0.6, 0);

    // 4. Studio Lighting Rig (Warm Key + Cool Hemisphere + Soft Rim)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.4);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 5. Procedural Ground Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.7)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.3)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.65
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // 6. Materials with distinct roughness/metalness differences
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.18,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.45,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12,
    });

    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Work Safety Gold / Yellow
      metalness: 0.3,
      roughness: 0.35,
    });

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.4,
      roughness: 0.25,
    });

    const rubyBadgeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.5,
      roughness: 0.3,
    });

    const materials = [goldMat, darkMetalMat, chromeMat, helmetMat, emeraldMat, rubyBadgeMat];

    // 7. Composite Procedural Model (3-12 parts THREE.Group)
    // Root token group pivoted bottom-center
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0, 0);
    scene.add(rootGroup);

    // PART 1: Chamfered Plinth / Base Medallion
    const baseGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.22, 48);
    const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    baseMesh.position.y = 0.11;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    rootGroup.add(baseMesh);

    // PART 2: Outer Laurel / Beveled Ring
    const ringGeo = new THREE.TorusGeometry(1.22, 0.08, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, goldMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.22;
    ringMesh.castShadow = true;
    rootGroup.add(ringMesh);

    // PART 3: Precision Industrial Gear Cog (8 procedural teeth)
    const gearGroup = new THREE.Group();
    const gearHubGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.12, 32);
    const gearHub = new THREE.Mesh(gearHubGeo, goldMat);
    gearHub.castShadow = true;
    gearGroup.add(gearHub);

    // 8 teeth around the gear
    const toothGeo = new THREE.BoxGeometry(0.22, 0.12, 0.22);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, goldMat);
      tooth.position.set(Math.cos(angle) * 0.9, 0, Math.sin(angle) * 0.9);
      tooth.rotation.y = -angle;
      tooth.castShadow = true;
      gearGroup.add(tooth);
    }
    gearGroup.position.y = 0.28;
    rootGroup.add(gearGroup);

    // PART 4: Crossed Precision Tools Group (Secondary silhouette)
    const toolsGroup = new THREE.Group();
    toolsGroup.position.y = 0.38;

    // Tool 1: Wrench (Cylinder shaft + open jaw ends)
    const wrenchGroup = new THREE.Group();
    const wrenchShaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 16);
    const wrenchShaft = new THREE.Mesh(wrenchShaftGeo, chromeMat);
    wrenchShaft.castShadow = true;
    wrenchGroup.add(wrenchShaft);

    const wrenchJawGeo = new THREE.TorusGeometry(0.12, 0.035, 12, 24, Math.PI * 1.5);
    const wrenchJawTop = new THREE.Mesh(wrenchJawGeo, chromeMat);
    wrenchJawTop.position.y = 0.65;
    wrenchJawTop.rotation.z = Math.PI / 4;
    wrenchGroup.add(wrenchJawTop);

    wrenchGroup.rotation.z = Math.PI / 4;
    toolsGroup.add(wrenchGroup);

    // Tool 2: Hammer (Wood/dark shaft + metal cylindrical head)
    const hammerGroup = new THREE.Group();
    const hammerShaftGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.3, 16);
    const hammerShaft = new THREE.Mesh(hammerShaftGeo, darkMetalMat);
    hammerShaft.castShadow = true;
    hammerGroup.add(hammerShaft);

    const hammerHeadGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.38, 16);
    const hammerHead = new THREE.Mesh(hammerHeadGeo, chromeMat);
    hammerHead.rotation.z = Math.PI / 2;
    hammerHead.position.y = 0.6;
    hammerHead.castShadow = true;
    hammerGroup.add(hammerHead);

    hammerGroup.rotation.z = -Math.PI / 4;
    toolsGroup.add(hammerGroup);

    rootGroup.add(toolsGroup);

    // PART 5: Safety Helmet Dome & Visor (Hero Subject)
    const helmetGroup = new THREE.Group();
    helmetGroup.position.y = 0.58;

    // Dome (semi-sphere)
    const domeGeo = new THREE.SphereGeometry(0.48, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const domeMesh = new THREE.Mesh(domeGeo, helmetMat);
    domeMesh.castShadow = true;
    helmetGroup.add(domeMesh);

    // Visor Brim
    const brimGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.03, 32);
    const brimMesh = new THREE.Mesh(brimGeo, helmetMat);
    brimMesh.position.y = 0.01;
    brimMesh.castShadow = true;
    helmetGroup.add(brimMesh);

    // Hardhat Ridge / Rib
    const ridgeGeo = new THREE.BoxGeometry(0.1, 0.12, 0.85);
    const ridgeMesh = new THREE.Mesh(ridgeGeo, helmetMat);
    ridgeMesh.position.set(0, 0.44, 0);
    ridgeMesh.castShadow = true;
    helmetGroup.add(ridgeMesh);

    // Accent: Front Work Partner Star Crest / Medallion
    const crestGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    const crestMesh = new THREE.Mesh(crestGeo, rubyBadgeMat);
    crestMesh.rotation.x = Math.PI / 2;
    crestMesh.position.set(0, 0.24, 0.49);
    crestMesh.castShadow = true;
    helmetGroup.add(crestMesh);

    // Accent: Micro Star Node
    const starGeo = new THREE.OctahedronGeometry(0.06);
    const starMesh = new THREE.Mesh(starGeo, chromeMat);
    starMesh.position.set(0, 0.24, 0.52);
    helmetGroup.add(starMesh);

    rootGroup.add(helmetGroup);

    // Save refs for animation loop
    sceneRef.current = {
      renderer,
      scene,
      camera,
      rootGroup,
      helmetGroup,
      toolsGroup,
      gearMesh: gearHub,
      baseMesh,
      materials,
      reqId: 0
    };

    // 8. 60fps Render Loop with Exponential Damping & Zero GC
    let lastTime = performance.now();
    let currentYRotation = 0;
    let targetHelmetY = 0.58;
    let targetToolsY = 0.38;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (sceneRef.current) {
        const { rootGroup, helmetGroup, toolsGroup, gearMesh, renderer, scene, camera } = sceneRef.current;

        // Turntable smooth rotation
        if (isRotating) {
          currentYRotation += dt * 0.85;
          rootGroup.rotation.y = currentYRotation;
        }

        // Sub-element gear slow counter-rotation
        gearMesh.rotation.y -= dt * 0.4;

        // Exploded view damping
        targetHelmetY = isExploded ? 1.05 : 0.58;
        targetToolsY = isExploded ? 0.65 : 0.38;

        helmetGroup.position.y = THREE.MathUtils.damp(helmetGroup.position.y, targetHelmetY, 5, dt);
        toolsGroup.position.y = THREE.MathUtils.damp(toolsGroup.position.y, targetToolsY, 5, dt);

        // Gentle floating bob for realism
        const bob = Math.sin(time * 0.002) * 0.04;
        rootGroup.position.y = bob;

        renderer.render(scene, camera);
      }

      sceneRef.current!.reqId = requestAnimationFrame(animate);
    };

    sceneRef.current.reqId = requestAnimationFrame(animate);

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Clean Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.reqId);
        renderer.dispose();
        shadowGeo.dispose();
        shadowMat.dispose();
        baseGeo.dispose();
        ringGeo.dispose();
        gearHubGeo.dispose();
        toothGeo.dispose();
        wrenchShaftGeo.dispose();
        wrenchJawGeo.dispose();
        hammerShaftGeo.dispose();
        hammerHeadGeo.dispose();
        domeGeo.dispose();
        brimGeo.dispose();
        ridgeGeo.dispose();
        crestGeo.dispose();
        starGeo.dispose();
        materials.forEach(m => m.dispose());
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Update Material Finish Swatches dynamically
  useEffect(() => {
    if (!sceneRef.current) return;
    const { materials } = sceneRef.current;
    const goldMat = materials[0] as THREE.MeshStandardMaterial;
    const helmetMat = materials[3] as THREE.MeshStandardMaterial;

    if (materialTheme === 'gold') {
      goldMat.color.setHex(0xf59e0b);
      goldMat.metalness = 0.9;
      goldMat.roughness = 0.16;
      helmetMat.color.setHex(0xfbbf24);
    } else if (materialTheme === 'steel') {
      goldMat.color.setHex(0x94a3b8);
      goldMat.metalness = 0.95;
      goldMat.roughness = 0.14;
      helmetMat.color.setHex(0x38bdf8);
    } else {
      // Emerald / Work Partner Green
      goldMat.color.setHex(0x10b981);
      goldMat.metalness = 0.85;
      goldMat.roughness = 0.2;
      helmetMat.color.setHex(0x059669);
    }
  }, [materialTheme]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl ${compact ? 'h-[280px]' : 'h-[360px]'}`}>
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 text-amber-400 text-xs font-semibold border border-amber-500/30">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          Masud Digital Hub 3D Official Seal
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-medium border border-emerald-500/30">
          PBR Studio Realtime
        </span>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Following Three.js skill layout directives) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-sm flex flex-col items-center transition-transform duration-300">
        {/* Cinema / Zen Mode Toggle */}
        <button
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="mb-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/80 shadow-md cursor-pointer transition-colors"
          title="Toggle Controls"
        >
          {isControlsCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-amber-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {/* Floating Dock Surface */}
        {!isControlsCollapsed && (
          <div className="w-full p-2 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl flex items-center justify-between gap-1.5 text-xs text-white">
            {/* Finish swatches */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMaterialTheme('gold')}
                className={`w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border ${materialTheme === 'gold' ? 'border-white scale-110 shadow-sm' : 'border-slate-600'} transition-all`}
                title="Gold Seal"
              />
              <button
                onClick={() => setMaterialTheme('steel')}
                className={`w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-cyan-500 border ${materialTheme === 'steel' ? 'border-white scale-110 shadow-sm' : 'border-slate-600'} transition-all`}
                title="Industrial Steel"
              />
              <button
                onClick={() => setMaterialTheme('emerald')}
                className={`w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 border ${materialTheme === 'emerald' ? 'border-white scale-110 shadow-sm' : 'border-slate-600'} transition-all`}
                title="Work Partner Emerald"
              />
            </div>

            {/* Exploded / Inspection Mode */}
            <button
              onClick={() => setIsExploded(!isExploded)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                isExploded
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{isExploded ? 'Assembled' : 'Explode'}</span>
            </button>

            {/* Turntable Auto-rotate */}
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                isRotating
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>{isRotating ? 'Spinning' : 'Paused'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
