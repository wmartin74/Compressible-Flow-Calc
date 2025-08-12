
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
        event.preventDefault();
        window.location.href = "./Pages/expansion.html";
      } else if (this.value === 'Critical Mach') {
        console.log('Critical Mach button clicked');
        event.preventDefault();
        window.location.href = "./Pages/critmach.html";
      } else if (this.value === 'Rayleigh Flow') {
        console.log('Rayleigh button clicked');
        event.preventDefault();
        window.location.href = "./Pages/Rayleigh.html";
      } else if (this.value === 'Nozzles Regimes') {
        console.log('Nozzle Regims button clicked');
        event.preventDefault();
        window.location.href = "./Pages/critmach.html";
      }
    });
  });
