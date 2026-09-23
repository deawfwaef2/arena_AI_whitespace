import {World} from '../src/world.js';
import {newRun} from '../src/engine.js';
const world=new World(document.getElementById('world'));
const run=newRun();world.setEnvironment('taipei');world.setOffer(run.offer);world.setTitle(false);world.motion=true;world.paused=false;
window.qa={world,run};
