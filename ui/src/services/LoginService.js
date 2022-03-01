import {uri} from '../uri';
import axios from 'axios';


function getAuthToken(validate=false){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth === undefined || auth === null) {
        return {access_token: ''};
    }else{
        return JSON.parse(auth)
    }
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


async function refreshAccessToken(){
    let auth = getAuthToken();
    
    return axios({ method: 'post', url: uri()+"/auth/refresh-token", headers: { Authorization: `Bearer ${auth.refresh_token}` } })
    .then(function (response) {
        let res = response.data;
        auth.access_token = res.access_token;
        localStorage.setItem('autolycus-auth', JSON.stringify(auth));
        return true;
    }).catch(function (e) {
        if (e.response.status === 401){
            console.log("Refresh token expired please login", e);
            return false
        }else{
            console.error("[ERROR] in refreshAccessToken:", e)
            return false;
        }
    });
}

// refresh access token every 15 minute
async function ValidateAuth(auto_refresh=false, interval=900){
    let auth = getAuthToken();

    return axios.get(uri()+"/auth/user-details", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.access_token}` 
        }
    }).then(function (response) {
        // let res = response.data;
        if (auto_refresh){
            window.setInterval(refreshAccessToken, 1000*interval);
        }
        return true;
    }).catch(function (e) {
        if (e.response && e.response.status === 401){
            if (auto_refresh){
                window.setInterval(refreshAccessToken, 1000*interval);
            }
            return refreshAccessToken();
        }else{
            console.log(e);
            return false;
        }
    });
}

export {
    AuthLogin,
    ValidateUsername,
    ValidateAuth,
    refreshAccessToken,
    clearTokens,
    AuthLogout
}