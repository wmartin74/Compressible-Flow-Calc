function runscript(event) {
  event.preventDefault();
  window.location.href = "critmachResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
