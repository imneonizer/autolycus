import {uri} from '../uri';
import axios from 'axios';


function handleErrors(response) {
    if (!response.ok) {
        return {status: response.status, message: response.statusText};
    }
    return response;
}


function clearTokens(){
    localStorage.setItem('autolycus-auth', 'undefined');
}


async function ValidateUsername(username){
    let usernamebox = document.getElementById("login-username-box");
    let user_exists = false;

    await axios.get(uri()+"/auth/user-exists?username="+username)
    .then(function (response) {
        usernamebox.style.border = "1px solid #efefef";
        user_exists = true;
    }).catch(function (error) {
        usernamebox.style.border = "1px solid red";
      });
    
    return user_exists;
}


function AuthLogin(username, password) {
    let password_box = document.getElementById("login-password-box");
    ValidateUsername(username)
    .then(function (user_exists) {
        if (user_exists){
            axios.post(uri()+"/auth/login", {
                username: username,
                password: password 
            }).then(function (response) {
                password_box.style.border = "1px solid #efefef";
                response.data["username"] = username;
                localStorage.setItem('autolycus-auth', JSON.stringify(response.data));
                window.location.reload(true);
              })
              .catch(function (error) {
                clearTokens();
                password_box.style.border = "1px solid red";
                console.log("[ERROR] in AuthLogin:", error);
              });
        }
    });
}


function AuthLogout(){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
        axios.post(uri()+"/auth/logout", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
            },
            body: JSON.stringify(auth)
        })
        .then(function (response) {
            clearTokens();
            window.location.reload(true);
        }).catch(function (error) {
            clearTokens();
            window.location.reload(true);
        });
    }
}


async function refreshAccessToken() {
        let auth = localStorage.getItem('autolycus-auth');
        let authorized = false;

        if (auth !== "undefined"){
            auth = JSON.parse(auth)

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

    if (auth !== 'undefined'){
        auth = JSON.parse(auth);
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