import React, { Component } from 'react';
import {AuthLogin, ValidateUsername} from '../services/LoginService';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {ValidateAuth} from "../services/LoginService";
import Home from './Home';

async function Dashboard () {
    
        let is_authorized = await ValidateAuth();
        console.log("is authorized", is_authorized);

        return (<h1>hello there</h1>);

    //     if (is_authorized){
    //         console.log("authorized user");
    //         return (<h1>Dashboard</h1>)
    //     } else {
    //         console.log("unauthorized user, routing to Home");
    //         return (<Route path="/" component={Home} />)
    //     }

    //     return (<h1>hello there</h1>)
    }

export default Dashboard;