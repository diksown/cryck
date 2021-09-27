$.extend($.fn.dataTable.defaults, {
  searching: false,
  paging: false,
  info: false,
});

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

  solvedNames1 = solvedChalls1.map((data) => data.name);
  solvedNames2 = solvedChalls2.map((data) => data.name);

  // solved only by user 1
  xSolved1 = solvedChalls1.filter(
    (chall) => !solvedNames2.includes(chall.name)
  );

  // solved only by user 2
  xSolved2 = solvedChalls2.filter(
    (chall) => !solvedNames1.includes(chall.name)
  );

  return [xSolved1, xSolved2];
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

// generate a random chall. useful for testing.
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
  let adjs = ["Portly", "Posh", "Positive", "Possible", "Potable"];
  let nouns = ["Paper", "Paperback", "Parade", "Parallelogram", "Parcel"];
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

// add a chall to a table.
function addChallRow(chall, tableId) {
  let t = $("#" + tableId).DataTable();
  t.row.add([chall.name, chall.category, chall.points, chall.solves]).draw();
}

// add a list of challs to a table.
function displayChallList(challs, tableId) {
  let t = $("#" + tableId).DataTable();
  t.clear();
  for (let chall of challs) {
    addChallRow(chall, tableId);
  }
}

// display challs a user hasn't solved to a table
async function displayUnsolvedFromUser(username, tableId) {
  // workaround for now, but correct 99.98% of the time
  let userAllChalls = "hellman";
  let unsolvedChalls = await diffSolves(userAllChalls, username)[0];
  displayChallList(unsolvedChalls, tableId);
}

// display exclusive challs from each of the two users in each table.
async function displayExclusiveChalls(user1, tableId1, user2, tableId2) {
  let challsFrom2Users = await diffSolves(user1, user2);
  let challList1 = challsFrom2Users[0];
  let challList2 = challsFrom2Users[1];
  displayChallList(challList1, tableId1);
  displayChallList(challList2, tableId2);
}

// return a string with a trophy template.
// the trophy2 and leftToSolve are optional,
// if they aren't provided, only trophy1 is displayed.
function infoToTrophy(category, trophy1, trophy2, leftToSolve) {
  let trophyTemplate;
  if (trophy2 === undefined) {
    trophyTemplate = `
    <img src="/img/icons/trophy${trophy1}.svg" width="40" />`;
  } else {
    trophyTemplate = `
    <img src="/img/icons/trophy${trophy1}.svg" width="40" />
      <div class="trophy-number">
        ${leftToSolve} 🡒
      </div>
    <img src="/img/icons/trophy${trophy2}.svg" width="40" />`;
  }

  let trophyCardTemplate = `
  <div class="trophy-card">
    <div class="trophy-category">
      ${category}
    </div>
    <div class="trophy-content">
      ${trophyTemplate}
    </div>
  </div>`;
  return trophyCardTemplate;
}

// return a trophy DOM element with the given parameters
// I think life would be easier if we used some js framework
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

// generates a random trophy. useful for mocking.
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
