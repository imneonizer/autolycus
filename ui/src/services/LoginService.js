import {uri} from '../uri';

function handleErrors(response) {
    if (!response.ok) {
        return {status: response.status, message: response.statusText};
    }
    return response;
}

function clearTokens(){
    localStorage.setItem('autolycus-auth', undefined);
}

function AuthLogin(username, password) {
    let password_box = document.getElementById("login-password-box");
    fetch(uri()+"/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(handleErrors)
        .then(response => {
            response.json().then(json => {
                if (response.status === 200){
                    // console.log("success json", json);
                    password_box.style.border = "1px solid #efefef";
                    json["username"] = username;
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
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }

    if (auth){
        fetch(uri()+"/auth/logout", {
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

function ValidateUsername(username){
    let usernamebox = document.getElementById("login-username-box");
    return fetch(uri()+"/auth/user-exists?username="+username)
        // .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                // console.log("user "+username+" exists");
                usernamebox.style.border = "1px solid #efefef";
            } else {
                // console.error("user "+username+" doesn't exists");
                usernamebox.style.border = "1px solid red";
            }
        }).catch(err => {
            console.log("[ERROR] in AuthLogin:", err);
        });
    }


async function refreshAccessToken() {
        let auth = localStorage.getItem('autolycus-auth');
        let authorized = false;
    
        if (auth !== "undefined"){
            auth = JSON.parse(auth)
        }

        if (auth){
            // try to get new access token using refresh token
            await fetch(uri()+"/auth/refresh-token", {
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
                        // console.log("access token refreshed")
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
    let auth = localStorage.getItem('autolycus-auth');
    let authorized = false;

    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }

    if (auth){
        console.log(uri());
        await fetch(uri()+"/auth/user-details", {
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