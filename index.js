const express = require('express');
const mongoose = require('mongoose');

let app = express();
let db = mongoose.connection;

let readingSchema = mongoose.Schema({
    temperature: String,
    humidity: String
});

let Reading = mongoose.model('Reading', readingSchema);

let reading = new Reading({
    temperature: "20",
    humidity: "30"
});
/*
reading.save(function(err, reading){
    if (err) return console.error(err);
    console.log(reading);
});*/

Reading.find(function(err, readings){
    if (err) return console.error(err);
    console.log(readings);
});

mongoose.connect('mongodb://localhost/test');

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Database connection is open!');
});

app.get('/', function(req,res) {
    res.send('Hello World!');
});

app.listen(3000, function() {
    console.log('Listening on port 3000!');
});