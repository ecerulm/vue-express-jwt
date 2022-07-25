const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const app = express();

app.use(morgan('combined'));


app.get('/', (req, res, next) => {
  res.set('Content-Type', 'text/plain');
  res.send('hello world\n');
});

app.use(function(req, res, next) {
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function(err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        } else {
            next(); // next middleware , 404 
        }
    })
});


app.use(function(req,res) {
    res.status(404);
    res.send("File not found!");
});
app.listen(5001, function() {
    console.log('App started on port 5001');
});
