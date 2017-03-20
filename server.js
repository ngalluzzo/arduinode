const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const SerialPort = require('serialport');
const cors = require('cors');
const port = 8080;
const db = mongoose.connection;
const arduino = new SerialPort(process.argv[2], {
    baudRate: 9600,
    parser: SerialPort.parsers.readline('\n')
});

mongoose.connect('mongodb://localhost/test');
app.use(cors());
app.use(express.static('public'));

let readingSchema = mongoose.Schema({
    temperature: Number,
    humidity: Number,
    updated: { type: Date, default: Date.now }
});

let Reading = mongoose.model('Reading', readingSchema);

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('Database connection is open!');
});

io.on('connection', function (socket) {
  console.log('Socket IO connected!');
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/readings', function(req, res) {
    console.log('Fetching readings...');
    Reading.find({}, null, {sort: '-updated'}, function(err, readings){
        if (err) return console.error(err);
        res.json({readings:readings});
    })
});

server.listen(port, function() {
    console.log('Listening on port ' + port);
});

arduino.on('open', function(){
    console.log('Serial Port is open!');
});
arduino.on('data', function(data) {
    console.log('New Data! ' + data);
    let readings = data.split(' ');
    let humidity = readings[0];
    let temperature = readings[1];

    let reading = new Reading({
        temperature: temperature,
        humidity: humidity
    });
    
    reading.save(function(err, reading){
        if (err) return console.error(err);
        io.sockets.emit('reading', reading);
    });
});