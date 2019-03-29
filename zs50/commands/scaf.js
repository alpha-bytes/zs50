const psets = require('../utils/psets'); 
const stdio = require('../utils/stdio');

module.exports = async (psetName) => {
    try{
        const pset = await psets.getPset(psetName); 
        stdio.highlight(pset.scaffold.replace('"', ''));
        process.exit(0);
    } catch(e){
        stdio.warn(`No pset found named ${psetName}`); 
        process.exit(1); 
    }
}