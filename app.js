'use strict';


const async = require('async'),
    express = require('express'),
    expressSetup = require('./setup/express'),
    routesSetup = require('./setup/routes'),
    compressSetup = require('./setup/compress'),
    config = require('./config'),
    log4js = require('log4js'),
    path = require('path');


log4js.configure({
    appenders: [
        {
            type : 'console'
        }
    ],
    replaceConsole : true
});

const logger = log4js.getLogger('console');

logger.setLevel('INFO');


const app = express();

// setup express
expressSetup(app, config, log4js);

// setup routes
routesSetup(app);

// compress public js
compressSetup();



// Since this is the last non-error-handling middleware use()d,
// we assume 404, as nothing else responded. Test:
// $ curl http://localhost:8484/notfound
// $ curl http://localhost:8484/notfound -H "Accept: application/json"
// $ curl http://localhost:8484/notfound -H "Accept: text/plain"

app.use( (req, res, next) => {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', {
            url : req.url
        });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({
            error : 'Not found'
        });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');

});


// Error-handling middleware, take the same form as regular middleware,
// however they require an arity of 4, aka the signature (error, req, res,
// next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling middleware
// would
// then be executed, or if we next(error) to continue passing the error,
// only
// error-handling middleware would remain being executed, however here
// we
// simply respond with an error page.

app.use( (error, req, res, next) => {
    // we may use properties of the error object
    // here and next(error) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(error.status || 500);
    res.render('500', {
        error : error
    });
    console.log('Caught exception: ' + error + '\n' + error.stack);
    console.log('\u0007'); // Terminal bell
});

/**
 * Global variable holding application root
 */
global.appRoot = path.resolve(__dirname);

// expose app
module.exports = app;


