//function isentropic(event) {
//  event.preventDefault();
//  window.location.href = "./Pages/isentropic.html";
//}

//function NormObl_Shocks(event) {
//  event.preventDefault();
//  window.location.href = "./Pages/NandO_Shocks.html";
//}

// document.getElementById("calc_selection").addEventListener("submit", isentropic);
document.querySelectorAll('input[type="submit"]').forEach(button => {
  button.addEventListener('click', function(event) {
    if (this.value === 'Isentropic Flow') {
        console.log('Isentropic button clicked');
        event.preventDefault();
        window.location.href = "./Pages/isentropic.html";
      } else if (this.value === 'Normal and Oblique Shocks') {
        console.log('Normal and Oblique Shocks button clicked');
        event.preventDefault();
        window.location.href = "./Pages/NandO_Shocks.html";
      } else if (this.value === 'Shock Expansion') {
        console.log('Shock Expansion button clicked');
      }
    });
  });
