function openForm(formId, buttonId) {
    document.getElementById(formId).style.display = "block";
	document.getElementById(buttonId).disabled = true;
};

function closeForm(formId, buttonId) {
	document.getElementById(formId).style.display = "none";
	document.getElementById(buttonId).disabled = false;
};

function eraseError() {
	document.getElementById("email-label").innerText = "Email";
};

function confirmDeleteCustomer(customer) {
	var txt;
	if (confirm("Are you sure you want to delete " + customer + "?")) {
	//   txt = "You pressed OK!";
	} else {
	//   txt = "You pressed Cancel!";
	}
	document.getElementById("demo").innerHTML = txt;
  }


