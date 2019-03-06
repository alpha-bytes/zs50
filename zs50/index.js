const colors = require('colors'); 
const program = require('commander');
// own modules
const check = require('./check');

module.exports = () => {

	// define program commands
	program
		.command('check <pset>')
		.option('-u, --username <uname>', 'Username of the Salesforce org from which pset file(s) will be retrieved.')
		.action(check)

	program.parse(process.argv)

}

