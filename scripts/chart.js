
var dataDom = document.getElementById('data');
var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

const SymbolChartPrefix = "BARS_";

const CHARTS = jsonData.Charts;
const ORDERS = jsonData.Orders;

const INDICATORS = CHARTS.Indicators.Series;
const SYMBOLS_KEYS = Object.keys(CHARTS).filter(key => key.startsWith(SymbolChartPrefix));
const INDICATORS_KEYS = Object.keys(INDICATORS).filter(key => key);


function getPriceCharts()
{
    let returnPriceChart = {};
    SYMBOLS_KEYS.forEach(key => {
        symbolKey = key.replace(SymbolChartPrefix, "");
        let chart = CHARTS[key];
        chart.Name = symbolKey;
        returnPriceChart[symbolKey] = chart;
    });
    
    return returnPriceChart;
}

function getIndicatorsArray()
{
    let returnIndicatorsArray = [];

    Object.keys(INDICATORS).filter(key => {
        returnIndicatorsArray.push(INDICATORS[key]);
      });

    return returnIndicatorsArray;
}

let priceCharts = getPriceCharts();
let indicatorsArray = getIndicatorsArray();


function getTimeArray(symbol)
{
  const priceChart = priceCharts[symbol];
  return priceChart.Series.C.Values.flatMap(v => v.x * 1000);
}

function convertTimeArrayToStrings(timeArray) {
  const times = timeArray.flatMap(v => {
    const date = new Date(v);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dateString = day.toString().padStart(2, 0) + "/" + month.toString().padStart(2, 0) + "/" + year.toString() + " " + hour.toString().padStart(2, 0) + ":" + minute.toString().padStart(2, 0);
    return dateString;
  });
  return times;
}

function getValuesForIndicator(indicator)
{
  values = indicator.Values;
  var time = priceCharts['ETHEUR'].Series.O.Values[0].x;
  values = values.filter(v => v.x >= time);
  return values.map(v => v.y != 0 ? v.y : '-');
}

function getOHLCValuesFor(symbol) {
  const priceChart = priceCharts[symbol];

  const valuesLength = priceChart.Series.O.Values.length;
  let result = []
  for (let i = 0; i < valuesLength; i++) {
    let row = [priceChart.Series.O.Values[i].y, priceChart.Series.H.Values[i].y, priceChart.Series.L.Values[i].y, priceChart.Series.C.Values[i].y];
    result.push(row);
  }

  return result;
}

function getOrderDataFor(symbol, timeArray, operation)
{
  let direction = operation == "buy" ? 0 : 1;

  const orderKeys = Object.keys(ORDERS);
      let orders = [];
      orderKeys.forEach(key => {
        orders.push(ORDERS[key]);
      });
      orders = orders.filter(o => o.Symbol.Value == symbol); 
      orders = orders.filter(o => o.Direction == direction);
      
      let orderData = new Array(timeArray.length);

      let returnArray = []
      orders.forEach(o => {
        const oTime = Date.parse(o.Time);
        const indexInTime = timeArray.findIndex(t => t == oTime);
        //console.log(indexInTime);
        returnArray.push([indexInTime, o.Price]);
      });

      return returnArray;
}

function getBuyOrderDataFor(symbol, timeArray)
{
  return getOrderDataFor(symbol, timeArray, "buy");
}

function getSellOrderDataFor(symbol, timeArray)
{
  return getOrderDataFor(symbol, timeArray, "sell");
}

const timeArray = getTimeArray('ETHEUR');
const timeStrings = convertTimeArrayToStrings(timeArray);
const ohlcData = getOHLCValuesFor('ETHEUR');
const buyOrderData = getBuyOrderDataFor('ETHEUR', timeArray);
const sellOrderData = getSellOrderDataFor('ETHEUR', timeArray);

function getDataForLegend()
{
  return ['ETHEUR'].concat(indicatorsArray.map(x => x.Name));
}

function getDataForSeries()
{
  return [
    {
      name: 'ETHEUR',
      type: 'candlestick',
      data: ohlcData,
      itemStyle: {
        color: upColor,
        color0: downColor,
        borderColor: upBorderColor,
        borderColor0: downBorderColor
      }//,
      // markLine: {
      //   symbol: ['none', 'none'],
      //   data: [
      //     [
      //       {
      //         name: 'from lowest to highest',
      //         type: 'min',
      //         valueDim: 'lowest',
      //         symbol: 'circle',
      //         symbolSize: 10,
      //         label: {
      //           show: false
      //         },
      //         emphasis: {
      //           label: {
      //             show: false
      //           }
      //         }
      //       },
      //       {
      //         type: 'max',
      //         valueDim: 'highest',
      //         symbol: 'circle',
      //         symbolSize: 10,
      //         label: {
      //           show: false
      //         },
      //         emphasis: {
      //           label: {
      //             show: false
      //           }
      //         }
      //       }
      //     ],
      //     {
      //       name: 'min line on close',
      //       type: 'min',
      //       valueDim: 'close'
      //     },
      //     {
      //       name: 'max line on close',
      //       type: 'max',
      //       valueDim: 'close'
      //     }
      //   ]
      // }
    },
  ].concat(indicatorsArray.map(
    (x) => 
    {
      return {
        name: x.Name,
        type: 'line',
        data: getValuesForIndicator(x),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      }
    }
    )).concat([
        {
            type: 'scatter',
            data: buyOrderData,
            symbol: 'triangle',
            color: 'green'
        }]
    ).concat([
      {
          type: 'scatter',
          data: sellOrderData,
          symbol: 'diamond',
          color: 'red'
      }]
    );
}

option = {
  title: {
    text: 'Lean Result',
    left: 0
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: getDataForLegend()
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'category',
    data: timeStrings,
    boundaryGap: false,
    axisLine: { onZero: false },
    splitLine: { show: false },
    min: 'dataMin',
    max: 'dataMax'
  },
  yAxis: {
    scale: true,
    splitArea: {
      show: true
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 50,
      end: 100
    },
    {
      show: true,
      type: 'slider',
      top: '90%',
      start: 50,
      end: 100
    }
  ],
  series: getDataForSeries()
};

option && myChart.setOption(option);