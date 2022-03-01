import React, { Component } from 'react';
import cogoToast from 'cogo-toast';
import {API_URL, uri} from '../uri';
import '../styles/ServerDown.css'
import Home from '../views/Home';

class ConfigureServer extends Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {apiDown: true};
        this.pingAPI = this.pingAPI.bind(this);
        this.handleConfigureClick = this.handleConfigureClick.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.findGetParameter = this.findGetParameter.bind(this);

        // forcefully set api address using query parameter
        let apiParameter = this.findGetParameter('api');
        if (apiParameter){
            apiParameter = decodeURIComponent(apiParameter);
            localStorage.setItem('autolycus-uri', apiParameter)
            window.location.href = window.location.origin;
        }

    }

    pingAPI(){
        fetch(uri()+"/ping").then( resp => {
            if (resp.ok){
                this.setState({apiDown: false});
            }
        }).catch(err => {
            this.setState({apiDown: true});
        });
    }

    findGetParameter(q) {
            // return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1];
            return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [null])[1];
    }

    componentDidMount() {
        this.timer = setInterval(this.pingAPI, 1000*10);
    }
    
    componentWillUnmount(){
        clearInterval(this.timer);
    }

    handleReset(e){
        clearInterval(this.timer);

        localStorage.setItem('autolycus-uri', API_URL);
        let input = document.getElementById('enter-api-address');
        input.value = API_URL;
    }

    handleConfigureClick(){
        let configureBox = document.getElementById('server-down-configure-box');
        let toggle = document.getElementById('server-down-configure-text');
        configureBox.style.display = 'block';
        toggle.style.display = 'none';
    }

    handleSubmit(){
        let input = document.getElementById('enter-api-address');
        if (input.value.startsWith("http")){
            fetch(input.value+"/ping").then( resp => {
                if (resp.ok){
                    localStorage.setItem('autolycus-uri', input.value);
                    this.setState({apiDown: false});
                }else{
                    cogoToast.error("API address is not reachable", {position: "top-center", hideAfter: 1});
                }
            }).catch(err => {
                cogoToast.error("API address is not reachable", {position: "top-center", hideAfter: 1});
                this.setState({apiDown: true});
            });
        }else {
            cogoToast.error("invalid API address", {position: "top-center", hideAfter: 1});
        }

    }

    render(){
        if (this.state.apiDown){
            return (
                <div className="server-down-container">
                    <div className="server-down">
                        <img alt='' src="/autolycus/icons/server-down.svg" width="30%"></img>
                        <h3>Our Server is Feeling a Little Down</h3>
                        <p>
                            Please try again in a few moments.<br></br>
                            We'll be  back up in  no time.
                        </p>
                        <div className="server-down-configure" style={{cursor: "pointer"}}>
                            <p id="server-down-configure-text" onClick={this.handleConfigureClick}>Configure API Address</p>
                            <div className="server-down-configure-box" id="server-down-configure-box" style={{display: 'none'}}>
                                <input className="server-down-configure-input" type="text" id="enter-api-address" placeholder="Enter API Address" defaultValue={uri()}></input>
                                <br></br>
                                <button onClick={this.handleSubmit} className="server-down-configure-box-submit">Submit</button>
                                <div className="server-down-reset-div">
                                    <p style={{color: "#484848"}}>No idea about this?</p><p onClick={this.handleReset} className="server-down-reset-link">Reset</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }else{
            // window.location.href = '/';
            return <Home />
        }
    }

}

export default ConfigureServer;