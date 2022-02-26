import React, { Component } from 'react';
import "../styles/AddMagnet.css"
import { SendMagnet } from "../services/TorrentService";
import VideoPlayer from "../../VideoPlayer";

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
            <div>
                <div className="add-magnet-div">
                    <input id="add-magnet-box" type="text" placeholder="Add Magnet Link" onKeyPress={event => {if (event.key === 'Enter') {this.handleMagnetSubmit()}}} />
                    <img className="add-magnet-icon" src="/autolycus/icons/bxs-file-plus.svg" onClick={this.handleMagnetSubmit}/>
                </div>
                {this.props.videoUrl && <VideoPlayer src={this.props.videoUrl} meta={this.props.videoMeta} />}
            </div>

        )
    }

}

export default AddMagnet;