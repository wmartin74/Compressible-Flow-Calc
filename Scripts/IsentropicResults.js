document.addEventListener("DOMContentLoaded", function () {
  results = JSON.parse(localStorage.getItem("IsentropicAnalysis"));
  console.log("Results Loaded");
  console.log(results);

  mach.innerHTML = results.Mach;
  t0_t.innerHTML = results.T0_T;
  p0_p.innerHTML = results.P0_P;
  rho0_rho.innerHTML = results.Rho0_Rho;
  a_as.innerHTML = results.A_As;
  
});
