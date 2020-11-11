import React, { Component } from 'react';
import '../styles/Login.css';
import {AuthLogin, ValidateUsername} from '../services/LoginService';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: '', password: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(key) {
        return function (e) {
          var state = {};
          state[key] = e.target.value;
          this.setState(state);
        }.bind(this);
    }

    handleSubmit() {
        const base_url = "http://192.168.0.179:5000/api/auth"; 
        ValidateUsername(base_url+"/user-exists?username=", this.state.username);
        AuthLogin(base_url+"/login", this.state.username, this.state.password);
    }

    render () {
        return (
            <div className='login-card'>
                <div className="login-form">
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
                    <button type="submit" value="submit" onClick={this.handleSubmit} className="login-submit-button">Login</button>
                </div>

                <div className="create-account">
                Don't have an account yet? <a href="#">Create an account</a>
                </div>

            </div>
        )
    }
}

export default Login;