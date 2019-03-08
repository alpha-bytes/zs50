const dotenv = require('dotenv'); 

function getCredentials(){
    process.stdin.setEncoding('utf-8'); 
    let credentials = {}; 
    // https://nodejs.org/dist/latest-v10.x/docs/api/stream.html#stream_readable_streams
    console.log('Enter username: '); 
    process.stdin.on('data', (data) => credentials.UNAME = data); 
    console.log('Enter password: '); 
    process.stdin.on('data', (data) => credentials.PWD = data); 
    return credentials; 
}

module.exports.getAuthStatus = () => {
    const authorized = dotenv.config == undefined; 
    return authorized;
}

module.exports.getCredentials = () => {
    
    // if credentials already set, just return them
    let credentials = dotenv.config(); 

    // if not, get them from the user and store in a .env file
    if(!credentials)
        credentials = getCredentials();

    
}