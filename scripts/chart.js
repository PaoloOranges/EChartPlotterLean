
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

    let indicatorKeys = Object.keys(INDICATORS);
    
    indicatorKeys.forEach(key => {
        if(!key.startsWith("MACD"))
        {
          returnIndicatorsArray.push(INDICATORS[key]);
        }
      });

    return returnIndicatorsArray;
}

function getMACD()
{
  let indicatorKeys = Object.keys(INDICATORS);
  for(const k in indicatorKeys)
  {
    const key = indicatorKeys[k];
    if(key.startsWith("MACD"))
    {
      return INDICATORS[key];
    }
  }
}

let priceCharts = getPriceCharts();
let indicatorsArray = getIndicatorsArray();
let macd = getMACD();

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
  var time = priceCharts[SYMBOL].Series.O.Values[0].x;
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

function getVolumeFor(symbol)
{
  const priceChart = priceCharts[symbol];
  const values = priceChart.Series.VOL.Values;
  console.assert(values.length == priceChart.Series.O.Values.length, "Volume data  length not equal to price data length");
  
  return values.map(v => v.y != 0 ? v.y : '-');
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

const SYMBOL = 'ETHEUR';
const timeArray = getTimeArray(SYMBOL);
const timeStrings = convertTimeArrayToStrings(timeArray);
const ohlcData = getOHLCValuesFor(SYMBOL);
const volumeData = getVolumeFor(SYMBOL);
const buyOrderData = getBuyOrderDataFor(SYMBOL, timeArray);
const sellOrderData = getSellOrderDataFor(SYMBOL, timeArray);

function getDataForLegend()
{
  return [SYMBOL].concat(indicatorsArray.map(x => x.Name)).concat([
    'BUY', 'SELL'
  ]);
}

function getDataForSeries()
{  
  return [
    {
      name: SYMBOL,
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
    )).concat(
      [
        {
            name: macd.Name,
            type: 'bar',
            data: getValuesForIndicator(macd),
            xAxisIndex: 2,
            yAxisIndex: 2,
        }
      ]
    ).concat(
      [
        {
            name: "Volume",
            type: 'bar',
            data: volumeData,
            xAxisIndex: 1,
            yAxisIndex: 1,
        }
      ]
    ).concat([
        {
            type: 'scatter',
            data: buyOrderData,
            symbol: 'triangle',
            symbolSize: 15,
            color: 'green'
        }]
    ).concat([
      {
          type: 'scatter',
          data: sellOrderData,
          symbol: 'diamond',
          symbolSize: 15,
          color: '#FF33F6'
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
  grid: [
    {
      left: '5%',
      right: '1%',
      bottom: '40%'
    },
    {
      left: '5%',
      right: '1%',
      top: '60%',
      bottom: '20%'
    },
    {
      left: '5%',
      right: '1%',
      top: '80%',
      bottom: '0%'
    }
  ],
  xAxis: [
    {
      type: 'category',
      data: timeStrings,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
    {
      gridIndex: 1,
      type: 'category',
      data: timeStrings,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },    
    {
      gridIndex: 2,
      type: 'category',
      data: timeStrings,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
],
  yAxis: [
    {
      scale: true,
      splitArea: {
        show: true
      }
    },
    {      
      gridIndex: 1,
      scale: true,
      splitArea: {
        show: true
      }
    },    
    {      
      gridIndex: 2,
      scale: true,
      splitArea: {
        show: true
      }
    },
  ],
  dataZoom: [
    {
      type: 'inside',
      start: 50,
      end: 100,
      xAxisIndex: [0, 1, 2]
    },
    {
      show: true,
      type: 'slider',
      top: '90%',
      start: 50,
      end: 100,
      xAxisIndex: [0, 1, 2]
    }
  ],
  series: getDataForSeries()
};

option && myChart.setOption(option);