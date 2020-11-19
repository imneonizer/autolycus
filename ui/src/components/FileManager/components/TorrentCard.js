import React, { Component } from 'react';
import "../styles/TorrentCard.css";
import {DeleteTorrent} from "../services/TorrentService";

class TorrentCard extends Component {
    constructor(props) {
        super(props);
        this.state = {threeDotMenuVisible: false, explorerCard: null}
        this.humanFileSize = this.humanFileSize.bind(this);
        this.handleDotMenu = this.handleDotMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.trimString = this.trimString.bind(this);
    }

    humanFileSize(size) {
        if (!size){return "0 Bytes"}

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

    trimString(string, length){
        let postfix = ""
        if (string.length > length){
            postfix = "..."
        }
        return string.slice(0, length).trim()+postfix;
    }

    render(){
        return(
            <div className="torrent-card">
                <div className="torrent-card-info" onClick={() => this.props.cardHandler(this.props.data)}>
                    <img src="icons/mac-folder-icon.svg"/>
                    <div className="torrent-card-wrapper">
                        <p className="torrent-card-info-name">{this.trimString(this.props.data.name, 30)}</p>
                        <p className="torrent-card-info-size">{this.humanFileSize(this.props.data.total_bytes)}</p>
                    </div>
                </div>

                <div className="torrent-card-menu">
                    <div className="torrent-card-menu-dot-wrapper" ref={node => { this.node = node; }} onClick={this.handleDotMenu}>
                        <div className="torrent-card-menu-dot" />
                        <div className="torrent-card-menu-dot" />
                        <div className="torrent-card-menu-dot" />
                    </div>
                    {this.state.threeDotMenuVisible && (
                        <div className="torrent-card-menu-contents">
                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bxs-cloud-download.svg"/>
                                <p>Download</p>
                            </div>
                            
                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-link-alt.svg"/>
                                <p>Copy Link</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-edit-alt.svg"/>
                                <p>Rename</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-copy-alt.svg"/>
                                <p>Copy</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-cut.svg"/>
                                <p>Cut</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-paste.svg"/>
                                <p>Paste</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img src="icons/bx-trash.svg"/>
                                <p onClick={this.handleDelete}>Delete</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default TorrentCard;