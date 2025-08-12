function runscript(event) {
  event.preventDefault();
  window.location.href = "expansionResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
