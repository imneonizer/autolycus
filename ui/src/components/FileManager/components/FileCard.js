import React, { Component } from 'react';
import "../styles/FileCard.css";
import "../styles/TorrentCard.css";

class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {data: null, threeDotMenuVisible: ""};
        this.humanFileSize = this.humanFileSize.bind(this);
        this.trimString = this.trimString.bind(this);
        this.getFileIcon = this.getFileIcon.bind(this);
        this.handleDotMenu = this.handleDotMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(false);
    }

    cextendsomponentWillUnmount() {
        this.props.tFetcher(true);
    }

    goBack(){
        this.setState({data: null})
    }

    humanFileSize(size) {
        if (!size){return "0 Bytes"}

        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    trimString(string, length){
        let w = window.innerWidth;
        
        if ( w >= 800){
            return string;
        }else {
            let postfix = "";
            if (string.length > length){
                postfix = "...";
            }
            return string.slice(0, length).trim()+postfix;
        }
    }

    getFileIcon(ext){
        if ([".mkv", ".mp4"].includes(ext)){
            return "icons/video-file-icon.svg";
        }else if ([".txt", ".srt", ".md", ".docx"].includes(ext)){
            return "icons/doc-file-icon.svg";
        }
    }

    handleDotMenu(name){
        if (!this.state.threeDotMenuVisible){
            this.setState({threeDotMenuVisible: name});
            document.addEventListener('click', this.handleOutsideClick, false);
        }else {
            this.setState({threeDotMenuVisible: ""});
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    }

    handleOutsideClick(e) {
        if (!["torrent-card-menu-dot", "torrent-card-menu-dot-wrapper"].includes(e.target.className)){
            this.handleDotMenu();
        }
    }

    render(){
            return(
                <div>
                    <div className="file-card" style={{cursor: "pointer"}} onClick={() => this.props.goBack()}><p>...</p></div>
                    {this.props.data.children &&
                    this.props.data.children.map((item) => {
                        return (
                            <div className="file-card">
                                <div className="file-card-info">
                                    {item.type === "directory" && <img src="icons/mac-folder-icon.svg"/>}
                                    {item.type === "file" && <img style={{width:"32px"}} src={this.getFileIcon(item.ext)}/>}

                                    <div className="file-card-wrapper">
                                        <p className="file-card-info-name" onClick={() => this.props.updateCard(item, this.props.data)}>{this.trimString(item.name, 30)}</p>
                                        {item.type === "file" && <p className="file-card-info-size">{this.humanFileSize(item.size)}</p>}
                                    </div>
                                </div>


                                <div className="torrent-card-menu">
                                    <div className="torrent-card-menu-dot-wrapper" onClick={() => this.handleDotMenu(item.name)}>
                                        <div className="torrent-card-menu-dot" />
                                        <div className="torrent-card-menu-dot" />
                                        <div className="torrent-card-menu-dot" />
                                    </div>
                                    {this.state.threeDotMenuVisible === item.name && (
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
                    })}
                </div>
            )
        }
}

export default FileCard;