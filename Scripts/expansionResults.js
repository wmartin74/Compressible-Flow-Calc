data = JSON.parse(localStorage.getItem('ExpansionData'));
console.log('Data loaded: ', data);
const drawBtn = document.getElementById('drawBtn');
const svg = document.getElementById('svg');
const gridGroup = svg.getElementById('grid');
const streamlinesGroup = svg.getElementById('streamlines');
const fanlinesGroup = svg.getElementById('fanlines');
const wallGroup = svg.getElementById('wall');
const labelsGroup = svg.getElementById('labels');
const gamma = 1.4

runscript()
drawBtn.addEventListener('click', runscript);


function runscript() {
  clearGroups();
  drawGrid();
  const res = MachSolver(data['Mach1'], data['Theta'], gamma, { degrees: true });
  if (res.converged) console.log('M2 =', res.M2);
  else console.warn('Solver failed:', res.message);

  let mu1 = mu(data['Mach1']);
  let mu2 = mu(res.M2);
  let conds = Conditions(data['Mach1'],res.M2,gamma);
  console.log('Conditions : ',conds)

  // Geometry
  const originX = 220, originY = 0;
  const fanLen = 500;
  const fanAngle1 = -mu1;
  const fanAngle2 = deg2rad(data['Theta']) - mu2;
  const fan1x = originX + fanLen * Math.cos(fanAngle1), fan1y = originY + fanLen * Math.sin(fanAngle1);
  const fan2x = originX + (fanLen + 250) * Math.cos(fanAngle2), fan2y = originY + (fanLen + 250) * Math.sin(fanAngle2);
  
  
  const fan1 = {anlge:fanAngle1, xEnd:fan1x, yEnd:fan1y};
  const fan2 = {anlge:fanAngle2, xEnd:fan2x, yEnd:fan2y};

  // Draw Expansion Fan
  for (const key of [fan1,fan2]) {
    console.log(key);
    const fanLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    fanLine.setAttribute('x1', originX); fanLine.setAttribute('y1', originY);
    fanLine.setAttribute('x2', key.xEnd); fanLine.setAttribute('y2', key.yEnd);
    fanLine.setAttribute('stroke','#d9534f');
    fanLine.setAttribute('stroke-width', 3);
    fanLine.setAttribute('stroke-linecap','round');
    fanlinesGroup.appendChild(fanLine);
  }

  const shockMinY = Math.min(originY, fan2y);
  const shockMaxY = Math.max(originY, fan2y);


  const spacing = 20;
  const startX = -40;
  const downStreamLen = 420;

  const streamCount = 9;

  for (let i = 0; i <= streamCount; i++) {
    const y = (i - streamCount) * spacing - 22;

    const upstreamX = Math.max(startX,-200);

    //Computes intersection along first fan line
    let tIntersect1 = (y - originY) / Math.sin(fanAngle1);
    console.log('tIntersect1', tIntersect1);
    tIntersect1 = Math.max(0,Math.min(fanLen, tIntersect1));
  

    let tIntersect2 = (y - originY) / Math.sin(fanAngle2);
    tIntersect2 = Math.max(0, Math.min((fanLen + 250), tIntersect2));
    console.log('tIntersect2', tIntersect2);
    
    const xIntersect1 = originX + tIntersect1 * Math.cos(fanAngle1);
    const yIntersect1 = originY + tIntersect1 * Math.sin(fanAngle1);
    console.log('x and y intercept 1', xIntersect1, yIntersect1);

    const xIntersect2 = originX + tIntersect2 * Math.cos(fanAngle2);
    const yIntersect2 = originY + tIntersect2 * Math.sin(fanAngle2);
    console.log('x and y intercept 2', xIntersect2, yIntersect2);
    
    const midX = (xIntersect1+xIntersect2)/2 + 5;
    const midY = (yIntersect1+yIntersect2)/2 - 5;
    console.log('midX and MidY', midX, midY);

    //if the streamlines doesnt reach the fan line skips
    if (xIntersect1 <= upstreamX + 6 ) {
      appendStreamPath(`M ${upstreamX} ${y} L ${upstreamX+6} ${y}`);
      continue;
    }

    // upstream segment (ends at shock intersection)
    const pathUp = `M ${upstreamX} ${y} L ${xIntersect1} ${y}`;
    appendStreamPath(pathUp);

    const radius = Math.abs(y-originY);

    const arcPath = `M ${xIntersect1} ${yIntersect1} Q ${midX} ${midY} ${xIntersect2} ${yIntersect2}`;
    appendStreamPath(arcPath);

    const dirDown = deg2rad(data['Theta']);
    const dx = Math.cos(dirDown);
    const dy = Math.sin(dirDown);

    const xDown = xIntersect2 + downStreamLen * dx;
    const yDown = yIntersect2 + downStreamLen * dy;

    const downPath = `M ${xIntersect2} ${yIntersect2} L ${xDown} ${yDown}`;
    appendStreamPath(downPath, false, true);

  }

}


