// LATTICE — conventional cubic cell definitions, basis sites and nearest neighbors.
// Conventional cubic unit cells and coordination statistics are exact for each ideal infinite lattice.
export const STRUCTURES = Object.freeze({
  sc: {name:'Simple cubic', short:'SC', basis:[[0,0,0]], coordination:6, packing:Math.PI/6, distance:1, description:'One lattice point per conventional cube. Each interior atom has six nearest neighbors along the Cartesian axes.', material:'Illustrative simple-cubic structure'},
  bcc:{name:'Body-centered cubic', short:'BCC', basis:[[0,0,0],[.5,.5,.5]], coordination:8, packing:Math.sqrt(3)*Math.PI/8, distance:Math.sqrt(3)/2,description:'Corner sites plus a body-center site. Each bulk atom has eight nearest neighbors.', material:'Iron (α-Fe), chromium, tungsten'},
  fcc:{name:'Face-centered cubic', short:'FCC', basis:[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]],coordination:12,packing:Math.PI/(3*Math.sqrt(2)),distance:1/Math.sqrt(2),description:'Corner and face-centered sites. Close-packed bulk atoms have twelve nearest neighbors.',material:'Copper, aluminum, gold'},
  diamond:{name:'Diamond cubic',short:'DIA',basis:[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0],[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]],coordination:4,packing:Math.PI*Math.sqrt(3)/16,distance:Math.sqrt(3)/4,description:'Two interpenetrating FCC sublattices shifted by one quarter of a body diagonal. Tetrahedral bonds connect four neighbors.',material:'Carbon (diamond), silicon, germanium'}
});
export function buildLattice(kind='diamond', count=3, spacing=2.05){
  const s=STRUCTURES[kind];if(!s)throw new Error('Unknown crystal structure');
  const n=Math.max(2,Math.min(5,Math.round(count)));
  const shift=(n-1)/2+0.25;
  const atoms=[];
  for(let ix=0;ix<n;ix++)for(let iy=0;iy<n;iy++)for(let iz=0;iz<n;iz++){
    for(let b=0;b<s.basis.length;b++){
      const q=s.basis[b], frac=[ix+q[0],iy+q[1],iz+q[2]];
      atoms.push({id:atoms.length, frac,cell:[ix,iy,iz],basis:b,
        p:frac.map(v=>(v-shift)*spacing)});
    }
  }
  const target=spacing*s.distance, eps=target*.025;
  const bonds=[];const nearby=Array.from({length:atoms.length},()=>[]);
  // Restrict to the physically nearest shells. Finite boundary sites have fewer neighbors.
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const a=atoms[i].p,b=atoms[j].p;const dist=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    if(Math.abs(dist-target)>eps)continue;
    bonds.push({a:i,b:j});nearby[i].push(j);nearby[j].push(i);
  }
  return {atoms,bonds,nearby,n,spacing,kind,definition:s,nearestDistance:target,shift};
}
export function millerCoordinates(normal, point){return normal[0]*point[0]+normal[1]*point[1]+normal[2]*point[2];}
export function planeNormal(miller){const map={'100':[1,0,0],'110':[1,1,0],'111':[1,1,1]};return map[miller]||map['111'];}
export function centerUnitCell(model){const i=Math.floor((model.n-1)/2);return [0,1,2].map(()=>((i+.5)-model.shift)*model.spacing);}
