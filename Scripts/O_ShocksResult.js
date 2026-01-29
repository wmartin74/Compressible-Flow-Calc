
results = JSON.parse(localStorage.getItem("ShockAnalysis"));
console.log("Results Loaded");
console.log(results);

const thetaNum = results['Theta'];
const Minput = results['Mach1'];
const gammaInput = 1.4;
const streamCountInput = document.getElementById('streamCount');
const showControl = document.getElementById('showControl');
const drawBtn = document.getElementById('drawBtn');
const branchWeak = document.getElementById('branchWeak');
const branchStrong = document.getElementById('branchStrong');
const svg = document.getElementById('svg');
const gridG = svg.getElementById('grid');
const streamG = svg.getElementById('streamlines');
const shockG = svg.getElementById('shock');
const labelsG = svg.getElementById('labels');
const debugG = svg.getElementById('debug');
const solStrong = results['StrongShock'];
const solWeak = results['WeakShock']; 

let element = [
  'Mach1',
  'Mach2',
  'Temp1',
  'Temp2',
  'T01',
  'T02',
  'Press1',
  'Press2',
  'P01',
  'P02',
  'Rho1',
  'Rho2',
  'Theta',
  'Beta'
];



for (let i = 0; i < element.length; i++) {
  let key = document.getElementById(element[i]);
  if (results[element[i]] != null && typeof results[element[i]] == 'number') {
    console.log('key', key);
    console.log(results[element[i]]);
    key.innerHTML = results[element[i]].toFixed(4);
  } else if (results[element[i]] != null && typeof results[element[i]] != 'number') {
    key.innerHTML = results[element[i]];
  } else {
    key.innerHTML = "N/A";
  }
}



function deg2rad(d){ return d * Math.PI / 180; }
function rad2deg(r){ return r * 180 / Math.PI; }

function bindRangeNumber(rangeEl, numEl){ rangeEl.addEventListener('input', ()=>{ numEl.value = rangeEl.value; drawDiagram(); }); numEl.addEventListener('input', ()=>{ rangeEl.value = numEl.value; drawDiagram(); }); }
bindRangeNumber(streamSlide, streamCount);


/* helpers */
function clearGroups(){ [gridG, streamG, shockG, labelsG, debugG].forEach(g => { while(g.firstChild) g.removeChild(g.firstChild); }); }
function drawGrid(){
  const width = 1000, step = 40;
  for(let x=0;x<=width;x+=step){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x); line.setAttribute('y1', -280);
    line.setAttribute('x2', x); line.setAttribute('y2', 280);
    gridG.appendChild(line);
  }
  for(let y=-280;y<=280;y+=step){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', 0); line.setAttribute('y1', y);
    line.setAttribute('x2', width); line.setAttribute('y2', y);
    gridG.appendChild(line);
  }
}

