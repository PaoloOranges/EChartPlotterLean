const jsonData = require('../data/data.json');

const SymbolChartPrefix = "BARS_";

let charts = jsonData.Charts;
let indicators = charts.Indicators;

var symbolsKey = Object.keys(charts);
symbolsKey = symbolsKey.filter(key => key.startsWith(SymbolChartPrefix));

let priceCharts = {};

symbolsKey.forEach(key => {
    symbolKey = key.replace(SymbolChartPrefix, "");
    let chart = charts[key];
    chart.Name = symbolKey;
    priceCharts[symbolKey] = chart;
});

console.log(indicators);