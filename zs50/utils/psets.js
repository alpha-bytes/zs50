const axios = require('axios').default;
const readFileSync = require('fs').readFileSync; 
const stdio = require('./stdio'); 
const yaml = require('yaml');

// if node was started with a provided path to .yaml directory, retrieve files locally
const PSET_YML = process.env.PSET_YML; 

const PREPEND = 'public class ZS50Exception extends Exception{ }';
const TRY_START = '\ntry{\n'; 
const TRY_END = '\n} catch(Exception e){\nthrow new ZS50Exception(e.getMessage());\n}'; 

// instantiate vars for pset base directory and psetYaml
const baseDir = require('./config').psetUrl; 
let psetYaml;

class Pset {

    constructor(psetYaml){
        this.apexName = psetYaml.apexName;
        this.executePrevalidation = psetYaml.executePrevalidation;
        this.globalVars = psetYaml.globalVars; 
        this.scaffold = psetYaml.scaffold; 
        this.validations = psetYaml.validations; 
    }

    buildAnonTest(classBody){
        let anonBody = `${PREPEND}\n\n${classBody}\n`;

        // append global vars
        if(this.globalVars)
            anonBody += '\n// Initialize global-scoped variables\n' + this.globalVars.reduce((prev, curr) => {
                return prev + curr + '\n'; 
            }, '\n');

        // append any pre-execution steps, wrapping in try/catch
        if(this.executePrevalidation)
            anonBody += `\n// Prevalidation steps\n${TRY_START}${appendPrevalidations(this.executePrevalidation)}${TRY_END}`; 

        // append validations, which self-wrap in try/catch
        if(this.validations)
            anonBody += `\n\n// Validations\n${appendValidations(this.validations)}`;
        
        return anonBody;
    }
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
    if(PSET_YML){
        try{
            psetFile = `${process.cwd()}/${PSET_YML}/${psetName}.yaml`; 
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
            throw new Error(`No pset found for argument ${psetName}`);

        return new Pset(psetYaml);  
    } catch(e){
        throw e; 
    }
};