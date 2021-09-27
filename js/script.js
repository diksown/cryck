$.extend($.fn.dataTable.defaults, {
  searching: false,
  paging: false,
  info: false,
});

// hardcoded, I know. but this is the only way
//I could thought of getting them ordered.
const categories = [
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
  let diffChalls = await diffSolves(userAllChalls, username);
  let unsolvedChalls = diffChalls[0];
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
// trophyInfo is either [trophy] or [trophy1, trophy2, leftToSolve]
function infoToTrophy(category, trophyInfo) {
  let trophyTemplate;
  let trophySuffix = {
    e: "", // empty trophy
    b: "-bronze", // bronze
    s: "-silver", // silver
    g: "-gold", // gold
    r: "-golder", // golder
  };

  if (trophyInfo.length === 1) {
    let trophy = trophyTemplate[0];
    trophyTemplate = `
    <img src="/img/icons/trophy${trophySuffix(trophy)}.svg" width="40" />`;
  } else {
    let trophy1 = trophyTemplate[0];
    let trophy2 = trophyTemplate[1];
    let leftToSolve = trophyTemplate[2];
    trophyTemplate = `
    <img src="/img/icons/trophy${trophySuffix(trophy1)}.svg" width="40" />
      <div class="trophy-number">
        ${leftToSolve} 🡒
      </div>
    <img src="/img/icons/trophy${trophySuffix(trophy2)}.svg" width="40" />`;
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
function trophyElement(category, trophyInfo) {
  // string to element. best way I could find.
  let newNode = document.createElement("div");
  newNode.innerHTML = infoToTrophy(category, trophyInfo);
  let trophyElementNode = newNode.firstElementChild;
  return trophyElementNode;
}

// generates a random trophy. useful for mocking.
function randomTrophy() {
  let tList = ["e", "b", "s", "g", "r"];
  let t1 = tList[Math.floor(Math.random() * tList.length)];
  let t2 = tList[Math.floor(Math.random() * tList.length)];
  let toSolve = Math.floor(Math.random() * 100);
  let category = categories[Math.floor(Math.random() * categories.length)];
  return trophyElement(category, t1, t2, toSolve);
}

// return the number of trophies given the number of
// challenges solved and the total number of challenges
function currentTrophy(noSolved, totalChalls) {
  let frac = noSolved / totalChalls;
  if (frac < 0.25) return "e"; // empty trophy
  if (frac < 0.5) return "b"; // bronze trophy
  if (frac < 0.75) return "s"; // silver trophy
  if (frac < 1.0) return "g"; // gold trophy
  if (frac == 1.0) return "r"; // gold + star ('golder') trophy
}

// get the number of solved and the total number of challs
// in the category. if all were solved, return a array only
// with the star trophy. else, return a array with the current
// trophy, the number of challs needed to go to the next trophy
// and the next trophy.
function trophyStats(noSolved, totalChalls) {
  let curTrophy = currentTrophy(noSolved, totalChalls);
  if (curTrophy === "r") return [curTrophy];
  else {
    for (let neededToSolve = 0; ; neededToSolve++) {
      let nextTrophy = currentTrophy(noSolved + neededToSolve);
      if (nextTrophy !== curTrophy) {
        return [curTrophy, nextTrophy, neededToSolve];
      }
    }
  }
}

// return a js object saying how many challs of each category were solved
function solvedCount(challs) {
  let categoryCount = {};
  for (category in categories) {
    categoryCount[category] = 0;
  }
  for (chall in challs) {
    categoryCount[chall.category]++;
  }
  return categoryCount;
}

// return a trophy list with all trophies of a user.
function trophyRoad(challs, allChalls) {
  let categoryCount = solvedCount(challs);
  let categoryTotal = solvedCount(allChalls);
  let trophies = [];
  for (category in categories) {
    curTrophy = trophyStats(categoryCount[category], categoryTotal[category]);
    curTrophyElement = trophyElement(category, curTrophy);
    trophies.push(curTrophyElement);
  }
  return trophies;
}

function addTrophy(challs, tableId) {
  let trophyHolder = document.getElementById(tableId);
  trophyHolder.appendChild(randomTrophy());
}
