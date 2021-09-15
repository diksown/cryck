// return a promise of info for a particular user
async function getInfo(username) {
  let baseUrl = "https://cryptohack.org/api/user/";
  const response = await fetch(baseUrl + username);
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

  // solved by only user 1
  xSolved1 = solvedChalls1.filter(
    (chall) => !solvedNames2.includes(chall.name)
  );
  xSolved2 = solvedChalls2.filter(
    (chall) => !solvedNames1.includes(chall.name)
  );
  console.log(xSolved1);
}

function clearTable() {
  document.getElementById("challs-table-content").innerHTML = "";
}

function addChallRow(chall) {
  let table = document.getElementById("challs-table");
  let row = table.insertRow();

  let challName = row.insertCell();
  let category = row.insertCell();
  let points = row.insertCell();
  let solves = row.insertCell();

  challName.innerHTML = chall.name;
  category.innerHTML = chall.category;
  points.innerHTML = "⭐ " + chall.points;
  solves.innerHTML = "?";
}

function show(prom) {
  prom.then((data) => console.log(data));
}

// true ~99.97% of the time
let allChallenges = getSolved("hellman");

async function test() {
  let RsaChall = {
    name: "Break RSA",
    category: "RSA",
    points: "666",
  };

  let EccChall = {
    name: "Flat circle go brr",
    category: "ECC",
    points: "0",
  };
  await new Promise((r) => setTimeout(r, 1000));
  clearTable();
  await new Promise((r) => setTimeout(r, 1000));
  addChallRow(RsaChall);
  await new Promise((r) => setTimeout(r, 1000));
  addChallRow(EccChall);
}

//test();
