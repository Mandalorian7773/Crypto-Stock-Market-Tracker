function calculateSMA(dataArray, period) {
  if (dataArray.length < period) return null;
  
  const sum = dataArray.slice(0, period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

function calculateEMA(dataArray, period) {
  if (dataArray.length < period) return null;
  
  let ema = dataArray[0];
  const multiplier = 2 / (period + 1);
  
  for (let i = 1; i < period; i++) {
    ema = (dataArray[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateROI(initialAmount, startPrice, currentPrice) {
  return ((currentPrice - startPrice) / startPrice) * 100;
}

module.exports = {
  calculateSMA,
  calculateEMA,
  calculateROI
};