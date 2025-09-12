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

// def obl_mach(gamma:float, Mn1:float, beta:float, theta:float):
    // Mn2 = ((1+((gamma-1)/2)*(Mn1**2))/((gamma*(Mn1**2))-((gamma-1)/2)))**.5
    // M2 = Mn2/(np.sin(np.deg2rad(beta-theta)))
    // return M2

function beta_solver(mach,theta,gamma) {
  mu = Math.asin(1/mach);
  function f(beta) {
    return 2*(1/Math.tan(beta))*((mach**2 * Math.sin(beta)**2 - 1)/(mach**2 * (gamma + Math.cos(2*beta)) + 2)) - Math.tan(theta);
  }

  function fprime(beta) {
    const numerator = 2*(2*mach**2 * beta * Math.cos(beta**2) *Math.tan(beta)* (mach**2*(gamma + Math.cos(2*beta)) + 2) - (Math.sec(beta)**2 * (mach**2 * (gamma + Math.cos(2*beta))+2) - 2*mach**2 * Math.sin(2*beta)*Math.tan(beta))*(mach**2 * Math.sin(beta**2) - 1));
    const denominator = Math.tan(beta)**2 * Math.Pow(mach**2 * (gamma + Math.cos(2*beta)) +2,2);
    return numerator/denominator - Math.sec(beta)**2;
  }

  function residual(beta,target) {
    return f(beta) - target;
  }

  function NewtonSolver(target, x0, tol = 1e-6, maxIter = 100) {
    let beta = x0;

    for (let i = 0; i < maxIter; i++) {
      const r = residual(beta, target);
      const rprime = fprime(beta);

      if (Math.abs(rprime) < 1e-8) {
        console.error("Derivative too small; no convergence.");
        break;
      }
      const delta = r / rprime;
      beta -= delta;

      if (Math.abs(delta) < tol && delta > 0) return beta;
    }
    console.error("Max iterations reached; no convergence.");
    return null;
  }
  return beta = NewtonSolver(theta, mu);
}

function ObliqueMach(gamma,Mn1,beta,Theta) {
  const Mn2 = Math.pow((1+((gamma-1)/2)*(Mn1**2))/((gamma*(Mn1**2))-((gamma-1)/2)))**0.5;
  const M2 = Mn2/(Math.sin(beta - Theta*(Math.PI/180)));
  return M2;
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

  const press2 = press_jump(mach1,press1);
  const p0_p2 = press_from_temp(t0_t2);
  const p02 = p0_p2*press2;

  const rho2 = (press2*p_convert)/(R*temp2);

  return [mach2,temp2,press2,rho2,t01,p01,p02,rho1];
}

//------ Oblique Shock Functions ------
function ObliqueShock(mach1,theta,temp1,press1) {
  const beta = beta_solver(mach1,theta,gamma);

  const NormalMach1 = mach1 * Math.sin(beta);


  
}



function runscript(event) {
  event.preventDefault();
  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
