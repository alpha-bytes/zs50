const axios = require('axios').default;
const dotenv = require('dotenv'); 
const events = require('events'); 
const fs = require('fs'); 
const stdio = require('../utils/stdio'); 
const oauth = require('../config/oauth'); 

const ENV_PATH = `${process.cwd()}/.zs50.env`; 
let auth; 

class AuthEmitter extends events { 

    constructor(dotEnvObject){
        super();
        if(dotEnvObject.parsed){
            this.persistCredentials(dotEnvObject.parsed);
        } else {
            this.authReq = true; 
        }
    }

    persistCredentials(creds){
        if(!creds.uname || !creds.pwd || !creds.access_token || !creds.sec_token || !creds.instance_url){
            this.authReq = true; 
            return; 
        }

        this.authReq = false; 
        auth = creds; 
    }

    getCredentials(){
        return auth; 
    }

    /**
     * Returns a Promise that will be resolved upon successful authorization. 
     * @returns {Promise}
     */
    async setCredentials(overwrite=false){
        // set creds to auth and conditionally obtain new credentials
        let creds = auth ? auth : {};
        if(overwrite || this.authReq || !creds.uname){
            try{
                creds.uname = await stdio.prompt('Salesforce Username: ', inputValidator); 
                creds.pwd = await stdio.pwd('Salesforce Password: ', inputValidator); 
                creds.sec_token = await stdio.prompt('Security Token: ', inputValidator); 
            } catch(e){
                stdio.err(`${e.message} Exiting process.`); 
                process.exit(1);
            }
        }
        
        stdio.highlight('Authorizing Salesforce Org...');
        return authorize(creds);   
    }
    // method to get status
    requiresAuth(){
        return this.authReq;
    }
}

async function authorize(creds){
    return new Promise((resolve, reject) => {
        // obtain access token
        const resp = axios({
            method: 'post', 
            url: '/services/oauth2/token', 
            baseURL: 'https://login.salesforce.com',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                grant_type: 'password', 
                client_id: oauth.clientId, 
                client_secret: oauth.clientSecret, 
                username: creds.uname, 
                password: `${creds.pwd}${creds.sec_token}`
            }
        })
        .then((res) => {
            // get token and instance url
            creds.access_token = res.data.access_token; 
            creds.instance_url = res.data.instance_url; 
            if(!creds.access_token || !creds.instance_url){
                reject(new Error(`Response did not contain ${token==null?'access token, ':''} ${url==null?'instance url.': ''}`)); 
            }
            // write new or update .zs50.env file
            let data = `uname=${creds.uname}\n`; 
            data += `pwd=${creds.pwd}\n`; 
            data += `sec_token=${creds.sec_token}\n`; 
            data += `access_token=${creds.access_token}\n`; 
            data += `instance_url=${creds.instance_url}\n`;

            fs.writeFile(ENV_PATH, data, (err) => {
                if(err){
                    reject(err); 
                } else{
                    resolve(creds); 
                }
            });
        })
        .catch((err) => {
            stdio.err(err.response.data); 
            process.exit(1); 
        });
    });
}

function inputValidator(input){
    if(!input || input.length == 0)
        return 'Must provide a string of length greater than 0 chars.'

    return null; 
}

function authLogger(credentials){
    console.log(colors.bgMagenta('Authorization successful')); 
}

const authEmitter = new AuthEmitter( dotenv.config({ path: ENV_PATH }) ).on('auth', authLogger); 

/**
 * An event emitter for authorization events. 
 * @returns {AuthEmitter}
 */
module.exports = authEmitter; 