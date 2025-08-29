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

//------ Normal Shock Functions ------
function NormalShock(mach1,temp1,press1){
  t0_t1 = temp_from_mach(mach1,gamma);
  t01 = temp1*t0_t1;

  p0_p1 = press_from_temp(t0_t1);
  p01 = press1*p0_p1;


}

function runscript(event) {
  event.preventDefault();
  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
