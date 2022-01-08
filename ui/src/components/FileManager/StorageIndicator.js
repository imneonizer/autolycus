import React, { Component } from 'react';
import "./styles/StorageIndicator.css";

class storageIndicator extends Component {
    constructor(props) {
        super(props);
        this.humanFileSize = this.humanFileSize.bind(this);
        this.getIndicatorLength = this.getIndicatorLength.bind(this);
    }

    humanFileSize(size) {
        if (!size){return "0 Bytes"}

        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    getIndicatorLength() {
        let length = (100*(this.props.usedBytes/this.props.totalBytes));
        if (isNaN(length)){
            return 1;
        } else {
            return length;
        }
    }

    render(){
        return (
            <div className="storage-indicator">
                <p className="storage-indicator-text">{this.humanFileSize(this.props.usedBytes)} / {this.humanFileSize(this.props.totalBytes)}</p>
                <div className="storage-indicator-base"></div>
                <div className="storage-indicator-progress" style={{width: this.getIndicatorLength()+"%"}}></div>
                
                <p></p>
            </div>
        )
    }
}

export default storageIndicator;