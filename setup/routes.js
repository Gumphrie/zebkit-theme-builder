'use strict';

const config = require('../config');

module.exports = app =>
{
    // --- GET Routes
    app.get('/', (req,res) => { res.render('index', { title: 'UI Demo', theme: config.theme }); });

    // --- POST Routes

    // --- Error Routes (always last!)
    app.get('/404', fourofour);
    app.get('/403', fourothree);
    app.get('/500', fivehundred);
};





///GET /404
///////////////////////////////
const fourofour = (req, res, next) => {
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
};

///GET /403
///////////////////////////////
const fourothree = (req, res, next) => {
    // trigger a 403 error
    let err = new Error('Not Allowed!');
    err.status = 403;

    // respond with html page
    if (req.accepts('html')) {
        res.render('403', {
            err: err,
            url: req.url
        });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not Allowed!' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not Allowed!');

    next(err);
};

///GET /500
///////////////////////////////
const fivehundred = (req, res, next) => {
    // trigger a generic (500) error
    next(new Error('Testing 1,2,3!'));
};
