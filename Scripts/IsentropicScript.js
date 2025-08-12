function runscript(event) {
  event.preventDefault();
  window.location.href = "isentropicResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
