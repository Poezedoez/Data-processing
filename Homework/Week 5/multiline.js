/*
Ragger Jonkers
10542604
*/

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1600 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

// Define the div for the tooltip
var tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

// Parse the date / time
var parseDate = d3.time.format("%Y%m%d").parse,
    formatTime = d3.time.format("%d %b"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(12);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Color scale
var color = d3.scale.category10();

// Define the line chart for given x/y values
var line = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

// Default datafile 
var dataFile = "temps2015Bilt.csv";

// Default year
var year = "2015";

d3.select('#opts')
  .on('change', function() {
    year = d3.select(this).property('value');
    dataFile = "temps" + year + "Bilt.csv";
    d3.select("svg").remove();
    redraw();
});

// Get the data and visualize it
function redraw(){
    d3.csv(dataFile, function(error, data) {
        if (error){
            console.log(error);
        }
        // Use common temperature order of magnitude and parse date
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.min = +d.min/10;
            d.avg = +d.avg/10;
            d.max = +d.max/10;
        });

        // Set the domain of the color ordinal scale to be all the csv headers except "date" and "location"
        color.domain(d3.keys(data[0]).filter(function(key) { 
            return key !== "location" && key !== "date"; 
        }));

        // Add the svg canvas
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

        // Seperate min, avg and max temp into own data entry
        var tempData = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {date: d.date, temperature: +d[name]};
                })
            };
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([d3.min(data, function(d) { return d.min; }), d3.max(data, function(d) { return d.max; })]); 

        // Create g-element for each data entry (avg, min, max)
        var tempCharts = svg.selectAll(".tempChart")
            .data(tempData)
            .enter()
            .append("g")
            .attr("id", function(d){ return d.name+"-line"; })
            .attr("class", "tempChart");

        // Draw line chart for each column in the data (avg, min, max)
        tempCharts.append("path")
            .attr("class", "line")
            .attr("data-legend", function(d) { return d.name})
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); })

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("temperature (\u2103)");

        // Add chart title
        svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")  
                .style("font-size", "20px") 
                .style("text-decoration", "underline")  
                .text("Average, minimum and maximum temperatures in " + year);

        // Add legend
        var legend = svg.append("g")
            .attr("class","legend")
            .attr("transform","translate(1400,60)")
            .style("font-size","22px")
            .call(d3.legend)

        // Add interactive circles around datapoints
        tempCharts.selectAll(".dot")
            .data(function(d) {
                return d.values;
            })
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
                return x(d.date); 
             })
            .attr("cy", function(d) {
                return y(d.temperature);
            })
            .attr("r", 5)
            .style("opacity", 0.1)
            // Highlight hovered data point circle
            .on("mouseover", function(d) {  
                d3.select(this).attr({
                    r: 8  
                });    
                d3.select(this).style({
                    opacity: 1 
                });
                // Populate tooltip with data from hovered element                        
                tooltip.html(formatTime(d.date) + "<br/>" + d.temperature + '&#8451;')
                    .style("opacity", .9)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })
            // Undo mouseover styling                 
            .on("mouseout", function(d) { 
                d3.select(this).attr({
                    r: 3
                });      
                d3.select(this).style({
                    opacity: 0.1
                })
                tooltip.style("opacity", 0);                  
            });
        // svg.append('a')
        //     .attr("xlink:href", "http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi")
        //     .append("rect")  
        //     .attr("x", 100)
        //     .attr("y", 50)
        //     .attr("height", 100)
        //     .attr("width", 200)
        //     .style("fill", "lightgreen")
        //     .attr("rx", 10)
        //     .attr("ry", 10);
    })
};

// Call the function to draw the chart initially
redraw();
