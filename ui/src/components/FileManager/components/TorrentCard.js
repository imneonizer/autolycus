import React, { Component } from 'react'
import "../styles/TorrentCard.css"

class TorrentCard extends Component {
    constructor(props) {
        super(props);
        this.humanFileSize = this.humanFileSize.bind(this);
    }

    humanFileSize(size) {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    render(){
        return(
            <div className="torrent-card">
                <p>{this.props.data.name}</p>
                <p>{this.humanFileSize(this.props.data.total_bytes)}</p>
            </div>
        )
    }
}

export default TorrentCard;