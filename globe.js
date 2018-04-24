var datasetList = d3.select("#param-dataset");
var option = datasetList.append("option");
option.text("");
option.property("value", "");

var datasets = ["tubercolusis_from 2007_WHO", "google_flu", "google_dengue"];
datasets.forEach(function(d) {
  option = datasetList.append("option");
  option.text(d);
  option.property("value", d);
});

datasetList.on("change", loadDataset);

var dataset, countries, countryById = {}, timestep = 0, colorScale, play = false, stopRun = true, timeLine = [], mapping = {};

var margin = { top: 20, right: 20, bottom: 20, left: 20 },
    w = 800,
    h = 600,
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom,
    sens = 0.25,
    focused,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

//Setting projection
var projection = d3.geo.orthographic()
                   .scale(300)
                   .rotate([0, 0])
                   .translate([width / 2, height / 2])
                   .clipAngle(90);

var path = d3.geo.path()
             .projection(projection);

//SVG container
var svg = d3.select("#embedding-space").append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "svg")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var countryTooltip = svg.append("div").attr("class", "countryTooltip"),
    countryList = d3.select("#param-country"),
    attributeList = d3.select("#param-attribute");

var title = d3.select("#embedding-space").append("h1").attr("id", "title");
var timeList = d3.select("#param-time");

function updateTime() {
  timeLine = [];
  var attr = $('#param-attribute').val();
  Object.keys(countries[0]['time']).forEach(function(d) {
    if (Object.keys(countries[0]['time'][d]).indexOf(attr) >= 0) timeLine.push(d);
  })
  document.getElementById('param-time').max = timeLine.length - 1;
}

function displayTime(time) {
  var d = $('#param-dataset').val();
  var attr = $('#param-attribute').val();
  if (d == datasets[0]) return "Year: " + time;
  return mapping[attr.split(" ")[attr.split(" ").length-1]][time];
}

function clearSelects() {
  $('#param-attribute')
    .find('option')
    .remove()
    .end();

  $('#param-country')
    .find('option')
    .remove()
    .end();
}

function loadDataset() {
  clearSelects();
  dataset = $('#param-dataset').val();

  queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.tsv, "data/world-110m-country-names.tsv")
    .defer(d3.json, "data/" + dataset + ".json")
    .defer(d3.json, "data/date.json")
    .await(ready);
}

