import assert from 'node:assert/strict';
import {STRUCTURES,buildLattice,planeNormal,centerUnitCell} from '../assets/lattice-model.js';
const expected={sc:{basis:1,coord:6},bcc:{basis:2,coord:8},fcc:{basis:4,coord:12},diamond:{basis:8,coord:4}};
for(const [family,{basis,coord}] of Object.entries(expected)){
 for(const n of [2,3,4,5]){
  const model=buildLattice(family,n,2.05);
  assert.equal(model.atoms.length,basis*n**3);
  assert.equal(new Set(model.atoms.map(atom=>atom.frac.join('|'))).size,model.atoms.length);
  assert.equal(model.nearby.length,model.atoms.length);
  for(let i=0;i<model.atoms.length;i++){
    assert.ok(model.nearby[i].length<=coord);
    for(const j of model.nearby[i])assert.ok(model.nearby[j].includes(i));
  }
  for(const {a,b} of model.bonds){
   assert.ok(a<b);const p=model.atoms[a].p,q=model.atoms[b].p;
   const dist=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
   assert.ok(Math.abs(dist-model.nearestDistance)<1e-9);
  }
  if(n>=4)assert.equal(Math.max(...model.nearby.map(x=>x.length)),coord);
  assert.equal(centerUnitCell(model).length,3);
 }
}
assert.deepEqual(planeNormal('100'),[1,0,0]);
assert.deepEqual(planeNormal('110'),[1,1,0]);
assert.deepEqual(planeNormal('111'),[1,1,1]);
console.log('PASS: 16 lattice geometries, periodic motif counts, nearest-neighbor bonds and Miller normals');
