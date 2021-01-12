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

export default timeToDecimal;
