
import * as d3 from "https://cdn.skypack.dev/d3@7";
// import * as d3 from "https://d3js.org/d3.v7.min.js";
// 

//Get data_json
// let data1 = $('#content').attr("data");
let data = document.querySelector("#content").getAttribute("data");
// console.log("data1");
// console.log(data1);
let data_json = JSON.parse(data);
// data_json = data1;

console.log("data_json in graph.js");
console.log(data_json);
console.log("data_json[0]");
console.log(data_json[0]);


let svgWidth;
let svgHeight;
let svgArray=[];
let maxBalanceArray = [];
let minBalanceArray = [];
let maxDateArray = [];
let minDateArray = [];
let pointsArray = [[], [], []];
let toolTipArray = [];

for (let customer of data_json){
    console.log(customer.name)
    const divChartWidth = document.getElementById("chart-"+customer.name).clientWidth;
    const divChartHeight = document.getElementById("chart-"+customer.name).clientHeight;
    svgWidth = divChartWidth;
    svgHeight = divChartHeight;
    const svg = d3.select("#svg-"+customer.name);
    svg.attr("width", svgWidth)
        .attr("height", svgHeight);
    svgArray.push(svg);

    //Scales
    const maxBalance = d3.max(customer.transactions, d => d.balance);
    maxBalanceArray.push(maxBalance);
    const minBalance = d3.min(customer.transactions, d => d.balance);
    minBalanceArray.push(minBalance);
    const maxDate = d3.max(customer.transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
    maxDateArray.push(maxDate);
    const minDate = d3.min(customer.transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
    minDateArray.push(minDate);
}


const maxBalance = d3.max(maxBalanceArray);
const minBalance = d3.min(minBalanceArray);
const maxDate = d3.max(maxDateArray);
const minDate = d3.min(minDateArray);
console.log(maxBalanceArray);
console.log(minBalanceArray);

console.log("maxBalance");
console.log(maxBalance);

console.log("minBalance");
console.log(minBalance);

console.log("maxDate");
console.log(maxDate);

console.log("minDate");
console.log(minDate);

const padding = 55;
const scaleBalance = d3.scaleLinear()
    .domain([maxBalance, minBalance])
    .range([0, svgHeight-padding]);
const scaleDate = d3.scaleTime()
    .domain([minDate,maxDate])
    .range([padding, svgWidth-padding]);

//Axis
const yAxis = d3.axisLeft(scaleBalance)
.ticks(5);
const xAxis = d3.axisBottom(scaleDate)
    .tickFormat(d3.timeFormat("%b %Y"));

for (let i=0; i<data_json.length; i++){
    const yAxisG = svgArray[i].append("g")
    .attr("id", "yAxisG"+i)
    .call(yAxis)
    .attr("transform", `translate(${padding}, 0)`);

    const xAxisG = svgArray[i].append("g")
    .attr("id", "xAxisG"+i)
    .call(xAxis)
    .attr("transform", `translate(0, ${svgHeight-padding})`)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

    const toolTip = d3.select('body')
            .append('div')
            .attr("class", "tooltip")
            .attr('id', 'tooltip'+i)
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background", "silver")
            .text("a simple tooltip");

    // toolTipArray.push(toolTip);
    const points = [];
    //Format date for tooltip
    // const formatDate = d3.timeFormat("%b-%Y")
    //Circles
    // var formatTime = d3.time.format("%Y-%m-%d");
    svgArray[i].append("g")
    .attr("id", "circlesG"+i)
    .selectAll("circle")
    .data(data_json[i].transactions)
    .join("circle")
    .attr("cx", d => scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))))
    .attr("cy", d => {
        points.push([scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))), scaleBalance(d.balance)]);
        return scaleBalance(d.balance);
    })
    .style("fill", "darkolivegreen")
    .on("mouseover", function(e,d){
            const dateElem = new Date(d.date);
            const day = dateElem.getDate();
            const month = dateElem.getMonth()+1;
            const year = dateElem.getFullYear();
            toolTip.html(day + "-" + month + "-" + year + 
             "<br />" +  d.concept + "<br />" + "$" + d.amount + " " + d.type + "<br />" + "$" + d.balance);
            return toolTip.style("visibility", "visible");
        })
    .on("mousemove", function(e){
            return toolTip.style("top", (e.pageY-10)+"px").style("left",(e.pageX+10)+"px");
        })
    .on("mouseout", function(){
            return toolTip.style("visibility", "hidden");
        })
    .transition()
    .duration(3000)
    .attr("r", 4);

    //Path
    const lineGenerator = d3.line().curve(d3.curveCatmullRom);
    const linePathData = lineGenerator(points);
    console.log(linePathData);
    svgArray[i].append("g")
        .attr("id", "pathG"+i)
        .selectAll("path")
        .data([linePathData])
        .join("path")
        .attr("d", (d) => d)
        .style("stroke", "steelblue")
        .style("stroke-width", 1.5)
        .style("fill", "none");

    // //Animation of Path
    const pathLength = d3.select("#pathG" + i + " path").node().getTotalLength();
    d3.select("#pathG" + i + " path")
        .style("stroke-dashArray", pathLength)
        .style("stroke-dashoffset", pathLength)
        .transition()
        .duration(3000)
        .style("stroke-dashoffset", 0);
}
