import React, { Component } from 'react';
import { Route } from "react-router-dom";
import {ValidateAuth, refreshAccessToken} from "../services/LoginService";
import FileManager from "../components/FileManager/FileManager";
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
            } else {
                refreshAccessToken().then(authorized => {
                    if (authorized === true){
                        this.setState({ loading: false, authorized: true });
                    } else {
                        this.setState({ loading: false, authorized: false });
                    }
                })
            }
        })
    }

    render() {
        if (this.state.loading){return (<ThreeDotLoader/>)}
        if (this.state.authorized) {
            return (
                <div>
                    <FileManager />
                </div>
            )
        } else {
            return (<Route component={Home} />)
        }
    }

}

export default Dashboard;