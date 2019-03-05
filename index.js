const bash = require('child_process').exec; 
const colors = require('colors'); 
const fs = require('fs');
const program = require('commander');

module.exports = () => {
    // initialize commander program
    program
        .version('0.1.0')
        .usage('check [options]')
        .parse(process.argv); 

    // TODO remove; test-child-process
    const cmd = 'ls'; 
    bash(cmd, (error, stdout, stderr) =>{

        if(stderr)
            return console.error(stderr);
        
        // read contents of file
        fs.readFile('package.json', 'utf-8', (err, data) =>{
            console.log(data); 
        }); 
        
    })
}; 