function runscript(event) {
  event.preventDefault();
  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
