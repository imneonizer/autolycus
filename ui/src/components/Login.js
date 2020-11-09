import React, { Component } from 'react';
import '../styles/Login.css'

function Login() {
    return (
        <div className='login-card'>
            <div className="login-form">
                <form>
                <p className="login-title">Login</p>
                <br></br>
                <p>Username</p>
                <input type="text" placeholder="Username"></input>
                
                <div className="password-forgot-combined">
                    <p>Password</p>
                    <a href="" className="forgot-password">Forgot password ?</a>
                </div>

                <input type="password" placeholder="Password"></input>
                <br></br><br></br>
                <button type="submit" className="login-submit-button">Login</button>
                </form>
            </div>

            <div className="create-account">
            Don't have an account yet? <a href="">Create an account</a>
            </div>

        </div>
    )
}

export default Login