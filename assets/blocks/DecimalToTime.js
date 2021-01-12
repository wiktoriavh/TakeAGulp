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

export { decimalToTime as default };
