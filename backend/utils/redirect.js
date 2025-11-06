#!/usr/bin/env node
// Redirect to backend subdirectory
process.chdir('/home/site/wwwroot/backend');
require('./backend/server.js');

