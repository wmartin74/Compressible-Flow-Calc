function isentropic(event) {
  event.preventDefault();
  window.location.href = "./pages/isentropic.html";
}

document.getElementById("calc_selection").addEventListener("submit", isentropic);
