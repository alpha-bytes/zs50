const config = require('../utils/config');
const psets = require('../utils/psets');
const stdio = require('../utils/stdio');
const tooling = require('../utils/tooling');

module.exports = async function(psetName, options) {
    
    let pset; 

    // ensure we have psets for validation
    try{
        pset = await psets.getPset(psetName);
    } catch(e){
        stdio.err(`Could not retrieve pset validations due to exception: ${e.message}`); 
        if(options.verbose)
            stdio.warn(e);

        process.exit(1);
    }

    // read file contents using fs 
    // append command calls
    // send to execute anonymous endpoint in Tooling API
    // evaluate response and report back to user
    try{
        stdio.warn(`Retrieving ${pset.apexName} class from ${ config.mode === 'local' ? 'default local directory...' : 'authorized SF org...' }`);
        let classBody = await tooling.getApex(pset.apexName); 
        stdio.warn('Validating assertions in authorized org...');
        if(options.verbose)
            stdio.highlight(classBody); 

        let result = await tooling.executeAnonApex(pset.buildAnonTest(classBody)); 
        stdio.success(); 
        process.exit(0); 
    } catch(e){
        if(e.requiresAuth){
            // TODO implement event emitter for invalid auth
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