import React, { Component } from 'react';
import { Route } from "react-router-dom";
import "../../styles/FileManager.css";

import { IconContext } from "react-icons";
import { BiCloudLightning, BiStar, BiTrash, BiHelpCircle } from 'react-icons/bi';
import { GrSettingsOption } from 'react-icons/gr';

class FileManager extends Component {
    constructor(props) {
        super(props);
        // this.state = {loading: true, authorized: false};
        this.username = JSON.parse(localStorage.getItem('autolycus-auth')).username;
    }

    render(){
        return(
            <div>
                <div className="container-section">
                    <div className="left-section">
                        <div className="left-section-menu">

                            <div className="left-section-logo">
                                <img className="left-section-logo-icon" width="35px" src="favicon.svg"/>
                                <h3 className="left-section-logo-text">Autolycus</h3>
                            </div>

                            <div className="left-section-menu-items">
                                <img className="left-section-menu-icons" src="icons/bx-cloud-lightning.svg"/>
                                <p className="left-section-menu-texts">My cloud</p>
                            </div>
                                

                            <div className="left-section-menu-items">
                                <img className="left-section-menu-icons" src="icons/bx-star.svg"/>
                                <p className="left-section-menu-texts">Starred</p>
                            </div>
                                
                            <div className="left-section-menu-items">
                                <img className="left-section-menu-icons" src="icons/bx-trash.svg"/>
                                <p className="left-section-menu-texts">Recycle bin</p>
                            </div>
                        
                            <div className="left-section-menu-items">
                                <img className="left-section-menu-icons" src="icons/bx-help-circle.svg"/>
                                <p className="left-section-menu-texts">Help</p>
                            </div>

                            <div className="left-section-menu-items">
                                <img className="left-section-menu-icons" src="icons/bx-slider-alt.svg"/>
                                <p className="left-section-menu-texts">Settings</p>
                            </div>

                            {/* <p>Upgrade</p> */}

                        </div>
                    </div>

                    <div className="middle-section">
                        <h1>Hello, {this.username}</h1>
                    </div>
                        
                    <div className="right-section">
                    <p>File info will appear here</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default FileManager;