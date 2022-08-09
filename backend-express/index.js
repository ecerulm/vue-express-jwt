const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const logger = require('./logger');
const dbFactory = require('./db');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');
const jose = require('jose');
const crypto = require('crypto');


(async () => {    
    // Load EdDSA (ed25519) private key from filesystem to use for signing JWTs
    const privateKey = await jose.importPKCS8(
        fs.readFileSync('./eddsaprivate.pem').toString(),
        'EdDSA'
    );
    const publicKey = crypto.createPublicKey(privateKey);
    const privateJwk = await jose.exportJWK(privateKey);
    privateJwk.kid = await jose.calculateJwkThumbprint(privateJwk, 'sha256');
    const publicJwk = await jose.exportJWK(publicKey);
    publicJwk.kid = await jose.calculateJwkThumbprint(publicJwk, 'sha256');
    const certContents = fs.readFileSync('./publiccert.pem');
    // const publicCert = await jose.importX509(fs.readFileSync('./publiccert.pem').toString());
    const publicCert = new crypto.X509Certificate(certContents);
    const x5t = crypto.createHash('sha1').update(publicCert.raw).digest('base64url');
    console.log('publiccert', x5t);

    const keys = {}
    keys[privateJwk.kid] = {
        "publicKey": publicKey,
        "publicCert": publicCert,
        "x5t": x5t,
        "privateKey": privateKey, 
    }

    // MongoDB create user
    logger.info("Create initial user");
    const  conn = dbFactory();
    const User = conn.model('User')
    User.collection.drop();
    const initialUser = new User({username: 'aaa', password: 'bbb'})
    const savedDocument = await initialUser.save()
    logger.info('saved %s', savedDocument);
    logger.info('password matched %s', await initialUser.comparePassword('bbb'));
    
    
    // ------
    
    logger.info("About to create express app")
    
    const app = express();
    
    app.use(bodyParser.json())
    
    const corsOptions = {
        origin: 'http://localhost:5173'
    };
    
    app.use(cors(corsOptions));
    
    app.use(morgan('combined'));

    app.post('/api/login', (req,res,next) => {
        const username = req.body.username
        const password = req.body.password
        // logger.info("request body username: %s password: %s", username, password)
        User.findOne({username}, (err, user) => {
            if (err) {
                return res.status(401).json({message: "Invalid credentials"});
            }
            
            if (user === null) {
                return res.status(401).json({message: "Invalid credentials"});
            }
            
            logger.info('Found the user %s in MongoDB', user.username);
            
            // https://github.com/kelektiv/node.bcrypt.js#with-promises
            user.comparePassword(password).then((isMatch) => {
                if (!isMatch) {
                    console.log('The supplied password for username %s was incorrect', username);
                    return res.status(401).json({message: "Invalid credentials"});
                }
                
                logger.info('provided password for %s was correct. Generating a JWT', user.username);

                return new jose.SignJWT({})
                .setSubject(user.username)
                .setIssuer('http://backend-express.com')
                .setAudience('http://backend-express.com')
                .setProtectedHeader({
                    alg: 'EdDSA',
                    kid: privateJwk.kid,
                    typ: 'JWT',
                    x5t: x5t,
                })
                .setIssuedAt()
                .setExpirationTime('2h')
                .sign(privateKey); 
            })
            .then(token => {
                console.log('jose.SignJWT',token);
                return res.send({
                    message: "login successful", 
                    token,
                });
            })
            .catch(err => {
                log.err("error checking the authorization header");
                return res.status(401).json({message: "Invalid credentials"});
            });
        });        
    });


    app.use(async (req,res,next) => {
        // Check for Authorization: Bearer
        // parse JWT , validate , if valid put the sub claim into username

        const authHeader = req.header('Authorization');
        if (authHeader === undefined) {
            return next(); // continue without setting the username
        }

        // assume starts with Bearer: 
        if (!authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.slice(7); // Remove the Bearer 

        //now parse the JWT token

        // look into the jwt and get the key id (kid) used to sign this token 
        // check that is one of our keys. In principle this is not needed
        // because there is only one key
        var jwtHeader = null;
        try {
            jwtHeader = jose.decodeProtectedHeader(token);
        } catch (err) {
            return next();
        }
        const kid = jwtHeader.kid; 
        if (kid !== privateJwk.kid) {
            console.log("JWT kid does not match any of the keys we use")
            return; 
        }

        // both the kid and x5t uniquely identify which private key was used to sign the toke
        // for kid we are using JWK Thumbprint method  (we can choose)
        // for x5t must be the sha-1 of the x.509 associated with the private key, encoded in base64
        // since both kid and x5t uniquely identify we could use any but we use kid. 

        //console.log(kid);
        //console.log(keys);

        const keyToUse = keys[kid].publicKey;
        //console.log(keyToUse);


        jose.jwtVerify(token, keyToUse, {
            issuer: 'http://backend-express.com',
            audience: 'http://backend-express.com',
            algorithms: ['EdDSA'],
        })
            .then(({payload, protectedHeader})=>{
                console.log(payload);
                logger.info("Setting req.username to %s", payload.sub);
                req.username = payload.sub;
                return next();
            })
            .catch((err) => {
                logger.error(err);
                return unauthorized(req,res,next);
            })


    });
    
    app.get('/api/userinfo', (req, res) => {
        logger.info("processing api/userinfo for %s", req.username);
        res.json({
            loggedIn: req.username !== undefined,
            username: req.username,
        })
    });


    const requireAuth = express.Router();
    requireAuth.use((req,res,next) => {
        if (!req.username) {
            return unauthorized(req, res,next);
        }
        return next();
    });

    requireAuth.get('/api/getcounter', (req, res, next) => {
 
        User.findOne({username: req.username}, (err, user) => {
            if (err) {
                return res.status(401).json({message: "Invalid credentials"});
            }
            
            if (user === null) {
                return res.status(401).json({message: "Invalid credentials"});
            }

            return res.json({counter: user.counter});
        });
        
    });

    requireAuth.post('/api/increasecounter', (req, res, next) => {
        logger.info('increasecounter')

        User.findOne({username: req.username}, (err, user) => {
            if (err) {
                return res.status(401).json({message: "Invalid credentials"});
            }
            
            if (user === null) {
                return res.status(401).json({message: "Invalid credentials"});
            }

            user.counter++;
            user.save().then((savedDoc) => {
                logger.info('saved document')
                res.json({counter: savedDoc.counter});
            });
        });
    });

    app.use(requireAuth);
    
    app.use(function(req,res) {
        res.status(404);
        res.send("File not found!");
    });
    
    app.listen(5001, function() {
        console.log('App started on port 5001');
    });      
})();

async function unauthorized(req, res, next) {
    res.status(403).json({"message": "Unauthorized"})
}