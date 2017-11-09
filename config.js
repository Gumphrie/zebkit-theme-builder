'use strict';

/* ==========================================================
 * The basics
 * ========================================================== */
const config = {};
config.title            = 'ZebkitThemeBuilder';
config.description      = 'ZebkitThemeBuilder';
config.author           = 'Howard Meadows';
config.email            = '';
config.keywords         = '';
config.version          = '1.0';



/* ==========================================================
 * Misc
 * ========================================================== */

config.envs =
{
    env: process.env.NODE_ENV || 'dev'
};

config.theme            = 'bootstrap';

module.exports = config;