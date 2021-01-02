import React, { Component } from 'react';
import {Route} from "react-router-dom";
import '../styles/Home.css';
import Login from '../components/Login'
import {ValidateAuth, clearTokens, refreshAccessToken} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Dashboard from "./Dashboard";
import {uri} from "../uri";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, authorized: false, apiDown: false};
        this.pingAPI = this.pingAPI.bind(this);
        this.timer = null;
    }

    pingAPI(){
        // check if api server is down
        fetch(uri()+"/ping").then( resp => {
            if (resp.ok){
                this.setState({apiDown: false});
            }
        }).catch(err => {
            this.setState({apiDown: true});
        });
    }

    componentDidMount() {
        this.pingAPI();

        // get auth from local storage
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
            if (this.state.apiDown){
                window.location.href = '/down';
            }else{
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
}

export default Home;