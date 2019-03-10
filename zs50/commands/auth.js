const auth = require('../utils/auth'); 
const stdio = require('../utils/stdio'); 

module.exports.getAuthStatus = (options) => {

	// if reauth called explicitly, set it off
	if(options.reauth){
        auth.getCredentials().then((creds) => {
            console.log(creds);
            process.exit(0); 
        });  

        return;
    }

	// if requires re-auth, offer user choice to do so now
	if(auth.requiresAuth){
        stdio
            .prompt('No authorized dev org linked for ZS50. Authorize now? (Y/N) ')
            .then((answer) => {
                if(answer === 'Y' || answer === 'y'){
                    auth.getCredentials().then((creds) => {
                        console.log(creds); 
                        process.exit(0);
                    }); 
                } else{
                    process.exit(0); 
                }
            });
	} else {
		console.log(credentials);
		process.exit(0);
	}
}