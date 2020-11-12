import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
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

async function ValidateAuth () {
    let url = "http://192.168.0.179:5000/api/auth/user-details";
    let auth = JSON.parse(localStorage.getItem('autolycus-auth'));
    let authorized = false;

    console.log(auth);

    if (auth){
        await fetch(url, {
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
                }
            }
        );
    }

    return authorized;
}

export {
    AuthLogin,
    ValidateUsername,
    ValidateAuth,
    clearTokens
}