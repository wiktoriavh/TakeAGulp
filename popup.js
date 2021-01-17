const elEnd = document.getElementById("end");
const elGulp = document.getElementById("gulp");
const elGoal = document.getElementById("goal");
const elDrank = document.getElementById("drank");

elEnd.addEventListener("change", () => {
  chrome.storage.sync.set({ end: elEnd.value }, () => {
    console.log("Time has been set as: " + elEnd.value);
    getAndSetInfo();
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

/**
 * Get information from the storage to set them in the inputs
 * and calculate time between gulps as well as
 * set the date when you reset the drank value
 */
function getAndSetInfo() {
  chrome.storage.sync.get(["gulp", "goal", "end", "drank"], (obj) => {
    elEnd.value = obj.end;
    elDrank.value = obj.drank;
    elGulp.value = Number(obj.gulp);
    elGoal.value = Number(obj.goal);

    const gulp = obj.gulp;
    const goal = obj.goal;
    const drank = obj.drank;
    const end = obj.end.split(":");

    const amount = (goal - drank) / gulp;
    const time_left = timeLeft();
    const timeBetweenGulps = time_left.dec / amount;
    const minBetweenGulps = decimalToTime(timeBetweenGulps);

    const now = new Date();
    const resetAt = new Date();
    resetAt.setHours(end[0]);
    resetAt.setMinutes(end[1]);
    resetAt.setSeconds(0);

    if (resetAt < now) {
      resetAt.setDate(resetAt.getDate() + 1);
    }

    chrome.storage.sync.set(
      {
        amount: minBetweenGulps[1],
        reset: resetAt.toISOString(),
      },
      () => {
        console.log("Amount has been set as: " + minBetweenGulps[1]);
      }
    );
  });
}

getAndSetInfo();

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
    let minDec = Number("0." + minNums[1]);
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
