const bash = require('child_process').exec; 
const fs = require('fs');
const stdio = require('../utils/stdio');
const tooling = require('../utils/tooling');

module.exports = function(pset, options) {
    // retrieve pset corresponding to arg value
    let apex; 
    tooling.getApex('RetrTest').then((apexBody) => {
        stdio.highlight(apexBody); 
        apex = apexBody; 
        process.exit(0); 
    }).catch(err => {
        stdio.warn(`Well darn it. We encountered the following error: ${err.message}`); 
        process.exit(1); 
    });

    // read file contents using fs 
    // append command calls
    // send to execute anonymous endpoint in Tooling API
    // evaluate response and report back to user
}