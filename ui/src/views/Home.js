import React, { Component } from 'react';
import {Route} from "react-router-dom";
import '../styles/Home.css';
import Login from '../components/Login'
import {ValidateAuth} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Dashboard from "./Dashboard";
import {uri} from "../uri";
import ConfigureServer from '../views/ConfigureServer';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, authorized: false, apiDown: false};
        this.pingAPI = this.pingAPI.bind(this);
        this.timer = null;

        // forcefully set api address using query parameter
        let apiParameter = this.findGetParameter('api');
        if (apiParameter){
            apiParameter = decodeURIComponent(apiParameter);
            localStorage.setItem('autolycus-uri', apiParameter)
            window.location.href = window.location.origin;
        }
        
    }

    findGetParameter(q) {
        // return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1];
        return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [null])[1];
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

        ValidateAuth(true).then(authorized => {
            if (authorized){
                this.setState({ loading: false, authorized: true });
            } else {
                this.setState({ loading: false, authorized: false });
            }
        })
        
    }

    render () {
        if (this.state.apiDown){
            return (<ConfigureServer />)
        } else if (this.state.loading){
            return (<ThreeDotLoader/>)
        } else if (this.state.authorized) {
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