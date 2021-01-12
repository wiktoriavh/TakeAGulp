/**
 * @name          TakeAGulp
 * @desc          Chrome Extension to remind the user to take a gulp of water
 *
 * @author        Wiktoria Mielcarek <w.mielcarek@braweria.de>
 * @link          https://braweria.de/
 * @version       0.9.0-Beta
 * @copyright     2021 Wiktoria (Braweria) Mielcarek
 * @license       GNU GPLv3
 * @repository    https://github.com/Braweria/TakeAGulp
 */

let lastTabId = 0;
let congratulations = false;

/**
 * Send a Message with the given Argument
 * @param   {object}       storage        The Object to be sent
 */
function sendMessage(storage) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log(tabs[0].id);
    console.log(tabs[0].title);
    tabs[0].id === undefined
      ? (lastTabId = lastTabId)
      : (lastTabId = tabs[0].id);

    const port = chrome.tabs.connect(lastTabId);

    port.postMessage(storage);
  });
}

/**
 * Create an interval Alarm
 * @param   {number}       period            The timeframe between each alarm in minutes
 */
function createPeriodAlarm(period) {
  chrome.alarms.create("TakeAGulp", {
    periodInMinutes: period,
  });

  console.log("create alarm of " + period + " minutes");

  chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("ALARM!");
    if (alarm.name === "TakeAGulp") {
      chrome.storage.sync.get(["gulp", "drank"], (obj) => {
        let storage;
        storage = obj;
        sendMessage(storage);
      });
    }
  });
}

chrome.storage.sync.get("amount", (obj) => {
  createPeriodAlarm(obj.amount);
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
    const minDec = Number("0." + minNums[1]);
    sec = parseInt(minDec * 60);
  }

  return [hour, min, sec];
}

const now = new Date();
const today = new Date();
today.setSeconds(0);
const nextDay = new Date().setDate(now.getDate() + 1);
const tomorrow = new Date(nextDay);
tomorrow.setSeconds(0);

chrome.storage.sync.get("end", (obj) => {
  let timeEnd = obj.end; // string 9:00
  const timeNow =
    now.getHours() +
    ":" +
    (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes());

  const timeEndDec = timeToDecimal(timeEnd);
  const timeNowDec = timeToDecimal(timeNow);

  if (timeEndDec < timeNowDec) {
    timeEnd = decimalToTime(timeEndDec);
    tomorrow.setHours(timeEnd[0]);
    timeEnd[1] === NaN
      ? tomorrow.setMinutes(0)
      : tomorrow.setMinutes(timeEnd[1]);
    checkIfEndTime(now, tomorrow);
  } else {
    timeEnd = decimalToTime(timeEndDec);
    today.setHours(timeEnd[0]);
    timeEnd[1] === NaN ? today.setMinutes(0) : today.setMinutes(timeEnd[1]);
    checkIfEndTime(now, today);
  }
});

function checkIfEndTime(start, ending) {
  start = start.getTime();
  ending = ending.getTime();

  if (start >= ending) {
    chrome.alarms.create("endReached", {
      when: ending,
    });
  } else {
    chrome.alarms.create("endReached", {
      when: ending,
    });
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "endReached") {
      chrome.storage.sync.set({ drank: 0 }, () => {
        sendMessage({ reset: true });
        console.log("Drank has been reset to 0.");
      });
    }
  });
}
