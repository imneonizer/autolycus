import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function handleErrors(response) {
    if (!response.ok) {
        return {status: response.status, message: response.statusText};
    }
    return response;
}

function clearTokens(){
    localStorage.setItem('autolycus-auth', undefined);
}

function AuthLogin(api_endpoint, username, password) {
    let password_box = document.getElementById("login-password-box");
    fetch(api_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(handleErrors)
        .then(response => {
            response.json().then(json => {
                if (response.status === 200){
                    console.log("success json", json);
                    password_box.style.border = "border: 1px solid #efefef;";
                    localStorage.setItem('autolycus-auth', JSON.stringify(json));
                    window.location.reload(true);
                    // var retrievedObject = localStorage.getItem('autolycus-auth');
                    // console.log('retrievedObject: ', JSON.parse(retrievedObject));
                } else {
                    clearTokens();
                    password_box.style.border = "1px solid red";
                };
            });
        }).catch(err => {
            clearTokens();
            password_box.style.border = "1px solid red";
            console.log("[ERROR] in AuthLogin:", err);
        });
    };

function AuthLogout(){
    let base_url = "http://192.168.0.179:5000/api/auth";
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }

    if (auth){
        fetch(base_url+"/logout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
            },
            body: JSON.stringify(auth)
        })
        .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                clearTokens();
                window.location.reload(true);
            }
        })
    }
}

function ValidateUsername(api_endpoint, username){
    let usernamebox = document.getElementById("login-username-box");
    return fetch(api_endpoint+username)
        // .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                // console.log("user "+username+" exists");
                usernamebox.style.border = "1px solid #efefef;";
            } else {
                // console.error("user "+username+" doesn't exists");
                usernamebox.style.border = "1px solid red";
            }
        }).catch(err => {
            console.log("[ERROR] in AuthLogin:", err);
        });
    }

async function refreshAccessToken() {
        let base_url = "http://192.168.0.179:5000/api/auth";
        let auth = localStorage.getItem('autolycus-auth');
        let authorized = false;
    
        if (auth !== "undefined"){
            auth = JSON.parse(auth)
        }

        if (auth){
            // try to get new access token using refresh token
            await fetch(base_url+"/refresh-token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + auth.refresh_token
                }
            })
            .then(handleErrors)
            .then(response => {
                if (response.status === 200){
                    response.json()
                    .then(response => {
                        authorized = true;
                        console.log("access token refreshed")
                        auth.access_token = response.access_token;
                        localStorage.setItem('autolycus-auth', JSON.stringify(auth));
                    })
                }
            }).catch(err => {
                console.log("[ERROR] in refreshAccessToken:",err)
            })
        }

        return authorized;
    }

async function ValidateAuth (auto_refresh=false, interval=2) {
    let base_url = "http://192.168.0.179:5000/api/auth";
    let auth = localStorage.getItem('autolycus-auth');
    let authorized = false;

    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }
    
    // console.log(auth);

    if (auth){
        await fetch(base_url+"/user-details", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
            }
        })
        .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                authorized = true;
                if (auto_refresh){
                    window.setInterval(refreshAccessToken, 1000*interval);
                }
            }
        }).catch(err => {
            console.log("[ERROR] in ValidateAuth:", err)
        })
    }

    return authorized;
}

export {
    AuthLogin,
    ValidateUsername,
    ValidateAuth,
    refreshAccessToken,
    clearTokens,
    AuthLogout
}