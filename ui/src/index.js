import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './views/Home';
import ConfigureServer from './views/ConfigureServer';

function App () {
    return (
        <div className="app">
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/down" component={ConfigureServer} />
                </Switch>
            </ Router>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));