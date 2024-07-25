// change datatable defaults
$.extend($.fn.dataTable.defaults, {
  searching: false,
  paging: false,
  info: false,
  order: [[3, "desc"]],
});

// workaround for now, but works 99.98% of the time
const userAllChalls = "Blupper";

// hardcoded, I know. but this is the only way
// I could thought of getting them ordered.
const categories = [
  "Introduction",
  "General",
  "Symmetric Ciphers",
  "Mathematics",
  "RSA",
  "Diffie-Hellman",
  "Elliptic Curves",
  "Hash Functions",
  "Crypto on the Web",
  "Lattices",
  "Isogenies",
  "ZKPs",
  "Misc",
];

// return a promise of info for a particular user
async function getInfo(username) {
  if (username === "") {
    throw "Blank username.";
  }

  let baseUrl = "https://cryptohack.org/api/user/";
  let response = await fetch(baseUrl + username + "/");
  let info = await response.json();
  if (info.hasOwnProperty("username")) {
    info.solved_challenges = info.solved_challenges.filter(
      (chall) => chall.category !== "CTF Archive"
    );
    return info;
  } else {
    throw "User not found.";
  }
}

// return challenges that were done exclusively by one user
function diffSolves(user1challs, user2challs) {
  solvedNames1 = user1challs.map((data) => data.name);
  solvedNames2 = user2challs.map((data) => data.name);

  // solved only by user 1
  xSolved1 = user1challs.filter((chall) => !solvedNames2.includes(chall.name));

  // solved only by user 2
  xSolved2 = user2challs.filter((chall) => !solvedNames1.includes(chall.name));

  return [xSolved1, xSolved2];
}

// add a chall to a table.
function addChallRow(chall, tableId) {
  let t = $("#" + tableId).DataTable();
  t.row.add([chall.name, chall.category, chall.points, chall.solves]).draw();
}

// update table title with unsolved challs count
function displayUnsolvedChallsTitle(challsLen, tableTitleId) {
  let t = $("#" + tableTitleId)
  t.text(`${challsLen} Unsolved Challenges`);
}

// add a list of challs to a table.
function displayChallList(challs, tableId) {
  let t = $("#" + tableId).DataTable();
  t.clear();
  for (let chall of challs) {
    addChallRow(chall, tableId);
  }
  t.draw();
}

// display challs a user hasn't solved to a table
function displayUnsolvedFromUser(challs, allChalls, tableId, tableTitleId) {
  let diffChalls = diffSolves(allChalls, challs);
  let unsolvedChalls = diffChalls[0];
  displayChallList(unsolvedChalls, tableId);
  displayUnsolvedChallsTitle(unsolvedChalls.length, tableTitleId)
}

