import React, { Component } from 'react';
import "../styles/AddMagnet.css"
import SendMagnet from "../../../services/TorrentService";

class AddMagnet extends Component {
    constructor(props) {
        super(props);
        this.handleMagnetSubmit = this.handleMagnetSubmit.bind(this);
    }

    handleMagnetSubmit(e){
        let inputBox = document.getElementById("add-magnet-box");
        if (inputBox.value){
            SendMagnet(inputBox.id, inputBox.value);
        }
    }

    render(){
        return(
            <div className="add-magnet-div">
                <input id="add-magnet-box" type="text" placeholder="Add Magnet Link" />
                <img className="add-magnet-icon" src="icons/bxs-file-plus.svg" onClick={this.handleMagnetSubmit}/>
            </div>

        )
    }

}

export default AddMagnet;