/* main draw */
function drawDiagram(){
  clearGroups();
  drawGrid();
  if (branchStrong.checked) {
    for (const key in solStrong) {
      if (!Object.prototype.hasOwnProperty.call(results, key)) continue;
      if (Object.prototype.hasOwnProperty.call(results, key)) {
        results[key] = solStrong[key];
        console.log('Changes results.',key,'=', solStrong[key]);
      } else {
        console.log('No Match for: ',key);
      }
    }
  } else if (branchWeak.checked) {
    for (const key in solWeak) {
      if (!Object.prototype.hasOwnProperty.call(results, key)) continue;
      if (Object.prototype.hasOwnProperty.call(results, key)) {
        results[key] = solWeak[key];
        console.log('Changes results.',key,'=', solWeak[key]);
      } else {
        console.log('No Match for: ', key);
      }
    }
  }
  for (let i = 0; i < element.length; i++) {
    let key = document.getElementById(element[i]);
    if (results[element[i]] != null && typeof results[element[i]] == 'number') {
      console.log('key', key);
      console.log(results[element[i]]);
      key.innerHTML = results[element[i]].toFixed(4);
    } else if (results[element[i]] != null && typeof results[element[i]] != 'number') {
      key.innerHTML = results[element[i]];
    } else {
      key.innerHTML = "N/A";
    }
  }
  //console.log(results);
  const betaDeg = results['Beta'];
  const beta = deg2rad(results['Beta']);
  const thetaDeg = parseFloat(thetaNum.value) || 10;
  const M = parseFloat(Minput.value) || 2.5;
  const gamma = parseFloat(gammaInput.value) || 1.4;
  const streamCount = Math.max(3, Math.min(21, parseInt(streamCountInput.value,10) || 9));
  const theta = deg2rad(thetaDeg);



  // geometry
  const originX = 220, originY = 0;
  const shockLen = 900;
  const shockAngle = -beta;
  const tx = Math.cos(shockAngle), ty = Math.sin(shockAngle);
  const shockX2 = originX + shockLen * tx;
  const shockY2 = originY + shockLen * ty;

  // draw shock
  const shockLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  shockLine.setAttribute('x1', originX); shockLine.setAttribute('y1', originY);
  shockLine.setAttribute('x2', shockX2); shockLine.setAttribute('y2', shockY2);
  shockLine.setAttribute('stroke', '#d9534f'); shockLine.setAttribute('stroke-width', 3);
  shockLine.setAttribute('stroke-linecap','round');
  shockG.appendChild(shockLine);

  // compute lowest (max) y of shock segment in group coords (positive down)
  const shockMinY = Math.min(originY, shockY2);
  const shockMaxY = Math.max(originY, shockY2);

  // streamlines: spawn only if upstream y is above or equal to shockMaxY (i.e., not below lowest point)
  const spacing = 20;
  const startX = -40;
  const downstreamLen = 420;

  for (let i = 0; i <= streamCount; i++) {
    const y = (i - streamCount) * spacing;
    // skip any streamline whose upstream y is below the lowest point of the shock
    if (y > shockMaxY) continue;

    const upstreamX = Math.max(startX, -200);

    // compute intersection param t along shock: (originX,originY) + t*(tx,ty)
    let tIntersect;
    if (Math.abs(ty) < 1e-9) {
      // nearly horizontal shock: set intersection near origin
      tIntersect = 20;
    } else {
      tIntersect = (y - originY) / ty;
    }
    // clamp t to [0, shockLen] so intersection lies on drawn shock segment
    tIntersect = Math.max(0, Math.min(shockLen, tIntersect));
    const xIntersect = originX + tIntersect * tx;
    const yIntersect = originY + tIntersect * ty;

    // ensure intersection is to the right of upstream start
    const minIntersectX = upstreamX + 6;
    if (xIntersect <= minIntersectX) {
      // draw a short upstream segment and skip downstream
      const stopX = upstreamX + 6;
      const pathUp = `M ${upstreamX} ${y} L ${stopX} ${y}`;
      appendStreamPath(pathUp);
      if (showControl.checked) drawDebugPoint(xIntersect, yIntersect);
      continue;
    }

    // upstream segment (ends at shock intersection)
    const pathUp = `M ${upstreamX} ${y} L ${xIntersect} ${y}`;
    appendStreamPath(pathUp);

    // downstream: deflect by -theta and draw only if downstream start is not below shockMaxY
    const downstreamDir = -theta; // rotate rightward by -theta
    let dirX = Math.cos(downstreamDir), dirY = Math.sin(downstreamDir);
    const mag = Math.hypot(dirX, dirY) || 1; dirX /= mag; dirY /= mag;

    // if the immediate downstream point would be below the shock's lowest point, skip downstream
    const smallStep = 6;
    const testY = yIntersect + dirY * smallStep;
    if (testY > shockMaxY) {
      // skip downstream drawing to avoid lines below shock
      if (showControl.checked) drawDebugPoint(xIntersect, yIntersect);
      continue;
    }

    // place both control points ahead of intersection along downstream direction (prevents folding)
    const segLen = Math.max(1, Math.hypot(xIntersect - upstreamX, yIntersect - y));
    const ctrlForward = Math.min(80, Math.max(12, segLen * 0.25));
    const ctrlForward2 = Math.min(140, ctrlForward * 2.0);
    const c1x = xIntersect + ctrlForward * dirX;
    const c1y = yIntersect + ctrlForward * dirY;
    const c2x = xIntersect + ctrlForward2 * dirX;
    const c2y = yIntersect + ctrlForward2 * dirY;

    const xDown2 = xIntersect + downstreamLen * dirX;
    const yDown2 = yIntersect + downstreamLen * dirY;

    // ensure downstream path does not start below shockMaxY; if it does, shorten downstreamLen
    let finalXDown = xDown2, finalYDown = yDown2;
    if (yIntersect > shockMaxY) {
      // already below shock (shouldn't happen due to spawn check), skip
    } else if (finalYDown > shockMaxY) {
      // compute t to reach shockMaxY along downstream direction and clamp
      const dy = shockMaxY - yIntersect;
      const t = dy / dirY;
      finalXDown = xIntersect + t * dirX;
      finalYDown = shockMaxY;
    }

    // cubic path that crosses the shock and continues downstream (but not below shockMaxY)
    const pathFull = `M ${upstreamX} ${y} L ${xIntersect} ${y} C ${c1x} ${c1y} ${c2x} ${c2y} ${finalXDown} ${finalYDown}`;
    appendStreamPath(pathFull, true);

    if (showControl.checked) {
      drawDebugPoint(xIntersect, yIntersect);
      drawDebugPoint(c1x, c1y, '#0b74de');
      drawDebugPoint(c2x, c2y, '#0b74de');
      drawDebugArrow(xIntersect, yIntersect, dirX, dirY);
    }
  }

  // annotations
  const ann = labelsG;
  const arcR = 60;
  const arcStartX = originX + arcR * Math.cos(0);
  const arcStartY = originY + arcR * Math.sin(0);
  const arcEndX = originX + arcR * Math.cos(shockAngle);
  const arcEndY = originY + arcR * Math.sin(shockAngle);
  const arcPath = `M ${arcStartX} ${arcStartY} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`;
  const arc = document.createElementNS('http://www.w3.org/2000/svg','path');
  arc.setAttribute('d', arcPath); arc.setAttribute('stroke','#333'); arc.setAttribute('stroke-width',1.2); arc.setAttribute('fill','none');
  ann.appendChild(arc);
  const betaLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  betaLabel.setAttribute('x', 225);
  betaLabel.setAttribute('y', 20);
  betaLabel.setAttribute('class','muted'); betaLabel.textContent = `β ${betaDeg.toFixed(3)}°`;
  ann.appendChild(betaLabel);

  const thetaArcR = 200;
  const thetaArcStartX = originX + thetaArcR * Math.cos(0);
  const thetaArcStartY = originY + thetaArcR * Math.sin(0);
  const thetaArcEndX = originX + thetaArcR * Math.cos(-theta);
  const thetaArcEndY = originY + thetaArcR * Math.sin(-theta);
  const thetaArcPath = `M ${thetaArcStartX} ${thetaArcStartY} A ${thetaArcR} ${thetaArcR} 0 0 0 ${thetaArcEndX} ${thetaArcEndY}`;
  const thetaArc = document.createElementNS('http://www.w3.org/2000/svg','path');
  thetaArc.setAttribute('d', thetaArcPath); thetaArc.setAttribute('stroke','#333'); thetaArc.setAttribute('stroke-width',1.2); thetaArc.setAttribute('fill','none');
  ann.appendChild(thetaArc);
  const thetaLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  thetaLabel.setAttribute('x', 390); thetaLabel.setAttribute('y', 20);
  thetaLabel.setAttribute('class','muted'); thetaLabel.textContent = `θ ${thetaDeg.toFixed(3)}°`;
  ann.appendChild(thetaLabel);

  const m1 = document.createElementNS('http://www.w3.org/2000/svg','text');
  m1.setAttribute('x', 60); m1.setAttribute('y', -240);
  m1.setAttribute('class','muted'); m1.textContent = `Mach = ${M.toFixed(2)}`;
  ann.appendChild(m1);
  const gLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  gLabel.setAttribute('x', 60); gLabel.setAttribute('y', -220);
  gLabel.setAttribute('class','muted'); gLabel.textContent = `γ = ${gamma.toFixed(2)}`;
  ann.appendChild(gLabel);
}

