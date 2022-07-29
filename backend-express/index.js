const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const logger = require('./logger');
const dbFactory = require('./db');

logger.info("About to create express app")

const app = express();


app.use(morgan('combined'));

app.use(bodyParser.json())


app.post('/api/login', (req,res,next) => {
    const username = req.body.username
    const password = req.body.password
    logger.info("request body username: %s password: %s", username, password)

    res.json({message: "ok"});

});


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


// create a default user in the database
// obviously this is just for demonstration purposes.
(async () => {
    // MongoDB create user
    logger.info("Create initial user");
    const  conn = dbFactory();
    const User = conn.model('User')
    User.collection.drop();
    const initialUser = new User({username: 'aaa', password: 'bbb'})
    const savedDocument = await initialUser.save()
    logger.info('saved %s', savedDocument);
    logger.info('password matched %s', await initialUser.comparePassword('bbb'));

})();