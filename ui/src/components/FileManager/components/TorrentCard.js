import React, { Component } from 'react';
import "../styles/TorrentCard.css";
import {DeleteTorrent} from "../services/TorrentService";

class TorrentCard extends Component {
    constructor(props) {
        super(props);
        this.state = {threeDotMenuVisible: false}
        this.humanFileSize = this.humanFileSize.bind(this);
        this.handleDotMenu = this.handleDotMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    humanFileSize(size) {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    handleDotMenu(){
        if (!this.state.threeDotMenuVisible){
            this.setState({threeDotMenuVisible: true});
            document.addEventListener('click', this.handleOutsideClick, false);
        }else {
            this.setState({threeDotMenuVisible: false});
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    }

    handleOutsideClick(e) {
        // ignore clicks on the component itself
        if (this.node.contains(e.target)){
            return
        }; this.handleDotMenu();
      }

      handleDelete(){
        DeleteTorrent(this.props.data.hash)
        .then( response => {
            if (response.ok){
                //pass
            }
        })
        .catch(err => {
            console.log("[ERROR] in DeleteTorrent:", err)
        })
      }

    render(){
        return(
            <div className="torrent-card">
                <div className="torrent-card-info">
                    <p>{this.props.data.name}</p>
                    <p>{this.humanFileSize(this.props.data.total_bytes)}</p>
                </div>

                <div className="torrent-card-menu">
                    <div className="torrent-card-menu-dot-wrapper" ref={node => { this.node = node; }} onClick={this.handleDotMenu}>
                        <div className="torrent-card-menu-dot" />
                        <div className="torrent-card-menu-dot" />
                        <div className="torrent-card-menu-dot" />
                    </div>
                    {this.state.threeDotMenuVisible && (
                        <div className="torrent-card-menu-contents">
                            <p>Download</p>
                            <p>Copy Download Link</p>
                            <p>Rename</p>
                            <p>Copy</p>
                            <p>Cut</p>
                            <p>Paste</p>
                            <p onClick={this.handleDelete}>Delete</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default TorrentCard;