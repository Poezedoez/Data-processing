// Define margins and dimensions
var margin = {top: 30, right: 30, bottom: 30, left: 150},
    spacing = 10,
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Define x and y scale
var x = d3.scaleBand()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

// Create chart canvas
var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read data and create graph within the scope
d3.json("rainfall.json", function(error, data) {
  x.domain(data.map(function(d) { return d.month; }));
  y.domain([0, d3.max(data, function(d) { return d.rainfall; })]);

  // Add x-axis
  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add y-axis
  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // Add title to chart
  chart.append("svg:text")
      .attr("class", "title")
      .attr("x", (width / 2))             
      .attr("y", (margin.top / 2))
      .attr("text-anchor", "middle")  
      .text("Cumulative monthly rainfall in 1995");

  // Add bars to bar chart
  chart.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.month)+spacing/2;})
    .attr("y", function(d) { return y(d.rainfall); })
    .attr("height", function(d) { return height - y(d.rainfall); })
    .attr("width", x.bandwidth()-spacing)
    .attr("fill", "darkblue")
    // Mouse hover: bar changes and shows value
    .on("mouseover", function() {
        d3.select(this)
            .attr("fill", "dodgerblue")
            .append("svg:title")
            .text(function(d) { return d.rainfall; });
    })
    // Mouse out: return back to normal
    .on("mouseout", function(d, i) {
        d3.select(this).attr("fill", function() {
            return "darkblue";
        });
    });
});