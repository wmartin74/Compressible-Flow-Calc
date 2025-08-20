const gamma = 1.4;
const PConvert = 1.013e5;
const R = 287.05;

// import { create, all } from 'mathjs'

// create a mathjs instance with configuration
//const config = {
//  relTol: 1e-12,
//  absTol: 1e-15,
//  matrix: 'Matrix',
//  number: 'number',
//  numberFallback: 'number',
//  precision: 64,
//  predictable: false,
//  randomSeed: null
//}
//const math = create(all, config)

// read the applied configuration
//console.log(math.config())

// change the configuration
//math.config({
//  number: 'BigNumber'
//})


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

  let Mach = 0;
  let T0_T = 0;
  let P0_P = 0;
  let Rho0_Rho = 0;
  let A_As = 0;

  let Mach_sub = 0;
  let T0T_sub= 0;
  let P0P_sub = 0;
  let Rho0Rho_sub = 0;
  let Mach_super = 0;
  let T0T_super = 0;
  let P0P_super = 0;
  let Rho0Rho_super = 0;
  
  if (ratioSelection === "mach") {
    
    Mach = ratioValue;
    T0_T = temp_from_mach(Mach,gamma);
    P0_P = press_from_temp(T0_T);
    Rho0_Rho = rho_from_temp(T0_T);
    A_As = area_from_mach(Mach);

    Mach_sub = null;
    T0T_sub = null;
    P0P_sub = null;
    Rho0Rho_sub = null;
    Mach_super = null;
    T0T_super = null;
    P0P_super = null;
    Rho0Rho_super = null;

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

  } else if (ratioSelection === "pressure") {

    let P0_P = ratioValue;
    let Mach = mach_from_press(P0_P);
    let T0_T = temp_from_mach(Mach, gamma);
    let Rho0_Rho = rho_from_temp(T0_T);
    let A_As = area_from_mach(Mach);

    let Mach_sub = null;
    let T0T_sub = null;
    let P0P_sub = null;
    let Rho0Rho_sub = null;
    let Mach_super = null;
    let T0T_super = null;
    let P0P_super = null;
    let Rho0Rho_super = null;
    
  } else if (ratioSelection === "temperature") {
    
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
    
  } else if (ratioSelection === "density") {

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

  } else if (ratioSelection === "area") {

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

  
  
  let results = {
    "Mach": Mach,
    "T0_T": T0_T,
    "P0_P": P0_P,
    "Rho0_Rho": Rho0_Rho,
    "A_As": A_As,
    "Mach_sub": Mach_sub,
    "T0T_sub": T0T_sub,
    "P0P_sub": P0P_sub,
    "Rho0Rho_sub": Rho0Rho_sub,
    "Mach_super": Mach_super,
    "T0T_super": T0T_super,
    "P0P_super": P0P_super,
    "Rho0Rho_super": Rho0Rho_super
  };

  console.log(results);
  localStorage.setItem("IsentropicAnalysis", JSON.stringify(results));
  console.log("Results Saved");
  window.location.href = "isentropicResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
