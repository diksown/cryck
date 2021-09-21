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
    
  }
  
  function createChallNameLink(chall) {
    let baseUrl = "https://cryptohack.org/challenges/";
  
    let categoryLinkMap = {
      Introduction: "introduction",
      General: "general",
      Mathematics: "maths",
      "Symmetric Ciphers" : "aes",
      RSA: "rsa",
      "Diffie-Hellman": "diffie-hellman",
      "Elliptic Curves": "ecc",
      "Hash Functions": "hashes",
      "Crypto on the Web": "web",
      Misc: "misc"
    };
  
    let a = document.createElement("a");
    var text = document.createTextNode(chall.name);
    a.append(text);
    a.target = "_blank";
    a.href = baseUrl + categoryLinkMap[chall.category];
  
    return a;
  }
  
  function clearTable(index) {
    document.getElementById("challs-table-content" + index).innerHTML = "";
  }
  
  function addChallRow(chall, index) {
    let table = document.getElementById("challs-table-content" + index);
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
  
  async function displayChallList(challs, index) {
    if (challs) {
      clearTable(index);
      challs = challs.sort((a, b) => {
        diff = parseInt(a.points) - parseInt(b.points);
        return diff;
      });
      for (let chall of challs) {
        addChallRow(chall, index);
      }
    }
  }

  function add_red_border_input(i) {
    var inp = document.getElementById('username-input'+i);
    // inp.style.outline = 'none';
    inp.style.border = '3px solid red';
  }

  function print_error(i) {
    var err = document.getElementById('error'+i);
    err.style.color = 'red';
    err.innerHTML = 'User not found!';
  }

  function reset_errors() {
    document.getElementById('error1').innerHTML = '';
    document.getElementById('error2').innerHTML = '';
    document.getElementById('username-input1').style.outline = '';
    document.getElementById('username-input1').style.border = '3px solid black';
    document.getElementById('username-input2').style.outline = '';
    document.getElementById('username-input2').style.border = '3px solid black';
  }

  function error_check(solved1, solved2) {
    if (!solved1 || !solved2) {
      clearTable(1); clearTable(2);

      if (!solved1) {
        add_red_border_input(1);
        print_error(1);
      }
      if (!solved2) {
        add_red_border_input(2);
        print_error(2);
      }
      
      return true;
    }

    return false;
  }

  function users_empty(user1, user2) {
    if (user1 == '' || user2 == '') {
      clearTable(1); clearTable(2);

      if (user1 == '') {
        add_red_border_input(1);
      }
      if (user2 == '') {
        add_red_border_input(2);
      }

      return true;
    }
    return false;
  }

  async function displayExclusiveChalls(user1, user2) {
    if (users_empty(user1, user2)) {
      return;
    }

    solvedChalls1 = await getSolved(user1);
    solvedChalls2 = await getSolved(user2);

    if (error_check(solvedChalls1, solvedChalls2)) {
      return;
    }

    solvedNames1 = solvedChalls1.map((data) => data.name);
    solvedNames2 = solvedChalls2.map((data) => data.name);

    // solved only by user 1
    xSolved1 = solvedChalls1.filter(
      (chall) => !solvedNames2.includes(chall.name)
    );

    displayChallList(xSolved1, 1);

    // solved only by user 2
    xSolved2 = solvedChalls2.filter(
      (chall) => !solvedNames1.includes(chall.name)
    );

    displayChallList(xSolved2, 2);
  }
  

  let userInput1 = document.getElementById('username-input1');
  let userInput2 = document.getElementById('username-input2');
  let compareBtn = document.getElementById('compare-btn');
  // userInput1.addEventListener("keyup", (event) => {
  //   if (event.key === "Enter") {
  //     let user = document.getElementById("username-input1").value;
  //     document.getElementById('username-input1').style.border = 'none';
  //     // workaround for now, but correct 99.98% of the time
  //     let userAllChalls = "hellman";
  //     displayExclusiveChalls(userAllChalls, user);
  //   }
  // });
  
  compareBtn.addEventListener("click", function() { compare() });
  
  async function compare() {
    reset_errors(); 

    let user1 = userInput1.value;
    let user2 = userInput2.value;

    displayExclusiveChalls(user1, user2);
  }
  