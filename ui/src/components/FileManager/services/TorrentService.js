import {uri} from "../../../uri";

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


function SendMagnet(element_id, magnet){
    let auth = getAuthToken();

    if (auth){
        fetch(uri()+"/torrents/add?magnet="+magnet, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
            }
        })
        .then(response => {
            let element = document.getElementById(element_id);

            if (response.ok){    
                element.value = "";
                let placeholder = element.placeholder;
                element.placeholder = "Magnet Added!";

                setTimeout(() => {
                    element.placeholder = placeholder;
                }, 2000);

            } else {
                element.value = "";
                let placeholder = element.placeholder;
                element.placeholder = "Invalid Magnet!";

                setTimeout(() => {
                    element.placeholder = placeholder;
                }, 2000);
            }
        })
        .catch(err => {
            console.log("[ERROR] in SendMagnet:", err)
        })
    }
}

function FetchTorrents(){
    let auth = getAuthToken();
    if (auth){
        return fetch(uri()+"/torrents/status", getAuthHeader("GET"))
    }
    
}

function DeleteTorrent(Hash){
    let auth = getAuthToken();
    if (auth){
        return fetch(uri()+"/torrents/remove?hash="+Hash, getAuthHeader("GET"))
    }
}

export {
    SendMagnet,
    FetchTorrents,
    DeleteTorrent
};