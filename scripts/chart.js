
var dataDom = document.getElementById('data');
var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

const SymbolChartPrefix = "BARS_";

const CHARTS = jsonData.charts;
const ORDERS = jsonData.orders;

const INDICATORS = CHARTS.Indicators.series;
const OSCILLATORS = CHARTS.Oscillators.series;
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
          returnIndicatorsArray.push(INDICATORS[key]);        
      });

    return returnIndicatorsArray;
}

function getOscillatorsArray()
{
  let returnOscillatorsArray = [];

  let oscillatorKeys = Object.keys(OSCILLATORS);
  
  oscillatorKeys.forEach(key => {
      returnOscillatorsArray.push(OSCILLATORS[key]);        
    });

  return returnOscillatorsArray;
}

function getOscillator(name)
{
  let oscillatorKeys = Object.keys(OSCILLATORS);
  for(const k in oscillatorKeys)
  {
    const key = oscillatorKeys[k];
    if(key.startsWith(name))
    {
      return OSCILLATORS[key];
    }
  }
}

let priceCharts = getPriceCharts();
let indicatorsArray = getIndicatorsArray();
let oscillatorsArray = getOscillatorsArray();
let macd = getOscillator("MACD");
let adx = getOscillator("ADX");

function getTimeArray(symbol)
{
  const priceChart = priceCharts[symbol];
  return priceChart.series.C.values.flatMap(v => v[0] * 1000);
}

function convertTimeArrayToStrings(timeArray) {
  const times = timeArray.flatMap(v => {
    const date = new Date(v);
    const day = date.getDate();
    const month = date.getMonth() + 1;
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
  values = indicator.values;
  var time = priceCharts[SYMBOL].series.O.values[0][0];
  values = values.filter(v => v[0] >= time);
  return values.map(v => v[1] != 0 ? v[1] : '-');
}

function getOCLHValuesFor(symbol) {
  const priceChart = priceCharts[symbol];

  const valuesLength = priceChart.series.C.values.length;
  let result = []
  for (let i = 0; i < valuesLength; i++) {
    let row = [priceChart.series.O.values[i][1], 
                priceChart.series.C.values[i][1], 
                priceChart.series.L.values[i][1], 
                priceChart.series.H.values[i][1]];
    result.push(row);
  }

  return result;
}

function getVolumeFor(symbol)
{
  const priceChart = priceCharts[symbol];
  const values = priceChart.series.VOL.values;
  console.assert(values.length == priceChart.series.O.values.length, "Volume data  length not equal to price data length");
  
  return values.map(v => v[1] != 0 ? v[1] : '-');
}

function getVolumeComparedFor(symbol, compOperator)
{
  const vol = getVolumeFor(symbol);
  result = vol;
  if(compOperator != null)
  {
    const priceChart = priceCharts[symbol];
    const closeValues = priceChart.series.C.values.map(v => v[1]);
  
    result = [];
    result.push(vol[0])
    for(let i = 1; i < vol.length; i++)
    {
      if(compOperator(closeValues[i],closeValues[i-1]))
      {
        result.push(vol[i]);
      }
      else
      {
        result.push('-');
      }
    }
  }
  return result;
}

function getVolumePosFor(symbol)
{
  return getVolumeComparedFor(symbol, (v1,v2) => v1 > v2) ;
}

function getVolumeNegFor(symbol)
{
  return getVolumeComparedFor(symbol, (v1,v2) => v1 < v2) ;
}

function getOrderDataFor(symbol, timeArray, operation)
{
  let direction = operation == "buy" ? 0 : 1;

  const orderKeys = Object.keys(ORDERS);
      let orders = [];
      orderKeys.forEach(key => {
        orders.push(ORDERS[key]);
      });
      orders = orders.filter(o => o.symbol.value == symbol); 
      orders = orders.filter(o => o.direction == direction);
      
      let returnArray = []
      orders.forEach(o => {
        const oTime = Date.parse(o.time);
        const indexInTime = timeArray.findIndex(t => t == oTime);
        //console.log(indexInTime);
        returnArray.push([indexInTime, o.price]);
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
const oclhData = getOCLHValuesFor(SYMBOL);
const volumePosData = getVolumePosFor(SYMBOL);
const volumeNegData = getVolumeNegFor(SYMBOL);
const buyOrderData = getBuyOrderDataFor(SYMBOL, timeArray);
const sellOrderData = getSellOrderDataFor(SYMBOL, timeArray);

function getDataForLegend()
{
  return [SYMBOL].concat(indicatorsArray.map(x => x.name)).concat([
    'BUY', 'SELL'
  ]);
}

function getDataForSeries()
{  
  return [
    {
      name: SYMBOL,
      type: 'candlestick',
      data: oclhData,
      itemStyle: {
        color: upColor,
        color0: downColor,
        borderColor: upBorderColor,
        borderColor0: downBorderColor
      }
    },
  ].concat(indicatorsArray.map(
    (x) => 
    {
      return {
        name: x.name,
        type: 'line',
        data: getValuesForIndicator(x),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      }
    }
    )).concat(oscillatorsArray.map(
      (x) => 
      {
        return {
          name: x.name,
          type: 'line',
          data: getValuesForIndicator(x),
          smooth: true,
          xAxisIndex: 2,
          yAxisIndex: 2,
        }
      })).concat(
      [
        {
            name: "Volume",
            type: 'bar',
            data: volumePosData,
            xAxisIndex: 1,
            yAxisIndex: 1,
            color: "green"
        }
      ]
    ).concat(
      [
        {
            name: "Volume",
            type: 'bar',
            data: volumeNegData,
            xAxisIndex: 1,
            yAxisIndex: 1,
            color: "red"
        }
      ]
    ).concat([
      {
        name: "Buy",
        type: 'scatter',
        data: buyOrderData,
        symbol: 'pin',
        symbolSize: 15,
        color: 'green'
        }]
    ).concat([
      {
        name: "Sell",
        type: 'scatter',
        data: sellOrderData,
        symbol: 'pin',
        symbolSize: 15,
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
  axisPointer: {
    link: { xAxisIndex: 'all' }    
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
      bottom: '30%'
    },
    {
      left: '5%',
      right: '1%',
      top: '72%',
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
      start: 50,
      end: 100,
      xAxisIndex: [0, 1, 2]
    }
  ],
  series: getDataForSeries()
};

option && myChart.setOption(option);