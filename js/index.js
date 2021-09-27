function submit() {
  username = document.getElementById("username").value;
  fetchAndDisplayStats(username);
}

// use button and enter
let btn = document.getElementById("btn");
let userInput = document.getElementById("username");

btn.addEventListener("click", () => submit());

userInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    submit();
  }
});
