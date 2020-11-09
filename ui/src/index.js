import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './views/Home'
// import Header from './components/Header'
// import Login from './components/Login';
// import Footer from './components/Footer'

function App () {
    return (
        <div className="app">
            <Router>
                <Switch>
                <Route path="/">
                    <Home />
                </Route>
                </Switch>
            </ Router>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));