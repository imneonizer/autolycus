import React, { Component } from 'react';
import {getAuthToken} from "./FileManager/services/FileService";
import {uri} from "../uri";

class VideoPlayer extends Component {
    constructor(props){
        super(props);
        this.state = {width: "10px", height: "10px"}
        this.updatePlayerWidth = this.updatePlayerWidth.bind(this);
    }

    componentDidMount(){
        this.timer = setInterval(this.updatePlayerWidth, 100);
    }

    componentWillUnmount(){
        clearInterval(this.timer);
    }

    updatePlayerWidth(){
        let e = document.getElementById("file-card");
        if (!e){
            e = document.getElementById("torrent-card");
        }

        if (this.state.width !== e.offsetWidth){
            this.setState({width: e.offsetWidth});
        }
    }

    render(){
        return (
            <div className="video-player-container" style={{marginBottom: "5px"}}>
                <React.Fragment key={this.props.src}>
                    <video id="video-player" style={{borderRadius: "10px"}} width={this.state.width} controls autoPlay playsInline>
                        <source src={this.props.src} type="video/mp4"></source>
                    </video>
                </React.Fragment>
            </div>
        
        )
    }
}

export default VideoPlayer;