const elEnd = document.getElementById("end");
const elGulp = document.getElementById("gulp");
const elGoal = document.getElementById("goal");
const elDrank = document.getElementById("drank");

elEnd.addEventListener("change", () => {
  chrome.storage.sync.set({ end: elEnd.value }, () => {
    console.log("Time has been set as: " + elEnd.value);
  });
});

elGulp.addEventListener("change", () => {
  chrome.storage.sync.set({ gulp: Number(elGulp.value) }, () => {
    console.log("Gulp has been set as: " + Number(elGulp.value));
  });
});

elGoal.addEventListener("change", () => {
  chrome.storage.sync.set({ goal: Number(elGoal.value) }, () => {
    console.log("Goal has been set as: " + Number(elGoal.value));
  });
});

elDrank.addEventListener("change", () => {
  chrome.storage.sync.set({ drank: Number(elDrank.value) }, () => {
    console.log("Drank has been set as: " + Number(elDrank.value));
  });
});

chrome.storage.sync.get("gulp", (obj) => {
  elGulp.value = Number(obj.gulp);
});

chrome.storage.sync.get("goal", (obj) => {
  elGoal.value = Number(obj.goal);
});

chrome.storage.sync.get("end", (obj) => {
  elEnd.value = obj.end;
});

chrome.storage.sync.get("drank", (obj) => {
  elDrank.value = obj.drank;
});

/**
 * Calculates the time into decimals
 * @param   {string}  time  Must be a String: "15:32"
 * @return  {number}        Returns Time as a decimal
 */
function timeToDecimal(time) {
  const regexTime = /(\d+):(\d+)/g;
  const matches = time.matchAll(regexTime);
  let decimalTime = 1.0;
  for (const [_, hr, min] of matches) {
    decimalTime = Number(hr) + Number(min) * (1 / 60);
  }

  return Number(decimalTime);
}

/**
 * Calculates decimal time into human readable time
 * @param   {number}  decimal   Decimal Time: 15.89
 * @return  {Array.<number>}    Returns an Array with Integers:
 *                              [hour, min, sec]
 */
function decimalToTime(decimal) {
  const hourNums = decimal.toString().split(/\./);
  const hour = Number(hourNums[0]);
  const dec = Number("0." + hourNums[1]);
  let min = Number(dec * 60);
  let sec = 0;

  if (!Number.isInteger(min)) {
    const minNums = min.toString().split(/\./);
    min = Number(minNums[0]);
    minDec = Number("0." + minNums[1]);
    sec = parseInt(minDec * 60);
  }

  return [hour, min, sec];
}

/**
 * Calculates how much time is left
 * between NOW and END
 * @return  {object}  Object contains {Array.<number>}, {string} and {number}
 *                    about the time left
 */
function timeLeft() {
  const end = elEnd.value;
  const date = new Date();
  const now =
    date.getHours() +
    ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

  const nowDec = timeToDecimal(now);
  const endDec = timeToDecimal(end);
  const maxTime = timeToDecimal("23:59");
  let decimal;

  if (endDec < nowDec) {
    decimal = maxTime - nowDec + endDec;
  } else {
    decimal = endDec - nowDec;
  }

  const arrTimeLeft = decimalToTime(decimal);
  const strTimeLeft =
    arrTimeLeft[0] +
    ":" +
    (arrTimeLeft[1] < 10 ? "0" + arrTimeLeft[1] : arrTimeLeft[1]) +
    ":" +
    (arrTimeLeft[2] < 10 ? "0" + arrTimeLeft[2] : arrTimeLeft[2]);

  return {
    arr: arrTimeLeft,
    str: strTimeLeft,
    dec: decimal,
  };
}

const elGulpsNeeded = document.getElementById("gulps-needed");
const elTimeLeft = document.getElementById("time-left");

function gulpsToDo() {
  const gulp = Number(elGulp.value);
  const goal = Number(elGoal.value);
  const drank = Number(elDrank.value);
  const amount = (goal - drank) / gulp;
  const time_left = timeLeft();
  const timeBetweenGulps = time_left.dec / amount;
  const minBetweenGulps = decimalToTime(timeBetweenGulps);
  const milliBetweenGulps =
    minBetweenGulps[0] * 60 * 60 * 1000 +
    minBetweenGulps[1] * 60 * 1000 +
    minBetweenGulps[2] * 1000;

  const strTimeLeft = time_left.arr[0] + "h " + time_left.arr[1] + "min";
  elTimeLeft.innerHTML = strTimeLeft;
  elGulpsNeeded.innerHTML = amount;

  chrome.storage.sync.set({ amount: minBetweenGulps[1] }, () => {
    console.log("Amount has been set as: " + minBetweenGulps[1]);
  });
}

gulpsToDo();

const elRefresh = document.getElementById("refresh");
elRefresh.addEventListener("click", () => {
  gulpsToDo();
});
