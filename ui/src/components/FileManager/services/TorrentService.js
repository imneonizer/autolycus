let base_url = "http://192.168.0.179:5000/api/torrents";

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


function SendMagnet(element_id, magnet){
    let auth = getAuthToken();

    if (auth){
        fetch(base_url+"/add?magnet="+magnet, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
            }
        })
        .then(response => {
            if (response.ok){
                let element = document.getElementById(element_id);
                element.value = "";
                
                let placeholder = element.placeholder;
                element.placeholder = "Magnet Added!";

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
        return fetch(base_url+"/status", getAuthHeader("GET"))
    }
    
}

export {
    SendMagnet,
    FetchTorrents
};