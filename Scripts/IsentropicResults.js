document.addEventListener("DOMContentLoaded", function () {
  results = JSON.parse(localStorage.getItem("IsentropicAnalysis"));
  console.log("Results Loaded");
  console.log(results);

  mach.innerHTML = results.Mach;
  t0_t.innerHTML = results.T0_T;
  p0_p.innerHTML = results.P0_P;
  rho0_rho.innerHTML = results.Rho0_Rho;
  a_as.innerHTML = results.A_As;
  mach_sub.innerHTML = results.Mach_sub;
  t0t_sub.innerHTML = results.T0T_sub;
  p0p_sub.innerHTML = results.P0P_sub;
  rho0rho_sub.innerHTML = results.Rho0Rho_sub;
  mach_super.innerHTML = results.Mach_super;
  t0t_super.innerHTML = results.T0T_super;
  p0p_super.innerHTML = results.P0P_super;
  rho0rho_super.innerHTML = results.Rho0Rho_super;
  
  
});
