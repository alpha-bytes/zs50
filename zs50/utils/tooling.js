// basic functions of the tooling api
const auth = require('./auth');
const axios = require('axios').default; 
const config = require('./config'); 
const readFileSync = require('fs').readFileSync;
const stdio = require('./stdio'); 


let access_token, instance_url; 
const REQ_MSG = 'Org authorization required. Use command "zs50 auth -r" to authorize a Salesforce dev org.';
/* tooling api endpoints */
const tooling_base = `services/data/v${config.apiVersion}/tooling`; 
const tooling_query = `${tooling_base}/query?q=SELECT Body, Name FROM ApexClass WHERE name IN (%%)`;
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

async function _getApex(classNames){
    
    let classes = []; 
    
    // retrieve classes from local
    if(config.mode === 'local' && config.classDir){
        let classLoc; 
        try{
            for(let className of classNames){
                classLoc = `${process.cwd()}/${config.classDir.replace('./', '')}/${className}.cls`;
                classes.push({ name: className, body: readFileSync(classLoc, 'utf-8') });
            }
        } catch(e){
            // do nothing, let final conditional block throw the error
        }
    } 
    
    // retrieve classes from authorized org
    if(config.mode === 'cloud'){
        try{
            const retrUrl = encodeURI(tooling_query.replace('%%', classNames.reduce((prev, curr) =>{
                if(prev)
                    return `${prev},'${curr}'`; 

                return `'${curr}'`;
            }, null))); 
            let resp = await axios({
                method: 'get',
                baseURL: instance_url, 
                url: retrUrl, 
                headers: {
                    'Authorization': `Bearer ${access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            if(resp.data.records){
                for(let record of resp.data.records)
                    classes.push({ name: record.Name, body: record.Body });

            } else {
                throw new Error(`One or more of the requested class(es) (${classNames.join(', ')}) was not found in the authorized org.`); 
            }
        } catch(e){
            throw e;  
        }
    }

    // last check to ensure all classes present
    if(classes.length != classNames.length){
        let retreived = classes.map(x => x.name); 
        throw new Error(`Could not find Class(es) ${ classNames.filter(className => retreived.indexOf(className) === -1).join(', ')} ${ config.mode === 'local' ? 'in the local directory' : 'in the authorized org' }.`);
    }
    
    return classes;
}

async function _executeAnonApex(anonApex){
    try{
        let encodedApex = encodeURIComponent(anonApex); 
        let resp = await axios({
            method: 'get',
            baseURL: instance_url, 
            url: tooling_execAnon.replace('%%', encodedApex), 
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
        // if self-thrown above, just return
        if(e.salesforceResponse)   
            throw e; 

        let err = new Error('Unable to execute Apex: '); 
        if(e.response){
            err.message += `Status Code ${e.response.status} - ${e.response.statusText}`;
            err.salesforceResponse = e.response;
        } else{
            err.message += e.message; 
        }
        
        throw err; 
    }
}

/**
 * Returns a Promise that resolves to the body of an ApexClass, or is rejected with an error. 
 * @returns {Promise}
 */
module.exports.getApex = async (classNames) => {
    if(await validateAuth()){
        // retrieve apex body
        try{
            return await _getApex(classNames); 
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