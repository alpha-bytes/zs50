// basic functions of the tooling api
const auth = require('./auth');
const axios = require('axios').default; 
const stdio = require('./stdio'); 
const defaults = require('../config/defaults'); 

const REQ_MSG = 'Org authorization required. Use command "zs50 auth -r" to authorize a Salesforce dev org.';
const urlQueryApex = `services/data/v${defaults.version}/tooling/query?q=SELECT body FROM ApexClass WHERE name = \'%%\'`; 
let access_token, instance_url; 

/**
 * Validates authorization is available. 
 * @returns {Promise} Resolves to true if auth is good, false if not. 
 */
function validateAuth(){
    return new Promise((resolve, reject) => {
        if(auth.requiresAuth()){
            stdio.prompt('There is no org authorized yet. Authorize now? (Y|N)').then((input) => {
                if(input === 'Y' || input === 'y'){
                    auth.setCredentials().then((creds) => {
                        access_token = creds.access_token; 
                        instance_url = creds.instance_url; 
                        resolve(true); 
                    }).catch((err) => {
                        stdio.warn(`Blast! We've had an error: ${err.message}`); 
                        reject(err); 
                    }); 
                } else{
                    resolve(false); 
                }
            }).catch((err) => {
                stdio.warn(`Shoot. Encountered the following error:\n${err.message}.`); 
                process.exit(1); 
            });
        } else{
            access_token = auth.getCredentials().access_token; 
            instance_url = auth.getCredentials().instance_url; 
            resolve(true); 
        }
    });
}

async function _getApex(className){
    try{
        let resp = await axios({
            method: 'get',
            baseURL: instance_url, 
            url: encodeURI(urlQueryApex.replace('%%', className)), 
            headers: {
                'Authorization': `Bearer ${access_token}`, 
                'Content-Type': 'application/json'
            }
        });
        if(resp.data.size && resp.data.size == 1 && resp.data.records[0]){
            return resp.data.records[0].Body; 
        } else{
            throw new Error(`Unable to retrieve ${className}`); 
        }
    } catch(e){
        throw e;  
    }
}

/**
 * Returns a Promise that resolves to the body of an ApexClass, or is rejected with an error. 
 * @returns {Promise}
 */
module.exports.getApex = async (className) => {
    if(await validateAuth()){
        // retrieve apex body
        try{
            return await _getApex(className); 
        } catch(e){
            throw e; 
        }
    } else{
        throw new Error(REQ_MSG);  
    }
}