// return a string with a trophy template.
// trophyInfo is either [trophy] or [trophy1, trophy2, leftToSolve].
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
    let trophy = trophyInfo[0];
    trophyTemplate = `
    <img src="./img/icons/trophy${trophySuffix[trophy]}.svg" width="40" />`;
  } else {
    let trophy1 = trophyInfo[0];
    let trophy2 = trophyInfo[1];
    let leftToSolve = trophyInfo[2];
    trophyTemplate = `
    <img src="./img/icons/trophy${trophySuffix[trophy1]}.svg" width="40" />
      <div class="trophy-number">
        ${leftToSolve} ->
      </div>
    <img src="./img/icons/trophy${trophySuffix[trophy2]}.svg" width="40" />`;
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
// I think life would be easier if we used some js framework...
function trophyElement(category, trophyInfo) {
  // string to element. best way I could find.
  let newNode = document.createElement("div");
  newNode.innerHTML = infoToTrophy(category, trophyInfo);
  let trophyElementNode = newNode.firstElementChild;
  return trophyElementNode;
}

// same as trophyElement function, but with a simpler interface
function simpleTrophyElement(trophy) {
  let trophySuffix = {
    e: "", // empty trophy
    b: "-bronze", // bronze
    s: "-silver", // silver
    g: "-gold", // gold
    r: "-golder", // golder
  };

  // string to element. best way I could find.
  let newNode = document.createElement("div");
  newNode.innerHTML = `
  <div class="trophy-card-compare">
    <img src="./img/icons/trophy${trophySuffix[trophy]}.svg" width="50" />
  </div>`;
  let trophyElementNode = newNode.firstElementChild;
  return trophyElementNode;
}

// return the number of trophies given the number of
// challenges solved and the total number of challenges
function currentTrophy(noSolved, totalChalls) {
  let frac = noSolved / totalChalls;
  if (frac < 0.25) return "e"; // empty trophy
  if (frac < 0.5) return "b"; // bronze trophy
  if (frac < 0.75) return "s"; // silver trophy
  if (frac < 1.0) return "g"; // gold trophy
  if (frac === 1.0) return "r"; // gold + star ('golder') trophy
}

// get the number of solved and the total number of challs
// in the category. if all were solved, return a array only
// with the star trophy. else, return a array with the current
// trophy, the next trophy and the number of challs needed to go to the next trophy
function trophyStats(noSolved, totalChalls) {
  let curTrophy = currentTrophy(noSolved, totalChalls);
  if (curTrophy === "r") return [curTrophy];
  else {
    for (let neededToSolve = 0; ; neededToSolve++) {
      let nextTrophy = currentTrophy(noSolved + neededToSolve, totalChalls);
      if (nextTrophy !== curTrophy) {
        return [curTrophy, nextTrophy, neededToSolve];
      }
    }
  }
}

// return a js object saying how many challs of each category were solved
function solvedCount(challs) {
  let categoryCount = {};
  for (category of categories) {
    categoryCount[category] = 0;
  }
  for (let chall of challs) {
    categoryCount[chall.category]++;
  }
  return categoryCount;
}

// return a trophy element list with all trophy stats from a user.
function trophyRoad(challs, allChalls) {
  let categoryCount = solvedCount(challs);
  let categoryTotal = solvedCount(allChalls);
  let trophies = [];
  for (let category of categories) {
    curTrophy = trophyStats(categoryCount[category], categoryTotal[category]);
    curTrophyElement = trophyElement(category, curTrophy);
    trophies.push(curTrophyElement);
  }
  return trophies;
}

// add a trophy element to a board
function addTrophy(trophy, boardId) {
  let trophyHolder = document.getElementById(boardId);
  trophyHolder.appendChild(trophy);
}

// display all trophies, evaluated from the `challs` list, to a board.
function displayTrophies(challs, allChalls, boardId) {
  let trophyHolder = document.getElementById(boardId);
  trophyHolder.innerHTML = "";
  trophies = trophyRoad(challs, allChalls);
  for (let trophy of trophies) {
    addTrophy(trophy, boardId);
  }
}

// does <essentially> the same thing as the displayTrophies function,
// but with a simpler interface, as it is just for comparison purposes.
function displayComparisonTrophies(challs, allChalls, boardId) {
  let trophyHolder = document.getElementById(boardId);
  trophyHolder.innerHTML = "";
  let categoryCount = solvedCount(challs);
  let categoryTotal = solvedCount(allChalls);
  let trophies = [];
  for (let category of categories) {
    curTrophy = currentTrophy(categoryCount[category], categoryTotal[category]);
    curTrophyElement = simpleTrophyElement(curTrophy);
    trophies.push(curTrophyElement);
  }
  for (let trophy of trophies) {
    addTrophy(trophy, boardId);
  }
}

// the .info-wrapper class is hidden at the beginning
function showClass(classToShow = "info-wrapper") {
  elementsToShow = document.getElementsByClassName(classToShow);
  for (let element of elementsToShow) {
    element.style.display = "flex";
  }
}

function showError(errorClass = "input-user") {
  let errorElements = document.getElementsByClassName(errorClass);
  for (let el of errorElements) {
    el.style.borderColor = "red";
  }
}

function clearError(errorClass = "input-user") {
  let errorElements = document.getElementsByClassName(errorClass);
  for (let el of errorElements) {
    el.style.borderColor = "";
  }
}

// main function of index.html page.
async function fetchAndDisplayStats(username, trophyId = "tb", challId = "ct", challTitleId = "uc") {
  let searchIcon = document.getElementById("search-icon");
  searchIcon.classList.add("spinning");
  let userInfo, userAllChallsInfo;
  clearError();

  // check for errors
  try {
    [userInfo, userAllChallsInfo] = await Promise.all([
      getInfo(username),
      getInfo(userAllChalls),
    ]);
  } catch {
    showError();
    searchIcon.classList.remove("spinning");
    return;
  }

  let challs = userInfo.solved_challenges;
  let allChalls = userAllChallsInfo.solved_challenges;

  let name = userInfo.username;
  displayTrophies(challs, allChalls, trophyId);
  displayUnsolvedFromUser(challs, allChalls, challId, challTitleId);
  // change chart wrappers to put the user name

  searchIcon.classList.remove("spinning");
  showClass();
}

async function fetchAndDisplayComparison(
  username1,
  username2,
  trophyId = "trophies",
  challId = "exclusive-challs-",
  nameReplace = "user-name-"
) {
  let searchIcon = document.getElementById("search-icon");
  searchIcon.classList.add("spinning");
  clearError();

  let user1Info, user2Info, userAllChallsInfo;

  // check for errors
  try {
    [user1Info, user2Info, userAllChallsInfo] = await Promise.all([
      getInfo(username1),
      getInfo(username2),
      getInfo(userAllChalls),
    ]);
  } catch {
    showError();
    searchIcon.classList.remove("spinning");
    return;
  }

  let challs1 = user1Info.solved_challenges;
  let challs2 = user2Info.solved_challenges;
  let allChalls = userAllChallsInfo.solved_challenges;

  let names = [user1Info.username, user2Info.username];

  displayComparisonTrophies(challs1, allChalls, trophyId + "1");
  displayComparisonTrophies(challs2, allChalls, trophyId + "2");

  let xSolved = diffSolves(challs1, challs2);

  for (let i = 1; i <= 2; i++) {
    displayChallList(xSolved[i - 1], challId + i.toString());
    elementsToReplace = document.getElementsByClassName(
      nameReplace + i.toString()
    );
    for (let toReplace of elementsToReplace) {
      toReplace.innerText = `${names[i - 1]} (${xSolved[i - 1].length})`;
    }
  }
  searchIcon.classList.remove("spinning");
  showClass();
}
