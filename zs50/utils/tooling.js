// basic functions of the tooling api
const auth = require('./auth');
const axios = require('axios').default; 
const stdio = require('./stdio'); 
const config = require('../../config'); 

let access_token, instance_url; 
const REQ_MSG = 'Org authorization required. Use command "zs50 auth -r" to authorize a Salesforce dev org.';
/* tooling api endpoints */
const tooling_base = `services/data/v${config.version}/tooling`; 
const tooling_query = `${tooling_base}/query?q=SELECT body FROM ApexClass WHERE name = \'%%\'`;
const tooling_execAnon = `${tooling_base}/executeAnonymous?anonymousBody=%%`; 

// TODO event emitter / subscriber for any axios response which fails due to auth, and refresh the token

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
                        stdio.err(`Blast! We've had an error: ${err.message}`); 
                        reject(err); 
                    }); 
                } else{
                    resolve(false); 
                }
            }).catch((err) => {
                stdio.err(`Shoot. Encountered the following error:\n${err.message}.`); 
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
            url: encodeURI(tooling_query.replace('%%', className)), 
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

async function _executeAnonApex(anonApex){
    try{
        let resp = await axios({
            method: 'get',
            baseURL: instance_url, 
            url: encodeURI(tooling_execAnon.replace('%%', anonApex)), 
            headers: {
                'Authorization': `Bearer ${access_token}`, 
                'Content-Type': 'application/json'
            }
        }); 
        const data = resp.data;  
        if(data.compiled && data.success){
            return data; 
        } else{
            let e = new Error(data.compiled ? data.exceptionMessage : data.compileProblem);
            e.salesforceResponse = data; 
            throw e; 
        }
    } catch(e){
        if(e.salesforceResponse)   
            throw e; 

        throw new Error(`Unable to execute Apex due to the following error: ${e.message}`);
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
        let e = new Error(REQ_MSG);  
        e.requiresAuth = true; 
        throw e; 
    }
}

module.exports.executeAnonApex = _executeAnonApex; 