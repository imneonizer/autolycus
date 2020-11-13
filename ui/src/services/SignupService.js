let base_url = "http://localhost:5000/api/auth"

function handleErrors(response) {
    if (!response.ok) {
        return {status: response.status, message: response.statusText};
    }
    return response;
}

function DoesUserExists(username){
    let usernamebox = document.getElementById("login-username-box");

    return fetch(base_url+"/user-exists?username="+username)
        .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                // console.log("user "+username+" exists");
                usernamebox.style.border = "1px solid red";
            } else {
                // console.error("user "+username+" doesn't exists");
                usernamebox.style.border = "1px solid #efefef";
            }
        }).catch(err => {
            console.log("[ERROR] in DoesUserExists:", err);
        });
    }

function DoesEmailExists(email){
    let emailbox = document.getElementById("signup-email-box");

    return fetch(base_url+"/email-exists?email="+email)
        .then(handleErrors)
        .then(response => {
            if (response.status === 200){
                // console.log("user "+username+" exists");
                emailbox.style.border = "1px solid red";
            } else {
                // console.error("user "+username+" doesn't exists");
                emailbox.style.border = "1px solid #efefef";
            }
        }).catch(err => {
            console.log("[ERROR] in DoesEmailExists:", err);
        });
}

async function AuthSignup(username, email, password) {
    await fetch(base_url+"/signup", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: username, username: username, email: email, password: password})
    })
    .then(handleErrors)
    .then(response => {
        if (response.status === 200){
            response.json().then( json => {
                localStorage.setItem('autolycus-auth', JSON.stringify(json));
                window.location.reload(true);
            })
        }
    }).catch(err => {
        console.log("[ERROR] in AuthSignup", err)
    })
}

export {
    DoesUserExists,
    DoesEmailExists,
    AuthSignup
}