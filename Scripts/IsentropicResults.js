document.addEventListener("DOMContentLoaded", function () {
  results = JSON.parse(localStorage.getItem("IsentropicAnalysis"));
  console.log("Results Loaded");
  console.log(results);

  let element = ['Mach', 'T0_T', 'P0_P', 'Rho0_Rho', 'A_As', 'Mach_sub', 'T0T_sub', 'P0P_sub', 'Rho0Rho_sub', 'Mach_super', 'T0T_super', 'P0P_super', 'Rho0Rho_super'];

  for (let i = 0; i < element.length; i++) {
    let key = document.getElementById(element[i]);
    if (results[element[i]] != null && typeof results[element[i]] != 'number') {
      key.innerHTML = results[element[i]].toFixed(4);
    } else if (results[element[i]] != null && typeof results[element[i]] == 'number') {
      key.innerHTML = results[element[i]];
    } else {
      key.innerHTML = "N/A";
    }
  }

});
