
import * as d3 from "https://cdn.skypack.dev/d3@7";
// import * as d3 from "https://d3js.org/d3.v7.min.js";
// 

console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
//Get data_json
// let data1 = $('#content').attr("data");
let data = document.querySelector("#content").getAttribute("data");
// console.log("data1");
// console.log(data1);
let data_json = JSON.parse(data);
// data_json = data1;

console.log("data_json");
console.log(data_json);
console.log("data_json[0]");
console.log(data_json[0]);

const divChart1Width = document.getElementById("chart-Yago").clientWidth;
const divChart1Height = document.getElementById("chart-Yago").clientHeight;
const svgWidth = divChart1Width;
const svgHeight = divChart1Height;
console.log(svgWidth);
console.log(svgHeight);


const svg1 = d3.select("#svg-Yago");
svg1.attr("width", svgWidth)
    .attr("height", svgHeight);


const svg2 = d3.select("#svg-Samuel");
svg2.attr("width", svgWidth)
    .attr("height", svgHeight);

const svg3 = d3.select("#svg-Maria");
svg3.attr("width", svgWidth)
    .attr("height", svgHeight);

//Scales
const maxBalance1 = d3.max(data_json[0].transactions, d => d.balance);
console.log(maxBalance1);
const maxBalance2 = d3.max(data_json[1].transactions, d => d.balance);
console.log(maxBalance2);
const maxBalance3 = d3.max(data_json[2].transactions, d => d.balance);
console.log(maxBalance3);
const maxBalance = d3.max([maxBalance1, maxBalance2, maxBalance3]);
console.log("maxBalance");
console.log(maxBalance);

const minBalance1 = d3.min(data_json[0].transactions, d => d.balance);
console.log(minBalance1);
const minBalance2 = d3.min(data_json[1].transactions, d => d.balance);
console.log(minBalance2);
const minBalance3 = d3.min(data_json[2].transactions, d => d.balance);
console.log(minBalance3);
const minBalance = d3.min([minBalance1, minBalance2, minBalance3]);
console.log("minBalance");
console.log(minBalance);

const maxDate1 = d3.max(data_json[0].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(maxDate1);
const maxDate2 = d3.max(data_json[1].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(maxDate2);
const maxDate3 = d3.max(data_json[2].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(maxDate3);
const maxDate = d3.max([maxDate1, maxDate2, maxDate3]);
console.log("maxDate");
console.log(maxDate);

const minDate1 = d3.min(data_json[0].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(minDate1);
const minDate2 = d3.min(data_json[1].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(minDate2);
const minDate3 = d3.min(data_json[2].transactions, d => new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10)));
console.log(minDate3);
const minDate = d3.min([minDate1, minDate2, minDate3]);
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
const yAxis1G = svg1.append("g")
    .attr("id", "yAxis1G")
    .call(yAxis)
    .attr("transform", `translate(${padding}, 0)`);
const yAxis2G = svg2.append("g")
    .attr("id", "yAxis2G")
    .call(yAxis)
    .attr("transform", `translate(${padding}, 0)`);
const yAxis3G = svg3.append("g")
    .attr("id", "yAxis3G")
    .call(yAxis)
    .attr("transform", `translate(${padding}, 0)`);
const xAxis = d3.axisBottom(scaleDate)
    .tickFormat(d3.timeFormat("%b %Y"));
const xAxis1G = svg1.append("g")
    .attr("id", "xAxis1G")
    .call(xAxis)
    .attr("transform", `translate(0, ${svgHeight-padding})`)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

const xAxis2G = svg2.append("g")
    .attr("id", "xAxis2G")
    .call(xAxis)
    .attr("transform", `translate(0, ${svgHeight-padding})`)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

const xAxis3G = svg3.append("g")
    .attr("id", "xAxis3G")
    .call(xAxis)
    .attr("transform", `translate(0, ${svgHeight-padding})`)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

//Create data points
let points1 = [];
let points2 = [];
let points3 = [];

//Tooltip
    const toolTip1 = d3.select('body')
            .append('div')
            .attr("class", "tooltip")
            .attr('id', 'tooltip1')
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background", "silver")
            .text("a simple tooltip");
const toolTip2 = d3.select('body')
            .append('div')
            .attr("class", "tooltip")
            .attr('id', 'tooltip2')
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background", "silver")
            .text("a simple tooltip");
const toolTip3 = d3.select('body')
            .append('div')
            .attr("class", "tooltip")
            .attr('id', 'tooltip3')
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background", "silver")
            .text("a simple tooltip");

//Circles
svg1.append("g")
    .attr("id", "circles1G")
    .selectAll("circle")
    .data(data_json[0].transactions)
    .join("circle")
    .attr("cx", d => scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))))
    .attr("cy", d => {
        points1.push([scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))), scaleBalance(d.balance)]);
        return scaleBalance(d.balance);
    })
    .style("fill", "darkolivegreen")
    .on("mouseover", function(e,d){
            toolTip1.html(d.date + "<br />" +  d.concept + "<br />" + "$" + d.amount + " " + d.type);
            return toolTip1.style("visibility", "visible");
         })
    .on("mousemove", function(e){
            return toolTip1.style("top", (e.pageY-10)+"px").style("left",(e.pageX+10)+"px");
         })
    .on("mouseout", function(){
            return toolTip1.style("visibility", "hidden");
         })
    .transition()
    .duration(3000)
    .attr("r", 4);

