gamma = 1.4;
R = 287.05;
p_convert = 1.013e5;

function temp_from_mach(mach,gamma) {
  t0_t = (1+((gamma-1)/2)*mach**2);
  return t0_t;
}

function press_from_temp(t0_t) {
  p0_p = (t0_t)**(7/2);
  return p0_p;
}

function Press_jump(mach,p1) {
  p2_p1 = (7*mach**2 - 1)/6;
  p2 = p1*p2_p1;
  return p2;
}

/**
 * Solve for oblique shock beta (radians) given M, theta (radians), gamma.
 * Returns { beta, converged, iterations, message }.
 */
function solveBeta(M, theta, gamma, opts = {}) {
  const tol = opts.tol || 1e-10;
  const maxIter = opts.maxIter || 80;
  const mode = opts.mode || 'weak'; // 'weak', 'strong', or 'both'
  const SVG_EPS = 1e-12;

  function thetaFromBeta(beta) {
    const sinb = Math.sin(beta);
    const cosb = Math.cos(beta);
    const M2 = M * M;
    const numerator = 2 * (1 / Math.tan(beta)) * (M2 * sinb * sinb - 1);
    const denominator = M2 * (gamma + Math.cos(2 * beta)) + 2;
    // use atan2 for stable quadrant handling
    return Math.atan2(numerator, denominator);
  }

  function f(beta) { return theta - thetaFromBeta(beta); }

  const betaMin = Math.asin(1 / M) + 1e-12;
  const betaMax = Math.PI / 2 - 1e-12;

  // Newton with bisection fallback
  function solveWithInitial(beta0) {
    let a = betaMin, b = betaMax;
    let beta = Math.min(betaMax, Math.max(betaMin, beta0));
    for (let iter = 0; iter < maxIter; iter++) {
      const val = f(beta);
      if (Math.abs(val) < tol) return { beta, converged: true, iterations: iter };
      // numeric derivative
      const h = 1e-7;
      const d = (f(beta + h) - f(beta - h)) / (2 * h);
      // Newton step if derivative is reasonable
      if (Math.abs(d) > 1e-14) {
        let betaNew = beta - val / d;
        // if Newton goes out of bounds or is NaN, fallback to bisection step
        if (!Number.isFinite(betaNew) || betaNew <= a || betaNew >= b) {
          // bisection: pick midpoint of interval where sign change exists
          const fa = f(a), fb = f(b);
          if (fa === 0) return { beta: a, converged: true, iterations: iter };
          if (fb === 0) return { beta: b, converged: true, iterations: iter };
          // find subinterval with sign change
          if (fa * val < 0) { b = beta; beta = 0.5 * (a + b); continue; }
          if (val * fb < 0) { a = beta; beta = 0.5 * (a + b); continue; }
          // no sign change known, clamp Newton step
          betaNew = Math.min(b, Math.max(a, betaNew));
        }
        beta = betaNew;
      } else {
        // derivative too small, do bisection step
        beta = 0.5 * (a + b);
      }
      // update bracket a/b if sign info available
      try {
        const fa = f(a), fb = f(b), fbeta = f(beta);
        if (fa * fbeta <= 0) b = beta; else a = beta;
      } catch (e) { /* ignore evaluation errors */ }
    }
    return { beta, converged: false, iterations: maxIter };
  }

  // initial guesses tuned for weak and strong branches
  const weakGuess = betaMin + (betaMax - betaMin) * 0.05;
  const strongGuess = betaMin + (betaMax - betaMin) * 0.85;

  if (mode === 'weak') return solveWithInitial(weakGuess);
  if (mode === 'strong') return solveWithInitial(strongGuess);

  // mode === 'both'
  const weakRes = solveWithInitial(weakGuess);
  const strongRes = solveWithInitial(strongGuess);

  // If both converge to nearly same beta, keep only one
  if (weakRes.converged && strongRes.converged && Math.abs(weakRes.beta - strongRes.beta) < 1e-8) {
    return { weak: null, strong: strongRes, message: 'Single root found' };
  }
  return { weak: weakRes, strong: strongRes };
}


