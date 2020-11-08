import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from './components/Header'
import Login from './components/Login';
import Footer from './components/Footer'

function App () {
    return (
        <div className="app">
            <Router>
                <Header />
                
                <Switch>
                {/* <Route path="/">
                    <Home />
                </Route> */}
                <Route path="/login">
                    <Login />
                </Route>
                </Switch>
                {/* <h1>hello</h1> */}
                {/* <Footer /> */}
            </ Router>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));