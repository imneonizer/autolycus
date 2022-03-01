import React from 'react';
import {withRouter} from "react-router-dom";
import '../styles/Login.css';
import {AuthLogin} from '../services/LoginService';
import { DoesUserExists, DoesEmailExists, AuthSignup } from '../services/SignupService';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: '', email:'', password: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
    }

    handleChange(key) {
        return function (e) {
          var state = {};
          state[key] = e.target.value;
          this.setState(state);
        }.bind(this);
    }

    validateInputs(reset=false){
        let color = reset ? "0px solid #efefef":"1px solid red";
        if (!this.state.username){
            document.getElementById("login-username-box").style.border = color;
        }
        if (!this.state.email){
            document.getElementById("signup-email-box").style.border = color;
        }
        if (!this.state.password){
            document.getElementById("login-password-box").style.border = color;
        }
    }

    handleSubmit(e) {
        this.validateInputs()
    
        if (e.target.value === "login-account"){
            if (this.state.username && this.state.password){
                AuthLogin(this.state.username, this.state.password);
            }
        } else{
            if (this.state.username && this.state.password){
                DoesUserExists(this.state.username)
                DoesEmailExists(this.state.email)
                AuthSignup(this.state.username, this.state.email, this.state.password)
            }
        }
        
    }

    handleCreateAccount(e){
        this.validateInputs(true);
        
        if (e.target.id === "create-account-link"){
            document.getElementById("signup-email-container").style.display = "block";
            document.getElementById("forgot-password-text").style.display = "none";
            document.getElementsByClassName("login-title")[0].innerHTML = "Signup";
            document.getElementById("create-account-text").innerHTML = "Already have an account?";
            document.getElementById("create-account-link").innerHTML = "Login";
            let button = document.getElementById("login-submit-button");
            button.value = "create-account"; button.innerHTML = "Signup";
            document.getElementById("create-account-link").id = "login-account-link";
        } else {
            document.getElementById("signup-email-container").style.display = "none";
            document.getElementById("forgot-password-text").style.display = "block";
            document.getElementsByClassName("login-title")[0].innerHTML = "Login";
            document.getElementById("create-account-text").innerHTML = "Don't have an account yet?"
            document.getElementById("login-account-link").innerHTML = "Signup"
            let button = document.getElementById("login-submit-button");
            button.value = "login-account"; button.innerHTML = "Login";
            document.getElementById("login-account-link").id = "create-account-link";
        }
    }

    render () {
        return (
            <div className='login-card'>
                <div className="login-form"  id="login-form">
                    <p className="login-title">Login</p>
                    <br></br>
                    <p>Username</p>
                    <input type="text" id="login-username-box" value={this.state.username} onChange={this.handleChange('username')} placeholder="Username" />
                    
                    <div id="signup-email-container" style={{display: "none"}}>
                        <p>Email</p>
                        <input type="text" id="signup-email-box" value={this.state.email} onChange={this.handleChange('email')} placeholder="Email" />
                    </div>
                    
                    <div className="password-forgot-combined">
                        <p>Password</p>
                        <a href="/" id="forgot-password-text" className="forgot-password">Forgot password ?</a>
                    </div>

                    <input type="password" id="login-password-box"value={this.state.password} onChange={this.handleChange('password')} placeholder="Password"></input>
                    <button type="submit" value="login-account" id="login-submit-button" onClick={this.handleSubmit} className="login-submit-button">Login</button>
                </div>

                <div className="create-account">
                    <p id="create-account-text">Don't have an account yet?</p>
                    <p className="create-account-link" id="create-account-link" onClick={this.handleCreateAccount}>Signup</p>
                </div>

            </div>
        )
    }
}

export default withRouter(Login);