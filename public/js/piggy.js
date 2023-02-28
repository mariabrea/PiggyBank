function openForm() {
    document.getElementById("myForm").style.display = "block";
	document.getElementById("buttonTransaction").disabled = True;
};

function closeForm() {
	document.getElementById("myForm").style.display = "none";
	document.getElementById("buttonTransaction").disabled = False;
};