function updateResults(elementId, dataObj) {
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
}

/* Helpers */
function deg2rad(d){ return d * Math.PI / 180; }
function rad2deg(r){ return r * 180 / Math.PI; }

function bindRangeNumber(rangeEl, numEl){ rangeEl.addEventListener('input', ()=>{ numEl.value = rangeEl.value; runscript(); }); numEl.addEventListener('input', ()=>{ rangeEl.value = numEl.value; runscript(); }); }

function clearGroups(){ [gridGroup, streamlinesGroup, fanlinesGroup, labelsGroup].forEach(g => { while(g.firstChild) g.removeChild(g.firstChild); }); }

/* Drawing Functions */
function drawGrid(){
  const width = 1000, step = 20;
  for(let x=0;x<=width;x+=step){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x); line.setAttribute('y1', -280);
    line.setAttribute('x2', x); line.setAttribute('y2', 280);
    gridGroup.appendChild(line);
  }
  for(let y=-280;y<=280;y+=step){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', 0); line.setAttribute('y1', y);
    line.setAttribute('x2', width); line.setAttribute('y2', y);
    gridGroup.appendChild(line);
  }
}

function appendStreamPath(d, arc = false, arrow = false, origin){
  
  const p = document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#1f6fb2');
  p.setAttribute('stroke-width', 2);
  
  if (arrow) {p.setAttribute('marker-end', 'url(#arrow)');}
  streamlinesGroup.appendChild(p);
}

/*Calculations*/
function mu(Mach) { return Math.asin(1/Mach);}

function Conditions(Mach1,Mach2,gamma=1.4) {
  let temp01 = 1+((gamma-1)/2)*Mach1**2;
  let temp02 = 1+((gamma-1)/2)*Mach2**2;

  let p1p0 = temp01**(gamma/(gamma-1));
  let p2p0 = temp02**(gamma/(gamma-1));

  let rho01 = (temp01)**(5/2);
  let rho02 = (temp02)**(5/2);
  
  return {Temp01:temp01, Temp02:temp02, P1P0:p1p0, P2P0:p2p0, Rho01:rho01, Rho02:rho02};
}

