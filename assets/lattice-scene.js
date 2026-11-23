import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STRUCTURES, buildLattice, planeNormal, centerUnitCell } from './lattice-model.js';

// LATTICE / ATOMIC STRUCTURE OBSERVATORY
// Sites and nearest-neighbor shells derive from conventional crystal bases.
// Sinusoidal atom displacements are a visual harmonic plane-wave study, not an
// ab initio or measured phonon dispersion model.
const $=id=>document.getElementById(id);
const state={family:'diamond',cells:3,spacing:2.05,plane:'111',bonds:true,cell:true,planeVisible:true,halos:true,
  vibrate:true,amplitude:.10,speed:1,wave:.65,polarization:'long',waveDir:'111',stage:true,backdrop:true,
  guides:true,paused:false,time:0};
const DEFECT_COLORS={host:0x80ead9,dopant:0xffa879};
const scene=new THREE.Scene();scene.background=new THREE.Color('#060c15');
scene.fog=new THREE.FogExp2(0x060c15,.015);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
$('canvas-container').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.09,230);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=2.5;controls.maxDistance=55;
controls.minPolarAngle=.07;controls.maxPolarAngle=Math.PI-.07;controls.enablePan=true;
const ART={host:new THREE.Color(0x88e9db),alt:new THREE.Color(0x7daaf4),dopant:new THREE.Color(0xffab79)};
scene.add(new THREE.AmbientLight(0xc4daff,.78));
const key=new THREE.DirectionalLight(0xe9f8ff,3.1);key.position.set(-9,12,13);scene.add(key);
const topLight=new THREE.PointLight(0x71ecd4,60,31);topLight.position.set(6,10,-4);scene.add(topLight);
const rear=new THREE.PointLight(0x7375ff,51,35);rear.position.set(-10,2,-8);scene.add(rear);
const warm=new THREE.PointLight(0xffb886,19,25);warm.position.set(9,-4,9);scene.add(warm);
const crystalRoot=new THREE.Group();scene.add(crystalRoot);
const stageGroup=new THREE.Group();scene.add(stageGroup);
const backgroundGroup=new THREE.Group();scene.add(backgroundGroup);
const guideGroup=new THREE.Group();scene.add(guideGroup);

// Dark laboratory plinth, etched rings, and minimal stage architecture.
const stageMat=new THREE.MeshStandardMaterial({color:0x121e2a,metalness:.72,roughness:.39});
const platform=new THREE.Mesh(new THREE.CylinderGeometry(8.1,8.45,.32,72),stageMat);
platform.position.y=-5.7;stageGroup.add(platform);
const platter=new THREE.Mesh(new THREE.CylinderGeometry(6.9,7.05,.08,70),new THREE.MeshStandardMaterial({color:0x152637,metalness:.74,roughness:.42}));
platter.position.y=-5.50;stageGroup.add(platter);
for(const radius of [5.1,6.6,7.6]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.012,5,128),new THREE.MeshBasicMaterial({color:radius===7.6?0x5b728b:0x3a8c91,transparent:true,opacity:radius===7.6?.28:.42}));
  ring.rotation.x=-Math.PI/2;ring.position.y=-5.44;stageGroup.add(ring);
}
for(let a=0;a<72;a++){
 const phi=2*Math.PI*a/72,r1=a%6===0?7.48:7.6;
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(phi)*r1,-5.425,Math.sin(phi)*r1),new THREE.Vector3(Math.cos(phi)*7.79,-5.425,Math.sin(phi)*7.79)]),new THREE.LineBasicMaterial({color:0x7d98a9,transparent:true,opacity:.23}));stageGroup.add(line);
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(135,135),new THREE.MeshStandardMaterial({color:0x07121b,roughness:.95,metalness:.08}));
floor.rotation.x=-Math.PI/2;floor.position.y=-5.94;stageGroup.add(floor);
const grid=new THREE.GridHelper(80,44,0x1c4054,0x112737);grid.position.y=-5.91;grid.material.transparent=true;grid.material.opacity=.17;stageGroup.add(grid);
// Gentle depth cues: deterministic distant particles and two halo rings.
let seed=246813579;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const dustCount=650,dustPos=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){dustPos[3*i]=(random()-.5)*56;dustPos[3*i+1]=(random()-.5)*39;dustPos[3*i+2]=-8-random()*27;}
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0x8cded3,size:.036,transparent:true,opacity:.28,depthWrite:false}));backgroundGroup.add(dust);
for(const [r,y,z] of [[11,1,-10],[14,1.4,-17]]){
 const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:128},(_,i)=>{const t=2*Math.PI*i/128;return new THREE.Vector3(r*Math.cos(t),y+r*.22*Math.sin(t),z+r*.64*Math.sin(t));})),new THREE.LineBasicMaterial({color:0x376c80,transparent:true,opacity:.1}));backgroundGroup.add(ring);
}

