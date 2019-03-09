const colors = require('colors'); 
const program = require('commander');
const readline = require('readline'); 
// own modules
const auth = require('./utils/auth');  
const check = require('./commands/check');

// establish listener for new credentials, emitted on auth.getCredentials()
auth.on('auth', function(credentials){
	console.log(credentials);
	process.exit(0); 
}); 

// instantiate interface for collecting user input
process.stdin.setEncoding('utf-8');
const rl = readline.createInterface({
	input: process.stdin, 
	output: process.stdout
});

// TODO modularize to commands folder
function getAuthStatus(options){

	// if reauth called explicitly, set it off
	if(options.reauth)
		auth.getCredentials(); 

	// if requires re-auth, offer user choice to do so now
	if(auth.requiresAuth){
		rl.question(colors.red('No authorized dev org linked for ZS50. Authorize now? (Y/N) '), (answer) => {
			if(answer === 'Y' || answer === 'y'){
				auth.getCredentials();
			} else{
				process.exit(0); 
			}
		}); 
	} else {
		console.log(credentials);
		process.exit(0);
	}
}

module.exports = () => {

	/** define program commands */
	program
		.command('check <pset>')
		.description('Evaluates the code for the provided pset and returns a response.')
		.option('-r, --root-directory <path>', 'If the pset Apex files are stored locally, as when using the SFDX flow, the path to the source files.')
		.action(check); 

	program
		.command('auth')
		.description('Provides information on authorization status of linked org.')
		.option('-r, --reauth', 'Overwrite existing authorization with new credentials.')
		.action(getAuthStatus);
		 

	program.parse(process.argv); 
}


