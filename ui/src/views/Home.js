import React, { Component } from 'react';
import {Route} from "react-router-dom";
import '../styles/Home.css';
import Login from '../components/Login'
import {ValidateAuth, clearTokens, refreshAccessToken} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Dashboard from "./Dashboard";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, authorized: false};
    }
    
    componentDidMount() {
        let auth = localStorage.getItem('autolycus-auth');
        if (!auth){
            clearTokens();
        }

        ValidateAuth().then(authorized => {
            if (authorized === true){
                    this.setState({ loading: false, authorized: true });
                } else {
                    refreshAccessToken().then(authorized => {
                        if (authorized === true){
                            this.setState({ loading: false, authorized: true });
                        } else {
                            this.setState({ loading: false, authorized: false });
                        }
                    })
                }
            }
        )
    }

    render () {
        if (this.state.loading){
            return (<ThreeDotLoader/>)
        } else if (this.state.authorized) {
            return (<Route component={Dashboard} />)

        } else {
            // clearTokens(); //if login page is loaded after fallback, it will clear previous stored token.
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