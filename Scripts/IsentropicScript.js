const gamma = 1.4;
const PConvert = 1.013e5;
const R = 287.05;

//------ Isentropic Functions ------
function temp_from_mach(mach,gamma) {
  t0_t = (1+((gamma-1)/2)*mach**2);
  return t0_t;
}

function area_from_mach(mach) {
  a_as = (1/mach)*((5+mach**2)/6)**3;
  return a_as;
}

function press_from_temp(t0_t) {
  p0_p = (t0_t)**(7/2);
  return p0_p;
}

function rho_from_temp(t0_t) {
  rho0_rho = (t0_t)**(5/2);
  return rho0_rho;
}

function mach_from_temp(t0_t) {
    mach = (5*t0_t-5)**0.5;
    return mach;
}

function mach_from_press(p0_p) {
    mach = (5*(p0_p**(2/7))-5)**.5;
    return mach;
}

function mach_from_rho(rho0_rho) {
    mach = (5*(rho0_rho**(2/5))-5)**.5;
    return mach;
}

function mach_solver(a_as) {
  const math = require('mathjs');
  
  const mach_sub = math.nsolve(x => 1/x * ((5+x**2)/6)**3-a_as,0.1);
  console.log("Subsonic output: ", mach_sub);
  const mach_super = math.nsolve(x => 1/x * ((5+x**2)/6)**3-a_as,2);
  console.log("Supersonic output: ", mach_sup);
  return [mach_sub,mach_sup];
}

//------ Isentropic Runscript ------
function pulldata() {
    try {
        const ratioSelection = document.querySelector('input[name="ratio"]:checked').value;
        const ratioValue = document.getElementById("inputValue").value;
        return [ratioSelection, ratioValue];
    } catch (error) {
        console.error("Error parsing input:", error);
        window.alert("Please enter a select an option and enter a valid ratio");
        return null;
    }
}

function runscript(event) {
  event.preventDefault();
  let [ratioSelection, ratioValue] = pulldata();
  console.log("selection: ", ratioSelection);
  console.log("Ratio: ", ratioValue);

  if (ratioSelection == "mach") {
    
    const Mach = ratioValue;
    const T0_T = temp_from_mach(Mach,gamma);
    const P0_P = press_from_temp(T0_T);
    const Rho0_Rho = rho_from_temp(T0_T);
    const A_As = area_from_mach(Mach);

    let Mach_sub = null;
    let T0T_sub = null;
    let P0P_sub = null;
    let Rho0Rho_sub = null;
    let Mach_super = null;
    let T0T_super = null;
    let P0P_super = null;
    let Rho0Rho_super = null;

  } else if (ratioSelection == "pressure") {

    const P0_P = ratioValue;
    const Mach = mach_from_press(P0_P);
    const T0_T = temp_from_mach(Mach, gamma);
    const Rho0_Rho = rho_from_temp(T0_T);
    const A_As = area_from_mach(Mach);

    let Mach_sub = null;
    let T0T_sub = null;
    let P0P_sub = null;
    let Rho0Rho_sub = null;
    let Mach_super = null;
    let T0T_super = null;
    let P0P_super = null;
    let Rho0Rho_super = null;
    
  } else if (ratioSelection == "temperature") {
    
    const T0_T = ratioValue;
    const P0_P = press_from_temp(T0_T);
    const Mach = mach_from_press(P0_P);
    const Rho0_Rho = rho_from_temp(T0_T);
    const A_As = area_from_mach(Mach);

    let Mach_sub = null;
    let T0T_sub = null;
    let P0P_sub = null;
    let Rho0Rho_sub = null;
    let Mach_super = null;
    let T0T_super = null;
    let P0P_super = null;
    let Rho0Rho_super = null;
    
  } else if (ratioSelection == "density") {

    const Rho0_Rho = ratioValue;
    const Mach = mach_from_rho(Rho0_Rho);
    const T0_T = temp_from_mach(Mach, gamma);
    const P0_P = press_from_temp(T0_T);
    const A_As = area_from_mach(Mach);

    let Mach_sub = null;
    let T0T_sub = null;
    let P0P_sub = null;
    let Rho0Rho_sub = null;
    let Mach_super = null;
    let T0T_super = null;
    let P0P_super = null;
    let Rho0Rho_super = null;

  } else if (ratioSelection == "area") {

    const A_As = ratioSelection;
    const [Mach_sub, Mach_super] = mach_solver(A_As);

    const T0T_sub = temp_from_mach(Mach_sub, gamma);
    const P0P_sub = press_from_temp(T0T_sub);
    const Rho0Rho_sub = rho_from_temp(T0T_sub);

    const T0T_super = temp_from_mach(Mach_super, gamma);
    const P0P_super = press_from_temp(T0T_super);
    const Rho0Rho_super = rho_from_temp(T0T_super);

    let Mach = null;
    let T0_T = null;
    let P0_P = null;
    let Rho0_Rho = null;
  }

  console.log("Mach: ", Mach);
  console.log("T0_T: ", T0_T);
  console.log("P0_P: ", P0_P);
  console.log("Rho0_Rho: ", Rho0_Rho);
  console.log("A_As: ", A_As);
  console.log("Mach_sub: ", Mach_sub);
  console.log("T0T_sub: ", T0T_sub);
  console.log("P0P_sub: ", P0P_sub);
  console.log("Rho0Rho_sub: ", Rho0Rho_sub);
  console.log("Mach_super: ", Mach_super);
  console.log("T0T_super: ", T0T_super);
  console.log("P0P_super: ", P0P_super);
  console.log("Rho0Rho_super: ", Rho0Rho_super);
  
  results = {
    Mach: Mach.toFixed(3),
    T0_T: T0_T.toFixed(4),
    P0_P: P0_P.toFixed(4),
    Rho0_Rho: Rho0_Rho.toFixed(4),
    A_As: A_As.toFixed(4),
    Mach_sub: Mach_sub.toFixed(3),
    T0T_sub: T0T_sub.toFixed(4),
    P0P_sub: P0P_sub.toFixed(4),
    Rho0Rho_sub: Rho0Rho_sub.toFixed(4),
    Mach_super: Mach_super.toFixed(3),
    T0T_super: T0T_super.toFixed(4),
    P0P_super: P0P_super.toFixed(4),
    Rho0Rho_super: Rho0Rho_super.toFixed(4)
  }
  console.log(results)
  localStorage.setItem("IsentropicAnalysis", JSON.stringify(results));
  console.log("Results Saved");
  window.location.href = "isentropicResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
