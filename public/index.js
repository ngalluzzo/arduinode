let parseTime = d3.timeParse('%d-%b-%y %I:%M%p');
let formatTime = d3.timeFormat('%d-%b-%y %I:%M%p');
let margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
};
let width = 960 - margin.right - margin.left;
let height = 500 - margin.bottom - margin.top;
let data = [];

function parseDate(date) {
  return parseTime(formatTime(d3.isoParse(date)));
}

function setDomains(data) {
  x.domain(d3.extent(data, function(d){ return d.updated; }));
  y.domain(d3.extent(data, function(d){ return d.temperature; }));
}

// create the svg
let svg = d3.select('body').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// x is time scale bound to width
let x = d3.scaleTime().range([0, width]);

// y is linear scale bound to height
let y = d3.scaleLinear().range([height, 0]);

// create the line
let line = d3.line()
  .x(function(d){ return x(d.updated); }) // x returns reading date
  .y(function(d){ return y(d.temperature); }) // y returns temperature reading

let xAxis = d3.axisBottom(x);
let yAxis = d3.axisLeft(y);

d3.json('http://localhost:8080/readings', function(err, d) {
  if (err) throw err;

  data = d.readings;

  console.log('Fetched data!', data);

  data.forEach(function(d){
    // reading sends ISO date so we need to parse it, then format it
    d.updated = parseDate(d.updated);
  });
  
  setDomains(data);

  // Draw the x axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr('class', 'x axis')
      .call(xAxis)
  
  // Draw the y Axis
  svg.append("g")
      .attr('class', 'y axis')
      .call(yAxis)

  // Set line path
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line);

  update(data);
});

const socket = io.connect('http://localhost:8080');

socket.on('reading', function (d) {
  d.updated = parseDate(d.updated);
  data.push(d);
  setDomains(data);
  update(data);
});

function update(data) {
  let circle = svg.selectAll("dot").data(data);

  circle.attr('class', 'update');

  circle.enter().append('circle')
      .attr('class', 'enter')
      .attr("cx", function(d) { return x(d.updated); })
      .attr("cy", function(d) { return y(d.temperature); })
      .attr("r", 5)
    .merge(circle)
      .text(function(d) { return d; })
  
  circle.exit().remove();
}