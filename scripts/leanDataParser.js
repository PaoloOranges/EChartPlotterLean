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

const compareArrays = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index]);

let ethEur = priceCharts["ETHEUR"];
let oTime = ethEur.Series.O.Values.flatMap(v => v.x);
let hTime = ethEur.Series.H.Values.flatMap(v => v.x);
let lTime = ethEur.Series.L.Values.flatMap(v => v.x);
let cTime = ethEur.Series.C.Values.flatMap(v => v.x);

for(var key in ethEur.Series)
{
    let timeArray = ethEur.Series[key].Values.flatMap(v => v.x);
    console.log(timeArray.length);
    console.log(compareArrays(timeArray, oTime));

}

for(var key in indicators.Series) {
    let timeArray = indicators.Series[key].Values.flatMap(v => v.x);
    console.log(timeArray.length);
    console.log(compareArrays(timeArray, oTime));

  }
console.log(indicators.Series[0]);
console.log(indicators);

class LeanDataParser
{
    constructor()
    {
        this.charts = jsonData.Charts;
        this.indicators = charts.Indicators;

        var symbolsKey = Object.keys(charts);
        symbolsKey = symbolsKey.filter(key => key.startsWith(SymbolChartPrefix));

        let priceCharts = {};

        symbolsKey.forEach(key => {
            symbolKey = key.replace(SymbolChartPrefix, "");
            let chart = charts[key];
            chart.Name = symbolKey;
            priceCharts[symbolKey] = chart;
        });

        this.priceCharts = priceCharts;
    }

    getSymbolKeys() 
    {
        return Object.keys(this.priceCharts);;
    }

    getPriceCharts()
    {
        return this.priceCharts;
    }

    getPriceChart(symbol)
    {
        return this.priceCharts[symbol];
    }

    getTimesFor(symbol)
    {
        let priceChart = this.getPriceChart(symbol);
        let time = priceChart.Series.C.Values.flatMap(v => v.x);
        return time;
    }

    getOHLCValuesFor(symbol)
    {
        let priceChart = this.getPriceChart(symbol);

        const valuesLength = priceChart.Series.O.Values.length;
        let result = []
        for(let i=0; i < valuesLength; i++)
        {
            let row = [priceChart.Series.O.Values[i].y, priceChart.Series.H.Values[i].y, priceChart.Series.L.Values[i].y, priceChart.Series.C.Values[i].y];
            result.push(row);
        }

        return result;
    }
}

let parser = new LeanDataParser();
let temp1 = parser.getPriceCharts();
let temp2 = parser.getPriceChart(parser.getSymbolKeys()[0]);
let temp3 = parser.getTimesFor(parser.getSymbolKeys()[0]);
let temp4 = parser.getOHLCValuesFor(parser.getSymbolKeys()[0]);
console.log("End")