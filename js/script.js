// return a promise of info for a particular user
async function getInfo(username) {
  let baseUrl = "https://cryptohack.org/api/user/";
  const response = await fetch(baseUrl + username + "/");
  return await response.json();
}

// return a promise of solved challenges
async function getSolved(username) {
  const data = await getInfo(username);
  return data.solved_challenges;
}

// return challenges that were done exclusively by one user
async function diffSolves(user1, user2) {
  solvedChalls1 = await getSolved(user1);
  solvedChalls2 = await getSolved(user2);
  
  if (!solvedChalls2) {
    clearTable();
    return;
  }

  solvedNames1 = solvedChalls1.map((data) => data.name);
  solvedNames2 = solvedChalls2.map((data) => data.name);

  // solved only by user 1
  xSolved1 = solvedChalls1.filter(
    (chall) => !solvedNames2.includes(chall.name)
  );
  /* 
  // solved only by user 2
  xSolved2 = solvedChalls2.filter(
    (chall) => !solvedNames1.includes(chall.name)
  );
  */
  return xSolved1;
}

function createChallNameLink(chall) {
  let baseUrl = "https://cryptohack.org/challenges/";

  let categoryLinkMap = {
    Introduction: "introduction",
    General: "general",
    Mathematics: "maths",
    "Symmetric Ciphers": "aes",
    RSA: "rsa",
    "Diffie-Hellman": "diffie-hellman",
    "Elliptic Curves": "ecc",
    "Hash Functions": "hashes",
    "Crypto on the Web": "web",
    Misc: "misc",
  };

  let a = document.createElement("a");
  var text = document.createTextNode(chall.name);
  a.append(text);
  a.target = "_blank";
  a.href = baseUrl + categoryLinkMap[chall.category];

  return a;
}

function clearTable() {
  document.getElementById("challs-table-content").innerHTML = "";
}

function addChallRow(chall) {
  let table = document.getElementById("challs-table-content");
  let row = table.insertRow();

  let challName = row.insertCell();
  let category = row.insertCell();
  let points = row.insertCell();
  //let solves = row.insertCell();

  let a = createChallNameLink(chall);
  challName.appendChild(a);
  category.innerHTML = chall.category;
  points.innerHTML = "⭐ " + chall.points;
  //solves.innerHTML = "?"; // uncomment after implemented
}

async function displayChallList(challs) {
  if (challs) {
    clearTable();
    challs = challs.sort((a, b) => {
      diff = parseInt(a.points) - parseInt(b.points);
      return diff;
    });
    for (let chall of challs) {
      addChallRow(chall);
    }
  }
}

async function displayChallsFromUser(username) {
  challList = await getSolved(username);
  displayChallList(challList);
}

async function displayExclusiveChalls(user1, user2) {
  challList = await diffSolves(user1, user2);
  displayChallList(challList);
}

let userInput = document.getElementById('username-input');

userInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    let user = document.getElementById("username-input").value;
    // workaround for now, but correct 99.98% of the time
    let userAllChalls = "hellman";
    displayExclusiveChalls(userAllChalls, user);
  }
});
