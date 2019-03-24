const fs = require('fs'); 
const yaml = require('yaml');

const file = fs.readFileSync(`${__dirname.replace('utils', 'config')}/defaults.yml`, 'utf-8'); 
const config = yaml.parseDocument(file).toJSON(); 

module.exports = config; 