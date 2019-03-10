const auth = require('./commands/auth');  
const check = require('./commands/check');
const program = require('commander'); 

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
		.action(auth.getAuthStatus);
		 

	program.parse(process.argv); 
}


