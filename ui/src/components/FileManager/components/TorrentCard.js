import React, { Component } from 'react';
import "../styles/TorrentCard.css";
import {DeleteTorrent} from "../services/TorrentService";
import {downloadFileUrl, copyFile} from "../services/FileService";
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import cogoToast from 'cogo-toast';
import {uri} from "../../../uri";

class TorrentCard extends Component {
    constructor(props) {
        super(props);
        this.state = {threeDotMenuVisible: false, explorerCard: null}
        this.humanFileSize = this.humanFileSize.bind(this);
        this.handleDotMenu = this.handleDotMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.trimString = this.trimString.bind(this);
        this.getTorrentSize = this.getTorrentSize.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
    }

    humanFileSize(size) {
        if (!size){return "0 B"}

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

    handleDownload(item, copyLink=false){
        cogoToast.loading("archiving directory", {position: "top-center"}).then(() => {
            downloadFileUrl(item.download_path).then(response => {
                response.json().then(json => {
                    if (response.status === 200){
                        let url = uri()+"/public/"+json.public_url_hash
                        // download file
                        url = url+"?download=true"
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = item.name;
                        a.click(); a.remove();
                        cogoToast.success("download started", {position: "top-center", hideAfter: 1});
                    }
                })
            })
        });
    }


    handleDelete(){
        const { hide } = cogoToast.loading(
            <div className="toast-confirmation">
                <p>Are you sure ?</p>
                <button style={{backgroundColor: "red"}} onClick={() => confirmDelete()}>Yes</button>
                <button style={{backgroundColor: "#4CAF50"}} onClick={() => hide()}>No</button>
            </div>, {
            hideAfter: 0
        });

        var confirmDelete = () => {
            hide();
            DeleteTorrent(this.props.data.hash).then( response => {
                if (response.ok){
                    cogoToast.success("Torrent Deleted", {position: "top-center", hideAfter: 1});
                }
            }).catch(err => {
                cogoToast.error("Error Occured", {position: "top-center", hideAfter: 1});
                console.log("[ERROR] in DeleteTorrent:", err)
            })
        }
    }

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

    getTorrentSize(){
        if (!this.props.data.is_finished){
            return this.humanFileSize(this.props.data.downloaded_bytes)+" / "+this.humanFileSize(this.props.data.total_bytes)+ " ("+ this.humanFileSize(this.props.data.download_speed)+"/s)";
        }else{
            return this.humanFileSize(this.props.data.total_bytes);
        }
    }

    handlePaste(){
        let item = {path: this.props.data.download_path, type: 'directory'};
        let path = JSON.parse(window.localStorage.getItem('autolycus_copy_path'));
        if (path.item){
            if (item.type === "directory" && item.path !== path.item.path){
                copyFile(path.item.path, item.path, path.iscut).then(response => {
                    response.json().then(json => {
                        if (response.status === 200){
                            cogoToast.success("Pasted", {position: "top-center", hideAfter: 1});
                            window.localStorage.removeItem('autolycus_copy_path');
                        }else{
                            console.error(json);
                            cogoToast.error("Unable to paste", {position: "top-center", hideAfter: 1});
                        }
                    })
                })
            }else{
                cogoToast.warn("Not allowed", {position: "top-center", hideAfter: 1});
            }
        }else{
            cogoToast.error("Nothing to paste", {position: "top-center", hideAfter: 1});
        }
        
    }

    render(){
        return(
            <div className="torrent-card" id="torrent-card" onMouseOver={() => this.props.updateActiveItemHover(this.props.data)} onMouseOut={() => this.props.updateActiveItemHover()}>
                <div className="torrent-card-info" onClick={() => this.props.cardHandler(this.props.data)}>
                    <img alt='' src="/autolycus/icons/mac-folder-icon.svg"/>
                    <div className="torrent-card-wrapper">
                        <p className="torrent-card-info-name">{this.trimString(this.props.data.name, 30)}</p>
                        {!this.props.data.is_finished && <Progress percent={this.props.data.progress} status="active" />}
                        <p className="torrent-card-info-size">{this.getTorrentSize()}</p>
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
                            <div onClick={() => this.handleDownload(this.props.data, true)} className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bxs-cloud-download.svg"/>
                                <p>Download</p>
                            </div>
                            
                            <div className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-link-alt.svg"/>
                                <p>Copy Link</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-edit-alt.svg"/>
                                <p>Rename</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-copy-alt.svg"/>
                                <p>Copy</p>
                            </div>

                            <div className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-cut.svg"/>
                                <p>Cut</p>
                            </div>

                            <div onClick={() => this.handlePaste()} className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-paste.svg"/>
                                <p>Paste</p>
                            </div>

                            <div onClick={this.handleDelete} className="torrent-card-menu-contents-items">
                                <img alt='' className="svg-black" src="/autolycus/icons/bx-trash.svg"/>
                                <p>Delete</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default TorrentCard;