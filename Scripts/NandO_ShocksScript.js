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

function ObliqueMach(gamma,mn1,beta,Theta) {
  let mn2 = Math.pow((1+((gamma-1)/2)*(mn1**2))/((gamma*(mn1**2))-((gamma-1)/2)))**0.5;
  let m2 = mn2/(Math.sin(beta - Theta*(Math.PI/180)));
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

  const press2 = press_jump(mach1,press1);
  const p0_p2 = press_from_temp(t0_t2);
  const p02 = p0_p2*press2;

  const rho2 = (press2*p_convert)/(R*temp2);

  return [mach2,temp2,press2,rho2,t01,p01,p02,rho1];
}

//------ Oblique Shock Functions ------
function ObliqueShock(Mach1,theta,Temp1,Press1) {
  const beta = beta_solver(Mach1,theta,gamma);

  const NormalMach1 = Mach1 * Math.sin(beta);

  const Mach2 = ObliqueMach(gamma,NormalMach1,beta,theta);
  
  const Rho2_1 = density_ratio(NormalMach1,gamma);
  const Press2_1 = pressure_ratio(NormalMach1,gamma);
  const Temp2_1 = temperature_ratio(Rho2_1,Press2_1);

  const [Temp2,Press2,Temp01,P01,P02] = Oblique_downstream(Temp1,Press1,Temp2_1,Press2_1,Mach1,gamma,Mach2);
  const Rho1 = (Press1*p_convert)/(R*Temp1);
  const Rho2 = (Press2*p_convert)/(R*Temp2);

  return [beta,Mach2,Temp2,Press2,Rho1,Rho2,Temp01,P01,P02];
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

  let [ShockSelection, Mach1, Temp1, Press1, Theta] = pulldata();
  console.log("selection: ", ShockSelection);
  console.log("Mach1: ", Mach1);
  console.log("Temp1: ", Temp1);
  console.log("Press1: ", Press1);
  console.log("Theta: ", Theta); 

  if (ShockSelection === "normal") {
    const [Mach2,Temp2,Press2,Rho2,Temp01,P01,P02,Rho1] = NormalShock(Mach1,Temp1,Press1);
    console.log("Mach2: ", Mach2);
    console.log("Temp2: ", Temp2);
    console.log("Press2: ", Press2);
    console.log("Rho2: ", Rho2);
    console.log("t01: ", Temp01);
    console.log("p01: ", P01);
    console.log("p02: ", P02);
    console.log("rho1: ", Rho1);

    let beta = null;

  } else if (ShockSelection === "oblique") {

    const [beta,Mach2,Temp2,Press2,Rho1,Rho2,Temp01,P01,P02] = ObliqueShock(Mach1,Theta,Temp1,Press1);
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

  

  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
