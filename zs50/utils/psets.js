const axios = require('axios').default;
const config = require('./config');
const readFileSync = require('fs').readFileSync; 
const stdio = require('./stdio'); 
const tooling = require('./tooling');
const yaml = require('yaml');

// if node was started with a provided path to .yaml directory, retrieve files locally
const LOCAL_YML = process.env.LOCAL_YML; 

const PREPEND = 'public class ZS50Exception extends Exception{ }';
const TRY_START = '\ntry{\n'; 
const TRY_END = '\n} catch(Exception e){\nthrow new ZS50Exception(e.getMessage());\n}'; 

// instantiate vars for pset base directory and psetYaml
const baseDir = require('./config').psetUrl; 
let psetYaml;

class Pset {

    constructor(psetYaml){
        this.apexClassNames = psetYaml.apexClassNames;
        this.executePrevalidation = psetYaml.executePrevalidation;
        this.globalVars = psetYaml.globalVars; 
        this.scaffold = psetYaml.scaffold; 
        this.validations = psetYaml.validations; 
    }

    // retrieves the specified apex class(es) and runs validations
    async validate(){
        
        // ensure classes 
        if(!this.apexClassNames || this.apexClassNames.length == 0)
            throw new Error('No Apex classes prescribed in pset.');

        // get each of the class bodies via tooling
        this.classBodies = ''; 
        try{
            stdio.warn(`Retrieving ${this.apexClassNames.length > 1 ? 'classes' : 'class'} ${this.apexClassNames.join(', ')} from ${ config.mode === 'local' ? 'default local directory...' : 'authorized SF org...' }`);
            for(let classBody of await tooling.getApex(this.apexClassNames)){
                this.classBodies += `${classBody}\n\n`;
            }
        } catch(e){
            throw e; 
        }

        // construct anonymous body
        try{
            stdio.warn('Constructing tests...'); 
            const anonBody = buildAnonTest(this); 
            stdio.warn('Validating assertions in authorized org...');
            await tooling.executeAnonApex(anonBody); 
        } catch(e){
            throw e; 
        }

    }

}

function buildAnonTest(pset){
    let anonBody = `${PREPEND}\n\n/** User Class Implementation(s) **/\n\n${pset.classBodies}\n`;

    // append global vars
    if(pset.globalVars)
        anonBody += '\n/** Initialize global-scoped variables **/\n' + pset.globalVars.reduce((prev, curr) => {
            return prev + curr + '\n'; 
        }, '\n');

    // append any pre-execution steps, wrapping in try/catch
    if(pset.executePrevalidation)
        anonBody += `\n/** Prevalidation steps **/\n${TRY_START}${appendPrevalidations(pset.executePrevalidation)}${TRY_END}`; 

    // append validations, which self-wrap in try/catch
    if(pset.validations)
        anonBody += `\n\n/** Validations **/\n${appendValidations(pset.validations)}`;
    
    return anonBody;
}

function appendPrevalidations(executePrevalidation){
    return executePrevalidation.reduce((prev, curr) =>{
        return prev + curr + '\n'; 
    }, '\n'); 
}

function appendValidations(validations){
    let ctr = 0; 
    return validations.reduce((prev, curr) => {
        let val = `\n// validation ${ctr} ${TRY_START} ${curr.execute ? curr.execute + '\n': ''} ${ curr.assert ? curr.assert : wrapEvaluate(curr.evaluate, curr.invMsg) } ${genCatch(curr.invMsg)}\n`;
        ctr++; 
        return prev + val; 
    }, '\n');
}

function wrapEvaluate(eval, invMsg=`\'Assertion failed: ${eval.split(';')[0]}\'`){
    return `if(!(${eval.split(';')[0]})){\n throw new ZS50Exception(${invMsg.split(';')[0]}); \n }`;
}

// uses standard TRY_END if invMsg is undefined or empty
function genCatch(invMsg){
    if(!invMsg)
        return TRY_END; 

    return TRY_END.replace('e.getMessage()', `${invMsg.endsWith(';') ? invMsg.split(';')[0] : invMsg }`); 
}

async function initPset(psetName){
    if(psetYaml)
        return; 

    let psetFile;

    // if running in local mode, get file from relative directory
    if(LOCAL_YML){
        try{
            psetFile = `${process.cwd()}/${LOCAL_YML}/${psetName}.yaml`; 
            stdio.warn(`Retrieving YAML from ${psetFile}`);
            const yml = readFileSync(psetFile, 'utf-8'); 
            psetYaml = yaml.parse(yml);
        } catch(e){
            throw e; 
        }
    } else{
        try{
            // get psetfile, disallowing caching
            psetFile = await axios.get(`${ baseDir.endsWith('/') ? baseDir : basDir + '/' }${psetName}.yaml`, { headers: { 'Cache-Control': 'no-cache' } }); 
            psetYaml = yaml.parse(psetFile.data); 
        } catch(e){
            throw e; 
        }
    }
}

module.exports.getPset = async (psetName) => {
    try{
        await initPset(psetName); 
        if(!psetYaml)
            throw new Error(`No pset found for argument ${psetName}. Check case and spelling and try again.`);

        return new Pset(psetYaml);  
    } catch(e){
        throw e; 
    }
};

// TODO module.exports.evaluate = async (psetName) => {
// - get ApexBody   
// - sum all yml validations, and check all validations where methodDependencies exist in apex body
// - increment each successful validation
// - IF successfulValidations === sum of all yml validations, success
// - ELSE return intermediary message
// - PROMISE.ALL() for granular validation checking (e.g. on exec anon apex per validation?)
