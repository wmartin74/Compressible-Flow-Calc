document.addEventListener("DOMContentLoaded", function () {
  results = JSON.parse(localStorage.getItem("ShockAnalysis"));
  console.log("Results Loaded");
  console.log(results);

  let element = [
    'Mach1',
    'Mach2',
    'Temp1',
    'Temp2',
    'T01',
    'T02',
    'Press1',
    'Press2',
    'P01',
    'P02',
    'Rho1',
    'Rho2',
    'Theta',
    'Beta'
  ];

  for (let i = 0; i < element.length; i++) {
    let key = document.getElementById(element[i]);
    if (results[element[i]] != null && typeof results[element[i]] == 'number') {
      console.log('key', key);
      console.log(results[element[i]]);
      key.innerHTML = results[element[i]].toFixed(4);
    } else if (results[element[i]] != null && typeof results[element[i]] != 'number') {
      key.innerHTML = results[element[i]];
    } else {
      key.innerHTML = "N/A";
    }
  }

});
