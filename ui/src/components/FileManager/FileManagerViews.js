import React, { Component } from 'react';
import Home from "./components/Home";
import {AuthLogout} from "../../services/LoginService";
import SearchTorrent from "./components/TorrentSearchCard";

function RecycleBin(){
    return(<p>RecycleBin</p>)
}

function Help(){
    return(<p>Help</p>)
}

function Settings(){
    return(
        <div>
            <p>Settings</p>
            <button onClick={AuthLogout}>Logout</button>
        </div>
    )
}

class FileManagerViews extends Component {
    constructor(props){
        super(props);
        this.state = {searchResults: []}
        this.updateSearchResults = this.updateSearchResults.bind(this);
    }

    updateSearchResults(json){
        this.setState({searchResults: json})
    }

    render() {
        if (this.props.view === "Home"){
            return (<Home torrents={this.props.torrents} updateActiveItemHover={this.props.updateActiveItemHover} tFetcher={this.props.tFetcher}/>)
        } else if  (this.props.view === "SearchTorrent"){
            return (<SearchTorrent searchResults={this.state.searchResults} updateSearchResults={this.updateSearchResults}/>)
        } else if (this.props.view === "RecycleBin"){
            return (<RecycleBin/>)
        } else if (this.props.view === "Help"){
            return (<Help/>)
        } else if (this.props.view === "Settings"){
            return (<Settings/>)
        }
    }
}

export default FileManagerViews;