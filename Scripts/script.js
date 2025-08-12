function isentropic(event) {
  event.preventDefualt();
  window.location.href = "./pages/isentropic.html";
}

document.getElementById("calc_selection").addEventListener("submit", isentropic);
