const axios = require('axios').default;
const yaml = require('yaml');

prepend = 'public class ZS50Exception extends Exception{ }';

// instantiate var for psets, and get them
const location = require('./config').psetUrl; 
let psets;

class Pset {

    constructor(psetYaml){
        this.yaml = psetYaml; 
        this.apexName = psetYaml.apexName;
    }

    buildAnonTest(classBody){
        let anonBody = `${prepend}\n\n${classBody}`;
        return anonBody;
    }
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