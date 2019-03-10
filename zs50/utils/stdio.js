const colors = require('colors');
const readline = require('readline');

const style_highlight = colors.bgMagenta; 
const style_input = colors.yellow; 
const style_warn = colors.bgRed;

// instantiate interface for collecting user input
process.stdin.setEncoding('utf-8');
const rl = readline.createInterface({
	input: process.stdin, 
	output: process.stdout
});

/**
 * 
 * @param {string} msg The message to display to the user
 * @param {string} level The messaging level, which dicates ascii styling. 
 * @param {boolean} awaitInput When true, will await user input before resolving Promise.
 * @returns {Promise}
 */
function stdio(msg, level, awaitInput){
    return new Promise(function(resolve, reject){
        try{
            if(!awaitInput){
                console.log(level(msg)); 
                resolve(); 
            } else{
                rl.question(level(msg), (input) => {
                    resolve(input); 
                });
            }
        } catch(e){
            reject(e); 
        }
    }); 
}

module.exports.prompt = (msg) => {
    return stdio(msg, style_input, true); 
}

module.exports.highlight = (msg) => {
    return stdio(msg, style_highlight, false); 
}

module.exports.warn = (msg) => {
    return stdio(msg, style_warn, false); 
}