import React, { Component } from 'react';
import { Route } from "react-router-dom";
import {ValidateAuth} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Home from './Home';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, authorized: false};
      }

    componentDidMount() {
        ValidateAuth().then(authorized => {
            if (authorized === true){
                    this.setState({ loading: false, authorized: true });
                }
            }).catch(err => {
                console.log("[ERROR] from ValidateAuth: ", err);
                this.setState({ loading: false, authorized: false });
            })
    }
      
    render() {
        if (this.state.loading){return (<ThreeDotLoader/>)}
        if (this.state.authorized) {
            return (<p>authorized: true</p>)
        } else {
            return (<Route component={Home} />)
        }
    }

}

export default Dashboard;