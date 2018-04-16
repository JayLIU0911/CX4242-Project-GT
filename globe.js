var datasets = ["tubercolusis_from 2007_WHO"];
var dataset, countries, countryById = {}, timestep = 0, colorScale;

var margin = { top: 20, right: 20, bottom: 20, left: 20 },
    w = 800,
    h = 700,
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

var title = d3.select("h1");

function loadDataset() {
  // console.log("loading dataset");
  dataset = datasets[parseInt($('#param-dataset').val())];
  queue()
  .defer(d3.json, "data/world-110m.json")
  .defer(d3.tsv, "data/world-110m-country-names.tsv")
  .defer(d3.json, "data/" + dataset + ".json")
  .await(ready);
}

//Main function
function ready(error, world, countryData, data) {
  if (error) throw error;

  var countryInfo = Object.values(data['countries'])

  countries = topojson.feature(world, world.objects.countries).features;

  var i = -1,
      n = countries.length;

  //Adding countries to select
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
      if (d.id == n.id) return d.years = n.years;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  console.log(countries); //countries[0]['years']['2010']["Number of deaths due to tuberculosis, excluding HIV"]

  attributeKeys = Object.keys(countries[0]['years']['2007']);
  attributeKeys.forEach(function(d) {
    option = attributeList.append("option");
    option.text(d);
    option.property("value", d);
  });

  function transition() {
    svg.selectAll(".focused").classed("focused", focused = false);
    d3.transition()
      .duration(1250)
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
        // return function(t) {
        //   c.clearRect(0, 0, width, height);
        //
        //   projection.rotate(r(t)).clipAngle(180);
        //   c.fillStyle = "#dadac4", c.beginPath(), path(land), c.fill();
        //   c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
        //   c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
        //   c.strokeStyle = "#000", c.lineWidth = 1, c.beginPath(), path(globe), c.stroke();
        //   c.strokeStyle = "rgba(0, 0, 0, 0.05)", c.lineWidth = .5, c.beginPath(), path(backGrid), c.stroke();
        //
        //   console.log(+data[i]["Number of deaths due to tuberculosis, excluding HIV"].replace(/\s/g, ''))
        //
        //   projection.rotate(r(t)).clipAngle(90);
        //   c.fillStyle = "#737368", c.beginPath(), path(land), c.fill();
        //   c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
        //   c.fillStyle = colorScale(+data[i]["Number of deaths due to tuberculosis, excluding HIV"].replace(/\s/g, '')), c.beginPath(), path(countries[i]), c.fill();
        //   c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
        //   c.strokeStyle = "rgba(0, 0, 0, 0.1)", c.lineWidth = 1, c.beginPath(), path(globe), c.stroke();
        //   c.strokeStyle = "rgba(0, 0, 0, 0.1)", c.lineWidth = .5, c.beginPath(), path(grid), c.stroke();
        // };
      .transition()
      .each("end", transition);
  };

  svg.selectAll("path.land")
     .data(countries)
     .enter().append("path")
     .attr("class", "land")
     .attr("d", path);

  // transition();
  function country(cnt, sel) {
    for(var i = 0, l = cnt.length; i < l; i++) {
      if(cnt[i].id == sel.value) {return cnt[i];}
    }
  };
};

function visualize() {
  var attribute = $('#param-attribute').val();
  var year = $('#param-year').val();
  // console.log(year, attribute);

  colorScale = d3.scale.quantile()
                 .domain([0, 11, d3.max(countries, function(d){
                  //  console.log(Object.keys(d['years']));
                    if (Object.keys(d['years']).indexOf(year) >= 0)
                     return d['years'][year][attribute];
                 })])
                 .range(colors);

  //Drawing countries on the globe
  svg.selectAll("path")
     .style("fill", function(d){
      // console.log(d['years']['2011']["Number of deaths due to tuberculosis, excluding HIV"]);
      if (Object.keys(d['years']).indexOf(year) >= 0)
        return colorScale(d['years'][year][attribute]);
      else {
        return '#000000';
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
   .on("mouseover", function(d) {
    //  console.log(countryById[d.id]);
     countryTooltip.text(countryById[d.id])
     .style("left", (d3.event.pageX + 7) + "px")
     .style("top", (d3.event.pageY - 15) + "px")
     .style("display", "block")
     .style("opacity", 1);
    //  console.log(countryTooltip.style("opacity"));
   })
   .on("mouseout", function(d) {
     countryTooltip.style("opacity", 0)
     .style("display", "none");
   })
   .on("mousemove", function(d) {
     countryTooltip.style("left", (d3.event.pageX + 7) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
   });

   // Country focus on option select
   d3.select("#param-countries").on("change", function() {
     var focusedCountry = country(countries, this),
         p = d3.geo.centroid(focusedCountry);

     svg.selectAll(".focused").classed("focused", focused = false);

     //Globe rotating
     function transition() {
       d3.transition()
         .duration(2500)
         .tween("rotate", function() {
           var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
           return function(t) {
             projection.rotate(r(t));
             svg.selectAll("path").attr("d", path)
                .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
           };
         })
     };

     transition();
  });
}

function run() {
  console.log(2007+timestep);
  var attribute = $('#param-attribute').val();
  var speed = parseInt($('#param-speed').val());

  // Setting color scale
  // colorScale = d3.scale.quantile()
  //                .domain([0, 11, d3.max(countries, function(d){
  //                   //  console.log(Object.keys(d['years']));
  //                   var years = [];
  //                   for (var i = 2007; i <= 2014; i++) {
  //                     if (Object.keys(d['years']).indexOf(String(i)) >= 0)
  //                       years.push(d['years'][String(i)][attribute]);
  //                   }
  //                   return Math.max(years);
  //                })])
  //                .range(colors);

  //Setting color scale
  colorScale = d3.scale.quantile()
                 .domain([0, 11, d3.max(countries, function(d){
                    //  console.log(Object.keys(d['years']));
                    var years = [];
                    for (var i = 2007; i <= 2014; i++) {
                      if (Object.keys(d['years']).indexOf(String(i)) >= 0)
                        years.push(d['years'][String(i)][attribute]);
                    }
                    return Math.max(years);
                 })])
                 .range(colors);

  svg.selectAll("path")
    .transition()
    .duration(1000)
    .style("fill", function(d){
     // console.log(d['years']['2011']["Number of deaths due to tuberculosis, excluding HIV"]);
     if (Object.keys(d['years']).indexOf(String(2007+timestep)) >= 0)
       return colorScale(d['years'][String(2007+timestep)][attribute]);
     else {
       return '#000000';
     }
    });
  timestep++;
  if (timestep > 7) {
    timestep = 0;
    return;
  };
  window.setTimeout(run, 1000);
}

$('#load-button').bind('click', loadDataset);
$('#visualize-button').bind('click', visualize);
$('#run-button').bind('click', run);

$('#param-year').bind('input', function () { $('#param-year-value').text($('#param-year').val()); });
// $('#param-speed').bind('input', function () { $('#param-speed-value').text($('#param-speed').val()); });
