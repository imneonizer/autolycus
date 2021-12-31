let API_URL = 'http://localhost:5000/api'

function uri(){
    let uri = localStorage.getItem('autolycus-uri');
    if (uri){
        return uri;
    } else {
        return API_URL;
    }
}

export {
    API_URL,
    uri
}