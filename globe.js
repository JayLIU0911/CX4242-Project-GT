var margin = { top: 20, right: 20, bottom: 20, left: 20 },
    w = 900,
    h = 900,
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom,
    sens = 0.25,
    focused;

//Setting projection

var projection = d3.geo.orthographic()
                   .scale(300)
                   .rotate([0, 0])
                   .translate([width / 2, height / 2])
                   .clipAngle(90);

var path = d3.geo.path()
             .projection(projection);

//SVG container

var svg = d3.select("body").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
    countryList = d3.select("body").append("select").attr("name", "countries");

var title = d3.select("h1");

queue()
.defer(d3.json, "data/world-110m.json")
.defer(d3.tsv, "data/world-110m-country-names.tsv")
.defer(d3.csv, "data/tubercolusis_from 2007_WHO.csv")
.await(ready);

//Main function

function ready(error, world, countryData, data) {

  if (error) throw error;

  var countryById = {},
      countries = topojson.feature(world, world.objects.countries).features
      i = -1
      n = countries.length;

  //Adding countries to select

  countryData.forEach(function(d) {
    countryById[d.id] = d.name;
    option = countryList.append("option");
    option.text(d.name);
    option.property("value", d.id);
  });

  //Setring country names
  countries = countries.filter(function(d) {
    return countryData.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  //Drawing countries on the globe

  var world = svg.selectAll("path.land")
                 .data(countries)
                 .enter().append("path")
                 .attr("class", "land")
                 .attr("d", path)

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
    countryTooltip.text(countryById[d.id])
    .style("left", (d3.event.pageX + 7) + "px")
    .style("top", (d3.event.pageY - 15) + "px")
    .style("display", "block")
    .style("opacity", 1);
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

  d3.select("select").on("change", function() {
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
      //   return function(t) {
      //     c.clearRect(0, 0, width, height);

      //     projection.rotate(r(t)).clipAngle(180);
      //     c.fillStyle = "#dadac4", c.beginPath(), path(land), c.fill();
      //     c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
      //     c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
      //     c.strokeStyle = "#000", c.lineWidth = 1, c.beginPath(), path(globe), c.stroke();
      //     c.strokeStyle = "rgba(0, 0, 0, 0.05)", c.lineWidth = .5, c.beginPath(), path(backGrid), c.stroke();

      //     console.log(+data[i]["Number of deaths due to tuberculosis, excluding HIV"].replace(/\s/g, ''))

      //     projection.rotate(r(t)).clipAngle(90);
      //     c.fillStyle = "#737368", c.beginPath(), path(land), c.fill();
      //     c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
      //     c.fillStyle = colorScale(+data[i]["Number of deaths due to tuberculosis, excluding HIV"].replace(/\s/g, '')), c.beginPath(), path(countries[i]), c.fill();
      //     c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
      //     c.strokeStyle = "rgba(0, 0, 0, 0.1)", c.lineWidth = 1, c.beginPath(), path(globe), c.stroke();
      //     c.strokeStyle = "rgba(0, 0, 0, 0.1)", c.lineWidth = .5, c.beginPath(), path(grid), c.stroke();
      //   };
      .transition()
      .each("end", transition);
  };

  transition();

  function country(cnt, sel) { 
    for(var i = 0, l = cnt.length; i < l; i++) {
      if(cnt[i].id == sel.value) {return cnt[i];}
    }
  };

};