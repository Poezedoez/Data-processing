// Ragger Jonkers
// 10542604

// Read in data from json file
d3.json("gdp.json", function(error, d) {
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
    data: d,
    geographyConfig: {
      // Blue highlight color
      highlightFillColor: '#4985c1',

      // Show country name and gdp value on hover
      // or say when no data is available
      popupTemplate: function(geography, data) {
        if (data == null) {
          return '<div class="hoverinfo"><strong>' + geography.properties.name +
            '</strong><br/>No data available </div>';
        }
        return '<div class="hoverinfo"><strong>' + geography.properties.name +
          '</strong><br/>GDP: ' + '$'  +  data.gdp + '</div>';
      }
    }    
  });

  // Create legend
  map.legend({
    legendTitle: 'Nominal Gross Domestic Product Per Capita (USD)', 
    defaultFillName: 'No data: '
  });
});