const auth = require('./commands/auth');  
const check = require('./commands/check');
const program = require('commander'); 
const scaf = require('./commands/scaf');

module.exports = () => {

	/** version */
	program.version('0.10.0');

	/** define program commands */
	program
		.command('check <pset>')
		.description('Validates code for the provided pset and returns results.')
		.option('-r, --root-directory <path>', 'If the pset Apex files are stored locally, as when using the SFDX flow, the path to the source files.')
		.option('-v, --verbose', 'Turns on verbose debugging.')
		.action(check); 

	program
		.command('auth')
		.description('Check status of and refresh authorization for linked dev org.')
		.option('-r, --reauth', 'Refresh authorization for linked dev org.')
		.option('-o, --overwrite', 'Overwrite existing credentials with new ones.')
		.action(auth.getAuthStatus);

	program
		.command('scaf <pset>')
		.description('Prints to the terminal a scaffolded outline of class for solving the given pset.')
		.action(scaf);
		 
	program.parse(process.argv); 
}


