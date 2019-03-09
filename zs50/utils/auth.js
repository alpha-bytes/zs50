const colors = require('colors');
const dotenv = require('dotenv'); 
const events = require('events'); 

class AuthEmitter extends events { 

    constructor(dotEnvObject){
        super();
        if(dotEnvObject.parsed){
            // TODO load vars
            this.auth = dotEnvObject; 
        } else {
            this.noAuth = true; 
        }
    }
    // method to get credentials from user
    getCredentials(){
        // if we have them, get them 
        if(this.noAuth){
            // TODO get from user
            this.emit('auth', { uname: 'uname', pwd: 3 }); 
        } else{
            this.emit('auth', this.auth);
        }
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

/** 
function internalGetCredentials(){
    process.stdin.setEncoding('utf-8'); 
    let credentials = {}; 
    // https://nodejs.org/dist/latest-v10.x/docs/api/stream.html#stream_readable_streams
    console.log('Enter username: '); 
    process.stdin.on('data', (data) => credentials.UNAME = data); 
    console.log('Enter password: '); 
    process.stdin.on('data', (data) => credentials.PWD = data); 
    return credentials; 
}
*/

module.exports = authEmitter; 