const colors = require('colors');
const readline = require('readline');

// config
const MAX_TRIES = 5; 

// output styling
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
 * @param {function} validator Optional. A function which performs validation against the user-provided input. If validation
 * is invalid, must return a string for display to user. If input is valid, must return null. 
 * @param {number} retryCnt Number of tries remaining. Default is equal to MAX_TRIES config variable. 
 * @returns {Promise}
 */
async function stdio(msg, level, awaitInput, validator, retryCnt = MAX_TRIES){
    return new Promise(function(resolve, reject){
        try{
            if(!awaitInput){
                console.log(level(msg)); 
                resolve(); 
            } else{
                rl.question(level(msg), (input) => {
                    if(validator){
                        // if validator returns null, input is valid
                        const errMsg = validator(input); 
                        if(!errMsg){ 
                            resolve(input); 
                        } else{ // if string is returned, display to user and retry
                            if(retryCnt > 0){
                                retryCnt--; 
                                console.log(style_warn(`${errMsg} -- ${retryCnt} attempts remaining.`));
                                resolve(stdio(msg, level, awaitInput, validator, retryCnt));
                            } else{
                                reject(new Error('Max tries reached.')); 
                            }
                        }
                    } else{
                        resolve(input);
                    }
                });
            }
        } catch(e){
            reject(e); 
        }
    }); 
}

module.exports.prompt = (msg, validator) => {
    return stdio(msg, style_input, true, validator); 
}

module.exports.highlight = (msg) => {
    return stdio(msg, style_highlight, false); 
}

module.exports.warn = (msg) => {
    return stdio(msg, style_warn, false); 
}