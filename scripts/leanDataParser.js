const jsonData = require('../data/data.json');

const SymbolChartPrefix = "BARS_";

let charts = jsonData.Charts;
let indicators = charts.Indicators;

var symbolsKey = Object.keys(charts);
symbolsKey = symbolsKey.filter(key => key.startsWith(SymbolChartPrefix));

console.log(indicators);