/* helpers to append path and debug markers */
function appendStreamPath(d, arrow = false){
  const p = document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#1f6fb2');
  p.setAttribute('stroke-width', 2);
  if (arrow) {p.setAttribute('marker-end', 'url(#arrow)');}
  streamG.appendChild(p);
}
function drawDebugPoint(x,y,color='#111'){
  const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 3); c.setAttribute('fill', color);
  debugG.appendChild(c);
}
function drawDebugArrow(x,y,dx,dy){
  const arrowLen = 36;
  const l = document.createElementNS('http://www.w3.org/2000/svg','line');
  l.setAttribute('x1', x); l.setAttribute('y1', y);
  l.setAttribute('x2', x + dx*arrowLen); l.setAttribute('y2', y + dy*arrowLen);
  l.setAttribute('stroke', '#111'); l.setAttribute('stroke-width', 1.2); l.setAttribute('marker-end','url(#arrow)');
  debugG.appendChild(l);
}

[streamCountInput, showControl].forEach((el, i) => {
  console.log(i, el);
});


/* events */
drawBtn.addEventListener('click', drawDiagram);
[streamCountInput, showControl, branchStrong, branchWeak].forEach(el=>{
  el.addEventListener('input', drawDiagram);
});


/* initial draw */
drawDiagram();