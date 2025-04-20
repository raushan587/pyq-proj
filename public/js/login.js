const inputs = document.querySelectorAll(".input");


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});


function validatePassword(event) {
    let passField = document.getElementById("password"); // Get password input

    if (passField.value.length < 8) {
        alert("Minimum 8 characters required for the password!");
       // passField.focus(); // Keep focus on password input
        event.preventDefault(); // Prevent form submission
    }
}