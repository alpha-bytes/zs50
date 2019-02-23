const bash = require('child_process').exec; 

module.exports = () => {
    const cmd = 'ls'; 
    bash(cmd, (error, stdout, stderr) =>{
        if(stderr)
            console.error(stderr);
        if(stdout)
            console.log(stdout);
    })
}; 