//Main function
function ready(error, world, countryData, data, time) {
  if (error) throw error;

  mapping = time;
  var countryInfo = Object.values(data['countries'])

  countries = topojson.feature(world, world.objects.countries).features;

  var i = -1,
      n = countries.length;

  //Adding countries to select
  option = countryList.append("option");
  option.text("");
  option.property("value", "");

  countryData.forEach(function(d) {
    countryById[d.id] = d.name;
    option = countryList.append("option");
    option.text(d.name);
    option.property("value", d.id);
  });

  //Setting country names
  countries = countries.filter(function(d) {
    return countryData.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  // Setting country information
  countries = countries.filter(function(d) {
    return countryInfo.some(function(n) {
      if (d.id == n.id) return d.time = n.time;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  // console.log(countries); //countries[0]['time']['2010']["Number of deaths due to tuberculosis, excluding HIV"]

  option = attributeList.append("option");
  option.text("");
  option.property("value", "");

  attributeKeys = Object.keys(countries[0]['time'][Object.keys(countries[0]['time'])[0]]);
  attributeKeys.forEach(function(d) {
    option = attributeList.append("option");
    option.text(d);
    option.property("value", d);
  });

  svg.selectAll("path.land").remove();
  svg.selectAll("path.land")
     .data(countries)
     .enter().append("path")
     .attr("class", "land")
     .attr("d", path)
     .attr("transform", "translate(" + -100 + "," + 0 + ")");

  var attribute = $('#param-attribute').val();
  var time = timeLine[$('#param-time').val()];
  var countryID = $('#param-country').val();

  d3.select("#param-attribute").on("change", function() {
    d3.select("#param-time").on("change", visualize);
    updateTime();
    visualize();
  });

  // Country focus on option select
  d3.select("#param-country").on("change", function() {
    var attribute = $('#param-attribute').val();
    var time = timeLine[$('#param-time').val()];
    var countryID = $('#param-country').val();

    function country(cnt, sel) {
       for(var i = 0, l = cnt.length; i < l; i++) {
         if(cnt[i].id == sel.value) {return cnt[i];}
       }
       return -1;
    };

    var focusedCountry = country(countries, this),
        p = d3.geo.centroid(focusedCountry);

    svg.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating
    function transition() {
      d3.transition()
        .duration(600)
        .tween("rotate", function() {
          var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path)
               .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
          };
        })
    };

    if (focusedCountry == -1) $('#progress-time').text(countryById[countryID] + "'s data is missing");
    else {
      $('#title').text(countryById[countryID]);
      $('#progress-time').text(displayTime(time));
      transition();
    }
 });
};

function numFormatter(num) {
    if (num > 999){
      return (num/1000).toFixed(0) + 'k';
    }
    else if (num > 1){
      return Math.round(num);
    }
    else if (num == 0.0){
      return 0;
    }
    else{
      return num.toFixed(3);
    }
}

function visualize() {
  var attribute = $('#param-attribute').val();
  var time = timeLine[$('#param-time').val()];
  var countryID = $('#param-country').val();
  $('#progress-time').text(displayTime(time));

  //Setting color scale
  colorScale = d3.scale.quantile()
                 .domain([0, 11, d3.max(countries, function(d){
                    //  console.log(Object.keys(d['time']));
                    var time = [];
                    timeLine.forEach(function(i) {
                      if (Object.keys(d['time']).indexOf(String(i)) >= 0)
                        time.push(d['time'][i][attribute]);
                    });
                    return Math.max(...time);
                 })])
                 .range(colors);

  svg.selectAll(".legend").remove();

  var legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform", "translate(" + 0 + "," + 0 + ")");

  var legend_size = 50;
  legend.selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
        .attr("x", 650)
        .attr("y", function(d,i){return i*(legend_size/2);})
        .attr("width", legend_size/3)
        .attr("height", legend_size/2)
        .style("fill", function(d,i){return colors[i];})
        .style("stroke", "#000");

    var legend_text = [0].concat(colorScale.quantiles());
    // console.log(legend_text)
    legend.selectAll("text")
        .data(legend_text)
        .enter()
        .append("text")
        .attr("x", 675)
        .attr("y", function(d,i){return i*(legend_size/2);})
        .attr("dy","0.35em")
        .attr("font-size", "13px")
        .text(function (d) { return numFormatter(d); })
        .style("text-anchor", "start")
        .style("fill", 'white');

      // legend.append("text")
      //   .text("Number of Appearances")
      //   .style("stroke", "#000")
      //   .style("text-anchor", "start");

  //Drawing countries on the globe
  svg.selectAll("path")
     .style("fill", function(d){
      if (Object.keys(d['time']).indexOf(time) >= 0)
        return colorScale(d['time'][time][attribute]);
      else {
        return '#A98B6F';
      }
     })

   //Drag event
   .call(d3.behavior.drag()
     .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
     .on("drag", function() {
       var rotate = projection.rotate();
       projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
       svg.selectAll("path.land").attr("d", path);
       svg.selectAll(".focused").classed("focused", focused = false);
     }))

   //Mouse events
  //  .on("mouseover", function(d) {
  //    countryTooltip.text(countryById[d.id])
  //    .style("left", (d3.event.pageX + 7) + "px")
  //    .style("top", (d3.event.pageY - 15) + "px")
  //    .style("display", "block")
  //    .style("opacity", 1);
  //  })
  //  .on("mouseout", function(d) {
  //    countryTooltip.style("opacity", 0)
  //    .style("display", "none");
  //  })
  //  .on("mousemove", function(d) {
  //    countryTooltip.style("left", (d3.event.pageX + 7) + "px")
  //    .style("top", (d3.event.pageY - 15) + "px");
  //  });
}

function run() {
  var time = timeLine[Number($('#param-time').val()) + timestep];
  var attribute = $('#param-attribute').val();
  var speed = parseInt($('#param-speed').val());
  $('#progress-time').text(displayTime(time));

  svg.selectAll("path")
    .transition()
    .duration(800)
    .style("fill", function(d){
     if (Object.keys(d['time']).indexOf(time) >= 0)
       return colorScale(d['time'][time][attribute]);
     else {
       return '#A98B6F';
     }
    });
  timestep++;
  if (stopRun || timestep > timeLine.length - Number($('#param-time').val()) - 1) {
    timestep = 0;
    return;
  };
  window.setTimeout(run, 800);
}

var i = -1;

function transition() {
  if (i == -1) play = true;
  if (!play) {
    i = -1;
    return;
  }
  n = countries.length;
  svg.selectAll(".focused").classed("focused", focused = false);
  d3.transition()
    .duration(600)
    .each("start", function() {
      title.text(countries[i = (i + 1) % n].name);
    })
    .tween("rotate", function() {
      var p = d3.geo.centroid(countries[i]),
          r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          focused_id = countries[i].id;
      svg.selectAll(".focused").classed("focused", focused = false);
      return function(t) {
        projection.rotate(r(t));
        svg.selectAll("path").attr("d", path)
           .classed("focused", function(d, i) { return d.id == focused_id ? focused = d : false; });
      };
    })
    .transition()
    .each("end", transition);
}

$('#play-button').bind('click', function() {
  if (!play) {
    play = true;
    $('#play-button').text("Stop");
    transition();
  } else {
    play = false;
    $('#play-button').html("Play");
  }
});
$('#run-button').bind('click', function() {
  stopRun = !stopRun;
  run();
});
