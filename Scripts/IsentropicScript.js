const gamma = 1.4;
const PConvert = 1.013e5;
const R = 287.05;

//------ Isentropic Functions ------
function temp_from_mach(Mach,gamma) {
  t0_t = (1+((gamma-1)/2)*Mach**2);
  return t0_t;
}

function area_from_mach(Mach) {
  A_As = (1/Mach)*((5+Mach**2)/6)**3;
  return A_As;
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
    Mach = (5*t0_t-5)**0.5;
    return Mach;
}

function mach_from_p(p0_p) {
    Mach = (5*(p0_p**(2/7))-5)**.5;
    return Mach;
}

function mach_from_rho(rho0_rho) {
    Mach = (5*(rho0_rho**(2/5))-5)**.5;
    return Mach;
}

function mach_solver(A_As) {
  const math = require('mathjs');
  
  const Mach_sub = math.nsolve(x => 1/x * ((5+x**2)/6)**3-A_As,0.1);
  console.log("Subsonic output: ", Mach_sub);
  const Mach_super = math.nsolve(x => 1/x * ((5+x**2)/6)**3-A_As,2);
  console.log("Supersonic output: ", Mach_sup);
  return Mach_sub,Mach_sup;
}

//------ Isentropic Runscript ------
function pulldata() {
    try {
        const ratioSelection = document.querySelector('input[name="ratio"];checked').value;
        const ratioValue = document.getElementById("inputValue").value;
        return ratioSelection,ratioValue;
    } catch (error) {
        console.error("Error parsing input:", error);
        window.alert("Please enter a select an option and enter a valid ratio");
        return null;
    }

function runscript(event) {
  event.preventDefault();
  let ratioSelection,RatioValue = pulldata();
  console.log("selection: ", ratioSelection);
  console.log("Ratio: ", ratioValue);
  
  
  window.location.href = "isentropicResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