const sphereGeo=new THREE.IcosahedronGeometry(.47,3);
const atomMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:.33,roughness:.23,clearcoat:.65,clearcoatRoughness:.14});
const bondGeometry=new THREE.CylinderGeometry(1,1,1,8);
const bondMaterial=new THREE.MeshStandardMaterial({color:0x81bfcc,metalness:.48,roughness:.37,transparent:true,opacity:.6});
const cellMat=new THREE.LineBasicMaterial({color:0xc2f2ec,transparent:true,opacity:.56});
const latticeEnvelopeMat=new THREE.LineBasicMaterial({color:0x557b93,transparent:true,opacity:.19});
let model,atomsMesh,bondsMesh,halos,cellBox,envelope,planeMesh,selectedRing,axisGroup;
let selectedId=null,currentView=0,transition=null,viewSignature='';
const defects=new Map();
const dummy=new THREE.Object3D(),axisY=new THREE.Vector3(0,1,0),aVec=new THREE.Vector3(),bVec=new THREE.Vector3(),deltaVec=new THREE.Vector3(),tmpQuat=new THREE.Quaternion();
let positions=[],indices=[];
function familyColor(atom){return atom.basis%2===0?ART.host:ART.alt;}
function removeRenderable(obj){if(!obj)return;obj.parent?.remove(obj);if(obj.geometry&&obj.geometry!==sphereGeo&&obj.geometry!==bondGeometry)obj.geometry.dispose();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats)if(m!==atomMaterial&&m!==bondMaterial&&m!==cellMat&&m!==latticeEnvelopeMat)m.dispose();}}
function cellWire(size,center,colorMaterial){const box=new THREE.BoxGeometry(size,size,size);const edges=new THREE.EdgesGeometry(box);box.dispose();const line=new THREE.LineSegments(edges,colorMaterial);line.position.set(...center);return line;}
function updatePlane(){
 if(planeMesh){planeMesh.parent?.remove(planeMesh);planeMesh.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});planeMesh=null;}
 const normal=new THREE.Vector3(...planeNormal(state.plane)).normalize();
 const size=model.n*model.spacing*1.16;
 const grid=new THREE.Group();
 const surface=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({color:0x52e7d0,transparent:true,opacity:.068,side:THREE.DoubleSide,depthWrite:false}));grid.add(surface);
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(size,size)),new THREE.LineBasicMaterial({color:0x74e9da,transparent:true,opacity:.40}));grid.add(edge);
 for(let j=-5;j<=5;j++){
  const p=j*size/12;
  for(const coords of [[[p,-size/2,0],[p,size/2,0]],[[-size/2,p,0],[size/2,p,0]]]){
   grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(coords.map(v=>new THREE.Vector3(...v))),new THREE.LineBasicMaterial({color:0x6db6b7,transparent:true,opacity:.105})));
  }
 }
 grid.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
 // Choose a specific member of the (hkl) family through an integer
 // reciprocal-lattice plane, rather than an arbitrary sheet at the origin.
 const hkl=planeNormal(state.plane),sum=hkl[0]+hkl[1]+hkl[2];
 const layer=Math.round(sum*model.shift);
 const displacement=(layer-sum*model.shift)*model.spacing/Math.hypot(...hkl);
 grid.position.copy(normal).multiplyScalar(displacement);grid.visible=state.planeVisible;
 planeMesh=grid;guideGroup.add(grid);
}
function makeSelectionRing(){removeRenderable(selectedRing);const haloRing=new THREE.Mesh(new THREE.TorusGeometry(.65,.02,8,72),new THREE.MeshBasicMaterial({color:0xf9db9d,transparent:true,opacity:.89,depthTest:true}));selectedRing=haloRing;scene.add(haloRing);}
function build(){
 for(const o of [atomsMesh,bondsMesh,halos,cellBox,envelope])removeRenderable(o);
 while(guideGroup.children.length){const obj=guideGroup.children[0];guideGroup.remove(obj);obj.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material&&n.material!==cellMat&&n.material!==latticeEnvelopeMat)n.material.dispose()});}
 model=buildLattice(state.family,state.cells,state.spacing);
 // Keep the plinth below even the largest, most widely spaced supercell.
 const bottom=Math.min(...model.atoms.map(a=>a.p[1]));
 stageGroup.position.y=Math.min(0,bottom+4.2);
 positions=model.atoms.map(a=>new THREE.Vector3(...a.p));
 atomsMesh=new THREE.InstancedMesh(sphereGeo,atomMaterial,model.atoms.length);atomsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);atomsMesh.frustumCulled=false;
 for(let i=0;i<model.atoms.length;i++)atomsMesh.setColorAt(i,familyColor(model.atoms[i]));
 crystalRoot.add(atomsMesh);
 bondsMesh=new THREE.InstancedMesh(bondGeometry,bondMaterial,model.bonds.length);bondsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);bondsMesh.frustumCulled=false;crystalRoot.add(bondsMesh);
 const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(model.atoms.length*3),3));
 halos=new THREE.Points(hg,new THREE.PointsMaterial({color:0x68d9d0,size:.47,transparent:true,opacity:.20,depthWrite:false,blending:THREE.AdditiveBlending}));halos.frustumCulled=false;crystalRoot.add(halos);
 const c=centerUnitCell(model);cellBox=cellWire(model.spacing,c,cellMat);guideGroup.add(cellBox);
 const envelopeSize=model.n*model.spacing;const center=[.25*model.spacing-model.spacing*.25,.25*model.spacing-model.spacing*.25,.25*model.spacing-model.spacing*.25];
 envelope=cellWire(envelopeSize,center,latticeEnvelopeMat);guideGroup.add(envelope);
 updatePlane();makeSelectionRing();
 if(selectedId===null||selectedId>=model.atoms.length){let best=Infinity;selectedId=0;model.atoms.forEach((atom,i)=>{const d=atom.p.reduce((acc,v)=>acc+v*v,0);if(d<best){best=d;selectedId=i;}});}
 if(defects.size){for(const i of [...defects.keys()])if(i>=model.atoms.length)defects.delete(i);}
 updateModelInfo();updatePositions(true);
}
function activeBonds(){return model.bonds.reduce((sum,b)=>sum+(!defects.has(b.a)||defects.get(b.a)!=='vacancy')*(!defects.has(b.b)||defects.get(b.b)!=='vacancy'),0)}
function defectCounts(){let v=0,d=0;for(const kind of defects.values()){if(kind==='vacancy')v++;else if(kind==='dopant')d++;}return {v,d};}
function updateModelInfo(){const s=model.definition,d=defectCounts(),active=model.atoms.length-d.v;
 $('statusBadge').textContent=`${s.short} · LIVE`;
 $('hudStructure').textContent=s.name;$('hudCoordination').textContent=String(s.coordination);
 $('hudPacking').textContent=(100*s.packing).toFixed(1)+'%';$('packingFill').style.width=(100*s.packing).toFixed(1)+'%';
 $('hudDistance').textContent=s.distance.toFixed(3)+' a';
 $('hudCounts').textContent=`${active} / ${activeBonds()}`;
 $('hudDefects').textContent=d.v+d.d?`${d.v} vacancy · ${d.d} dopant`:'None';
 $('familyDescription').textContent=s.description;
 $('statStructure').textContent=s.short+' / '+s.coordination;$('statSupercell').textContent=model.n+'³ cells';
 $('statAtoms').textContent=model.atoms.length+' / '+active;$('statBonds').textContent=String(activeBonds());
 $('statPacking').textContent=(s.packing*100).toFixed(1)+'%';
 $('structureNotes').textContent=`${s.material}. ${s.description} Ideal packing: ${(100*s.packing).toFixed(1)}%. Edge sites have fewer neighbors in a finite specimen.`;
 $('vPlane').textContent='('+state.plane.split('').join(' ')+')';
 $('vCells').textContent=`${model.n} × ${model.n} × ${model.n}`;
 $('vSpacing').textContent=state.spacing.toFixed(2)+' units';
 $('vAmplitude').textContent=state.amplitude.toFixed(2)+' a';
 $('vSpeed').textContent=state.speed.toFixed(2)+'×';
 $('vWave').textContent=state.wave.toFixed(2)+' π/a';
 for(const b of document.querySelectorAll('[data-family]'))b.classList.toggle('active',b.dataset.family===state.family);
 updateSiteInfo();
}
function updateSiteInfo(){const a=model.atoms[selectedId],type=defects.get(selectedId)||'host';if(!a)return;
 $('siteTitle').textContent=`Site ${String(selectedId+1).padStart(3,'0')} / ${type==='host'?'Host atom':type==='vacancy'?'Vacancy':'Substitution'}`;
 $('siteLocation').textContent='Fractional (a): '+a.frac.map(n=>Number(n).toFixed(2)).join(', ')+'  ·  Cell '+a.cell.join(', ');
 const remaining=model.nearby[selectedId].filter(i=>defects.get(i)!=='vacancy').length;
 $('siteNeighbors').textContent=`Local bonds: ${type==='vacancy'?0:remaining}  ·  Bulk: ${model.definition.coordination}  ·  Basis ${a.basis+1}`;
 $('btnVacancy').textContent=type==='vacancy'?'Restore this site':'Create vacancy';
 $('btnDopant').textContent=type==='dopant'?'Restore host atom':'Substitute atom';
}
function vibration(i,sec){const p=model.atoms[i].p;if(!state.vibrate||state.amplitude===0)return new THREE.Vector3(...p);
 const direction=new THREE.Vector3(...planeNormal(state.waveDir)).normalize();
 const polarization=state.polarization==='long'?direction.clone():new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,0,1)).normalize();
 if(polarization.lengthSq()<.01)polarization.set(0,1,0);
 const q=Math.PI*state.wave/state.spacing;
 // Harmonic prescribed plane wave u = A e sin(q·r - ωt), with ω chosen to give a natural motion scale.
 const phase=q*direction.dot(new THREE.Vector3(...p))-2*Math.PI*.68*sec;
 return new THREE.Vector3(...p).addScaledVector(polarization,state.spacing*state.amplitude*Math.sin(phase));
}
let tick=0;
function updatePositions(force=false){if(!model)return;
 tick++;const waveTick=!state.vibrate||state.amplitude<.001||state.paused||tick%2===0;
 if(!force&&!waveTick)return;
 const tint=new THREE.Color();
 model.atoms.forEach((atom,i)=>{
  const pos=vibration(i,state.time);positions[i].copy(pos);dummy.position.copy(pos);dummy.rotation.set(0,0,0);
  const vacant=defects.get(i)==='vacancy';const radius=vacant?0:state.spacing*(state.family==='diamond'?.134:.156);
  dummy.scale.setScalar(radius/.47);dummy.updateMatrix();atomsMesh.setMatrixAt(i,dummy.matrix);
  tint.copy(defects.get(i)==='dopant'?ART.dopant:familyColor(atom));atomsMesh.setColorAt(i,tint);
 });
 atomsMesh.instanceMatrix.needsUpdate=true;if(atomsMesh.instanceColor)atomsMesh.instanceColor.needsUpdate=true;
 model.bonds.forEach((pair,i)=>{
  const vacant=defects.get(pair.a)==='vacancy'||defects.get(pair.b)==='vacancy';
  aVec.copy(positions[pair.a]);bVec.copy(positions[pair.b]);deltaVec.subVectors(bVec,aVec);
  dummy.position.copy(aVec).add(bVec).multiplyScalar(.5);
  dummy.quaternion.setFromUnitVectors(axisY,deltaVec.clone().normalize());
  dummy.scale.set(vacant?0:.034, vacant?0:deltaVec.length(),vacant?0:.034);dummy.updateMatrix();bondsMesh.setMatrixAt(i,dummy.matrix);
 });
 bondsMesh.instanceMatrix.needsUpdate=true;bondsMesh.visible=state.bonds;
 const attr=halos.geometry.attributes.position;
 for(let i=0;i<positions.length;i++){const p=positions[i];attr.setXYZ(i,p.x,p.y,p.z);}attr.needsUpdate=true;
 halos.visible=state.halos;
 if(selectedRing){const p=positions[selectedId];selectedRing.position.copy(p);selectedRing.visible=defects.get(selectedId)!=='vacancy';selectedRing.scale.setScalar(1+.08*Math.sin(state.time*2));selectedRing.lookAt(camera.position);}
}
function setSite(kind){if(selectedId===null)return;const old=defects.get(selectedId);if(old===kind)defects.delete(selectedId);else defects.set(selectedId,kind);updatePositions(true);updateModelInfo();}
const CAMERA_MODES=[
 {name:'Crystal Array',title:'Order in three dimensions.',description:'Explore the repeating atomic arrangement and nearest-neighbor network.'},
 {name:'Unit Cell',title:'One cell, infinite repetition.',description:'A close study of the cubic conventional cell and its basis atoms.'},
 {name:'Atomic Planes',title:'Geometry inside matter.',description:'Study a representative member of the selected (hkl) family of lattice planes.'},
 {name:'Defect Focus',title:'When order is interrupted.',description:'Inspect a vacancy or substitution and the bonds around its local site.'}
];
function cameraPose(index){const e=model.n*model.spacing, factor=e/7;
 if(index===0)return {pos:[e*1.15,e*.90,e*1.30],target:[0,0,0]};
 if(index===1){const c=centerUnitCell(model),a=model.spacing;return {pos:[c[0]-a*2.6,c[1]+a*1.45,c[2]+a*1.95],target:c};}
 if(index===2)return {pos:[e*.20,e*1.90,-e*.25],target:[0,0,0]};
 const p=model.atoms[selectedId]?.p||[0,0,0],a=model.spacing;return {pos:[p[0]+a*2.1,p[1]+a*.9,p[2]-a*2.7],target:p};
}
function selectPreset(index,instant=false){currentView=index;
 document.querySelectorAll('.dock-btn').forEach((b,i)=>b.classList.toggle('active',index===i));
 $('sceneViewTitle').textContent=CAMERA_MODES[index].title;
 $('sceneViewDescription').textContent=CAMERA_MODES[index].description;
 $('sceneViewIndex').textContent=String(index+1).padStart(2,'0')+' / 04';
 const target=cameraPose(index);
 const toPos=new THREE.Vector3(...target.pos),toTarget=new THREE.Vector3(...target.target);
 if(instant){camera.position.copy(toPos);controls.target.copy(toTarget);controls.update();transition=null;}
 else transition={start:camera.position.clone(),target:controls.target.clone(),end:toPos,endTarget:toTarget,t:0};
}
controls.addEventListener('start',()=>transition=null);
// Center the main scene in the area not occupied by the inspector.
let lastOffset='';function fitStage(){
 const inspector=$('inspectorDrawer'),reserved=innerWidth>1030&&!inspector.classList.contains('collapsed')?Math.min(190,innerWidth*.115):0;
 const signature=innerWidth+','+innerHeight+','+reserved;if(signature===lastOffset)return;lastOffset=signature;
 if(reserved)camera.setViewOffset(innerWidth,innerHeight,reserved,0,innerWidth,innerHeight);else camera.clearViewOffset();camera.updateProjectionMatrix();
}
function refreshLayers(){guideGroup.visible=state.guides;cellBox.visible=state.cell;envelope.visible=state.guides;planeMesh.visible=state.planeVisible;
 bondsMesh.visible=state.bonds;halos.visible=state.halos;stageGroup.visible=state.stage;backgroundGroup.visible=state.backdrop;}
