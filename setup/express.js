'use strict';

/**
 * Module dependencies.
 */

const express = require('express')
    , session      = require('express-session')
    , errorHandler = require('errorhandler')
    , util = require('util')
    , bodyParser = require('body-parser')
    , connect = require('connect')
    , flash = require('express-flash')
    , methodOverride = require('method-override')
    , cookieParser = require('cookie-parser')
    , compress = require('compression')
    , pkg = require('../package.json')
    , http = require('http')
    , https = require('https')
    , request = require("request");

const env = process.env.NODE_ENV || 'dev';
// Controls logging
let showconsole = false;


module.exports = function (app, config, log4js) {

    app.set('showStackError', true);

    // define a custom res.message() method which stores messages in the session
    // Taken from Express MVC example (better than connect-flash?)
    app.response.message = function(msg) {
        // reference 'req.session' via the 'this.req' reference
        let sess = this.req.session;
        // simply add the msg to an array for later
        sess.messages = sess.messages || [];
        sess.messages.push(msg);
        return this;
    };


    /*
     * ==================================================
     *                   View Engine
     * ==================================================
     */

    app.set('views', __dirname + '/../views');
    app.set('view engine', 'pug');


    /*
     * ==================================================
     *            Configuration - Environments
     * ==================================================
     */

     if (env === 'dev') {
         showconsole = true; // Turn on logging

         // Keep search engines out using robots.txt
         app.all('/robots.txt', function (req, res) {
             res.charset = 'text/plain';
             res.send('User-agent: *\nDisallow: /');
         });

         app.locals.pretty = true; // line breaks in the jade output
         app.use(errorHandler({
             dumpExceptions: true,
             showStack: true
         }));
     }



    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        next();
    });


    /*
     * =================================================
     * The app.locals values are passed to all templates, and it's
     * how helpers are defined in Express 4 applications. This is useful for
     * providing helper functions to templates, as well as app-level data.
     * ===================================================
     */


    app.locals.title =  config.title;
    app.locals.email = config.email;
    app.locals.description = config.description;
    app.locals.author = config.author;
    app.locals.keywords = config.keywords;
    app.locals.version = config.version;

    app.locals.user = '';
    app.locals.env = env;

    app.locals.errors = {};
    app.locals.message = {};
    app.locals.dataconfig = {};
    app.locals.connections = [];

    /*
     * ===========================================================
     * NOTE: The port environment variable is process.env.PORT,
     * assign its value to the port variable, or assign 8080 if
     * environment variable is not set (doesn't exist).
     * ===========================================================
     */



    app.set('port', process.env.PORT || 3030);

    app.use(cookieParser());

    const server = http.createServer(app);


    server.listen(app.get('port'), function () {
        console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
    });
    server.timeout = 30000; // 30 seconds
    http.globalAgent.maxSockets = 1000;



    app.use(session({
        secret: '7434f917c8b18g5',
      //  store: store,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
    }));




    app.use(flash()); // for passport messages - must come after sessions and before passport init
    //app.use(passport.initialize());
    //app.use(passport.session({pauseStream: true}));
    //app.use(passport.session());
    app.use(compress()); // for GZIP compression


    // app.locals are app-wide, res.locals are response specific.
    app.use( (req, res, next) => {
        res.locals.session = req.session;
        next();
    });

    /*
     * ==================================================
     *                  Other Middleware
     * ==================================================
     */


    // setup bodyParser
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // support _method (PUT in forms etc)
    app.use(methodOverride());



    app.use(express.static(__dirname + '/../public'));


};
