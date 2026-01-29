function runscript(event) {
  event.preventDefault();

  [Mach1,Theta] = pulldata();
  //console.log('Mach1: ', Mach1);
  //console.log('Theta: ', Theta);
  
  let inputData = {
    'Mach1': Mach1,
    'Theta': Theta
  }

  console.log('Input Data: ', inputData);
  localStorage.setItem('ExpansionData', JSON.stringify(inputData));
  console.log('Data Saved');

  window.location.href = "expansionResult.html";
}

function pulldata() {
    try {
        const Mach1 = parseFloat(document.getElementById("mach").value);
        const Theta = parseFloat(document.getElementById('theta').value);
        return [Mach1,Theta];
    } catch (error) {
        console.error("Error parsing input:", error);
        window.alert("Please enter a select an option and enter a valid ratio");
        return null;
    }
}



document.getElementById("form").addEventListener("submit", runscript);
