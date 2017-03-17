// Ragger Jonkers
// 10542604


/*
 * Read in data from files using d3-queue.js
 * and create the default visualizations 
 */
function load(){
  d3.queue()
  .defer(d3.json, 'gdp.json')
  .defer(d3.csv, 'growth.csv')
  .await(function(error, gdp, growth){
    makeMyMap(error, gdp, growth);
    // Instantiate default data for scatter plot (gdp of world)
    var defaultData = getGrowthDataForCountry("WLD", growth);
    makeMyScatter(defaultData);
  });
}

/*
 * Creates a world map visualization using topojson */
function makeMyMap(error, gdp, growth) {
  if(error){
    console.log(error);
  }
  // Create Datamap (from external library)
  var map = new Datamap({
    element: document.getElementById('map_container'),
    scope: 'world',
    fills: {
      "<500": '#ffffa6',
      "500-1000": '#feff33',
      "1000-2000": '#fed24c',
      "2000-4000": '#fea933',
      "4000-8000": '#fe7733',
      "8000-16000": '#fd2a00',
      "16000-32000": '#d00000',
      "32000-64000": '#a00000',
      ">64000": '#400000',
      defaultFill: '#c4c3c0' 
    },
    // 'd' is a data dict according to datamap formatting
    data: gdp,
    geographyConfig: {
      // Blue highlight color
      highlightFillColor: '#4985c1',

      // Show country name and gdp value on hover
      // or say when no data is available
      popupTemplate: function(geography, gdp) {
        if (gdp == null) {
          return '<div class="hoverinfo"><strong>' + geography.properties.name +
            '</strong><br/>No data available </div>';
        }
        return '<div class="hoverinfo"><strong>' + geography.properties.name +
          '</strong><br/>GDP: ' + '$'  +  gdp.gdp + '</div>';
      }
    },   
    done: function(datamap) {
      datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography){
        // Get the data in useful format
        var countryData = getGrowthDataForCountry(geography.id, growth);
        makeMyScatter(countryData);
      });
    }
  });

  // Create legend
  map.legend({
    legendTitle: '2016: Nominal Gross Domestic Product Per Capita (USD)', 
    defaultFillName: 'No data: ',
  });

};

/* Creates a scatter plot given a json entry of a country */
function makeMyScatter(data){
  var scatter_container = document.getElementById('scatter_container');
  scatter_container.innerHTML = '';

  // Define scatterplot margins
  var margin = {top: 30, right: 20, bottom: 60, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Add the graph canvas to the container div
  var container = d3.select('#scatter_container');
  var svg = d3.select('#scatter_container').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Define the div for the tooltip
  var tip = d3.select("body").append("div") 
    .attr("class", "tip")       
    .style("opacity", 0);

  // Define x-scale
  var x = d3.scale.linear()
    .range([0, width]);

  // Define y-scale
  var y = d3.scale.linear()
    .range([height, 0]);

  // Define x-axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format("d"));

  // Define y-axis
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  // Define domain ranges
  x.domain(d3.extent(data, function(d) { return d.year; }));
  y.domain(d3.extent(data, function(d) { return d.growth})); 

  // Add x-axis and label
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Year");

  // Add y-axis and label
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("dx", 12)
      .style("text-anchor", "end")
      .text("%")

  // Add data points of scatter plot
  svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.year); })
      .attr("cy", function(d) { return y(d.growth); })
      .style("fill", "black")
      // Add interaction and tooltip
      .on("mouseover", function(d) { 
        d3.select(this).attr("r", 6);
        d3.select(this).style("fill", "red");  
        tip.transition()    
          .duration(200)    
          .style("opacity", 1);    
        tip.html(d.name + "<br/>" + d.year + "<br/><strong>"  + d.growth.toFixed(2) + "%</strong>")  
          .style("left", (d3.event.pageX + 10) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");  
      })
      // Undo interaction and hide tooltip          
      .on("mouseout", function(d) { 
        d3.select(this).attr("r", 3.5);
        d3.select(this).style("fill", "black");    
        tip.transition()    
          .duration(500)    
          .style("opacity", 0); 
      });

  // Add title
  svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "16px")  
    .style("text-decoration", "underline") 
    .text("GDP per capita growth (annual %) of " + data[0].name);

  // Add grid line through 0
  svg.append("line") 
    .attr("class", "grid") 
    .attr("x1", 0)     
    .attr("y1", y(0))      
    .attr("x2", width)    
    .attr("y2", y(0)); 
}

/* 
 * Given the country code and the complete data, 
 * return the corresponding 
 * json formatted data entry of that country
 */
function getGrowthDataForCountry(code, data){
  var formattedData = [];
  var entry;
  data.forEach(function(e){
      if(e["Country Code"] == code){
          entry = e;
      };
  });
  for(var i = 1960; i < 2017; i++){
      formattedData.push({"name": entry["Country Name"], "year": i, "growth": +entry[i]})
  }
  return formattedData;
}

// Load the initial files and visualizations
load();



