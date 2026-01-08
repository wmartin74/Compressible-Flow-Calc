// declare DOM refs at top so functions can reference them
let svg, gridG, streamG, shockG, labelsG, debugG, drawBtn;


function deg2rad(deg) { return deg * Math.PI / 180; }
function rad2deg(rad) { return rad * 180 / Math.PI; }

/*
Helpers
*/
function clearGroups() {
  const groupIds = ['streamG', 'shockG', 'debugG']; // example IDs
  groupIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return; // skip if not found
    // clear children safely
    if (typeof el.replaceChildren === 'function') {
      el.replaceChildren(); // fast and safe
    } else {
      while (el.firstChild) el.removeChild(el.firstChild);
    }
  });
}

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

function drawGraph(thetadeg,mach1,betaRad,gamma=1.4,streamcount=9){
  clearGroups();
  drawGrid();

  let thetaRad = deg2rad(thetadeg);

  const originX = 220, originY = 0;
  const shockLen = 900;
  const shockAngle = -betaRad;
  const tx = Math.cos(shockAngle), ty = Math.sin(shockAngle);
  const shockX2 = originX + shockLen *tx;
  const shockY2 = originY + shockLen *ty;

  //draw shock line
  const shockLine = document.createElementNS('http://www.w3.org/2000/svg','line')
  shockLine.setAttribute('x1', originX); shockLine.setAttribute('y1', originY);
  shockLine.setAttribute('x2', shockX2); shockLine.setAttribute('y2', shockY2);
  shockLine.setAttribute('stroke', '#d9534f'); shockLine.setAttribute('stroke-width', 3);
  shockLine.setAttribute('stroke-linecap','round');
  shockG.appendChild(shockLine);

  const spacing = 22;
  const starX = -40;
  const downstream = 420;

  for (let i = 0; i < streamcount; i++) { 
    const y = (i - Math.floor(streamCount /2))* spacing;
    
    if (y > shockMaxY) continue;

    const upstreamX = Math.max(startX, -200);

    let tIntersect;
    if (Math.abs(ty) < 1e-9) {

      tIntersect = 20;
    } else {
      tIntersect = ( y - originY) / ty;
    }

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
    appendStreamPath(pathFull);

    if (showControl.checked) {
      drawDebugPoint(xIntersect, yIntersect);
      drawDebugPoint(c1x, c1y, '#0b74de');
      drawDebugPoint(c2x, c2y, '#0b74de');
      drawDebugArrow(xIntersect, yIntersect, dirX, dirY);
    }

  }



}

document.addEventListener("DOMContentLoaded", function () {
  results = JSON.parse(localStorage.getItem("ShockAnalysis"));
  console.log("Results Loaded");
  console.log(results);

  /*
  DOM refs
  */
  svg = document.getElementById('svg');
  gridG = document.getElementById('grid');
  streamG = document.getElementById('streamlines');
  shockG = document.getElementById('shock');
  labelsG = document.getElementById('labels');
  debugG = document.getElementById('debug');
  drawBtn = document.getElementById('drawBtn');

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

  drawGraph(results.Theta,results.Mach1,results.Beta);

});