function ObliqueMach(gamma,mn1,beta,Theta) {
  let mn2 = ((1+((gamma-1)/2)*(mn1**2))/((gamma*(mn1**2))-((gamma-1)/2)))**0.5;
  console.log('mn2', mn2);
  let m2 = mn2/(Math.sin(beta - Theta));
  
  return m2;
}

function density_ratio(mn1,gamma){
  let rho21 = (6*mn1**2)/(5+mn1**2);
  return rho21;
}

function pressure_ratio(mn1,gamma){
  let p21 = 1+((2*gamma)/(gamma+1))*((mn1**2)-1);
  return p21;
}

function temperature_ratio(rho21,p21){
  let t21 = p21*(1/rho21);
  return t21;
}

function temp_from_mach(mach,gamma) {
  t0_t = (1+((gamma-1)/2)*mach**2);
  return t0_t;
}

function press_from_temp(t0_t) {
  p0_p = (t0_t)**(7/2);
  return p0_p;
}

function Oblique_downstream(t1,p1,t21,p21,mach1,gamma,mach2){
  let t2 = t1*t21;
  let p2 = p1*p21;
  let t0_t1 = temp_from_mach(mach1,gamma);
  let t0_t2 = temp_from_mach(mach2,gamma);
  let t01 = t1*t0_t1;
  let p02 = p2*press_from_temp(t0_t2);
  let p01 = p1*press_from_temp(t0_t1);

  return [t2,p2,t01,p01,p02];
}


//------ Normal Shock Functions ------
function NormalShock(mach1,temp1,press1){
  const t0_t1 = temp_from_mach(mach1,gamma);
  const t01 = temp1*t0_t1;

  const p0_p1 = press_from_temp(t0_t1);
  const p01 = press1*p0_p1;

  const rho1 = (press1*p_convert)/(R*temp1);

  const mach2 = Math.pow((5+(mach1**2))/(7*(mach1**2)-1),0.5);

  const t0_t2 = temp_from_mach(mach2,gamma);
  const temp2 = t01/t0_t2;

  const press2 = Press_jump(mach1,press1);
  const p0_p2 = press_from_temp(t0_t2);
  const p02 = p0_p2*press2;

  const rho2 = (press2*p_convert)/(R*temp2);

  return [mach2,temp2,press2,rho2,t01,p01,p02,rho1];
}

//------ Oblique Shock Functions ------
function ObliqueShock(Mach1,theta,Temp1,Press1) {
  //const beta = beta_solver(Mach1,theta,gamma);
  let solStrong = null;
  let solWeak = null;
  const thetarad = theta * Math.PI / 180;
  const result = solveBeta(Mach1, thetarad, gamma, { mode:'both'});
  if (result.converged) {
    console.log("Beta (deg):", result.weak.beta * 180 / Math.PI);
  } else {
    console.warn(result.message);
  }

  for (const key in result) { 
    console.log(key, result[key].beta);
    let beta = result[key].beta;
    let NormalMach1 = Mach1 * Math.sin(beta);

    let Mach2 = ObliqueMach(gamma,NormalMach1,beta,thetarad);
  
    let Rho2_1 = density_ratio(NormalMach1,gamma);
    let Press2_1 = pressure_ratio(NormalMach1,gamma);
    let Temp2_1 = temperature_ratio(Rho2_1,Press2_1);

    let [Temp2,Press2,Temp01,P01,P02] = Oblique_downstream(Temp1,Press1,Temp2_1,Press2_1,Mach1,gamma,Mach2);
    let Rho1 = (Press1*p_convert)/(R*Temp1);
    let Rho2 = (Press2*p_convert)/(R*Temp2);
    let betaDeg = beta * (180/Math.PI);

    
    if (key == 'strong') {
      solStrong = {Beta: betaDeg, Mach2: Mach2, Temp2: Temp2, Press2: Press2, Rho1: Rho1, Rho2: Rho2, T01: Temp01, P01: P01, P02: P02};
      console.log("Strong Solution:", solStrong);
    } else if (key == 'weak') {
      solWeak = {Beta: betaDeg, Mach2: Mach2, Temp2: Temp2, Press2: Press2, Rho1: Rho1, Rho2: Rho2, Temp01: Temp01, P01: P01, P02: P02};
      console.log("Weak Solution:", solWeak);
    }

  }
  
  return {Strong:solStrong,Weak:solWeak};
}

