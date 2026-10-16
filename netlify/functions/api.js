const serverless = require('serverless-http');
const app = require('../../server');

// Wrap Express app with serverless-http for Netlify Functions
module.exports.handler = serverless(app);
