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
    return fetch(uri()+"/torrents/files?hash="+Hash, getAuthHeader("GET"))
}

function downloadFileUrl(path){
    return fetch(uri()+"/public/create", {
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

function copyFile(from, to, iscut=false){
    return fetch(uri()+"/torrents/files/copy-file", {
        method: "POST",
        body: JSON.stringify({from: from, to:to, iscut: iscut}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken().access_token
        }
    })
}

function deleteFile(path){
    return fetch(uri()+"/torrents/files/delete-file", {
        method: "DELETE",
        body: JSON.stringify({path: path}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken().access_token
        }
    })
}

function renameFile(path, newname){
    return fetch(uri()+"/torrents/files/rename-file", {
        method: "POST",
        body: JSON.stringify({path: path, newname: newname}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken().access_token
        }
    })
}

export {
    getAuthToken,
    getFileDetails,
    downloadFileUrl,
    copyFile,
    deleteFile,
    renameFile
}