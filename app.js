"use strict";

const express = require('express');
const app = express();

const mongoose = require('mongoose'); 
const path = require('path');
const schedule = require('node-schedule');
const session = require('express-session');

// Use default store when testing on Windows.  On Linux remove the comments below and turn on Redis.  Also turn on Redis in the session.
//const redis = require('redis');
//let RedisStore = require('connect-redis')(session);
//let redisClient = redis.createClient();

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '/models/.env')});

const accountExpirations = require('./controllers/account-expirations');
const emailReminders = require('./controllers/email-reminders');
const endpointsUserAccounts = require('./controllers/endpoints-user-accounts');
const endpointsStripe = require('./controllers/endpoints-stripe');
const endpointsDefault = require('./controllers/endpoints-default');
const { customExpressErrorHandler, logErrorMessage } = require('./controllers/error-handling');
const siteValue = require('./models/site-values');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In the production app NGINX will serve static files and this shouldn't be needed.
app.use(express.static( path.join(__dirname, 'views/public')));

app.use(
    session({
        // maxAge: 24 hours
        maxAge: 24 * 60 * 60 * 1000,
        name: process.env.SESSION_NAME,
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        // Use default store when testing on Windows.  On Linux remove the comment below to turn on the Redis store.
        // store: new RedisStore({ client: redisClient }),
        cookie: {
            sameSite: 'lax',
            // secure: true requires internal https but when Nginx is configured as a reverse proxy it uses http by default to communicate with Node.js.  
            // Nginx does this because http is much less processor intensive.  All communication to the outside world still uses secure https.
            secure: false
        } 
    })
);

app.use(endpointsUserAccounts);
app.use(endpointsStripe);
app.use(endpointsDefault);
app.use(customExpressErrorHandler);

mongoose.connect(process.env.DB_CONNECTION, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then( function() {
        console.log('mongoose connected');
    })
    .catch( function(error) {
        logErrorMessage(error);
    });

app.listen(siteValue.port, function(){
    console.log(`app.js listening on port ${ siteValue.port }`);
});

// Run this at 1am every night.
const scheduleAccountExpirations = schedule.scheduleJob('* 1 * * *', function() {
    accountExpirations.expireOldPremiumAccounts();
});

// Run this at 1:15am every night.
const scheduleFirstAlertEmailReminders = schedule.scheduleJob('15 1 * * *', function() {
    emailReminders.firstAlertBeforeExpiration();
});

// Run this at 1:30am every night.
const scheduleSecondAlertEmailReminders = schedule.scheduleJob('30 1 * * *', function() {
    emailReminders.secondAlertBeforeExpiration();
});

// Run this at 1:45am every night.
const scheduleFinalAlertEmailReminders = schedule.scheduleJob('45 1 * * *', function() {
    emailReminders.finalAlertBeforeExpiration();
});

// close mongoose connection gracefully when app is terminated with ctrl-c.
process.on('SIGINT', function() {
    mongoose.connection.close(function() { process.exit(0); });
});