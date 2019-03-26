const axios = require('axios').default;
const stdio = require('./stdio'); 
const yaml = require('yaml');

const PREPEND = 'public class ZS50Exception extends Exception{ }';
const TRY_START = '\ntry{\n'; 
const TRY_END = '\n} catch(Exception e){\nthrow new ZS50Exception(e.getMessage());\n}'; 

// instantiate var for psets, and get them
const location = require('./config').psetUrl; 
let psets;

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
        let val = `\n// validation ${ctr} ${TRY_START} ${curr.execute ? curr.execute : ''}\n${ curr.assert } ${genCatch(curr.invMsg)}\n`;
        return prev + val; 
    }, '\n');
}

// uses standard TRY_END if invMsg is undefined or empty
function genCatch(invMsg){
    if(!invMsg)
        return TRY_END; 

    return TRY_END.replace('e.getMessage()', `${invMsg.endsWith(';') ? invMsg.split(';')[0] : invMsg }`); 
}

async function initPsets(){
    if(psets)
        return; 

    try{
        // get psetfile, disallowing caching
        const psetFile = await axios.get(location, { headers: { 'Cache-Control': 'no-cache' } }); 
        psets = yaml.parse(psetFile.data); 
    } catch(e){
        throw e; 
    }
}

module.exports.getPset = async (psetName) => {
    try{
        await initPsets(); 
        let psetYaml = psets[psetName];
        if(!psetYaml)
            throw new Error(`No pset found for argument ${psetName}`);

        return new Pset(psetYaml);  
    } catch(e){
        throw e; 
    }
};