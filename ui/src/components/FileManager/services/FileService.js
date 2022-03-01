import {uri} from "../../../uri";
import axios from 'axios';

function getAuthToken(validate=false){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth === undefined || auth === null) {
        return {access_token: ''};
    }else{
        return JSON.parse(auth)
    }
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

async function convertMp4toHlsService(path){
    let auth = getAuthToken();
    let res = null;

    await axios.post(uri()+"/torrents/files/convert-mp4-to-hls", {
        file_path: path
    }, {
    headers: {
        'Authorization': `Bearer ${auth.access_token}` 
    }
    }).then(function (response) {
        res = response.data;
    }).catch(function (error) {
        console.log(error);
    });
    
    return res;
}

async function convertHlstoMp4Service(hls_element){
    let auth = getAuthToken();
    let res = null;

    await axios.post(uri()+"/torrents/files/convert-hls-to-mp4", {
        hls_element: hls_element
    }, {
    headers: {
        'Authorization': `Bearer ${auth.access_token}` 
    }
    }).then(function (response) {
        res = response.data;
    }).catch(function (error) {
        console.log(error);
    });
    
    return res;
}

export {
    getAuthToken,
    getFileDetails,
    downloadFileUrl,
    copyFile,
    deleteFile,
    renameFile,
    convertMp4toHlsService,
    convertHlstoMp4Service
}