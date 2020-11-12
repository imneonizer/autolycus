import React, { Component } from 'react';
import {Route} from "react-router-dom";
import '../styles/Home.css';
import Login from '../components/Login'
import {ValidateAuth} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Dashboard from "./Dashboard";

class Home extends Component {
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

    render () {
        if (this.state.loading){return (<ThreeDotLoader/>)}
        if (this.state.authorized) {
            return (<Route component={Dashboard} />)
        } else {
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

    }
}

export default Home;