//Path
const lineGenerator = d3.line().curve(d3.curveCatmullRom);
const linePath1Data = lineGenerator(points1);
console.log(linePath1Data);
svg1.append("g")
    .attr("id", "path1G")
    .selectAll("path")
    .data([linePath1Data])
    .join("path")
    .attr("d", (d) => d)
    .style("stroke", "steelblue")
    .style("stroke-width", 1.5)
     .style("fill", "none");

// //Animation of Path
const path1Length = d3.select("#path1G path").node().getTotalLength();
d3.select("#path1G path")
    .style("stroke-dashArray", path1Length)
    .style("stroke-dashoffset", path1Length)
    .transition()
    .duration(3000)
    .style("stroke-dashoffset", 0);

//Circles
svg2.append("g")
    .attr("id", "circles2G")
    .selectAll("circle")
    .data(data_json[1].transactions)
    .join("circle")
    .attr("cx", d => scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))))
    .attr("cy", d => {
        points2.push([scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))), scaleBalance(d.balance)]);
        return scaleBalance(d.balance);
    })
    .style("fill", "darkolivegreen")
    .on("mouseover", function(e,d){
            toolTip2.html(d.date + "<br />" +  d.concept + "<br />" + "$" + d.amount + " " + d.type);
            return toolTip2.style("visibility", "visible");
         })
    .on("mousemove", function(e){
            return toolTip2.style("top", (e.pageY-10)+"px").style("left",(e.pageX+10)+"px");
         })
    .on("mouseout", function(){
            return toolTip2.style("visibility", "hidden");
         })
    .transition()
    .duration(3000)
    .attr("r", 4);

//Path
// const lineGenerator = d3.line().curve(d3.curveCatmullRom);
const linePath2Data = lineGenerator(points2);
console.log(linePath2Data);
svg2.append("g")
    .attr("id", "path2G")
    .selectAll("path")
    .data([linePath2Data])
    .join("path")
    .attr("d", (d) => d)
    .style("stroke", "steelblue")
    .style("stroke-width", 1.5)
     .style("fill", "none");

//Animation of Path
const path2Length = d3.select("#path2G path").node().getTotalLength();
d3.select("#path2G path")
    .style("stroke-dashArray", path2Length)
    .style("stroke-dashoffset", path2Length)
    .transition()
    .duration(3000)
    .style("stroke-dashoffset", 0);

//Circles
svg3.append("g")
    .attr("id", "circles3G")
    .selectAll("circle")
    .data(data_json[2].transactions)
    .join("circle")
    .attr("cx", d => scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))))
    .attr("cy", d => {
        points3.push([scaleDate(new Date(d.date.substring(0,4), Number(d.date.substring(5,7))-1, d.date.substring(8,10))), scaleBalance(d.balance)]);
        return scaleBalance(d.balance);
    })
    .style("fill", "darkolivegreen")
    .on("mouseover", function(e,d){
            toolTip3.html(d.date + "<br />" +  d.concept + "<br />" + "$" + d.amount + " " + d.type);
            return toolTip3.style("visibility", "visible");
         })
    .on("mousemove", function(e){
            return toolTip3.style("top", (e.pageY-10)+"px").style("left",(e.pageX+10)+"px");
         })
    .on("mouseout", function(){
            return toolTip3.style("visibility", "hidden");
         })
    .transition()
    .duration(3000)
    .attr("r", 4);

//Path
// const lineGenerator = d3.line().curve(d3.curveCatmullRom);
const linePath3Data = lineGenerator(points3);
console.log(linePath3Data);
svg3.append("g")
    .attr("id", "path3G")
    .selectAll("path")
    .data([linePath3Data])
    .join("path")
    .attr("d", (d) => d)
    .style("stroke", "steelblue")
    .style("stroke-width", 1.5)
     .style("fill", "none");

//Animation of Path
const path3Length = d3.select("#path3G path").node().getTotalLength();
d3.select("#path3G path")
    .style("stroke-dashArray", path3Length)
    .style("stroke-dashoffset", path3Length)
    .transition()
    .duration(3000)
    .style("stroke-dashoffset", 0);




