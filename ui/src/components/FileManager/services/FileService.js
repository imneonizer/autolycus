import {uri} from "../../../uri";

function getAuthToken(){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }
    return auth;
}

function getAuthHeader(method="POST"){
    let auth = getAuthToken();
    return { 
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.access_token}
        }
}

function getFileDetails(Hash){
    return fetch(uri+"/torrents/files?hash="+Hash, getAuthHeader("GET"))
}


function downloadFileUrl(path){
    return fetch(uri+"/public/create", {
        method: "POST",
        body: JSON.stringify({file_path: path}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken().access_token
        }
    })

    // let b64 = btoa(unescape(encodeURIComponent(path)));
    // return uri+"/torrent-files?path="+b64+"&auth="+auth.access_token;
}

export {
    getFileDetails,
    downloadFileUrl
}