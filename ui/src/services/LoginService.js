import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function AuthLogin(api_endpoint, username, password) {
    let password_box = document.getElementById("login-password-box");
    fetch(api_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        }).then(response => {
            response.json().then(json => {
                if (response.status === 200){
                    console.log("success json", json);
                    password_box.style.border = "none";
                    localStorage.setItem('autolycus-auth', JSON.stringify(json));

                    // var retrievedObject = localStorage.getItem('autolycus-auth');
                    // console.log('retrievedObject: ', JSON.parse(retrievedObject));
                } else {
                    // console.error("error json", json);
                    password_box.style.border = "1px solid red";
                };
            });
        });
    };


function ValidateUsername(api_endpoint, username){
    let usernamebox = document.getElementById("login-username-box");
    fetch(api_endpoint+username)
        .then(response => {
            if (response.status === 200){
                // console.log("user "+username+" exists");
                usernamebox.style.border = "none";
            } else {
                // console.error("user "+username+" doesn't exists");
                usernamebox.style.border = "1px solid red";
            }
        });
    }

async function ValidateAuth () {
    let url = "http://192.168.0.179:5000/api/auth/user-details";
    let auth = JSON.parse(localStorage.getItem('autolycus-auth'));
    let is_authorized = false;

    await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.access_token
                }
        }).then(response => {
            if (response.status === 200){
                is_authorized = true;
        } else {
            is_authorized = false;
        }

    });

    return is_authorized;
}

export {
    AuthLogin,
    ValidateUsername,
    ValidateAuth
}