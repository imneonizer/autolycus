import React, { Component } from 'react';
import "../styles/FileCard.css";
import "../styles/TorrentCard.css";
import {downloadFileUrl, copyFile, deleteFile, renameFile} from "../services/FileService";
import cogoToast from 'cogo-toast';
import {uri} from "../../../uri";

class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {data: null, threeDotMenuVisible: "", MenuTranslateY: "0px"};
        this.humanFileSize = this.humanFileSize.bind(this);
        this.trimString = this.trimString.bind(this);
        this.getFileIcon = this.getFileIcon.bind(this);
        this.handleDotMenu = this.handleDotMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleRename = this.handleRename.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(false);

        // reason to write below line twice: https://stackoverflow.com/questions/55966533/show-alert-on-browser-back-button-event-on-react-js
        window.history.pushState({name: "browserBack"}, "on browser back click", window.location.href);
        window.history.pushState({name: "browserBack"}, "on browser back click", window.location.href);
        
        // switch to previous directory when user presses back button in browser
        window.addEventListener('popstate', () => {this.props.goBack()}, false)
    }

    componentWillUnmount() {
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
        if ([".mkv", ".mp4", ".avi"].includes(ext)){
            return "/autolycus/icons/video-file-icon.svg";
        }else if ([".txt", ".srt", ".md", ".docx"].includes(ext)){
            return "/autolycus/icons/doc-file-icon.svg";
        }else if ([".mp3", ".wav"].includes(ext)){
            return "/autolycus/icons/music-file-icon.svg";
        }else{
            return "/autolycus/icons/unknown-file-icon.svg";
        }
    }

    handleDotMenu(e, name){
        let windowH = window.innerHeight-30;
        let menuH = 220;

        if (!this.state.threeDotMenuVisible){
            this.setState({threeDotMenuVisible: name});
            document.addEventListener('click', this.handleOutsideClick, false);
            
            try{
                menuH = e.clientY+menuH;
                if (menuH > windowH){
                    let adjust = 50;
                    if (window.innerWidth < 800){
                        // adjust overflow menu
                        adjust = 100;
                    }
                    this.setState({MenuTranslateY: windowH-adjust-menuH+"px"});
                }
            } catch(err){}

        }else {
            this.setState({threeDotMenuVisible: "", MenuTranslateY: "0px"});
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    }

    handleOutsideClick(e) {
        if (!["torrent-card-menu-dot", "torrent-card-menu-dot-wrapper"].includes(e.target.className)){
            this.handleDotMenu();
        }
    }

    handleCopy(item, iscut=false){
        let message = "Item copied";
        if (iscut){
            message = "Item cut";
        }
        cogoToast.info(message, {position: "top-center", hideAfter: 1});
        window.localStorage.setItem('autolycus_copy_path', JSON.stringify({item: item, iscut: iscut}));
    }

    handlePaste(item){
        let path = JSON.parse(window.localStorage.getItem('autolycus_copy_path'));
        if (path){
            if (item.type === "directory" && item.path != path.item.path){
                copyFile(path.item.path, item.path, path.iscut).then(response => {
                    response.json().then(json => {
                        if (response.status == 200){
                            this.props.addItem(item, path.item);
                            cogoToast.success("Pasted", {position: "top-center", hideAfter: 1});
                            if (path.iscut){
                                window.localStorage.removeItem('autolycus_copy_path');
                            }
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

    handleDownload(item, copyLink=false){
        if (item.type === "directory"){
            cogoToast.loading("archiving directory", {position: "top-center"}).then(() => {
                downloadFileUrl(item.path).then(response => {
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
        } else {

            downloadFileUrl(item.path).then(response => {
                response.json().then(json => {
                    if (response.status === 200){
                        let url = uri()+"/public/";
                        if (item.type === "hls"){
                            url = url+"hls/"+json.public_url_hash+"/"+item.info.key+".m3u8"
                        }else{
                            url = url+json.public_url_hash
                        }
                        
                        if (copyLink){
                            // copy link to clipboard
                            const el = document.createElement('textarea');
                            el.value = url;
                            document.body.appendChild(el);
                            el.select();
                            document.execCommand('copy');
                            document.body.removeChild(el);
                            cogoToast.success("copied to clipboard", {position: "top-center", hideAfter: 1});
                            
                        }else{
                            // download file
                            url = url+"?download=true"
                            let a = document.createElement('a');
                            a.href = url;
                            a.download = item.name;
                            a.click(); a.remove();
                            cogoToast.success("download started", {position: "top-center", hideAfter: 1});
                        }
                    }
                })
            })
        
        }

    }

    handleDelete(item){
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
            deleteFile(item.path).then(response => {
                response.json().then(json => {
                    if (response.status === 200){
                        this.props.removeItem(item);
                        // cogoToast.success("file deleted", {position: "top-center", hideAfter: 1});
                    }else{
                        cogoToast.error("error occured", {position: "top-center", hideAfter: 1});
                        console.error(json);
                    }
                })
            })
        }
    }

    handleRename(item){
        const selectAllText = (e) => {e.target.select()};
        const { hide } = cogoToast.loading(
            <div className="toast-confirmation">
                <p style={{paddingBottom: "1px"}}>Rename</p>
                <input type="text" id="toast-rename-box" onFocus={selectAllText} placeholder="Enter new name" defaultValue={item.name}></input>
                <button style={{backgroundColor: "#1b53f4"}} onClick={() => confirmRename()}>Confirm</button>
                <button style={{backgroundColor: "#4CAF50"}} onClick={() => hide()}>Cancel</button>
            </div>, {
            hideAfter: 0
        });

        var confirmRename = () => {
            let newname = document.getElementById("toast-rename-box");
            if (newname.value && newname.value !== item.name){
                renameFile(item.path, newname.value).then(response => {
                    response.json().then(json => {
                        if (response.status === 200){
                            item.name = newname.value;
                            this.props.renameItem(item, newname.value);
                        }else{
                            console.error(json);
                        }
                    })
                })
                hide();
            }
            
            
        }
    }

    render(){
        return(
            <div>
                <div className="file-card" style={{cursor: "pointer"}} onClick={() => this.props.goBack()}>
                    <div className="file-card-info">
                        <img style={{width: "20px"}} className="svg-black" src="/autolycus/icons/up-arrow.svg"/>
                        <p className="file-card-wrapper file-card-info-size">Folder Up</p>
                    </div>
                </div>

                {this.props.data.children &&
                this.props.data.children.map((item, idx) => {
                    return (
                        <div className="file-card" id="file-card" key={idx}>
                            <div className="file-card-info">
                                {item.type === "directory" && <img src="/autolycus/icons/mac-folder-icon.svg"/>}
                                {item.type === "hls" && <img style={{width:"32px"}} src="/autolycus/icons/hls-file-icon.svg"/>}
                                {item.type === "file" && <img style={{width:"32px"}} src={this.getFileIcon(item.ext)}/>}

                                <div className="file-card-wrapper">
                                    <p className="file-card-info-name" onClick={() => this.props.updateCard(item, this.props.data)}>{this.trimString(item.name, 30)}</p>
                                    {item.type === "file" && <p className="file-card-info-size">{this.humanFileSize(item.size)}</p>}
                                    {item.type === "hls" && <p className="file-card-info-size">{this.humanFileSize(item.size)}</p>}
                                </div>
                            </div>

                            <div className="torrent-card-menu">
                                <div className="torrent-card-menu-dot-wrapper" onClick={(e) => this.handleDotMenu(e, item.name)}>
                                    <div className="torrent-card-menu-dot" />
                                    <div className="torrent-card-menu-dot" />
                                    <div className="torrent-card-menu-dot" />
                                </div>
                                {this.state.threeDotMenuVisible === item.name && (
                                    <div style={{transform: "translate(0px, "+this.state.MenuTranslateY+")"}} className="torrent-card-menu-contents">
                                        <div onClick={() => this.handleDownload(item)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bxs-cloud-download.svg"/>
                                            <p>Download</p>
                                        </div>
                                        
                                        <div onClick={() => this.handleDownload(item, true)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-link-alt.svg"/>
                                            <p>Copy Link</p>
                                        </div>

                                        <div onClick={() => this.handleRename(item)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-edit-alt.svg"/>
                                            <p>Rename</p>
                                        </div>

                                        <div onClick={() => this.handleCopy(item)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-copy-alt.svg"/>
                                            <p>Copy</p>
                                        </div>

                                        <div onClick={() => this.handleCopy(item, true)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-cut.svg"/>
                                            <p>Cut</p>
                                        </div>

                                        <div onClick={() => this.handlePaste(item)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-paste.svg"/>
                                            <p>Paste</p>
                                        </div>

                                        <div onClick={() => this.handleDelete(item)} className="torrent-card-menu-contents-items">
                                            <img className="svg-black" src="/autolycus/icons/bx-trash.svg"/>
                                            <p>Delete</p>
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