for(const b of document.querySelectorAll('[data-family]'))b.addEventListener('click',()=>{state.family=b.dataset.family;defects.clear();selectedId=null;build();selectPreset(currentView,true);refreshLayers();});
function slider(id,key,formatter,rebuildModel=false){const element=$(id);element.addEventListener('input',()=>{
 state[key]=Number(element.value);if(rebuildModel){defects.clear();selectedId=null;build();selectPreset(currentView,true);refreshLayers();}
 else{updateModelInfo();updatePositions(true);}
 });}
slider('sCells','cells',null,true);slider('sSpacing','spacing',null,true);
slider('sAmplitude','amplitude');slider('sSpeed','speed');slider('sWave','wave');
$('sPlane').addEventListener('change',()=>{state.plane=$('sPlane').value;updatePlane();updateModelInfo();refreshLayers();if(currentView===2)selectPreset(2);});
$('sPolarization').addEventListener('change',()=>{state.polarization=$('sPolarization').value;updatePositions(true);});
$('sWaveDirection').addEventListener('change',()=>{state.waveDir=$('sWaveDirection').value;updatePositions(true);});
for(const [id,key] of [['tBonds','bonds'],['tCell','cell'],['tPlane','planeVisible'],['tHalo','halos'],['tVibrate','vibrate'],['tStage','stage'],['tBackdrop','backdrop']]){
 $(id).addEventListener('change',()=>{state[key]=$(id).checked;refreshLayers();updatePositions(true);});
}
$('btnVacancy').addEventListener('click',()=>setSite('vacancy'));
$('btnDopant').addEventListener('click',()=>setSite('dopant'));
$('btnClearDefects').addEventListener('click',()=>{defects.clear();updatePositions(true);updateModelInfo();});
$('btnGuides').addEventListener('click',()=>{state.guides=!state.guides;$('btnGuides').classList.toggle('active',state.guides);refreshLayers();});
$('btnPause').addEventListener('click',()=>{state.paused=!state.paused;$('btnPause').classList.toggle('active',state.paused);});
$('btnDrawer').addEventListener('click',()=>{$('inspectorDrawer').classList.toggle('collapsed');lastOffset='';});
$('btnCapture').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='lattice-observatory.png';a.href=renderer.domElement.toDataURL('image/png');a.click();});
$('btnFullscreen').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();});
function reset(){Object.assign(state,{family:'diamond',cells:3,spacing:2.05,plane:'111',bonds:true,cell:true,planeVisible:true,halos:true,vibrate:true,amplitude:.10,speed:1,wave:.65,polarization:'long',waveDir:'111',stage:true,backdrop:true,guides:true,paused:false,time:0});
 defects.clear();selectedId=null;
 for(const [id,v] of Object.entries({sCells:3,sSpacing:2.05,sAmplitude:.10,sSpeed:1,sWave:.65,sPlane:'111',sPolarization:'long',sWaveDirection:'111'}))$(id).value=String(v);
 for(const [id,v] of Object.entries({tBonds:true,tCell:true,tPlane:true,tHalo:true,tVibrate:true,tStage:true,tBackdrop:true}))$(id).checked=v;
 $('btnGuides').classList.add('active');$('btnPause').classList.remove('active');build();selectPreset(0);refreshLayers();}
