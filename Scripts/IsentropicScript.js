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
  //function MachFunc(x) {
  //  return 1/x * Math.pow((5+Math.pow(x,2))/6, 3 - a_as);
  //}

  //let initguess = 0.1;
  //console.log(MachFunc(2));
  //let result = numeric.uncmin(x => MachFunc(x), initguess);
  //console.log(result);
  //const mach_sub = result.solution;
  //console.log("Subsonic output: ", mach_sub);
  //initguess = 3;
  //result = numeric.uncmin(MachFunc, initguess);
  //const mach_super = result.solution;
  //console.log("Supersonic output: ", mach_super);

  function solveRoot(a_as, x0 = 0.5) {
    function f(x) {
        if (x[0] === 0) return Infinity;
        return (1 / x[0]) * Math.pow((5 + x[0] ** 2) / 6, 3 - a_as);
    }

    // Minimize the square of the function
    function objective(x) {
        const fx = f(x);
        return fx * fx;
    }

    const result = numeric.uncmin(objective, [x0]);
    console.log(result);
    if (result.success && Math.abs(f(result.solution[0])) < 1e-9) {
        return result.solution[0];
    } else {
        console.warn("No root found or convergence failed.");
        return null;
    }
  }

  const mach_sub = solveRoot(a_as, 0.2);
  const mach_super = solveRoot(a_as, 2);
  return [mach_sub,mach_super];
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

  } else if (ratioSelection === "pressure") {

    P0_P = ratioValue;
    Mach = mach_from_press(P0_P);
    T0_T = temp_from_mach(Mach, gamma);
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
    
  } else if (ratioSelection === "temperature") {
    
    T0_T = ratioValue;
    P0_P = press_from_temp(T0_T);
    Mach = mach_from_press(P0_P);
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
    
  } else if (ratioSelection === "density") {

    Rho0_Rho = ratioValue;
    Mach = mach_from_rho(Rho0_Rho);
    T0_T = temp_from_mach(Mach, gamma);
    P0_P = press_from_temp(T0_T);
    A_As = area_from_mach(Mach);

    Mach_sub = null;
    T0T_sub = null;
    P0P_sub = null;
    Rho0Rho_sub = null;
    Mach_super = null;
    T0T_super = null;
    P0P_super = null;
    Rho0Rho_super = null;

  } else if (ratioSelection === "area") {

    A_As = ratioValue;
    [Mach_sub, Mach_super] = mach_solver(A_As);

    T0T_sub = temp_from_mach(Mach_sub, gamma);
    P0P_sub = press_from_temp(T0T_sub);
    Rho0Rho_sub = rho_from_temp(T0T_sub);

    T0T_super = temp_from_mach(Mach_super, gamma);
    P0P_super = press_from_temp(T0T_super);
    Rho0Rho_super = rho_from_temp(T0T_super);

    Mach = null;
    T0_T = null;
    P0_P = null;
    Rho0_Rho = null;
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
