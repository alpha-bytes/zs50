const auth = require('../utils/auth'); 
const stdio = require('../utils/stdio'); 

let credentials; 

function handleSuccess(creds){
    stdio.highlight(`Authorization successful for username ${creds.uname}`); 
    credentials = creds; 
    process.exit(0); 
}

function handleErr(err){
    stdio.err(`Awww shucks. Something unexpected happened: ${err.message}`); 
    process.exit(1);
}

module.exports.getAuthStatus = (options) => {

	// if reauth called explicitly, set it off
	if(options.reauth){
        auth.setCredentials().then(handleSuccess).catch(handleErr); 
        return;
    }

	// if requires re-auth, offer user choice to do so now
	if(auth.requiresAuth()){
        stdio
            .prompt('No authorized dev org linked for ZS50. Authorize now? (Y/N) ')
            .then((answer) => {
                if(answer === 'Y' || answer === 'y'){
                    auth.setCredentials().then(handleSuccess).catch(handleErr);  
                } else{
                    process.exit(0); 
                }
            });
	} else {
        stdio.highlight(`Authorization active for username ${auth.getCredentials().uname}.`);
		process.exit(0);
	}
}