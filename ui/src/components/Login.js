import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import '../styles/Login.css';
import {AuthLogin, ValidateUsername, clearTokens} from '../services/LoginService';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: '', password: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
    }

    handleChange(key) {
        return function (e) {
          var state = {};
          state[key] = e.target.value;
          this.setState(state);
        }.bind(this);
    }

    handleSubmit(e) {
        const base_url = "http://192.168.0.179:5000/api/auth";
        
        if (!this.state.username){
            document.getElementById("login-username-box").style.border = "1px solid red";
        }
        if (!this.state.password){
            document.getElementById("login-password-box").style.border = "1px solid red";
        }

        if (e.target.value === "login-account"){
            if (this.state.username && this.state.password){
                ValidateUsername(base_url+"/user-exists?username=", this.state.username);
                AuthLogin(base_url+"/login", this.state.username, this.state.password);
            }
        } else{
            console.log("Signup clicked")
            if (this.state.username && this.state.password){
                // ValidateUsername(base_url+"/user-exists?username=", this.state.username);
                // AuthLogin(base_url+"/login", this.state.username, this.state.password);
            }
        }
        
    }

    handleCreateAccount(e){
        if (e.target.id === "create-account-link"){
            document.getElementsByClassName("login-title")[0].innerHTML = "Signup";
            document.getElementById("create-account-text").innerHTML = "Already have an account?"
            document.getElementById("create-account-link").innerHTML = "Login"
            let button = document.getElementById("login-submit-button");
            button.value = "create-account"; button.innerHTML = "Signup";
            document.getElementById("create-account-link").id = "login-account-link";
        } else {
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
                    
                    <div className="password-forgot-combined">
                        <p>Password</p>
                        <a href="#" className="forgot-password">Forgot password ?</a>
                    </div>

                    <input type="password" id="login-password-box"value={this.state.password} onChange={this.handleChange('password')} placeholder="Password"></input>
                    <br/>
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