$('btnReset').addEventListener('click',reset);
for(const [i,b] of [...document.querySelectorAll('.dock-btn')].entries())b.addEventListener('click',()=>selectPreset(i));
for(const b of document.querySelectorAll('.tab-btn'))b.addEventListener('click',()=>{
 document.querySelectorAll('.tab-btn').forEach(t=>t.classList.toggle('active',t===b));
 document.querySelectorAll('.tab-content').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab));
});
// Raycasting for intuitive inspection, without interfering with dragging.
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let press=null;
renderer.domElement.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!press||Math.hypot(e.clientX-press.x,e.clientY-press.y)>5){press=null;return;}press=null;
 const bounds=renderer.domElement.getBoundingClientRect();
 mouse.set((e.clientX-bounds.left)/bounds.width*2-1,-((e.clientY-bounds.top)/bounds.height)*2+1);
 raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObject(atomsMesh,false)[0];
 if(hit&&hit.instanceId!==undefined&&defects.get(hit.instanceId)!=='vacancy'){
  selectedId=hit.instanceId;updateSiteInfo();updatePositions(true);if(currentView===3)selectPreset(3);
 }
});
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
 if(e.code==='Space'){e.preventDefault();$('btnPause').click();}
 else if(e.code==='KeyG')$('btnGuides').click();else if(e.code==='KeyV')setSite('vacancy');else if(e.code==='KeyD')setSite('dopant');
 else if(e.code==='KeyR')$('btnReset').click();else if(e.code==='KeyH')$('btnDrawer').click();
 else if(e.code==='KeyP')$('btnCapture').click();else if(e.code==='KeyF')$('btnFullscreen').click();
 else if(e.key>='1'&&e.key<='4')selectPreset(Number(e.key)-1);
});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));lastOffset='';});

build();refreshLayers();selectPreset(0,true);
let previous=performance.now(),counter=0,frameCount=0,acc=0;
function animate(now){requestAnimationFrame(animate);
 const delta=Math.min(.055,Math.max(0,(now-previous)/1000));previous=now;
 if(transition){transition.t=Math.min(1,transition.t+delta*1.55);const t=transition.t*transition.t*(3-2*transition.t);
  camera.position.lerpVectors(transition.start,transition.end,t);controls.target.lerpVectors(transition.target,transition.endTarget,t);if(transition.t>=1)transition=null;}
 if(!state.paused){state.time+=delta*state.speed;if(state.vibrate)updatePositions();}
 if(selectedRing){selectedRing.lookAt(camera.position);}
 dust.rotation.y+=delta*.0025;
 fitStage();controls.update();renderer.render(scene,camera);
 counter+=delta;frameCount++;if(counter>.70){$('statFps').textContent=Math.round(frameCount/counter)+' FPS';counter=0;frameCount=0;}
}
requestAnimationFrame(animate);
