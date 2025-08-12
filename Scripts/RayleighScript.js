function runscript(event) {
  event.preventDefault();
  window.location.href = "RayleighResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
