const colors = require('colors'); 
const program = require('commander');
const readline = require('readline'); 
// own modules
const auth = require('./utils/auth');  
const check = require('./commands/check');

// instantiate interface for collecting user input
process.stdin.setEncoding('utf-8');
const rl = readline.createInterface({
	input: process.stdin, 
	output: process.stdout
});

function getInput(msg){
	msg = msg ? msg + ' ' : 'Provide Input: '; 
	rl.question(msg, (input) => {
		console.log(input); 
	});
}

function getAuthStatus(){
	if(!auth.getAuthStatus()){
		// TODO needs to utilize event listener
		const getCred = getInput(colors.red('No org linked for ZS50. Authorize now (Y|N)?')); 
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
		.action(getAuthStatus);
		 

	program.parse(process.argv); 
}


