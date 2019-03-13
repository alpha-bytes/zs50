const bash = require('child_process').exec; 
const fs = require('fs');
const stdio = require('../utils/stdio');
const tooling = require('../utils/tooling');

// TODO get dynamically from gist
const appended_code = '\npublic class ZS50Exception extends Exception{ }\nRetrTest rt = new RetrTest(); if(rt.getVal() != \'hello, world\'){ throw new zs50Exception(\'must equal hello, world.\'); }'; 

module.exports = async function(pset, options) {
    // retrieve pset corresponding to arg value
    try{
        stdio.warn('Retrieving Apex...');
        let apex = await tooling.getApex('RetrTest'); 
        apex += appended_code; 
        stdio.warn('Executing Apex...');
        if(options.verbose)
            stdio.highlight(apex); 

        let result = await tooling.executeAnonApex(apex); 
        stdio.success(); 
        process.exit(0); 
    } catch(e){
        stdio.err(`Well darn it. We encountered the following error: ${e.message}`);
        if(options.verbose){
            stdio.err(e); 
            process.exit(1);
        } else{
            stdio.prompt('Print more info? (Y/N)').then(answer => {
                if(answer === 'Y' || answer === 'y')
                    stdio.warn(e); 
                
                process.exit(0); 
            }).catch(err => {
                stdio.err(`Could not print info. Unexpected error encountered: ${err.message}`); 
                process.exit(1); 
            });
        }
    }

    // read file contents using fs 
    // append command calls
    // send to execute anonymous endpoint in Tooling API
    // evaluate response and report back to user
}