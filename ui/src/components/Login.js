import React, { Component } from 'react';
import '../styles/Login.css'

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

    handleSubmit(event) {
        var data = {
                username: this.state.username,
                password: this.state.password,
            }
        alert('Hello ' + data.username + ', your password is: ' + data.password);
        
        /* POST DATAS TO PHP HERE...
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", "form/form-submit.php", true);
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");                  
                xmlhttp.send(data);
        */
    
        event.preventDefault();
    }

    render () {
        return (
            <div className='login-card'>
                <div className="login-form">
                    <form onSubmit={this.handleSubmit}>
                    <p className="login-title">Login</p>
                    <br></br>
                    <p>Username</p>
                    <input type="text" value={this.state.username} onChange={this.handleChange('username')} placeholder="Username" />
                    
                    <div className="password-forgot-combined">
                        <p>Password</p>
                        <a href="#" className="forgot-password">Forgot password ?</a>
                    </div>

                    <input type="password" value={this.state.password} onChange={this.handleChange('password')} placeholder="Password"></input>
                    <br></br><br></br>
                    <button type="submit" value="submit" className="login-submit-button">Login</button>
                    </form>
                </div>

                <div className="create-account">
                Don't have an account yet? <a href="#">Create an account</a>
                </div>

            </div>
        )
    }
}

export default Login