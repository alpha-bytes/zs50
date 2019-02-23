const bash = require('child_process').exec; 
const fs = require('fs');

module.exports = () => {
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