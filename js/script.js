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

function randomChall() {
  let categories = [
    "Introduction",
    "General",
    "Mathematics",
    "Symmetric Ciphers",
    "RSA",
    "Diffie-Hellman",
    "Elliptic Curves",
    "Hash Functions",
    "Crypto on the Web",
    "Misc",
  ];
  let adjs = [
    "Portly",
    "Posh",
    "Positive",
    "Possible",
    "Potable",
    "Powerful",
    "Powerless",
    "Practical",
    "Precious",
    "Present",
    "Prestigious",
    "Pretty",
    "Precious",
    "Previous",
    "Pricey",
  ];
  let nouns = [
    "Paper",
    "Paperback",
    "Parade",
    "Parallelogram",
    "Parcel",
    "Parent",
    "Parentheses",
    "Park",
    "Parrot",
    "Parsnip",
    "Part",
    "Particle",
    "Partner",
    "Partridge",
    "Party",
    "Passbook",
    "Passenger",
    "Passive",
    "Pasta",
  ];
  let name =
    adjs[Math.floor(Math.random() * adjs.length)] +
    " " +
    adjs[Math.floor(Math.random() * adjs.length)] +
    " " +
    nouns[Math.floor(Math.random() * nouns.length)];
  let category = categories[Math.floor(Math.random() * categories.length)];
  let points = Math.floor(Math.random() * 10) * 25;
  let solves = Math.floor(Math.random() * 100) * 25;
  return {
    name: name,
    points: points,
    category: category,
    points: points,
    solves: solves,
  };
}

function addChallRow(chall, tableId) {
  let table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
  let row = table.insertRow();

  let challName = row.insertCell();
  let category = row.insertCell();
  let points = row.insertCell();
  let solves = row.insertCell();

  let a = createChallNameLink(chall);
  challName.appendChild(a);
  challName.innerHTML = chall.name;
  category.innerHTML = chall.category;
  points.innerHTML = chall.points;
  solves.innerHTML = chall.solves;
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
/*
let userInput = document.getElementById("username-input");

userInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    let user = document.getElementById("username-input").value;
    // workaround for now, but correct 99.98% of the time
    let userAllChalls = "hellman";
    displayExclusiveChalls(userAllChalls, user);
  }
});
*/

// return a string with a trophy template
function infoToTrophy(category, trophy1, trophy2, leftToSolve) {
  let trophyTemplate = `
  <div class="trophy-card">
    <div class="trophy-category">
      ${category}
    </div>
    <div class="trophy-content">
      <img src="/img/icons/trophy${trophy1}.svg" width="40" />
      <div class="trophy-number">
        ${leftToSolve} 🡒
      </div>
      <img src="/img/icons/trophy${trophy2}.svg" width="40" />
    </div>
  </div>`;
  return trophyTemplate;
}

// return a trophy DOM element with the given parameters
// I think life would be easier if it was some js framework
function trophyElement(category, t1, t2, leftToSolve) {
  trophySuffix = {
    e: "", // empty trophy
    b: "-bronze", // bronze
    s: "-silver", // silver
    g: "-gold", // gold
    r: "-golder", // golder
  };

  let t1Suf = trophySuffix[t1];
  let t2Suf = trophySuffix[t2];

  // string to element. best way I could find.
  let newNode = document.createElement("div");
  newNode.innerHTML = infoToTrophy(category, t1Suf, t2Suf, leftToSolve);
  let trophyElementNode = newNode.firstElementChild;
  return trophyElementNode;
}

function randomTrophy() {
  let tList = ["e", "b", "s", "g", "r"];
  let categories = [
    "Introduction",
    "General",
    "Mathematics",
    "Symmetric Ciphers",
    "RSA",
    "Diffie-Hellman",
    "Elliptic Curves",
    "Hash Functions",
    "Crypto on the Web",
    "Misc",
  ];
  let t1 = tList[Math.floor(Math.random() * tList.length)];
  let t2 = tList[Math.floor(Math.random() * tList.length)];
  let toSolve = Math.floor(Math.random() * 100);
  let category = categories[Math.floor(Math.random() * categories.length)];
  return trophyElement(category, t1, t2, toSolve);
}

trophyHolder = document.getElementById("tb");
for (let i = 0; i < 10; i++) {
  trophyHolder.appendChild(randomTrophy());
}

$.extend($.fn.dataTable.defaults, {
  searching: false,
  paging: false,
  info: false,
});

for (let i = 0; i < 10; i++) {
  addChallRow(randomChall(), "ct");
}

$(document).ready(function () {
  $("#ct").DataTable();
});
