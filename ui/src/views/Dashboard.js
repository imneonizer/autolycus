import React, { Component } from 'react';
import { Route } from "react-router-dom";
import {ValidateAuth, refreshAccessToken, AuthLogout} from "../services/LoginService";
import ThreeDotLoader from "../components/ThreeDotLoader";
import Home from './Home';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, authorized: false};
      }

    componentDidMount() {
        ValidateAuth(true, 60).then(authorized => {
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
      
    render() {
        if (this.state.loading){return (<ThreeDotLoader/>)}
        if (this.state.authorized) {
            return (
                <div>
                    <p>authorized: true</p>
                    <button onClick={AuthLogout}>Logout</button>
                </div>
            )
        } else {
            return (<Route component={Home} />)
        }
    }

}

export default Dashboard;