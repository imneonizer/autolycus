import React, { Component } from 'react';
import '../styles/VideoPlayer.css';

class VideoPlayer extends Component {
    constructor(props){
        super(props);
        this.state = {width: "0px", height: "0px", playerTitleVisible: true}
        this.updatePlayerWidth = this.updatePlayerWidth.bind(this);
        this.updateVideoTitleVisiblity = this.updateVideoTitleVisiblity.bind(this);
    }

    updateVideoTitleVisiblity(value){
        this.setState({playerTitleVisible: value});
    }

    componentDidMount(){
        this.timer = setInterval(this.updatePlayerWidth, 100);
        const video = document.querySelector('video');
        video.addEventListener('play', (event) => {
            setTimeout(() => { this.updateVideoTitleVisiblity(false) }, 3000);
        });

        video.addEventListener('pause', (event) => {
            this.setState({playerTitleVisible: true});
        });
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
                    <div className="video-player-overlay" style={{width: this.state.width}}>
                       {this.state.playerTitleVisible && <p className="video-player-title">{this.props.meta.name}</p> }
                    </div>

                    <video id="video-player" style={{borderRadius: "10px"}} width={this.state.width} controls autoPlay playsInline>
                        <source src={this.props.src} type="video/mp4"></source>
                    </video>
                </React.Fragment>
            </div>
        
        )
    }
}

export default VideoPlayer;