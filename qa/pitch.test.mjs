import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,markPeak} from '../src/engine.js';
import {beginRest} from '../src/life-core.js';
import {pitchesFor,takePitch,pitchDone,pitchResult,bandFor,PITCHES} from '../src/rest-pitch.js';
const seed=cash=>{const s=newRun();s.cash=cash;s.life.energy=0;markPeak(s);beginRest(s);s.life.rest.paid=true;s.life.currentWorth=cash;return s;};
test('no pitches before the bill is paid',()=>{const s=seed(500000);s.life.rest.paid=false;assert.equal(pitchesFor(s).length,0);});
test('pitch slate is deterministic across reloads',()=>{const s=seed(500000);const a=pitchesFor(s).map(p=>p.id),b=pitchesFor(s).map(p=>p.id);assert.deepEqual(a,b);assert.ok(a.length>=2);});
test('wealth bands unlock bigger pitches',()=>{assert.equal(bandFor(1000),0);assert.equal(bandFor(2000000),1);assert.equal(bandFor(20000000),2);assert.equal(bandFor(2000000000),3);});
test('every pitch has complete, sane terms',()=>{for(const p of PITCHES){assert.ok(p.title&&p.who&&p.type&&p.glyph,p.id);assert.ok(p.p>0&&p.p<100,p.id);assert.ok(p.up>1,p.id);assert.ok(p.cost>0&&p.cost<1,p.id);}});
test('a pitch settles once and cannot be rerolled',()=>{
 const s=seed(500000);const id=pitchesFor(s)[0].id;const before=s.cash;
 const r=takePitch(s,id);
 assert.equal(pitchDone(s,id),true);
 assert.equal(pitchResult(s,id).won,r.won);
 assert.equal(s.cash,before-r.cost+r.gain);
 assert.throws(()=>takePitch(s,id),/已经谈过/);
});
test('outcome is stable for the same run and rest',()=>{
 const a=seed(500000),b=seed(500000);b.id=a.id;
 const id=pitchesFor(a)[0].id;
 assert.equal(takePitch(a,id).won,takePitch(b,id).won);
});
test('cannot spend the last dollar on a pitch',()=>{
 // The floor stake is $1.00, so a player holding exactly $1.00 must be refused.
 const s=seed(100);const p=pitchesFor(s)[0];
 assert.equal(p.cost,100);
 assert.throws(()=>takePitch(s,p.id),/现金不足/);
});
