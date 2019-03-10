const dotenv = require('dotenv'); 
const events = require('events'); 
const stdio = require('../utils/stdio'); 

class AuthEmitter extends events { 

    constructor(dotEnvObject){
        super();
        if(dotEnvObject.parsed){
            // TODO validate all necessary settings
            this.auth = dotEnvObject.parsed; 
        } else {
            this.noAuth = true; 
        }
    }

    /**
     * Returns a Promise that will be resolved upon successful authorization. 
     * @returns {Promise}
     */
    async getCredentials(){
        let uname = await stdio.prompt('Salesforce Username: '); 
        let pwd = await stdio.prompt('Salesforce Password: '); 
        stdio.highlight('Authorizing Salesforce Org...'); 

        return new Promise(function(resolve, reject){
            resolve(uname); 
        }); 
    }
    // method to get status
    requiresAuth(){
        return this.noAuth;
    }
}

function authLogger(credentails){
    console.log(colors.bgMagenta('Authorization successful')); 
}

const authEmitter = new AuthEmitter( dotenv.config({ path: process.cwd() + '/.zs50.env' }) ).on('auth', authLogger); 

function authorizeOrg(uname, pwd){
    // TODO
}

/**
 * An event emitter for authorization events. 
 * @returns {AuthEmitter}
 */
module.exports = authEmitter; 