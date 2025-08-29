gamma = 1.4;
R = 287.05;

//------ Normal Shock Functions ------
function NormalShock(mach1,temp1,press1){
  
}

function runscript(event) {
  event.preventDefault();
  window.location.href = "NandO_ShocksResult.html";
}

document.getElementById("form").addEventListener("submit", runscript);
