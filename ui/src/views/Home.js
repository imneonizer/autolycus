import React, { Component } from 'react';
import '../styles/Home.css';
import Login from '../components/Login'

function Home() {
    return (
        <div>
        <div className="home-section">
            <div className="carousel-section"></div>
            
            <div className="login-section">
                <div className="login-form">
                    <Login />
                </div>
            </div>
        </div>
        </div>
    )
}

export default Home;