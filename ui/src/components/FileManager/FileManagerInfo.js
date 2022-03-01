import React, { Component } from 'react';

class FileManagerInfo extends Component {
    constructor(props){
        super(props);
        this.humanDate = this.humanDate.bind(this);
        this.humanFileSize = this.humanFileSize.bind(this);
    }

    humanDate(unixTimestamp){
        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        let milliseconds = unixTimestamp * 1000;
        let dateObject = new Date(milliseconds);
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
        return dateObject.toLocaleDateString("en-US", options) + ", " + formatAMPM(dateObject);
    }

    humanFileSize(size) {
        if (!size){return "0 B"}

        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    render() {        
        if (this.props.activeItem.name){
            return (
                <div className="right-section-text">
                    <h5>Name</h5>
                    <p>{this.props.activeItem.name}</p>

                    <h5>Magnet</h5>
                    <p>{this.props.activeItem.magnet}</p>

                    <h5>Created</h5>
                    <p>{this.humanDate(this.props.activeItem.added_time)}</p>

                    <h5>Size</h5>
                    <p>{this.humanFileSize(this.props.activeItem.downloaded_bytes)}</p>
                </div>
            )
            
        }else {
            return (<p className="right-section-text" >File info will appear here</p>)
        }
    }
}

export default FileManagerInfo;