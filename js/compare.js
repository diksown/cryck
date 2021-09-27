function submit() {
  username1 = document.getElementById("username1").value;
  username2 = document.getElementById("username2").value;

  fetchAndDisplayComparison(username1, username2);
}

// use button and enter
let btn = document.getElementById("btn");
btn.addEventListener("click", () => submit());

for (let i = 1; i <= 2; i++) {
  let userInput = document.getElementById("username" + i.toString());
  userInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });
}
