let base_url = "http://192.168.0.179:5000";

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
    return fetch(base_url+"/api/torrents/files?hash="+Hash, getAuthHeader("GET"))
}



function downloadFile(path){
    let auth = getAuthToken();
    let b64 = btoa(unescape(encodeURIComponent(path)));
    return fetch(
        base_url+"/api/torrent-files?path="+b64+"&auth="+auth.access_token,
        getAuthHeader("GET")
    )
}

export {
    getFileDetails,
    downloadFile
}