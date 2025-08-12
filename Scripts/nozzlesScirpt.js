function runscript(event) {
  event.preventDefault();
  window.location.href = "nozzlesResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
