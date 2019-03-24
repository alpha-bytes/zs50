const axios = require('axios').default;
const bash = require('child_process').exec; 
const fs = require('fs');
const stdio = require('../utils/stdio');
const tooling = require('../utils/tooling');
const yaml = require('yaml');

// instantiate var for psets, and get them
const location = require('../utils/config').psetUrl; 
let psets;

async function getPsets(){
    if(psets)
        return; 

    try{
        // get psetfile, disallowing caching
        const psetFile = await axios.get(location, { headers: { 'Cache-Control': 'no-cache' } }); 
        psets = yaml.parse(psetFile.data); 
    } catch(e){
        throw e; 
    }
}

// TODO get dynamically from gist
const appended_code = '\npublic class ZS50Exception extends Exception{ }\nRetrTest rt = new RetrTest(); if(rt.getVal() != \'hello, world\'){ throw new zs50Exception(\'must equal hello, world.\'); }'; 

module.exports = async function(pset, options) {
    
    // ensure we have psets for validation
    try{
        await getPsets(); 
    } catch(e){
        stdio.err(`Could not retrieve pset validations due to exception: ${e.message}`); 
        process.exit(1);
    }

    // retrieve pset corresponding to arg value, or exit if not found
    if(!psets[pset]){
        stdio.err(`Could not find a pset for value ${pset}. Make sure spelling and capitilization are correct, and try again.`); 
        process.exit(1); 
    }

    // read file contents using fs 
    // append command calls
    // send to execute anonymous endpoint in Tooling API
    // evaluate response and report back to user
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
        if(e.requiresAuth){
            stdio.warn(e.message); 
            process.exit(0);
        }

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
}