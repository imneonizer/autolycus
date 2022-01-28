import React, { Component } from 'react';
import "../../styles/FileManager.css";
// import "../../styles/DarkTheme.css";
import FileManagerViews from "./FileManagerViews";
import FileManagerInfo from "./FileManagerInfo";
import { FetchTorrents } from "./services/TorrentService";
import StorageIndicator from "./StorageIndicator";
import FetchStorageData from "./services/FetchStorageData";

class FileManager extends Component {
    constructor(props) {
        super(props);
        this.state = {view: "Home", torrents: [], activeItem: {}, searchResults: [], usedBytes: 0, totalBytes: 0};

        let auth = localStorage.getItem('autolycus-auth');

        if (auth !== 'undefined') {
            this.username = JSON.parse(localStorage.getItem('autolycus-auth')).username;
        } else {
            this.username = 'unknown';
        }

        this.updateView = this.updateView.bind(this);
        this.timer = null;
        this.storageTimer = null;
        this.updateTorrents = this.updateTorrents.bind(this);
        this.tFetcher = this.tFetcher.bind(this);
        this.updateActiveItemHover = this.updateActiveItemHover.bind(this);
        this.updateStorageState = this.updateStorageState.bind(this);
    }

    tFetcher(fetch=null){
        if (fetch){
            this.timer = setInterval(this.updateTorrents, 2000);
        } else {
            clearInterval(this.timer);
        }
    }

    componentDidMount() {
        this.storageTimer = setInterval(this.updateStorageState, 2000);
    }

    componentWillUnmount(){
        clearInterval(this.storageTimer);
    }

    updateStorageState(){
        FetchStorageData().then(json => {
            this.setState(json)
        })
    }

    updateTorrents(){
        let Fetch = FetchTorrents();
        if (Fetch){
            Fetch.then(response => {
                response.json().then(json => {
                    this.setState({torrents: json.torrents})
                })
            })
            .catch(err => {
                console.log("[ERROR] in FetchTorrents:",err);
            })
        }
    }

    updateView(view){
        this.setState({ view: view});
        let elements = document.getElementsByClassName("left-section-menu-items");
        let w = window.innerWidth;
        
        if ( w >= 800){
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.backgroundColor="transparent";
            }
            document.getElementById(view+"NavButton").style.backgroundColor = "rgb(42 154 245 / 10%)";
        }
    }

    updateActiveItemHover(item=null){
        if (item){
            this.setState({activeItem: item});
        }else{
            this.setState({activeItem: {}});
        }
    }

    render(){
        return(
            <div>
                <div className="container-section">
                    <div className="left-section">
                        <div className="left-section-menu">

                            <div className="left-section-logo">
                                <img className="left-section-logo-icon svg-black" width="35px" src="/autolycus/icons/bx-meteor.svg"/>
                                <h3 className="left-section-logo-text">Autolycus</h3>
                            </div>

                            <div className="left-section-menu-items" id="HomeNavButton" onClick={() => this.updateView('Home')}>
                                <img className="left-section-menu-icons svg-black" src="/autolycus/icons/bx-home-alt.svg"/>
                                <p style={{backgroundColor: "none"}} className="left-section-menu-texts">Home</p>
                            </div>

                            <div className="left-section-menu-items" id="SearchTorrentNavButton" onClick={() => this.updateView('SearchTorrent')}>
                                <img className="left-section-menu-icons svg-black" src="/autolycus/icons/bx-search-alt.svg"/>
                                <p className="left-section-menu-texts">Search</p>
                            </div>
                                
                            <div className="left-section-menu-items" id="RecycleBinNavButton" onClick={() => this.updateView('RecycleBin')}>
                                <img className="left-section-menu-icons svg-black" src="/autolycus/icons/bx-trash.svg"/>
                                <p className="left-section-menu-texts">Recycle bin</p>
                            </div>
                        
                            <div className="left-section-menu-items" id="HelpNavButton" onClick={() => this.updateView('Help')}>
                                <img className="left-section-menu-icons svg-black" src="/autolycus/icons/bx-help-circle.svg"/>
                                <p className="left-section-menu-texts">Help</p>
                            </div>

                            <div className="left-section-menu-items" id="SettingsNavButton" onClick={() => this.updateView('Settings')}>
                                <img className="left-section-menu-icons svg-black" src="/autolycus/icons/bx-slider-alt.svg"/>
                                <p className="left-section-menu-texts">Settings</p>
                            </div>

                        </div>
                        <div className="left-section-storage-indicator">
                            <StorageIndicator usedBytes={this.state.usedBytes} totalBytes={this.state.totalBytes}/>
                        </div>
                    </div>

                    <div className="middle-section" id="middle-section">
                        <FileManagerViews username={this.username} updateActiveItemHover={this.updateActiveItemHover} view={this.state.view} torrents={this.state.torrents} tFetcher={this.tFetcher}/>
                    </div>
                        
                    <div className="right-section">
                        <FileManagerInfo activeItem={this.state.activeItem}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default FileManager;