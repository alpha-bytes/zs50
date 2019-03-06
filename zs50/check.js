const bash = require('child_process').exec; 
const fs = require('fs');

module.exports = function (pset, options) {
    console.log(pset); 
    console.log(options.username); 
}