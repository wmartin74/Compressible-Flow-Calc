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

//------ Normal Shock Functions ------
function NormalShock(mach1,temp1,press1){
  t0_t1 = temp_from_mach(mach1,gamma);
  t01 = temp1*t0_t1;

  p0_p1 = press_from_temp(t0_t1);
  p01 = press1*p0_p1;

  rho1 = (press1*p_convert)/(R*temp1);

  mach2 = Math.pow((5+(mach1**2))/(7*(mach1**2)-1),0.5);

  t0_t2 = temp_from_mach(mach2,gamma);
  temp2 = t01/t0_t2;

  press2 = press_jump(mach1,press1);
  p0_p2 = press_from_temp(t0_t2);
  p02 = p0_p2*press2;

  rho2 = (press2*p_convert)/(R*temp2);

  return [mach2,temp2,press2,rho2,t01,p01,p02,rho1];
}

function runscript(event) {
  event.preventDefault();
  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
