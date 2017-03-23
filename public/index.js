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

const socket = io.connect('http://localhost:8080');

socket.on('reading', function (d) {
  console.log('new data!', d);
  d.updated = parseDate(d.updated);
  data.unshift();
  render(data);
});

// create the svg
let svg = d3.select('body').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleTime().range([0, width]); // x is time scale bound to width
let y = d3.scaleLinear().range([height, 0]); // y is linear scale bound to height

let xAxis = d3.axisBottom(x); // create an x axis
let yAxis = d3.axisLeft(y); // create a y axis

let tLine = d3.line() // create a new d3 line
  .x(function(d){ return x(d.updated); }) // x maps to reading date
  .y(function(d){ return y(d.temperature); }) // y maps to temperature reading

let hLine = d3.line() // create a new d3 line
  .x(function(d){ return x(d.updated); }) // x maps to reading date
  .y(function(d){ return y(d.humidity); }) // y maps to humidity reading

d3.json('http://localhost:8080/readings', function(err,d){ // get new json data
  if(err) throw err
  
  d.readings.forEach(function(r){
    r.updated = parseDate(r.updated); // parse the date for d3
  })

  data = d.readings;

  x.domain(d3.extent(data, function(d){ return d.updated; })); // x domain is extent of dates
  y.domain([0,70]); // y is hard-coded for now... TODO: set to lowest / highest temp or humidity reading

  svg.append('g') // draw the x axis
    .attr('class', 'x axis') // give it class .x.axis
    .attr("transform", "translate(0," + height + ")") // move it to the bottom
    .call(xAxis); // call the x axis we created earlier

  svg.append('g') // draw the y axis
    .attr('class', 'y axis') //give it class .y.axis
    .call(yAxis) //  call the y axis we created earlier

  render(data); // do the initial render
});

function render(data){
  x.domain(d3.extent(data, function(d){ return d.updated; })); // x domain is extent of NEW dates
  y.domain([0,70]); // y is hard-coded for now... TODO: set to NEW lowest / highest temp or humidity reading

  let t_path = svg.selectAll('.temperature.line') //select the temperature line
      .data([data]); // assign it the new data
  
  let h_path = svg.selectAll('.humidity.line') //select the humidity line
      .data([data]); // assign it the new data

  t_path.enter().append('path') //create the initial temperature path
    .merge(t_path) //merge new line with any existing line
      .attr('class', 'temperature line') //give it class .temperature.line
      .style('stroke', 'red') //give it a red stroke
      .attr('d', tLine) //map the path with the temperature line we created earlier
 
//  h_path.style('stroke', 'green') // update the existing humidity line and give it a green stroke

  h_path.enter().append('path') //create the initial temperature path
    .merge(h_path) //merge new line with any existing line
      .attr('class', 'humidity line') //give it class .humidity.line
      .attr('d', hLine) //map the path with the humidity line we created earlier
/*
  let t_circle = svg.selectAll('.temperature.circle')
      .data(data)
  let h_circle = svg.selectAll('.humidity.circle')
      .data(data)
 
  t_circle.exit().remove();
  h_circle.exit().remove();

  t_circle.enter().append('circle')
      .attr('r', 1)
    .merge(t_circle)
      .attr('cx', function(d){ return x(d.updated) })
      .attr('cy', function(d){ return y(d.temperature) })

  h_circle.enter().append('circle')
      .attr('r', 1)
    .merge(h_circle)
      .attr('cx', function(d){ return x(d.updated) })
      .attr('cy', function(d){ return y(d.humidity) })

*/
}