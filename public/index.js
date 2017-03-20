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

function parseDate(date) {
  return parseTime(formatTime(d3.isoParse(date)));
}

const socket = io.connect('http://localhost:8080');

socket.on('reading', function (d) {
  d.updated = parseDate(d.updated);
  data.push(d);
  render(data);
});

// create the svg
let svg = d3.select('body').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

d3.json('http://localhost:8080/readings', function(err,d){
  if(err) throw err
  
  d.readings.forEach(function(r){
    r.updated = parseDate(r.updated);
  })

  let data = d.readings;

  x.domain(d3.extent(data, function(d){ return d.updated; }));
  y.domain([0,100]);

  svg.append('g') // draw the x axis
    .attr('class', 'x axis')
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append('g') // draw the y axis
    .attr('class', 'y axis')
    .call(yAxis)
  
  svg.append('path') // draw the line
     .attr('class', 'line')
     .attr('d', line(data))

  
  render(data)
});

function render(data) {
  let circle = svg.selectAll('circle').data(data);

  x.domain(d3.extent(data, function(d){ return d.updated; }));
  y.domain([0,100]);

  circle.exit()
        .attr('class', 'exit')
        .remove()

  circle.attr('class', 'update')

  circle.enter().append('circle')
      .attr('class', 'enter')
      .attr('r', 5)
      .attr('cx', function(d) { return x(d.updated) })
      .attr('cy', function(d) { return y(d.temperature) })
    .merge(circle)

    svg.select(".line")
          .transition()
          .attr("d", line(data));
      svg.select(".x.axis")
          .transition()
          .duration(750)
          .call(xAxis);
      svg.select(".y.axis")
          .transition()
          .call(yAxis);
}