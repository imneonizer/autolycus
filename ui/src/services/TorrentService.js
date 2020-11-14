let base_url = "http://192.168.0.179:5000/api/torrents";

function SendMagnet(element_id, magnet){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }

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
                }, 1000);

            }
        })
        .catch(err => {
            console.log("[ERROR] in SendMagnet:", err)
        })
    }
}

export default SendMagnet;