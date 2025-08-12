function isentropic(event) {
  event.preventDefault();
  window.location.href = "./Pages/isentropic.html";
}

document.getElementById("calc_selection").addEventListener("submit", isentropic);