function pulldata() {
    try {
        const ShockSelection = document.querySelector('input[name="shock"]:checked').value;
        const Mach1 = parseFloat(document.getElementById("mach").value);
        const Temp1 = parseFloat(document.getElementById('temp').value);
        const Press1 = parseFloat(document.getElementById('press').value);
        const Theta = parseFloat(document.getElementById('angle').value);
        return [ShockSelection, Mach1, Temp1, Press1, Theta];
    } catch (error) {
        console.error("Error parsing input:", error);
        window.alert("Please enter a select an option and enter a valid ratio");
        return null;
    }
}


function runscript(event) {
  event.preventDefault();

  let Mach1 = 0;
  let Mach2 = 0;
  let Temp1 = 0;
  let Temp2 = 0;
  let Temp01 = 0;
  let Temp02 = 0;
  let Press1 = 0;
  let Press2 = 0;
  let P01 = 0;
  let P02 = 0;
  let Rho1 = 0;
  let Rho2 = 0;
  let Theta = 0;
  let beta = 0;

  [ShockSelection, Mach1, Temp1, Press1, Theta] = pulldata();
  console.log("selection: ", ShockSelection);
  console.log("Mach1: ", Mach1);
  console.log("Temp1: ", Temp1);
  console.log("Press1: ", Press1);
  console.log("Theta: ", Theta); 

  if (ShockSelection === "normal") {
    Theta = 0;
    [Mach2,Temp2,Press2,Rho2,Temp01,P01,P02,Rho1] = NormalShock(Mach1,Temp1,Press1);
    Temp02 = Temp01;
    console.log("Mach2: ", Mach2);
    console.log("Temp2: ", Temp2);
    console.log("Press2: ", Press2);
    console.log("Rho2: ", Rho2);
    console.log("t01: ", Temp01);
    console.log("p01: ", P01);
    console.log("p02: ", P02);
    console.log("Rho1: ", Rho1);

    let beta = null;

  } else if (ShockSelection === "oblique") {

    solShock = ObliqueShock(Mach1,Theta,Temp1,Press1);
    [beta,Mach2,Temp2,Press2,Rho1,Rho2,Temp01,P01,P02] = Object.values(solShock.Strong);
    console.log("beta: ", beta*(180/Math.PI));
    console.log("Mach2: ", Mach2);
    console.log("Temp2: ", Temp2);
    console.log("Press2: ", Press2);
    console.log("Rho1: ", Rho1);
    console.log("Rho2: ", Rho2);
    console.log("Temp01: ", Temp01);
    console.log("P01: ", P01);
    console.log("P02: ", P02);

  }

  let results = {
    'Mach1': Mach1,
    'Mach2': Mach2,
    'Temp1': Temp1,
    'Temp2': Temp2,
    'T01': Temp01,
    'T02': Temp01,
    'Press1': Press1,
    'Press2': Press2,
    'P01': P01,
    'P02': P02,
    'Rho1': Rho1,
    'Rho2': Rho2,
    'Theta': Theta,
    'Beta': beta,
    'StrongShock': solShock.Strong,
    'WeakShock': solShock.Weak
  };

  console.log(results);
  localStorage.setItem("ShockAnalysis", JSON.stringify(results));
  console.log("Results saved");

  if (ShockSelection === "normal") {
    window.location.href = "N_ShocksResult.html";
  } else if (ShockSelection === "oblique") {
    window.location.href = "O_ShocksResult.html";
  }
};

document.getElementById("form").addEventListener("submit", runscript);