/* Mach Solver */
function MachSolver(M1, theta, gamma = 1.4, opts = {}) {
  const tol = opts.tol || 1e-10;
  const maxIter = opts.maxIter || 60;
  const useDegrees = !!opts.degrees; // if true, theta provided in degrees

  if (useDegrees) theta = theta * Math.PI / 180;

  if (!(M1 > 1)) {
    return { M2: null, converged: false, message: 'Upstream Mach must be > 1 for Prandtl-Meyer expansion' };
  }

  // Prandtl-Meyer function nu(M)
  function nu(M) {
    const gm = (gamma - 1) / (gamma + 1);
    const A = Math.sqrt((gamma + 1) / (gamma - 1));
    const arg1 = Math.sqrt(gm * (M * M - 1));
    const arg2 = Math.sqrt(M * M - 1);
    return A * Math.atan(arg1) - Math.atan(arg2);
  }

  // derivative dnu/dM (numerically stable)
  function dnu_dM(M) {
    // derived analytic expression
    const M2 = M * M;
    const sqrtM2m1 = Math.sqrt(Math.max(0, M2 - 1));
    const a = (gamma + 1) / (gamma - 1);
    const gm = (gamma - 1) / (gamma + 1);
    const denom1 = 1 + gm * (M2 - 1); // for atan(arg1)
    const denom2 = 1 + (M2 - 1);     // for atan(arg2) -> = M2
    // d/dM [A*atan(arg1)] = A * (1/(1+arg1^2)) * d(arg1)/dM
    // arg1 = sqrt(gm*(M^2-1)) => d(arg1)/dM = gm * M / arg1
    // handle small arg1 safely
    const arg1 = Math.sqrt(Math.max(0, gm * (M2 - 1)));
    let term1 = 0;
    if (arg1 > 0) {
      term1 = Math.sqrt(a) * (1 / denom1) * (gm * M / arg1);
    } else {
      // small M->1 limit
      term1 = Math.sqrt(a) * (gm * M) / 1e-12;
    }
    // d/dM [atan(arg2)] = (1/(1+arg2^2)) * d(arg2)/dM
    // arg2 = sqrt(M^2-1) => d(arg2)/dM = M / arg2
    const arg2 = sqrtM2m1;
    let term2 = 0;
    if (arg2 > 0) {
      term2 = (1 / denom2) * (M / arg2);
    } else {
      term2 = (M) / 1e-12;
    }
    return term1 - term2;
  }

  // target nu value
  const nu1 = nu(M1);
  const nuTarget = nu1 + theta;

  // bracket for M2: nu(M) increases with M, so search M in [M1, Mmax]
  const Mmin = Math.max(1 + 1e-12, M1); // downstream Mach >= upstream Mach for expansion? usually M2 > M1 for expansion
  const Mmax = opts.Mmax || 1e3; // large upper bound; user can reduce if desired

  // quick check: if nuTarget <= nu(Mmin) then no solution in >Mmin
  if (nuTarget <= nu(Mmin) + 1e-14) {
    return { M2: Mmin, converged: true, message: 'Zero or negative turn: downstream Mach equals upstream or no expansion needed' };
  }

  // find an upper bracket where nu(M_hi) >= nuTarget
  let a = Mmin, b = Math.max(Mmin * 1.2, 2.0);
  let nu_b = nu(b);
  let iterExpand = 0;
  while (nu_b < nuTarget && b < Mmax && iterExpand < 80) {
    b *= 1.5;
    nu_b = nu(b);
    iterExpand++;
  }
  if (nu_b < nuTarget) {
    return { M2: null, converged: false, message: 'Could not bracket solution: increase Mmax or check inputs' };
  }

  // now solve f(M) = nu(M) - nuTarget = 0 on [a,b]
  function f(M) { return nu(M) - nuTarget; }

  // initial guess: linear interpolation in nu space
  let fa = f(a), fb = f(b);
  let M = a + (b - a) * (Math.abs(fa) / (Math.abs(fa) + Math.abs(fb))); // weighted
  if (!Number.isFinite(M)) M = 1.1 * a;

  for (let iter = 0; iter < maxIter; iter++) {
    const fM = f(M);
    if (Math.abs(fM) < tol) return { M2: M, converged: true, iterations: iter };

    // try Newton step
    const d = dnu_dM(M);
    if (Math.abs(d) > 1e-14) {
      const Mnew = M - fM / d;
      // accept Newton if inside bracket
      if (Mnew > a && Mnew < b && Number.isFinite(Mnew)) {
        M = Mnew;
        continue;
      }
    }

    // otherwise bisection step
    if (fa * fM < 0) {
      b = M; fb = fM;
    } else {
      a = M; fa = fM;
    }
    const Mbis = 0.5 * (a + b);
    // if interval small enough, return midpoint
    if (Math.abs(b - a) < 1e-12) return { M2: Mbis, converged: true, iterations: iter };
    M = Mbis;
  }

  return { M2: M, converged: false, iterations: maxIter, message: 'Max iterations reached' };
}
