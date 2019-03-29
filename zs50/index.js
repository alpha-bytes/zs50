const auth = require('./commands/auth');  
const check = require('./commands/check');
const program = require('commander'); 
const scaf = require('./commands/scaf');

module.exports = () => {

	/** define program commands */
	program
		.command('check <pset>')
		.description('Evaluates the code for the provided pset and returns a response.')
		.option('-r, --root-directory <path>', 'If the pset Apex files are stored locally, as when using the SFDX flow, the path to the source files.')
		.option('-v, --verbose', 'Turns on verbose debugging.')
		.action(check); 

	program
		.command('auth')
		.description('Provides information on authorization status of linked org.')
		.option('-r, --reauth', 'Overwrite existing authorization with new credentials.')
		.action(auth.getAuthStatus);

	program
		.command('scaf <pset>')
		.description('Prints to the terminal a scaffolded outline of class for solving the given pset.')
		.action(scaf);
		 

	program.parse(process.argv); 
}


